import { Suspense } from "react"

import { PageHeader } from "@/components/app/page-header"
import { StudentCreateSheet } from "@/components/students/student-form"
import { StudentListFilters } from "@/components/students/student-list-filters"
import { StudentsTable } from "@/components/students/students-table"
import { Button } from "@/components/ui/button"
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
import { createStudent } from "@/lib/actions/students"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getCachedStudentsFilterOptions,
  getCachedStudentsRouteData,
  type StudentStatus,
} from "@/lib/data/students"
import Link from "next/link"
import { redirect } from "next/navigation"

const studentsPerPage = 10

type StudentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function StudentsPage({
  searchParams,
}: StudentsPageProps) {
  const admin = await requireAdminContext()
  const params = await searchParams
  const page = pageParam(params.page)
  const filters = {
    classLevel: stringParam(params.classLevel),
    groupName: stringParam(params.groupName),
    medium: stringParam(params.medium),
    search: stringParam(params.q),
    status: statusParam(params.status),
    tag: stringParam(params.tag),
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Create, search, edit, and archive tenant-isolated student records."
        title="Students"
      />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle>Student list</CardTitle>
            <CardDescription>
              Showing records for {admin.tenantName}. Search checks name and
              phone.
            </CardDescription>
          </div>
          <CardAction>
            <Suspense fallback={<Button disabled>New student</Button>}>
              <StudentCreateAction tenantId={admin.tenantId} />
            </Suspense>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Suspense fallback={<StudentsContentSkeleton />}>
            <StudentsContent
              filters={filters}
              page={page}
              params={params}
              tenantId={admin.tenantId}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function StudentCreateAction({ tenantId }: { tenantId: string }) {
  const { batches } = await getCachedStudentsRouteData(
    tenantId,
    { status: "all" },
    { page: 1, pageSize: studentsPerPage }
  )

  return <StudentCreateSheet action={createStudent} batches={batches} />
}

async function StudentsContent({
  filters,
  page,
  params,
  tenantId,
}: {
  filters: {
    classLevel?: string
    groupName?: string
    medium?: string
    search?: string
    status: StudentStatus | "all"
    tag?: string
  }
  page: number
  params: Record<string, string | string[] | undefined>
  tenantId: string
}) {
  const { classLevels, groups, mediums, tags } =
    await getCachedStudentsFilterOptions(tenantId)

  return (
    <>
      <StudentListFilters
        classLevels={classLevels}
        filters={filters}
        groups={groups}
        mediums={mediums}
        tags={tags}
      />
      <Suspense fallback={<StudentsResultsSkeleton />} key={studentsContentKey(params)}>
        <StudentsResults
          filters={filters}
          page={page}
          params={params}
          tenantId={tenantId}
        />
      </Suspense>
    </>
  )
}

async function StudentsResults({
  filters,
  page,
  params,
  tenantId,
}: {
  filters: {
    classLevel?: string
    groupName?: string
    medium?: string
    search?: string
    status: StudentStatus | "all"
    tag?: string
  }
  page: number
  params: Record<string, string | string[] | undefined>
  tenantId: string
}) {
  const { assignedBatchIdsByStudent, batches, studentPage } =
    await getCachedStudentsRouteData(tenantId, filters, {
      page,
      pageSize: studentsPerPage,
    })
  const { students, totalCount } = studentPage
  const totalPages = Math.max(Math.ceil(totalCount / studentsPerPage), 1)

  if (page > totalPages && totalCount > 0) {
    redirect(pageHref(params, totalPages))
  }

  return (
    <>
      {students.length ? (
        <>
          <StudentsTable
            assignedBatchIdsByStudent={assignedBatchIdsByStudent}
            batches={batches}
            currentPath={pageHref(params, page)}
            students={students}
          />
          <StudentsPagination
            currentPage={page}
            pageSize={studentsPerPage}
            params={params}
            totalCount={totalCount}
            totalPages={totalPages}
          />
        </>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No students found</EmptyTitle>
            <EmptyDescription>
              Add a student or adjust the search and filters.
            </EmptyDescription>
          </EmptyHeader>
          <StudentCreateSheet action={createStudent} batches={batches} />
        </Empty>
      )}
    </>
  )
}

function StudentsContentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-10 w-28 rounded-xl" key={index} />
          ))}
        </div>
      </div>
      <StudentsResultsSkeleton />
    </div>
  )
}

function StudentsResultsSkeleton() {
  return (
    <div className="rounded-lg border">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          className="grid grid-cols-[3rem_1.5fr_repeat(5,1fr)] gap-4 border-b p-3 last:border-b-0"
          key={index}
        >
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <Skeleton className="h-5 rounded" key={cellIndex} />
          ))}
        </div>
      ))}
    </div>
  )
}

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function statusParam(
  value: string | string[] | undefined
): StudentStatus | "all" {
  const status = stringParam(value)

  return status === "active" || status === "archived" ? status : "all"
}

function pageParam(value: string | string[] | undefined) {
  const page = Number(stringParam(value) ?? 1)

  return Number.isInteger(page) && page > 0 ? page : 1
}

function StudentsPagination({
  currentPage,
  pageSize,
  params,
  totalCount,
  totalPages,
}: {
  currentPage: number
  pageSize: number
  params: Record<string, string | string[] | undefined>
  totalCount: number
  totalPages: number
}) {
  const firstRecord = totalCount ? (currentPage - 1) * pageSize + 1 : 0
  const lastRecord = Math.min(currentPage * pageSize, totalCount)
  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {firstRecord}-{lastRecord} of {totalCount}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {currentPage > 1 ? (
          <Button
            render={<Link href={pageHref(params, currentPage - 1)} />}
            variant="outline"
          >
            Previous
          </Button>
        ) : (
          <Button disabled variant="outline">
            Previous
          </Button>
        )}
        {visiblePages.map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <span
              className="flex h-8 items-center px-1.5 text-sm text-muted-foreground"
              key={`ellipsis-${index}`}
            >
              ...
            </span>
          ) : (
            <Button
              aria-current={pageNumber === currentPage ? "page" : undefined}
              key={pageNumber}
              render={<Link href={pageHref(params, pageNumber)} />}
              variant={pageNumber === currentPage ? "default" : "outline"}
            >
              {pageNumber}
            </Button>
          )
        )}
        {currentPage < totalPages ? (
          <Button
            render={<Link href={pageHref(params, currentPage + 1)} />}
            variant="outline"
          >
            Next
          </Button>
        ) : (
          <Button disabled variant="outline">
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

function pageHref(
  params: Record<string, string | string[] | undefined>,
  page: number
) {
  const nextParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (key === "page") {
      continue
    }

    if (typeof value === "string" && value.trim()) {
      nextParams.set(key, value)
    }
  }

  if (page > 1) {
    nextParams.set("page", String(page))
  }

  const query = nextParams.toString()

  return query ? `/students?${query}` : "/students"
}

function studentsContentKey(
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

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: Array<number | "ellipsis"> = [1]
  const start = Math.max(currentPage - 1, 2)
  const end = Math.min(currentPage + 1, totalPages - 1)

  if (start > 2) {
    pages.push("ellipsis")
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis")
  }

  pages.push(totalPages)

  return pages
}
