import { unstable_cache } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  compareClassLevelNames,
  defaultClassLevelNames,
} from "@/lib/data/class-levels"
import { defaultMediumNames } from "@/lib/data/medium-options"

export type BatchStatus = "active" | "archived"
export type StudentBatchStatus = "active" | "inactive" | "archived"
export type ClassScheduleStatus = "active" | "cancelled" | "archived"

export type BatchRecord = {
  id: string
  tenant_id: string
  name: string
  subject: string | null
  class_level: string | null
  medium: string | null
  group_name: string | null
  monthly_fee: number | string
  teacher_id: string | null
  status: BatchStatus
  created_at: string
  updated_at: string
  teacher?: {
    id: string
    name: string
  } | null
}

export type StudentBatchRecord = {
  id: string
  tenant_id: string
  student_id: string
  batch_id: string
  custom_fee_override: number | string | null
  fee_override: number | string | null
  discount_amount: number | string
  joined_at: string
  status: StudentBatchStatus
  student?: {
    id: string
    name: string
    phone: string | null
    class_level: string | null
    medium: string | null
    group_name: string | null
    tags?: string[] | null
    status: string
  } | null
}

export type ClassScheduleRecord = {
  id: string
  tenant_id: string
  batch_id: string
  teacher_id: string | null
  subject: string | null
  weekday: number
  start_time: string
  end_time: string
  room_name: string | null
  status: ClassScheduleStatus
  teacher?: {
    id: string
    name: string
  } | null
}

export type BatchListFilters = {
  classLevel?: string
  groupName?: string
  medium?: string
  search?: string
  status?: BatchStatus | "all"
}

export type BatchesRouteData = {
  batches: BatchRecord[]
  classLevels: string[]
  groups: string[]
  mediums: string[]
}

export type BatchesFilterOptions = {
  classLevels: string[]
  groups: string[]
  mediums: string[]
}

export const BATCHES_ROUTE_CACHE_TAG = "batches-route"

const batchSelect = `
  id,
  tenant_id,
  name,
  subject,
  class_level,
  medium,
  group_name,
  monthly_fee,
  teacher_id,
  status,
  created_at,
  updated_at,
  teacher:teachers (
    id,
    name
  )
`

export const getCachedBatchesRouteData = unstable_cache(
  async function getCachedBatchesRouteData(
    tenantId: string,
    filters: BatchListFilters = {}
  ): Promise<BatchesRouteData> {
    const supabase = createAdminClient()
    let batchesQuery = supabase
      .from("batches")
      .select(batchSelect)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(100)

    if (filters.status && filters.status !== "all") {
      batchesQuery = batchesQuery.eq("status", filters.status)
    }

    if (filters.classLevel) {
      batchesQuery = batchesQuery.eq("class_level", filters.classLevel)
    }

    if (filters.medium) {
      batchesQuery = batchesQuery.eq("medium", filters.medium)
    }

    if (filters.groupName) {
      batchesQuery = batchesQuery.eq("group_name", filters.groupName)
    }

    const search = sanitizeSearchTerm(filters.search)

    if (search) {
      batchesQuery = batchesQuery.ilike("name", `%${search}%`)
    }

    const [batchesResult, classLevelsResult, mediumsResult, groupsResult] =
      await Promise.all([
        batchesQuery,
        supabase
          .from("class_levels")
          .select("name")
          .eq("tenant_id", tenantId)
          .order("name", { ascending: true }),
        supabase
          .from("medium_options")
          .select("name")
          .eq("tenant_id", tenantId)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
        supabase
          .from("academic_groups")
          .select("name")
          .eq("tenant_id", tenantId)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
      ])

    return {
      batches:
        batchesResult.error || !batchesResult.data
          ? []
          : (batchesResult.data as unknown as RawBatchRecord[]).map(
              normalizeBatch
            ),
      classLevels: optionValues(classLevelsResult.data, defaultClassLevelNames).sort(
        compareClassLevelNames
      ),
      groups: optionValues(groupsResult.data, ["Science", "Commerce", "Arts"]),
      mediums: optionValues(mediumsResult.data, defaultMediumNames),
    }
  },
  ["batches-route-data"],
  {
    revalidate: 60 * 60,
    tags: [BATCHES_ROUTE_CACHE_TAG],
  }
)

export const getCachedBatchesFilterOptions = unstable_cache(
  async function getCachedBatchesFilterOptions(
    tenantId: string
  ): Promise<BatchesFilterOptions> {
    const supabase = createAdminClient()
    const [classLevelsResult, mediumsResult, groupsResult] = await Promise.all([
      supabase
        .from("class_levels")
        .select("name")
        .eq("tenant_id", tenantId)
        .order("name", { ascending: true }),
      supabase
        .from("medium_options")
        .select("name")
        .eq("tenant_id", tenantId)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("academic_groups")
        .select("name")
        .eq("tenant_id", tenantId)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ])

    return {
      classLevels: optionValues(classLevelsResult.data, defaultClassLevelNames).sort(
        compareClassLevelNames
      ),
      groups: optionValues(groupsResult.data, ["Science", "Commerce", "Arts"]),
      mediums: optionValues(mediumsResult.data, defaultMediumNames),
    }
  },
  ["batches-filter-options"],
  {
    revalidate: 60 * 60,
    tags: [BATCHES_ROUTE_CACHE_TAG],
  }
)

