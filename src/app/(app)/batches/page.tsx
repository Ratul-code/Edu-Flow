import { Suspense } from "react"

import { PageHeader } from "@/components/app/page-header"
import { BatchListFilters } from "@/components/batches/batch-list-filters"
import { BatchCreateSheet } from "@/components/batches/batch-sheet"
import { BatchesTable } from "@/components/batches/batches-table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getCachedBatchesFilterOptions,
  getCachedBatchesList,
  type BatchStatus,
} from "@/lib/data/batches"
import { countTenantRecordsByStatus } from "@/lib/data/tenant-records"
import { createClient } from "@/lib/supabase/server"

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
  const [activeBatches, totalAssignedStudents] = await Promise.all([
    countTenantRecordsByStatus("batches", admin.tenantId, "active"),
    countActiveBatchAssignments(admin.tenantId),
  ])

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <PageHeader
          description={`${displayCount(activeBatches)} active · ${displayCount(totalAssignedStudents)} total students`}
          title="Batches"
        />
        <BatchCreateSheet />
      </div>
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
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
      <div className="border-b px-4 py-3">
        <BatchListFilters
          classLevels={classLevels}
          filters={filters}
          groups={groups}
          mediums={mediums}
        />
      </div>
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
  const studentCountsByBatchId = await countActiveStudentsByBatchId(tenantId)

  return (
    <>
      {batches.length ? (
        <BatchesTable
          batches={batches}
          currentPath={pageHref(params)}
          studentCountsByBatchId={studentCountsByBatchId}
        />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No batches found</EmptyTitle>
            <EmptyDescription>
              Create a batch or adjust the search and filters.
            </EmptyDescription>
          </EmptyHeader>
          <BatchCreateSheet />
        </Empty>
      )}
    </>
  )
}

function BatchesContentSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 border-b px-4 py-3 lg:flex-row lg:items-center">
        <Skeleton className="h-8 flex-1 rounded-md" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-8 w-28 rounded-md" key={index} />
          ))}
        </div>
      </div>
      <BatchesResultsSkeleton />
    </div>
  )
}

function BatchesResultsSkeleton() {
  return (
    <div>
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          className="grid grid-cols-[1.4fr_1.2fr_repeat(6,1fr)_3rem] gap-4 border-b p-3 last:border-b-0"
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

async function countActiveBatchAssignments(tenantId: string) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("student_batches")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "active")

  if (error) {
    return null
  }

  return count ?? 0
}

async function countActiveStudentsByBatchId(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_batches")
    .select("batch_id")
    .eq("tenant_id", tenantId)
    .eq("status", "active")

  if (error || !data) {
    return {}
  }

  return data.reduce<Record<string, number>>((counts, row) => {
    counts[row.batch_id] = (counts[row.batch_id] ?? 0) + 1
    return counts
  }, {})
}

function displayCount(value: number | null) {
  return (value ?? 0).toLocaleString("en-BD")
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
