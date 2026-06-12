import { BanknoteIcon } from "lucide-react"
import Link from "next/link"

import { SalaryPaymentReceiptDialog } from "@/components/salaries/salary-payment-receipt-dialog"
import type { TeacherSalaryLedgerRecord } from "@/lib/data/salaries"
import { StatusBadge } from "@/components/app/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 pl-4 text-xs font-medium">Teacher</TableHead>
          <TableHead className="h-9 text-right text-xs font-medium">Expected Salary</TableHead>
          <TableHead className="h-9 text-right text-xs font-medium">Paid</TableHead>
          <TableHead className="h-9 text-right text-xs font-medium">Due</TableHead>
          <TableHead className="h-9 text-xs font-medium">Status</TableHead>
          <TableHead className="h-9 text-right text-xs font-medium">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ledgers.map((ledger) => (
          <TableRow key={ledger.id}>
            <TableCell className="py-3 pl-4">
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-muted text-[10px] font-semibold">
                    {initials(ledger.teacher?.name ?? "Unknown teacher")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {ledger.teacher?.id ? (
                    <Link
                      className="cursor-pointer text-sm font-medium hover:underline"
                      href={`/teachers/${ledger.teacher.id}`}
                    >
                      {ledger.teacher.name}
                    </Link>
                  ) : (
                    <div className="text-sm font-medium">Unknown teacher</div>
                  )}
                  {ledger.teacher?.phone ? (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {ledger.teacher.phone}
                    </div>
                  ) : null}
                </div>
              </div>
            </TableCell>
            <TableCell className="py-3 text-right text-sm">
              {formatTaka(ledger.expected_salary)}
            </TableCell>
            <TableCell className="py-3 text-right text-sm font-medium">
              <Amount tone="paid" value={ledger.paid_amount} />
            </TableCell>
            <TableCell className="py-3 text-right text-sm font-medium">
              <Amount tone="due" value={ledger.due_amount} />
            </TableCell>
            <TableCell className="py-3">
              <StatusBadge status={ledger.status === "unpaid" ? "due" : ledger.status} />
            </TableCell>
            <TableCell className="py-3">
              <div className="flex items-center justify-end gap-1">
                {Number(ledger.due_amount) > 0 ? (
                  <Button
                    className="gap-1 cursor-pointer"
                    render={<Link href={`/salaries/${ledger.id}/payment`} />}
                    size="xs"
                    variant="outline"
                  >
                    <BanknoteIcon className="size-3" data-icon="inline-start" />
                    Pay
                  </Button>
                ) : null}
                {ledger.latest_payment ? (
                  <SalaryPaymentReceiptDialog
                    paymentId={ledger.latest_payment.id}
                    teacherName={ledger.teacher?.name ?? undefined}
                  />
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

function Amount({
  tone,
  value,
}: {
  tone: "due" | "paid"
  value: number | string
}) {
  const amount = Number(value)

  if (amount <= 0) {
    return <span className="font-normal text-muted-foreground">৳0</span>
  }

  return (
    <span className={tone === "paid" ? "text-success" : "text-destructive"}>
      {formatTaka(value)}
    </span>
  )
}

function initials(name: string) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  return letters.toUpperCase() || "TC"
}
