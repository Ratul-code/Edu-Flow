import { Building2Icon, LogOutIcon } from "lucide-react"

import { signOut } from "@/lib/auth/actions"
import type { AdminContext } from "@/lib/auth/user"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Topbar({ admin }: { admin: AdminContext }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2Icon data-icon="inline-start" />
            <p className="truncate text-sm font-medium">{admin.tenantName}</p>
            <Badge variant="secondary">{admin.tenantStatus}</Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            Admin workspace
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-medium">{admin.adminName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {admin.adminEmail}
          </p>
        </div>
        <Avatar>
          <AvatarFallback>{admin.adminInitials}</AvatarFallback>
        </Avatar>
        <form action={signOut}>
          <Button variant="outline" size="sm">
            <LogOutIcon data-icon="inline-start" />
            Sign out
          </Button>
        </form>
      </div>
    </header>
  )
}
