import { PageHeader } from "@/components/app/page-header"
import { SmsChannelCompose } from "@/components/communication/sms-channel-compose"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getSmsWallet,
  listSmsTemplates,
} from "@/lib/data/sms"
import { getCachedStudentsRouteData } from "@/lib/data/students"

export default async function CommunicationSmsPage() {
  const admin = await requireAdminContext()
  const [wallet, routeData] = await Promise.all([
    getSmsWallet(admin.tenantId),
    getCachedStudentsRouteData(
      admin.tenantId,
      { status: "active" },
      { page: 1, pageSize: 1 }
    ),
  ])
  const templates = await listSmsTemplates(admin.tenantId)

  return (
    <div>
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <PageHeader
          description="Select recipients, write a message, preview credits, and send SMS."
          title="Create & Send"
        />
      </div>
      <SmsChannelCompose
        availableCredits={wallet?.available_credits ?? 0}
        batches={routeData.batches}
        classLevels={routeData.classLevels}
        groups={routeData.groups}
        mediums={routeData.mediums}
        tags={routeData.tags}
        templates={templates}
        totalActiveStudents={routeData.studentPage.totalCount}
      />
    </div>
  )
}
