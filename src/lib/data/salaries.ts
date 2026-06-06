import { monthStart } from "@/lib/data/fees"
import {
  getTeacherPaymentSettings,
  teacherSalaryPaymentStartDate,
} from "@/lib/data/teacher-payment-settings"
import { createClient } from "@/lib/supabase/server"

export type SalaryLedgerStatus = "unpaid" | "partial" | "paid" | "waived"
export type SalaryPaymentMethod =
  | "cash"
  | "bkash"
  | "nagad"
  | "bank"
  | "card"
  | "other"

export type TeacherSalaryLedgerRecord = {
  id: string
  tenant_id: string
  teacher_id: string
  ledger_month: string
  expected_salary: number | string
  adjustment_amount: number | string
  paid_amount: number | string
  due_amount: number | string
  status: SalaryLedgerStatus
  payment_start_date: string
  generated_at: string
  created_at: string
  updated_at: string
  teacher?: {
    id: string
    name: string
    phone: string | null
    subject_specialty: string | null
  } | null
}

export type TeacherSalaryPaymentRecord = {
  id: string
  receipt_number: string
  amount: number | string
  method: SalaryPaymentMethod
  payment_date: string
  note: string | null
}

const salaryLedgerSelect = `
  id,
  tenant_id,
  teacher_id,
  ledger_month,
  expected_salary,
  adjustment_amount,
  paid_amount,
  due_amount,
  status,
  payment_start_date,
  generated_at,
  created_at,
  updated_at,
  teacher:teachers (
    id,
    name,
    phone,
    subject_specialty
  )
`

type TeacherSalaryLedgerPreparation = {
  opened: boolean
  payment_start_date: string
  payment_system: "prepaid" | "postpaid"
}

type ActiveTeacher = {
  id: string
  default_monthly_salary: number | string
}

type ExistingSalaryLedger = {
  teacher_id: string
}

export async function ensureTeacherSalaryLedgers(
  tenantId: string,
  ledgerMonth: string
): Promise<TeacherSalaryLedgerPreparation> {
  const supabase = await createClient()
  const normalizedMonth = monthStart(ledgerMonth)
  const settings = await getTeacherPaymentSettings(tenantId)
  const paymentStartDate = teacherSalaryPaymentStartDate(
    normalizedMonth,
    settings
  )

  if (today() < paymentStartDate) {
    return {
      opened: false,
      payment_start_date: paymentStartDate,
      payment_system: settings.payment_system,
    }
  }

  const [{ data: teachers, error: teachersError }, { data: existing, error }] =
    await Promise.all([
      supabase
        .from("teachers")
        .select("id, default_monthly_salary")
        .eq("tenant_id", tenantId)
        .eq("status", "active"),
      supabase
        .from("teacher_salary_ledgers")
        .select("teacher_id")
        .eq("tenant_id", tenantId)
        .eq("ledger_month", normalizedMonth),
    ])

  if (teachersError || error) {
    return {
      opened: true,
      payment_start_date: paymentStartDate,
      payment_system: settings.payment_system,
    }
  }

  const existingTeacherIds = new Set(
    ((existing ?? []) as ExistingSalaryLedger[]).map(
      (ledger) => ledger.teacher_id
    )
  )
  const ledgers = ((teachers ?? []) as ActiveTeacher[])
    .filter((teacher) => !existingTeacherIds.has(teacher.id))
    .map((teacher) => {
      const expectedSalary = money(teacher.default_monthly_salary)
      const dueAmount = salaryDue(expectedSalary, 0, 0)

      return {
        tenant_id: tenantId,
        teacher_id: teacher.id,
        ledger_month: normalizedMonth,
        expected_salary: expectedSalary,
        adjustment_amount: 0,
        paid_amount: 0,
        due_amount: dueAmount,
        status: salaryStatus(expectedSalary, 0, dueAmount),
        payment_start_date: paymentStartDate,
        generated_at: new Date().toISOString(),
      }
    })

  if (ledgers.length) {
    await supabase.from("teacher_salary_ledgers").insert(ledgers)
  }

  return {
    opened: true,
    payment_start_date: paymentStartDate,
    payment_system: settings.payment_system,
  }
}

export async function listTeacherSalaryLedgers(
  tenantId: string,
  ledgerMonth: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teacher_salary_ledgers")
    .select(salaryLedgerSelect)
    .eq("tenant_id", tenantId)
    .eq("ledger_month", ledgerMonth)
    .order("teacher(name)", { ascending: true })

  if (error || !data) {
    return []
  }

  return (data as unknown as RawTeacherSalaryLedgerRecord[])
    .map(normalizeLedger)
    .filter((ledger) => {
      if (ledger.payment_start_date <= today()) {
        return true
      }

      return ledger.status === "partial" || ledger.status === "paid" || ledger.status === "waived"
    })
}

export async function getTeacherSalaryLedgerById(
  tenantId: string,
  ledgerId: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teacher_salary_ledgers")
    .select(salaryLedgerSelect)
    .eq("tenant_id", tenantId)
    .eq("id", ledgerId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return normalizeLedger(data as unknown as RawTeacherSalaryLedgerRecord)
}

export async function listTeacherSalaryPayments(
  tenantId: string,
  ledgerId: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teacher_salary_payments")
    .select("id, receipt_number, amount, method, payment_date, note")
    .eq("tenant_id", tenantId)
    .eq("ledger_id", ledgerId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as TeacherSalaryPaymentRecord[]
}

type RawTeacherSalaryLedgerRecord = Omit<
  TeacherSalaryLedgerRecord,
  "teacher"
> & {
  teacher?:
    | TeacherSalaryLedgerRecord["teacher"]
    | Array<NonNullable<TeacherSalaryLedgerRecord["teacher"]>>
}

function normalizeLedger(
  ledger: RawTeacherSalaryLedgerRecord
): TeacherSalaryLedgerRecord {
  return {
    ...ledger,
    teacher: firstNested(ledger.teacher),
  }
}

function firstNested<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function salaryDue(
  expectedSalary: number,
  adjustmentAmount: number,
  paidAmount: number
) {
  return Math.max(Math.max(expectedSalary + adjustmentAmount, 0) - paidAmount, 0)
}

function salaryStatus(
  totalExpected: number,
  paidAmount: number,
  dueAmount: number
): SalaryLedgerStatus {
  if (totalExpected <= 0) {
    return "waived"
  }

  if (dueAmount <= 0) {
    return "paid"
  }

  return paidAmount > 0 ? "partial" : "unpaid"
}

function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? amount : 0
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
