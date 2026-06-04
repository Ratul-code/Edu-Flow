import type { LucideIcon } from "lucide-react"
import {
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  GraduationCapIcon,
  ReceiptTextIcon,
  SettingsIcon,
  UsersRoundIcon,
  WalletCardsIcon,
} from "lucide-react"

import type { TenantTableName } from "@/lib/data/tenant-records"

export type ModuleColumn = {
  key: string
  label: string
}

export type ModuleFilter = {
  label: string
  options: string[]
}

export type AdminModuleConfig = {
  title: string
  description: string
  tableName?: TenantTableName
  icon: LucideIcon
  createLabel: string
  emptyTitle: string
  emptyDescription: string
  columns: ModuleColumn[]
  filters: ModuleFilter[]
}

export const adminModules = {
  students: {
    title: "Students",
    description:
      "Manage student profiles, guardian contacts, batch assignments, and fee status.",
    tableName: "students",
    icon: UsersRoundIcon,
    createLabel: "Add student",
    emptyTitle: "No students yet",
    emptyDescription:
      "Add your first student when you are ready to start building class rosters.",
    columns: [
      { key: "name", label: "Name" },
      { key: "guardian", label: "Guardian" },
      { key: "class", label: "Class" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { label: "Status", options: ["All", "Active", "Archived"] },
      { label: "Payment", options: ["All", "Paid", "Partial", "Unpaid"] },
    ],
  },
  teachers: {
    title: "Teachers",
    description:
      "Manage teacher profiles, subject specialties, assigned batches, and salary status.",
    tableName: "teachers",
    icon: GraduationCapIcon,
    createLabel: "Add teacher",
    emptyTitle: "No teachers yet",
    emptyDescription:
      "Add teachers before assigning batches and recurring class schedules.",
    columns: [
      { key: "name", label: "Name" },
      { key: "subject", label: "Subject" },
      { key: "salary", label: "Monthly salary" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { label: "Status", options: ["All", "Active", "Archived"] },
      { label: "Subject", options: ["All", "Math", "English", "Science"] },
    ],
  },
  batches: {
    title: "Batches",
    description:
      "Create batches by subject and class level, assign teachers, and define fees.",
    tableName: "batches",
    icon: BookOpenIcon,
    createLabel: "Create batch",
    emptyTitle: "No batches yet",
    emptyDescription:
      "Create batches after adding teachers so students can be assigned cleanly.",
    columns: [
      { key: "name", label: "Batch" },
      { key: "subject", label: "Subject" },
      { key: "fee", label: "Monthly fee" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { label: "Status", options: ["All", "Active", "Archived"] },
      { label: "Class", options: ["All", "Class 8", "Class 9", "Class 10"] },
    ],
  },
  schedule: {
    title: "Schedule",
    description:
      "Plan recurring weekly classes with batch, teacher, weekday, time, and room.",
    tableName: "class_schedules",
    icon: CalendarDaysIcon,
    createLabel: "Add class",
    emptyTitle: "No schedules yet",
    emptyDescription:
      "Add recurring classes now; the same structure will support attendance later.",
    columns: [
      { key: "batch", label: "Batch" },
      { key: "subject", label: "Subject" },
      { key: "teacher", label: "Teacher" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { label: "Status", options: ["All", "Active", "Cancelled", "Archived"] },
      { label: "Weekday", options: ["All", "Sat", "Sun", "Mon", "Tue"] },
    ],
  },
  fees: {
    title: "Fees",
    description:
      "Student fee ledgers, payment recording, due status, and receipts will live here.",
    icon: ReceiptTextIcon,
    createLabel: "Record payment",
    emptyTitle: "Fee ledgers are coming next",
    emptyDescription:
      "This module is reserved for monthly student ledgers and payments.",
    columns: [
      { key: "student", label: "Student" },
      { key: "month", label: "Month" },
      { key: "paid", label: "Paid" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { label: "Status", options: ["All", "Paid", "Partial", "Unpaid"] },
      { label: "Method", options: ["All", "Cash", "bKash", "Nagad"] },
    ],
  },
  salaries: {
    title: "Salaries",
    description:
      "Teacher salary ledgers, adjustments, payments, and dues will live here.",
    icon: WalletCardsIcon,
    createLabel: "Record salary",
    emptyTitle: "Salary ledgers are coming next",
    emptyDescription:
      "This module is reserved for monthly teacher salary tracking.",
    columns: [
      { key: "teacher", label: "Teacher" },
      { key: "month", label: "Month" },
      { key: "paid", label: "Paid" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { label: "Status", options: ["All", "Paid", "Partial", "Unpaid"] },
      { label: "Method", options: ["All", "Cash", "Bank", "Other"] },
    ],
  },
  notifications: {
    title: "Notifications",
    description:
      "SMS receipts, due reminders, templates, and delivery logs will live here.",
    icon: BellIcon,
    createLabel: "New message",
    emptyTitle: "No notification logs yet",
    emptyDescription:
      "Payment receipts and reminders will appear here after the SMS adapter is connected.",
    columns: [
      { key: "recipient", label: "Recipient" },
      { key: "type", label: "Type" },
      { key: "channel", label: "Channel" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { label: "Channel", options: ["All", "SMS", "WhatsApp"] },
      { label: "Status", options: ["All", "Sent", "Failed", "Queued"] },
    ],
  },
  settings: {
    title: "Settings",
    description:
      "Manage tenant profile, admin preferences, and provider configuration.",
    icon: SettingsIcon,
    createLabel: "Update profile",
    emptyTitle: "Settings are ready for configuration",
    emptyDescription:
      "Tenant profile and provider controls will be connected after the main records are active.",
    columns: [
      { key: "area", label: "Area" },
      { key: "owner", label: "Owner" },
      { key: "updated", label: "Updated" },
      { key: "status", label: "Status" },
    ],
    filters: [
      { label: "Area", options: ["All", "Tenant", "Admins", "Providers"] },
      { label: "Status", options: ["All", "Ready", "Pending"] },
    ],
  },
} satisfies Record<string, AdminModuleConfig>
