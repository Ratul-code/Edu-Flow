import { PlusIcon } from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/app/page-header"
import { TeacherListFilters } from "@/components/teachers/teacher-list-filters"
import { TeachersTable } from "@/components/teachers/teachers-table"
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
import { requireAdminContext } from "@/lib/auth/user"
import { listTeachers, type TeacherStatus } from "@/lib/data/teachers"

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
  const teachers = await listTeachers(admin.tenantId, filters)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={`${teachers.length} shown`}
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
            <Button render={<Link href="/teachers/new" />}>
              <PlusIcon data-icon="inline-start" />
              Add teacher
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TeacherListFilters filters={filters} />
          {teachers.length ? (
            <TeachersTable teachers={teachers} />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No teachers found</EmptyTitle>
                <EmptyDescription>
                  Add a teacher or adjust the search and filters.
                </EmptyDescription>
              </EmptyHeader>
              <Button render={<Link href="/teachers/new" />}>
                <PlusIcon data-icon="inline-start" />
                Add teacher
              </Button>
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
): TeacherStatus | "all" {
  const status = stringParam(value)

  return status === "active" || status === "archived" ? status : "all"
}
