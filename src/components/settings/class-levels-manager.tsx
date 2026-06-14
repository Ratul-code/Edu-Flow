"use client"

import { AlertCircleIcon, BookOpenIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
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
  createClassLevel,
  deleteClassLevel,
  updateClassLevel,
} from "@/lib/actions/class-levels"
import type { ClassLevelRecord } from "@/lib/data/class-levels"

type ClassLevelsManagerProps = {
  classLevels: ClassLevelRecord[]
  tableExists: boolean
}

export function ClassLevelsManager({
  classLevels,
  tableExists,
}: ClassLevelsManagerProps) {
  const [editing, setEditing] = useState<ClassLevelRecord | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleCreate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await createClassLevel(formData)
      } catch (caughtError) {
        setError(errorMessage(caughtError, "Could not add class level."))
      }
    })
  }

  function handleUpdate(formData: FormData) {
    if (!editing) return

    setError(null)
    startTransition(async () => {
      try {
        await updateClassLevel(editing.id, formData)
        setEditing(null)
      } catch (caughtError) {
        setError(errorMessage(caughtError, "Could not update class level."))
      }
    })
  }

  function handleDelete(level: ClassLevelRecord) {
    if (!confirm(`Remove "${level.name}" from class levels?`)) {
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await deleteClassLevel(level.id)
      } catch (caughtError) {
        setError(errorMessage(caughtError, "Could not remove class level."))
      }
    })
  }

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex-row items-center justify-between px-5 pb-0 pt-0">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Class Levels</CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-xs">
            {classLevels.length} levels configured
          </CardDescription>
        </div>
        <Button disabled={!tableExists} size="icon-xs" type="button" variant="outline">
          <PlusIcon className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1.5 px-5 pt-2">
        {!tableExists ? (
          <p className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            Apply the latest migration to edit class levels here.
          </p>
        ) : null}
        {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
        {classLevels.length ? (
          classLevels.map((level) => (
            <div
              className="flex items-center justify-between rounded-md border px-3 py-2"
              key={level.id}
            >
              <span className="text-sm">{level.name}</span>
              <div className="flex items-center gap-1">
                <Button
                  disabled={isPending || !tableExists}
                  onClick={() => setEditing(level)}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <PencilIcon className="size-3" />
                  <span className="sr-only">Edit {level.name}</span>
                </Button>
                <Button
                  className="text-muted-foreground hover:text-destructive"
                  disabled={isPending || !tableExists}
                  onClick={() => handleDelete(level)}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <Trash2Icon className="size-3" />
                  <span className="sr-only">Delete {level.name}</span>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
            <AlertCircleIcon className="size-4" />
            No class levels configured
          </div>
        )}
        <form action={handleCreate} className="flex gap-2 pt-1">
          <Input
            className="h-7 flex-1 text-xs"
            disabled={isPending || !tableExists}
            name="name"
            placeholder="New class level..."
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
              <DialogTitle>Edit class level</DialogTitle>
              <DialogDescription>
                Rename this class level for future student and batch forms.
              </DialogDescription>
            </DialogHeader>
            <Field className="my-4">
              <FieldLabel htmlFor="edit-class-level">Class level</FieldLabel>
              <Input
                defaultValue={editing?.name ?? ""}
                id="edit-class-level"
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
