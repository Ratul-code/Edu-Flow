"use client"

import { PlusIcon, SaveIcon, Trash2Icon } from "lucide-react"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
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

  function handleUpdate(groupId: string, formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await updateAcademicGroup(groupId, formData)
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
    <div className="mt-6 flex flex-col gap-4 border-t pt-6">
      <div>
        <h3 className="text-lg font-medium text-foreground">Groups</h3>
        <p className="text-sm text-muted-foreground">
          Default groups are Science, Commerce, and Arts. Edit, remove, or add
          more groups for student and batch forms.
        </p>
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="divide-y">
          {groups.map((group) => (
            <form
              action={handleUpdate.bind(null, group.id)}
              className="flex items-end gap-2 p-3"
              key={group.id}
            >
              <Field className="flex-1">
                <FieldLabel htmlFor={`group-${group.id}`} className="sr-only">
                  {group.name}
                </FieldLabel>
                <Input
                  defaultValue={group.name}
                  disabled={isPending}
                  id={`group-${group.id}`}
                  name="name"
                  required
                />
              </Field>
              <Button disabled={isPending} size="icon-sm" type="submit" variant="outline">
                <SaveIcon />
                <span className="sr-only">Save {group.name}</span>
              </Button>
              <Button
                disabled={isPending}
                onClick={() => handleDelete(group)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Trash2Icon />
                <span className="sr-only">Remove {group.name}</span>
              </Button>
            </form>
          ))}
        </div>

        <form action={handleCreate} className="flex items-end gap-2 border-t bg-muted/20 p-3">
          <Field className="flex-1">
            <FieldLabel htmlFor="group-new">Add group</FieldLabel>
            <Input
              disabled={isPending}
              id="group-new"
              name="name"
              placeholder="New group"
              required
            />
          </Field>
          <Button disabled={isPending} type="submit">
            <PlusIcon data-icon="inline-start" />
            Add
          </Button>
        </form>
      </div>
    </div>
  )
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
