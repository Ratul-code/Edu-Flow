"use client"

import { Loader2Icon } from "lucide-react"
import { useRef, useState, useTransition, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ConfirmActionFormProps = {
  action: (formData: FormData) => void | Promise<void>
  children: ReactNode
  confirmLabel: string
  description: string
  pendingLabel: string
  title: string
}

export function ConfirmActionForm({
  action,
  children,
  confirmLabel,
  description,
  pendingLabel,
  title,
}: ConfirmActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!event.currentTarget.reportValidity()) {
      return
    }

    setOpen(true)
  }

  function confirmSubmit() {
    const form = formRef.current

    if (!form || isPending) {
      return
    }

    const formData = new FormData(form)

    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} ref={formRef}>
        {children}
      </form>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} onClick={confirmSubmit} type="button">
              {isPending ? (
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
              ) : null}
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
