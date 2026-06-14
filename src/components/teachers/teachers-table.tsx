import { MoreHorizontalIcon } from "lucide-react"
import Link from "next/link"

import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog"
import { StatusBadge } from "@/components/app/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { archiveTeacher } from "@/lib/actions/teachers"
import type { TeacherRecord } from "@/lib/data/teachers"

type TeachersTableProps = {
  batchCountsByTeacherId?: Record<string, number>
  currentPath?: string
  teachers: TeacherRecord[]
}

export function TeachersTable({
  batchCountsByTeacherId = {},
  currentPath = "/teachers",
  teachers,
}: TeachersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 pl-4 text-xs font-medium">Teacher</TableHead>
          <TableHead className="h-9 text-xs font-medium">Phone</TableHead>
          <TableHead className="h-9 text-xs font-medium">Subject Specialty</TableHead>
          <TableHead className="h-9 text-right text-xs font-medium">Batches</TableHead>
          <TableHead className="h-9 text-right text-xs font-medium">Monthly Salary</TableHead>
          <TableHead className="h-9 text-xs font-medium">Status</TableHead>
          <TableHead className="h-9 w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {teachers.map((teacher) => (
          <TableRow className="cursor-pointer" key={teacher.id}>
            <TableCell className="py-3 pl-4">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-muted text-xs font-semibold">
                    {initials(teacher.name)}
                  </AvatarFallback>
                </Avatar>
                <Link
                  className="cursor-pointer text-sm font-medium hover:underline"
                  href={`/teachers/${teacher.id}`}
                >
                  {teacher.name}
                </Link>
              </div>
            </TableCell>
            <TableCell className="py-3 text-sm text-muted-foreground">
              {teacher.phone || "-"}
            </TableCell>
            <TableCell className="py-3 text-sm">
              <SubjectBadges value={teacher.subject_specialty} />
            </TableCell>
            <TableCell className="py-3 text-right text-sm">
              {(batchCountsByTeacherId[teacher.id] ?? 0).toLocaleString("en-BD")}
            </TableCell>
            <TableCell className="py-3 text-right text-sm font-medium">
              {formatTaka(teacher.default_monthly_salary)}
            </TableCell>
            <TableCell className="py-3">
              <StatusBadge status={teacher.status} />
            </TableCell>
            <TableCell className="py-3">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      className="size-7 cursor-pointer"
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    />
                  }
                >
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">Teacher actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href={`/teachers/${teacher.id}`} />}>
                    View profile
                  </DropdownMenuItem>
                {teacher.status === "active" ? (
                  <>
                    <DropdownMenuSeparator />
                    <ArchiveConfirmDialog
                      action={archiveTeacher.bind(null, teacher.id)}
                      description={`This will archive ${teacher.name} and remove them from active teacher lists.`}
                      itemName="teacher"
                      returnPath={currentPath}
                      title="Archive teacher?"
                      trigger={
                        <DropdownMenuItem
                          render={<button type="button" />}
                          variant="destructive"
                        >
                          Archive
                        </DropdownMenuItem>
                      }
                    />
                  </>
                ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
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

function initials(name: string) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  return letters.toUpperCase() || "TC"
}

function SubjectBadges({ value }: { value: string | null }) {
  const subjects = tagsFromText(value)

  if (!subjects.length) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <div className="flex max-w-[220px] flex-wrap gap-1">
      {subjects.map((subject) => (
        <Badge key={subject} variant="outline">
          {subject}
        </Badge>
      ))}
    </div>
  )
}

function tagsFromText(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}
