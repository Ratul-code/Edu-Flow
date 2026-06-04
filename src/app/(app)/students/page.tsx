import { PlusIcon } from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/app/page-header"
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
import { requireAdminContext } from "@/lib/auth/user"
import {
  listStudentClassLevels,
  listStudentGroups,
  listStudentMediums,
  listStudentTags,
  listStudents,
  type StudentStatus,
} from "@/lib/data/students"

type StudentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function StudentsPage({
  searchParams,
}: StudentsPageProps) {
  const admin = await requireAdminContext()
  const params = await searchParams
  const filters = {
    classLevel: stringParam(params.classLevel),
    groupName: stringParam(params.groupName),
    medium: stringParam(params.medium),
    search: stringParam(params.q),
    status: statusParam(params.status),
    tag: stringParam(params.tag),
  }
  const [students, classLevels, mediums, groups, tags] = await Promise.all([
    listStudents(admin.tenantId, filters),
    listStudentClassLevels(admin.tenantId),
    listStudentMediums(admin.tenantId),
    listStudentGroups(admin.tenantId),
    listStudentTags(admin.tenantId),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={`${students.length} shown`}
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
            <Button render={<Link href="/students/new" />}>
              <PlusIcon data-icon="inline-start" />
              Add student
            </Button>
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
            <StudentsTable students={students} />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No students found</EmptyTitle>
                <EmptyDescription>
                  Add a student or adjust the search and filters.
                </EmptyDescription>
              </EmptyHeader>
              <Button render={<Link href="/students/new" />}>
                <PlusIcon data-icon="inline-start" />
                Add student
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
): StudentStatus | "all" {
  const status = stringParam(value)

  return status === "active" || status === "archived" ? status : "all"
}
