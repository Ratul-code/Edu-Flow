import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArchiveIcon,
  ArrowLeftIcon,
  BanknoteIcon,
  BookOpenIcon,
  PhoneIcon,
} from "lucide-react"

import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog"
import { SalaryPaymentReceiptDialog } from "@/components/salaries/salary-payment-receipt-dialog"
import { TeacherEditSheet } from "@/components/teachers/teacher-form"
import { TeacherNotesForm } from "@/components/teachers/teacher-notes-form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  archiveTeacher,
  updateTeacher,
  updateTeacherNotes,
} from "@/lib/actions/teachers"
import { requireAdminContext } from "@/lib/auth/user"
import {
  listTeacherSalaryHistory,
  type TeacherSalaryLedgerRecord,
} from "@/lib/data/salaries"
import { getTeacherById } from "@/lib/data/teachers"

type TeacherDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function TeacherDetailPage({
  params,
}: TeacherDetailPageProps) {
  const admin = await requireAdminContext()
  const { id } = await params
  const [teacher, salaryHistory] = await Promise.all([
    getTeacherById(admin.tenantId, id),
    listTeacherSalaryHistory(admin.tenantId, id),
  ])

  if (!teacher) {
    notFound()
  }

  const firstDueLedger = salaryHistory.find(
    (ledger) => Number(ledger.due_amount) > 0
  )
  const totalPaid = salaryHistory.reduce(
    (total, ledger) => total + Number(ledger.paid_amount),
    0
  )
  const totalDue = salaryHistory.reduce(
    (total, ledger) => total + Number(ledger.due_amount),
    0
  )
  const activeBatchCount = 0

  return (
    <div className="space-y-5 p-6">
      <div>
        <Button
          className="-ml-2 mb-3 gap-1.5 text-muted-foreground"
          render={<Link href="/teachers" />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Teachers
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                {initials(teacher.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  {teacher.name}
                </h1>
                <StatusPill status={teacher.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Teacher ID: {teacher.id}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TeacherEditSheet
              action={updateTeacher.bind(null, teacher.id, `/teachers/${teacher.id}`)}
              teacher={teacher}
            />
            {teacher.status === "active" ? (
              <ArchiveConfirmDialog
                action={archiveTeacher.bind(null, teacher.id)}
                description={`This will archive ${teacher.name} and remove them from active teacher lists.`}
                itemName="teacher"
                returnPath="/teachers"
                title="Archive teacher?"
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
            {firstDueLedger ? (
              <Button
                className="gap-1.5"
                render={
                  <Link href={`/salaries/${firstDueLedger.id}/payment`} />
                }
                size="sm"
              >
                <BanknoteIcon className="size-3.5" />
                Record Salary
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
            <IconDetail icon={PhoneIcon} label="Phone" value={teacher.phone} />
            <IconDetail
              icon={BookOpenIcon}
              label="Subject Specialty"
              value={teacher.subject_specialty}
            />
            <IconDetail
              icon={BookOpenIcon}
              label="Assigned Batches"
              value={`${activeBatchCount} active batches`}
            />
            <IconDetail
              icon={BanknoteIcon}
              label="Default Monthly Salary"
              value={formatTaka(teacher.default_monthly_salary)}
            />
            <IconDetail
              icon={BanknoteIcon}
              label="Joined Date"
              value={formatDate(teacher.created_at)}
            />
            <IconDetail icon={PhoneIcon} label="Email" value={null} />
            <IconDetail icon={PhoneIcon} label="NID" value={null} />
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <CardTitle className="text-sm font-semibold">
                Salary Baseline
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Configure the expected salary for each month
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="grid grid-cols-3 gap-4">
                <BaselineTile
                  desc="Per month"
                  label="Base Salary"
                  value={formatTaka(teacher.default_monthly_salary)}
                />
                <BaselineTile
                  desc={`${salaryHistory.length} months`}
                  label={`Total Paid (${new Date().getFullYear()})`}
                  value={formatTaka(totalPaid)}
                />
                <BaselineTile
                  desc={`${salaryHistory.filter((ledger) => Number(ledger.due_amount) > 0).length} months pending`}
                  label={`Total Due (${new Date().getFullYear()})`}
                  value={formatTaka(totalDue)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Salary History
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs">
                    Total paid:{" "}
                    <span className="font-medium text-success">
                      {formatTaka(totalPaid)}
                    </span>{" "}
                    · Outstanding:{" "}
                    <span className="font-medium text-destructive">
                      {formatTaka(totalDue)}
                    </span>
                  </CardDescription>
                </div>
                {firstDueLedger ? (
                  <Button
                    className="text-xs"
                    render={
                      <Link href={`/salaries/${firstDueLedger.id}/payment`} />
                    }
                    size="sm"
                    variant="ghost"
                  >
                    Record Payment
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <SalaryHistoryTable ledgers={salaryHistory} teacherName={teacher.name} />
            </CardContent>
          </Card>

          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <CardTitle className="text-sm font-semibold">Notes</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <TeacherNotesForm
                action={updateTeacherNotes.bind(null, teacher.id)}
                notes={teacher.notes}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SalaryHistoryTable({
  ledgers,
  teacherName,
}: {
  ledgers: TeacherSalaryLedgerRecord[]
  teacherName: string
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-8 text-xs font-medium">Month</TableHead>
          <TableHead className="h-8 text-right text-xs font-medium">
            Expected
          </TableHead>
          <TableHead className="h-8 text-right text-xs font-medium">
            Paid
          </TableHead>
          <TableHead className="h-8 text-right text-xs font-medium">
            Due
          </TableHead>
          <TableHead className="h-8 text-xs font-medium">Status</TableHead>
          <TableHead className="h-8 w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {ledgers.length ? (
          ledgers.map((ledger) => (
            <TableRow key={ledger.id}>
              <TableCell className="py-2.5 text-sm font-medium">
                {formatMonth(ledger.ledger_month)}
              </TableCell>
              <TableCell className="py-2.5 text-right text-sm">
                {formatTaka(ledger.expected_salary)}
              </TableCell>
              <TableCell className="py-2.5 text-right text-sm font-medium text-success">
                {formatTaka(ledger.paid_amount)}
              </TableCell>
              <TableCell className="py-2.5 text-right text-sm font-medium text-destructive">
                {formatTaka(ledger.due_amount)}
              </TableCell>
              <TableCell className="py-2.5">
                <SalaryStatusBadge status={ledger.status} />
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex justify-end">
                  {Number(ledger.due_amount) > 0 ? (
                    <Button
                      className="gap-1"
                      render={<Link href={`/salaries/${ledger.id}/payment`} />}
                      size="xs"
                      variant="outline"
                    >
                      <BanknoteIcon className="size-3" data-icon="inline-start" />
                      Pay
                    </Button>
                  ) : ledger.latest_payment ? (
                    <SalaryPaymentReceiptDialog
                      paymentId={ledger.latest_payment.id}
                      teacherName={teacherName}
                    />
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              className="py-6 text-center text-sm text-muted-foreground"
              colSpan={6}
            >
              No salary history has been generated yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function SalaryStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    paid: {
      className: "border-success/20 bg-success/10 text-success",
      label: "Paid",
    },
    partial: {
      className: "border-info/20 bg-info/10 text-info",
      label: "Partial",
    },
    unpaid: {
      className: "border-warning/20 bg-warning/10 text-warning-foreground",
      label: "Due",
    },
    waived: {
      className: "border-border bg-muted text-muted-foreground",
      label: "Waived",
    },
  }
  const config = map[status] ?? { className: "", label: status }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}

function IconDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value || "-"}</div>
      </div>
    </div>
  )
}

function BaselineTile({
  desc,
  label,
  value,
}: {
  desc: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
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
      .join("") || "TC"
  )
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
