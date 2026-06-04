import { AppSidebar } from "@/components/app/app-sidebar"
import { Topbar } from "@/components/app/topbar"
import { requireAdminContext } from "@/lib/auth/user"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const admin = await requireAdminContext()

  return (
    <SidebarProvider>
      <AppSidebar admin={admin} />
      <SidebarInset>
        <Topbar admin={admin} />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
