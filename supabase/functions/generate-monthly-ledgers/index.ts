import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

type BillingMode = "prepaid" | "postpaid"
type StudentLedgerStatus =
  | "not_started"
  | "due"
  | "overdue"
  | "partial"
  | "paid"
  | "waived"
type SalaryLedgerStatus = "unpaid" | "partial" | "paid" | "waived"

type Tenant = {
  id: string
}

type BillingSettings = {
  tenant_id: string
  billing_mode: BillingMode | null
  payment_start_day: number | null
  grace_period_days: number | null
}

type TeacherPaymentSettings = {
  tenant_id: string
  payment_system: BillingMode | null
}

type Student = {
  id: string
  tenant_id: string
  fee_start_month: string
}

type FeeAssignment = {
  student_id: string
  custom_fee_override: number | string | null
  fee_override: number | string | null
  discount_amount: number | string | null
  batch:
    | {
        monthly_fee: number | string | null
        status: string | null
      }
    | Array<{
        monthly_fee: number | string | null
        status: string | null
      }>
    | null
}

type Teacher = {
  id: string
  default_monthly_salary: number | string | null
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const cronSecret = Deno.env.get("CRON_SECRET")

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
})

Deno.serve(async (request) => {
  if (cronSecret) {
    const token = request.headers.get("x-cron-secret")

    if (token !== cronSecret) {
      return json({ error: "Unauthorized" }, 401)
    }
  }

  const today = todayInTimezone()
  const [studentResult, teacherResult] = await Promise.all([
    generateStudentLedgers(today),
    generateTeacherLedgers(today),
  ])

  return json({
    date: today,
    students: studentResult,
    teachers: teacherResult,
  })
})

async function generateStudentLedgers(today: string) {
  const { data: tenants, error: tenantError } = await supabase
    .from("tenants")
    .select("id")

  if (tenantError) {
    throw tenantError
  }

  const { data: settingsRows, error: settingsError } = await supabase
    .from("billing_settings")
    .select("tenant_id, billing_mode, payment_start_day, grace_period_days")

  if (settingsError) {
    throw settingsError
  }

  const settingsByTenant = new Map(
    ((settingsRows ?? []) as BillingSettings[]).map((settings) => [
      settings.tenant_id,
      settings,
    ])
  )
  let inserted = 0
  let skipped = 0

  for (const tenant of (tenants ?? []) as Tenant[]) {
    const settings = settingsByTenant.get(tenant.id) ?? {
      tenant_id: tenant.id,
      billing_mode: "prepaid",
      payment_start_day: 1,
      grace_period_days: 7,
    }
    const target = studentTargetMonth(today, settings)

    if (!target) {
      skipped += 1
      continue
    }

    inserted += await createStudentLedgersForTenant(
      tenant.id,
      target.ledgerMonth,
      target.paymentStartDate,
      target.graceEndDate,
      today
    )
  }

  return { inserted, skippedTenants: skipped }
}

