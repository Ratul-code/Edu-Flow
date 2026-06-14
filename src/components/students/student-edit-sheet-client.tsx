"use client"

import { PencilIcon } from "lucide-react"
import { useState, type ReactElement } from "react"

import { StudentFields } from "@/components/students/student-fields"
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
import type { StudentRecord } from "@/lib/data/students"

type StudentEditSheetClientProps = {
  action: (formData: FormData) => void | Promise<void>
  assignedBatchIds: string[]
  batches: BatchRecord[]
  classLevels: ClassLevelRecord[]
  groupOptions: AcademicGroupRecord[]
  mediumOptions: MediumOptionRecord[]
  returnPath?: string
  student: StudentRecord
  tableExists: boolean
  trigger?: ReactElement
  triggerSize?: "default" | "icon-sm"
}

export function StudentEditSheetClient({
  action,
  assignedBatchIds,
  batches,
  classLevels,
  groupOptions,
  mediumOptions,
  returnPath,
  student,
  tableExists,
  trigger,
  triggerSize = "default",
}: StudentEditSheetClientProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  function requestClose() {
    if (isDirty) {
      setConfirmOpen(true)
      return
    }

    setOpen(false)
  }

  function discardChanges() {
    setIsDirty(false)
    setConfirmOpen(false)
    setOpen(false)
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setOpen(true)
            return
          }

          requestClose()
        }}
      >
        <SheetTrigger
          render={
            trigger ?? (
              <Button
                className={triggerSize === "icon-sm" ? "size-7 cursor-pointer" : undefined}
                size={triggerSize}
                type="button"
                variant={triggerSize === "icon-sm" ? "ghost" : "default"}
              />
            )
          }
        >
          <PencilIcon data-icon={triggerSize === "icon-sm" ? undefined : "inline-start"} />
          <span className={triggerSize === "icon-sm" ? "sr-only" : ""}>
            Edit student
          </span>
        </SheetTrigger>
        <SheetContent className="w-full overflow-hidden p-0 data-[side=right]:!w-[92vw] data-[side=right]:!max-w-5xl">
          <form
            action={action}
            className="flex min-h-0 flex-1 flex-col"
            onChange={() => setIsDirty(true)}
          >
            {returnPath ? (
              <input name="return_path" type="hidden" value={returnPath} />
            ) : null}
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle>Edit {student.name}</SheetTitle>
              <SheetDescription>
                Update profile details and active batch assignments.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <StudentFields
                assignedBatchIds={assignedBatchIds}
                batches={batches}
                classLevels={classLevels}
                groupOptions={groupOptions}
                mediumOptions={mediumOptions}
                showBatchAssignments={false}
                student={student}
                tableExists={tableExists}
              />
            </div>
            <SheetFooter className="border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={requestClose}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
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
