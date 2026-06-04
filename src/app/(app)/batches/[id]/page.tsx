import { ArchiveIcon, PencilIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/page-header"
import { StatusBadge } from "@/components/app/status-badge"
import { BatchAssignmentForm } from "@/components/batches/batch-assignment-form"
import { BatchAssignmentsTable } from "@/components/batches/batch-assignments-table"
import { ClassScheduleForm } from "@/components/batches/class-schedule-form"
import { ClassSchedulesTable } from "@/components/batches/class-schedules-table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  archiveBatch,
  assignStudentToBatch,
  createClassSchedule,
} from "@/lib/actions/batches"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getBatchById,
  listBatchAssignments,
  listBatchSchedules,
} from "@/lib/data/batches"
import {
  listStudentClassLevels,
  listStudentGroups,
  listStudentMediums,
  listStudents,
  listStudentTags,
} from "@/lib/data/students"
import { listTeachers } from "@/lib/data/teachers"

type BatchDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BatchDetailPage({
  params,
  searchParams,
}: BatchDetailPageProps) {
  const admin = await requireAdminContext()
  const { id } = await params
  const paramsValue = await searchParams
  const studentFilters = {
    classLevel: stringParam(paramsValue.studentClassLevel),
    groupName: stringParam(paramsValue.studentGroupName),
    medium: stringParam(paramsValue.studentMedium),
    search: stringParam(paramsValue.studentQ),
    status: "active" as const,
    tag: stringParam(paramsValue.studentTag),
  }
  const [
    batch,
    assignments,
    schedules,
    students,
    teachers,
    classLevels,
    mediums,
    groups,
    tags,
  ] = await Promise.all([
    getBatchById(admin.tenantId, id),
    listBatchAssignments(admin.tenantId, id),
    listBatchSchedules(admin.tenantId, id),
    listStudents(admin.tenantId, studentFilters),
    listTeachers(admin.tenantId, { status: "active" }),
    listStudentClassLevels(admin.tenantId),
    listStudentMediums(admin.tenantId),
    listStudentGroups(admin.tenantId),
    listStudentTags(admin.tenantId),
  ])

  if (!batch) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={batch.status}
        description="Manage batch setup, student assignments, fee overrides, and weekly class schedules."
        title={batch.name}
      />
      <div className="flex flex-wrap gap-2">
        <Button render={<Link href={`/batches/${batch.id}/edit`} />}>
          <PencilIcon data-icon="inline-start" />
          Edit batch
        </Button>
        {batch.status === "active" ? (
          <form action={archiveBatch.bind(null, batch.id)}>
            <Button type="submit" variant="outline">
              <ArchiveIcon data-icon="inline-start" />
              Archive
            </Button>
          </form>
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Batch profile</CardTitle>
          <CardDescription>
            The monthly fee is used unless a student assignment overrides it.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Class level" value={batch.class_level} />
          <DetailItem label="Medium" value={batch.medium} />
          <DetailItem label="Group" value={batch.group_name} />
          <DetailItem label="Monthly fee" value={formatTaka(batch.monthly_fee)} />
          <DetailItem
            label="Status"
            value={<StatusBadge status={batch.status} />}
          />
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Assigned students</CardTitle>
            <CardDescription>
              A student can join multiple batches. Overrides apply only here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BatchAssignmentsTable assignments={assignments} batch={batch} />
          </CardContent>
        </Card>
        <BatchAssignmentForm
          action={assignStudentToBatch.bind(null, batch.id)}
          classLevels={classLevels}
          filters={studentFilters}
          groups={groups}
          mediums={mediums}
          students={students}
          tags={tags}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Weekly schedule</CardTitle>
            <CardDescription>
              These rows are the base for future attendance sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClassSchedulesTable batchId={batch.id} schedules={schedules} />
          </CardContent>
        </Card>
        <ClassScheduleForm
          action={createClassSchedule.bind(null, batch.id)}
          teachers={teachers}
        />
      </div>
    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{value || "-"}</span>
    </div>
  )
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}
