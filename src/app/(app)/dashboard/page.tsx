import type { LucideIcon } from "lucide-react";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  GraduationCapIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UsersRoundIcon,
  WalletCardsIcon,
} from "lucide-react";
import Link from "next/link";

import { QuickActions } from "@/components/dashboard/quick-actions";
import { UnpaidStudents } from "@/components/dashboard/unpaid-students";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const collectionTotal = Number(studentFees.paid) + Number(studentFees.due);
  const collectionPercent =
    collectionTotal > 0 ? Math.round((Number(studentFees.paid) / collectionTotal) * 100) : 0;
  const topMetrics = [
    {
      icon: UsersRoundIcon,
      tone: "bg-info/10 text-info",
      title: "Active Students",
      trend: "up",
      change: `+${displayCount(newStudentsThisMonth)} this month`,
      value: displayCount(activeStudents),
    },
    {
      icon: GraduationCapIcon,
      tone: "bg-success/10 text-success",
      title: "Active Batches",
      trend: "up",
      change: `+${displayCount(newBatchesThisMonth)} this month`,
      value: displayCount(activeBatches),
    },
    {
      icon: WalletCardsIcon,
      tone: "bg-success/10 text-success",
      title: "Fee Collected",
      trend: collectionChange >= 0 ? "up" : "down",
      change: formatTrend(collectionChange),
      value: formatTaka(studentFees.paid),
    },
    {
      icon: AlertCircleIcon,
      tone: "bg-destructive/10 text-destructive",
      title: "Due Fee",
      trend: "down",
      change: `${displayCount(dueLedgers.length)} students`,
      value: formatTaka(studentFees.due),
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Welcome back. Here&apos;s what&apos;s happening at your coaching
            center.
          </p>
        </div>
        <Badge className="gap-1.5 text-xs font-medium" variant="outline">
          <CalendarDaysIcon data-icon="inline-start" />
          {formatMonth(currentMonth)}
        </Badge>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      <Card className="gap-4 py-5">
        <CardHeader className="px-5 pt-0 pb-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">
                Fee Collection Progress
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {formatMonth(currentMonth)} - {formatTaka(studentFees.paid)} of{" "}
                {formatTaka(collectionTotal)} collected
              </CardDescription>
            </div>
            <span className="text-sm font-semibold text-success">
              {collectionPercent}%
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-5 pt-0">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${collectionPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{formatTaka(studentFees.paid)} collected</span>
            <span>{formatTaka(studentFees.due)} remaining</span>
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="gap-3 py-5 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between px-5 pt-0 pb-0">
            <div>
              <CardTitle className="text-sm font-semibold">
                Students With Due Fees
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Requires immediate attention
              </CardDescription>
            </div>
            <Button
              className="gap-1 text-xs"
              render={<Link href="/fees" />}
              size="sm"
              variant="ghost"
            >
              View all <ArrowRightIcon className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="px-5 pt-2">
            <UnpaidStudents students={dueLedgers} />
          </CardContent>
        </Card>

        <Card className="gap-3 py-5">
          <CardHeader className="px-5 pt-0 pb-0">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-xs">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 px-5 pt-2">
            <QuickActions batches={quickBatches} dueLedgers={dueLedgers} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="gap-3 py-5">
          <CardHeader className="px-5 pt-0 pb-0">
            <CardTitle className="text-sm font-semibold">Upcoming Classes</CardTitle>
            <CardDescription className="text-xs">
              Scheduled classes from active batches
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pt-2">
            <UpcomingClassesTable schedules={upcomingSchedules} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  change,
  tone,
  title,
  trend,
  value,
}: {
  change: string;
  icon: LucideIcon;
  tone: string;
  title: string;
  trend: string;
  value: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card className="gap-3 py-5">
      <CardHeader className="px-5 pt-0 pb-0">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium tracking-wide uppercase">
            {title}
          </CardDescription>
          <div className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
            <Icon className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pt-0">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-1">
          <TrendIcon
            className={`size-3 ${trend === "up" ? "text-success" : "text-destructive"}`}
          />
          <span className="text-xs text-muted-foreground">{change}</span>
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
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-9 text-xs font-medium">Time</TableHead>
            <TableHead className="h-9 text-xs font-medium">Batch</TableHead>
            <TableHead className="h-9 text-xs font-medium">Subject</TableHead>
            <TableHead className="h-9 text-xs font-medium">Teacher</TableHead>
            <TableHead className="h-9 text-xs font-medium">Room</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="py-3">
                {weekday(schedule.weekday)} {formatTime(schedule.start_time)}
              </TableCell>
              <TableCell className="py-3">{schedule.batch?.name ?? "-"}</TableCell>
              <TableCell className="py-3">{schedule.subject ?? "-"}</TableCell>
              <TableCell className="py-3">{schedule.teacher?.name ?? "-"}</TableCell>
              <TableCell className="py-3">{schedule.room_name || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
