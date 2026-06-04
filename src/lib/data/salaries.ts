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

  return (data as unknown as RawTeacherSalaryLedgerRecord[]).map(
    normalizeLedger
  )
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
