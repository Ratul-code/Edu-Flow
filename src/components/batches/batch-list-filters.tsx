"use client";

import { SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
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

type BatchListFiltersProps = {
  classLevels: string[];
  filters: {
    classLevel?: string;
    groupName?: string;
    medium?: string;
    search?: string;
    status?: string;
  };
  groups: string[];
  mediums: string[];
};

export function BatchListFilters({
  classLevels,
  filters,
  groups,
  mediums,
}: BatchListFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.search ?? "");
  const hasMounted = useRef(false);

  const replaceParam = useCallback(
    function replaceParam(key: string, value: string) {
      const params = new URLSearchParams(window.location.search);

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      const nextHref = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      startTransition(() => {
        router.replace(nextHref, { scroll: false });
      });
    },
    [pathname, router]
  );

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
      <div className="relative min-w-[200px] max-w-xs flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-busy={isPending}
          className="h-8 pl-8 text-sm"
          name="q"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by batch name"
          value={search}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          name="classLevel"
          onValueChange={(value) => replaceParam("classLevel", value ?? "")}
          value={filters.classLevel ?? ""}
        >
          <SelectTrigger className="h-8 w-[130px]" size="sm">
            <SelectValue placeholder="All classes" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="">All classes</SelectItem>
              {classLevels.map((classLevel) => (
                <SelectItem key={classLevel} value={classLevel}>
                  {classLevel}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          name="medium"
          onValueChange={(value) => replaceParam("medium", value ?? "")}
          value={filters.medium ?? ""}
        >
          <SelectTrigger className="h-8 w-[110px]" size="sm">
            <SelectValue placeholder="All mediums" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="">All mediums</SelectItem>
              {mediums.map((medium) => (
                <SelectItem key={medium} value={medium}>
                  {medium}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          name="groupName"
          onValueChange={(value) => replaceParam("groupName", value ?? "")}
          value={filters.groupName ?? ""}
        >
          <SelectTrigger className="h-8 w-[110px]" size="sm">
            <SelectValue placeholder="All groups" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="">All groups</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          name="status"
          onValueChange={(value) => replaceParam("status", value ?? "")}
          value={filters.status ?? "all"}
        >
          <SelectTrigger className="h-8 w-[100px]" size="sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button className="ml-auto gap-1.5" render={<Link href="/batches" />} size="sm" variant="outline">
          <XIcon data-icon="inline-start" />
          Clear
        </Button>
      </div>
    </form>
  );
}
