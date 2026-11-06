#!/usr/bin/env node
/**
 * Backup every table's rows from the Supabase project configured in .env.local
 * to a JSON file, via the PostgREST API (service role).
 *
 * This is a safety net before destructive schema changes: it captures row data
 * (not schema DDL), so it can be replayed into a rebuilt schema with
 * scripts/restore-backup.mjs once the Edu Flow tables exist.
 *
 * Usage:
 *   node scripts/backup-project-data.mjs [output-file]
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const env = {}
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (!m) continue
  let value = (m[2] || "").trim()
  if (value.startsWith('"') && value.endsWith('"') && value.length > 1) {
    value = value.slice(1, -1)
  }
  env[m[1]] = value
}

const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY

if (!baseUrl || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
}

// 1. Discover tables from the OpenAPI schema.
const specRes = await fetch(`${baseUrl}/rest/v1/`, { headers })
if (!specRes.ok) {
  console.error(`Could not read schema (HTTP ${specRes.status}).`)
  process.exit(1)
}
const spec = await specRes.json()
const tables = Object.keys(spec.paths || {})
  .filter((p) => p !== "/" && !p.slice(1).includes("/"))
  .map((p) => p.replace(/^\//, ""))

console.log(`Found ${tables.length} tables.`)

// 2. Dump rows for each table.
const backup = {
  savedAt: new Date().toISOString(),
  project: baseUrl,
  tables: {},
}

for (const table of tables) {
  const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, { headers })
  if (!res.ok) {
    backup.tables[table] = { error: `HTTP ${res.status}` }
    continue
  }
  const rows = await res.json()
  backup.tables[table] = Array.isArray(rows) ? rows : []
  console.log(`  ${table.padEnd(38)} ${Array.isArray(rows) ? rows.length : "?"} rows`)
}

// 3. Write the file.
const outFile =
  process.argv[2] ||
  path.join(root, `supabase-backup-${new Date().toISOString().slice(0, 10)}.json`)

fs.writeFileSync(outFile, JSON.stringify(backup, null, 2))
const size = (fs.statSync(outFile).size / 1024).toFixed(1)

console.log(`\nSaved to: ${outFile} (${size} KB)`)
