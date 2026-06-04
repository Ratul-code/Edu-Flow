import { ReceiptTextIcon } from "lucide-react"
import Link from "next/link"

import type { StudentLedgerRecord } from "@/lib/data/fees"
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
          <TableHead>Student</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Expected</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ledgers.map((ledger) => (
          <TableRow key={ledger.id}>
            <TableCell className="font-medium">
              {ledger.student?.name ?? "Unknown student"}
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
              <StatusBadge status={ledger.status} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                {Number(ledger.due_amount) > 0 ? (
                  <Button
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
