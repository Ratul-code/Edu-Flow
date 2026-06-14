import { CommunicationPage } from "@/components/communication/communication-page"
import { requireAdminContext } from "@/lib/auth/user"

export default async function CommunicationOverviewPage() {
  const admin = await requireAdminContext()

  return (
    <CommunicationPage
      description="Monitor communication readiness, channels, message history, templates, and delivery logs."
      eyebrow="Communication"
      tenantName={admin.tenantName}
      title="Communication"
      variant="overview"
    />
  )
}
