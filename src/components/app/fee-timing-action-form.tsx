"use client"

import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition, type ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"

type FeeTimingActionFormProps = {
  action: (formData: FormData) => void | Promise<void>
  children?: ReactNode
  loadingLabel?: string
  onPendingChange?: (pending: boolean) => void
  onSubmitStart?: () => void
  successMessage?: string
  successTitle?: string
}

export function FeeTimingActionForm({
  action,
  children,
  loadingLabel = "Updating ledgers...",
  onPendingChange,
  onSubmitStart,
  successMessage = "The fee ledger changes have been applied.",
  successTitle = "Ledgers updated",
}: FeeTimingActionFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [submittedOption, setSubmittedOption] = useState<"current" | "next" | null>(null)

  function submitWithTiming(option: "current" | "next") {
    const form = formRef.current

    if (!form || isPending) {
      return
    }

    const formData = new FormData(form)
    formData.set("fee_start_option", option)
    setSubmittedOption(option)
    onPendingChange?.(true)
    onSubmitStart?.()

    startTransition(async () => {
      try {
        await action(formData)
        router.refresh()
        toast.success(successTitle, {
          description: successMessage,
          duration: 4200,
        })
      } finally {
        onPendingChange?.(false)
      }
    })
  }

  return (
    <>
      <form ref={formRef}>
        {children}
        <DialogFooter>
          <DialogClose render={<Button disabled={isPending} type="button" variant="outline" />}>
            Discard
          </DialogClose>
          <Button
            disabled={isPending}
            onClick={() => submitWithTiming("next")}
            type="button"
            variant="outline"
          >
            {isPending && submittedOption === "next" ? (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            ) : null}
            {isPending && submittedOption === "next" ? "Working..." : "Next month"}
          </Button>
          <Button
            disabled={isPending}
            onClick={() => submitWithTiming("current")}
            type="button"
          >
            {isPending && submittedOption === "current" ? (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            ) : null}
            {isPending && submittedOption === "current" ? "Working..." : "This month"}
          </Button>
        </DialogFooter>
      </form>
      {isPending ? <FeeTimingPendingOverlay label={loadingLabel} /> : null}
    </>
  )
}

export function FeeTimingPendingOverlay({
  label = "Updating ledgers...",
}: {
  label?: string
}) {
  return (
    <div className="fixed inset-x-0 top-4 z-[70] mx-auto flex w-fit items-center gap-2 rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg">
      <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
      {label}
    </div>
  )
}
