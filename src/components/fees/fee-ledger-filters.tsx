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
  SelectValue,
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
  { label: "Overdue + due", value: "attention" },
  { label: "All statuses", value: "all" },
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
      className="flex flex-col gap-3 rounded-lg bg-muted/20 p-3 xl:flex-row xl:items-center"
      onSubmit={(event) => event.preventDefault()}
      role="search"
    >
      <input name="month" type="hidden" value={month} />
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-busy={isPending}
          className="h-10 rounded-full pl-10 text-sm"
          name="q"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search student, phone, or class"
          value={search}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,11rem)_minmax(0,14rem)_auto] items-center">
        <Select
          name="status"
          onValueChange={(value) => replaceParam("status", value ?? "")}
          value={filters.status ?? "attention"}
        >
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Overdue + due" />
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
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="All batches" />
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
          className="w-full px-4 text-sm sm:w-auto"
          onClick={clearFilters}
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
