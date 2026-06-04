import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/page-header"
import { TeacherForm } from "@/components/teachers/teacher-form"
import { updateTeacher } from "@/lib/actions/teachers"
import { requireAdminContext } from "@/lib/auth/user"
import { getTeacherById } from "@/lib/data/teachers"

type EditTeacherPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const admin = await requireAdminContext()
  const { id } = await params
  const teacher = await getTeacherById(admin.tenantId, id)

  if (!teacher) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Update teacher details or restore an archived profile."
        title={`Edit ${teacher.name}`}
      />
      <TeacherForm
        action={updateTeacher.bind(null, teacher.id)}
        cancelHref={`/teachers/${teacher.id}`}
        submitLabel="Save changes"
        teacher={teacher}
        title="Teacher information"
      />
    </div>
  )
}
