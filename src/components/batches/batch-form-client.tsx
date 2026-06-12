"use client"

import * as React from "react"
import { AlertTriangleIcon } from "lucide-react"

import type { BatchRecord } from "@/lib/data/batches"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SheetClose, SheetFooter } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type BatchFormClientProps = {
  academicGroups: { id: string; name: string }[]
  action: (formData: FormData) => void | Promise<void>
  batch?: BatchRecord
  classLevels: { id: string; name: string }[]
  submitLabel: string
  tableExists: boolean
}

export function BatchFormClient({
  academicGroups,
  action,
  batch,
  classLevels,
  submitLabel,
  tableExists,
}: BatchFormClientProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const feeStartOptionRef = React.useRef<HTMLInputElement>(null)
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const originalFee = Number(batch?.monthly_fee ?? 0)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!batch || feeStartOptionRef.current?.value) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const nextFee = Number(formData.get("monthly_fee") ?? 0)

    if (Number.isFinite(nextFee) && nextFee !== originalFee) {
      event.preventDefault()
      setIsConfirmOpen(true)
    }
  }

  function submitWithFeeTiming(timing: "current" | "next") {
    if (!feeStartOptionRef.current || !formRef.current) {
      return
    }

    feeStartOptionRef.current.value = timing
    setIsConfirmOpen(false)
    formRef.current.requestSubmit()
  }

  return (
    <>
      <form action={action} className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} ref={formRef}>
        <input name="fee_start_option" ref={feeStartOptionRef} type="hidden" />
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={fieldId("name", batch)}>Batch name</FieldLabel>
              <Input
                id={fieldId("name", batch)}
                name="name"
                defaultValue={batch?.name}
                placeholder="Class 10 Science"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={fieldId("class_level", batch)}>
                Class level
              </FieldLabel>
              {tableExists && classLevels.length > 0 ? (
                <Select defaultValue={batch?.class_level ?? ""} name="class_level">
                  <SelectTrigger className="h-8 w-full" id={fieldId("class_level", batch)}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectGroup>
                      {classLevels.map((level) => (
                        <SelectItem key={level.id} value={level.name}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={fieldId("class_level", batch)}
                  name="class_level"
                  defaultValue={batch?.class_level ?? ""}
                  placeholder="Class 10"
                  required
                />
              )}
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={fieldId("subject", batch)}>Subjects</FieldLabel>
              <Input
                id={fieldId("subject", batch)}
                name="subject"
                defaultValue={batch?.subject ?? ""}
                placeholder="Physics, Chemistry, Math"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={fieldId("medium", batch)}>Medium</FieldLabel>
              <Select defaultValue={batch?.medium ?? ""} name="medium">
                <SelectTrigger className="h-8 w-full" id={fieldId("medium", batch)}>
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="">Not set</SelectItem>
                    <SelectItem value="Bangla Medium">Bangla Medium</SelectItem>
                    <SelectItem value="English Version">English Version</SelectItem>
                    <SelectItem value="English Medium">English Medium</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={fieldId("group_name", batch)}>Group</FieldLabel>
              <Select defaultValue={batch?.group_name ?? ""} name="group_name">
                <SelectTrigger className="h-8 w-full" id={fieldId("group_name", batch)}>
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="">Not set</SelectItem>
                    {academicGroups.map((option) => (
                      <SelectItem key={option.id} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={fieldId("monthly_fee", batch)}>
                Monthly fee
              </FieldLabel>
              <Input
                id={fieldId("monthly_fee", batch)}
                min="0"
                name="monthly_fee"
                defaultValue={String(batch?.monthly_fee ?? 0)}
                step="0.01"
                type="number"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={fieldId("status", batch)}>Status</FieldLabel>
              <Select defaultValue={batch?.status ?? "active"} name="status">
                <SelectTrigger className="h-8 w-full" id={fieldId("status", batch)}>
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </div>
        <SheetFooter className="border-t">
          <div className="flex justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </SheetFooter>
      </form>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="size-4 text-warning" />
              Apply monthly fee change?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Choose when enrolled students should receive ledger updates for this batch fee change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (feeStartOptionRef.current) {
                  feeStartOptionRef.current.value = ""
                }
              }}
              render={<Button type="button" variant="outline" />}
            >
              Discard
            </AlertDialogCancel>
            <Button type="button" variant="outline" onClick={() => submitWithFeeTiming("next")}>
              Next month
            </Button>
            <Button type="button" onClick={() => submitWithFeeTiming("current")}>
              This month
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function fieldId(name: string, batch?: BatchRecord) {
  return `${batch ? `batch-${batch.id}` : "new-batch"}-${name}`
}
