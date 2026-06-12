import { PageHeader } from "@/components/app/page-header"
import { FeeLedgerFilters } from "@/components/fees/fee-ledger-filters"
import { FeeLedgersTable } from "@/components/fees/fee-ledgers-table"
import { FeeMonthControls } from "@/components/fees/fee-month-controls"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { requireAdminContext } from "@/lib/auth/user"
import { listBatches } from "@/lib/data/batches"
import {
  countOverdueStudentLedgers,
  getBillingSettings,
  ledgerBillingWindow,
  listStudentLedgers,
  monthStart,
  type StudentLedgerFilters,
} from "@/lib/data/fees"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const ledgersPerPage = 15

type FeesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function FeesPage({ searchParams }: FeesPageProps) {
  const admin = await requireAdminContext()
  const params = await searchParams
  const month = monthStart(stringParam(params.month))
  const page = pageParam(params.page)
  const filters = {
    batchId: stringParam(params.batch),
    search: stringParam(params.q),
    status: statusParam(params.status),
  }
  const [billingSettings, ledgers, monthLedgers, overdueCount, batches] = await Promise.all([
    getBillingSettings(admin.tenantId),
    listStudentLedgers(admin.tenantId, month, filters),
    listStudentLedgers(admin.tenantId, month, {}),
    countOverdueStudentLedgers(admin.tenantId, month),
    listBatches(admin.tenantId, { status: "active" }),
  ])
  const window = ledgerBillingWindow(month, billingSettings)
  const totalPages = Math.max(Math.ceil(ledgers.length / ledgersPerPage), 1)
  const currentPage = Math.min(page, totalPages)
  const visibleLedgers = ledgers.slice(
    (currentPage - 1) * ledgersPerPage,
    currentPage * ledgersPerPage
  )
  const totalExpected = monthLedgers.reduce(
    (sum, ledger) => sum + Number(ledger.expected_amount),
    0
  )
  const totalPaid = monthLedgers.reduce(
    (sum, ledger) => sum + Number(ledger.paid_amount),
    0
  )
  const totalDue = monthLedgers.reduce(
    (sum, ledger) => sum + Number(ledger.due_amount),
    0
  )
  const studentsDue = monthLedgers.filter(
    (ledger) => Number(ledger.due_amount) > 0
  ).length

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          badge={`${overdueCount} overdue`}
          description="Monthly fee ledger"
          title="Student Fees"
        />
        <div className="shrink-0">
          <FeeMonthControls
            graceEndDate={window.grace_end_date}
            month={month}
            paymentStartDate={window.payment_start_date}
          />
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Expected" value={formatTaka(totalExpected)} />
        <SummaryCard
          className="text-success"
          label="Collected"
          value={formatTaka(totalPaid)}
        />
        <SummaryCard
          className="text-destructive"
          label="Due"
          value={formatTaka(totalDue)}
        />
        <SummaryCard
          className="text-warning-foreground"
          label="Students Due"
          value={studentsDue.toLocaleString("en-BD")}
        />
      </section>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <FeeLedgerFilters
            batches={batches}
            filters={filters}
            month={month.slice(0, 7)}
          />
        </CardHeader>
        <CardContent className="p-0">
          {visibleLedgers.length ? (
            <>
              <FeeLedgersTable ledgers={visibleLedgers} />
              <FeeLedgersPagination
                currentPage={currentPage}
                pageSize={ledgersPerPage}
                params={params}
                totalCount={ledgers.length}
                totalPages={totalPages}
              />
            </>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No ledger rows for this month</EmptyTitle>
                <EmptyDescription>
                  Prepare the month to calculate expected fees from active
                  student batch assignments.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({
  className,
  label,
  value,
}: {
  className?: string
  label: string
  value: string
}) {
  return (
    <Card className="gap-2 py-4">
      <CardContent className="px-4 pt-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-xl font-bold tracking-tight ${className ?? ""}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function pageParam(value: string | string[] | undefined) {
  const page = Number(stringParam(value) ?? 1)

  return Number.isInteger(page) && page > 0 ? page : 1
}

function statusParam(
  value: string | string[] | undefined
): NonNullable<StudentLedgerFilters["status"]> {
  const status = stringParam(value)
  const statuses = new Set<NonNullable<StudentLedgerFilters["status"]>>([
    "all",
    "attention",
    "due",
    "not_started",
    "overdue",
    "overdue_due",
    "paid",
    "partial",
    "waived",
  ])

  if (status === "attention") {
    return "overdue_due"
  }

  return status && statuses.has(status as NonNullable<StudentLedgerFilters["status"]>)
    ? (status as NonNullable<StudentLedgerFilters["status"]>)
    : "all"
}

function FeeLedgersPagination({
  currentPage,
  pageSize,
  params,
  totalCount,
  totalPages,
}: {
  currentPage: number
  pageSize: number
  params: Record<string, string | string[] | undefined>
  totalCount: number
  totalPages: number
}) {
  const firstRecord = (currentPage - 1) * pageSize + 1
  const lastRecord = Math.min(currentPage * pageSize, totalCount)
  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Showing {firstRecord}-{lastRecord} of {totalCount}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {currentPage > 1 ? (
          <Button
            render={<Link href={pageHref(params, currentPage - 1)} />}
            size="icon-sm"
            variant="outline"
          >
            <ChevronLeftIcon className="size-3.5" />
            <span className="sr-only">Previous</span>
          </Button>
        ) : (
          <Button disabled size="icon-sm" variant="outline">
            <ChevronLeftIcon className="size-3.5" />
            <span className="sr-only">Previous</span>
          </Button>
        )}
        {visiblePages.map((pageNumber, index) =>
          pageNumber === "ellipsis" ? (
            <span
              className="flex h-8 items-center px-1.5 text-sm text-muted-foreground"
              key={`ellipsis-${index}`}
            >
              ...
            </span>
          ) : (
            <Button
              aria-current={pageNumber === currentPage ? "page" : undefined}
              className="size-7 text-xs"
              key={pageNumber}
              render={<Link href={pageHref(params, pageNumber)} />}
              size="icon-sm"
              variant={pageNumber === currentPage ? "default" : "outline"}
            >
              {pageNumber}
            </Button>
          )
        )}
        {currentPage < totalPages ? (
          <Button
            render={<Link href={pageHref(params, currentPage + 1)} />}
            size="icon-sm"
            variant="outline"
          >
            <ChevronRightIcon className="size-3.5" />
            <span className="sr-only">Next</span>
          </Button>
        ) : (
          <Button disabled size="icon-sm" variant="outline">
            <ChevronRightIcon className="size-3.5" />
            <span className="sr-only">Next</span>
          </Button>
        )}
      </div>
    </div>
  )
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: Array<number | "ellipsis"> = [1]
  const start = Math.max(currentPage - 1, 2)
  const end = Math.min(currentPage + 1, totalPages - 1)

  if (start > 2) {
    pages.push("ellipsis")
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis")
  }

  pages.push(totalPages)

  return pages
}

function pageHref(
  params: Record<string, string | string[] | undefined>,
  page: number
) {
  const nextParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (key === "page") {
      continue
    }

    if (typeof value === "string" && value.trim()) {
      nextParams.set(key, value)
    }
  }

  nextParams.set("page", String(page))

  return `/fees?${nextParams.toString()}`
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
