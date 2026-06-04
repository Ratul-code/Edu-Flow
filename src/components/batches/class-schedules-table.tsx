import { ArchiveIcon } from "lucide-react"

import { archiveClassSchedule } from "@/lib/actions/batches"
import type { ClassScheduleRecord } from "@/lib/data/batches"
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
        {schedules.map((schedule) => (
          <TableRow key={schedule.id}>
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
                  <form
                    action={archiveClassSchedule.bind(
                      null,
                      batchId,
                      schedule.id
                    )}
                  >
                    <Button size="icon-sm" type="submit" variant="ghost">
                      <ArchiveIcon />
                      <span className="sr-only">Archive schedule</span>
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

function weekday(value: number) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][value] ?? "-"
}

function formatTime(value: string) {
  return value.slice(0, 5)
}
