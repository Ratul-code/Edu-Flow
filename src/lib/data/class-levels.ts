import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export type ClassLevelRecord = {
  id: string
  tenant_id: string
  name: string
  created_at: string
  updated_at: string
}

export const defaultClassLevelNames = [
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
]

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

  return (data as ClassLevelRecord[]).sort(compareClassLevels)
})

export function compareClassLevels(
  left: Pick<ClassLevelRecord, "name">,
  right: Pick<ClassLevelRecord, "name">
) {
  return compareClassLevelNames(left.name, right.name)
}

export function compareClassLevelNames(left: string, right: string) {
  const leftNumber = classLevelNumber(left)
  const rightNumber = classLevelNumber(right)

  if (leftNumber !== null && rightNumber !== null) {
    return leftNumber - rightNumber
  }

  return left.localeCompare(right)
}

function classLevelNumber(value: string) {
  const match = value.match(/\d+/)

  return match ? Number(match[0]) : null
}
