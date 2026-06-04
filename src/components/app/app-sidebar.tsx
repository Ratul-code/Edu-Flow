"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  ChevronDownIcon,
  GraduationCapIcon,
  HouseIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  ReceiptTextIcon,
  SendIcon,
  SettingsIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: HouseIcon,
  },
  {
    title: "Students",
    href: "/students",
    icon: UserRoundIcon,
  },
  {
    title: "Batches",
    href: "/batches",
    icon: UsersRoundIcon,
  },
  {
    title: "Teachers",
    href: "/teachers",
    icon: UserRoundIcon,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: SendIcon,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
]

const feeSubItems = [
  {
    title: "Student",
    href: "/fees",
  },
  {
    title: "Teacher",
    href: "/salaries",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const feesGroupActive = feeSubItems.some((item) =>
    isRouteActive(pathname, item.href)
  )
  const [feesOpen, setFeesOpen] = useState(false)
  const showFees = feesGroupActive || feesOpen
  const collapsed = state === "collapsed"

  return (
    <Sidebar
      className="border-r border-[#edf0f5] bg-white overflow-visible"
      collapsible="icon"
    >
      <SidebarHeader className="relative px-5 pt-7 pb-8 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pt-5 group-data-[collapsible=icon]:pb-6">
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute top-7 -right-3 z-20 flex size-7 items-center justify-center rounded-full border border-[#edf0f5] bg-white text-[#626a77] shadow-sm transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary group-data-[collapsible=icon]:top-6"
          onClick={toggleSidebar}
          type="button"
        >
          {collapsed ? (
            <PanelLeftOpenIcon className="size-4" strokeWidth={1.9} />
          ) : (
            <PanelLeftCloseIcon className="size-4" strokeWidth={1.9} />
          )}
        </button>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-auto gap-3 p-0 hover:bg-transparent data-active:bg-transparent group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! [&_svg]:size-8 group-data-[collapsible=icon]:[&_svg]:size-6"
              render={<Link href="/dashboard" />}
              tooltip="Edu Flow"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-data-[collapsible=icon]:size-10">
                <GraduationCapIcon strokeWidth={1.8} />
              </span>
              {!collapsed ? (
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-lg font-semibold text-[#141821]">
                    Edu Flow
                  </span>
                  <span className="truncate text-xs font-normal text-[#6d7480]">
                    Coaching Management System
                  </span>
                </span>
              ) : null}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-5 group-data-[collapsible=icon]:px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="sr-only">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2.5 group-data-[collapsible=icon]:items-center">
              <NavLink item={navItems[0]} pathname={pathname} />
              <NavLink item={navItems[1]} pathname={pathname} />
              <NavLink item={navItems[2]} pathname={pathname} />
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(
                    navButtonClassName,
                    feesGroupActive && "text-primary"
                  )}
                  onClick={() => setFeesOpen((open) => !open)}
                  type="button"
                >
                  <ReceiptTextIcon strokeWidth={1.9} />
                  <span>Fees &amp; Salaries</span>
                  <ChevronDownIcon
                    className={cn(
                      "ml-auto transition-transform group-data-[collapsible=icon]:hidden",
                      showFees && "rotate-180"
                    )}
                  />
                </SidebarMenuButton>
                {showFees ? (
                  <SidebarMenuSub className="mt-1.5 ml-8 gap-1.5 border-l-0 px-0 py-0">
                    {feeSubItems.map((item) => {
                      const isActive = isRouteActive(pathname, item.href)

                      return (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            className="h-8 gap-3 rounded-lg px-3 text-[14px] font-medium text-[#626a77] hover:bg-primary/5 hover:text-primary data-active:bg-transparent data-active:text-primary"
                            isActive={isActive}
                            render={<Link href={item.href} />}
                          >
                            <span
                              className={cn(
                                "size-1.5 shrink-0 rounded-full bg-[#8c95a3]",
                                isActive && "bg-primary"
                              )}
                            />
                            <span>{item.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
              <NavLink item={navItems[3]} pathname={pathname} />
              <NavLink item={navItems[4]} pathname={pathname} />
              <NavLink item={navItems[5]} pathname={pathname} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-5 pb-5 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl border border-[#edf0f5] bg-white p-4 shadow-[0_8px_30px_rgba(31,41,55,0.04)]">
          <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCapIcon strokeWidth={1.8} />
          </div>
          <p className="text-sm font-semibold text-[#141821]">Admin workspace</p>
          <p className="mt-1 text-xs leading-5 text-[#6d7480]">
            Edu Flow coaching panel
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

type NavItem = {
  href: string
  icon: LucideIcon
  title: string
}

const navButtonClassName =
  "h-12 justify-start gap-3 rounded-lg px-4 text-[15px] font-medium text-[#626a77] transition-colors hover:bg-primary/5 hover:text-primary data-active:bg-primary/10 data-active:font-semibold data-active:text-primary group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>span]:hidden [&_svg]:size-5 [&>svg]:text-current"

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon
  const active = isRouteActive(pathname, item.href)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={navButtonClassName}
        isActive={active}
        render={<Link href={item.href} />}
        tooltip={item.title}
      >
        <Icon strokeWidth={1.9} />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
