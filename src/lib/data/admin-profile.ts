import { createClient } from "@/lib/supabase/server"

export type AdminProfileRecord = {
  email: string
  name: string
  phone: string | null
}

export async function getAdminProfile(
  tenantId: string,
  authUserId: string
): Promise<AdminProfileRecord | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_users")
    .select("name, phone")
    .eq("tenant_id", tenantId)
    .eq("auth_user_id", authUserId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return {
    email: user?.email ?? "admin@eduflow.local",
    name: data.name,
    phone: data.phone,
  }
}
