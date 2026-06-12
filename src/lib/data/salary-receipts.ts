import { createClient } from "@/lib/supabase/server"
import type { SalaryPaymentMethod } from "@/lib/data/salaries"

export type TeacherSalaryReceiptData = {
  ledger: {
    dueAmountAfterPayment: number
    expectedSalary: number
    salaryMonth: string
  }
  payment: {
    amount: number
    id: string
    method: SalaryPaymentMethod
    paymentDate: string
    receiptNumber: string
  }
  teacher: {
    name: string
    phone: string | null
    subject: string | null
  }
  tenant: {
    address: string | null
    contactPhone: string | null
    name: string
  }
}

type RawPayment = {
  amount: number | string
  id: string
  ledger_id: string
  method: SalaryPaymentMethod
  payment_date: string
  receipt_number: string | null
}

type RawLedger = {
  due_amount: number | string
  expected_salary: number | string
  ledger_month: string
  teacher:
    | {
        name: string
        phone: string | null
        subject_specialty: string | null
      }
    | Array<{
        name: string
        phone: string | null
        subject_specialty: string | null
      }>
    | null
}

type RawTenant = {
  address: string | null
  contact_phone: string | null
  name: string
}

export async function getTeacherSalaryReceipt(
  tenantId: string,
  paymentId: string
): Promise<TeacherSalaryReceiptData | null> {
  const supabase = await createClient()
  const { data: payment, error: paymentError } = await supabase
    .from("teacher_salary_payments")
    .select("id, ledger_id, receipt_number, amount, method, payment_date")
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
  ] = await Promise.all([
    supabase
      .from("teacher_salary_ledgers")
      .select(
        `
          ledger_month,
          expected_salary,
          due_amount,
          teacher:teachers (
            name,
            phone,
            subject_specialty
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
  ])

  if (ledgerError || tenantError || !ledger || !tenant) {
    return null
  }

  const rawLedger = ledger as RawLedger
  const rawTenant = tenant as RawTenant
  const teacher = firstNested(rawLedger.teacher)

  return {
    ledger: {
      dueAmountAfterPayment: money(rawLedger.due_amount),
      expectedSalary: money(rawLedger.expected_salary),
      salaryMonth: rawLedger.ledger_month,
    },
    payment: {
      amount: money(rawPayment.amount),
      id: rawPayment.id,
      method: rawPayment.method,
      paymentDate: rawPayment.payment_date,
      receiptNumber: rawPayment.receipt_number ?? "Receipt pending",
    },
    teacher: {
      name: teacher?.name ?? "Unknown teacher",
      phone: teacher?.phone ?? null,
      subject: teacher?.subject_specialty ?? null,
    },
    tenant: {
      address: rawTenant.address,
      contactPhone: rawTenant.contact_phone,
      name: rawTenant.name,
    },
  }
}

function firstNested<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? amount : 0
}
