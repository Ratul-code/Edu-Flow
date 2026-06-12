import type { TeacherRecord } from "@/lib/data/teachers"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { PlusIcon } from "lucide-react"

type ClassScheduleFormProps = {
  action: (formData: FormData) => void | Promise<void>
  teachers: TeacherRecord[]
}

export function ClassScheduleForm({
  action,
  teachers,
}: ClassScheduleFormProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button className="gap-1.5 text-xs" size="sm" type="button" variant="outline" />
        }
      >
        <PlusIcon className="size-3" />
        Add Session
      </SheetTrigger>
      <SheetContent className="w-full overflow-hidden p-0 data-[side=right]:!w-[92vw] data-[side=right]:!max-w-xl">
        <form action={action} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>Add Session</SheetTitle>
            <SheetDescription>
              Schedule a weekly class session for this batch.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="subject">Subject</FieldLabel>
              <Input id="subject" name="subject" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="weekday">Weekday</FieldLabel>
              <Select defaultValue="0" name="weekday">
                <SelectTrigger className="h-8 w-full" id="weekday">
                  <SelectValue placeholder="Weekday" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, index) => (
                        <SelectItem key={day} value={String(index)}>
                          {day}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="teacher_id">Teacher</FieldLabel>
              <Select defaultValue="" name="teacher_id">
                <SelectTrigger className="h-8 w-full" id="teacher_id">
                  <SelectValue placeholder="No teacher" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="">No teacher</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
          </div>
          <SheetFooter className="border-t bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end">
            <Button type="submit">Add schedule</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
