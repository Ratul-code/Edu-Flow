import { PageHeader } from "@/components/app/page-header"
import { StudentForm } from "@/components/students/student-form"
import { createStudent } from "@/lib/actions/students"
import { requireAdminContext } from "@/lib/auth/user"
import { listBatches } from "@/lib/data/batches"

export default async function NewStudentPage() {
  const admin = await requireAdminContext()
  const batches = await listBatches(admin.tenantId, { status: "active" })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Add a student profile with guardian contacts and admission details."
        title="Add student"
      />
      <StudentForm
        action={createStudent}
        batches={batches}
        cancelHref="/students"
        submitLabel="Create student"
        title="Student information"
      />
    </div>
  )
}
