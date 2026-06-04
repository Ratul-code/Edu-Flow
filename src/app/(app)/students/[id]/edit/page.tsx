import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/page-header"
import { StudentForm } from "@/components/students/student-form"
import { updateStudent } from "@/lib/actions/students"
import { requireAdminContext } from "@/lib/auth/user"
import { listBatches } from "@/lib/data/batches"
import { getStudentById, listStudentBatchIds } from "@/lib/data/students"

type EditStudentPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const admin = await requireAdminContext()
  const { id } = await params
  const [student, batches, assignedBatchIds] = await Promise.all([
    getStudentById(admin.tenantId, id),
    listBatches(admin.tenantId, { status: "active" }),
    listStudentBatchIds(admin.tenantId, id),
  ])

  if (!student) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Update student details or restore an archived profile."
        title={`Edit ${student.name}`}
      />
      <StudentForm
        action={updateStudent.bind(null, student.id)}
        assignedBatchIds={assignedBatchIds}
        batches={batches}
        cancelHref={`/students/${student.id}`}
        student={student}
        submitLabel="Save changes"
        title="Student information"
      />
    </div>
  )
}
