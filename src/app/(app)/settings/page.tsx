import { Building2Icon } from "lucide-react"

import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAdminContext } from "@/lib/auth/user"
import { createClient } from "@/lib/supabase/server"
import { checkClassLevelsTableExists, listClassLevels } from "@/lib/data/class-levels"
import { ClassLevelsManager } from "@/components/settings/class-levels-manager"
import { Badge } from "@/components/ui/badge"

export default async function SettingsPage() {
  const admin = await requireAdminContext()
  const supabase = await createClient()

  // Fetch full tenant details
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", admin.tenantId)
    .single()

  const tableExists = await checkClassLevelsTableExists()
  const classLevels = tableExists ? await listClassLevels(admin.tenantId) : []

  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure your coaching center profile, preferences, and dynamic taxonomies."
      />

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Left Side: Profile Preview */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2Icon className="size-5 text-primary" />
              <CardTitle>Coaching Center</CardTitle>
            </div>
            <CardDescription>
              Your tenant details and subscription status.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Center Name</span>
              <p className="text-sm font-medium text-foreground mt-0.5">{tenant?.name || admin.tenantName}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
              <div className="mt-1">
                <Badge variant={tenant?.subscription_status === "active" ? "default" : "outline"} className="capitalize">
                  {tenant?.subscription_status || "Trial"}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Phone</span>
              <p className="text-sm text-foreground mt-0.5">{tenant?.contact_phone || "Not configured"}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</span>
              <p className="text-sm text-foreground mt-0.5 whitespace-pre-line">{tenant?.address || "Not configured"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Class Levels Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Taxonomy</CardTitle>
            <CardDescription>
              Define levels, classes, or grades to categorize student groups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClassLevelsManager classLevels={classLevels} tableExists={tableExists} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
