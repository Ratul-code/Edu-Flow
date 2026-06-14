import { MailIcon, PhoneIcon, SettingsIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { PageHeader } from "@/components/app/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAuthenticatedUser, requireAdminContext } from "@/lib/auth/user"
import { getAdminProfile } from "@/lib/data/admin-profile"

export default async function AccountProfilePage() {
  const admin = await requireAdminContext()
  const user = await getAuthenticatedUser()
  const profile = user
    ? await getAdminProfile(admin.tenantId, user.id)
    : null

  const name = profile?.name ?? admin.adminName
  const email = profile?.email ?? admin.adminEmail
  const phone = profile?.phone ?? "Not configured"

  return (
    <div className="mx-auto flex w-full max-w-full flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Profile"
          description="Your admin account information."
        />
          <Button render={<Link href="/account/settings" />} size="sm">
            <SettingsIcon data-icon="inline-start" />
            Edit Profile
          </Button>
      </div>

      <Card className="max-w-xl gap-4 py-5">
        <CardHeader className="px-5 pb-0 pt-0">
          <div className="flex items-center gap-2">
            <UserIcon className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Admin Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pt-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                {admin.adminInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{admin.tenantName}</p>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <ProfileLine icon={<MailIcon className="size-4" />} label="Email" value={email} />
            <ProfileLine icon={<PhoneIcon className="size-4" />} label="Phone" value={phone} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileLine({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}
