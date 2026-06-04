"use client"

import { PencilIcon } from "lucide-react"
import { useActionState, useState, type FormEvent } from "react"

import { TeacherFields } from "@/components/teachers/teacher-fields"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { TeacherRecord } from "@/lib/data/teachers"
import {
  formatZodErrors,
  initialFormState,
  teacherSchema,
  type FormState,
} from "@/lib/schemas"

type TeacherEditSheetClientProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  teacher: TeacherRecord
  triggerLabel?: string
  triggerVariant?: "button" | "icon"
}

export function TeacherEditSheetClient({
  action,
  teacher,
  triggerLabel = "Edit teacher",
  triggerVariant = "button",
}: TeacherEditSheetClientProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialFormState
  )
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [hideFeedback, setHideFeedback] = useState(false)
  const [clientErrors, setClientErrors] = useState<
    Record<string, string | string[]> | undefined
  >()
  const displayedErrors =
    clientErrors ?? (hideFeedback ? undefined : state.errors)
  const hasValidationErrors = Boolean(
    displayedErrors && Object.keys(displayedErrors).length
  )
  const hasFeedback =
    hasValidationErrors || (!hideFeedback && Boolean(state.message))

  function requestClose() {
    if (isDirty || hasFeedback) {
      setConfirmOpen(true)
      return
    }

    setOpen(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setHideFeedback(true)
      setClientErrors(undefined)
      setOpen(true)
      return
    }

    requestClose()
  }

  function discardChanges() {
    setIsDirty(false)
    setHideFeedback(true)
    setClientErrors(undefined)
    setConfirmOpen(false)
    setOpen(false)
  }

  function validateForm(form: HTMLFormElement) {
    const result = teacherSchema.safeParse(
      Object.fromEntries(new FormData(form).entries())
    )

    if (result.success) {
      setClientErrors({})
      return true
    }

    setClientErrors(formatZodErrors(result.error))
    return false
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!validateForm(event.currentTarget)) {
      event.preventDefault()
      setHideFeedback(true)
      setIsDirty(true)
      return
    }

    setClientErrors(undefined)
    setHideFeedback(false)
    setIsDirty(false)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger
          render={
            triggerVariant === "icon" ? (
              <Button size="icon-sm" variant="ghost" />
            ) : (
              <Button />
            )
          }
        >
          {triggerVariant === "button" ? (
            <PencilIcon data-icon="inline-start" />
          ) : (
            <PencilIcon />
          )}
          <span className={triggerVariant === "icon" ? "sr-only" : undefined}>
            {triggerLabel}
          </span>
        </SheetTrigger>
        <SheetContent className="w-full overflow-hidden p-0 data-[side=right]:!w-[92vw] data-[side=right]:!max-w-3xl">
          <form
            action={formAction}
            className="flex min-h-0 flex-1 flex-col"
            onChange={(event) => {
              setIsDirty(true)
              if (hasValidationErrors) {
                validateForm(event.currentTarget)
              }
            }}
            onSubmit={handleSubmit}
            noValidate
          >
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle>Edit teacher</SheetTitle>
              <SheetDescription>
                Update {teacher.name}&apos;s contact, specialty, salary, and
                notes.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {!hideFeedback && state.message ? (
                <Alert variant="destructive" className="mb-5">
                  <AlertTitle>Could not update teacher</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              ) : null}
              <TeacherFields errors={displayedErrors} teacher={teacher} />
            </div>
            <SheetFooter className="border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={requestClose}>
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              The teacher form has unsaved changes. Closing it will discard what
              you changed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
            >
              Keep editing
            </Button>
            <Button type="button" variant="destructive" onClick={discardChanges}>
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
