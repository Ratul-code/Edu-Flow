import { EyeIcon } from "lucide-react"
import Link from "next/link"

import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog"
import { StatusBadge } from "@/components/app/status-badge"
import { TeacherEditSheet } from "@/components/teachers/teacher-form"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { archiveTeacher, updateTeacher } from "@/lib/actions/teachers"
import type { TeacherRecord } from "@/lib/data/teachers"

type TeachersTableProps = {
  currentPath?: string
  teachers: TeacherRecord[]
}

export function TeachersTable({
  currentPath = "/teachers",
  teachers,
}: TeachersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Default salary</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teachers.map((teacher) => (
          <TableRow key={teacher.id}>
            <TableCell className="font-medium">
              <Link className="hover:underline" href={`/teachers/${teacher.id}`}>
                {teacher.name}
              </Link>
            </TableCell>
            <TableCell>{teacher.phone || "-"}</TableCell>
            <TableCell>{teacher.subject_specialty || "-"}</TableCell>
            <TableCell>{formatTaka(teacher.default_monthly_salary)}</TableCell>
            <TableCell>
              <StatusBadge status={teacher.status} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  render={<Link href={`/teachers/${teacher.id}`} />}
                  size="icon-sm"
                  variant="ghost"
                >
                  <EyeIcon />
                  <span className="sr-only">View teacher</span>
                </Button>
                <TeacherEditSheet
                  action={updateTeacher.bind(null, teacher.id, currentPath)}
                  teacher={teacher}
                  triggerVariant="icon"
                />
                {teacher.status === "active" ? (
                  <ArchiveConfirmDialog
                    action={archiveTeacher.bind(null, teacher.id)}
                    description={`This will archive ${teacher.name} and remove them from active teacher lists.`}
                    itemName="teacher"
                    returnPath={currentPath}
                    title="Archive teacher?"
                    triggerSize="icon-sm"
                  />
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
