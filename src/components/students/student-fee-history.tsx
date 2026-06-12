import { CreditCardIcon } from "lucide-react"
import Link from "next/link"
import { Fragment } from "react"

import { StatusBadge } from "@/components/app/status-badge"
import { StudentPaymentReceiptDialog } from "@/components/receipts/student-payment-receipt-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { feeStatusLabel } from "@/lib/fee-status"
import type { StudentFeeHistory as StudentFeeHistoryData } from "@/lib/data/fees"

type StudentFeeHistoryProps = {
  batchLabel: string
  firstDueLedgerId: string | null
  history: StudentFeeHistoryData
  totalDue: number
  totalPaid: number
}

export function StudentFeeHistory({
  batchLabel,
  firstDueLedgerId,
  history,
  totalDue,
  totalPaid,
}: StudentFeeHistoryProps) {
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5 pt-0 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Fee History</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Total paid:{" "}
              <span className="font-medium text-success">
                {formatTaka(totalPaid)}
              </span>{" "}
              · Outstanding:{" "}
              <span className="font-medium text-destructive">
                {formatTaka(totalDue)}
              </span>
            </CardDescription>
          </div>
          {firstDueLedgerId ? (
            <Button
              className="text-xs"
              render={<Link href={`/fees/${firstDueLedgerId}/payment`} />}
              size="sm"
              variant="ghost"
            >
              Record Payment
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="px-5 pt-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 text-xs font-medium">Month</TableHead>
              <TableHead className="h-8 text-xs font-medium">Batch</TableHead>
              <TableHead className="h-8 text-right text-xs font-medium">
                Expected
              </TableHead>
              <TableHead className="h-8 text-right text-xs font-medium">
                Paid
              </TableHead>
              <TableHead className="h-8 text-right text-xs font-medium">
                Due
              </TableHead>
              <TableHead className="h-8 text-xs font-medium">Status</TableHead>
              <TableHead className="h-8 w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.months.map((month) => {
              const hasDue = month.ledger_id && Number(month.due_amount) > 0
              const payments = [...month.payments].sort(comparePaymentsNewestFirst)

              return (
                <Fragment key={month.ledger_month}>
                  {hasDue ? (
                    <TableRow>
                      <TableCell className="py-2.5 text-sm font-medium">
                        {formatMonth(month.ledger_month)}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground">
                        {batchLabel || "-"}
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm">
                        {formatTaka(month.expected_amount)}
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm font-medium text-success">
                        {formatTaka(month.paid_amount)}
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm font-medium text-destructive">
                        {formatTaka(month.due_amount)}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <StatusBadge status={feeStatusLabel(month.status)} />
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex justify-end">
                          <Button
                            className="gap-1 cursor-pointer"
                            render={
                              <Link href={`/fees/${month.ledger_id}/payment`} />
                            }
                            size="xs"
                            variant="outline"
                          >
                            <CreditCardIcon
                              className="size-3"
                              data-icon="inline-start"
                            />
                            Pay
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {payments.map((payment, paymentIndex) => (
                  <TableRow
                    className="bg-muted/30"
                    key={`${month.ledger_month}-${payment.id}`}
                  >
                    <TableCell className="py-2.5">
                      <span className="block text-sm font-medium">
                        Payment {payments.length - paymentIndex}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatDate(payment.payment_date)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground">
                      {batchLabel || "-"}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm">
                      {formatTaka(month.expected_amount)}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm font-medium text-success">
                      {formatTaka(payment.amount)}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm font-medium text-destructive">
                      {formatTaka(payment.due_amount_after_payment)}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <StatusBadge status={payment.status_after_payment} />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex justify-end">
                        <StudentPaymentReceiptDialog paymentId={payment.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                  ))}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function comparePaymentsNewestFirst(
  left: { created_at?: string; id: string; payment_date: string },
  right: { created_at?: string; id: string; payment_date: string }
) {
  const createdDiff = (right.created_at ?? "").localeCompare(left.created_at ?? "")

  if (createdDiff !== 0) {
    return createdDiff
  }

  const dateDiff = right.payment_date.localeCompare(left.payment_date)

  if (dateDiff !== 0) {
    return dateDiff
  }

  return right.id.localeCompare(left.id)
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
