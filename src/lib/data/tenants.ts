import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

export type TenantProfileRecord = {
  address: string | null
  contact_phone: string | null
  email: string | null
  id: string
  logo_url: string | null
  name: string
  secondary_phone: string | null
  subscription_status: string
}

export const getTenantProfile = cache(async function getTenantProfile(
  tenantId: string
): Promise<TenantProfileRecord | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tenants")
    .select(
      "id, name, address, contact_phone, secondary_phone, email, logo_url, subscription_status"
    )
    .eq("id", tenantId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as TenantProfileRecord
})
