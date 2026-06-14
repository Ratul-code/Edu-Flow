import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

export type MediumOptionRecord = {
  created_at: string
  id: string
  name: string
  sort_order: number
  tenant_id: string
  updated_at: string
}

export const defaultMediumNames = [
  "Bangla Medium",
  "English Version",
  "English Medium",
]

export const checkMediumOptionsTableExists = cache(async function checkMediumOptionsTableExists(): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("medium_options")
    .select("id")
    .limit(1)

  if (error) {
    if (error.code === "PGRST205" || error.message?.includes("does not exist")) {
      return false
    }
  }

  return true
})

export const listMediumOptions = cache(async function listMediumOptions(
  tenantId: string
): Promise<MediumOptionRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("medium_options")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error || !data?.length) {
    return defaultMediumNames.map((name, index) =>
      fallbackMedium(tenantId, name, index)
    )
  }

  return data as MediumOptionRecord[]
})

export function defaultMediumOptions(tenantId: string) {
  return defaultMediumNames.map((name, index) =>
    fallbackMedium(tenantId, name, index)
  )
}

function fallbackMedium(
  tenantId: string,
  name: string,
  index: number
): MediumOptionRecord {
  return {
    created_at: "",
    id: `medium-${name}`,
    name,
    sort_order: (index + 1) * 10,
    tenant_id: tenantId,
    updated_at: "",
  }
}
