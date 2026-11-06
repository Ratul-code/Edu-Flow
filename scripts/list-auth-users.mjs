#!/usr/bin/env node
/**
 * Lists Supabase Auth users for the project configured in .env.local.
 * Use the printed id as ADMIN_AUTH_USER_ID for scripts/setup-local-db.mjs.
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

const { createClient } = await import("@supabase/supabase-js")

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 })

if (error) {
  console.error("Failed to list users:", error.message)
  process.exit(1)
}

if (!data.users.length) {
  console.log("No auth users found.")
} else {
  console.log("AUTH_USER_ID                           EMAIL")
  for (const user of data.users) {
    console.log(`${user.id}  ${user.email ?? ""}`)
  }
}
