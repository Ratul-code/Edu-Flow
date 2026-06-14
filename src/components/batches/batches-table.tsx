import { MoreHorizontalIcon } from "lucide-react"
import Link from "next/link"

import { ArchiveConfirmDialog } from "@/components/app/archive-confirm-dialog"
import { BatchEditSheet } from "@/components/batches/batch-sheet"
import { archiveBatch } from "@/lib/actions/batches"
import type { BatchRecord } from "@/lib/data/batches"
import { StatusBadge } from "@/components/app/status-badge"
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

type BatchesTableProps = {
  batches: BatchRecord[]
  currentPath?: string
  studentCountsByBatchId?: Record<string, number>
}

export function BatchesTable({
  batches,
  currentPath = "/batches",
  studentCountsByBatchId = {},
}: BatchesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 pl-4 text-xs font-medium">Batch Name</TableHead>
          <TableHead className="h-9 text-xs font-medium">Subject</TableHead>
          <TableHead className="h-9 text-xs font-medium">Class</TableHead>
          <TableHead className="h-9 text-xs font-medium">Medium</TableHead>
          <TableHead className="h-9 text-xs font-medium">Group</TableHead>
          <TableHead className="h-9 text-right text-xs font-medium">Monthly Fee</TableHead>
          <TableHead className="h-9 text-right text-xs font-medium">Students</TableHead>
          <TableHead className="h-9 text-xs font-medium">Status</TableHead>
          <TableHead className="h-9 w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((batch) => (
          <TableRow className="cursor-pointer" key={batch.id}>
            <TableCell className="py-3 pl-4 text-sm font-medium">
              <Link className="cursor-pointer hover:underline" href={`/batches/${batch.id}`}>
                {batch.name}
              </Link>
            </TableCell>
            <TableCell className="max-w-[220px] py-3 text-sm">
              <SubjectBadges value={batch.subject} />
            </TableCell>
            <TableCell className="py-3 text-sm">{batch.class_level || "-"}</TableCell>
            <TableCell className="py-3 text-sm">{batch.medium || "-"}</TableCell>
            <TableCell className="py-3 text-sm">{batch.group_name || "-"}</TableCell>
            <TableCell className="py-3 text-right text-sm font-medium">
              {formatTaka(batch.monthly_fee)}
            </TableCell>
            <TableCell className="py-3 text-right text-sm">
              {(studentCountsByBatchId[batch.id] ?? 0).toLocaleString("en-BD")}
            </TableCell>
            <TableCell className="py-3">
              <StatusBadge status={batch.status} />
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
                  <span className="sr-only">Batch actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href={`/batches/${batch.id}`} />}>
                    View batch
                  </DropdownMenuItem>
                  <BatchEditSheet
                    batch={batch}
                    trigger={<DropdownMenuItem render={<button type="button" />} />}
                  >
                    Edit batch
                  </BatchEditSheet>
                  {batch.status === "active" ? (
                    <>
                      <DropdownMenuSeparator />
                      <ArchiveConfirmDialog
                        action={archiveBatch.bind(null, batch.id)}
                        description={`This will archive ${batch.name} and remove it from active batch lists.`}
                        itemName="batch"
                        returnPath={currentPath}
                        title="Archive batch?"
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

function SubjectBadges({ value }: { value: string | null }) {
  const subjects = tagsFromText(value)

  if (!subjects.length) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
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
