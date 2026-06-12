import { MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";

import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog";
import { StatusBadge } from "@/components/app/status-badge";
import { StudentEditSheet } from "@/components/students/student-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { archiveStudent, updateStudent } from "@/lib/actions/students";
import type { BatchRecord } from "@/lib/data/batches";
import type { StudentRecord } from "@/lib/data/students";

type StudentsTableProps = {
  assignedBatchIdsByStudent?: Record<string, string[]>;
  batches?: BatchRecord[];
  currentPath?: string;
  students: StudentRecord[];
};

export function StudentsTable({
  assignedBatchIdsByStudent = {},
  batches = [],
  currentPath = "/students",
  students,
}: StudentsTableProps) {
  const batchById = new Map(batches.map((batch) => [batch.id, batch]));

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 pl-4 text-xs font-medium">Student</TableHead>
          <TableHead className="h-9 text-xs font-medium">Phone</TableHead>
          <TableHead className="h-9 text-xs font-medium">Class</TableHead>
          <TableHead className="h-9 text-xs font-medium">Medium</TableHead>
          <TableHead className="h-9 text-xs font-medium">Group</TableHead>
          <TableHead className="h-9 text-xs font-medium">Batches</TableHead>
          <TableHead className="h-9 text-xs font-medium">Status</TableHead>
          <TableHead className="h-9 w-10" />
        </TableRow>
      </TableHeader >
      <TableBody>
        {students.map((student) => (
          <TableRow className="cursor-pointer" key={student.id}>
            <TableCell className="py-3 pl-4">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-muted text-xs font-semibold">
                    {initials(student.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    className="cursor-pointer text-sm font-medium leading-none hover:underline"
                    href={`/students/${student.id}`}
                  >
                    {student.name}
                  </Link>
                  {student.tags.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {student.tags.slice(0, 2).map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </TableCell>
            <TableCell className="py-3 text-sm text-muted-foreground">
              {student.phone || "No phone"}
            </TableCell>
            <TableCell className="py-3 text-sm">{student.class_level || "-"}</TableCell>
            <TableCell className="py-3 text-sm">{student.medium || "-"}</TableCell>
            <TableCell className="py-3 text-sm">{student.group_name || "-"}</TableCell>
            <TableCell className="py-3">
              <BatchChips
                batchIds={assignedBatchIdsByStudent[student.id] ?? []}
                batchById={batchById}
              />
            </TableCell>
            <TableCell className="py-3">
              <StatusBadge status={student.status} />
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
                  <span className="sr-only">Student actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href={`/students/${student.id}`} />}>
                    View profile
                  </DropdownMenuItem>
                  <StudentEditSheet
                    action={updateStudent.bind(null, student.id)}
                    assignedBatchIds={assignedBatchIdsByStudent[student.id] ?? []}
                    batches={batches}
                    returnPath={currentPath}
                    student={student}
                    trigger={
                      <DropdownMenuItem render={<button type="button" />}>
                        Edit student
                      </DropdownMenuItem>
                    }
                  />
                  {student.status === "active" ? (
                    <>
                      <DropdownMenuSeparator />
                      <ArchiveConfirmDialog
                        action={archiveStudent.bind(null, student.id)}
                        description={`This will archive ${student.name} and remove them from active student lists.`}
                        itemName="student"
                        returnPath={currentPath}
                        title="Archive student?"
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
  );
}

function BatchChips({
  batchById,
  batchIds,
}: {
  batchById: Map<string, BatchRecord>;
  batchIds: string[];
}) {
  const batches = batchIds
    .map((batchId) => batchById.get(batchId))
    .filter((batch): batch is BatchRecord => Boolean(batch));

  if (!batches.length) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  return (
    <div className="flex max-w-64 flex-wrap gap-1">
      {batches.map((batch) => (
        <Badge key={batch.id} variant="secondary" className="text-xs font-normal">
          {batch.name}
        </Badge>
      ))}
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <Badge className="border-info/20 bg-info/10 text-info" variant="outline">
      {tag}
    </Badge>
  );
}

function initials(name: string) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return letters.toUpperCase() || "ST";
}
