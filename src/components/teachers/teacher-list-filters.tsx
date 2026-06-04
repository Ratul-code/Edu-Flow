import { SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type TeacherListFiltersProps = {
  filters: {
    search?: string
    status?: string
  }
}

export function TeacherListFilters({ filters }: TeacherListFiltersProps) {
  return (
    <form className="flex flex-col gap-3 lg:flex-row lg:items-center" role="search">
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          defaultValue={filters.search}
          name="q"
          placeholder="Search by name or phone"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          defaultValue={filters.status ?? "all"}
          name="status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <Button type="submit">
          <SearchIcon data-icon="inline-start" />
          Search
        </Button>
        <Button render={<Link href="/teachers" />} variant="outline">
          <XIcon data-icon="inline-start" />
          Clear
        </Button>
      </div>
    </form>
  )
}
