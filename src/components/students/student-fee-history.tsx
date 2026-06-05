import { ReceiptTextIcon } from "lucide-react"
import Link from "next/link"

import { StatusBadge } from "@/components/app/status-badge"
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
  history: StudentFeeHistoryData
}

export function StudentFeeHistory({ history }: StudentFeeHistoryProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Monthly fee records</CardTitle>
        <CardDescription>
          Month-by-month payment status from admission through the current month.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryTile
            label="Overdue months"
            value={history.summary.overdueMonths}
            tone="danger"
          />
          <SummaryTile
            label="Paid months"
            value={history.summary.paidMonths}
            tone="success"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.months.map((month, index) => (
              <TableRow key={month.ledger_month}>
                <TableCell className="text-center text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  {formatMonth(month.ledger_month)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={feeStatusLabel(month.status)} />
                </TableCell>
                <TableCell>{formatTaka(month.expected_amount)}</TableCell>
                <TableCell>{formatTaka(month.paid_amount)}</TableCell>
                <TableCell>{formatTaka(month.due_amount)}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    {month.ledger_id && Number(month.due_amount) > 0 ? (
                      <Button
                        className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                        render={
                          <Link href={`/fees/${month.ledger_id}/payment`} />
                        }
                        size="sm"
                        variant="outline"
                      >
                        <ReceiptTextIcon data-icon="inline-start" />
                        Record payment
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function SummaryTile({
  label,
  tone,
  value,
}: {
  label: string
  tone: "danger" | "success"
  value: number
}) {
  const className =
    tone === "danger"
      ? "border-red-100 bg-red-50 text-red-700"
      : "border-emerald-100 bg-emerald-50 text-emerald-700"

  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
