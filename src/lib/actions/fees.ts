"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/user"
import {
  currentMonthStart,
  getBillingSettings,
  ledgerBillingWindow,
  ledgerStatusForAmounts,
  monthInputValue,
  monthStart,
} from "@/lib/data/fees"
import { redirectWithFlashToast } from "@/lib/flash-toast"
import { createClient } from "@/lib/supabase/server"
import {
  billingSettingsSchema,
  feePaymentSchema,
  ledgerMonthSchema,
  parseFormData,
} from "@/lib/schemas"

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
  const { month } = parseFormData(ledgerMonthSchema, formData)
  const ledgerMonth = monthStart(month)

  const [
    settings,
    { data: students, error: studentsError },
    { data: assignments, error },
    { data: existing, error: existingError },
  ] = await Promise.all([
    getBillingSettings(admin.tenantId),
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
      supabase
        .from("student_monthly_ledgers")
        .select("id, student_id, paid_amount")
        .eq("tenant_id", admin.tenantId)
        .eq("ledger_month", ledgerMonth),
  ])

  if (studentsError || error || existingError) {
    throw new Error(studentsError?.message ?? error?.message ?? existingError?.message)
  }

  const assignmentMap = groupAssignments(assignments as FeeAssignment[])
  const existingStudentIds = new Set(
    ((existing ?? []) as ExistingLedger[]).map((ledger) => ledger.student_id)
  )
  const window = ledgerBillingWindow(ledgerMonth, settings)

  const ledgers = ((students ?? []) as ActiveStudent[]).flatMap((student) => {
    if (existingStudentIds.has(student.id)) {
      return []
    }

    return [
      studentLedgerPayload({
        assignments: assignmentMap.get(student.id) ?? [],
        ledgerMonth,
        studentId: student.id,
        tenantId: admin.tenantId,
        window,
      }),
    ]
  })

  if (ledgers.length) {
    const { error: insertError } = await supabase
      .from("student_monthly_ledgers")
      .upsert(ledgers, {
        ignoreDuplicates: true,
        onConflict: "tenant_id,student_id,ledger_month",
      })

    if (insertError) {
      throw new Error(insertError.message)
    }
  }

  revalidatePath("/fees")
  redirect(`/fees?month=${monthInputValue(ledgerMonth)}`)
}

export async function ensureStudentMonthlyLedger(
  studentId: string,
  billingMonth: string
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const ledgerMonth = monthStart(billingMonth)

  const { data: existing, error: existingError } = await supabase
    .from("student_monthly_ledgers")
    .select("id")
    .eq("tenant_id", admin.tenantId)
    .eq("student_id", studentId)
    .eq("ledger_month", ledgerMonth)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing) {
    return existing
  }

  const [{ data: assignments, error }, settings] = await Promise.all([
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
      .eq("student_id", studentId)
      .eq("status", "active"),
    getBillingSettings(admin.tenantId),
  ])

  if (error) {
    throw new Error(error.message)
  }

  const window = ledgerBillingWindow(ledgerMonth, settings)
  const { data, error: insertError } = await supabase
    .from("student_monthly_ledgers")
    .upsert(
      studentLedgerPayload({
        assignments: (assignments ?? []) as FeeAssignment[],
        ledgerMonth,
        studentId,
        tenantId: admin.tenantId,
        window,
      }),
      {
        ignoreDuplicates: true,
        onConflict: "tenant_id,student_id,ledger_month",
      }
    )
    .select("id")
    .single()

  if (insertError || !data) {
    throw new Error(insertError?.message ?? "Could not create student ledger.")
  }

  revalidatePath("/fees")

  return data
}

