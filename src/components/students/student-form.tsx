import Link from "next/link"

import { StudentCreateSheetClient } from "@/components/students/student-create-sheet-client"
import { StudentFields } from "@/components/students/student-fields"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireAdminContext } from "@/lib/auth/user"
import type { BatchRecord } from "@/lib/data/batches"
import {
  checkClassLevelsTableExists,
  listClassLevels,
} from "@/lib/data/class-levels"
import type { StudentRecord } from "@/lib/data/students"
import type { FormState } from "@/lib/schemas"

type StudentFormProps = {
  action: (formData: FormData) => void | Promise<void>
  assignedBatchIds?: string[]
  batches?: BatchRecord[]
  cancelHref: string
  student?: StudentRecord
  submitLabel: string
  title: string
}

type StudentCreateSheetProps = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  batches?: BatchRecord[]
  triggerLabel?: string
  triggerVariant?: "button" | "quick-action"
}

export async function StudentForm({
  action,
  assignedBatchIds = [],
  batches = [],
  cancelHref,
  student,
  submitLabel,
  title,
}: StudentFormProps) {
  const { classLevels, tableExists } = await getClassLevelOptions()

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
          <StudentFields
            assignedBatchIds={assignedBatchIds}
            batches={batches}
            classLevels={classLevels}
            student={student}
            tableExists={tableExists}
          />
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

export async function StudentCreateSheet({
  action,
  batches = [],
  triggerLabel,
  triggerVariant,
}: StudentCreateSheetProps) {
  const { classLevels, tableExists } = await getClassLevelOptions()

  return (
    <StudentCreateSheetClient
      action={action}
      batches={batches}
      classLevels={classLevels}
      tableExists={tableExists}
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
    />
  )
}

async function getClassLevelOptions() {
  const admin = await requireAdminContext()
  const tableExists = await checkClassLevelsTableExists()
  const classLevels = tableExists ? await listClassLevels(admin.tenantId) : []

  return { classLevels, tableExists }
}
