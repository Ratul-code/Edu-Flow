import { CreditCardIcon } from "lucide-react"
import Link from "next/link"

import type { StudentLedgerRecord } from "@/lib/data/fees"
import { feeStatusLabel } from "@/lib/fee-status"
import { StatusBadge } from "@/components/app/status-badge"
import { StudentPaymentReceiptDialog } from "@/components/receipts/student-payment-receipt-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 pl-4 text-xs font-medium">Student</TableHead>
          <TableHead className="h-9 text-xs font-medium">Batch / Fee Source</TableHead>
          <TableHead className="h-9 text-right text-xs font-medium">Expected</TableHead>
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
                    {initials(ledger.student?.name ?? "Unknown student")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {ledger.student?.id ? (
                    <Link
                      className="cursor-pointer text-sm font-medium leading-none hover:underline"
                      href={`/students/${ledger.student.id}`}
                    >
                      {ledger.student.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium leading-none">
                      Unknown student
                    </span>
                  )}
                  {ledger.student?.phone ? (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {ledger.student.phone}
                    </div>
                  ) : null}
                </div>
              </div>
            </TableCell>
            <TableCell className="py-3 text-xs text-muted-foreground">
              <BatchChips batchNames={ledger.batch_names ?? []} />
            </TableCell>
            <TableCell className="py-3 text-right text-sm">
              {formatTaka(ledger.expected_amount)}
            </TableCell>
            <TableCell className="py-3 text-right text-sm font-medium">
              <Amount
                tone="paid"
                value={ledger.paid_amount}
              />
            </TableCell>
            <TableCell className="py-3 text-right text-sm font-medium">
              <Amount tone="due" value={ledger.due_amount} />
            </TableCell>
            <TableCell className="py-3">
              <StatusBadge status={feeStatusLabel(ledger.status)} />
            </TableCell>
            <TableCell className="py-3">
              <div className="flex items-center justify-end gap-1">
                {Number(ledger.due_amount) > 0 ? (
                  <Button
                    className="gap-1 cursor-pointer"
                    render={<Link href={`/fees/${ledger.id}/payment`} />}
                    size="xs"
                    variant="outline"
                  >
                    <CreditCardIcon className="size-3" data-icon="inline-start" />
                    Pay
                  </Button>
                ) : null}
                {ledger.status === "paid" && ledger.latest_payment ? (
                  <StudentPaymentReceiptDialog
                    paymentId={ledger.latest_payment.id}
                  />
                ) : null}
                {ledger.status === "partial" && ledger.latest_payment ? (
                  <StudentPaymentReceiptDialog
                    paymentId={ledger.latest_payment.id}
                  />
                ) : null}
                {Number(ledger.due_amount) <= 0 && !ledger.latest_payment ? (
                  <span className="text-xs text-muted-foreground">Settled</span>
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

  return letters.toUpperCase() || "ST"
}

function BatchChips({ batchNames }: { batchNames: string[] }) {
  if (!batchNames.length) {
    return <span className="text-sm text-muted-foreground">-</span>
  }

  return (
    <div className="flex max-w-64 flex-wrap gap-1">
      {batchNames.map((name) => (
        <Badge key={name} variant="secondary" className="text-xs font-normal">
          {name}
        </Badge>
      ))}
    </div>
  )
}
