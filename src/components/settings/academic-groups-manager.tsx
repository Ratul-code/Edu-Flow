"use client"

import { PencilIcon, PlusIcon, Trash2Icon, UsersIcon } from "lucide-react"
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
  createAcademicGroup,
  deleteAcademicGroup,
  updateAcademicGroup,
} from "@/lib/actions/settings"
import type { AcademicGroupRecord } from "@/lib/data/academic-groups"

type AcademicGroupsManagerProps = {
  groups: AcademicGroupRecord[]
}

export function AcademicGroupsManager({ groups }: AcademicGroupsManagerProps) {
  const [editing, setEditing] = useState<AcademicGroupRecord | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleCreate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await createAcademicGroup(formData)
      } catch (caughtError) {
        setError(errorMessage(caughtError, "Could not add group."))
      }
    })
  }

  function handleUpdate(formData: FormData) {
    if (!editing) return

    setError(null)
    startTransition(async () => {
      try {
        await updateAcademicGroup(editing.id, formData)
        setEditing(null)
      } catch (caughtError) {
        setError(errorMessage(caughtError, "Could not update group."))
      }
    })
  }

  function handleDelete(group: AcademicGroupRecord) {
    if (!confirm(`Remove "${group.name}" from groups?`)) {
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await deleteAcademicGroup(group.id)
      } catch (caughtError) {
        setError(errorMessage(caughtError, "Could not remove group."))
      }
    })
  }

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex-row items-center justify-between px-5 pb-0 pt-0">
        <div>
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Academic Groups</CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-xs">
            {groups.length} groups configured
          </CardDescription>
        </div>
        <Button size="icon-xs" type="button" variant="outline">
          <PlusIcon className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1.5 px-5 pt-2">
        {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
        {groups.map((group) => (
          <div
            className="flex items-center justify-between rounded-md border px-3 py-2"
            key={group.id}
          >
            <span className="text-sm">{group.name}</span>
            <div className="flex items-center gap-1">
              <Button
                disabled={isPending}
                onClick={() => setEditing(group)}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <PencilIcon className="size-3" />
                <span className="sr-only">Edit {group.name}</span>
              </Button>
              <Button
                className="text-muted-foreground hover:text-destructive"
                disabled={isPending}
                onClick={() => handleDelete(group)}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <Trash2Icon className="size-3" />
                <span className="sr-only">Delete {group.name}</span>
              </Button>
            </div>
          </div>
        ))}
        <form action={handleCreate} className="flex gap-2 pt-1">
          <Input
            className="h-7 flex-1 text-xs"
            disabled={isPending}
            name="name"
            placeholder="New group..."
            required
          />
          <Button
            className="h-7 px-2 text-xs"
            disabled={isPending}
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
              <DialogTitle>Edit academic group</DialogTitle>
              <DialogDescription>
                Rename this group for future student and batch forms.
              </DialogDescription>
            </DialogHeader>
            <Field className="my-4">
              <FieldLabel htmlFor="edit-academic-group">Group</FieldLabel>
              <Input
                defaultValue={editing?.name ?? ""}
                id="edit-academic-group"
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
