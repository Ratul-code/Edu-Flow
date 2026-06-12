import { createClient } from "@/lib/supabase/server"

export type LedgerStatus =
  | "not_started"
  | "due"
  | "overdue"
  | "partial"
  | "paid"
  | "waived"
export type PaymentMethod = "cash" | "bkash" | "nagad" | "bank" | "card" | "other"

export type BillingSettingsRecord = {
  billing_mode: "prepaid" | "postpaid"
  id?: string
  tenant_id?: string
  payment_start_day: number
  grace_period_days: number
  created_at?: string
  updated_at?: string
}

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
  payment_start_date: string
  grace_end_date: string
  generated_at: string
  created_at: string
  updated_at: string
  latest_payment?: StudentPaymentReceiptSummary | null
  batch_names?: string[]
  student?: {
    id: string
    name: string
    phone: string | null
    class_level: string | null
  } | null
}

export type StudentFeeMonthRecord = {
  due_amount: number | string
  expected_amount: number | string
  ledger_id: string | null
  ledger_month: string
  paid_amount: number | string
  latest_payment?: StudentPaymentReceiptSummary | null
  payments: StudentPaymentReceiptSummary[]
  status: LedgerStatus | "not_prepared"
}

export type StudentFeeHistorySummary = {
  overdueMonths: number
  paidMonths: number
}

export type StudentFeeHistory = {
  months: StudentFeeMonthRecord[]
  summary: StudentFeeHistorySummary
}

export type StudentPaymentRecord = {
  id: string
  receipt_no: string | null
  receipt_number: string
  amount: number | string
  method: PaymentMethod
  payment_date: string
  note: string | null
}

export type StudentPaymentReceiptSummary = {
  amount: number | string
  created_at: string
  due_amount_after_payment: number | string
  id: string
  method: PaymentMethod
  payment_date: string
  paid_amount_after_payment: number | string
  receipt_no: string | null
  receipt_number: string | null
  status_after_payment: "partial" | "paid"
}

