import { PageHeader } from "@/components/app/page-header"
import { SmsChannelCompose } from "@/components/communication/sms-channel-compose"
import { sendManualSms } from "@/lib/actions/sms"
import { requireAdminContext } from "@/lib/auth/user"
import { getSmsMode } from "@/lib/sms/config"
import {
  getSmsWallet,
  getTenantSmsSettings,
  listSmsTemplates,
} from "@/lib/data/sms"
import { getCachedStudentsRouteData } from "@/lib/data/students"

export default async function CommunicationSmsPage() {
  const admin = await requireAdminContext()
  const smsMode = getSmsMode()
  const [wallet, settings, routeData] = await Promise.all([
    getSmsWallet(admin.tenantId),
    getTenantSmsSettings(admin.tenantId),
    getCachedStudentsRouteData(
      admin.tenantId,
      { status: "active" },
      { page: 1, pageSize: 1000 }
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
        assignedBatchIdsByStudent={routeData.assignedBatchIdsByStudent}
        batches={routeData.batches}
        classLevels={routeData.classLevels}
        groups={routeData.groups}
        mediums={routeData.mediums}
        tags={routeData.tags}
        templates={templates}
        sendAction={sendManualSms}
        smsMode={smsMode}
        smsSignature={settings.sms_signature}
        students={routeData.studentPage.students}
      />
    </div>
  )
}
