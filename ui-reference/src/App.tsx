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
import { NotificationsPage } from "@/pages/NotificationsPage"
import { Settings } from "@/pages/Settings"

function PageContent({ page }: { page: Page }) {
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
    case "notifications": return <NotificationsPage />
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
            <PageContent page={currentPage} />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NavContext.Provider>
  )
}