export type StudentLedgerFilters = {
  batchId?: string
  search?: string
  status?: LedgerStatus | "all" | "attention" | "overdue_due"
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
  payment_start_date,
  grace_end_date,
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

export async function listStudentLedgers(
  tenantId: string,
  ledgerMonth: string,
  filters: StudentLedgerFilters = {}
) {
  const supabase = await createClient()
  const [{ data, error }, batchStudentIds] = await Promise.all([
    supabase
    .from("student_monthly_ledgers")
    .select(ledgerSelect)
    .eq("tenant_id", tenantId)
    .eq("ledger_month", ledgerMonth)
    .order("student(name)", { ascending: true }),
    filters.batchId
      ? listStudentIdsForBatch(tenantId, filters.batchId)
      : Promise.resolve(null),
  ])

  if (error || !data) {
    return []
  }

  const search = filters.search?.trim().toLowerCase()
  const status = filters.status ?? "all"

  const ledgers = (data as unknown as RawStudentLedgerRecord[])
    .map(normalizeLedger)
    .filter((ledger) => {
      if (batchStudentIds && !batchStudentIds.has(ledger.student_id)) {
        return false
      }

      if (status === "attention" || status === "overdue_due") {
        if (ledger.status !== "overdue" && ledger.status !== "due") {
          return false
        }
      } else if (status && status !== "all" && ledger.status !== status) {
        return false
      }

      if (!search) {
        return true
      }

      const searchable = [
        ledger.student?.name ?? "",
        ledger.student?.phone ?? "",
        ledger.student?.class_level ?? "",
      ]
        .join(" ")
        .toLowerCase()

      return searchable.includes(search)
    })
    .sort(compareStudentLedgers)
  const latestPayments = await latestPaymentsByLedgerId(
    tenantId,
    ledgers.map((ledger) => ledger.id)
  )
  const batchNamesByStudentId = await activeBatchNamesByStudentId(
    tenantId,
    ledgers.map((ledger) => ledger.student_id)
  )

  return ledgers.map((ledger) => ({
    ...ledger,
    batch_names: batchNamesByStudentId.get(ledger.student_id) ?? [],
    latest_payment: latestPayments.get(ledger.id) ?? null,
  }))
}

export async function countOverdueStudentLedgers(
  tenantId: string,
  ledgerMonth: string
) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("student_monthly_ledgers")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("ledger_month", ledgerMonth)
    .eq("status", "overdue")

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function getStudentFeeHistory(
  tenantId: string,
  studentId: string,
  admissionDate: string
): Promise<StudentFeeHistory> {
  const supabase = await createClient()
  const admissionMonth = monthStart(admissionDate)
  const currentMonth = currentMonthStart()
  const { data, error } = await supabase
    .from("student_monthly_ledgers")
    .select(
      "id, ledger_month, expected_amount, discount_amount, paid_amount, due_amount, status"
    )
    .eq("tenant_id", tenantId)
    .eq("student_id", studentId)
    .gte("ledger_month", admissionMonth)
    .lte("ledger_month", currentMonth)
    .order("ledger_month", { ascending: false })

  const ledgerMap = new Map(
    ((error ? [] : data ?? []) as Array<{
      due_amount: number | string
      discount_amount: number | string
      expected_amount: number | string
      id: string
      ledger_month: string
      paid_amount: number | string
      status: LedgerStatus
    }>).map((ledger) => [ledger.ledger_month, ledger])
  )
  const ledgerValues = Array.from(ledgerMap.values())
  const latestPayments = await latestPaymentsByLedgerId(
    tenantId,
    ledgerValues.map((ledger) => ledger.id)
  )
  const payments = await paymentsByLedgerId(
    tenantId,
    ledgerValues.map((ledger) => ledger.id),
    new Map(
      ledgerValues.map((ledger) => [
        ledger.id,
        Math.max(
          numberOrDefault(ledger.expected_amount, 0) -
            numberOrDefault(ledger.discount_amount, 0),
          0
        ),
      ])
    )
  )

  const months: StudentFeeMonthRecord[] = monthsBetween(
    admissionMonth,
    currentMonth
  )
    .reverse()
    .map((ledgerMonth) => {
      const ledger = ledgerMap.get(ledgerMonth)

      return {
        due_amount: ledger?.due_amount ?? 0,
        expected_amount: ledger?.expected_amount ?? 0,
        ledger_id: ledger?.id ?? null,
        ledger_month: ledgerMonth,
        latest_payment: ledger ? latestPayments.get(ledger.id) ?? null : null,
        paid_amount: ledger?.paid_amount ?? 0,
        payments: ledger ? payments.get(ledger.id) ?? [] : [],
        status: ledger?.status ?? "not_prepared",
      }
    })

  return {
    months,
    summary: {
      overdueMonths: months.filter((month) => month.status === "overdue").length,
      paidMonths: months.filter((month) => month.status === "paid").length,
    },
  }
}

export async function getBillingSettings(
  tenantId: string
): Promise<BillingSettingsRecord> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("billing_settings")
    .select("id, tenant_id, billing_mode, payment_start_day, grace_period_days, created_at, updated_at")
    .eq("tenant_id", tenantId)
    .maybeSingle()

  if (error || !data) {
    return defaultBillingSettings()
  }

  return {
    ...(data as BillingSettingsRecord),
    billing_mode:
      (data as BillingSettingsRecord).billing_mode === "postpaid"
        ? "postpaid"
        : "prepaid",
    grace_period_days: numberOrDefault(
      (data as BillingSettingsRecord).grace_period_days,
      7
    ),
    payment_start_day: numberOrDefault(
      (data as BillingSettingsRecord).payment_start_day,
      1
    ),
  }
}

export function defaultBillingSettings(): BillingSettingsRecord {
  return {
    billing_mode: "prepaid",
    grace_period_days: 7,
    payment_start_day: 1,
  }
}