export async function recalculateCurrentStudentMonthlyLedger(
  studentId: string,
  returnPath = "/students"
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const ledgerMonth = currentMonthStart()
  const ledger = await ensureStudentMonthlyLedger(studentId, ledgerMonth)
  const [{ data, error }, settings] = await Promise.all([
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
      .eq("student_id", studentId)
      .eq("status", "active"),
    getBillingSettings(admin.tenantId),
  ])

  if (error) {
    throw new Error(error.message)
  }

  const { data: existing, error: existingError } = await supabase
    .from("student_monthly_ledgers")
    .select("id, paid_amount")
    .eq("tenant_id", admin.tenantId)
    .eq("id", ledger.id)
    .maybeSingle()

  if (existingError || !existing) {
    throw new Error(existingError?.message ?? "Ledger not found.")
  }

  const totals = calculateStudentTotals((data ?? []) as FeeAssignment[])
  const paidAmount = money(existing.paid_amount)
  const netAmount = Math.max(totals.expectedAmount - totals.discountAmount, 0)
  const dueAmount = Math.max(netAmount - paidAmount, 0)
  const window = ledgerBillingWindow(ledgerMonth, settings)

  const { error: updateError } = await supabase
    .from("student_monthly_ledgers")
    .update({
      due_amount: dueAmount,
      expected_amount: totals.expectedAmount,
      discount_amount: totals.discountAmount,
      grace_end_date: window.grace_end_date,
      payment_start_date: window.payment_start_date,
      status: ledgerStatusForAmounts({
        discountAmount: totals.discountAmount,
        dueAmount,
        expectedAmount: totals.expectedAmount,
        graceEndDate: window.grace_end_date,
        paidAmount,
        paymentStartDate: window.payment_start_date,
      }),
    })
    .eq("tenant_id", admin.tenantId)
    .eq("id", ledger.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath("/fees")
  revalidatePath("/dashboard")
  revalidatePath(`/students/${studentId}`)
  revalidatePath(returnPath)
}

export async function updateBillingSettings(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const settings = parseFormData(billingSettingsSchema, formData)

  const { error } = await supabase.from("billing_settings").upsert(
    {
      tenant_id: admin.tenantId,
      ...settings,
    },
    { onConflict: "tenant_id" }
  )

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/settings")
  revalidatePath("/fees")
  redirectWithFlashToast("/settings", {
    title: "Settings saved",
    message: "The fee payment window has been updated.",
    tone: "success",
  })
}

export async function recordStudentPayment(ledgerId: string, formData: FormData) {
  await saveStudentPayment(ledgerId, formData, "fees")
}

export async function recordStudentPaymentFromDashboard(formData: FormData) {
  const ledgerId = stringField(formData, "ledger_id")

  if (!ledgerId) {
    throw new Error("Select a student ledger.")
  }

  await saveStudentPayment(ledgerId, formData, "dashboard")
}

async function saveStudentPayment(
  ledgerId: string,
  formData: FormData,
  redirectTarget: "dashboard" | "fees"
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const payment = parseFormData(feePaymentSchema, formData)
  const amount = payment.amount

  const { data: ledger, error: ledgerError } = await supabase
    .from("student_monthly_ledgers")
    .select(
      "id, tenant_id, student_id, ledger_month, expected_amount, discount_amount, paid_amount, due_amount, payment_start_date, grace_end_date"
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
    method: payment.method,
    payment_date: payment.payment_date || today(),
    note: payment.note || null,
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
      status: ledgerStatusForAmounts({
        discountAmount: money(ledger.discount_amount),
        dueAmount: nextDueAmount,
        expectedAmount: money(ledger.expected_amount),
        graceEndDate: ledger.grace_end_date,
        paidAmount,
        paymentStartDate: ledger.payment_start_date,
      }),
    })
    .eq("tenant_id", admin.tenantId)
    .eq("id", ledger.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath("/fees")
  revalidatePath("/dashboard")
  const flashToast = {
    title: nextDueAmount <= 0 ? "Fee fully paid" : "Partial fee recorded",
    message:
      nextDueAmount <= 0
        ? "The student's monthly fee is now fully paid."
        : "The payment was saved and the remaining due amount was updated.",
    tone: nextDueAmount <= 0 ? "success" : "warning",
  } as const

  if (redirectTarget === "dashboard") {
    redirectWithFlashToast("/dashboard", flashToast)
  }

  redirectWithFlashToast(
    `/fees?month=${monthInputValue(ledger.ledger_month)}`,
    flashToast
  )
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

function studentLedgerPayload({
  assignments,
  ledgerMonth,
  studentId,
  tenantId,
  window,
}: {
  assignments: FeeAssignment[]
  ledgerMonth: string
  studentId: string
  tenantId: string
  window: {
    grace_end_date: string
    payment_start_date: string
  }
}) {
  const totals = calculateStudentTotals(assignments)
  const paidAmount = 0
  const netAmount = Math.max(totals.expectedAmount - totals.discountAmount, 0)
  const dueAmount = netAmount

  return {
    tenant_id: tenantId,
    student_id: studentId,
    ledger_month: ledgerMonth,
    expected_amount: totals.expectedAmount,
    discount_amount: totals.discountAmount,
    paid_amount: paidAmount,
    due_amount: dueAmount,
    status: ledgerStatusForAmounts({
      discountAmount: totals.discountAmount,
      dueAmount,
      expectedAmount: totals.expectedAmount,
      graceEndDate: window.grace_end_date,
      paidAmount,
      paymentStartDate: window.payment_start_date,
    }),
    payment_start_date: window.payment_start_date,
    grace_end_date: window.grace_end_date,
    generated_at: new Date().toISOString(),
  }
}

function receiptNumber(ledgerMonth: string) {
  const month = ledgerMonth.slice(0, 7).replace("-", "")
  const entropy = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `EF-${month}-${Date.now().toString(36).toUpperCase()}-${entropy}`
}

function stringField(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
}

function money(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? amount : 0
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
