import type { LucideIcon } from "lucide-react";
import {
  CalendarDaysIcon,
  GraduationCapIcon,
  ReceiptTextIcon,
  UsersRoundIcon,
  WalletCardsIcon,
} from "lucide-react";

import { QuickActions } from "@/components/dashboard/quick-actions";
import { UnpaidStudents } from "@/components/dashboard/unpaid-students";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdminContext } from "@/lib/auth/user";
import { listBatches } from "@/lib/data/batches";
import {
  getStudentFeeSummary,
  listDashboardDueStudentLedgers,
  listUpcomingSchedules,
  type DashboardSchedule,
} from "@/lib/data/dashboard";
import { monthStart } from "@/lib/data/fees";
import {
  countTenantRecordsByStatus,
  countTenantRecordsCreatedSince,
} from "@/lib/data/tenant-records";

export default async function DashboardPage() {
  const admin = await requireAdminContext();
  const currentMonth = monthStart();
  const previousMonth = previousMonthStart(currentMonth);
  const [
    activeStudents,
    activeBatches,
    newStudentsThisMonth,
    newBatchesThisMonth,
    studentFees,
    previousStudentFees,
    upcomingSchedules,
    quickBatches,
    dueLedgers,
  ] = await Promise.all([
    countTenantRecordsByStatus("students", admin.tenantId, "active"),
    countTenantRecordsByStatus("batches", admin.tenantId, "active"),
    countTenantRecordsCreatedSince("students", admin.tenantId, currentMonth),
    countTenantRecordsCreatedSince("batches", admin.tenantId, currentMonth),
    getStudentFeeSummary(admin.tenantId, currentMonth),
    getStudentFeeSummary(admin.tenantId, previousMonth),
    listUpcomingSchedules(admin.tenantId),
    listBatches(admin.tenantId, { status: "active" }),
    listDashboardDueStudentLedgers(admin.tenantId, currentMonth),
  ]);
  const collectionChange = percentChange(
    studentFees.paid,
    previousStudentFees.paid
  );
  const topMetrics = [
    {
      footerLeft: "Active Students",
      footerRight: `+${displayCount(newStudentsThisMonth)} this month`,
      icon: UsersRoundIcon,
      label: "Active Students",
      labelTone: "text-[#3157d8]",
      tone: "bg-[#eef3ff] text-[#3157d8]",
      value: displayCount(activeStudents),
      bgClass: "bg-[#eef3ff52]",
    },
    {
      footerLeft: "Active Batches",
      footerRight: `+${displayCount(newBatchesThisMonth)} this month`,
      icon: GraduationCapIcon,
      label: "Active Batches",
      labelTone: "text-[#16805a]",
      tone: "bg-[#edf9f2] text-[#12935f]",
      value: displayCount(activeBatches),
      bgClass: "bg-[#edf9f252]",
    },
    {
      footerLeft: "Compared to last month",
      footerRight: formatTrend(collectionChange),
      icon: WalletCardsIcon,
      label: "Fee Collected",
      labelTone: "text-[#d6991c]",
      tone: "bg-[#ffe7b8] text-[#d6991c]",
      value: formatTaka(studentFees.paid),
      bgClass: "bg-[#fffbeb72]",
    },
    {
      footerLeft: `Total ${displayCount(dueLedgers.length)} students`,
      footerRight: "",
      icon: ReceiptTextIcon,
      label: "Due Fee",
      labelTone: "text-[#d94b4b]",
      tone: "bg-[#fee2e2] text-[#d94b4b]",
      value: formatTaka(studentFees.due),
      bgClass: "bg-[#fff5f572]",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-normal">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back. Here&apos;s what&apos;s happening at your coaching
            center.
          </p>
        </div>
        <Badge className="h-9 rounded-lg px-3" variant="outline">
          <CalendarDaysIcon data-icon="inline-start" />
          {formatMonth(currentMonth)}
        </Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <Card className="min-h-80">
          <CardHeader>
            <CardTitle>Due Students</CardTitle>
          </CardHeader>
          <CardContent>
            <UnpaidStudents students={dueLedgers} />
          </CardContent>
        </Card>

        <Card className="min-h-80">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions batches={quickBatches} dueLedgers={dueLedgers} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingClassesTable schedules={upcomingSchedules} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  footerLeft,
  footerRight,
  icon: Icon,
  label,
  labelTone,
  tone,
  value,
  bgClass = "bg-white",
}: {
  footerLeft: string;
  footerRight: string;
  icon: LucideIcon;
  label: string;
  labelTone: string;
  tone: string;
  value: string;
  bgClass?: string;
}) {
  return (
    <Card
      className={`min-h-[154px] rounded-xl border-stale-200 ${bgClass}`}
      size="sm"
    >
      <CardContent className="relative flex gap-5 min-h-[132px] flex-col justify-between px-5 py-4">
        <span
          className={`absolute top-1/2 right-6 flex size-16 -translate-y-1/2 items-center justify-center rounded-full ${tone}`}
        >
          <Icon strokeWidth={2.15} />
        </span>
        <div className="flex min-w-0 max-w-[calc(100%-4.5rem)] flex-col gap-6">
          <p className={`truncate text-[15px] font-semibold ${labelTone}`}>
            {label}
          </p>
          <p className="truncate text-[32px] leading-none font-bold tracking-normal text-[#101828]">
            {value}
          </p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="truncate text-[15px] font-medium text-[#6d7480]">
            {footerLeft}
          </p>
          {footerRight ? (
            <p className="shrink-0 text-[14px] text-primary">
              {footerRight}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingClassesTable({ schedules }: { schedules: DashboardSchedule[]; }) {
  if (!schedules.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Upcoming classes will appear after schedules are added to batches.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Batch</th>
            <th className="px-3 py-2 font-medium">Subject</th>
            <th className="px-3 py-2 font-medium">Teacher</th>
            <th className="px-3 py-2 font-medium">Room</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr className="border-t" key={schedule.id}>
              <td className="px-3 py-3">
                {weekday(schedule.weekday)} {formatTime(schedule.start_time)}
              </td>
              <td className="px-3 py-3">{schedule.batch?.name ?? "-"}</td>
              <td className="px-3 py-3">{schedule.subject ?? "-"}</td>
              <td className="px-3 py-3">{schedule.teacher?.name ?? "-"}</td>
              <td className="px-3 py-3">{schedule.room_name || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function displayCount(value: number | null) {
  return value === null ? "0" : value.toLocaleString("en-BD");
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function previousMonthStart(value: string) {
  const date = new Date(value);
  date.setMonth(date.getMonth() - 1);

  return date.toISOString().slice(0, 10);
}

function percentChange(current: number, previous: number) {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function formatTrend(value: number) {
  const sign = value >= 0 ? "+" : "";

  return `${sign}${value.toFixed(1)}%`;
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`;
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function weekday(value: number) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][value] ?? "-";
}
