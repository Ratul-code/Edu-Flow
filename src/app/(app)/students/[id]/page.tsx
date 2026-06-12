import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  CreditCardIcon,
  PhoneIcon,
  TagIcon,
  UserIcon,
} from "lucide-react";

import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog";
import { StudentAssignBatchSheet } from "@/components/students/student-assign-batch-sheet";
import { StudentFeeHistory } from "@/components/students/student-fee-history";
import { StudentEditSheet } from "@/components/students/student-form";
import { StudentNotesForm } from "@/components/students/student-notes-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  archiveStudent,
  assignBatchToStudent,
  updateStudent,
  updateStudentNotes,
} from "@/lib/actions/students";
import { requireAdminContext } from "@/lib/auth/user";
import type { BatchRecord } from "@/lib/data/batches";
import { listBatches } from "@/lib/data/batches";
import { getStudentFeeHistory } from "@/lib/data/fees";
import {
  getStudentById,
  listStudentBatchAssignments,
  listStudentBatchIds,
} from "@/lib/data/students";

type StudentDetailPageProps = {
  params: Promise<{ id: string; }>;
};

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const admin = await requireAdminContext();
  const { id } = await params;
  const [student, batches, assignedBatchIds] = await Promise.all([
    getStudentById(admin.tenantId, id),
    listBatches(admin.tenantId, { status: "active" }),
    listStudentBatchIds(admin.tenantId, id),
  ]);

  if (!student) {
    notFound();
  }

  const feeHistory = await getStudentFeeHistory(
    admin.tenantId,
    student.id,
    student.admission_date
  );
  const assignedBatches = await listStudentBatchAssignments(
    admin.tenantId,
    student.id
  );
  const firstDueLedger = feeHistory.months.find(
    (month) => month.ledger_id && Number(month.due_amount) > 0
  );
  const totalPaid = feeHistory.months.reduce(
    (total, month) => total + Number(month.paid_amount),
    0
  );
  const totalDue = feeHistory.months.reduce(
    (total, month) => total + Number(month.due_amount),
    0
  );

  return (
    <div className="space-y-5 p-6">
      <div>
        <Button
          className="-ml-2 mb-3 gap-1.5 text-muted-foreground"
          render={<Link href="/students" />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Students
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                {initials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  {student.name}
                </h1>
                <StatusPill status={student.status} />
                {student.tags.map((tag) => (
                  <Badge className="text-xs" key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Student ID: {student.id}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StudentEditSheet
              action={updateStudent.bind(null, student.id)}
              assignedBatchIds={assignedBatchIds}
              batches={batches}
              returnPath={`/students/${student.id}`}
              student={student}
              trigger={
                <Button className="gap-1.5" size="sm" type="button" variant="outline" />
              }
            />
            {student.status === "active" ? (
              <ArchiveConfirmDialog
                action={archiveStudent.bind(null, student.id)}
                description={`This will archive ${student.name} and remove them from active student lists.`}
                itemName="student"
                returnPath="/students"
                title="Archive student?"
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
            {firstDueLedger?.ledger_id ? (
              <Button
                className="gap-1.5"
                render={<Link href={`/fees/${firstDueLedger.ledger_id}/payment`} />}
                size="sm"
              >
                <CreditCardIcon className="size-3.5" />
                Record Payment
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="gap-4 py-5">
          <CardHeader className="px-5 pt-0 pb-0">
            <CardTitle className="text-sm font-semibold">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pt-0">
            <IconDetail icon={PhoneIcon} label="Phone" value={student.phone} />
            <IconDetail
              icon={BookOpenIcon}
              label="Class Level"
              value={student.class_level}
            />
            <IconDetail icon={UserIcon} label="Medium" value={student.medium} />
            <IconDetail icon={UserIcon} label="Group" value={student.group_name} />
            <IconDetail
              icon={UserIcon}
              label="Institution"
              value={student.institution}
            />
            <IconDetail
              icon={CalendarIcon}
              label="Admission Date"
              value={formatLongDate(student.admission_date)}
            />
            <Separator />
            <div className="flex items-start gap-2.5">
              <TagIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="mb-1 text-xs text-muted-foreground">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {student.tags.length ? (
                    student.tags.map((tag) => (
                      <Badge className="text-xs" key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm font-medium">-</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <CardTitle className="text-sm font-semibold">
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Father's Name" value={student.guardian_name} />
                <DetailItem label="Mother's Name" value={null} />
                <DetailItem label="Guardian Phone" value={student.guardian_phone} />
                <DetailItem label="Relationship" value={null} />
                <DetailItem label="Occupation" value={null} />
                <DetailItem label="Address" value={null} />
              </div>
            </CardContent>
          </Card>

          <Card className="gap-4 py-5">
            <CardHeader className="flex-row items-center justify-between px-5 pt-0 pb-0">
              <CardTitle className="text-sm font-semibold">
                Enrolled Batches
              </CardTitle>
              <StudentAssignBatchSheet
                action={assignBatchToStudent.bind(null, student.id)}
                assignedBatchIds={assignedBatchIds}
                batches={batches}
              />
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="space-y-2">
                {assignedBatches.length ? (
                  assignedBatches.map((assignment) => (
                    <BatchRow
                      batch={assignment.batch}
                      key={assignment.id}
                      status={assignment.status}
                    />
                  ))
                ) : (
                  <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                    No active batches assigned.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <StudentFeeHistory
            batchLabel={assignedBatches
              .map((assignment) => assignment.batch?.name)
              .filter(Boolean)
              .join(", ")}
            firstDueLedgerId={firstDueLedger?.ledger_id ?? null}
            history={feeHistory}
            totalDue={totalDue}
            totalPaid={totalPaid}
          />

          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <CardTitle className="text-sm font-semibold">Notes</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <StudentNotesForm
                action={updateStudentNotes.bind(null, student.id)}
                notes={student.notes}
              />
            </CardContent>
          </Card>
        </div>
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
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value || "-"}</div>
    </div>
  );
}

function IconDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value || "-"}</div>
      </div>
    </div>
  );
}

function BatchRow({
  batch,
  status,
}: {
  batch: BatchRecord | null;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <BookOpenIcon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{batch?.name ?? "-"}</div>
          <div className="truncate text-xs text-muted-foreground">
            {[batch?.subject, batch?.class_level, batch?.medium, batch?.group_name]
              .filter(Boolean)
              .join(", ") || "-"}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm font-medium">
          {batch ? `${formatTaka(batch.monthly_fee)}/month` : "-"}
        </span>
        <StatusPill status={status} />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === "active") {
    return (
      <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {status}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`;
}
