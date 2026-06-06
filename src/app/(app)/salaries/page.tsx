import { PageHeader } from "@/components/app/page-header"
import { SalaryLedgersTable } from "@/components/salaries/salary-ledgers-table"
import { SalaryMonthControls } from "@/components/salaries/salary-month-controls"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { requireAdminContext } from "@/lib/auth/user"
import { monthStart } from "@/lib/data/fees"
import {
  ensureTeacherSalaryLedgers,
  listTeacherSalaryLedgers,
} from "@/lib/data/salaries"

type SalariesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SalariesPage({
  searchParams,
}: SalariesPageProps) {
  const admin = await requireAdminContext()
  const params = await searchParams
  const month = monthStart(stringParam(params.month))
  const preparation = await ensureTeacherSalaryLedgers(admin.tenantId, month)
  const ledgers = await listTeacherSalaryLedgers(admin.tenantId, month)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={`${ledgers.length} ledgers`}
        description="Track monthly teacher salary dues and record payments."
        title="Salaries"
      />
      <Card>
        <CardHeader>
          <CardTitle>Monthly salary ledger</CardTitle>
          <CardDescription>
            Expected salary defaults from active teacher profiles for{" "}
            {admin.tenantName}. Missing rows open automatically from the teacher
            payment system.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SalaryMonthControls month={month} />
          {ledgers.length ? (
            <SalaryLedgersTable ledgers={ledgers} />
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

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}
