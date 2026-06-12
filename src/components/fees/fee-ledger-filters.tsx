"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { BatchRecord } from "@/lib/data/batches";

type FeeLedgerFiltersProps = {
  batches: BatchRecord[];
  filters: {
    batchId?: string;
    search?: string;
    status?: string;
  };
  month: string;
};

const statuses = [
  { label: "All statuses", value: "all" },
  { label: "Overdue + due", value: "overdue_due" },
  { label: "Overdue", value: "overdue" },
  { label: "Due", value: "due" },
  { label: "Partial", value: "partial" },
  { label: "Paid", value: "paid" },
  { label: "Not started", value: "not_started" },
  { label: "Waived", value: "waived" },
];

export function FeeLedgerFilters({
  batches,
  filters,
  month,
}: FeeLedgerFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.search ?? "");
  const hasMounted = useRef(false);
  const selectedStatusLabel =
    statuses.find((status) => status.value === filters.status)?.label ??
    "All statuses";
  const selectedBatchName =
    batches.find((batch) => batch.id === filters.batchId)?.name ?? "All batches";

  const replaceParam = useCallback(
    function replaceParam(key: string, value: string) {
      const params = new URLSearchParams(window.location.search);

      params.set("month", month);

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      params.delete("page");

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [month, pathname, router]
  );

  function clearFilters() {
    const params = new URLSearchParams();
    params.set("month", month);
    setSearch("");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const timeout = window.setTimeout(() => {
      replaceParam("q", search.trim());
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [replaceParam, search]);

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
          placeholder="Search student, phone, or class"
          value={search}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          name="status"
          onValueChange={(value) => replaceParam("status", value ?? "")}
          value={filters.status ?? "all"}
        >
          <SelectTrigger className="h-8 w-[136px]" size="sm">
            <span className="block truncate">{selectedStatusLabel}</span>
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
        <Select
          name="batch"
          onValueChange={(value) => replaceParam("batch", value ?? "")}
          value={filters.batchId ?? ""}
        >
          <SelectTrigger className="h-8 w-[150px]" size="sm">
            <span className="block truncate">{selectedBatchName}</span>
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="">All batches</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          className="ml-auto gap-1.5"
          onClick={clearFilters}
          size="sm"
          type="button"
          variant="outline"
        >
          <XIcon data-icon="inline-start" />
          Clear
        </Button>
      </div>
    </form>
  );
}
