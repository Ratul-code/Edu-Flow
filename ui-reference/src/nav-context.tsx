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
  | "notifications"
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
