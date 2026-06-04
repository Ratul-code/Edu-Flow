import Link from "next/link"

import type { TeacherRecord } from "@/lib/data/teachers"
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

type TeacherFormProps = {
  action: (formData: FormData) => void | Promise<void>
  cancelHref: string
  submitLabel: string
  teacher?: TeacherRecord
  title: string
}

export function TeacherForm({
  action,
  cancelHref,
  submitLabel,
  teacher,
  title,
}: TeacherFormProps) {
  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Teacher profile, subject specialty, default salary, and notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={teacher?.name}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                name="phone"
                defaultValue={teacher?.phone ?? ""}
                type="tel"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="subject_specialty">
                Subject specialty
              </FieldLabel>
              <Input
                id="subject_specialty"
                name="subject_specialty"
                defaultValue={teacher?.subject_specialty ?? ""}
                placeholder="Math"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="default_monthly_salary">
                Default monthly salary
              </FieldLabel>
              <Input
                id="default_monthly_salary"
                min="0"
                name="default_monthly_salary"
                defaultValue={String(teacher?.default_monthly_salary ?? 0)}
                step="0.01"
                type="number"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                defaultValue={teacher?.status ?? "active"}
                id="status"
                name="status"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={teacher?.notes ?? ""}
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
