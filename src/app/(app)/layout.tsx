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
      className="h-svh min-h-0 overflow-hidden bg-background"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <Topbar admin={admin} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
