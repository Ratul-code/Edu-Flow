import Link from "next/link"

import type { BatchRecord } from "@/lib/data/batches"
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

type BatchFormProps = {
  action: (formData: FormData) => void | Promise<void>
  batch?: BatchRecord
  cancelHref: string
  submitLabel: string
  title: string
}

export function BatchForm({
  action,
  batch,
  cancelHref,
  submitLabel,
  title,
}: BatchFormProps) {
  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Batch profile, class level, medium/group, fee, and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name">Batch name</FieldLabel>
              <Input id="name" name="name" defaultValue={batch?.name} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="class_level">Class level</FieldLabel>
              <Input
                id="class_level"
                name="class_level"
                defaultValue={batch?.class_level ?? ""}
                placeholder="Class 9"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="monthly_fee">Monthly fee</FieldLabel>
              <Input
                id="monthly_fee"
                min="0"
                name="monthly_fee"
                defaultValue={String(batch?.monthly_fee ?? 0)}
                step="0.01"
                type="number"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="medium">Medium</FieldLabel>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                defaultValue={batch?.medium ?? ""}
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
                defaultValue={batch?.group_name ?? ""}
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
                defaultValue={batch?.status ?? "active"}
                id="status"
                name="status"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
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
