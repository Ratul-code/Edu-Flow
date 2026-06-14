import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TagInput } from "@/components/ui/tag-input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { TeacherRecord } from "@/lib/data/teachers"

type TeacherFieldsProps = {
  errors?: Record<string, string | string[]>
  teacher?: TeacherRecord
}

export function TeacherFields({ errors, teacher }: TeacherFieldsProps) {
  return (
    <FieldGroup className="sm:grid sm:grid-cols-2">
      <Field data-invalid={Boolean(errors?.name)}>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          name="name"
          aria-invalid={Boolean(errors?.name)}
          defaultValue={teacher?.name}
          required
        />
        <FieldError>{fieldError(errors?.name)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.phone)}>
        <FieldLabel htmlFor="phone">Phone</FieldLabel>
        <Input
          id="phone"
          name="phone"
          aria-invalid={Boolean(errors?.phone)}
          defaultValue={teacher?.phone ?? ""}
          required
          type="tel"
        />
        <FieldError>{fieldError(errors?.phone)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.subject_specialty)}>
        <FieldLabel>Subject specialty</FieldLabel>
        <TagInput
          defaultTags={tagsFromText(teacher?.subject_specialty)}
          name="subject_specialty"
          placeholder="Type a subject and press Space to add..."
        />
        <FieldError>{fieldError(errors?.subject_specialty)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.default_monthly_salary)}>
        <FieldLabel htmlFor="default_monthly_salary">
          Default monthly salary
        </FieldLabel>
        <Input
          id="default_monthly_salary"
          min="0"
          name="default_monthly_salary"
          aria-invalid={Boolean(errors?.default_monthly_salary)}
          defaultValue={
            teacher?.default_monthly_salary === undefined
              ? ""
              : String(teacher.default_monthly_salary)
          }
          required
          step="0.01"
          type="number"
        />
        <FieldError>{fieldError(errors?.default_monthly_salary)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.status)}>
        <FieldLabel htmlFor="status">Status</FieldLabel>
        <Select defaultValue={teacher?.status ?? "active"} name="status" required>
          <SelectTrigger
            aria-invalid={Boolean(errors?.status)}
            className="h-8 w-full"
            id="status"
          >
            <SelectValue placeholder="Active" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldError>{fieldError(errors?.status)}</FieldError>
      </Field>
      <Field className="sm:col-span-2" data-invalid={Boolean(errors?.notes)}>
        <FieldLabel htmlFor="notes">Notes</FieldLabel>
        <Textarea
          id="notes"
          name="notes"
          aria-invalid={Boolean(errors?.notes)}
          defaultValue={teacher?.notes ?? ""}
          required
          rows={4}
        />
        <FieldError>{fieldError(errors?.notes)}</FieldError>
      </Field>
    </FieldGroup>
  )
}

function fieldError(error: string | string[] | undefined) {
  return Array.isArray(error) ? error.join(" ") : error
}

function tagsFromText(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}
