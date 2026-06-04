import { createClient } from "@/lib/supabase/server"

export type DashboardSchedule = {
  id: string
  weekday: number
  start_time: string
  end_time: string
  room_name: string | null
  subject: string | null
  batch?: {
    id: string
    name: string
    subject: string | null
    class_level: string | null
  } | null
  teacher?: {
    id: string
    name: string
  } | null
}

export type RecentStudentPayment = {
  id: string
  receipt_number: string
  amount: number | string
  method: string
  payment_date: string
  student?: {
    id: string
    name: string
  } | null
}

export type RecentTeacherPayment = {
  id: string
  receipt_number: string
  amount: number | string
  method: string
  payment_date: string
  teacher?: {
    id: string
    name: string
  } | null
}

type LedgerSummary = {
  expected: number
  paid: number
  due: number
}

export async function getStudentFeeSummary(
  tenantId: string,
  ledgerMonth: string
): Promise<LedgerSummary> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_monthly_ledgers")
    .select("expected_amount, discount_amount, paid_amount, due_amount")
    .eq("tenant_id", tenantId)
    .eq("ledger_month", ledgerMonth)

  if (error || !data) {
    return emptySummary()
  }

  return data.reduce(
    (summary, ledger) => ({
      due: summary.due + money(ledger.due_amount),
      expected:
        summary.expected +
        Math.max(money(ledger.expected_amount) - money(ledger.discount_amount), 0),
      paid: summary.paid + money(ledger.paid_amount),
    }),
    emptySummary()
  )
}

export async function getTeacherSalarySummary(
  tenantId: string,
  ledgerMonth: string
): Promise<LedgerSummary> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teacher_salary_ledgers")
    .select("expected_salary, adjustment_amount, paid_amount, due_amount")
    .eq("tenant_id", tenantId)
    .eq("ledger_month", ledgerMonth)

  if (error || !data) {
    return emptySummary()
  }

  return data.reduce(
    (summary, ledger) => ({
      due: summary.due + money(ledger.due_amount),
      expected:
        summary.expected +
        Math.max(
          money(ledger.expected_salary) + money(ledger.adjustment_amount),
          0
        ),
      paid: summary.paid + money(ledger.paid_amount),
    }),
    emptySummary()
  )
}

export async function listUpcomingSchedules(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("class_schedules")
    .select(
      `
        id,
        weekday,
        start_time,
        end_time,
        room_name,
        subject,
        batch:batches (
          id,
          name,
          subject,
          class_level
        ),
        teacher:teachers (
          id,
          name
        )
      `
    )
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .limit(25)

  if (error || !data) {
    return []
  }

  return (data as unknown as RawDashboardSchedule[])
    .map((schedule) => ({
      ...schedule,
      batch: firstNested(schedule.batch),
      teacher: firstNested(schedule.teacher),
    }))
    .sort(compareScheduleFromToday)
    .slice(0, 6)
}

export async function listRecentStudentPayments(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_payments")
    .select(
      `
        id,
        receipt_number,
        amount,
        method,
        payment_date,
        student:students (
          id,
          name
        )
      `
    )
    .eq("tenant_id", tenantId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5)

  if (error || !data) {
    return []
  }

  return (data as unknown as RawRecentStudentPayment[]).map((payment) => ({
    ...payment,
    student: firstNested(payment.student),
  }))
}

export async function listRecentTeacherSalaryPayments(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teacher_salary_payments")
    .select(
      `
        id,
        receipt_number,
        amount,
        method,
        payment_date,
        teacher:teachers (
          id,
          name
        )
      `
    )
    .eq("tenant_id", tenantId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5)

  if (error || !data) {
    return []
  }

  return (data as unknown as RawRecentTeacherPayment[]).map((payment) => ({
    ...payment,
    teacher: firstNested(payment.teacher),
  }))
}

type RawDashboardSchedule = Omit<DashboardSchedule, "batch" | "teacher"> & {
  batch?:
    | DashboardSchedule["batch"]
    | Array<NonNullable<DashboardSchedule["batch"]>>
  teacher?:
    | DashboardSchedule["teacher"]
    | Array<NonNullable<DashboardSchedule["teacher"]>>
}

type RawRecentStudentPayment = Omit<RecentStudentPayment, "student"> & {
  student?:
    | RecentStudentPayment["student"]
    | Array<NonNullable<RecentStudentPayment["student"]>>
}

type RawRecentTeacherPayment = Omit<RecentTeacherPayment, "teacher"> & {
  teacher?:
    | RecentTeacherPayment["teacher"]
    | Array<NonNullable<RecentTeacherPayment["teacher"]>>
}

function compareScheduleFromToday(
  left: DashboardSchedule,
  right: DashboardSchedule
) {
  const now = new Date()
  const today = now.getDay()
  const leftOffset = (left.weekday - today + 7) % 7
  const rightOffset = (right.weekday - today + 7) % 7

  if (leftOffset !== rightOffset) {
    return leftOffset - rightOffset
  }

  return left.start_time.localeCompare(right.start_time)
}

function emptySummary(): LedgerSummary {
  return {
    due: 0,
    expected: 0,
    paid: 0,
  }
}

function firstNested<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? amount : 0
}
