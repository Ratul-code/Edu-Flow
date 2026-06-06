import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAdminContext } from "@/lib/auth/user"
import { checkClassLevelsTableExists, listClassLevels } from "@/lib/data/class-levels"
import { ClassLevelsManager } from "@/components/settings/class-levels-manager"
import { BillingSettingsForm } from "@/components/settings/billing-settings-form"
import { getBillingSettings } from "@/lib/data/fees"
import { CenterProfileCard } from "@/components/settings/center-profile-card"
import { listAcademicGroups } from "@/lib/data/academic-groups"
import { AcademicGroupsManager } from "@/components/settings/academic-groups-manager"
import { TeacherPaymentSettingsForm } from "@/components/settings/teacher-payment-settings-form"
import { getTenantProfile } from "@/lib/data/tenants"
import { getTeacherPaymentSettings } from "@/lib/data/teacher-payment-settings"

export default async function SettingsPage() {
  const admin = await requireAdminContext()

  const tableExists = await checkClassLevelsTableExists()
  const [tenant, billingSettings, teacherPaymentSettings, classLevels, academicGroups] = await Promise.all([
    getTenantProfile(admin.tenantId),
    getBillingSettings(admin.tenantId),
    getTeacherPaymentSettings(admin.tenantId),
    tableExists ? listClassLevels(admin.tenantId) : Promise.resolve([]),
    listAcademicGroups(admin.tenantId),
  ])
  const tenantProfile = {
    address: tenant?.address ?? null,
    contact_phone: tenant?.contact_phone ?? null,
    email: tenant?.email ?? null,
    name: tenant?.name ?? admin.tenantName,
    secondary_phone: tenant?.secondary_phone ?? null,
  }

  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure your coaching center profile, preferences, and dynamic taxonomies."
      />

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-6">
          <CenterProfileCard tenant={tenantProfile} />
          <TeacherPaymentSettingsForm settings={teacherPaymentSettings} />
        </div>

        <div className="flex flex-col gap-6">
          <BillingSettingsForm settings={billingSettings} />

          <Card>
            <CardHeader>
              <CardTitle>Academic Taxonomy</CardTitle>
              <CardDescription>
                Define levels, classes, or grades to categorize student groups.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClassLevelsManager classLevels={classLevels} tableExists={tableExists} />
              <AcademicGroupsManager groups={academicGroups} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
