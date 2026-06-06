import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { BatchAssignmentForm } from "@/components/batches/batch-assignment-form";
import { BatchAssignmentsTable } from "@/components/batches/batch-assignments-table";
import { ClassScheduleForm } from "@/components/batches/class-schedule-form";
import { ClassSchedulesTable } from "@/components/batches/class-schedules-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  archiveBatch,
  assignStudentToBatch,
  createClassSchedule,
} from "@/lib/actions/batches";
import { requireAdminContext } from "@/lib/auth/user";
import {
  getBatchById,
  listBatchAssignments,
  listBatchSchedules,
} from "@/lib/data/batches";
import {
  listStudentClassLevels,
  listStudentGroups,
  listStudentMediums,
  listStudents,
  listStudentTags,
} from "@/lib/data/students";
import { listTeachers } from "@/lib/data/teachers";

type BatchDetailPageProps = {
  params: Promise<{ id: string; }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BatchDetailPage({
  params,
  searchParams,
}: BatchDetailPageProps) {
  const admin = await requireAdminContext();
  const { id } = await params;
  const paramsValue = await searchParams;
  const studentFilters = {
    classLevel: stringParam(paramsValue.studentClassLevel),
    groupName: stringParam(paramsValue.studentGroupName),
    medium: stringParam(paramsValue.studentMedium),
    search: stringParam(paramsValue.studentQ),
    status: "active" as const,
    tag: stringParam(paramsValue.studentTag),
  };
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
  ]);

  if (!batch) {
    notFound();
  }

  const activeAssignedStudentIds = new Set(
    assignments
      .filter((assignment) => assignment.status === "active")
      .map((assignment) => assignment.student_id)
  );
  const visibleAssignments = assignments.filter(
    (assignment) => assignment.status === "active"
  );
  const availableStudents = students.filter(
    (student) => !activeAssignedStudentIds.has(student.id)
  );
  const assignmentPage = positiveIntegerParam(paramsValue.assignmentPage) ?? 1;
  const assignmentPageSize = 8;
  const assignmentTotalPages = Math.max(
    1,
    Math.ceil(visibleAssignments.length / assignmentPageSize)
  );
  const currentAssignmentPage = Math.min(assignmentPage, assignmentTotalPages);
  const assignmentStartIndex = (currentAssignmentPage - 1) * assignmentPageSize;
  const paginatedAssignments = visibleAssignments.slice(
    assignmentStartIndex,
    assignmentStartIndex + assignmentPageSize
  );

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
          <ArchiveConfirmDialog
            action={archiveBatch.bind(null, batch.id)}
            description={`This will archive ${batch.name} and remove it from active batch lists.`}
            itemName="batch"
            returnPath="/batches"
            title="Archive batch?"
          />
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Batch profile</CardTitle>
          <CardDescription>
            The monthly fee is used unless a student assignment overrides it.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <DetailItem label="Class level" value={batch.class_level} />
          <DetailItem label="Medium" value={batch.medium} />
          <DetailItem label="Group" value={batch.group_name} />
          <DetailItem label="Monthly fee" value={formatTaka(batch.monthly_fee)} />
          <DetailItem
            label="Active students"
            value={visibleAssignments.length.toLocaleString("en-BD")}
          />
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
            <BatchAssignmentsTable
              assignments={paginatedAssignments}
              batch={batch}
              currentPage={currentAssignmentPage}
              getPageHref={(page) => pageHref(paramsValue, "assignmentPage", page)}
              pageSize={assignmentPageSize}
              startIndex={assignmentStartIndex}
              totalCount={visibleAssignments.length}
            />
          </CardContent>
        </Card>
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
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{value || "-"}</span>
    </div>
  );
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`;
}

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function positiveIntegerParam(value: string | string[] | undefined) {
  const parsed = Number(stringParam(value));

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function studentFilterKey(filters: {
  classLevel?: string;
  groupName?: string;
  medium?: string;
  search?: string;
  tag?: string;
}) {
  return [
    filters.search,
    filters.classLevel,
    filters.medium,
    filters.groupName,
    filters.tag,
  ].join("|");
}

function pageHref(
  currentParams: Record<string, string | string[] | undefined>,
  key: string,
  page: number
) {
  const nextParams = new URLSearchParams();

  Object.entries(currentParams).forEach(([paramKey, value]) => {
    if (paramKey === key || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => nextParams.append(paramKey, item));
      return;
    }

    nextParams.set(paramKey, value);
  });

  if (page > 1) {
    nextParams.set(key, String(page));
  }

  const query = nextParams.toString();

  return query ? `?${query}` : "?";
}
