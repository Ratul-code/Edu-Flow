import { PageHeader } from "@/components/app/page-header"
import { SalaryLedgerFilters } from "@/components/salaries/salary-ledger-filters"
import { SalaryLedgersTable } from "@/components/salaries/salary-ledgers-table"
import { SalaryMonthControls } from "@/components/salaries/salary-month-controls"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { requireAdminContext } from "@/lib/auth/user"
import { monthStart } from "@/lib/data/fees"
import {
  ensureTeacherSalaryLedgers,
  listTeacherSalaryLedgers,
  type SalaryLedgerStatus,
} from "@/lib/data/salaries"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const ledgersPerPage = 15

type SalariesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SalariesPage({
  searchParams,
}: SalariesPageProps) {
  const admin = await requireAdminContext()
  const params = await searchParams
  const month = monthStart(stringParam(params.month))
  const page = pageParam(params.page)
  const filters = {
    search: stringParam(params.q),
    status: salaryStatusParam(params.status),
  }
  const preparation = await ensureTeacherSalaryLedgers(admin.tenantId, month)
  const ledgers = await listTeacherSalaryLedgers(admin.tenantId, month)
  const filteredLedgers = filterSalaryLedgers(ledgers, filters)
  const totalPages = Math.max(Math.ceil(filteredLedgers.length / ledgersPerPage), 1)
  const currentPage = Math.min(page, totalPages)
  const visibleLedgers = filteredLedgers.slice(
    (currentPage - 1) * ledgersPerPage,
    currentPage * ledgersPerPage
  )
  const totalPayroll = ledgers.reduce(
    (sum, ledger) => sum + Number(ledger.expected_salary),
    0
  )
  const totalPaid = ledgers.reduce(
    (sum, ledger) => sum + Number(ledger.paid_amount),
    0
  )
  const totalDue = ledgers.reduce(
    (sum, ledger) => sum + Number(ledger.due_amount),
    0
  )
  const teachersDue = ledgers.filter((ledger) => Number(ledger.due_amount) > 0)
    .length

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <PageHeader
          description="Monthly salary ledger"
          title="Teacher Salaries"
        />
        <div className="shrink-0">
          <SalaryMonthControls month={month} />
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Payroll" value={formatTaka(totalPayroll)} />
        <SummaryCard
          className="text-success"
          label="Paid"
          value={formatTaka(totalPaid)}
        />
        <SummaryCard
          className="text-destructive"
          label="Pending"
          value={formatTaka(totalDue)}
        />
        <SummaryCard
          className="text-warning-foreground"
          label="Teachers Due"
          value={teachersDue.toLocaleString("en-BD")}
        />
      </section>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <SalaryLedgerFilters filters={filters} month={month.slice(0, 7)} />
        </CardHeader>
        <CardContent className="p-0">
          {visibleLedgers.length ? (
            <>
              <SalaryLedgersTable ledgers={visibleLedgers} />
              <SalaryLedgersPagination
                currentPage={currentPage}
                pageSize={ledgersPerPage}
                params={params}
                totalCount={filteredLedgers.length}
                totalPages={totalPages}
              />
            </>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No salary rows for this month</EmptyTitle>
                <EmptyDescription>
                  {preparation.opened
                    ? "There are no active teachers to prepare for this month."
                    : `This ${preparation.payment_system} salary window opens on ${formatDate(
                        preparation.payment_start_date
                      )}.`}
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

type SalaryStatusFilter = SalaryLedgerStatus | "all"

function salaryStatusParam(value: string | string[] | undefined): SalaryStatusFilter {
  const status = stringParam(value)

  return status === "unpaid" ||
    status === "partial" ||
    status === "paid" ||
    status === "waived"
    ? status
    : "all"
}

function filterSalaryLedgers(
  ledgers: Awaited<ReturnType<typeof listTeacherSalaryLedgers>>,
  filters: {
    search?: string
    status: SalaryStatusFilter
  }
) {
  const search = filters.search?.trim().toLowerCase()

  return ledgers.filter((ledger) => {
    if (filters.status !== "all" && ledger.status !== filters.status) {
      return false
    }

    if (!search) {
      return true
    }

    const searchable = [
      ledger.teacher?.name ?? "",
      ledger.teacher?.phone ?? "",
      ledger.teacher?.subject_specialty ?? "",
    ]
      .join(" ")
      .toLowerCase()

    return searchable.includes(search)
  })
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}

function SalaryLedgersPagination({
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
        <Button
          disabled={currentPage <= 1}
          render={
            currentPage > 1 ? <Link href={pageHref(params, currentPage - 1)} /> : undefined
          }
          size="icon-sm"
          variant="outline"
        >
          <ChevronLeftIcon className="size-3.5" />
          <span className="sr-only">Previous</span>
        </Button>
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
        <Button
          disabled={currentPage >= totalPages}
          render={
            currentPage < totalPages
              ? <Link href={pageHref(params, currentPage + 1)} />
              : undefined
          }
          size="icon-sm"
          variant="outline"
        >
          <ChevronRightIcon className="size-3.5" />
          <span className="sr-only">Next</span>
        </Button>
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

  if (start > 2) pages.push("ellipsis")
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < totalPages - 1) pages.push("ellipsis")
  pages.push(totalPages)
  return pages
}

function pageHref(
  params: Record<string, string | string[] | undefined>,
  page: number
) {
  const nextParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue
    if (typeof value === "string" && value.trim()) nextParams.set(key, value)
  }

  nextParams.set("page", String(page))
  return `/salaries?${nextParams.toString()}`
}
