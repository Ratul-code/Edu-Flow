import type { StudentRecord } from "@/lib/data/students"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type BatchAssignmentFormProps = {
  action: (formData: FormData) => void | Promise<void>
  classLevels: string[]
  filters: {
    classLevel?: string
    groupName?: string
    medium?: string
    search?: string
    tag?: string
  }
  groups: string[]
  mediums: string[]
  students: StudentRecord[]
  tags: string[]
}

export function BatchAssignmentForm({
  action,
  classLevels,
  filters,
  groups,
  mediums,
  students,
  tags,
}: BatchAssignmentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add students</CardTitle>
        <CardDescription>
          Search and filter students, then bulk-add them to this batch.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form className="flex flex-col gap-3">
          <div className="relative">
            <Input
              defaultValue={filters.search}
              name="studentQ"
              placeholder="Search students"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              defaultValue={filters.classLevel ?? ""}
              name="studentClassLevel"
            >
              <option value="">All classes</option>
              {classLevels.map((classLevel) => (
                <option key={classLevel} value={classLevel}>
                  {classLevel}
                </option>
              ))}
            </select>
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              defaultValue={filters.medium ?? ""}
              name="studentMedium"
            >
              <option value="">All mediums</option>
              {mediums.map((medium) => (
                <option key={medium} value={medium}>
                  {medium}
                </option>
              ))}
            </select>
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              defaultValue={filters.groupName ?? ""}
              name="studentGroupName"
            >
              <option value="">All groups</option>
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              defaultValue={filters.tag ?? ""}
              name="studentTag"
            >
              <option value="">All tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="outline">
              Filter students
            </Button>
          </div>
        </form>
        <form action={action} className="flex flex-col gap-4">
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel>Students</FieldLabel>
              <div className="max-h-64 overflow-y-auto rounded-lg border bg-muted/20 p-3">
                {students.map((student) => (
                  <label
                    className="flex items-start gap-2 py-1.5 text-sm"
                    key={student.id}
                  >
                    <input
                      className="mt-1"
                      name="student_ids"
                      type="checkbox"
                      value={student.id}
                    />
                    <span>
                      <span className="block font-medium">{student.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {[student.class_level, student.medium, student.group_name]
                          .filter(Boolean)
                          .join(" - ") || "No classification"}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="joined_at">Joined at</FieldLabel>
              <Input
                id="joined_at"
                name="joined_at"
                defaultValue={new Date().toISOString().slice(0, 10)}
                type="date"
              />
            </Field>
          </FieldGroup>
          <div className="flex justify-end">
            <Button type="submit">Add selected</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
