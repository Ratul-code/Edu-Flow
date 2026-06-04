import { ArchiveIcon, EyeIcon, PencilIcon } from "lucide-react"
import Link from "next/link"

import { archiveBatch } from "@/lib/actions/batches"
import type { BatchRecord } from "@/lib/data/batches"
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

type BatchesTableProps = {
  batches: BatchRecord[]
}

export function BatchesTable({ batches }: BatchesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Batch</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Medium</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Monthly fee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((batch) => (
          <TableRow key={batch.id}>
            <TableCell className="font-medium">
              <Link className="hover:underline" href={`/batches/${batch.id}`}>
                {batch.name}
              </Link>
            </TableCell>
            <TableCell>{batch.class_level || "-"}</TableCell>
            <TableCell>{batch.medium || "-"}</TableCell>
            <TableCell>{batch.group_name || "-"}</TableCell>
            <TableCell>{formatTaka(batch.monthly_fee)}</TableCell>
            <TableCell>
              <StatusBadge status={batch.status} />
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  render={<Link href={`/batches/${batch.id}`} />}
                  size="icon-sm"
                  variant="ghost"
                >
                  <EyeIcon />
                  <span className="sr-only">View batch</span>
                </Button>
                <Button
                  render={<Link href={`/batches/${batch.id}/edit`} />}
                  size="icon-sm"
                  variant="ghost"
                >
                  <PencilIcon />
                  <span className="sr-only">Edit batch</span>
                </Button>
                {batch.status === "active" ? (
                  <form action={archiveBatch.bind(null, batch.id)}>
                    <Button size="icon-sm" type="submit" variant="ghost">
                      <ArchiveIcon />
                      <span className="sr-only">Archive batch</span>
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
