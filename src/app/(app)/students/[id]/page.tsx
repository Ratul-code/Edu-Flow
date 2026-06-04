import { ArchiveIcon, PencilIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/page-header"
import { StatusBadge } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { archiveStudent } from "@/lib/actions/students"
import { requireAdminContext } from "@/lib/auth/user"
import { getStudentById } from "@/lib/data/students"

type StudentDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const admin = await requireAdminContext()
  const { id } = await params
  const student = await getStudentById(admin.tenantId, id)

  if (!student) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={student.status}
        description="Student details are scoped to the current tenant."
        title={student.name}
      />
      <div className="flex flex-wrap gap-2">
        <Button render={<Link href={`/students/${student.id}/edit`} />}>
          <PencilIcon data-icon="inline-start" />
          Edit student
        </Button>
        {student.status === "active" ? (
          <form action={archiveStudent.bind(null, student.id)}>
            <Button type="submit" variant="outline">
              <ArchiveIcon data-icon="inline-start" />
              Archive
            </Button>
          </form>
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Admission and academic information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Phone" value={student.phone} />
            <DetailItem label="Class level" value={student.class_level} />
            <DetailItem label="Medium" value={student.medium} />
            <DetailItem label="Group" value={student.group_name} />
            <DetailItem label="School" value={student.school} />
            <DetailItem
              label="Admission date"
              value={formatDate(student.admission_date)}
            />
            <DetailItem
              label="Tags"
              value={student.tags.length ? student.tags.join(", ") : null}
            />
            <DetailItem
              label="Status"
              value={<StatusBadge status={student.status} />}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Guardian</CardTitle>
            <CardDescription>Primary guardian contact.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <DetailItem label="Guardian name" value={student.guardian_name} />
            <DetailItem label="Guardian phone" value={student.guardian_phone} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {student.notes || "No notes added."}
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}