async function createStudentLedgersForTenant(
  tenantId: string,
  ledgerMonth: string,
  paymentStartDate: string,
  graceEndDate: string,
  today: string
) {
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, tenant_id, fee_start_month")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .lte("fee_start_month", ledgerMonth)

  if (studentsError) {
    throw studentsError
  }

  const activeStudents = (students ?? []) as Student[]

  if (!activeStudents.length) {
    return 0
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("student_batches")
    .select(
      `
        student_id,
        custom_fee_override,
        fee_override,
        discount_amount,
        batch:batches (
          monthly_fee,
          status
        )
      `
    )
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .in(
      "student_id",
      activeStudents.map((student) => student.id)
    )

  if (assignmentsError) {
    throw assignmentsError
  }

  const assignmentsByStudent = groupAssignments(assignments as FeeAssignment[])
  const ledgers = activeStudents.map((student) => {
    const totals = calculateStudentTotals(
      assignmentsByStudent.get(student.id) ?? []
    )
    const netAmount = Math.max(totals.expectedAmount - totals.discountAmount, 0)
    const dueAmount = netAmount

    return {
      tenant_id: tenantId,
      student_id: student.id,
      ledger_month: ledgerMonth,
      expected_amount: totals.expectedAmount,
      discount_amount: totals.discountAmount,
      paid_amount: 0,
      due_amount: dueAmount,
      payment_start_date: paymentStartDate,
      grace_end_date: graceEndDate,
      status: studentLedgerStatus({
        dueAmount,
        expectedAmount: totals.expectedAmount,
        discountAmount: totals.discountAmount,
        paidAmount: 0,
        paymentStartDate,
        graceEndDate,
        today,
      }),
      generated_at: new Date().toISOString(),
    }
  })

  const { error } = await supabase
    .from("student_monthly_ledgers")
    .upsert(ledgers, {
      ignoreDuplicates: true,
      onConflict: "tenant_id,student_id,ledger_month",
    })

  if (error) {
    throw error
  }

  return ledgers.length
}

async function generateTeacherLedgers(today: string) {
  const { data: settingsRows, error: settingsError } = await supabase
    .from("teacher_payment_settings")
    .select("tenant_id, payment_system")

  if (settingsError) {
    throw settingsError
  }

  let inserted = 0

  for (const settings of (settingsRows ?? []) as TeacherPaymentSettings[]) {
    const target = teacherTargetMonth(today, settings.payment_system ?? "prepaid")
    inserted += await createTeacherLedgersForTenant(
      settings.tenant_id,
      target.ledgerMonth,
      target.paymentStartDate
    )
  }

  return { inserted }
}

async function createTeacherLedgersForTenant(
  tenantId: string,
  ledgerMonth: string,
  paymentStartDate: string
) {
  const { data: teachers, error: teachersError } = await supabase
    .from("teachers")
    .select("id, default_monthly_salary")
    .eq("tenant_id", tenantId)
    .eq("status", "active")

  if (teachersError) {
    throw teachersError
  }

  const activeTeachers = (teachers ?? []) as Teacher[]

  if (!activeTeachers.length) {
    return 0
  }

  const ledgers = activeTeachers.map((teacher) => {
    const expectedSalary = money(teacher.default_monthly_salary)

    return {
      tenant_id: tenantId,
      teacher_id: teacher.id,
      ledger_month: ledgerMonth,
      expected_salary: expectedSalary,
      adjustment_amount: 0,
      paid_amount: 0,
      due_amount: expectedSalary,
      status: teacherLedgerStatus(expectedSalary),
      payment_start_date: paymentStartDate,
      generated_at: new Date().toISOString(),
    }
  })

  const { error } = await supabase
    .from("teacher_salary_ledgers")
    .upsert(ledgers, {
      ignoreDuplicates: true,
      onConflict: "tenant_id,teacher_id,ledger_month",
    })

  if (error) {
    throw error
  }

  return ledgers.length
}

function studentTargetMonth(today: string, settings: BillingSettings) {
  const billingMode = settings.billing_mode ?? "prepaid"
  const collectionMonth = monthStart(today)
  const paymentStartDay = clamp(Math.trunc(settings.payment_start_day ?? 1), 1, 15)
  const paymentStartDate = isoDate(
    yearOf(collectionMonth),
    monthOf(collectionMonth),
    Math.min(paymentStartDay, daysInMonth(collectionMonth))
  )

  if (today < paymentStartDate) {
    return null
  }

  const ledgerMonth =
    billingMode === "postpaid" ? addMonths(collectionMonth, -1) : collectionMonth
  const graceEndDate = addDays(
    paymentStartDate,
    clamp(Math.trunc(settings.grace_period_days ?? 7), 0, 15)
  )

  return {
    graceEndDate,
    ledgerMonth,
    paymentStartDate,
  }
}

function teacherTargetMonth(today: string, paymentSystem: BillingMode) {
  const collectionMonth = monthStart(today)
  const ledgerMonth =
    paymentSystem === "postpaid" ? addMonths(collectionMonth, -1) : collectionMonth

  return {
    ledgerMonth,
    paymentStartDate: collectionMonth,
  }
}

function calculateStudentTotals(assignments: FeeAssignment[]) {
  return assignments.reduce(
    (total, assignment) => {
      const batch = firstNested(assignment.batch)

      if (!batch || batch.status !== "active") {
        return total
      }

      const fee = assignment.fee_override ?? assignment.custom_fee_override
      const usedFee = fee === null || fee === undefined ? batch.monthly_fee : fee

      return {
        discountAmount: total.discountAmount + money(assignment.discount_amount),
        expectedAmount: total.expectedAmount + money(usedFee),
      }
    },
    { discountAmount: 0, expectedAmount: 0 }
  )
}

function studentLedgerStatus({
  discountAmount,
  dueAmount,
  expectedAmount,
  graceEndDate,
  paidAmount,
  paymentStartDate,
  today,
}: {
  discountAmount: number
  dueAmount: number
  expectedAmount: number
  graceEndDate: string
  paidAmount: number
  paymentStartDate: string
  today: string
}): StudentLedgerStatus {
  const netAmount = Math.max(expectedAmount - discountAmount, 0)

  if (netAmount <= 0 || dueAmount <= 0) {
    return "paid"
  }

  if (paidAmount > 0) {
    return "partial"
  }

  if (today < paymentStartDate) {
    return "not_started"
  }

  return today <= graceEndDate ? "due" : "overdue"
}

function teacherLedgerStatus(expectedSalary: number): SalaryLedgerStatus {
  return expectedSalary <= 0 ? "waived" : "unpaid"
}

function groupAssignments(assignments: FeeAssignment[]) {
  const map = new Map<string, FeeAssignment[]>()

  for (const assignment of assignments) {
    const current = map.get(assignment.student_id) ?? []
    current.push(assignment)
    map.set(assignment.student_id, current)
  }

  return map
}

function firstNested<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? amount : 0
}

function todayInTimezone() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: Deno.env.get("LEDGER_TIMEZONE") ?? "Asia/Dhaka",
    year: "numeric",
  })

  return formatter.format(new Date())
}

function monthStart(value: string) {
  return `${value.slice(0, 7)}-01`
}

function addMonths(value: string, months: number) {
  const year = yearOf(value)
  const month = monthOf(value)
  const date = new Date(Date.UTC(year, month - 1 + months, 1))

  return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)

  return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`
}

function daysInMonth(value: string) {
  const year = yearOf(value)
  const month = monthOf(value)

  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function yearOf(value: string) {
  return Number(value.slice(0, 4))
}

function monthOf(value: string) {
  return Number(value.slice(5, 7))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
    },
    status,
  })
}
