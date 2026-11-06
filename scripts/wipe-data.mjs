#!/usr/bin/env node
/**
 * Deletes every row from every table in the project configured in .env.local,
 * while leaving the schema (tables, columns, RLS policies, indexes) intact.
 *
 * Uses the Supabase service role key via the PostgREST API, so no personal
 * access token is needed. Rows are deleted in foreign-key dependency order:
 * if a table still has referencing rows, it is retried after the tables that
 * reference it have been cleared.
 *
 * Usage:
 *   node scripts/wipe-data.mjs            # wipe
 *   node scripts/wipe-data.mjs --dry-run  # show what would be deleted
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {}
  const out = {}
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (!m) continue
    let value = (m[2] || "").trim()
    if (value.startsWith('"') && value.endsWith('"') && value.length > 1) {
      value = value.slice(1, -1)
    }
    out[m[1]] = value
  }
  return out
}

const fileEnv = loadEnvFile(path.join(root, ".env.local"))

const baseUrl = fileEnv.NEXT_PUBLIC_SUPABASE_URL
const key = fileEnv.SUPABASE_SERVICE_ROLE_KEY
const dryRun = process.argv.includes("--dry-run")

if (!baseUrl || !key) {
  console.error(
    "\nMissing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local\n"
  )
  process.exit(1)
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
}

// --- discover tables ---------------------------------------------------------
const specRes = await fetch(`${baseUrl}/rest/v1/`, { headers })
if (!specRes.ok) {
  console.error(`Could not read schema (HTTP ${specRes.status}).`)
  process.exit(1)
}
const spec = await specRes.json()
const tables = Object.keys(spec.paths || {})
  .filter((p) => p !== "/" && !p.slice(1).includes("/"))
  .map((p) => p.replace(/^\//, ""))

console.log(`Project: ${baseUrl}`)
console.log(`Tables: ${tables.length}\n`)

// --- count rows --------------------------------------------------------------
async function countRows(table) {
  const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, {
    headers: { ...headers, Prefer: "count=exact", Range: "0-0" },
  })
  const range = res.headers.get("content-range") || ""
  if (!range.includes("/")) return 0
  return Number(range.split("/")[1]) || 0
}

const counts = new Map()
for (const table of tables) {
  counts.set(table, await countRows(table))
}

let totalRows = 0
for (const table of tables) {
  const n = counts.get(table)
  totalRows += n
  if (n > 0) console.log(`  ${table.padEnd(38)} ${n}`)
}
console.log(`\nTotal rows: ${totalRows}`)

if (dryRun) {
  console.log("\n--dry-run: nothing was deleted.")
  process.exit(0)
}

if (totalRows === 0) {
  console.log("\nDatabase is already empty.")
  process.exit(0)
}

// --- back up first -----------------------------------------------------------
const backupFile = path.join(
  root,
  `supabase-backup-${new Date().toISOString().slice(0, 10)}.json`
)

console.log(`\nBacking up to ${backupFile} ...`)
try {
  await runBackup(backupFile)
  console.log("  backup written.")
} catch (error) {
  console.error(`\nBackup failed, refusing to wipe: ${error.message}\n`)
  process.exit(1)
}

// --- wipe --------------------------------------------------------------------
// PostgREST requires a WHERE clause on DELETE. Most tables have an `id`, but
// some (join tables, lookup tables) do not, so build the filter from the
// table's first column instead.
function filterFor(table) {
  const cols = Object.keys(spec.definitions?.[table]?.properties || {})
  const key = cols.includes("id") ? "id" : cols[0]
  if (!key) return null
  return `${key}=not.is.null`
}

async function deleteAll(table) {
  const filter = filterFor(table)
  if (!filter) {
    throw new Error(`Could not determine a column to filter on for ${table}.`)
  }

  const res = await fetch(`${baseUrl}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=minimal" },
  })
  if (res.ok) return true
  const body = await res.text()
  // 23503 = foreign key violation: another table still references this one.
  if (res.status === 409 && body.includes("23503")) return false
  throw new Error(`DELETE ${table} failed (${res.status}): ${body.slice(0, 300)}`)
}

// Repeat until stable: each pass clears whatever is no longer referenced.
const pending = tables.filter((t) => (counts.get(t) ?? 0) > 0)
let remaining = [...pending]
let pass = 0

while (remaining.length && pass < 10) {
  pass += 1
  const deferred = []

  for (const table of remaining) {
    const ok = await deleteAll(table)
    if (!ok) {
      deferred.push(table)
      continue
    }
    console.log(`  cleared ${table}`)
  }

  if (deferred.length === remaining.length) {
    // No progress this pass: something is blocking, likely a cycle.
    console.error(
      `\nCould not clear these tables (foreign key cycle or restricted table):\n` +
        deferred.map((t) => `  - ${t}`).join("\n")
    )
    process.exit(1)
  }

  remaining = deferred
}

if (remaining.length) {
  console.error(`\nStill not empty: ${remaining.join(", ")}`)
  process.exit(1)
}

console.log(`\nCleased ${pending.length} tables in ${pass} passes.`)

// --- verify ------------------------------------------------------------------
console.log("\nVerifying...")
let left = 0
for (const table of tables) {
  const n = await countRows(table)
  if (n > 0) {
    console.log(`  ${table}: ${n}`)
    left += n
  }
}

console.log(
  left === 0
    ? "\nDone. All tables exist and every table is empty."
    : `\nDone with ${left} rows remaining.`
)
console.log(`  backup: ${backupFile}\n`)

// --- backup helper -----------------------------------------------------------
async function runBackup(outFile) {
  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(baseUrl, key)

  const backup = {
    savedAt: new Date().toISOString(),
    project: baseUrl,
    tables: {},
  }

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*")
    backup.tables[table] = error ? { error: error.message } : (data ?? [])
  }

  fs.writeFileSync(outFile, JSON.stringify(backup, null, 2))
  return backup
}
