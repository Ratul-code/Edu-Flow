import { createClient } from "@/lib/supabase/server"

export type TenantTableName =
  | "students"
  | "teachers"
  | "batches"
  | "student_batches"
  | "class_schedules"

export async function countTenantRecords(
  tableName: TenantTableName,
  tenantId: string
) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from(tableName)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)

  if (error) {
    return null
  }

  return count ?? 0
}

export async function countTenantRecordsByStatus(
  tableName: TenantTableName,
  tenantId: string,
  status: string
) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from(tableName)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", status)

  if (error) {
    return null
  }

  return count ?? 0
}

export async function countTenantRecordsCreatedSince(
  tableName: TenantTableName,
  tenantId: string,
  since: string
) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from(tableName)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gte("created_at", since)

  if (error) {
    return null
  }

  return count ?? 0
}

export async function listTenantPreviewRecords(
  tableName: TenantTableName,
  tenantId: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(8)

  if (error) {
    return []
  }

  return data as Array<Record<string, unknown>>
}
