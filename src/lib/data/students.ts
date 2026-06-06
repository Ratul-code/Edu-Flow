import { unstable_cache } from "next/cache"

import type { BatchRecord } from "@/lib/data/batches"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type StudentStatus = "active" | "archived"

export type StudentRecord = {
  id: string
  tenant_id: string
  name: string
  phone: string | null
  guardian_name: string | null
  guardian_phone: string | null
  institution: string | null
  class_level: string | null
  medium: string | null
  group_name: string | null
  tags: string[]
  admission_date: string
  status: StudentStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type StudentListFilters = {
  classLevel?: string
  groupName?: string
  medium?: string
  search?: string
  status?: StudentStatus | "all"
  tag?: string
}

export type StudentPagination = {
  page: number
  pageSize: number
}

export type PaginatedStudents = {
  students: StudentRecord[]
  totalCount: number
}

export type StudentsRouteData = {
  assignedBatchIdsByStudent: Record<string, string[]>
  batches: BatchRecord[]
  classLevels: string[]
  groups: string[]
  mediums: string[]
  studentPage: PaginatedStudents
  tags: string[]
}

export type StudentsFilterOptions = {
  classLevels: string[]
  groups: string[]
  mediums: string[]
  tags: string[]
}

export const STUDENTS_ROUTE_CACHE_TAG = "students-route"

const studentSelect = `
  id,
  tenant_id,
  name,
  phone,
  guardian_name,
  guardian_phone,
  institution,
  class_level,
  medium,
  group_name,
  tags,
  admission_date,
  status,
  notes,
  created_at,
  updated_at
`

export const getCachedStudentsRouteData = unstable_cache(
  async function getCachedStudentsRouteData(
    tenantId: string,
    filters: StudentListFilters,
    pagination: StudentPagination
  ): Promise<StudentsRouteData> {
    const supabase = createAdminClient()
    const from = Math.max(pagination.page - 1, 0) * pagination.pageSize
    const to = from + pagination.pageSize - 1
    let studentsQuery = supabase
      .from("students")
      .select(studentSelect, { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (filters.status && filters.status !== "all") {
      studentsQuery = studentsQuery.eq("status", filters.status)
    }

    if (filters.classLevel) {
      studentsQuery = studentsQuery.eq("class_level", filters.classLevel)
    }

    if (filters.medium) {
      studentsQuery = studentsQuery.eq("medium", filters.medium)
    }

    if (filters.groupName) {
      studentsQuery = studentsQuery.eq("group_name", filters.groupName)
    }

    if (filters.tag) {
      studentsQuery = studentsQuery.contains("tags", [filters.tag])
    }

    const search = sanitizeSearchTerm(filters.search)

    if (search) {
      studentsQuery = studentsQuery.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const [
      studentsResult,
      classLevelsResult,
      mediumsResult,
      groupsResult,
      tagsResult,
      batchesResult,
    ] = await Promise.all([
      studentsQuery,
      supabase
        .from("students")
        .select("class_level")
        .eq("tenant_id", tenantId)
        .not("class_level", "is", null)
        .order("class_level", { ascending: true }),
      supabase
        .from("students")
        .select("medium")
        .eq("tenant_id", tenantId)
        .not("medium", "is", null)
        .order("medium", { ascending: true }),
      supabase
        .from("students")
        .select("group_name")
        .eq("tenant_id", tenantId)
        .not("group_name", "is", null)
        .order("group_name", { ascending: true }),
      supabase.from("students").select("tags").eq("tenant_id", tenantId),
      supabase
        .from("batches")
        .select(
          `
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
            updated_at
          `
        )
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(100),
    ])

    const students =
      studentsResult.error || !studentsResult.data
        ? []
        : (studentsResult.data as StudentRecord[])
    const studentIds = students.map((student) => student.id)
    const assignedBatchIdsByStudent = studentIds.length
      ? await listBatchIdsForStudents(tenantId, studentIds)
      : {}

    return {
      assignedBatchIdsByStudent,
      batches:
        batchesResult.error || !batchesResult.data
          ? []
          : (batchesResult.data as Array<Omit<BatchRecord, "teacher">>).map(
              (batch) => ({
                ...batch,
                teacher: null,
              })
            ),
      classLevels: distinctValues(classLevelsResult.data, "class_level"),
      groups: distinctValues(groupsResult.data, "group_name"),
      mediums: distinctValues(mediumsResult.data, "medium"),
      studentPage: {
        students,
        totalCount: studentsResult.count ?? 0,
      },
      tags: distinctTags(tagsResult.data),
    }
  },
  ["students-route-data"],
  {
    revalidate: 60 * 60,
    tags: [STUDENTS_ROUTE_CACHE_TAG],
  }
)

export const getCachedStudentsFilterOptions = unstable_cache(
  async function getCachedStudentsFilterOptions(
    tenantId: string
  ): Promise<StudentsFilterOptions> {
    const supabase = createAdminClient()
    const [classLevelsResult, mediumsResult, groupsResult, tagsResult] =
      await Promise.all([
        supabase
          .from("students")
          .select("class_level")
          .eq("tenant_id", tenantId)
          .not("class_level", "is", null)
          .order("class_level", { ascending: true }),
        supabase
          .from("students")
          .select("medium")
          .eq("tenant_id", tenantId)
          .not("medium", "is", null)
          .order("medium", { ascending: true }),
        supabase
          .from("students")
          .select("group_name")
          .eq("tenant_id", tenantId)
          .not("group_name", "is", null)
          .order("group_name", { ascending: true }),
        supabase.from("students").select("tags").eq("tenant_id", tenantId),
      ])

    return {
      classLevels: distinctValues(classLevelsResult.data, "class_level"),
      groups: distinctValues(groupsResult.data, "group_name"),
      mediums: distinctValues(mediumsResult.data, "medium"),
      tags: distinctTags(tagsResult.data),
    }
  },
  ["students-filter-options"],
  {
    revalidate: 60 * 60,
    tags: [STUDENTS_ROUTE_CACHE_TAG],
  }
)

export async function listStudents(
  tenantId: string,
  filters: StudentListFilters = {}
) {
  const { students } = await listStudentsPage(tenantId, filters, {
    page: 1,
    pageSize: 100,
  })

  return students
}

export async function listStudentsPage(
  tenantId: string,
  filters: StudentListFilters = {},
  pagination: StudentPagination
): Promise<PaginatedStudents> {
  const supabase = await createClient()
  const from = Math.max(pagination.page - 1, 0) * pagination.pageSize
  const to = from + pagination.pageSize - 1
  let query = supabase
    .from("students")
    .select(studentSelect, { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .range(from, to)

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

  if (filters.tag) {
    query = query.contains("tags", [filters.tag])
  }

  const search = sanitizeSearchTerm(filters.search)

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { count, data, error } = await query

  if (error) {
    return { students: [], totalCount: 0 }
  }

  return {
    students: data as StudentRecord[],
    totalCount: count ?? 0,
  }
}

export async function getStudentById(tenantId: string, studentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("students")
    .select(studentSelect)
    .eq("tenant_id", tenantId)
    .eq("id", studentId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as StudentRecord
}

export async function listStudentClassLevels(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("students")
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

export async function listStudentMediums(tenantId: string): Promise<string[]> {
  return listDistinctStudentField(tenantId, "medium")
}

export async function listStudentGroups(tenantId: string): Promise<string[]> {
  return listDistinctStudentField(tenantId, "group_name")
}

export async function listStudentTags(tenantId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("students")
    .select("tags")
    .eq("tenant_id", tenantId)

  if (error || !data) {
    return []
  }

  const tags = data.flatMap((row) =>
    Array.isArray(row.tags) ? (row.tags as string[]) : []
  )

  return Array.from(new Set(tags.filter(Boolean))).sort((left, right) =>
    left.localeCompare(right)
  )
}

export async function listStudentBatchIds(tenantId: string, studentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_batches")
    .select("batch_id")
    .eq("tenant_id", tenantId)
    .eq("student_id", studentId)
    .eq("status", "active")

  if (error || !data) {
    return []
  }

  return data.map((row) => row.batch_id)
}

async function listBatchIdsForStudents(tenantId: string, studentIds: string[]) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("student_batches")
    .select("student_id, batch_id")
    .eq("tenant_id", tenantId)
    .in("student_id", studentIds)
    .eq("status", "active")

  if (error || !data) {
    return {}
  }

  return data.reduce<Record<string, string[]>>((assigned, row) => {
    assigned[row.student_id] ??= []
    assigned[row.student_id].push(row.batch_id)

    return assigned
  }, {})
}

async function listDistinctStudentField(
  tenantId: string,
  field: "medium" | "group_name"
): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("students")
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

function sanitizeSearchTerm(value?: string) {
  return value?.trim().replace(/[,%()]/g, " ").replace(/\s+/g, " ")
}

function distinctValues<T extends string>(
  rows: unknown,
  field: T
): string[] {
  if (!Array.isArray(rows)) {
    return []
  }

  return Array.from(
    new Set(
      rows
        .map((row) =>
          typeof row === "object" && row !== null
            ? (row as Record<T, unknown>)[field]
            : null
        )
        .filter((value): value is string => Boolean(value && typeof value === "string" && value.trim()))
    )
  )
}

function distinctTags(rows: unknown): string[] {
  if (!Array.isArray(rows)) {
    return []
  }

  return Array.from(
    new Set(
      rows.flatMap((row) => {
        if (typeof row !== "object" || row === null) {
          return []
        }

        const value = (row as { tags?: unknown }).tags

        return Array.isArray(value) ? value.filter(isString) : []
      })
    )
  ).sort((left, right) => left.localeCompare(right))
}

function isString(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim())
}
