"use client"

import { PlusIcon, UserPlusIcon } from "lucide-react"
import { useActionState, useState, type FormEvent } from "react"

import { StudentFields } from "@/components/students/student-fields"
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
import type { BatchRecord } from "@/lib/data/batches"
import type { ClassLevelRecord } from "@/lib/data/class-levels"
import type { AcademicGroupRecord } from "@/lib/data/academic-groups"
import type { MediumOptionRecord } from "@/lib/data/medium-options"
import {
  formatZodErrors,
  initialFormState,
  studentSchema,
  type FormState,
} from "@/lib/schemas"
import { cn } from "@/lib/utils"

type StudentCreateSheetClientProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  batches: BatchRecord[]
  classLevels: ClassLevelRecord[]
  defaultFeeStartMonth: string
  groupOptions: AcademicGroupRecord[]
  mediumOptions: MediumOptionRecord[]
  tableExists: boolean
  triggerClassName?: string
  triggerLabel?: string
  triggerVariant?: "button" | "outline" | "quick-action"
}

export function StudentCreateSheetClient({
  action,
  batches,
  classLevels,
  defaultFeeStartMonth,
  groupOptions,
  mediumOptions,
  tableExists,
  triggerClassName,
  triggerLabel = "Add student",
  triggerVariant = "button",
}: StudentCreateSheetClientProps) {
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
    const result = studentSchema.safeParse(
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
            triggerVariant === "quick-action" ? (
              <button
                className="flex h-14 w-full items-center justify-between gap-3 rounded-lg border bg-background px-3 text-left text-sm transition-colors hover:bg-muted"
                type="button"
              />
            ) : (
              <Button
                className={triggerClassName}
                variant={triggerVariant === "outline" ? "outline" : "default"}
              />
            )
          }
        >
          {triggerVariant === "quick-action" ? (
            <>
              <span className="flex min-w-0 items-center gap-2">
                <UserPlusIcon className="size-4 text-muted-foreground" />
                <span className="truncate font-medium">{triggerLabel}</span>
              </span>
            </>
          ) : (
            <>
              <PlusIcon
                className={cn(
                  triggerVariant === "outline" && "text-muted-foreground"
                )}
                data-icon="inline-start"
              />
              {triggerLabel}
            </>
          )}
        </SheetTrigger>
        <SheetContent className="w-full overflow-hidden p-0 data-[side=right]:!w-[92vw] data-[side=right]:!max-w-5xl">
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
              <SheetTitle>Add student</SheetTitle>
              <SheetDescription>
                Create a student profile and optionally assign active batches.
              </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {!hideFeedback && state.message ? (
              <Alert variant="destructive" className="mb-5">
                <AlertTitle>Could not create student</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            ) : null}
            <StudentFields
                batches={batches}
                classLevels={classLevels}
                defaultFeeStartMonth={defaultFeeStartMonth}
                errors={displayedErrors}
                groupOptions={groupOptions}
                mediumOptions={mediumOptions}
                showFeeStartControls
                tableExists={tableExists}
              />
          </div>
            <SheetFooter className="border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={requestClose}>
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? "Creating..." : "Create student"}
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
              The student form has unsaved changes. Closing it will discard what
              you entered.
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
