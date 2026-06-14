import { CalculatorIcon } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/app/status-badge";
import { FeeOverrideForm } from "@/components/batches/fee-override-form";
import { RemoveStudentBatchDialog } from "@/components/batches/remove-student-batch-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  archiveStudentBatch,
  updateStudentBatchFeeOverride,
} from "@/lib/actions/batches";
import { recalculateCurrentStudentMonthlyLedger } from "@/lib/actions/fees";
import type { BatchRecord, StudentBatchRecord } from "@/lib/data/batches";

type BatchAssignmentsTableProps = {
  assignments: StudentBatchRecord[];
  batch: BatchRecord;
  currentPage?: number;
  getPageHref?: (page: number) => string;
  pageSize?: number;
  startIndex?: number;
  totalCount?: number;
};

export function BatchAssignmentsTable({
  assignments,
  batch,
  currentPage = 1,
  getPageHref = (page) => `?assignmentPage=${page}`,
  pageSize = assignments.length || 1,
  startIndex = 0,
  totalCount = assignments.length,
}: BatchAssignmentsTableProps) {
  if (!assignments.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No students are assigned to this batch yet.
      </p>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Fee used</TableHead>
            <TableHead>Fee override</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment, index) => (
            <TableRow key={assignment.id}>
              <TableCell className="text-center text-muted-foreground">
                {startIndex + index + 1}
              </TableCell>
              <TableCell className="font-medium">
                {assignment.student?.name ?? "Unknown student"}
              </TableCell>
              <TableCell>{assignment.student?.class_level ?? "-"}</TableCell>
              <TableCell>{formatTaka(feeUsed(batch, assignment))}</TableCell>
              <TableCell>
                <FeeOverrideForm
                  action={updateStudentBatchFeeOverride.bind(
                    null,
                    batch.id,
                    assignment.id
                  )}
                  feeUsed={feeUsed(batch, assignment)}
                  initialValue={feeOverrideValue(assignment)}
                />
              </TableCell>
              <TableCell>
                <StatusBadge status={assignment.status} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {assignment.status === "active" ? (
                    <form
                      action={recalculateCurrentStudentMonthlyLedger.bind(
                        null,
                        assignment.student_id,
                        `/batches/${batch.id}`
                      )}
                    >
                      <Button size="icon-sm" type="submit" variant="ghost">
                        <CalculatorIcon />
                        <span className="sr-only">
                          Recalculate current month fee
                        </span>
                      </Button>
                    </form>
                  ) : null}
                  {assignment.status === "active" ? (
                    <RemoveStudentBatchDialog
                      action={archiveStudentBatch.bind(
                        null,
                        batch.id,
                        assignment.id
                      )}
                      batchName={batch.name}
                      studentName={assignment.student?.name ?? "this student"}
                    />
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              disabled={currentPage <= 1}
              render={
                currentPage > 1 ? (
                  <Link href={getPageHref(currentPage - 1)} />
                ) : undefined
              }
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            <Button
              disabled={currentPage >= totalPages}
              render={
                currentPage < totalPages ? (
                  <Link href={getPageHref(currentPage + 1)} />
                ) : undefined
              }
              size="sm"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function feeUsed(batch: BatchRecord, assignment: StudentBatchRecord) {
  return assignment.fee_override ?? assignment.custom_fee_override ?? batch.monthly_fee;
}

function feeOverrideValue(assignment: StudentBatchRecord) {
  return assignment.fee_override ?? assignment.custom_fee_override;
}

function formatTaka(value: number | string | null) {
  return `৳${Number(value ?? 0).toLocaleString("en-BD")}`;
}
