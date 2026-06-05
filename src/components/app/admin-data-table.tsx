import type { ModuleColumn } from "@/lib/admin/module-config"
import { StatusBadge } from "@/components/app/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type AdminDataTableProps = {
  columns: ModuleColumn[]
  rows?: Array<Record<string, string>>
}

export function AdminDataTable({ columns, rows = [] }: AdminDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-center">#</TableHead>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={`${row.id ?? "row"}-${index}`}>
            <TableCell className="text-center text-muted-foreground">
              {index + 1}
            </TableCell>
            {columns.map((column) => (
              <TableCell key={column.key}>
                {column.key === "status" ? (
                  <StatusBadge status={row[column.key] ?? "Ready"} />
                ) : (
                  row[column.key]
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
