import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/page-header"
import { SalaryPaymentForm } from "@/components/salaries/salary-payment-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { recordTeacherSalaryPayment } from "@/lib/actions/salaries"
import { requireAdminContext } from "@/lib/auth/user"
import { getTeacherSalaryLedgerById } from "@/lib/data/salaries"

type SalaryPaymentPageProps = {
  params: Promise<{ ledgerId: string }>
}

export default async function SalaryPaymentPage({
  params,
}: SalaryPaymentPageProps) {
  const admin = await requireAdminContext()
  const { ledgerId } = await params
  const ledger = await getTeacherSalaryLedgerById(admin.tenantId, ledgerId)

  if (!ledger) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Record a teacher salary payment against the selected monthly ledger."
        title="Record salary payment"
      />
      <Card>
        <CardHeader>
          <CardTitle>{ledger.teacher?.name ?? "Teacher salary"}</CardTitle>
          <CardDescription>
            Month {ledger.ledger_month.slice(0, 7)}. Due amount{" "}
            {formatTaka(ledger.due_amount)}.
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
      <SalaryPaymentForm
        action={recordTeacherSalaryPayment.bind(null, ledger.id)}
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
