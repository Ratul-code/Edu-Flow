import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog"
import { archiveClassSchedule } from "@/lib/actions/batches"
import type { ClassScheduleRecord } from "@/lib/data/batches"
import { StatusBadge } from "@/components/app/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ClassSchedulesTableProps = {
  batchId: string
  schedules: ClassScheduleRecord[]
}

export function ClassSchedulesTable({
  batchId,
  schedules,
}: ClassSchedulesTableProps) {
  if (!schedules.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No weekly classes are scheduled for this batch yet.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-center">#</TableHead>
          <TableHead>Day</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule, index) => (
          <TableRow key={schedule.id}>
            <TableCell className="text-center text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell>{weekday(schedule.weekday)}</TableCell>
            <TableCell>{schedule.subject || "-"}</TableCell>
            <TableCell>
              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
            </TableCell>
            <TableCell>{schedule.teacher?.name ?? "-"}</TableCell>
            <TableCell>{schedule.room_name || "-"}</TableCell>
            <TableCell>
              <StatusBadge status={schedule.status} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                {schedule.status === "active" ? (
                  <ArchiveConfirmDialog
                    action={archiveClassSchedule.bind(
                      null,
                      batchId,
                      schedule.id
                    )}
                    description="This will archive the selected class schedule and remove it from active weekly planning."
                    itemName="schedule"
                    title="Archive schedule?"
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

function weekday(value: number) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][value] ?? "-"
}

function formatTime(value: string) {
  return value.slice(0, 5)
}
