"use client"

import type { LucideIcon } from "lucide-react"
import {
  BanknoteIcon,
  BellIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersRoundIcon,
  ZapIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

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
    title: "Batches",
    href: "/batches",
    icon: BookOpenIcon,
  },
  {
    title: "Teachers",
    href: "/teachers",
    icon: GraduationCapIcon,
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: BellIcon,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: BellIcon,
    badge: "3",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
]

const feeSubItems = [
  {
    title: "Student Fees",
    href: "/fees",
    icon: CreditCardIcon,
  },
  {
    title: "Teacher Salaries",
    href: "/salaries",
    icon: BanknoteIcon,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const feesGroupActive = feeSubItems.some((item) =>
    isRouteActive(pathname, item.href)
  )
  const [feesOpen, setFeesOpen] = useState(feesGroupActive)
  const showFees = feesGroupActive || feesOpen

  return (
    <Sidebar className="border-r-0" collapsible="icon">
      <SidebarHeader className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-sidebar-accent/50 data-[state=open]:bg-sidebar-accent"
              render={<Link href="/dashboard" />}
              size="lg"
              tooltip="Edu Flow"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ZapIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm font-semibold text-sidebar-foreground">
                  Edu Flow
                </span>
                <span className="text-xs text-sidebar-foreground/60">
                  Admin Dashboard
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <NavLink item={navItems[0]} pathname={pathname} />
              <NavLink item={navItems[1]} pathname={pathname} />
              <NavLink item={navItems[2]} pathname={pathname} />
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="cursor-pointer"
                  isActive={feesGroupActive}
                  onClick={() => setFeesOpen((open) => !open)}
                  tooltip="Fees & Salaries"
                  type="button"
                >
                  <CreditCardIcon />
                  <span>Fees &amp; Salaries</span>
                  <ChevronDownIcon
                    className={cn(
                      "ml-auto transition-transform duration-200",
                      showFees && "rotate-180"
                    )}
                  />
                </SidebarMenuButton>
                {showFees ? (
                  <SidebarMenuSub>
                    {feeSubItems.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton
                          className="cursor-pointer"
                          isActive={isRouteActive(pathname, item.href)}
                          render={<Link href={item.href} />}
                        >
                          <item.icon className="size-3.5" />
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
              {navItems.slice(3).map((item) => (
                <NavLink item={item} key={item.href} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-sidebar-accent/50" size="lg">
              <Avatar className="size-8">
                <AvatarFallback className="bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm font-medium text-sidebar-foreground">
                  Admin
                </span>
                <span className="text-xs text-sidebar-foreground/60">
                  Workspace
                </span>
              </div>
              <ChevronRightIcon className="ml-auto size-4 text-sidebar-foreground/40" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

type NavItem = {
  badge?: string
  href: string
  icon: LucideIcon
  title: string
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon
  const active = isRouteActive(pathname, item.href)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="cursor-pointer"
        isActive={active}
        render={<Link href={item.href} />}
        tooltip={item.title}
      >
        <Icon />
        <span>{item.title}</span>
        {item.badge ? (
          <Badge className="ml-auto h-4 px-1.5 text-[10px] leading-none">
            {item.badge}
          </Badge>
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
