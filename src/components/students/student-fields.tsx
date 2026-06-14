import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { FeeStartControls } from "@/components/students/fee-start-controls"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TagInput } from "@/components/ui/tag-input"
import { Textarea } from "@/components/ui/textarea"
import type { BatchRecord } from "@/lib/data/batches"
import type { ClassLevelRecord } from "@/lib/data/class-levels"
import type { AcademicGroupRecord } from "@/lib/data/academic-groups"
import type { MediumOptionRecord } from "@/lib/data/medium-options"
import type { StudentRecord } from "@/lib/data/students"

type StudentFieldsProps = {
  assignedBatchIds?: string[]
  batches?: BatchRecord[]
  classLevels: ClassLevelRecord[]
  defaultFeeStartMonth?: string
  errors?: Record<string, string | string[]>
  groupOptions?: AcademicGroupRecord[]
  mediumOptions?: MediumOptionRecord[]
  showBatchAssignments?: boolean
  showFeeStartControls?: boolean
  student?: StudentRecord
  tableExists: boolean
}

export function StudentFields({
  assignedBatchIds = [],
  batches = [],
  classLevels,
  defaultFeeStartMonth,
  errors,
  groupOptions = [],
  mediumOptions = [],
  showBatchAssignments = true,
  showFeeStartControls = false,
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
      <Field data-invalid={Boolean(errors?.institution)}>
        <FieldLabel htmlFor="institution">Institution</FieldLabel>
        <Input
          id="institution"
          name="institution"
          aria-invalid={Boolean(errors?.institution)}
          defaultValue={student?.institution ?? ""}
        />
        <FieldError>{fieldError(errors?.institution)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.class_level)}>
        <FieldLabel htmlFor="class_level">Class level</FieldLabel>
        <Select
          defaultValue={student?.class_level ?? ""}
          disabled={!tableExists || classLevels.length === 0}
          name="class_level"
        >
          <SelectTrigger
            aria-invalid={Boolean(errors?.class_level)}
            className="h-8 w-full"
            id="class_level"
          >
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
        <Select defaultValue={student?.medium ?? ""} name="medium">
          <SelectTrigger
            aria-invalid={Boolean(errors?.medium)}
            className="h-8 w-full"
            id="medium"
          >
            <SelectValue placeholder="Not set" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="">Not set</SelectItem>
              {mediumOptions.map((option) => (
                <SelectItem key={option.id} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldError>{fieldError(errors?.medium)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.group_name)}>
        <FieldLabel htmlFor="group_name">Group</FieldLabel>
        <Select defaultValue={student?.group_name ?? ""} name="group_name">
          <SelectTrigger
            aria-invalid={Boolean(errors?.group_name)}
            className="h-8 w-full"
            id="group_name"
          >
            <SelectValue placeholder="Not set" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="">Not set</SelectItem>
              {groupOptions.map((option) => (
                <SelectItem key={option.id} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldError>{fieldError(errors?.group_name)}</FieldError>
      </Field>
      <Field data-invalid={Boolean(errors?.status)}>
        <FieldLabel htmlFor="status">Status</FieldLabel>
        <Select defaultValue={student?.status ?? "active"} name="status">
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
      <Field className="sm:col-span-2" data-invalid={Boolean(errors?.tags)}>
        <FieldLabel>Tags</FieldLabel>
        <TagInput
          name="tags"
          defaultTags={student?.tags ?? []}
          placeholder="Type a tag and press Space to add..."
        />
        <FieldError>{fieldError(errors?.tags)}</FieldError>
      </Field>
      {showBatchAssignments && batches.length ? (
        <Field className="sm:col-span-2">
          <FieldLabel>Assign batches</FieldLabel>
          <input name="batch_assignment_present" type="hidden" value="1" />
          <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
            {batches.map((batch) => (
              <label className="flex items-start gap-2 text-sm" key={batch.id}>
                <Checkbox
                  className="mt-1"
                  defaultChecked={assignedBatchIds.includes(batch.id)}
                  name="batch_ids"
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
      {showFeeStartControls ? (
        <FeeStartControls defaultMonth={defaultFeeStartMonth} />
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
