import { EyeIcon } from "lucide-react";
import Link from "next/link";

import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog";
import { StatusBadge } from "@/components/app/status-badge";
import { StudentEditSheet } from "@/components/students/student-form";
import { Button } from "@/components/ui/button";
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
        <TableRow>
          <TableHead className="w-12 text-center">#</TableHead>
          <TableHead> Name</TableHead >
          <TableHead>Class</TableHead>
          <TableHead>Medium</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow >
      </TableHeader >
      <TableBody>
        {students.map((student, index) => (
          <TableRow key={student.id}>
            <TableCell className="text-center text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell className="font-medium">
              <Link
                className="text-emerald-800 hover:underline"
                href={`/students/${student.id}`}
              >
                {student.name}
              </Link>
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                {student.phone || "No phone"}
              </span>
            </TableCell>
            <TableCell>{student.class_level || "-"}</TableCell>
            <TableCell>{student.medium || "-"}</TableCell>
            <TableCell>{student.group_name || "-"}</TableCell>
            <TableCell>
              <BatchChips
                batchIds={assignedBatchIdsByStudent[student.id] ?? []}
                batchById={batchById}
              />
            </TableCell>
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
                <StudentEditSheet
                  action={updateStudent.bind(null, student.id)}
                  assignedBatchIds={assignedBatchIdsByStudent[student.id] ?? []}
                  batches={batches}
                  returnPath={currentPath}
                  student={student}
                  triggerSize="icon-sm"
                />
                {student.status === "active" ? (
                  <ArchiveConfirmDialog
                    action={archiveStudent.bind(null, student.id)}
                    description={`This will archive ${student.name} and remove them from active student lists.`}
                    itemName="student"
                    returnPath={currentPath}
                    title="Archive student?"
                    triggerSize="icon-sm"
                  />
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table >
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
    <div className="flex max-w-64 flex-wrap gap-1.5">
      {batches.map((batch) => (
        <span
          className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
          key={batch.id}
        >
          {batch.name}
        </span>
      ))}
    </div>
  );
}
