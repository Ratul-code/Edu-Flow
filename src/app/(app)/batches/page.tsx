import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { PageHeader } from "@/components/app/page-header"
import { BatchListFilters } from "@/components/batches/batch-list-filters"
import { BatchesTable } from "@/components/batches/batches-table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getCachedBatchesFilterOptions,
  getCachedBatchesList,
  type BatchStatus,
} from "@/lib/data/batches"

type BatchesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function BatchesPage({ searchParams }: BatchesPageProps) {
  const admin = await requireAdminContext()
  const params = await searchParams
  const filters = {
    classLevel: stringParam(params.classLevel),
    groupName: stringParam(params.groupName),
    medium: stringParam(params.medium),
    search: stringParam(params.q),
    status: statusParam(params.status),
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Create batches, manage student pricing, and plan weekly classes."
        title="Batches"
      />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle>Batch list</CardTitle>
            <CardDescription>
              Showing records for {admin.tenantName}. Batch fees feed the
              monthly student ledger.
            </CardDescription>
          </div>
          <CardAction>
            <Button render={<Link href="/batches/new" />}>
              <PlusIcon data-icon="inline-start" />
              Create batch
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Suspense fallback={<BatchesContentSkeleton />}>
            <BatchesContent
              filters={filters}
              params={params}
              tenantId={admin.tenantId}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function BatchesContent({
  filters,
  params,
  tenantId,
}: {
  filters: {
    classLevel?: string
    groupName?: string
    medium?: string
    search?: string
    status: BatchStatus | "all"
  }
  params: Record<string, string | string[] | undefined>
  tenantId: string
}) {
  const { classLevels, groups, mediums } =
    await getCachedBatchesFilterOptions(tenantId)

  return (
    <>
      <BatchListFilters
        classLevels={classLevels}
        filters={filters}
        groups={groups}
        mediums={mediums}
      />
      <Suspense fallback={<BatchesResultsSkeleton />} key={batchesContentKey(params)}>
        <BatchesResults filters={filters} params={params} tenantId={tenantId} />
      </Suspense>
    </>
  )
}

async function BatchesResults({
  filters,
  params,
  tenantId,
}: {
  filters: {
    classLevel?: string
    groupName?: string
    medium?: string
    search?: string
    status: BatchStatus | "all"
  }
  params: Record<string, string | string[] | undefined>
  tenantId: string
}) {
  const batches = await getCachedBatchesList(tenantId, filters)

  return (
    <>
      {batches.length ? (
        <BatchesTable batches={batches} currentPath={pageHref(params)} />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No batches found</EmptyTitle>
            <EmptyDescription>
              Create a batch or adjust the search and filters.
            </EmptyDescription>
          </EmptyHeader>
          <Button render={<Link href="/batches/new" />}>
            <PlusIcon data-icon="inline-start" />
            Create batch
          </Button>
        </Empty>
      )}
    </>
  )
}

function BatchesContentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-10 w-28 rounded-lg" key={index} />
          ))}
        </div>
      </div>
      <BatchesResultsSkeleton />
    </div>
  )
}

function BatchesResultsSkeleton() {
  return (
    <div className="rounded-lg border">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          className="grid grid-cols-[3rem_1.5fr_repeat(5,1fr)] gap-4 border-b p-3 last:border-b-0"
          key={index}
        >
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <Skeleton className="h-5 rounded" key={cellIndex} />
          ))}
        </div>
      ))}
    </div>
  )
}

function pageHref(params: Record<string, string | string[] | undefined>) {
  const nextParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.trim()) {
      nextParams.set(key, value)
    }
  }

  const query = nextParams.toString()

  return query ? `/batches?${query}` : "/batches"
}

function batchesContentKey(
  params: Record<string, string | string[] | undefined>
) {
  const keyParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    if (typeof value === "string" && value.trim()) {
      keyParams.set(key, value)
    }
  }

  return keyParams.toString()
}

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function statusParam(
  value: string | string[] | undefined
): BatchStatus | "all" {
  const status = stringParam(value)

  return status === "active" || status === "archived" ? status : "all"
}
