import { UserIcon, SaveIcon } from "lucide-react"

import { PageHeader } from "@/components/app/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { requireAdminContext, getAuthenticatedUser } from "@/lib/auth/user"
import { updateAdminProfile } from "@/lib/actions/settings"
import { getAdminProfile } from "@/lib/data/admin-profile"

export default async function AccountSettingsPage() {
  const admin = await requireAdminContext()
  const user = await getAuthenticatedUser()
  const profile = user
    ? await getAdminProfile(admin.tenantId, user.id)
    : null

  const name = profile?.name ?? admin.adminName
  const email = profile?.email ?? admin.adminEmail

  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-5 p-4 md:p-6">
      <PageHeader
        title="Account Settings"
        description="Update your admin profile information."
      />

      <form action={updateAdminProfile} className="max-w-xl">
        <Card className="gap-4 py-5">
          <CardHeader className="px-5 pb-0 pt-0">
            <div className="flex items-center gap-2">
              <UserIcon className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pt-2">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                  {admin.adminInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <Field className="gap-1.5">
                <FieldLabel className="text-xs font-medium" htmlFor="admin-name">
                  Full Name
                </FieldLabel>
                <Input
                  className="h-8 text-sm"
                  defaultValue={name}
                  id="admin-name"
                  name="name"
                  required
                />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel className="text-xs font-medium" htmlFor="admin-email">
                  Email
                </FieldLabel>
                <Input
                  className="h-8 text-sm"
                  disabled
                  id="admin-email"
                  value={email}
                />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel className="text-xs font-medium" htmlFor="admin-phone">
                  Phone
                </FieldLabel>
                <Input
                  className="h-8 text-sm"
                  defaultValue={profile?.phone ?? ""}
                  id="admin-phone"
                  name="phone"
                  type="tel"
                />
              </Field>
            </div>

            <Button className="w-full gap-1.5" size="sm" type="submit">
              <SaveIcon className="size-3.5" />
              Update Account
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
