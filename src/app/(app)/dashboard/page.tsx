import {
  BanknoteIcon,
  BellIcon,
  BookOpenIcon,
  CalendarClockIcon,
  GraduationCapIcon,
  ReceiptTextIcon,
  UsersRoundIcon,
  WalletCardsIcon,
} from "lucide-react"

import { PageHeader } from "@/components/app/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getStudentFeeSummary,
  getTeacherSalarySummary,
  listRecentStudentPayments,
  listRecentTeacherSalaryPayments,
  listUpcomingSchedules,
  type DashboardSchedule,
  type RecentStudentPayment,
  type RecentTeacherPayment,
} from "@/lib/data/dashboard"
import { monthStart } from "@/lib/data/fees"
import { countTenantRecordsByStatus } from "@/lib/data/tenant-records"

export default async function DashboardPage() {
  const admin = await requireAdminContext()
  const currentMonth = monthStart()
  const [
    activeStudents,
    activeTeachers,
    activeBatches,
    studentFees,
    teacherSalaries,
    upcomingSchedules,
    recentStudentPayments,
    recentTeacherPayments,
  ] = await Promise.all([
    countTenantRecordsByStatus("students", admin.tenantId, "active"),
    countTenantRecordsByStatus("teachers", admin.tenantId, "active"),
    countTenantRecordsByStatus("batches", admin.tenantId, "active"),
    getStudentFeeSummary(admin.tenantId, currentMonth),
    getTeacherSalarySummary(admin.tenantId, currentMonth),
    listUpcomingSchedules(admin.tenantId),
    listRecentStudentPayments(admin.tenantId),
    listRecentTeacherSalaryPayments(admin.tenantId),
  ])
  const metrics = [
    {
      helper: "Currently active",
      icon: UsersRoundIcon,
      label: "Active students",
      value: displayCount(activeStudents),
    },
    {
      helper: "Currently active",
      icon: GraduationCapIcon,
      label: "Active teachers",
      value: displayCount(activeTeachers),
    },
    {
      helper: "Currently active",
      icon: BookOpenIcon,
      label: "Active batches",
      value: displayCount(activeBatches),
    },
    {
      helper: "Current month after discounts",
      icon: ReceiptTextIcon,
      label: "Monthly expected student fees",
      value: formatTaka(studentFees.expected),
    },
    {
      helper: "Current month ledger",
      icon: BanknoteIcon,
      label: "Monthly collected fees",
      value: formatTaka(studentFees.paid),
    },
    {
      helper: "Current month ledger",
      icon: WalletCardsIcon,
      label: "Student outstanding dues",
      value: formatTaka(studentFees.due),
    },
    {
      helper: "Current month after adjustments",
      icon: GraduationCapIcon,
      label: "Teacher expected salaries",
      value: formatTaka(teacherSalaries.expected),
    },
    {
      helper: "Current month ledger",
      icon: BanknoteIcon,
      label: "Teacher salary paid",
      value: formatTaka(teacherSalaries.paid),
    },
    {
      helper: "Current month ledger",
      icon: WalletCardsIcon,
      label: "Teacher salary due",
      value: formatTaka(teacherSalaries.due),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={currentMonth.slice(0, 7)}
        description={`A quick health check for ${admin.tenantName}.`}
        title="Dashboard"
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} size="sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-2xl">{metric.value}</CardTitle>
                </div>
                <metric.icon className="mt-1 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming classes</CardTitle>
            <CardDescription>
              Next weekly schedule rows from active class schedules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleList schedules={upcomingSchedules} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent notification status</CardTitle>
            <CardDescription>
              Notification delivery logs will appear here after the adapter is
              connected.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <BellIcon className="text-muted-foreground" />
                <span className="truncate text-sm">SMS provider</span>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent student payments</CardTitle>
            <CardDescription>Latest recorded student fee payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentPaymentList payments={recentStudentPayments} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent teacher salary payments</CardTitle>
            <CardDescription>Latest recorded teacher salary payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeacherPaymentList payments={recentTeacherPayments} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function ScheduleList({ schedules }: { schedules: DashboardSchedule[] }) {
  if (!schedules.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No upcoming class schedules yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {schedules.map((schedule) => (
        <div
          className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2"
          key={schedule.id}
        >
          <div className="flex min-w-0 items-center gap-3">
            <CalendarClockIcon className="text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {schedule.subject || schedule.batch?.name || "Class"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {schedule.batch?.name ? `${schedule.batch.name} - ` : ""}
                {weekday(schedule.weekday)} {formatTime(schedule.start_time)} -{" "}
                {formatTime(schedule.end_time)}
                {schedule.room_name ? ` - ${schedule.room_name}` : ""}
              </p>
            </div>
          </div>
          <Badge variant="outline">{schedule.teacher?.name ?? "Unassigned"}</Badge>
        </div>
      ))}
    </div>
  )
}

function StudentPaymentList({
  payments,
}: {
  payments: RecentStudentPayment[]
}) {
  if (!payments.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No student payments recorded yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {payments.map((payment) => (
        <PaymentRow
          amount={payment.amount}
          key={payment.id}
          method={payment.method}
          name={payment.student?.name ?? "Student"}
          receipt={payment.receipt_number}
          date={payment.payment_date}
        />
      ))}
    </div>
  )
}

function TeacherPaymentList({
  payments,
}: {
  payments: RecentTeacherPayment[]
}) {
  if (!payments.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No teacher salary payments recorded yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {payments.map((payment) => (
        <PaymentRow
          amount={payment.amount}
          key={payment.id}
          method={payment.method}
          name={payment.teacher?.name ?? "Teacher"}
          receipt={payment.receipt_number}
          date={payment.payment_date}
        />
      ))}
    </div>
  )
}

function PaymentRow({
  amount,
  date,
  method,
  name,
  receipt,
}: {
  amount: number | string
  date: string
  method: string
  name: string
  receipt: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {receipt} - {titleCase(method)} - {formatDate(date)}
        </p>
      </div>
      <span className="text-sm font-medium">{formatTaka(amount)}</span>
    </div>
  )
}

function displayCount(value: number | null) {
  return value === null ? "0" : value.toString()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value))
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}

function formatTime(value: string) {
  return value.slice(0, 5)
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

function weekday(value: number) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][value] ?? "-"
}
