#!/usr/bin/env node
/**
 * Edu Flow - local database bootstrap.
 *
 * Applies every migration in supabase/migrations in order, then seeds a tenant
 * and links the Supabase Auth user to it via admin_users.
 *
 * Requires:
 *   - SUPABASE_ACCESS_TOKEN   (personal access token, from supabase.com/dashboard/account/tokens)
 *   - SUPABASE_PROJECT_REF    (the project ref, e.g. abcdefghijklmnopqrst)
 *   - .env.local             (for NEXT_PUBLIC_SUPABASE_URL / service role key)
 *   - ADMIN_AUTH_USER_ID     (the auth.users id to link as the admin)
 *
 * Usage:
 *   node scripts/setup-local-db.mjs
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

// --- load .env.local --------------------------------------------------------
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {}
  const out = {}
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (!m) continue
    let value = (m[2] || "").trim()
    if (
      value.startsWith('"') && value.endsWith('"') &&
      value.length > 1
    ) {
      value = value.slice(1, -1)
    }
    out[m[1]] = value
  }
  return out
}

const fileEnv = loadEnvFile(path.join(root, ".env.local"))
const env = { ...fileEnv, ...process.env }

// The access token can come from the environment, a token file, or be typed in.
function readAccessToken() {
  if (env.SUPABASE_ACCESS_TOKEN) return env.SUPABASE_ACCESS_TOKEN

  const tokenFile =
    env.SUPABASE_ACCESS_TOKEN_FILE || path.join(root, ".supabase-token")
  if (fs.existsSync(tokenFile)) {
    const value = fs.readFileSync(tokenFile, "utf8").trim()
    if (value) return value
  }

  return undefined
}

async function promptForAccessToken() {
  if (!process.stdin.isTTY) return undefined

  const readline = await import("node:readline/promises")
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  console.log(
    "\nA Supabase personal access token is required to run migrations.\n" +
      "Create one at https://supabase.com/dashboard/account/tokens\n"
  )
  const value = await rl.question("Paste the token (sbp_...): ")
  rl.close()
  const token = value.trim()
  return token || undefined
}

const projectRef =
  env.SUPABASE_PROJECT_REF || parseRef(fileEnv.NEXT_PUBLIC_SUPABASE_URL)
const authUserId = env.ADMIN_AUTH_USER_ID
const adminEmail = env.ADMIN_EMAIL || "admin@eduflow.local"
const adminName = env.ADMIN_NAME || "Demo Admin"
const tenantName = env.TENANT_NAME || "Demo Coaching Center"

function parseRef(url) {
  if (!url) return undefined
  const m = url.match(/https:\/\/([a-z0-9]+)\.supabase\./)
  return m?.[1]
}

if (!projectRef) {
  console.error(
    "\nMissing project ref. Set SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL.\n"
  )
  process.exit(1)
}
if (!authUserId) {
  console.error(
    "\nMissing ADMIN_AUTH_USER_ID (the auth.users id to link as admin).\n" +
      "Find it with: node scripts/list-auth-users.mjs\n"
  )
  process.exit(1)
}

let accessToken = readAccessToken()
if (!accessToken) {
  accessToken = await promptForAccessToken()
}
if (!accessToken) {
  console.error(
    "\nMissing SUPABASE_ACCESS_TOKEN.\n" +
      "Create one at https://supabase.com/dashboard/account/tokens and either:\n" +
      "  export SUPABASE_ACCESS_TOKEN=sbp_xxx\n" +
      "  ...or save it to .supabase-token in the repo root.\n"
  )
  process.exit(1)
}

// --- management api ---------------------------------------------------------
const api = "https://api.supabase.com/v1"

async function sql(query) {
  const res = await fetch(`${api}/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`SQL failed (${res.status}): ${text.slice(0, 800)}`)
  }
  return text
}

function quote(value) {
  return value.replace(/'/g, "''")
}

// --- backup helper -----------------------------------------------------------
// Dumps every table's rows via the PostgREST API (service role) so a schema
// reset stays recoverable. Kept local so the reset path can call it directly.
async function runBackup(outFile) {
  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(
    fileEnv.NEXT_PUBLIC_SUPABASE_URL,
    fileEnv.SUPABASE_SERVICE_ROLE_KEY
  )

  const specRes = await fetch(`${fileEnv.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: fileEnv.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${fileEnv.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })
  if (!specRes.ok) {
    throw new Error(`Could not read schema (HTTP ${specRes.status})`)
  }
  const spec = await specRes.json()
  const tables = Object.keys(spec.paths || {})
    .filter((p) => p !== "/" && !p.slice(1).includes("/"))
    .map((p) => p.replace(/^\//, ""))

  const backup = {
    savedAt: new Date().toISOString(),
    project: fileEnv.NEXT_PUBLIC_SUPABASE_URL,
    tables: {},
  }

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*")
    backup.tables[table] = error ? { error: error.message } : (data ?? [])
  }

  fs.writeFileSync(outFile, JSON.stringify(backup, null, 2))
  return backup
}

// --- preflight: detect incompatible pre-existing tables ----------------------
// The migrations use `create table if not exists` and never drop tables. If the
// project already has a table with the same name but a different shape (e.g. a
// `workspace_id` schema instead of `tenant_id`), the migration silently skips
// creating it and then fails on the later `alter table` statements.
// Detect that here so the failure is clear instead of a confusing SQL error.
const COLLIDING = [
  "students",
  "teachers",
  "batches",
  "sms_templates",
  "sms_wallets",
  "student_payments",
]

// Tables that must not already exist with a different shape. The shared
// Supabase project this app was developed against also hosts another
// product's `plans` / `subscriptions` tables, and Edu Flow's own plan tables
// use distinct names for exactly that reason. If either name is taken by a
// different schema, the migration would silently skip creating it and then
// fail on a later statement -- catch that here instead.
//
// `plan_definitions` is a global catalog table with no `tenant_id` column, so
// it is identified by its `code` column instead.
const RESERVED_NAMES = [
  { name: "plan_definitions", marker: "code" },
  { name: "tenant_subscriptions", marker: "tenant_id" },
]

async function findReservedNameConflicts() {
  const conflicts = []

  for (const { name, marker } of RESERVED_NAMES) {
    const exists = await sql(`
      select 1
      from information_schema.tables
      where table_schema = 'public' and table_name = '${name}';
    `)

    if (!exists.includes("1")) {
      continue
    }

    const hasMarker = await sql(`
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = '${name}'
        and column_name = '${marker}';
    `)

    if (!hasMarker.includes("1")) {
      conflicts.push(name)
    }
  }

  return conflicts
}

async function findCollisions() {
  const found = []
  for (const table of COLLIDING) {
    const out = await sql(`
      select column_name
      from information_schema.columns
      where table_schema = 'public' and table_name = '${table}'
        and column_name in ('tenant_id', 'workspace_id');
    `)
    const hasTenant = /\btenant_id\b/.test(out)
    const hasWorkspace = /\bworkspace_id\b/.test(out)
    if (hasWorkspace && !hasTenant) {
      found.push(table)
    }
  }
  return found
}

let collisions = []
let nameConflicts = []
try {
  collisions = await findCollisions()
  nameConflicts = await findReservedNameConflicts()
} catch (error) {
  console.error(`\nPreflight check failed: ${error.message}\n`)
  process.exit(1)
}

if (nameConflicts.length) {
  console.error(
    "\n" +
      "=".repeat(72) +
      "\nTABLE NAME CONFLICT DETECTED\n" +
      "=".repeat(72) +
      `\n\n` +
      `These table names are already used by a different schema in this\n` +
      `project:\n\n` +
      nameConflicts.map((t) => `  - ${t}`).join("\n") +
      `\n\n` +
      `Edu Flow's migrations use 'create table if not exists' and never drop\n` +
      `tables, so they would silently skip these and the subscription layer\n` +
      `would break.\n\n` +
      `Use a fresh Supabase project for Edu Flow, or run this script with\n` +
      `--reset-schema to rebuild the public schema from the migrations.\n\n`
  )
  process.exit(1)
}

if (collisions.length) {
  const wantsReset = process.argv.includes("--reset-schema")

  if (!wantsReset) {
    console.error(
      "\n" +
        "=".repeat(72) +
        "\n" +
        "SCHEMA CONFLICT DETECTED\n" +
        "=".repeat(72) +
        `\n\n` +
        `These tables already exist in this project with a 'workspace_id' column\n` +
        `(a different product's schema) instead of Edu Flow's 'tenant_id':\n\n` +
        collisions.map((t) => `  - ${t}`).join("\n") +
        `\n\n` +
        `Edu Flow's migrations use 'create table if not exists' and never drop\n` +
        `tables, so they would silently skip these and then fail on the later\n` +
        `alter table statements.\n\n` +
        `Pick one:\n\n` +
        `  A) Use a fresh Supabase project for Edu Flow (recommended).\n` +
        `     Create a blank project, put its URL/keys in .env.local, then re-run\n` +
        `     this script against it. The current project stays untouched.\n\n` +
        `  B) Reset this project and rebuild the schema from the migrations.\n` +
        `     Run this script with --reset-schema. A JSON backup of all existing\n` +
        `     rows is written to the repo root first, but this still drops every\n` +
        `     table in the public schema.\n\n` +
        `Nothing has been changed. Resolve this and re-run.\n`
    )
    process.exit(1)
  }
}

// Option B: reset the schema and rebuild it from the migrations.
// Requires an explicit opt-in flag because this destroys all project data.
if (process.argv.includes("--reset-schema")) {
  console.log(
    "\n--reset-schema requested: backing up data, then rebuilding the schema.\n"
  )

  // Back up existing rows first so the reset is recoverable.
  const backupFile = path.join(
    root,
    `supabase-backup-${new Date().toISOString().slice(0, 10)}.json`
  )
  try {
    await runBackup(backupFile)
    console.log(`  backup written to ${backupFile}`)
  } catch (error) {
    console.error(`\nBackup failed, refusing to reset: ${error.message}\n`)
    process.exit(1)
  }

  // Drop and recreate the public schema.
  //
  // Extensions are installed into the `extensions` schema on Supabase, and a
  // `drop schema public cascade` can remove that schema too, so recreate it
  // first and re-install the extensions the migrations rely on.
  await sql(`
    create schema if not exists extensions;

    drop schema if exists public cascade;
    create schema public;

    grant usage on schema public to postgres, anon, authenticated, service_role;
    alter schema public owner to postgres;
    grant all on schema public to postgres, anon, authenticated, service_role;

    alter default privileges in schema public
      grant all on tables to postgres, anon, authenticated, service_role;
    alter default privileges in schema public
      grant all on sequences to postgres, anon, authenticated, service_role;
    alter default privileges in schema public
      grant all on functions to postgres, anon, authenticated, service_role;

    create extension if not exists pgcrypto with schema extensions;
    create extension if not exists "uuid-ossp" with schema extensions;
  `)
  console.log("  public schema reset.")
}

// --- migrations -------------------------------------------------------------
const migrationsDir = path.join(root, "supabase", "migrations")
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort()

console.log(`Applying ${files.length} migrations to project ${projectRef}...\n`)

for (const file of files) {
  const statements = fs.readFileSync(path.join(migrationsDir, file), "utf8")
  process.stdout.write(`  ${file} ... `)
  try {
    await sql(statements)
    console.log("ok")
  } catch (error) {
    console.log("FAILED")
    console.error(`\n${error.message}\n`)
    console.error(`Stopped at ${file}. Fix the error and re-run (safe to retry).`)
    process.exit(1)
  }
}

// --- seed tenant + admin link ----------------------------------------------
console.log("\nSeeding tenant and admin link...")

await sql(`
  insert into public.tenants (name, address, contact_phone, email)
  values (
    '${quote(tenantName)}',
    'Address not configured',
    'Phone not configured',
    'not-configured@eduflow.local'
  )
  on conflict do nothing;
`)

await sql(`
  insert into public.admin_users (tenant_id, auth_user_id, name, role, status)
  select t.id, '${authUserId}'::uuid, '${quote(adminName)}', 'admin', 'active'
  from public.tenants t
  where not exists (
    select 1 from public.admin_users a where a.auth_user_id = '${authUserId}'::uuid
  )
  limit 1;
`)

// Per-tenant option rows.
//
// The migrations seed billing_settings / class_levels / academic_groups /
// medium_options with a one-time backfill over whatever tenants existed at
// migration time. A tenant created afterwards gets none of them, so seed them
// here for every tenant that is missing them.
//
// The billing values match the column defaults set by migration 0009
// (payment_start_day 1, grace_period_days 7). Earlier migrations used 25/10,
// which the 1-15 check constraints now reject.
await sql(`
  insert into public.billing_settings (tenant_id, payment_start_day, grace_period_days)
  select t.id, 1, 7 from public.tenants t
  where not exists (select 1 from public.billing_settings b where b.tenant_id = t.id)
  on conflict (tenant_id) do nothing;

  insert into public.class_levels (tenant_id, name)
  select t.id, d.name from public.tenants t
  cross join (values
    ('Class 4'),('Class 5'),('Class 6'),('Class 7'),('Class 8'),
    ('Class 9'),('Class 10'),('Class 11'),('Class 12')
  ) as d(name)
  on conflict (tenant_id, name) do nothing;

  insert into public.academic_groups (tenant_id, name)
  select t.id, d.name from public.tenants t
  cross join (values ('Science'),('Commerce'),('Arts')) as d(name)
  on conflict (tenant_id, name) do nothing;

  insert into public.medium_options (tenant_id, name, sort_order)
  select t.id, d.name, d.sort_order from public.tenants t
  cross join (values
    ('Bangla Medium',1),('English Version',2),('English Medium',3)
  ) as d(name, sort_order)
  on conflict (tenant_id, name) do nothing;
`)

// Plan catalog.
//
// The plan rows are seeded by migration 0019, but a tenant that predates the
// subscription layer has no subscription row. Attach every tenant that is
// missing one to the default (Free) plan so the billing screen and the plan
// limit checks have something to read.
//
// `on conflict do nothing` relies on the partial unique index
// `tenant_subscriptions_active_idx`, which allows only one non-terminal
// subscription per tenant.
await sql(`
  insert into public.tenant_subscriptions (
    tenant_id, plan_id, status, current_period_start, current_period_end
  )
  select
    t.id,
    p.id,
    'active',
    current_date,
    (current_date + interval '1 month')::date
  from public.tenants t
  cross join public.plan_definitions p
  where p.is_default = true
    and not exists (
      select 1
      from public.tenant_subscriptions ts
      where ts.tenant_id = t.id
        and ts.status in ('trialing', 'pending_payment', 'active', 'past_due')
    )
  on conflict do nothing;
`)

// --- verify -----------------------------------------------------------------
const verify = await sql(`
  select
    (select count(*) from public.tenants) as tenants,
    (select count(*) from public.admin_users where auth_user_id = '${authUserId}'::uuid) as admins,
    (select count(*) from public.plan_definitions) as plans,
    (select count(*) from public.tenant_subscriptions) as subscriptions;
`)

console.log("\nDone.")
console.log(`  verify: ${verify.trim().slice(0, 200)}`)
console.log(`\n  Login email: ${adminEmail}`)
console.log(`  Login password: (the one you set when creating the auth user)\n`)
