import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  Banknote,
  GraduationCap,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react"
import * as React from "react"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { type Page, useNav } from "@/nav-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const navItems: {
  label: string
  page?: Page
  icon: React.ElementType
  children?: { label: string; page: Page; icon: React.ElementType }[]
}[] = [
  { label: "Dashboard", page: "dashboard", icon: LayoutDashboard },
  { label: "Students", page: "students", icon: Users },
  { label: "Batches", page: "batches", icon: BookOpen },
  {
    label: "Fees & Salaries",
    icon: CreditCard,
    children: [
      { label: "Student Fees", page: "fees", icon: CreditCard },
      { label: "Teacher Salaries", page: "salaries", icon: Banknote },
    ],
  },
  { label: "Teachers", page: "teachers", icon: GraduationCap },
  { label: "Schedule", page: "schedule", icon: Bell },
  { label: "Notifications", page: "notifications", icon: Bell },
  { label: "Settings", page: "settings", icon: Settings },
]

export function AppSidebar() {
  const { currentPage, navigate } = useNav()
  const [feesOpen, setFeesOpen] = React.useState(
    currentPage === "fees" || currentPage === "salaries" || currentPage === "student-payment" || currentPage === "salary-payment"
  )

  const isActive = (page: Page) => {
    if (page === "students") return currentPage === "students" || currentPage === "student-detail"
    if (page === "batches") return currentPage === "batches" || currentPage === "batch-detail"
    if (page === "teachers") return currentPage === "teachers" || currentPage === "teacher-detail"
    if (page === "fees") return currentPage === "fees" || currentPage === "student-payment"
    if (page === "salaries") return currentPage === "salaries" || currentPage === "salary-payment"
    return currentPage === page
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent hover:bg-sidebar-accent/50"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Zap className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm text-sidebar-foreground">Edu Flow</span>
                <span className="text-xs text-sidebar-foreground/60">Admin Dashboard</span>
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
              {navItems.map((item) => {
                if (item.children) {
                  return (
                    <Collapsible key={item.label} open={feesOpen} onOpenChange={setFeesOpen}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.label}
                            isActive={item.children.some((c) => isActive(c.page))}
                          >
                            <item.icon />
                            <span>{item.label}</span>
                            <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.page}>
                                <SidebarMenuSubButton
                                  isActive={isActive(child.page)}
                                  onClick={() => navigate(child.page)}
                                  className="cursor-pointer"
                                >
                                  <child.icon className="size-3.5" />
                                  <span>{child.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={isActive(item.page!)}
                      onClick={() => navigate(item.page!)}
                      className="cursor-pointer"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                      {item.page === "notifications" && (
                        <Badge className="ml-auto h-4 px-1.5 text-[10px]">3</Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent/50"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                  AR
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm font-medium text-sidebar-foreground">Arif Rahman</span>
                <span className="text-xs text-sidebar-foreground/60">Administrator</span>
              </div>
              <ChevronRight className="ml-auto size-4 text-sidebar-foreground/40" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
