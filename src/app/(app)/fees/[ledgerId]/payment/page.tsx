import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/page-header"
import { PaymentForm } from "@/components/fees/payment-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { recordStudentPayment } from "@/lib/actions/fees"
import { requireAdminContext } from "@/lib/auth/user"
import { getStudentLedgerById } from "@/lib/data/fees"

type PaymentPageProps = {
  params: Promise<{ ledgerId: string }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const admin = await requireAdminContext()
  const { ledgerId } = await params
  const ledger = await getStudentLedgerById(admin.tenantId, ledgerId)

  if (!ledger) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Record a student payment against the selected monthly ledger."
        title="Record payment"
      />
      <Card>
        <CardHeader>
          <CardTitle>{ledger.student?.name ?? "Student ledger"}</CardTitle>
          <CardDescription>
            Month {ledger.ledger_month.slice(0, 7)}. Due amount{" "}
            {formatTaka(ledger.due_amount)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <DetailItem label="Expected" value={formatTaka(ledger.expected_amount)} />
          <DetailItem label="Discount" value={formatTaka(ledger.discount_amount)} />
          <DetailItem label="Paid" value={formatTaka(ledger.paid_amount)} />
          <DetailItem label="Due" value={formatTaka(ledger.due_amount)} />
        </CardContent>
      </Card>
      <PaymentForm
        action={recordStudentPayment.bind(null, ledger.id)}
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
