"use client"

import { BookOpenIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  createMediumOption,
  deleteMediumOption,
  updateMediumOption,
} from "@/lib/actions/settings"
import type { MediumOptionRecord } from "@/lib/data/medium-options"

type MediumOptionsManagerProps = {
  mediums: MediumOptionRecord[]
  tableExists: boolean
}

export function MediumOptionsManager({
  mediums,
  tableExists,
}: MediumOptionsManagerProps) {
  const [editing, setEditing] = useState<MediumOptionRecord | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleCreate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await createMediumOption(formData)
      } catch (caughtError) {
        setError(errorMessage(caughtError, "Could not add medium."))
      }
    })
  }

  function handleUpdate(formData: FormData) {
    if (!editing) return

    setError(null)
    startTransition(async () => {
      try {
        await updateMediumOption(editing.id, formData)
        setEditing(null)
      } catch (caughtError) {
        setError(errorMessage(caughtError, "Could not update medium."))
      }
    })
  }

  function handleDelete(medium: MediumOptionRecord) {
    if (!confirm(`Remove "${medium.name}" from mediums?`)) {
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await deleteMediumOption(medium.id)
      } catch (caughtError) {
        setError(errorMessage(caughtError, "Could not remove medium."))
      }
    })
  }

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex-row items-center justify-between px-5 pb-0 pt-0">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Mediums</CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-xs">
            {mediums.length} mediums configured
          </CardDescription>
        </div>
        <Button disabled={!tableExists} size="icon-xs" type="button" variant="outline">
          <PlusIcon className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1.5 px-5 pt-2">
        {!tableExists ? (
          <p className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            Apply the latest migration to edit medium options here.
          </p>
        ) : null}
        {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
        {mediums.map((medium) => (
          <div
            className="flex items-center justify-between rounded-md border px-3 py-2"
            key={medium.id}
          >
            <span className="text-sm">{medium.name}</span>
            <div className="flex items-center gap-1">
              <Button
                disabled={isPending || !tableExists}
                onClick={() => setEditing(medium)}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <PencilIcon className="size-3" />
                <span className="sr-only">Edit {medium.name}</span>
              </Button>
              <Button
                className="text-muted-foreground hover:text-destructive"
                disabled={isPending || !tableExists}
                onClick={() => handleDelete(medium)}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <Trash2Icon className="size-3" />
                <span className="sr-only">Delete {medium.name}</span>
              </Button>
            </div>
          </div>
        ))}
        <form action={handleCreate} className="flex gap-2 pt-1">
          <Input
            className="h-7 flex-1 text-xs"
            disabled={isPending || !tableExists}
            name="name"
            placeholder="New medium..."
            required
          />
          <Button
            className="h-7 px-2 text-xs"
            disabled={isPending || !tableExists}
            size="sm"
            type="submit"
          >
            Add
          </Button>
        </form>
      </CardContent>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <form action={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit medium</DialogTitle>
              <DialogDescription>
                Rename this medium for future student and batch forms.
              </DialogDescription>
            </DialogHeader>
            <Field className="my-4">
              <FieldLabel htmlFor="edit-medium">Medium</FieldLabel>
              <Input
                defaultValue={editing?.name ?? ""}
                id="edit-medium"
                name="name"
                required
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
