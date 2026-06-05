import { FilterIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BatchRecord } from "@/lib/data/batches"

type FeeLedgerFiltersProps = {
  batches: BatchRecord[]
  filters: {
    batchId?: string
    search?: string
    status?: string
  }
  month: string
}

const statuses = [
  { label: "Overdue + due", value: "attention" },
  { label: "All statuses", value: "all" },
  { label: "Overdue", value: "overdue" },
  { label: "Due", value: "due" },
  { label: "Partial", value: "partial" },
  { label: "Paid", value: "paid" },
  { label: "Not started", value: "not_started" },
  { label: "Waived", value: "waived" },
]

export function FeeLedgerFilters({
  batches,
  filters,
  month,
}: FeeLedgerFiltersProps) {
  return (
    <form className="grid gap-3 rounded-lg border bg-muted/20 p-3 lg:grid-cols-[1fr_170px_220px_auto]">
      <input name="month" type="hidden" value={month} />
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          defaultValue={filters.search}
          name="q"
          placeholder="Search student, phone, or class"
        />
      </div>
      <select
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        defaultValue={filters.status ?? "attention"}
        name="status"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      <select
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        defaultValue={filters.batchId ?? ""}
        name="batch"
      >
        <option value="">All batches</option>
        {batches.map((batch) => (
          <option key={batch.id} value={batch.id}>
            {batch.name}
          </option>
        ))}
      </select>
      <Button type="submit">
        <FilterIcon data-icon="inline-start" />
        Apply
      </Button>
    </form>
  )
}
