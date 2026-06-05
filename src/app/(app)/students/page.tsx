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
import { createStudent } from "@/lib/actions/students"
import { requireAdminContext } from "@/lib/auth/user"
import { listBatches } from "@/lib/data/batches"
import {
  listStudentClassLevels,
  listStudentGroups,
  listStudentMediums,
  listStudentBatchIds,
  listStudentTags,
  listStudentsPage,
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
  const [studentPage, classLevels, mediums, groups, tags, batches] = await Promise.all([
    listStudentsPage(admin.tenantId, filters, {
      page,
      pageSize: studentsPerPage,
    }),
    listStudentClassLevels(admin.tenantId),
    listStudentMediums(admin.tenantId),
    listStudentGroups(admin.tenantId),
    listStudentTags(admin.tenantId),
    listBatches(admin.tenantId, { status: "active" }),
  ])
  const { students, totalCount } = studentPage
  const totalPages = Math.max(Math.ceil(totalCount / studentsPerPage), 1)

  if (page > totalPages && totalCount > 0) {
    redirect(pageHref(params, totalPages))
  }

  const assignedBatchIdsByStudent = Object.fromEntries(
    await Promise.all(
      students.map(async (student) => [
        student.id,
        await listStudentBatchIds(admin.tenantId, student.id),
      ])
    )
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={`${totalCount} found`}
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
            <StudentCreateSheet action={createStudent} batches={batches} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <StudentListFilters
            classLevels={classLevels}
            filters={filters}
            groups={groups}
            mediums={mediums}
            tags={tags}
          />
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
        </CardContent>
      </Card>
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
