import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export type ClassLevelRecord = {
  id: string
  tenant_id: string
  name: string
  created_at: string
  updated_at: string
}

export const checkClassLevelsTableExists = cache(async function checkClassLevelsTableExists(): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("class_levels")
    .select("id")
    .limit(1)

  if (error) {
    // PGRST205 is PostgREST code for "Could not find table"
    if (error.code === "PGRST205" || error.message?.includes("does not exist")) {
      return false
    }
  }

  return true
})

export const listClassLevels = cache(async function listClassLevels(
  tenantId: string
): Promise<ClassLevelRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("class_levels")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true })

  if (error) {
    return []
  }

  return data as ClassLevelRecord[]
})
