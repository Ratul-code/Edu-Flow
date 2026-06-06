import { createClient } from "@/lib/supabase/server"
import type { PaymentMethod } from "@/lib/data/fees"

export type StudentPaymentReceiptData = {
  batchNames: string[]
  ledger: {
    billingMonth: string
    dueAmountAfterPayment: number
    totalExpectedAmount: number
  }
  payment: {
    amount: number
    id: string
    method: PaymentMethod
    paymentDate: string
    receiptGeneratedAt: string
    receiptNo: string
  }
  student: {
    guardianPhone: string | null
    name: string
    phone: string | null
  }
  tenant: {
    address: string | null
    contactPhone: string | null
    name: string
  }
}

type RawPayment = {
  amount: number | string
  created_at: string
  id: string
  ledger_id: string
  method: PaymentMethod
  payment_date: string
  receipt_generated_at: string | null
  receipt_no: string | null
  receipt_number: string | null
  student_id: string
  tenant_id: string
}

type RawLedger = {
  discount_amount: number | string
  due_amount: number | string
  expected_amount: number | string
  id: string
  ledger_month: string
  paid_amount: number | string
  student:
    | {
        guardian_phone: string | null
        name: string
        phone: string | null
      }
    | Array<{
        guardian_phone: string | null
        name: string
        phone: string | null
      }>
    | null
}

type RawTenant = {
  address: string | null
  contact_phone: string | null
  name: string
}

type RawBatchAssignment = {
  batch:
    | {
        name: string | null
      }
    | Array<{
        name: string | null
      }>
    | null
}

type RawLedgerPayment = {
  amount: number | string
  created_at: string
  id: string
  payment_date: string
}

export async function getStudentPaymentReceipt(
  tenantId: string,
  paymentId: string
): Promise<StudentPaymentReceiptData | null> {
  const supabase = await createClient()
  const { data: payment, error: paymentError } = await supabase
    .from("student_payments")
    .select(
      "id, tenant_id, ledger_id, student_id, receipt_no, receipt_number, receipt_generated_at, amount, method, payment_date, created_at"
    )
    .eq("tenant_id", tenantId)
    .eq("id", paymentId)
    .maybeSingle()

  if (paymentError || !payment) {
    return null
  }

  const rawPayment = payment as RawPayment
  const [
    { data: ledger, error: ledgerError },
    { data: tenant, error: tenantError },
    { data: assignments },
    { data: payments },
  ] = await Promise.all([
    supabase
      .from("student_monthly_ledgers")
      .select(
        `
          id,
          ledger_month,
          expected_amount,
          discount_amount,
          paid_amount,
          due_amount,
          student:students (
            name,
            phone,
            guardian_phone
          )
        `
      )
      .eq("tenant_id", tenantId)
      .eq("id", rawPayment.ledger_id)
      .maybeSingle(),
    supabase
      .from("tenants")
      .select("name, address, contact_phone")
      .eq("id", tenantId)
      .maybeSingle(),
    supabase
      .from("student_batches")
      .select("batch:batches (name)")
      .eq("tenant_id", tenantId)
      .eq("student_id", rawPayment.student_id)
      .eq("status", "active"),
    supabase
      .from("student_payments")
      .select("id, amount, payment_date, created_at")
      .eq("tenant_id", tenantId)
      .eq("ledger_id", rawPayment.ledger_id)
      .order("payment_date", { ascending: true })
      .order("created_at", { ascending: true }),
  ])

  if (ledgerError || tenantError || !ledger || !tenant) {
    return null
  }

  const rawLedger = ledger as RawLedger
  const rawTenant = tenant as RawTenant
  const student = firstNested(rawLedger.student)
  const receiptNo =
    rawPayment.receipt_no ?? rawPayment.receipt_number ?? "Receipt pending"
  const totalExpectedAmount = Math.max(
    money(rawLedger.expected_amount) - money(rawLedger.discount_amount),
    0
  )
  const dueAmountAfterPayment = dueAfterPayment(
    totalExpectedAmount,
    rawPayment.id,
    (payments ?? []) as RawLedgerPayment[]
  )

  return {
    batchNames: batchNames((assignments ?? []) as RawBatchAssignment[]),
    ledger: {
      billingMonth: rawLedger.ledger_month,
      dueAmountAfterPayment,
      totalExpectedAmount,
    },
    payment: {
      amount: money(rawPayment.amount),
      id: rawPayment.id,
      method: rawPayment.method,
      paymentDate: rawPayment.payment_date,
      receiptGeneratedAt:
        rawPayment.receipt_generated_at ?? rawPayment.created_at,
      receiptNo,
    },
    student: {
      guardianPhone: student?.guardian_phone ?? null,
      name: student?.name ?? "Unknown student",
      phone: student?.phone ?? null,
    },
    tenant: {
      address: rawTenant.address,
      contactPhone: rawTenant.contact_phone,
      name: rawTenant.name,
    },
  }
}

function dueAfterPayment(
  totalExpectedAmount: number,
  paymentId: string,
  payments: RawLedgerPayment[]
) {
  let paidAmount = 0

  for (const payment of payments) {
    paidAmount += money(payment.amount)

    if (payment.id === paymentId) {
      break
    }
  }

  return Math.max(totalExpectedAmount - paidAmount, 0)
}

function batchNames(assignments: RawBatchAssignment[]) {
  const names = assignments
    .map((assignment) => firstNested(assignment.batch)?.name)
    .filter((name): name is string => Boolean(name))

  return Array.from(new Set(names))
}

function firstNested<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? amount : 0
}
