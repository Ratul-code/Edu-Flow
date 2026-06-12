import { PencilIcon, PlusIcon } from "lucide-react"
import type { ReactElement, ReactNode } from "react"

import { BatchForm } from "@/components/batches/batch-form"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { createBatch, updateBatch } from "@/lib/actions/batches"
import type { BatchRecord } from "@/lib/data/batches"

export function BatchCreateSheet() {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button className="gap-1.5" size="sm" type="button" />}
      >
        <PlusIcon data-icon="inline-start" />
        Create Batch
      </SheetTrigger>
      <SheetContent className="gap-0 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Create batch</SheetTitle>
          <SheetDescription>
            Add the batch profile, academic classification, subjects, fee, and status.
          </SheetDescription>
        </SheetHeader>
        <BatchForm action={createBatch} submitLabel="Create batch" />
      </SheetContent>
    </Sheet>
  )
}

export function BatchEditSheet({
  batch,
  children,
  trigger,
}: {
  batch: BatchRecord
  children?: ReactNode
  trigger?: ReactElement
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          trigger ?? (
            <Button className="gap-1.5" size="sm" type="button" variant="outline" />
          )
        }
      >
        {children ?? (
          <>
            <PencilIcon className="size-3.5" />
            Edit Batch
          </>
        )}
      </SheetTrigger>
      <SheetContent className="gap-0 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit batch</SheetTitle>
          <SheetDescription>
            Update profile fields. Fee changes ask when ledgers should update.
          </SheetDescription>
        </SheetHeader>
        <BatchForm
          action={updateBatch.bind(null, batch.id)}
          batch={batch}
          submitLabel="Save changes"
        />
      </SheetContent>
    </Sheet>
  )
}
