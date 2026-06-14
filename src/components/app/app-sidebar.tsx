"use client"

import type { LucideIcon } from "lucide-react"
import {
  BanknoteIcon,
  BellIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
  FileTextIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  MessageSquareIcon,
  ScrollTextIcon,
  SettingsIcon,
  Settings2Icon,
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

const communicationSubItems = [
  {
    title: "Overview",
    href: "/communication",
    icon: LayoutDashboardIcon,
  },
  {
    title: "SMS Channel",
    href: "/communication/sms",
    icon: MessageSquareIcon,
  },
  {
    title: "Message History",
    href: "/notifications/message-history",
    icon: MegaphoneIcon,
  },
  {
    title: "Templates",
    href: "/communication/templates",
    icon: FileTextIcon,
  },
  {
    title: "Logs",
    href: "/communication/logs",
    icon: ScrollTextIcon,
  },
  {
    title: "Settings",
    href: "/communication/settings",
    icon: Settings2Icon,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const feesGroupActive = feeSubItems.some((item) =>
    isRouteActive(pathname, item.href)
  )
  const communicationGroupActive = communicationSubItems.some((item) =>
    isRouteActive(pathname, item.href)
  )
  const [feesOpen, setFeesOpen] = useState(feesGroupActive)
  const [communicationOpen, setCommunicationOpen] = useState(
    communicationGroupActive
  )
  const showFees = feesGroupActive || feesOpen
  const showCommunication = communicationGroupActive || communicationOpen

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
              <NavGroup
                icon={CreditCardIcon}
                isActive={feesGroupActive}
                isOpen={showFees}
                items={feeSubItems}
                onToggle={() => setFeesOpen((open) => !open)}
                pathname={pathname}
                title="Fees & Salaries"
              />
              <NavLink item={navItems[3]} pathname={pathname} />
              <NavLink item={navItems[4]} pathname={pathname} />
              <NavGroup
                icon={MessageSquareIcon}
                isActive={communicationGroupActive}
                isOpen={showCommunication}
                items={communicationSubItems}
                onToggle={() => setCommunicationOpen((open) => !open)}
                pathname={pathname}
                title="Communication"
              />
              <NavLink item={navItems[5]} pathname={pathname} />
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

function NavGroup({
  icon: Icon,
  isActive,
  isOpen,
  items,
  onToggle,
  pathname,
  title,
}: {
  icon: LucideIcon
  isActive: boolean
  isOpen: boolean
  items: NavItem[]
  onToggle: () => void
  pathname: string
  title: string
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="cursor-pointer"
        isActive={isActive}
        onClick={onToggle}
        tooltip={title}
        type="button"
      >
        <Icon />
        <span>{title}</span>
        <ChevronDownIcon
          className={cn(
            "ml-auto transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </SidebarMenuButton>
      {isOpen ? (
        <SidebarMenuSub>
          {items.map((item) => (
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
  )
}

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
