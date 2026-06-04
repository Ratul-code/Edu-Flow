import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getSupabaseServiceRoleConfig } from "@/lib/supabase/config"

export function createAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } =
    getSupabaseServiceRoleConfig()

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
