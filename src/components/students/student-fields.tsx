import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TagInput } from "@/components/ui/tag-input"
import { Textarea } from "@/components/ui/textarea"
import type { BatchRecord } from "@/lib/data/batches"
import type { ClassLevelRecord } from "@/lib/data/class-levels"
import type { StudentRecord } from "@/lib/data/students"

type StudentFieldsProps = {
  assignedBatchIds?: string[]
  batches?: BatchRecord[]
  classLevels: ClassLevelRecord[]
  errors?: Record<string, string | string[]>
  student?: StudentRecord
  tableExists: boolean
}

export function StudentFields({
  assignedBatchIds = [],
  batches = [],
  classLevels,
  errors,
  student,
  tableExists,
}: StudentFieldsProps) {
  return (
    <FieldGroup className="sm:grid sm:grid-cols-2">
      <Field data-invalid={Boolean(errors?.name)}>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          name="name"
          aria-invalid={Boolean(errors?.name)}
          defaultValue={student?.name}
        />
        <FieldError>{fieldError(errors?.name)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.phone)}>
        <FieldLabel htmlFor="phone">Phone</FieldLabel>
        <Input
          id="phone"
          name="phone"
          aria-invalid={Boolean(errors?.phone)}
          defaultValue={student?.phone ?? ""}
          type="tel"
        />
        <FieldError>{fieldError(errors?.phone)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.guardian_name)}>
        <FieldLabel htmlFor="guardian_name">Guardian name</FieldLabel>
        <Input
          id="guardian_name"
          name="guardian_name"
          aria-invalid={Boolean(errors?.guardian_name)}
          defaultValue={student?.guardian_name ?? ""}
        />
        <FieldError>{fieldError(errors?.guardian_name)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.guardian_phone)}>
        <FieldLabel htmlFor="guardian_phone">Guardian phone</FieldLabel>
        <Input
          id="guardian_phone"
          name="guardian_phone"
          aria-invalid={Boolean(errors?.guardian_phone)}
          defaultValue={student?.guardian_phone ?? ""}
          type="tel"
        />
        <FieldError>{fieldError(errors?.guardian_phone)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.school)}>
        <FieldLabel htmlFor="school">School</FieldLabel>
        <Input
          id="school"
          name="school"
          aria-invalid={Boolean(errors?.school)}
          defaultValue={student?.school ?? ""}
        />
        <FieldError>{fieldError(errors?.school)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.class_level)}>
        <FieldLabel htmlFor="class_level">Class level</FieldLabel>
        {tableExists && classLevels.length > 0 ? (
          <select
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue={student?.class_level ?? ""}
            id="class_level"
            name="class_level"
            aria-invalid={Boolean(errors?.class_level)}
          >
            <option value="">Not set</option>
            {classLevels.map((level) => (
              <option key={level.id} value={level.name}>
                {level.name}
              </option>
            ))}
          </select>
        ) : (
          <Input
            id="class_level"
            name="class_level"
            aria-invalid={Boolean(errors?.class_level)}
            defaultValue={student?.class_level ?? ""}
            placeholder="Class 9"
          />
        )}
        <FieldError>{fieldError(errors?.class_level)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.admission_date)}>
        <FieldLabel htmlFor="admission_date">Admission date</FieldLabel>
        <Input
          id="admission_date"
          name="admission_date"
          aria-invalid={Boolean(errors?.admission_date)}
          defaultValue={
            student?.admission_date ?? new Date().toISOString().slice(0, 10)
          }
          type="date"
        />
        <FieldError>{fieldError(errors?.admission_date)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.medium)}>
        <FieldLabel htmlFor="medium">Medium</FieldLabel>
        <select
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          defaultValue={student?.medium ?? ""}
          id="medium"
          name="medium"
          aria-invalid={Boolean(errors?.medium)}
        >
          <option value="">Not set</option>
          <option value="Bangla Medium">Bangla Medium</option>
          <option value="English Version">English Version</option>
          <option value="English Medium">English Medium</option>
        </select>
        <FieldError>{fieldError(errors?.medium)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.group_name)}>
        <FieldLabel htmlFor="group_name">Group</FieldLabel>
        <select
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          defaultValue={student?.group_name ?? ""}
          id="group_name"
          name="group_name"
          aria-invalid={Boolean(errors?.group_name)}
        >
          <option value="">Not set</option>
          <option value="Science">Science</option>
          <option value="Commerce">Commerce</option>
          <option value="Arts">Arts</option>
        </select>
        <FieldError>{fieldError(errors?.group_name)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.status)}>
        <FieldLabel htmlFor="status">Status</FieldLabel>
        <select
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          defaultValue={student?.status ?? "active"}
          id="status"
          name="status"
          aria-invalid={Boolean(errors?.status)}
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <FieldError>{fieldError(errors?.status)}</FieldError>
      </Field>
      <Field className="sm:col-span-2" data-invalid={Boolean(errors?.tags)}>
        <FieldLabel>Tags</FieldLabel>
        <TagInput
          name="tags"
          defaultTags={student?.tags ?? []}
          placeholder="Type a tag and press Space to add..."
        />
        <FieldError>{fieldError(errors?.tags)}</FieldError>
      </Field>
      {batches.length ? (
        <Field className="sm:col-span-2">
          <FieldLabel>Assign batches</FieldLabel>
          <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
            {batches.map((batch) => (
              <label className="flex items-start gap-2 text-sm" key={batch.id}>
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
      <Field className="sm:col-span-2" data-invalid={Boolean(errors?.notes)}>
        <FieldLabel htmlFor="notes">Notes</FieldLabel>
        <Textarea
          id="notes"
          name="notes"
          aria-invalid={Boolean(errors?.notes)}
          defaultValue={student?.notes ?? ""}
          rows={4}
        />
        <FieldError>{fieldError(errors?.notes)}</FieldError>
      </Field>
    </FieldGroup>
  )
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}

function fieldError(error: string | string[] | undefined) {
  return Array.isArray(error) ? error.join(" ") : error
}
