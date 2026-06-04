import { PageHeader } from "@/components/app/page-header"
import { FeeLedgersTable } from "@/components/fees/fee-ledgers-table"
import { FeeMonthControls } from "@/components/fees/fee-month-controls"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { requireAdminContext } from "@/lib/auth/user"
import { listStudentLedgers, monthStart } from "@/lib/data/fees"

type FeesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function FeesPage({ searchParams }: FeesPageProps) {
  const admin = await requireAdminContext()
  const params = await searchParams
  const month = monthStart(stringParam(params.month))
  const ledgers = await listStudentLedgers(admin.tenantId, month)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={`${ledgers.length} ledgers`}
        description="Generate monthly student ledgers, inspect dues, and record payments."
        title="Fees"
      />
      <Card>
        <CardHeader>
          <CardTitle>Monthly ledger</CardTitle>
          <CardDescription>
            Ledger generation is idempotent and recalculates active student batch
            fees for {admin.tenantName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FeeMonthControls month={month} />
          {ledgers.length ? (
            <FeeLedgersTable ledgers={ledgers} />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No ledger rows for this month</EmptyTitle>
                <EmptyDescription>
                  Generate the ledger to calculate expected fees from active
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

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}
