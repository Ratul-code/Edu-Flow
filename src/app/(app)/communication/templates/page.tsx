import { CommunicationPage } from "@/components/communication/communication-page"
import { requireAdminContext } from "@/lib/auth/user"

export default async function CommunicationTemplatesPage() {
  const admin = await requireAdminContext()

  return (
    <CommunicationPage
      description="Manage reusable message copy and approved variables for operational communication."
      eyebrow="Templates"
      tenantName={admin.tenantName}
      title="Templates"
      variant="templates"
    />
  )
}
