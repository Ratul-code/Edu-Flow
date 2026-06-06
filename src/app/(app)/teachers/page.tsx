import { Suspense } from "react"

import { PageHeader } from "@/components/app/page-header"
import { TeacherCreateSheet } from "@/components/teachers/teacher-form"
import { TeacherListFilters } from "@/components/teachers/teacher-list-filters"
import { TeachersTable } from "@/components/teachers/teachers-table"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Create, search, edit, and archive tenant-isolated teacher records."
        title="Teachers"
      />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle>Teacher list</CardTitle>
            <CardDescription>
              Showing records for {admin.tenantName}. Default salaries are saved
              for the salary ledger.
            </CardDescription>
          </div>
          <CardAction>
            <TeacherCreateSheet action={createTeacher} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
      <TeacherListFilters filters={filters} />
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

  return (
    <>
      {teachers.length ? (
        <TeachersTable currentPath={pageHref(params)} teachers={teachers} />
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-10 w-28 rounded-lg" key={index} />
          ))}
        </div>
      </div>
      <TeachersResultsSkeleton />
    </div>
  )
}

function TeachersResultsSkeleton() {
  return (
    <div className="rounded-lg border">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          className="grid grid-cols-[3rem_1.5fr_repeat(4,1fr)] gap-4 border-b p-3 last:border-b-0"
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
