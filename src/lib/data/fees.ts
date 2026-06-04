import { createClient } from "@/lib/supabase/server"

export type LedgerStatus = "unpaid" | "partial" | "paid" | "waived"
export type PaymentMethod = "cash" | "bkash" | "nagad" | "bank" | "card" | "other"

export type StudentLedgerRecord = {
  id: string
  tenant_id: string
  student_id: string
  ledger_month: string
  expected_amount: number | string
  discount_amount: number | string
  paid_amount: number | string
  due_amount: number | string
  status: LedgerStatus
  generated_at: string
  created_at: string
  updated_at: string
  student?: {
    id: string
    name: string
    phone: string | null
    class_level: string | null
  } | null
}

export type StudentPaymentRecord = {
  id: string
  receipt_number: string
  amount: number | string
  method: PaymentMethod
  payment_date: string
  note: string | null
}

const ledgerSelect = `
  id,
  tenant_id,
  student_id,
  ledger_month,
  expected_amount,
  discount_amount,
  paid_amount,
  due_amount,
  status,
  generated_at,
  created_at,
  updated_at,
  student:students (
    id,
    name,
    phone,
    class_level
  )
`

export async function listStudentLedgers(tenantId: string, ledgerMonth: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_monthly_ledgers")
    .select(ledgerSelect)
    .eq("tenant_id", tenantId)
    .eq("ledger_month", ledgerMonth)
    .order("student(name)", { ascending: true })

  if (error || !data) {
    return []
  }

  return (data as unknown as RawStudentLedgerRecord[]).map(normalizeLedger)
}

export async function getStudentLedgerById(tenantId: string, ledgerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_monthly_ledgers")
    .select(ledgerSelect)
    .eq("tenant_id", tenantId)
    .eq("id", ledgerId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return normalizeLedger(data as unknown as RawStudentLedgerRecord)
}

export async function listStudentPayments(tenantId: string, ledgerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_payments")
    .select("id, receipt_number, amount, method, payment_date, note")
    .eq("tenant_id", tenantId)
    .eq("ledger_id", ledgerId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as StudentPaymentRecord[]
}

export function monthStart(value?: string) {
  const source = value && /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value
  const date = source ? new Date(source) : new Date()

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 7) + "-01"
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`
}

export function monthInputValue(value: string) {
  return value.slice(0, 7)
}

type RawStudentLedgerRecord = Omit<StudentLedgerRecord, "student"> & {
  student?:
    | StudentLedgerRecord["student"]
    | Array<NonNullable<StudentLedgerRecord["student"]>>
}

function normalizeLedger(ledger: RawStudentLedgerRecord): StudentLedgerRecord {
  return {
    ...ledger,
    student: firstNested(ledger.student),
  }
}

function firstNested<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}
