import { PencilIcon, ReceiptTextIcon } from "lucide-react"
import Link from "next/link"

import type { TeacherSalaryLedgerRecord } from "@/lib/data/salaries"
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

type SalaryLedgersTableProps = {
  ledgers: TeacherSalaryLedgerRecord[]
}

export function SalaryLedgersTable({ ledgers }: SalaryLedgersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Teacher</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Expected</TableHead>
          <TableHead>Adjustment</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ledgers.map((ledger) => (
          <TableRow key={ledger.id}>
            <TableCell className="font-medium">
              {ledger.teacher?.name ?? "Unknown teacher"}
              {ledger.teacher?.phone ? (
                <span className="block text-xs font-normal text-muted-foreground">
                  {ledger.teacher.phone}
                </span>
              ) : null}
            </TableCell>
            <TableCell>{ledger.teacher?.subject_specialty ?? "-"}</TableCell>
            <TableCell>{formatTaka(ledger.expected_salary)}</TableCell>
            <TableCell>{formatTaka(ledger.adjustment_amount)}</TableCell>
            <TableCell>{formatTaka(ledger.paid_amount)}</TableCell>
            <TableCell>{formatTaka(ledger.due_amount)}</TableCell>
            <TableCell>
              <StatusBadge status={ledger.status} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  render={<Link href={`/salaries/${ledger.id}/edit`} />}
                  size="sm"
                  variant="ghost"
                >
                  <PencilIcon data-icon="inline-start" />
                  Edit
                </Button>
                {Number(ledger.due_amount) > 0 ? (
                  <Button
                    render={<Link href={`/salaries/${ledger.id}/payment`} />}
                    size="sm"
                    variant="outline"
                  >
                    <ReceiptTextIcon data-icon="inline-start" />
                    Pay
                  </Button>
                ) : null}
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
