import Link from "next/link"
import type { ReactElement } from "react"

import { StudentCreateSheetClient } from "@/components/students/student-create-sheet-client"
import { StudentEditSheetClient } from "@/components/students/student-edit-sheet-client"
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
import { listAcademicGroups } from "@/lib/data/academic-groups"
import { listMediumOptions } from "@/lib/data/medium-options"
import type { StudentRecord } from "@/lib/data/students"
import { currentMonthStart, monthInputValue } from "@/lib/data/fees"
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
  triggerClassName?: string
  triggerLabel?: string
  triggerVariant?: "button" | "outline" | "quick-action"
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
  const [academicGroups, mediumOptions] = await Promise.all([
    getAcademicGroups(),
    getMediumOptions(),
  ])

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
            groupOptions={academicGroups}
            mediumOptions={mediumOptions}
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
  triggerClassName,
  triggerLabel,
  triggerVariant,
}: StudentCreateSheetProps) {
  const { classLevels, tableExists } = await getClassLevelOptions()
  const [academicGroups, mediumOptions] = await Promise.all([
    getAcademicGroups(),
    getMediumOptions(),
  ])

  return (
    <StudentCreateSheetClient
      action={action}
      batches={batches}
      classLevels={classLevels}
      defaultFeeStartMonth={monthInputValue(currentMonthStart())}
      groupOptions={academicGroups}
      mediumOptions={mediumOptions}
      tableExists={tableExists}
      triggerClassName={triggerClassName}
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
    />
  )
}

export async function StudentEditSheet({
  action,
  assignedBatchIds = [],
  batches = [],
  student,
  returnPath,
  trigger,
  triggerSize = "default",
}: {
  action: (formData: FormData) => void | Promise<void>
  assignedBatchIds?: string[]
  batches?: BatchRecord[]
  returnPath?: string
  student: StudentRecord
  trigger?: ReactElement
  triggerSize?: "default" | "icon-sm"
}) {
  const { classLevels, tableExists } = await getClassLevelOptions()
  const [academicGroups, mediumOptions] = await Promise.all([
    getAcademicGroups(),
    getMediumOptions(),
  ])

  return (
    <StudentEditSheetClient
      action={action}
      assignedBatchIds={assignedBatchIds}
      batches={batches}
      classLevels={classLevels}
      groupOptions={academicGroups}
      mediumOptions={mediumOptions}
      returnPath={returnPath}
      student={student}
      tableExists={tableExists}
      trigger={trigger}
      triggerSize={triggerSize}
    />
  )
}

async function getClassLevelOptions() {
  const admin = await requireAdminContext()
  const tableExists = await checkClassLevelsTableExists()
  const classLevels = tableExists ? await listClassLevels(admin.tenantId) : []

  return { classLevels, tableExists }
}

async function getAcademicGroups() {
  const admin = await requireAdminContext()

  return listAcademicGroups(admin.tenantId)
}

async function getMediumOptions() {
  const admin = await requireAdminContext()

  return listMediumOptions(admin.tenantId)
}
