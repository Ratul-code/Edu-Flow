import Link from "next/link"

import type { BatchRecord } from "@/lib/data/batches"
import type { StudentRecord } from "@/lib/data/students"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type StudentFormProps = {
  action: (formData: FormData) => void | Promise<void>
  assignedBatchIds?: string[]
  batches?: BatchRecord[]
  cancelHref: string
  student?: StudentRecord
  submitLabel: string
  title: string
}

export function StudentForm({
  action,
  assignedBatchIds = [],
  batches = [],
  cancelHref,
  student,
  submitLabel,
  title,
}: StudentFormProps) {
  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Student profile, classification, batch assignments, and notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={student?.name}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                name="phone"
                defaultValue={student?.phone ?? ""}
                type="tel"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="guardian_name">Guardian name</FieldLabel>
              <Input
                id="guardian_name"
                name="guardian_name"
                defaultValue={student?.guardian_name ?? ""}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="guardian_phone">Guardian phone</FieldLabel>
              <Input
                id="guardian_phone"
                name="guardian_phone"
                defaultValue={student?.guardian_phone ?? ""}
                type="tel"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="school">School</FieldLabel>
              <Input
                id="school"
                name="school"
                defaultValue={student?.school ?? ""}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="class_level">Class level</FieldLabel>
              <Input
                id="class_level"
                name="class_level"
                defaultValue={student?.class_level ?? ""}
                placeholder="Class 9"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="admission_date">Admission date</FieldLabel>
              <Input
                id="admission_date"
                name="admission_date"
                defaultValue={
                  student?.admission_date ?? new Date().toISOString().slice(0, 10)
                }
                type="date"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="medium">Medium</FieldLabel>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                defaultValue={student?.medium ?? ""}
                id="medium"
                name="medium"
              >
                <option value="">Not set</option>
                <option value="Bangla Medium">Bangla Medium</option>
                <option value="English Version">English Version</option>
                <option value="English Medium">English Medium</option>
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="group_name">Group</FieldLabel>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                defaultValue={student?.group_name ?? ""}
                id="group_name"
                name="group_name"
              >
                <option value="">Not set</option>
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                defaultValue={student?.status ?? "active"}
                id="status"
                name="status"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="tags">Tags</FieldLabel>
              <Input
                id="tags"
                name="tags"
                defaultValue={student?.tags?.join(", ") ?? ""}
                placeholder="Scholarship, VIP Parent, Morning Preferred"
              />
            </Field>
            {batches.length ? (
              <Field className="sm:col-span-2">
                <FieldLabel>Assign batches</FieldLabel>
                <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
                  {batches.map((batch) => (
                    <label
                      className="flex items-start gap-2 text-sm"
                      key={batch.id}
                    >
                      <input
                        className="mt-1"
                        defaultChecked={assignedBatchIds.includes(batch.id)}
                        name="batch_ids"
                        type="checkbox"
                        value={batch.id}
                      />
                      <span>
                        <span className="block font-medium">{batch.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {batch.class_level ?? "No class"} -{" "}
                          {formatTaka(batch.monthly_fee)}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
            ) : null}
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={student?.notes ?? ""}
                rows={4}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button render={<Link href={cancelHref} />} variant="outline">
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </CardFooter>
      </Card>
    </form>
  )
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
