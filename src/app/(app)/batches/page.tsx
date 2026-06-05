import { PlusIcon } from "lucide-react"
import Link from "next/link"

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
import { requireAdminContext } from "@/lib/auth/user"
import {
  listBatchClassLevels,
  listBatchGroups,
  listBatchMediums,
  listBatches,
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
  const [batches, classLevels, mediums, groups] = await Promise.all([
    listBatches(admin.tenantId, filters),
    listBatchClassLevels(admin.tenantId),
    listBatchMediums(admin.tenantId),
    listBatchGroups(admin.tenantId),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        badge={`${batches.length} shown`}
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
          <BatchListFilters
            classLevels={classLevels}
            filters={filters}
            groups={groups}
            mediums={mediums}
          />
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
        </CardContent>
      </Card>
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

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function statusParam(
  value: string | string[] | undefined
): BatchStatus | "all" {
  const status = stringParam(value)

  return status === "active" || status === "archived" ? status : "all"
}
