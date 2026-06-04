"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { AlertCircleIcon, CopyIcon, CheckIcon, PlusIcon, Trash2Icon } from "lucide-react"

import type { ClassLevelRecord } from "@/lib/data/class-levels"
import { createClassLevel, deleteClassLevel } from "@/lib/actions/class-levels"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

type ClassLevelsManagerProps = {
  classLevels: ClassLevelRecord[]
  tableExists: boolean
}

export function ClassLevelsManager({
  classLevels,
  tableExists,
}: ClassLevelsManagerProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sqlCode = `-- Run this in your Supabase SQL Editor to create the class_levels table:

create table if not exists public.class_levels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

alter table public.class_levels enable row level security;

drop policy if exists "Admins can manage class levels in their tenant" on public.class_levels;
create policy "Admins can manage class levels in their tenant"
on public.class_levels
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));`

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    setError(null)
    startTransition(async () => {
      try {
        await createClassLevel(formData)
        setOpen(false)
        form.reset()
      } catch (err: unknown) {
        setError(errorMessage(err, "Failed to create class level."))
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this class level? This won't delete students or batches, but it will remove the class level option.")) {
      return
    }

    setDeletingId(id)
    startTransition(async () => {
      try {
        await deleteClassLevel(id)
      } catch (err: unknown) {
        alert(errorMessage(err, "Failed to delete class level."))
      } finally {
        setDeletingId(null)
      }
    })
  }

  if (!tableExists) {
    return (
      <div className="flex flex-col gap-6">
        <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/20">
          <AlertCircleIcon className="size-5" />
          <AlertTitle className="text-base font-semibold">Database Schema Update Required</AlertTitle>
          <AlertDescription className="mt-2 text-sm text-muted-foreground">
            The `class_levels` table is missing in your Supabase database. Please run the SQL migration below in your <strong>Supabase SQL Editor</strong> to enable this feature.
          </AlertDescription>
        </Alert>

        <div className="relative rounded-xl border bg-muted/30 p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
          <Button
            size="icon-sm"
            variant="outline"
            className="absolute top-3 right-3 bg-white"
            onClick={handleCopySql}
          >
            {copied ? <CheckIcon className="size-4 text-emerald-600" /> : <CopyIcon className="size-4" />}
          </Button>
          <pre className="whitespace-pre">{sqlCode}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">Class Levels</h3>
          <p className="text-sm text-muted-foreground">
            Manage the dynamic class levels available for students and batches.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm"><PlusIcon className="size-4" /> Add Class Level</Button>} />
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Class Level</DialogTitle>
                <DialogDescription>
                  Create a new class level (e.g. Class 8, Class 9, HSC 1st Year).
                </DialogDescription>
              </DialogHeader>

              <div className="my-4">
                <Field>
                  <FieldLabel htmlFor="modal-class-name">Class Name</FieldLabel>
                  <Input
                    id="modal-class-name"
                    name="name"
                    placeholder="e.g. Class 9"
                    required
                    disabled={isPending}
                    autoFocus
                  />
                </Field>
                {error && (
                  <p className="mt-2 text-xs font-medium text-destructive">{error}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {classLevels.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircleIcon className="size-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No class levels configured</p>
            <p className="text-xs text-muted-foreground/75 mt-0.5">
              Add your first class level to start using it in your forms.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-3">Class Level Name</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {classLevels.map((level) => (
                <tr key={level.id} className="hover:bg-muted/10">
                  <td className="px-6 py-4 font-medium text-foreground">{level.name}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                      disabled={isPending && deletingId === level.id}
                      onClick={() => handleDelete(level.id)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
