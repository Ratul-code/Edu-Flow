import { createClient } from "@/lib/supabase/server"

export type StudentStatus = "active" | "archived"

export type StudentRecord = {
  id: string
  tenant_id: string
  name: string
  phone: string | null
  guardian_name: string | null
  guardian_phone: string | null
  school: string | null
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

const studentSelect = `
  id,
  tenant_id,
  name,
  phone,
  guardian_name,
  guardian_phone,
  school,
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
