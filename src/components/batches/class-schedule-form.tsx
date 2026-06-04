import type { TeacherRecord } from "@/lib/data/teachers"
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

type ClassScheduleFormProps = {
  action: (formData: FormData) => void | Promise<void>
  teachers: TeacherRecord[]
}

export function ClassScheduleForm({
  action,
  teachers,
}: ClassScheduleFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add weekly class</CardTitle>
        <CardDescription>
          Schedule rows are ready for attendance tracking later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="subject">Subject</FieldLabel>
              <Input id="subject" name="subject" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="weekday">Weekday</FieldLabel>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                id="weekday"
                name="weekday"
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  )
                )}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="teacher_id">Teacher</FieldLabel>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                id="teacher_id"
                name="teacher_id"
              >
                <option value="">No teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="start_time">Start time</FieldLabel>
              <Input id="start_time" name="start_time" required type="time" />
            </Field>
            <Field>
              <FieldLabel htmlFor="end_time">End time</FieldLabel>
              <Input id="end_time" name="end_time" required type="time" />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="room_name">Room name</FieldLabel>
              <Input id="room_name" name="room_name" />
            </Field>
          </FieldGroup>
          <div className="flex justify-end">
            <Button type="submit">Add schedule</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
