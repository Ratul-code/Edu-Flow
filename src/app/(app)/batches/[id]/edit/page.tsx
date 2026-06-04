import { notFound } from "next/navigation"

import { PageHeader } from "@/components/app/page-header"
import { BatchForm } from "@/components/batches/batch-form"
import { updateBatch } from "@/lib/actions/batches"
import { requireAdminContext } from "@/lib/auth/user"
import { getBatchById } from "@/lib/data/batches"

type EditBatchPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditBatchPage({ params }: EditBatchPageProps) {
  const admin = await requireAdminContext()
  const { id } = await params
  const batch = await getBatchById(admin.tenantId, id)

  if (!batch) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Update batch details, fee, classification, or active status."
        title={`Edit ${batch.name}`}
      />
      <BatchForm
        action={updateBatch.bind(null, batch.id)}
        batch={batch}
        cancelHref={`/batches/${batch.id}`}
        submitLabel="Save changes"
        title="Batch information"
      />
    </div>
  )
}
