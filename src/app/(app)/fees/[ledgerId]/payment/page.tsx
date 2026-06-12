import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  ReceiptIcon,
  SmartphoneIcon,
} from "lucide-react"

import { StatusBadge } from "@/components/app/status-badge"
import { StudentPaymentReceiptDialog } from "@/components/receipts/student-payment-receipt-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { recordStudentPayment } from "@/lib/actions/fees"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getStudentLedgerById,
  listStudentPayments,
  type StudentPaymentRecord,
} from "@/lib/data/fees"
import { feeStatusLabel } from "@/lib/fee-status"

type PaymentPageProps = {
  params: Promise<{ ledgerId: string }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const admin = await requireAdminContext()
  const { ledgerId } = await params
  const [ledger, payments] = await Promise.all([
    getStudentLedgerById(admin.tenantId, ledgerId),
    listStudentPayments(admin.tenantId, ledgerId),
  ])

  if (!ledger) {
    notFound()
  }

  const studentName = ledger.student?.name ?? "Student ledger"
  const studentPhone = ledger.student?.phone
  const monthLabel = formatMonth(ledger.ledger_month)
  const batchLabel = ledger.student?.class_level ?? "-"
  const recentPayments = payments.slice(0, 3)

  return (
    <div className="space-y-5 p-6">
      <div>
        <Button
          className="-ml-2 mb-3 gap-1.5 text-muted-foreground"
          render={<Link href={`/fees?month=${ledger.ledger_month.slice(0, 7)}`} />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Fees
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Record Payment
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Record a fee payment for a student
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <CardTitle className="text-sm font-semibold">
                Ledger Summary
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {monthLabel} — {batchLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                    {initials(studentName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{studentName}</div>
                  <div className="text-sm text-muted-foreground">
                    {[studentPhone, batchLabel].filter(Boolean).join(" · ") ||
                      "-"}
                  </div>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={feeStatusLabel(ledger.status)} />
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-4">
                <AmountBlock
                  label="Expected"
                  value={formatTaka(ledger.expected_amount)}
                />
                <AmountBlock
                  className="text-success"
                  label="Previously Paid"
                  value={formatTaka(ledger.paid_amount)}
                />
                <AmountBlock
                  className="text-destructive"
                  label="Due Amount"
                  value={formatTaka(ledger.due_amount)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <CardTitle className="text-sm font-semibold">
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pt-2">
              <form action={recordStudentPayment.bind(null, ledger.id)}>
                <input name="payment_action" type="hidden" value="payment" />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium" htmlFor="amount">
                        Amount (৳)
                      </Label>
                      <Input
                        className="h-9"
                        defaultValue={String(ledger.due_amount)}
                        id="amount"
                        max={String(ledger.due_amount)}
                        min="0.01"
                        name="amount"
                        required
                        step="0.01"
                        type="number"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        className="text-xs font-medium"
                        htmlFor="payment_date"
                      >
                        Payment Date
                      </Label>
                      <Input
                        className="h-9"
                        defaultValue={new Date().toISOString().slice(0, 10)}
                        id="payment_date"
                        name="payment_date"
                        type="date"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium" htmlFor="method">
                      Payment Method
                    </Label>
                    <Select defaultValue="cash" name="method">
                      <SelectTrigger className="h-9 w-full" id="method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="start">
                        <SelectGroup>
                          <SelectItem value="cash">
                            <span className="flex items-center gap-2">
                              <BanknoteIcon className="size-3.5" />
                              Cash
                            </span>
                          </SelectItem>
                          <SelectItem value="bkash">
                            <span className="flex items-center gap-2">
                              <SmartphoneIcon className="size-3.5" />
                              bKash
                            </span>
                          </SelectItem>
                          <SelectItem value="nagad">
                            <span className="flex items-center gap-2">
                              <SmartphoneIcon className="size-3.5" />
                              Nagad
                            </span>
                          </SelectItem>
                          <SelectItem value="bank">
                            <span className="flex items-center gap-2">
                              <CreditCardIcon className="size-3.5" />
                              Bank Transfer
                            </span>
                          </SelectItem>
                          <SelectItem value="card">
                            <span className="flex items-center gap-2">
                              <CreditCardIcon className="size-3.5" />
                              Card
                            </span>
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium" htmlFor="reference">
                      Transaction Reference (optional)
                    </Label>
                    <Input
                      className="h-9"
                      id="reference"
                      name="note"
                      placeholder="e.g. bKash TXN ID"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium" htmlFor="note">
                      Notes (optional)
                    </Label>
                    <Textarea
                      className="min-h-[80px] resize-none text-sm"
                      id="note"
                      name="note_extra"
                      placeholder="Add any notes about this payment..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 gap-1.5" type="submit">
                      <CheckCircle2Icon className="size-4" />
                      Record Payment
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <CardTitle className="text-sm font-semibold">
                Recent Payments
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Last 3 transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pt-2">
              {recentPayments.length ? (
                recentPayments.map((payment) => (
                  <RecentPayment key={payment.id} payment={payment} />
                ))
              ) : (
                <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                  No payments recorded yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="gap-4 border-dashed py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                <ReceiptIcon className="size-3.5" />
                Receipt Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-xs">
                <div className="text-center text-sm font-bold">Edu Flow</div>
                <div className="text-center text-muted-foreground">
                  Fee Receipt
                </div>
                <Separator />
                <ReceiptLine label="Student" value={studentName} />
                <ReceiptLine label="Month" value={monthLabel} />
                <ReceiptLine label="Batch" value={batchLabel} />
                <ReceiptLine label="Method" value="Selected method" />
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Amount Paid</span>
                  <span>{formatTaka(ledger.due_amount)}</span>
                </div>
                <div className="pt-1 text-center text-muted-foreground">
                  Thank you!
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AmountBlock({
  className,
  label,
  value,
}: {
  className?: string
  label: string
  value: string
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${className ?? ""}`}>{value}</div>
    </div>
  )
}

function RecentPayment({ payment }: { payment: StudentPaymentRecord }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-2.5">
      <div>
        <div className="text-sm font-medium">{formatTaka(payment.amount)}</div>
        <div className="text-xs text-muted-foreground">
          {formatDate(payment.payment_date)} · {paymentMethodLabel(payment.method)}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {payment.receipt_number || payment.receipt_no || "-"}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
          Paid
        </span>
        <StudentPaymentReceiptDialog paymentId={payment.id} />
      </div>
    </div>
  )
}

function ReceiptLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST"
  )
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}

function paymentMethodLabel(value: string) {
  const labels: Record<string, string> = {
    bank: "Bank",
    bkash: "bKash",
    card: "Card",
    cash: "Cash",
    nagad: "Nagad",
    other: "Other",
  }

  return labels[value] ?? value
}
