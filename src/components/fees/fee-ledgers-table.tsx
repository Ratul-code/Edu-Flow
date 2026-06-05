import { ReceiptTextIcon } from "lucide-react"
import Link from "next/link"

import type { StudentLedgerRecord } from "@/lib/data/fees"
import { feeStatusLabel } from "@/lib/fee-status"
import { StatusBadge } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type FeeLedgersTableProps = {
  ledgers: StudentLedgerRecord[]
}

export function FeeLedgersTable({ ledgers }: FeeLedgersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-center">#</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Expected</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Payment Window</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ledgers.map((ledger, index) => (
          <TableRow key={ledger.id}>
            <TableCell className="text-center text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell className="font-medium">
              {ledger.student?.id ? (
                <Link
                  className="text-emerald-800 hover:underline"
                  href={`/students/${ledger.student.id}`}
                >
                  {ledger.student.name}
                </Link>
              ) : (
                "Unknown student"
              )}
              {ledger.student?.phone ? (
                <span className="block text-xs font-normal text-muted-foreground">
                  {ledger.student.phone}
                </span>
              ) : null}
            </TableCell>
            <TableCell>{ledger.student?.class_level ?? "-"}</TableCell>
            <TableCell>{formatTaka(ledger.expected_amount)}</TableCell>
            <TableCell>{formatTaka(ledger.discount_amount)}</TableCell>
            <TableCell>{formatTaka(ledger.paid_amount)}</TableCell>
            <TableCell>{formatTaka(ledger.due_amount)}</TableCell>
            <TableCell>
              <span className="block text-sm">
                {formatDate(ledger.payment_start_date)}
              </span>
              <span className="block text-xs text-muted-foreground">
                Grace ends {formatDate(ledger.grace_end_date)}
              </span>
            </TableCell>
            <TableCell>
              <StatusBadge status={feeStatusLabel(ledger.status)} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                {Number(ledger.due_amount) > 0 ? (
                  <Button
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                    render={<Link href={`/fees/${ledger.id}/payment`} />}
                    size="sm"
                    variant="outline"
                  >
                    <ReceiptTextIcon data-icon="inline-start" />
                    Record payment
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">Settled</span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`))
}
