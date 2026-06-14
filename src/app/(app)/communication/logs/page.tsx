import { CommunicationPage } from "@/components/communication/communication-page"
import { requireAdminContext } from "@/lib/auth/user"

export default async function CommunicationLogsPage() {
  const admin = await requireAdminContext()

  return (
    <CommunicationPage
      description="Review provider delivery results, failures, and message history once real sends are recorded."
      eyebrow="Logs"
      tenantName={admin.tenantName}
      title="Logs"
      variant="logs"
    />
  )
}
