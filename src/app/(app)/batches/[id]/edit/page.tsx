import { notFound, redirect } from "next/navigation"

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

  redirect(`/batches/${batch.id}`)
}
