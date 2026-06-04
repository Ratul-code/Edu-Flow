import { ArchiveIcon, EyeIcon, PencilIcon } from "lucide-react"
import Link from "next/link"

import { archiveStudent } from "@/lib/actions/students"
import type { StudentRecord } from "@/lib/data/students"
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

type StudentsTableProps = {
  students: StudentRecord[]
}

export function StudentsTable({ students }: StudentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Guardian</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Medium</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student, index) => (
          <TableRow
            className={
              index % 2 === 0
                ? "bg-white hover:bg-emerald-50"
                : "bg-emerald-50/45 hover:bg-emerald-50"
            }
            key={student.id}
          >
            <TableCell className="font-medium">
              <Link className="hover:underline" href={`/students/${student.id}`}>
                {student.name}
              </Link>
            </TableCell>
            <TableCell>{student.phone || "-"}</TableCell>
            <TableCell>{student.guardian_name || "-"}</TableCell>
            <TableCell>{student.class_level || "-"}</TableCell>
            <TableCell>{student.medium || "-"}</TableCell>
            <TableCell>{student.group_name || "-"}</TableCell>
            <TableCell>
              <StatusBadge status={student.status} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  render={<Link href={`/students/${student.id}`} />}
                  size="icon-sm"
                  variant="ghost"
                >
                  <EyeIcon />
                  <span className="sr-only">View student</span>
                </Button>
                <Button
                  render={<Link href={`/students/${student.id}/edit`} />}
                  size="icon-sm"
                  variant="ghost"
                >
                  <PencilIcon />
                  <span className="sr-only">Edit student</span>
                </Button>
                {student.status === "active" ? (
                  <form action={archiveStudent.bind(null, student.id)}>
                    <Button size="icon-sm" type="submit" variant="ghost">
                      <ArchiveIcon />
                      <span className="sr-only">Archive student</span>
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
