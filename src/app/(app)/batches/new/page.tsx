import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/user"

export default async function NewBatchPage() {
  await requireAdminContext()
  redirect("/batches")
}
