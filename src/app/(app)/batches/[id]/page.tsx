import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ClockIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"

import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog"
import { StatusBadge } from "@/components/app/status-badge"
import { BatchAssignmentForm } from "@/components/batches/batch-assignment-form"
import { BatchFeeOverrideSheet } from "@/components/batches/batch-fee-override-sheet"
import { BatchEditSheet } from "@/components/batches/batch-sheet"
import { ClassScheduleForm } from "@/components/batches/class-schedule-form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  archiveBatch,
  archiveClassSchedule,
  archiveStudentBatch,
  assignStudentToBatch,
  createClassSchedule,
  updateBatchStudentFeeOverrides,
} from "@/lib/actions/batches"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getBatchById,
  listBatchAssignments,
  listBatchSchedules,
  type BatchRecord,
  type ClassScheduleRecord,
  type StudentBatchRecord,
} from "@/lib/data/batches"
import {
  currentMonthStart,
  listStudentLedgers,
  type LedgerStatus,
} from "@/lib/data/fees"
import { feeStatusLabel } from "@/lib/fee-status"
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
    feeLedgers,
    classLevels,
    mediums,
    groups,
    tags,
    teachers,
  ] = await Promise.all([
    getBatchById(admin.tenantId, id),
    listBatchAssignments(admin.tenantId, id),
    listBatchSchedules(admin.tenantId, id),
    listStudents(admin.tenantId, studentFilters),
    listStudentLedgers(admin.tenantId, currentMonthStart(), {
      batchId: id,
    }),
    listStudentClassLevels(admin.tenantId),
    listStudentMediums(admin.tenantId),
    listStudentGroups(admin.tenantId),
    listStudentTags(admin.tenantId),
    listTeachers(admin.tenantId, { status: "active" }),
  ])

  if (!batch) {
    notFound()
  }

  const activeAssignedStudentIds = new Set(
    assignments
      .filter((assignment) => assignment.status === "active")
      .map((assignment) => assignment.student_id)
  )
  const visibleAssignments = assignments.filter(
    (assignment) => assignment.status === "active"
  )
  const availableStudents = students.filter(
    (student) => !activeAssignedStudentIds.has(student.id)
  )
  const feeStatusByStudentId = new Map(
    feeLedgers.map((ledger) => [ledger.student_id, ledger.status])
  )

  return (
    <div className="space-y-5 p-6">
      <div>
        <Button
          className="-ml-2 mb-3 gap-1.5 text-muted-foreground"
          render={<Link href="/batches" />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Batches
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UsersIcon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  {batch.name}
                </h1>
                <StatusPill status={batch.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Batch ID: {batch.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BatchEditSheet batch={batch} />
            {batch.status === "active" ? (
              <ArchiveConfirmDialog
                action={archiveBatch.bind(null, batch.id)}
                description={`This will archive ${batch.name} and remove it from active batch lists.`}
                itemName="batch"
                returnPath="/batches"
                title="Archive batch?"
                trigger={
                  <Button
                    className="gap-1.5 text-destructive hover:text-destructive"
                    size="sm"
                    type="button"
                    variant="outline"
                  />
                }
                triggerIcon={<ArchiveIcon className="size-3.5" />}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="gap-4 py-5">
          <CardHeader className="px-5 pt-0 pb-0">
            <CardTitle className="text-sm font-semibold">
              Batch Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pt-0">
            <DetailItem label="Class Level" value={batch.class_level} />
            <DetailItem label="Medium" value={batch.medium} />
            <DetailItem label="Group" value={batch.group_name} />
            <DetailItem label="Subjects" value={batch.subject} />
            <DetailItem
              label="Monthly Fee"
              value={formatTaka(batch.monthly_fee)}
            />
            <DetailItem
              label="Active Students"
              value={`${visibleAssignments.length.toLocaleString("en-BD")} enrolled`}
            />
            <DetailItem label="Created" value={formatDate(batch.created_at)} />
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="gap-4 py-5">
            <CardHeader className="flex-row items-center justify-between px-5 pt-0 pb-0">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Enrolled Students
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  {visibleAssignments.length.toLocaleString("en-BD")} students enrolled
                </CardDescription>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <BatchFeeOverrideSheet
                  action={updateBatchStudentFeeOverrides.bind(null, batch.id)}
                  assignments={visibleAssignments}
                />
                <BatchAssignmentForm
                  action={assignStudentToBatch.bind(null, batch.id)}
                  classLevels={classLevels}
                  filters={studentFilters}
                  groups={groups}
                  key={studentFilterKey(studentFilters)}
                  mediums={mediums}
                  students={availableStudents}
                  tags={tags}
                />
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <AssignedStudentsTable
                assignments={visibleAssignments}
                batch={batch}
                feeStatusByStudentId={feeStatusByStudentId}
              />
            </CardContent>
          </Card>

          <Card className="gap-4 py-5">
            <CardHeader className="flex-row items-center justify-between px-5 pt-0 pb-0">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Weekly Schedule
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  {schedules.length.toLocaleString("en-BD")} sessions per week
                </CardDescription>
              </div>
              <ClassScheduleForm
                action={createClassSchedule.bind(null, batch.id)}
                teachers={teachers}
              />
            </CardHeader>
            <CardContent className="space-y-2 px-5 pt-2">
              <ScheduleList batchId={batch.id} schedules={schedules} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AssignedStudentsTable({
  assignments,
  batch,
  feeStatusByStudentId,
}: {
  assignments: StudentBatchRecord[]
  batch: BatchRecord
  feeStatusByStudentId: Map<string, LedgerStatus>
}) {
  if (!assignments.length) {
    return (
      <p className="rounded-lg border p-3 text-sm text-muted-foreground">
        No students are assigned to this batch yet.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-8 text-xs font-medium">Student</TableHead>
          <TableHead className="h-8 text-xs font-medium">Class</TableHead>
          <TableHead className="h-8 text-xs font-medium">Since</TableHead>
          <TableHead className="h-8 text-xs font-medium">Fee Status</TableHead>
          <TableHead className="h-8 w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell className="py-2.5">
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-muted text-[10px] font-semibold">
                    {initials(assignment.student?.name ?? "Student")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {assignment.student?.id ? (
                    <Link
                      className="text-sm font-medium hover:underline"
                      href={`/students/${assignment.student.id}`}
                    >
                      {assignment.student.name}
                    </Link>
                  ) : (
                    <div className="text-sm font-medium">Unknown student</div>
                  )}
                  {assignment.student?.phone ? (
                    <div className="text-xs text-muted-foreground">
                      {assignment.student.phone}
                    </div>
                  ) : null}
                </div>
              </div>
            </TableCell>
            <TableCell className="py-2.5 text-sm">
              {assignment.student?.class_level ?? "-"}
            </TableCell>
            <TableCell className="py-2.5 text-xs text-muted-foreground">
              {formatShortMonth(assignment.joined_at)}
            </TableCell>
            <TableCell className="py-2.5">
              <StatusBadge
                status={feeStatusLabel(
                  feeStatusByStudentId.get(assignment.student_id) ??
                    "not_started"
                )}
              />
            </TableCell>
            <TableCell className="py-2.5">
              {assignment.status === "active" ? (
                <ArchiveConfirmDialog
                  action={archiveStudentBatch.bind(null, batch.id, assignment.id)}
                  confirmLabel="Remove student"
                  confirmVariant="destructive"
                  description={`This will remove ${assignment.student?.name ?? "this student"} from ${batch.name}.`}
                  itemName="student"
                  title="Remove student?"
                  trigger={
                    <Button
                      className="size-6 cursor-pointer text-muted-foreground hover:text-destructive"
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    />
                  }
                  triggerIcon={<Trash2Icon className="size-3.5" />}
                  triggerLabel="Remove student"
                  triggerSize="icon-sm"
                />
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ScheduleList({
  batchId,
  schedules,
}: {
  batchId: string
  schedules: ClassScheduleRecord[]
}) {
  if (!schedules.length) {
    return (
      <p className="rounded-lg border p-3 text-sm text-muted-foreground">
        No weekly classes are scheduled for this batch yet.
      </p>
    )
  }

  return schedules.map((schedule) => (
    <div
      className="flex items-center justify-between rounded-lg border p-3"
      key={schedule.id}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-md bg-muted">
          <ClockIcon className="size-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-sm font-medium">
            {weekday(schedule.weekday)} · {formatTime(schedule.start_time)} -{" "}
            {formatTime(schedule.end_time)}
          </div>
          <div className="text-xs text-muted-foreground">
            {schedule.subject || "-"} — {schedule.teacher?.name ?? "-"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {schedule.room_name ? (
          <Badge className="text-xs font-normal" variant="secondary">
            {schedule.room_name}
          </Badge>
        ) : null}
        {schedule.status === "active" ? (
          <ArchiveConfirmDialog
            action={archiveClassSchedule.bind(null, batchId, schedule.id)}
            confirmLabel="Archive schedule"
            description="This will archive the selected class schedule and remove it from active weekly planning."
            itemName="schedule"
            title="Archive schedule?"
            trigger={
              <Button
                className="size-6 cursor-pointer text-muted-foreground hover:text-destructive"
                size="icon-sm"
                type="button"
                variant="ghost"
              />
            }
            triggerIcon={<Trash2Icon className="size-3.5" />}
            triggerLabel="Archive schedule"
            triggerSize="icon-sm"
          />
        ) : null}
      </div>
    </div>
  ))
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value || "-"}</div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
        Active
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {status}
    </span>
  )
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST"
  )
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

function formatShortMonth(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

function weekday(value: number) {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][value] ?? "-"
}

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function studentFilterKey(filters: {
  classLevel?: string
  groupName?: string
  medium?: string
  search?: string
  tag?: string
}) {
  return [
    filters.search,
    filters.classLevel,
    filters.medium,
    filters.groupName,
    filters.tag,
  ].join("|")
}
