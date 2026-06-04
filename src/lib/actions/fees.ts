"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/user"
import { monthInputValue, monthStart } from "@/lib/data/fees"
import { createClient } from "@/lib/supabase/server"

type ActiveStudent = {
  id: string
}

type FeeAssignment = {
  student_id: string
  custom_fee_override: number | string | null
  fee_override: number | string | null
  discount_amount: number | string
  batch:
    | {
        monthly_fee: number | string
        status: string
      }
    | Array<{
        monthly_fee: number | string
        status: string
      }>
    | null
}

type ExistingLedger = {
  id: string
  student_id: string
  paid_amount: number | string
}

export async function generateStudentMonthlyLedgers(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const ledgerMonth = monthStart(stringField(formData, "month"))

  const [{ data: students, error: studentsError }, { data: assignments, error }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id")
        .eq("tenant_id", admin.tenantId)
        .eq("status", "active"),
      supabase
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
        .eq("tenant_id", admin.tenantId)
        .eq("status", "active"),
    ])

  if (studentsError || error) {
    throw new Error(studentsError?.message ?? error?.message)
  }

  const { data: existing, error: existingError } = await supabase
    .from("student_monthly_ledgers")
    .select("id, student_id, paid_amount")
    .eq("tenant_id", admin.tenantId)
    .eq("ledger_month", ledgerMonth)

  if (existingError) {
    throw new Error(existingError.message)
  }

  const assignmentMap = groupAssignments(assignments as FeeAssignment[])
  const paidByStudent = new Map(
    ((existing ?? []) as ExistingLedger[]).map((ledger) => [
      ledger.student_id,
      money(ledger.paid_amount),
    ])
  )

  const ledgers = ((students ?? []) as ActiveStudent[]).map((student) => {
    const totals = calculateStudentTotals(assignmentMap.get(student.id) ?? [])
    const paidAmount = paidByStudent.get(student.id) ?? 0
    const netAmount = Math.max(totals.expectedAmount - totals.discountAmount, 0)
    const dueAmount = Math.max(netAmount - paidAmount, 0)

    return {
      tenant_id: admin.tenantId,
      student_id: student.id,
      ledger_month: ledgerMonth,
      expected_amount: totals.expectedAmount,
      discount_amount: totals.discountAmount,
      paid_amount: paidAmount,
      due_amount: dueAmount,
      status: ledgerStatus(netAmount, paidAmount, dueAmount),
      generated_at: new Date().toISOString(),
    }
  })

  if (ledgers.length) {
    const { error: upsertError } = await supabase
      .from("student_monthly_ledgers")
      .upsert(ledgers, { onConflict: "tenant_id,student_id,ledger_month" })

    if (upsertError) {
      throw new Error(upsertError.message)
    }
  }

  revalidatePath("/fees")
  redirect(`/fees?month=${monthInputValue(ledgerMonth)}`)
}

export async function recordStudentPayment(ledgerId: string, formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const amount = numberField(formData, "amount")

  if (amount <= 0) {
    throw new Error("Payment amount must be greater than zero.")
  }

  const { data: ledger, error: ledgerError } = await supabase
    .from("student_monthly_ledgers")
    .select(
      "id, tenant_id, student_id, ledger_month, expected_amount, discount_amount, paid_amount, due_amount"
    )
    .eq("tenant_id", admin.tenantId)
    .eq("id", ledgerId)
    .maybeSingle()

  if (ledgerError || !ledger) {
    throw new Error(ledgerError?.message ?? "Ledger not found.")
  }

  const dueAmount = money(ledger.due_amount)

  if (dueAmount <= 0) {
    throw new Error("This ledger has no due amount.")
  }

  if (amount > dueAmount) {
    throw new Error("Payment cannot be greater than the current due amount.")
  }

  const { error: paymentError } = await supabase.from("student_payments").insert({
    tenant_id: admin.tenantId,
    ledger_id: ledger.id,
    student_id: ledger.student_id,
    receipt_number: receiptNumber(ledger.ledger_month),
    amount,
    method: paymentMethod(formData),
    payment_date: nullableString(formData, "payment_date") ?? today(),
    note: nullableString(formData, "note"),
  })

  if (paymentError) {
    throw new Error(paymentError.message)
  }

  const paidAmount = money(ledger.paid_amount) + amount
  const netAmount = Math.max(
    money(ledger.expected_amount) - money(ledger.discount_amount),
    0
  )
  const nextDueAmount = Math.max(netAmount - paidAmount, 0)

  const { error: updateError } = await supabase
    .from("student_monthly_ledgers")
    .update({
      paid_amount: paidAmount,
      due_amount: nextDueAmount,
      status: ledgerStatus(netAmount, paidAmount, nextDueAmount),
    })
    .eq("tenant_id", admin.tenantId)
    .eq("id", ledger.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath("/fees")
  redirect(`/fees?month=${monthInputValue(ledger.ledger_month)}`)
}

function groupAssignments(assignments: FeeAssignment[]) {
  const map = new Map<string, FeeAssignment[]>()

  for (const assignment of assignments) {
    const existing = map.get(assignment.student_id) ?? []
    existing.push(assignment)
    map.set(assignment.student_id, existing)
  }

  return map
}

function calculateStudentTotals(assignments: FeeAssignment[]) {
  let expectedAmount = 0
  let discountAmount = 0

  for (const assignment of assignments) {
    const batch = Array.isArray(assignment.batch)
      ? assignment.batch[0]
      : assignment.batch

    if (!batch || batch.status !== "active") {
      continue
    }

    expectedAmount += money(
      assignment.fee_override ??
        assignment.custom_fee_override ??
        batch.monthly_fee
    )
    discountAmount += money(assignment.discount_amount)
  }

  return {
    discountAmount,
    expectedAmount,
  }
}

function ledgerStatus(netAmount: number, paidAmount: number, dueAmount: number) {
  if (netAmount <= 0) {
    return "waived"
  }

  if (dueAmount <= 0) {
    return "paid"
  }

  return paidAmount > 0 ? "partial" : "unpaid"
}

function receiptNumber(ledgerMonth: string) {
  const month = ledgerMonth.slice(0, 7).replace("-", "")
  const entropy = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `EF-${month}-${Date.now().toString(36).toUpperCase()}-${entropy}`
}

function paymentMethod(formData: FormData) {
  const method = stringField(formData, "method")
  const methods = new Set(["cash", "bkash", "nagad", "bank", "card", "other"])

  return methods.has(method) ? method : "cash"
}

function stringField(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
}

function nullableString(formData: FormData, key: string) {
  const value = stringField(formData, key)

  return value || null
}

function numberField(formData: FormData, key: string) {
  const value = Number(stringField(formData, key))

  return Number.isFinite(value) && value >= 0 ? value : 0
}

function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? amount : 0
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
