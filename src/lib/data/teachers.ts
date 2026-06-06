import { unstable_cache } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type TeacherStatus = "active" | "archived"

export type TeacherRecord = {
  id: string
  tenant_id: string
  name: string
  phone: string | null
  subject_specialty: string | null
  default_monthly_salary: number | string
  status: TeacherStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type TeacherListFilters = {
  search?: string
  status?: TeacherStatus | "all"
}

export type TeachersRouteData = {
  teachers: TeacherRecord[]
}

export type TeachersFilterOptions = {
  statuses: Array<TeacherStatus | "all">
}

export const TEACHERS_ROUTE_CACHE_TAG = "teachers-route"

const teacherSelect = `
  id,
  tenant_id,
  name,
  phone,
  subject_specialty,
  default_monthly_salary,
  status,
  notes,
  created_at,
  updated_at
`

export const getCachedTeachersRouteData = unstable_cache(
  async function getCachedTeachersRouteData(
    tenantId: string,
    filters: TeacherListFilters = {}
  ): Promise<TeachersRouteData> {
    const supabase = createAdminClient()
    let query = supabase
      .from("teachers")
      .select(teacherSelect)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(100)

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    const search = sanitizeSearchTerm(filters.search)

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data, error } = await query

    return {
      teachers: error || !data ? [] : (data as TeacherRecord[]),
    }
  },
  ["teachers-route-data"],
  {
    revalidate: 60 * 60,
    tags: [TEACHERS_ROUTE_CACHE_TAG],
  }
)

export const getCachedTeachersFilterOptions = unstable_cache(
  async function getCachedTeachersFilterOptions(): Promise<TeachersFilterOptions> {
    return {
      statuses: ["all", "active", "archived"],
    }
  },
  ["teachers-filter-options"],
  {
    revalidate: 60 * 60,
    tags: [TEACHERS_ROUTE_CACHE_TAG],
  }
)

export async function listTeachers(
  tenantId: string,
  filters: TeacherListFilters = {}
) {
  const supabase = await createClient()
  let query = supabase
    .from("teachers")
    .select(teacherSelect)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }

  const search = sanitizeSearchTerm(filters.search)

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return []
  }

  return data as TeacherRecord[]
}

export async function getTeacherById(tenantId: string, teacherId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teachers")
    .select(teacherSelect)
    .eq("tenant_id", tenantId)
    .eq("id", teacherId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as TeacherRecord
}

function sanitizeSearchTerm(value?: string) {
  return value?.trim().replace(/[,%()]/g, " ").replace(/\s+/g, " ")
}
