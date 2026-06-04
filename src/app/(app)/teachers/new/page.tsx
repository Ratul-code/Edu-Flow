import { PageHeader } from "@/components/app/page-header"
import { TeacherForm } from "@/components/teachers/teacher-form"
import { createTeacher } from "@/lib/actions/teachers"
import { requireAdminContext } from "@/lib/auth/user"

export default async function NewTeacherPage() {
  await requireAdminContext()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Add a teacher profile with specialty and default salary."
        title="Add teacher"
      />
      <TeacherForm
        action={createTeacher}
        cancelHref="/teachers"
        submitLabel="Create teacher"
        title="Teacher information"
      />
    </div>
  )
}
