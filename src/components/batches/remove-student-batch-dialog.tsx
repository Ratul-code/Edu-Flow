"use client"

import { UserMinusIcon } from "lucide-react"
import { useState } from "react"

import {
  FeeTimingActionForm,
  FeeTimingPendingOverlay,
} from "@/components/app/fee-timing-action-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type RemoveStudentBatchDialogProps = {
  action: (formData: FormData) => void | Promise<void>
  batchName: string
  studentName: string
}

export function RemoveStudentBatchDialog({
  action,
  batchName,
  studentName,
}: RemoveStudentBatchDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLedgerPending, setIsLedgerPending] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="size-7 cursor-pointer" size="icon-sm" type="button" variant="ghost" />
        }
      >
        <UserMinusIcon />
        <span className="sr-only">Remove student</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove student?</DialogTitle>
          <DialogDescription>
            This will remove {studentName} from {batchName}. Choose when the fee
            ledger should reflect the change.
          </DialogDescription>
        </DialogHeader>
        <FeeTimingActionForm
          action={action}
          loadingLabel="Removing student and updating ledgers..."
          onPendingChange={setIsLedgerPending}
          onSubmitStart={() => setOpen(false)}
          successMessage="The student was removed and fee ledgers were updated."
          successTitle="Student removed"
        />
      </DialogContent>
      {isLedgerPending ? (
        <FeeTimingPendingOverlay label="Removing student and updating ledgers..." />
      ) : null}
    </Dialog>
  )
}
