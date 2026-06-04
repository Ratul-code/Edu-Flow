import { ArchiveIcon } from "lucide-react"

import {
  archiveStudentBatch,
  updateStudentBatchFeeOverride,
} from "@/lib/actions/batches"
import type { BatchRecord, StudentBatchRecord } from "@/lib/data/batches"
import { StatusBadge } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type BatchAssignmentsTableProps = {
  assignments: StudentBatchRecord[]
  batch: BatchRecord
}

export function BatchAssignmentsTable({
  assignments,
  batch,
}: BatchAssignmentsTableProps) {
  if (!assignments.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No students are assigned to this batch yet.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Fee used</TableHead>
          <TableHead>Fee override</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell className="font-medium">
              {assignment.student?.name ?? "Unknown student"}
            </TableCell>
            <TableCell>{assignment.student?.class_level ?? "-"}</TableCell>
            <TableCell>{formatTaka(feeUsed(batch, assignment))}</TableCell>
            <TableCell>
              <form
                action={updateStudentBatchFeeOverride.bind(
                  null,
                  batch.id,
                  assignment.id
                )}
                className="flex min-w-36 items-center gap-2"
              >
                <input
                  className="h-8 w-24 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  min="0"
                  name="fee_override"
                  defaultValue={String(assignment.fee_override ?? "")}
                  placeholder="Batch fee"
                  step="0.01"
                  type="number"
                />
                <Button size="sm" type="submit" variant="outline">
                  Save
                </Button>
              </form>
            </TableCell>
            <TableCell>
              <StatusBadge status={assignment.status} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                {assignment.status === "active" ? (
                  <form
                    action={archiveStudentBatch.bind(
                      null,
                      batch.id,
                      assignment.id
                    )}
                  >
                    <Button size="icon-sm" type="submit" variant="ghost">
                      <ArchiveIcon />
                      <span className="sr-only">Archive assignment</span>
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

function feeUsed(batch: BatchRecord, assignment: StudentBatchRecord) {
  return assignment.fee_override ?? assignment.custom_fee_override ?? batch.monthly_fee
}

function formatTaka(value: number | string | null) {
  return `৳${Number(value ?? 0).toLocaleString("en-BD")}`
}
