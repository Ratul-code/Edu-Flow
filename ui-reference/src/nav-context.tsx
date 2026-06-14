import * as React from "react"

export type Page =
  | "dashboard"
  | "students"
  | "student-detail"
  | "batches"
  | "batch-detail"
  | "fees"
  | "student-payment"
  | "salaries"
  | "salary-payment"
  | "teachers"
  | "teacher-detail"
  | "schedule"
  | "comm-overview"
  | "comm-sms"
  | "comm-campaigns"
  | "comm-templates"
  | "comm-automations"
  | "comm-automations-new"
  | "comm-automations-detail"
  | "comm-automations-edit"
  | "comm-logs"
  | "comm-settings"
  | "settings"

type NavContextValue = {
  currentPage: Page
  navigate: (page: Page) => void
}

export const NavContext = React.createContext<NavContextValue>({
  currentPage: "dashboard",
  navigate: () => {},
})

export function useNav() {
  return React.useContext(NavContext)
}
