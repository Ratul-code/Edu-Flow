"use client"

import { SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type StudentListFiltersProps = {
  classLevels: string[]
  filters: {
    classLevel?: string
    groupName?: string
    medium?: string
    search?: string
    status?: string
    tag?: string
  }
  groups: string[]
  mediums: string[]
  tags: string[]
}

export function StudentListFilters({
  classLevels,
  filters,
  groups,
  mediums,
  tags,
}: StudentListFiltersProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(filters.search ?? "")
  const hasMounted = useRef(false)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      const nextSearch = search.trim()

      if (nextSearch) {
        params.set("q", nextSearch)
      } else {
        params.delete("q")
      }

      params.delete("page")

      const nextHref = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname

      startTransition(() => {
        router.replace(nextHref, { scroll: false })
      })
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [pathname, router, search])

  return (
    <form
      action="/students"
      className="flex flex-col gap-3 lg:flex-row lg:items-center"
      role="search"
    >
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 pl-9 text-base"
          aria-busy={isPending}
          name="q"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or phone"
          value={search}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          defaultValue={filters.tag ?? ""}
          name="tag"
        >
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          defaultValue={filters.status ?? "all"}
          name="status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <Button className="h-10 px-4 text-base" type="submit">
          <SearchIcon data-icon="inline-start" />
          Search
        </Button>
        <Button
          className="h-10 px-4 text-base"
          render={<Link href="/students" />}
          variant="outline"
        >
          <XIcon data-icon="inline-start" />
          Clear
        </Button>
      </div>
    </form>
  )
}