export function ledgerBillingWindow(
  ledgerMonth: string,
  settings: BillingSettingsRecord
) {
  const normalizedMonth = monthStart(ledgerMonth)
  const collectionMonth =
    settings.billing_mode === "postpaid"
      ? addMonths(normalizedMonth, 1)
      : normalizedMonth
  const { month, year } = parseMonthParts(collectionMonth)
  const paymentStartDay = clamp(
    settings.payment_start_day,
    1,
    daysInMonth(year, month)
  )
  const paymentStartDate = isoDate(year, month, paymentStartDay)
  const graceEndDate = addDays(
    paymentStartDate,
    clamp(Math.trunc(settings.grace_period_days), 0, 15)
  )

  return {
    grace_end_date: graceEndDate,
    payment_start_date: paymentStartDate,
  }
}

export function ledgerStatusForAmounts({
  dueAmount,
  expectedAmount,
  discountAmount = 0,
  paidAmount,
  graceEndDate,
  paymentStartDate,
  today = todayDate(),
}: {
  discountAmount?: number
  dueAmount: number
  expectedAmount: number
  graceEndDate: string
  paidAmount: number
  paymentStartDate: string
  today?: string
}): LedgerStatus {
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
    .select("id, receipt_no, receipt_number, amount, method, payment_date, note")
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

export function addMonths(value: string, months: number) {
  const normalizedMonth = monthStart(value)
  const year = Number(normalizedMonth.slice(0, 4))
  const month = Number(normalizedMonth.slice(5, 7))
  const date = new Date(Date.UTC(year, month - 1 + months, 1))

  return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)
}

export function currentMonthStart() {
  return monthStart()
}

type RawStudentLedgerRecord = Omit<StudentLedgerRecord, "student"> & {
  student?:
    | StudentLedgerRecord["student"]
    | Array<NonNullable<StudentLedgerRecord["student"]>>
}

type RawStudentPaymentReceiptSummary = StudentPaymentReceiptSummary & {
  created_at: string
  ledger_id: string
}

function normalizeLedger(ledger: RawStudentLedgerRecord): StudentLedgerRecord {
  return {
    ...ledger,
    student: firstNested(ledger.student),
  }
}

async function listStudentIdsForBatch(tenantId: string, batchId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_batches")
    .select("student_id")
    .eq("tenant_id", tenantId)
    .eq("batch_id", batchId)
    .eq("status", "active")

  if (error || !data) {
    return new Set<string>()
  }

  return new Set(data.map((row) => row.student_id))
}

