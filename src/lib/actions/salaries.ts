"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/user"
import { monthInputValue, monthStart } from "@/lib/data/fees"
import { createClient } from "@/lib/supabase/server"

type ActiveTeacher = {
  id: string
  default_monthly_salary: number | string
}

type ExistingSalaryLedger = {
  teacher_id: string
  expected_salary: number | string
  adjustment_amount: number | string
  paid_amount: number | string
}

export async function generateTeacherSalaryLedgers(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const ledgerMonth = monthStart(stringField(formData, "month"))

  const [{ data: teachers, error: teachersError }, { data: existing, error }] =
    await Promise.all([
      supabase
        .from("teachers")
        .select("id, default_monthly_salary")
        .eq("tenant_id", admin.tenantId)
        .eq("status", "active"),
      supabase
        .from("teacher_salary_ledgers")
        .select("teacher_id, expected_salary, adjustment_amount, paid_amount")
        .eq("tenant_id", admin.tenantId)
        .eq("ledger_month", ledgerMonth),
    ])

  if (teachersError || error) {
    throw new Error(teachersError?.message ?? error?.message)
  }

  const existingByTeacher = new Map(
    ((existing ?? []) as ExistingSalaryLedger[]).map((ledger) => [
      ledger.teacher_id,
      ledger,
    ])
  )

  const ledgers = ((teachers ?? []) as ActiveTeacher[]).map((teacher) => {
    const existingLedger = existingByTeacher.get(teacher.id)
    const expectedSalary = existingLedger
      ? money(existingLedger.expected_salary)
      : money(teacher.default_monthly_salary)
    const adjustmentAmount = money(existingLedger?.adjustment_amount)
    const paidAmount = money(existingLedger?.paid_amount)
    const dueAmount = salaryDue(expectedSalary, adjustmentAmount, paidAmount)
    const totalExpected = Math.max(expectedSalary + adjustmentAmount, 0)

    return {
      tenant_id: admin.tenantId,
      teacher_id: teacher.id,
      ledger_month: ledgerMonth,
      expected_salary: expectedSalary,
      adjustment_amount: adjustmentAmount,
      paid_amount: paidAmount,
      due_amount: dueAmount,
      status: salaryStatus(totalExpected, paidAmount, dueAmount),
      generated_at: new Date().toISOString(),
    }
  })

  if (ledgers.length) {
    const { error: upsertError } = await supabase
      .from("teacher_salary_ledgers")
      .upsert(ledgers, { onConflict: "tenant_id,teacher_id,ledger_month" })

    if (upsertError) {
      throw new Error(upsertError.message)
    }
  }

  revalidatePath("/salaries")
  redirect(`/salaries?month=${monthInputValue(ledgerMonth)}`)
}

export async function updateTeacherSalaryLedger(
  ledgerId: string,
  formData: FormData
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const { data: ledger, error } = await supabase
    .from("teacher_salary_ledgers")
    .select("id, ledger_month, paid_amount")
    .eq("tenant_id", admin.tenantId)
    .eq("id", ledgerId)
    .maybeSingle()

  if (error || !ledger) {
    throw new Error(error?.message ?? "Ledger not found.")
  }

  const expectedSalary = numberField(formData, "expected_salary")
  const adjustmentAmount = signedNumberField(formData, "adjustment_amount")
  const paidAmount = money(ledger.paid_amount)
  const dueAmount = salaryDue(expectedSalary, adjustmentAmount, paidAmount)
  const totalExpected = Math.max(expectedSalary + adjustmentAmount, 0)

  const { error: updateError } = await supabase
    .from("teacher_salary_ledgers")
    .update({
      expected_salary: expectedSalary,
      adjustment_amount: adjustmentAmount,
      due_amount: dueAmount,
      status: salaryStatus(totalExpected, paidAmount, dueAmount),
    })
    .eq("tenant_id", admin.tenantId)
    .eq("id", ledger.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath("/salaries")
  redirect(`/salaries?month=${monthInputValue(ledger.ledger_month)}`)
}

export async function recordTeacherSalaryPayment(
  ledgerId: string,
  formData: FormData
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const amount = numberField(formData, "amount")

  if (amount <= 0) {
    throw new Error("Payment amount must be greater than zero.")
  }

  const { data: ledger, error: ledgerError } = await supabase
    .from("teacher_salary_ledgers")
    .select(
      "id, teacher_id, ledger_month, expected_salary, adjustment_amount, paid_amount, due_amount"
    )
    .eq("tenant_id", admin.tenantId)
    .eq("id", ledgerId)
    .maybeSingle()

  if (ledgerError || !ledger) {
    throw new Error(ledgerError?.message ?? "Ledger not found.")
  }

  const dueAmount = money(ledger.due_amount)

  if (dueAmount <= 0) {
    throw new Error("This salary ledger has no due amount.")
  }

  if (amount > dueAmount) {
    throw new Error("Payment cannot be greater than the current due amount.")
  }

  const { error: paymentError } = await supabase
    .from("teacher_salary_payments")
    .insert({
      tenant_id: admin.tenantId,
      ledger_id: ledger.id,
      teacher_id: ledger.teacher_id,
      receipt_number: salaryReceiptNumber(ledger.ledger_month),
      amount,
      method: paymentMethod(formData),
      payment_date: nullableString(formData, "payment_date") ?? today(),
      note: nullableString(formData, "note"),
    })

  if (paymentError) {
    throw new Error(paymentError.message)
  }

  const paidAmount = money(ledger.paid_amount) + amount
  const totalExpected = Math.max(
    money(ledger.expected_salary) + money(ledger.adjustment_amount),
    0
  )
  const nextDueAmount = Math.max(totalExpected - paidAmount, 0)

  const { error: updateError } = await supabase
    .from("teacher_salary_ledgers")
    .update({
      paid_amount: paidAmount,
      due_amount: nextDueAmount,
      status: salaryStatus(totalExpected, paidAmount, nextDueAmount),
    })
    .eq("tenant_id", admin.tenantId)
    .eq("id", ledger.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath("/salaries")
  redirect(`/salaries?month=${monthInputValue(ledger.ledger_month)}`)
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
) {
  if (totalExpected <= 0) {
    return "waived"
  }

  if (dueAmount <= 0) {
    return "paid"
  }

  return paidAmount > 0 ? "partial" : "unpaid"
}

function salaryReceiptNumber(ledgerMonth: string) {
  const month = ledgerMonth.slice(0, 7).replace("-", "")
  const entropy = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `ES-${month}-${Date.now().toString(36).toUpperCase()}-${entropy}`
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

function signedNumberField(formData: FormData, key: string) {
  const value = Number(stringField(formData, key))

  return Number.isFinite(value) ? value : 0
}

function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? amount : 0
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
