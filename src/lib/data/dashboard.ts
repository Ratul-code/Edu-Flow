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

export type RecentActivity = {
  id: string
  label: string
  meta: string
  tone: "student" | "payment" | "batch" | "schedule" | "salary"
}

export type DueStudentLedger = {
  classLevel: string | null
  dueAmount: number | string
  id: string
  status: string
  studentId: string | null
  studentName: string
  studentPhone: string | null
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

export async function listDashboardRecentActivities(tenantId: string) {
  const supabase = await createClient()
  const [students, batches, studentPayments, teacherPayments] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("batches")
      .select("id, name, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("student_payments")
      .select("id, amount, payment_date, created_at, student:students(name)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("teacher_salary_payments")
      .select("id, amount, payment_date, created_at, teacher:teachers(name)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(2),
  ])

  const activities: RecentActivity[] = []

  for (const student of students.data ?? []) {
    activities.push({
      id: `student-${student.id}`,
      label: `New student ${student.name} has been added.`,
      meta: relativeDate(student.created_at),
      tone: "student",
    })
  }

  for (const batch of batches.data ?? []) {
    activities.push({
      id: `batch-${batch.id}`,
      label: `New batch ${batch.name} has been created.`,
      meta: relativeDate(batch.created_at),
      tone: "batch",
    })
  }

  for (const payment of studentPayments.data ?? []) {
    const student = firstNested(
      (payment as unknown as { student?: { name: string } | { name: string }[] })
        .student
    )
    activities.push({
      id: `student-payment-${payment.id}`,
      label: `Payment of ${formatTaka(payment.amount)} received from ${
        student?.name ?? "student"
      }.`,
      meta: relativeDate(payment.created_at),
      tone: "payment",
    })
  }

  for (const payment of teacherPayments.data ?? []) {
    const teacher = firstNested(
      (payment as unknown as { teacher?: { name: string } | { name: string }[] })
        .teacher
    )
    activities.push({
      id: `teacher-payment-${payment.id}`,
      label: `Salary payment of ${formatTaka(payment.amount)} recorded for ${
        teacher?.name ?? "teacher"
      }.`,
      meta: relativeDate(payment.created_at),
      tone: "salary",
    })
  }

  return activities.slice(0, 5)
}

export async function listDashboardDueStudentLedgers(
  tenantId: string,
  ledgerMonth: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_monthly_ledgers")
    .select(
      `
        id,
        due_amount,
        status,
        student:students (
          id,
          name,
          phone,
          class_level
        )
      `
    )
    .eq("tenant_id", tenantId)
    .eq("ledger_month", ledgerMonth)
    .in("status", ["due", "overdue", "partial"])
    .gt("due_amount", 0)
    .order("due_amount", { ascending: false })
    .limit(50)

  if (error || !data) {
    return []
  }

  return (data as unknown as Array<{
    id: string
    due_amount: number | string
    status: string
    student?:
      | {
          class_level: string | null
          id: string
          name: string
          phone: string | null
        }
      | Array<{
          class_level: string | null
          id: string
          name: string
          phone: string | null
        }>
      | null
  }>).map((ledger) => {
    const student = firstNested(ledger.student)

    return {
      classLevel: student?.class_level ?? null,
      dueAmount: ledger.due_amount,
      id: ledger.id,
      status: ledger.status,
      studentId: student?.id ?? null,
      studentName: student?.name ?? "Student",
      studentPhone: student?.phone ?? null,
    } satisfies DueStudentLedger
  })
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

function formatTaka(value: number | string | null | undefined) {
  return `৳${money(value).toLocaleString("en-BD")}`
}

function relativeDate(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.max(Math.round(diff / 60000), 0)

  if (minutes < 60) {
    return minutes <= 1 ? "Just now" : `${minutes} minutes ago`
  }

  const hours = Math.round(minutes / 60)

  if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  }

  const days = Math.round(hours / 24)

  return days === 1 ? "Yesterday" : `${days} days ago`
}
