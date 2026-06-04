"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  SettingsIcon,
  UserRoundIcon,
  UsersRoundIcon,
  WalletCardsIcon,
} from "lucide-react"

import type { AdminContext } from "@/lib/auth/user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Students",
    href: "/students",
    icon: UsersRoundIcon,
  },
  {
    title: "Teachers",
    href: "/teachers",
    icon: GraduationCapIcon,
  },
  {
    title: "Batches",
    href: "/batches",
    icon: BookOpenIcon,
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: CalendarDaysIcon,
  },
  {
    title: "Fees",
    href: "/fees",
    icon: ReceiptTextIcon,
  },
  {
    title: "Salaries",
    href: "/salaries",
    icon: WalletCardsIcon,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: BellIcon,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
]

export function AppSidebar({ admin }: { admin: AdminContext }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                EF
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium">Edu Flow</span>
                <span className="truncate text-xs text-muted-foreground">
                  Coaching SaaS
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link href={item.href} />}
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <UserRoundIcon />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate">{admin.adminName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {admin.tenantName}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
