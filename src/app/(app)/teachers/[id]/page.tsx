import { notFound } from "next/navigation"

import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog"
import { PageHeader } from "@/components/app/page-header"
import { StatusBadge } from "@/components/app/status-badge"
import { TeacherEditSheet } from "@/components/teachers/teacher-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { archiveTeacher, updateTeacher } from "@/lib/actions/teachers"
import { requireAdminContext } from "@/lib/auth/user"
import { getTeacherById } from "@/lib/data/teachers"

type TeacherDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function TeacherDetailPage({
  params,
}: TeacherDetailPageProps) {
  const admin = await requireAdminContext()
  const { id } = await params
  const teacher = await getTeacherById(admin.tenantId, id)

  if (!teacher) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={teacher.status}
        description="Teacher details are scoped to the current tenant."
        title={teacher.name}
      />
      <div className="flex flex-wrap gap-2">
        <TeacherEditSheet
          action={updateTeacher.bind(null, teacher.id, `/teachers/${teacher.id}`)}
          teacher={teacher}
        />
        {teacher.status === "active" ? (
          <ArchiveConfirmDialog
            action={archiveTeacher.bind(null, teacher.id)}
            description={`This will archive ${teacher.name} and remove them from active teacher lists.`}
            itemName="teacher"
            returnPath="/teachers"
            title="Archive teacher?"
          />
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Teaching and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Phone" value={teacher.phone} />
            <DetailItem
              label="Subject specialty"
              value={teacher.subject_specialty}
            />
            <DetailItem
              label="Default monthly salary"
              value={formatTaka(teacher.default_monthly_salary)}
            />
            <DetailItem
              label="Status"
              value={<StatusBadge status={teacher.status} />}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Salary baseline</CardTitle>
            <CardDescription>Used by the salary ledger later.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-normal">
              {formatTaka(teacher.default_monthly_salary)}
            </p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {teacher.notes || "No notes added."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm">{value || "-"}</span>
    </div>
  )
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
