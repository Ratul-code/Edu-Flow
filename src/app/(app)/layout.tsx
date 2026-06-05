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
    <SidebarProvider
      className="h-svh min-h-0 overflow-hidden"
      style={
        {
          "--sidebar-width-icon": "4.75rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <Topbar admin={admin} />
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto bg-muted/20 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
