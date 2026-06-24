import { PageHeader } from "@/components/app/page-header"
import { SmsTemplatesManager } from "@/components/communication/sms-templates-manager"
import {
  createSmsTemplate,
  deleteSmsTemplate,
  updateSmsTemplate,
} from "@/lib/actions/sms"
import { requireAdminContext } from "@/lib/auth/user"
import { getTenantSmsSettings, listAllSmsTemplates } from "@/lib/data/sms"

export default async function CommunicationTemplatesPage() {
  const admin = await requireAdminContext()
  const [settings, templates] = await Promise.all([
    getTenantSmsSettings(admin.tenantId),
    listAllSmsTemplates(admin.tenantId),
  ])

  return (
    <div className="space-y-5 p-4 md:p-6">
      <PageHeader
        description="Create and edit reusable SMS templates for manual sends and automated communication rules."
        title="Templates"
      />
      <SmsTemplatesManager
        createAction={createSmsTemplate}
        deleteAction={deleteSmsTemplate}
        smsSignature={settings.sms_signature}
        templates={templates}
        updateAction={updateSmsTemplate}
      />
    </div>
  )
}
