import type { BatchRecord } from "@/lib/data/batches"
import { BatchFormClient } from "@/components/batches/batch-form-client"
import { requireAdminContext } from "@/lib/auth/user"
import { listAcademicGroups } from "@/lib/data/academic-groups"
import { listMediumOptions } from "@/lib/data/medium-options"
import {
  checkClassLevelsTableExists,
  listClassLevels,
} from "@/lib/data/class-levels"

type BatchFormProps = {
  action: (formData: FormData) => void | Promise<void>
  batch?: BatchRecord
  submitLabel: string
}

export async function BatchForm({ action, batch, submitLabel }: BatchFormProps) {
  const admin = await requireAdminContext()
  const tableExists = await checkClassLevelsTableExists()
  const [classLevels, academicGroups, mediumOptions] = await Promise.all([
    tableExists ? listClassLevels(admin.tenantId) : Promise.resolve([]),
    listAcademicGroups(admin.tenantId),
    listMediumOptions(admin.tenantId),
  ])

  return (
    <BatchFormClient
      academicGroups={academicGroups}
      action={action}
      batch={batch}
      classLevels={classLevels}
      mediumOptions={mediumOptions}
      submitLabel={submitLabel}
      tableExists={tableExists}
    />
  )
}
