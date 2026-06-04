import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/page-header"
import { SalaryLedgerForm } from "@/components/salaries/salary-ledger-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { updateTeacherSalaryLedger } from "@/lib/actions/salaries"
import { requireAdminContext } from "@/lib/auth/user"
import { getTeacherSalaryLedgerById } from "@/lib/data/salaries"

type SalaryEditPageProps = {
  params: Promise<{ ledgerId: string }>
}

export default async function SalaryEditPage({ params }: SalaryEditPageProps) {
  const admin = await requireAdminContext()
  const { ledgerId } = await params
  const ledger = await getTeacherSalaryLedgerById(admin.tenantId, ledgerId)

  if (!ledger) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Adjust the expected teacher salary for this month."
        title="Edit salary ledger"
      />
      <Card>
        <CardHeader>
          <CardTitle>{ledger.teacher?.name ?? "Teacher salary"}</CardTitle>
          <CardDescription>
            Month {ledger.ledger_month.slice(0, 7)}. Paid amount{" "}
            {formatTaka(ledger.paid_amount)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <DetailItem label="Expected" value={formatTaka(ledger.expected_salary)} />
          <DetailItem
            label="Adjustment"
            value={formatTaka(ledger.adjustment_amount)}
          />
          <DetailItem label="Paid" value={formatTaka(ledger.paid_amount)} />
          <DetailItem label="Due" value={formatTaka(ledger.due_amount)} />
        </CardContent>
      </Card>
      <SalaryLedgerForm
        action={updateTeacherSalaryLedger.bind(null, ledger.id)}
        ledger={ledger}
      />
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