async function activeBatchNamesByStudentId(
  tenantId: string,
  studentIds: string[]
) {
  const uniqueStudentIds = Array.from(new Set(studentIds))
  const namesByStudentId = new Map<string, string[]>()

  if (!uniqueStudentIds.length) {
    return namesByStudentId
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_batches")
    .select(
      `
        student_id,
        batch:batches (
          name
        )
      `
    )
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .in("student_id", uniqueStudentIds)

  if (error || !data) {
    return namesByStudentId
  }

  for (const row of data as Array<{
    student_id: string
    batch?: { name: string | null } | Array<{ name: string | null }> | null
  }>) {
    const batch = firstNested(row.batch)
    const name = batch?.name?.trim()

    if (!name) {
      continue
    }

    const names = namesByStudentId.get(row.student_id) ?? []
    names.push(name)
    namesByStudentId.set(row.student_id, names)
  }

  return namesByStudentId
}

async function latestPaymentsByLedgerId(tenantId: string, ledgerIds: string[]) {
  const uniqueLedgerIds = Array.from(new Set(ledgerIds))
  const paymentMap = new Map<string, StudentPaymentReceiptSummary>()

  if (!uniqueLedgerIds.length) {
    return paymentMap
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_payments")
    .select(
      "id, ledger_id, receipt_no, receipt_number, amount, method, payment_date, created_at"
    )
    .eq("tenant_id", tenantId)
    .in("ledger_id", uniqueLedgerIds)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error || !data) {
    return paymentMap
  }

  for (const payment of data as RawStudentPaymentReceiptSummary[]) {
    if (paymentMap.has(payment.ledger_id)) {
      continue
    }

    paymentMap.set(payment.ledger_id, {
      amount: payment.amount,
      created_at: payment.created_at,
      due_amount_after_payment: 0,
      id: payment.id,
      method: payment.method,
      payment_date: payment.payment_date,
      paid_amount_after_payment: payment.amount,
      receipt_no: payment.receipt_no,
      receipt_number: payment.receipt_number,
      status_after_payment: "paid",
    })
  }

  return paymentMap
}

async function paymentsByLedgerId(
  tenantId: string,
  ledgerIds: string[],
  netAmountByLedgerId: Map<string, number>
) {
  const uniqueLedgerIds = Array.from(new Set(ledgerIds))
  const paymentMap = new Map<string, StudentPaymentReceiptSummary[]>()

  if (!uniqueLedgerIds.length) {
    return paymentMap
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_payments")
    .select(
      "id, ledger_id, receipt_no, receipt_number, amount, method, payment_date, created_at"
    )
    .eq("tenant_id", tenantId)
    .in("ledger_id", uniqueLedgerIds)
    .order("payment_date", { ascending: true })
    .order("created_at", { ascending: true })

  if (error || !data) {
    return paymentMap
  }

  const paidByLedgerId = new Map<string, number>()

  for (const payment of data as RawStudentPaymentReceiptSummary[]) {
    const paidAmount =
      (paidByLedgerId.get(payment.ledger_id) ?? 0) + numberOrDefault(payment.amount, 0)
    const netAmount = netAmountByLedgerId.get(payment.ledger_id) ?? 0
    const dueAmount = Math.max(netAmount - paidAmount, 0)
    paidByLedgerId.set(payment.ledger_id, paidAmount)

    const payments = paymentMap.get(payment.ledger_id) ?? []
    payments.push({
      amount: payment.amount,
      created_at: payment.created_at,
      due_amount_after_payment: dueAmount,
      id: payment.id,
      method: payment.method,
      paid_amount_after_payment: paidAmount,
      payment_date: payment.payment_date,
      receipt_no: payment.receipt_no,
      receipt_number: payment.receipt_number,
      status_after_payment: dueAmount > 0 ? "partial" : "paid",
    })
    paymentMap.set(payment.ledger_id, payments)
  }

  return paymentMap
}

function compareStudentLedgers(
  left: StudentLedgerRecord,
  right: StudentLedgerRecord
) {
  const statusDiff = statusSortWeight(left.status) - statusSortWeight(right.status)

  if (statusDiff !== 0) {
    return statusDiff
  }

  const dueDiff = Number(right.due_amount) - Number(left.due_amount)

  if (dueDiff !== 0) {
    return dueDiff
  }

  return (left.student?.name ?? "").localeCompare(right.student?.name ?? "")
}

function statusSortWeight(status: string) {
  const weights: Record<string, number> = {
    overdue: 0,
    due: 1,
    partial: 2,
    paid: 3,
    not_started: 4,
    not_prepared: 5,
    waived: 6,
  }

  return weights[status] ?? 10
}

function monthsBetween(startMonth: string, endMonth: string) {
  const months: string[] = []
  let cursor = monthStart(startMonth)
  const end = monthStart(endMonth)

  while (cursor <= end) {
    months.push(cursor)
    cursor = addMonths(cursor, 1)
  }

  return months
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Math.trunc(value), min), max)
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)

  return date.toISOString().slice(0, 10)
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function firstNested<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`
}

function numberOrDefault(value: number | string | null | undefined, fallback: number) {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : fallback
}

function parseMonthParts(value: string) {
  const normalizedMonth = monthStart(value)

  return {
    month: Number(normalizedMonth.slice(5, 7)),
    year: Number(normalizedMonth.slice(0, 4)),
  }
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}