export const getCachedBatchesList = unstable_cache(
  async function getCachedBatchesList(
    tenantId: string,
    filters: BatchListFilters = {}
  ): Promise<BatchRecord[]> {
    const supabase = createAdminClient()
    let query = supabase
      .from("batches")
      .select(batchSelect)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(100)

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    if (filters.classLevel) {
      query = query.eq("class_level", filters.classLevel)
    }

    if (filters.medium) {
      query = query.eq("medium", filters.medium)
    }

    if (filters.groupName) {
      query = query.eq("group_name", filters.groupName)
    }

    const search = sanitizeSearchTerm(filters.search)

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data, error } = await query

    return error || !data
      ? []
      : (data as unknown as RawBatchRecord[]).map(normalizeBatch)
  },
  ["batches-list"],
  {
    revalidate: 60 * 60,
    tags: [BATCHES_ROUTE_CACHE_TAG],
  }
)

export async function listBatches(
  tenantId: string,
  filters: BatchListFilters = {}
) {
  const supabase = await createClient()
  let query = supabase
    .from("batches")
    .select(batchSelect)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }

  if (filters.classLevel) {
    query = query.eq("class_level", filters.classLevel)
  }

  if (filters.medium) {
    query = query.eq("medium", filters.medium)
  }

  if (filters.groupName) {
    query = query.eq("group_name", filters.groupName)
  }

  const search = sanitizeSearchTerm(filters.search)

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return []
  }

  return (data as unknown as RawBatchRecord[]).map(normalizeBatch)
}

export async function getBatchById(tenantId: string, batchId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("batches")
    .select(batchSelect)
    .eq("tenant_id", tenantId)
    .eq("id", batchId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return normalizeBatch(data as unknown as RawBatchRecord)
}

export async function listBatchClassLevels(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("batches")
    .select("class_level")
    .eq("tenant_id", tenantId)
    .not("class_level", "is", null)
    .order("class_level", { ascending: true })

  if (error || !data) {
    return []
  }

  return Array.from(
    new Set(
      data
        .map((row) => row.class_level)
        .filter((value): value is string => Boolean(value?.trim()))
    )
  )
}

export async function listBatchMediums(tenantId: string): Promise<string[]> {
  return listDistinctBatchField(tenantId, "medium")
}

export async function listBatchGroups(tenantId: string): Promise<string[]> {
  return listDistinctBatchField(tenantId, "group_name")
}

export async function listBatchAssignments(tenantId: string, batchId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_batches")
    .select(
      `
        id,
        tenant_id,
        student_id,
        batch_id,
        custom_fee_override,
        fee_override,
        discount_amount,
        joined_at,
        status,
        student:students (
          id,
          name,
          phone,
          class_level,
          medium,
          group_name,
          tags,
          status
        )
      `
    )
    .eq("tenant_id", tenantId)
    .eq("batch_id", batchId)
    .order("joined_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return (data as unknown as RawStudentBatchRecord[]).map((assignment) => ({
    ...assignment,
    student: firstNested(assignment.student),
  }))
}

async function listDistinctBatchField(
  tenantId: string,
  field: "medium" | "group_name"
): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("batches")
    .select(field)
    .eq("tenant_id", tenantId)
    .not(field, "is", null)
    .order(field, { ascending: true })

  if (error || !data) {
    return []
  }

  const rows = data as unknown as Array<Record<typeof field, string | null>>

  return Array.from(
    new Set(
      rows
        .map((row) => row[field])
        .filter((value): value is string => Boolean(value?.trim()))
    )
  )
}

export async function listBatchSchedules(tenantId: string, batchId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("class_schedules")
    .select(
      `
        id,
        tenant_id,
        batch_id,
        teacher_id,
        subject,
        weekday,
        start_time,
        end_time,
        room_name,
        status,
        teacher:teachers (
          id,
          name
        )
      `
    )
    .eq("tenant_id", tenantId)
    .eq("batch_id", batchId)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true })

  if (error || !data) {
    return []
  }

  return (data as unknown as RawClassScheduleRecord[]).map((schedule) => ({
    ...schedule,
    teacher: firstNested(schedule.teacher),
  }))
}

type RawBatchRecord = Omit<BatchRecord, "teacher"> & {
  teacher?: BatchRecord["teacher"] | Array<NonNullable<BatchRecord["teacher"]>>
}

type RawStudentBatchRecord = Omit<StudentBatchRecord, "student"> & {
  student?:
    | StudentBatchRecord["student"]
    | Array<NonNullable<StudentBatchRecord["student"]>>
}

type RawClassScheduleRecord = Omit<ClassScheduleRecord, "teacher"> & {
  teacher?:
    | ClassScheduleRecord["teacher"]
    | Array<NonNullable<ClassScheduleRecord["teacher"]>>
}

function normalizeBatch(batch: RawBatchRecord): BatchRecord {
  return {
    ...batch,
    teacher: firstNested(batch.teacher),
  }
}

function firstNested<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function sanitizeSearchTerm(value?: string) {
  return value?.trim().replace(/[,%()]/g, " ").replace(/\s+/g, " ")
}

function optionValues(rows: unknown, fallback: string[]) {
  if (!Array.isArray(rows)) {
    return fallback
  }

  const values = rows
    .map((row) =>
      typeof row === "object" && row !== null
        ? (row as { name?: unknown }).name
        : null
    )
    .filter(
      (value): value is string =>
        typeof value === "string" && Boolean(value.trim())
    )

  return values.length ? Array.from(new Set(values)) : fallback
}
