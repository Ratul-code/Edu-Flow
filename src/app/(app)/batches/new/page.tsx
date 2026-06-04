import { PageHeader } from "@/components/app/page-header"
import { BatchForm } from "@/components/batches/batch-form"
import { createBatch } from "@/lib/actions/batches"
import { requireAdminContext } from "@/lib/auth/user"

export default async function NewBatchPage() {
  await requireAdminContext()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Create a batch with fee, class level, medium/group, and status."
        title="Create batch"
      />
      <BatchForm
        action={createBatch}
        cancelHref="/batches"
        submitLabel="Create batch"
        title="Batch information"
      />
    </div>
  )
}
