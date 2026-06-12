"use client"

import { DownloadIcon, ReceiptIcon } from "lucide-react"
import { useState } from "react"

import { SalaryPaymentReceipt } from "@/components/salaries/salary-payment-receipt"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { TeacherSalaryReceiptData } from "@/lib/data/salary-receipts"

type SalaryPaymentReceiptDialogProps = {
  paymentId: string
  teacherName?: string
}

export function SalaryPaymentReceiptDialog({
  paymentId,
  teacherName,
}: SalaryPaymentReceiptDialogProps) {
  const [open, setOpen] = useState(false)
  const [receipt, setReceipt] = useState<TeacherSalaryReceiptData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen || receipt || loading) {
      return
    }

    setLoading(true)
    setError(null)
    fetch(`/api/salary-payments/${paymentId}/receipt`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load receipt.")
        }

        return response.json() as Promise<TeacherSalaryReceiptData>
      })
      .then(setReceipt)
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load receipt."
        )
      })
      .finally(() => setLoading(false))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            className="gap-1 cursor-pointer text-muted-foreground"
            size="xs"
            type="button"
            variant="ghost"
          />
        }
      >
        <ReceiptIcon className="size-3" data-icon="inline-start" />
        Receipt
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Salary receipt</DialogTitle>
          <DialogDescription>
            Preview and download the salary receipt
            {teacherName ? ` for ${teacherName}` : ""}.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            Loading receipt...
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : receipt ? (
          <SalaryPaymentReceipt receipt={receipt} />
        ) : null}
        <DialogFooter>
          <Button
            disabled={!receipt}
            render={<a href={`/api/salary-payments/${paymentId}/receipt.pdf`} />}
            type="button"
          >
            <DownloadIcon data-icon="inline-start" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
