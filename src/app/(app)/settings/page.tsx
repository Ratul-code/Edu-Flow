import { PageHeader } from "@/components/app/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireAdminContext } from "@/lib/auth/user"
import { checkClassLevelsTableExists, listClassLevels } from "@/lib/data/class-levels"
import { ClassLevelsManager } from "@/components/settings/class-levels-manager"
import { BillingSettingsForm } from "@/components/settings/billing-settings-form"
import { getBillingSettings } from "@/lib/data/fees"
import { CenterProfileCard } from "@/components/settings/center-profile-card"
import { listAcademicGroups } from "@/lib/data/academic-groups"
import { AcademicGroupsManager } from "@/components/settings/academic-groups-manager"
import { MediumOptionsManager } from "@/components/settings/medium-options-manager"
import { TeacherPaymentSettingsForm } from "@/components/settings/teacher-payment-settings-form"
import { getTenantProfile } from "@/lib/data/tenants"
import { getTeacherPaymentSettings } from "@/lib/data/teacher-payment-settings"
import {
  checkMediumOptionsTableExists,
  listMediumOptions,
} from "@/lib/data/medium-options"

export default async function SettingsPage() {
  const admin = await requireAdminContext()

  const tableExists = await checkClassLevelsTableExists()
  const mediumOptionsTableExists = await checkMediumOptionsTableExists()
  const [tenant, billingSettings, teacherPaymentSettings, classLevels, academicGroups, mediums] = await Promise.all([
    getTenantProfile(admin.tenantId),
    getBillingSettings(admin.tenantId),
    getTeacherPaymentSettings(admin.tenantId),
    tableExists ? listClassLevels(admin.tenantId) : Promise.resolve([]),
    listAcademicGroups(admin.tenantId),
    listMediumOptions(admin.tenantId),
  ])
  const tenantProfile = {
    address: tenant?.address ?? null,
    contact_phone: tenant?.contact_phone ?? null,
    email: tenant?.email ?? null,
    logo_url: tenant?.logo_url ?? null,
    name: tenant?.name ?? admin.tenantName,
    secondary_phone: tenant?.secondary_phone ?? null,
  }

  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-5 p-4 md:p-6">
      <PageHeader
        title="Settings"
        description="Manage your center configuration and preferences."
      />

      <Tabs defaultValue="general">
        <TabsList variant="line">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="taxonomy">Academic Setup</TabsTrigger>
          <TabsTrigger value="salary">Salary Setting</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-4 lg:grid-cols-2">
            <CenterProfileCard tenant={tenantProfile} />
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="gap-1">
                <CardTitle className="text-sm">Subscription</CardTitle>
                <CardDescription className="text-xs">
                  Current billing status for this tenant workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Detail label="Tenant" value={tenantProfile.name} />
                <Detail
                  label="Subscription status"
                  value={formatSubscriptionStatus(
                    tenant?.subscription_status ?? admin.tenantStatus
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="taxonomy">
          <div className="grid gap-4 lg:grid-cols-3">
            <ClassLevelsManager classLevels={classLevels} tableExists={tableExists} />
            <AcademicGroupsManager groups={academicGroups} />
            <MediumOptionsManager
              mediums={mediums}
              tableExists={mediumOptionsTableExists}
            />
          </div>
        </TabsContent>

        <TabsContent value="salary">
          <div className="grid gap-4 lg:grid-cols-2">
            <BillingSettingsForm settings={billingSettings} />
            <TeacherPaymentSettingsForm settings={teacherPaymentSettings} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatSubscriptionStatus(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ") || "Not configured"
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border px-3 py-2">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  )
}
