import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

export type AcademicGroupRecord = {
  created_at: string
  id: string
  name: string
  sort_order: number
  tenant_id: string
  updated_at: string
}

const defaultGroups = ["Science", "Commerce", "Arts"]

export const listAcademicGroups = cache(async function listAcademicGroups(
  tenantId: string
): Promise<AcademicGroupRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("academic_groups")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    return defaultGroups.map((name, index) => fallbackGroup(tenantId, name, index))
  }

  return (data ?? []) as AcademicGroupRecord[]
})

function fallbackGroup(
  tenantId: string,
  name: string,
  index: number
): AcademicGroupRecord {
  return {
    created_at: "",
    id: `group-${name}`,
    name,
    sort_order: (index + 1) * 10,
    tenant_id: tenantId,
    updated_at: "",
  }
}
