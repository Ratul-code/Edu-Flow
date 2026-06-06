"use client"

import { DownloadIcon, ReceiptTextIcon, SendIcon } from "lucide-react"
import { useState } from "react"

import { StudentPaymentReceipt } from "@/components/receipts/student-payment-receipt"
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
import type { StudentPaymentReceiptData } from "@/lib/data/payment-receipts"

type StudentPaymentReceiptDialogProps = {
  paymentId: string
}

export function StudentPaymentReceiptDialog({
  paymentId,
}: StudentPaymentReceiptDialogProps) {
  const [open, setOpen] = useState(false)
  const [receipt, setReceipt] = useState<StudentPaymentReceiptData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen || receipt || loading) {
      return
    }

    setLoading(true)
    setError(null)
    fetch(`/api/payments/${paymentId}/receipt`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load receipt.")
        }

        return response.json() as Promise<StudentPaymentReceiptData>
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
            className="border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            size="sm"
            type="button"
            variant="outline"
          />
        }
      >
        <ReceiptTextIcon data-icon="inline-start" />
        View Receipt
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Payment receipt</DialogTitle>
          <DialogDescription>
            Preview the receipt and download a printable copy.
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
          <StudentPaymentReceipt receipt={receipt} />
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button disabled type="button" variant="outline">
            <SendIcon data-icon="inline-start" />
            Send Receipt
          </Button>
          <Button
            disabled={!receipt}
            render={<a href={`/api/payments/${paymentId}/receipt.pdf`} />}
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
