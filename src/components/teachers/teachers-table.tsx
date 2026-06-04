import { ArchiveIcon, EyeIcon, PencilIcon } from "lucide-react"
import Link from "next/link"

import { archiveTeacher } from "@/lib/actions/teachers"
import type { TeacherRecord } from "@/lib/data/teachers"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/app/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type TeachersTableProps = {
  teachers: TeacherRecord[]
}

export function TeachersTable({ teachers }: TeachersTableProps) {
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
                <Button
                  render={<Link href={`/teachers/${teacher.id}/edit`} />}
                  size="icon-sm"
                  variant="ghost"
                >
                  <PencilIcon />
                  <span className="sr-only">Edit teacher</span>
                </Button>
                {teacher.status === "active" ? (
                  <form action={archiveTeacher.bind(null, teacher.id)}>
                    <Button size="icon-sm" type="submit" variant="ghost">
                      <ArchiveIcon />
                      <span className="sr-only">Archive teacher</span>
                    </Button>
                  </form>
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
