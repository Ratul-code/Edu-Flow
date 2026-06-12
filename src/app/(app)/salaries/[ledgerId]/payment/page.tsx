import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  SmartphoneIcon,
} from "lucide-react"

import { StatusBadge } from "@/components/app/status-badge"
import { SalaryPaymentReceiptDialog } from "@/components/salaries/salary-payment-receipt-dialog"
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
import { recordTeacherSalaryPayment } from "@/lib/actions/salaries"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getTeacherSalaryLedgerById,
  listTeacherSalaryPayments,
  type TeacherSalaryPaymentRecord,
} from "@/lib/data/salaries"

type SalaryPaymentPageProps = {
  params: Promise<{ ledgerId: string }>
}

export default async function SalaryPaymentPage({
  params,
}: SalaryPaymentPageProps) {
  const admin = await requireAdminContext()
  const { ledgerId } = await params
  const [ledger, payments] = await Promise.all([
    getTeacherSalaryLedgerById(admin.tenantId, ledgerId),
    listTeacherSalaryPayments(admin.tenantId, ledgerId),
  ])

  if (!ledger) {
    notFound()
  }

  const teacherName = ledger.teacher?.name ?? "Teacher salary"
  const monthLabel = formatMonth(ledger.ledger_month)
  const recentPayments = payments.slice(0, 3)

  return (
    <div className="space-y-5 p-6">
      <div>
        <Button
          className="-ml-2 mb-3 gap-1.5 text-muted-foreground"
          render={<Link href={`/salaries?month=${ledger.ledger_month.slice(0, 7)}`} />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Salaries
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Record Salary Payment
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Record a salary disbursement for a teacher
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <CardTitle className="text-sm font-semibold">
                Salary Summary
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {monthLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="mb-4 flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                    {initials(teacherName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{teacherName}</div>
                  <div className="text-sm text-muted-foreground">
                    {[ledger.teacher?.phone, ledger.teacher?.subject_specialty]
                      .filter(Boolean)
                      .join(" · ") || "-"}
                  </div>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={salaryStatusLabel(ledger.status)} />
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-4">
                <AmountBlock
                  label="Expected"
                  value={formatTaka(ledger.expected_salary)}
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
              <form action={recordTeacherSalaryPayment.bind(null, ledger.id)}>
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
                      Reference / Transaction ID
                    </Label>
                    <Input
                      className="h-9"
                      id="reference"
                      name="note"
                      placeholder="Bank ref / cheque number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium" htmlFor="note">
                      Notes
                    </Label>
                    <Textarea
                      className="min-h-[70px] resize-none text-sm"
                      id="note"
                      name="note_extra"
                      placeholder="Optional notes..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 gap-1.5" type="submit">
                      <CheckCircle2Icon className="size-4" />
                      Record Salary Payment
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pt-0 pb-0">
              <CardTitle className="text-sm font-semibold">
                Payment History
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Last 3 salary payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pt-2">
              {recentPayments.length ? (
                recentPayments.map((payment) => (
                  <RecentPayment key={payment.id} payment={payment} />
                ))
              ) : (
                <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                  No salary payments recorded yet.
                </p>
              )}
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

function RecentPayment({ payment }: { payment: TeacherSalaryPaymentRecord }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-2.5">
      <div>
        <div className="text-sm font-medium">{formatTaka(payment.amount)}</div>
        <div className="text-xs text-muted-foreground">
          {formatDate(payment.payment_date)} · {paymentMethodLabel(payment.method)}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {payment.receipt_number || "-"}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
          Paid
        </span>
        <SalaryPaymentReceiptDialog paymentId={payment.id} />
      </div>
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
      .join("") || "TC"
  )
}

function salaryStatusLabel(status: string) {
  const labels: Record<string, string> = {
    partial: "Partial",
    paid: "Paid",
    unpaid: "Due",
    waived: "Waived",
  }

  return labels[status] ?? status
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
    bank: "Bank Transfer",
    bkash: "bKash",
    card: "Card",
    cash: "Cash",
    nagad: "Nagad",
    other: "Other",
  }

  return labels[value] ?? value
}
