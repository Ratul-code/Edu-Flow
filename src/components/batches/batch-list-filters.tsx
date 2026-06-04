import { SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type BatchListFiltersProps = {
  classLevels: string[]
  filters: {
    classLevel?: string
    groupName?: string
    medium?: string
    search?: string
    status?: string
  }
  groups: string[]
  mediums: string[]
}

export function BatchListFilters({
  classLevels,
  filters,
  groups,
  mediums,
}: BatchListFiltersProps) {
  return (
    <form className="flex flex-col gap-3 lg:flex-row lg:items-center" role="search">
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          defaultValue={filters.search}
          name="q"
          placeholder="Search by batch name"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          defaultValue={filters.classLevel ?? ""}
          name="classLevel"
        >
          <option value="">All classes</option>
          {classLevels.map((classLevel) => (
            <option key={classLevel} value={classLevel}>
              {classLevel}
            </option>
          ))}
        </select>
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          defaultValue={filters.medium ?? ""}
          name="medium"
        >
          <option value="">All mediums</option>
          {mediums.map((medium) => (
            <option key={medium} value={medium}>
              {medium}
            </option>
          ))}
        </select>
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          defaultValue={filters.groupName ?? ""}
          name="groupName"
        >
          <option value="">All groups</option>
          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
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
        <Button render={<Link href="/batches" />} variant="outline">
          <XIcon data-icon="inline-start" />
          Clear
        </Button>
      </div>
    </form>
  )
}
