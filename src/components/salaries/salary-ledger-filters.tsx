"use client"

import { SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SalaryLedgerFiltersProps = {
  filters: {
    search?: string
    status?: string
  }
  month: string
}

const statuses = [
  { label: "All status", value: "all" },
  { label: "Due", value: "unpaid" },
  { label: "Partial", value: "partial" },
  { label: "Paid", value: "paid" },
  { label: "Waived", value: "waived" },
]

export function SalaryLedgerFilters({
  filters,
  month,
}: SalaryLedgerFiltersProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(filters.search ?? "")
  const hasMounted = useRef(false)

  const replaceParam = useCallback(
    function replaceParam(key: string, value: string) {
      const params = new URLSearchParams(window.location.search)

      params.set("month", month)

      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [month, pathname, router]
  )

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }

    const timeout = window.setTimeout(() => {
      replaceParam("q", search.trim())
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [replaceParam, search])

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(event) => event.preventDefault()}
      role="search"
    >
      <input name="month" type="hidden" value={month} />
      <div className="relative min-w-[200px] max-w-xs flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-busy={isPending}
          className="h-8 pl-8 text-sm"
          name="q"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search teacher..."
          value={search}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          name="status"
          onValueChange={(value) => replaceParam("status", value ?? "all")}
          value={filters.status ?? "all"}
        >
          <SelectTrigger className="h-8 w-[120px]" size="sm">
            <SelectValue placeholder="Paid status" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          className="ml-auto gap-1.5"
          render={<Link href={`/salaries?month=${month}`} />}
          size="sm"
          variant="outline"
        >
          <XIcon data-icon="inline-start" />
          Clear
        </Button>
      </div>
    </form>
  )
}
