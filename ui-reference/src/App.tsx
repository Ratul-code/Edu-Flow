import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Topbar } from "@/components/Topbar"
import { NavContext, type Page } from "@/nav-context"

import { Dashboard } from "@/pages/Dashboard"
import { Students } from "@/pages/Students"
import { StudentDetail } from "@/pages/StudentDetail"
import { Batches } from "@/pages/Batches"
import { BatchDetail } from "@/pages/BatchDetail"
import { Teachers } from "@/pages/Teachers"
import { TeacherDetail } from "@/pages/TeacherDetail"
import { Fees } from "@/pages/Fees"
import { StudentPayment } from "@/pages/StudentPayment"
import { Salaries } from "@/pages/Salaries"
import { SalaryPayment } from "@/pages/SalaryPayment"
import { Schedule } from "@/pages/Schedule"
import { Settings } from "@/pages/Settings"

import { CommOverview } from "@/pages/comm/CommOverview"
import { CommSMS } from "@/pages/comm/CommSMS"
import { CommCampaigns } from "@/pages/comm/CommCampaigns"
import { CommTemplates } from "@/pages/comm/CommTemplates"
import { CommAutomations } from "@/pages/comm/CommAutomations"
import { CommAutomationNew } from "@/pages/comm/CommAutomationNew"
import { CommAutomationDetail } from "@/pages/comm/CommAutomationDetail"
import { CommAutomationEdit } from "@/pages/comm/CommAutomationEdit"
import { CommLogs } from "@/pages/comm/CommLogs"
import { CommSettings } from "@/pages/comm/CommSettings"
import { type CommSection } from "@/pages/comm/CommCenter"

const commSectionToPage: Record<CommSection, Page> = {
  "overview": "comm-overview",
  "sms": "comm-sms",
  "campaigns": "comm-campaigns",
  "templates": "comm-templates",
  "automations": "comm-automations",
  "automations-new": "comm-automations-new",
  "automations-detail": "comm-automations-detail",
  "automations-edit": "comm-automations-edit",
  "logs": "comm-logs",
  "settings": "comm-settings",
}

function PageContent({ page, navigate }: { page: Page; navigate: (page: Page) => void }) {
  const [automationId, setAutomationId] = React.useState(1)

  const commNav = (section: CommSection, id?: number) => {
    if (id !== undefined) setAutomationId(id)
    navigate(commSectionToPage[section])
  }

  const commTabChange = (section: CommSection) => {
    navigate(commSectionToPage[section])
  }

  switch (page) {
    case "dashboard": return <Dashboard />
    case "students": return <Students />
    case "student-detail": return <StudentDetail />
    case "batches": return <Batches />
    case "batch-detail": return <BatchDetail />
    case "teachers": return <Teachers />
    case "teacher-detail": return <TeacherDetail />
    case "fees": return <Fees />
    case "student-payment": return <StudentPayment />
    case "salaries": return <Salaries />
    case "salary-payment": return <SalaryPayment />
    case "schedule": return <Schedule />
    case "comm-overview": return <CommOverview onTabChange={commTabChange} />
    case "comm-sms": return <CommSMS />
    case "comm-campaigns": return <CommCampaigns />
    case "comm-templates": return <CommTemplates />
    case "comm-automations": return <CommAutomations onNavigate={commNav} />
    case "comm-automations-new": return <CommAutomationNew onNavigate={commNav} />
    case "comm-automations-detail": return <CommAutomationDetail id={automationId} onNavigate={commNav} />
    case "comm-automations-edit": return <CommAutomationEdit id={automationId} onNavigate={commNav} />
    case "comm-logs": return <CommLogs />
    case "comm-settings": return <CommSettings />
    case "settings": return <Settings />
    default: return <Dashboard />
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>("dashboard")

  return (
    <NavContext.Provider value={{ currentPage, navigate: setCurrentPage }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Topbar />
          <main className="flex-1 overflow-auto">
            <PageContent page={currentPage} navigate={setCurrentPage} />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NavContext.Provider>
  )
}
