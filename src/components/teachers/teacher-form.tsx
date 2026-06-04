import Link from "next/link"

import { TeacherCreateSheetClient } from "@/components/teachers/teacher-create-sheet-client"
import { TeacherEditSheetClient } from "@/components/teachers/teacher-edit-sheet-client"
import { TeacherFields } from "@/components/teachers/teacher-fields"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { TeacherRecord } from "@/lib/data/teachers"
import type { FormState } from "@/lib/schemas"

type TeacherFormProps = {
  action: (formData: FormData) => void | Promise<void>
  cancelHref: string
  submitLabel: string
  teacher?: TeacherRecord
  title: string
}

type TeacherCreateSheetProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  triggerLabel?: string
}

type TeacherEditSheetProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  teacher: TeacherRecord
  triggerLabel?: string
  triggerVariant?: "button" | "icon"
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
          <TeacherFields teacher={teacher} />
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

export function TeacherCreateSheet({
  action,
  triggerLabel,
}: TeacherCreateSheetProps) {
  return (
    <TeacherCreateSheetClient
      action={action}
      triggerLabel={triggerLabel}
    />
  )
}

export function TeacherEditSheet({
  action,
  teacher,
  triggerLabel,
  triggerVariant,
}: TeacherEditSheetProps) {
  return (
    <TeacherEditSheetClient
      action={action}
      teacher={teacher}
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
    />
  )
}
