export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)

export function getSupabasePublicConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    )
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  }
}

export function getSupabaseServiceRoleConfig() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY.")
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
  }
}
