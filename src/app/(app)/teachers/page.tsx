import { Suspense } from "react"

import { PageHeader } from "@/components/app/page-header"
import { TeacherCreateSheet } from "@/components/teachers/teacher-form"
import { TeacherListFilters } from "@/components/teachers/teacher-list-filters"
import { TeachersTable } from "@/components/teachers/teachers-table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { createTeacher } from "@/lib/actions/teachers"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getCachedTeachersFilterOptions,
  getCachedTeachersRouteData,
  type TeacherStatus,
} from "@/lib/data/teachers"
import {
  countTenantRecords,
  countTenantRecordsByStatus,
} from "@/lib/data/tenant-records"
import { createClient } from "@/lib/supabase/server"

type TeachersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TeachersPage({
  searchParams,
}: TeachersPageProps) {
  const admin = await requireAdminContext()
  const params = await searchParams
  const filters = {
    search: stringParam(params.q),
    status: statusParam(params.status),
  }
  const [activeTeachers, totalTeachers] = await Promise.all([
    countTenantRecordsByStatus("teachers", admin.tenantId, "active"),
    countTenantRecords("teachers", admin.tenantId),
  ])

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <PageHeader
          description={`${displayCount(activeTeachers)} active · ${displayCount(totalTeachers)} total`}
          title="Teachers"
        />
        <TeacherCreateSheet action={createTeacher} />
      </div>
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <Suspense fallback={<TeachersContentSkeleton />}>
            <TeachersContent
              filters={filters}
              params={params}
              tenantId={admin.tenantId}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function TeachersContent({
  filters,
  params,
  tenantId,
}: {
  filters: {
    search?: string
    status: TeacherStatus | "all"
  }
  params: Record<string, string | string[] | undefined>
  tenantId: string
}) {
  await getCachedTeachersFilterOptions()

  return (
    <>
      <div className="border-b px-4 py-3">
        <TeacherListFilters filters={filters} />
      </div>
      <Suspense fallback={<TeachersResultsSkeleton />} key={teachersContentKey(params)}>
        <TeachersResults filters={filters} params={params} tenantId={tenantId} />
      </Suspense>
    </>
  )
}

async function TeachersResults({
  filters,
  params,
  tenantId,
}: {
  filters: {
    search?: string
    status: TeacherStatus | "all"
  }
  params: Record<string, string | string[] | undefined>
  tenantId: string
}) {
  const { teachers } = await getCachedTeachersRouteData(tenantId, filters)
  const batchCountsByTeacherId = await countActiveBatchesByTeacherId(tenantId)

  return (
    <>
      {teachers.length ? (
        <TeachersTable
          batchCountsByTeacherId={batchCountsByTeacherId}
          currentPath={pageHref(params)}
          teachers={teachers}
        />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No teachers found</EmptyTitle>
            <EmptyDescription>
              Add a teacher or adjust the search and filters.
            </EmptyDescription>
          </EmptyHeader>
          <TeacherCreateSheet action={createTeacher} />
        </Empty>
      )}
    </>
  )
}

function TeachersContentSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 border-b px-4 py-3 lg:flex-row lg:items-center">
        <Skeleton className="h-8 flex-1 rounded-md" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-8 w-28 rounded-md" key={index} />
          ))}
        </div>
      </div>
      <TeachersResultsSkeleton />
    </div>
  )
}

function TeachersResultsSkeleton() {
  return (
    <div>
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          className="grid grid-cols-[1.5fr_repeat(5,1fr)_3rem] gap-4 border-b p-3 last:border-b-0"
          key={index}
        >
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <Skeleton className="h-5 rounded" key={cellIndex} />
          ))}
        </div>
      ))}
    </div>
  )
}

async function countActiveBatchesByTeacherId(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("batches")
    .select("teacher_id")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .not("teacher_id", "is", null)

  if (error || !data) {
    return {}
  }

  return data.reduce<Record<string, number>>((counts, row) => {
    if (row.teacher_id) {
      counts[row.teacher_id] = (counts[row.teacher_id] ?? 0) + 1
    }
    return counts
  }, {})
}

function displayCount(value: number | null) {
  return (value ?? 0).toLocaleString("en-BD")
}

function pageHref(params: Record<string, string | string[] | undefined>) {
  const nextParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.trim()) {
      nextParams.set(key, value)
    }
  }

  const query = nextParams.toString()

  return query ? `/teachers?${query}` : "/teachers"
}

function teachersContentKey(
  params: Record<string, string | string[] | undefined>
) {
  const keyParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    if (typeof value === "string" && value.trim()) {
      keyParams.set(key, value)
    }
  }

  return keyParams.toString()
}

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function statusParam(
  value: string | string[] | undefined
): TeacherStatus | "all" {
  const status = stringParam(value)

  return status === "active" || status === "archived" ? status : "all"
}
