"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import { requireAdminContext } from "@/lib/auth/user"
import {
  addMonths,
  currentMonthStart,
} from "@/lib/data/fees"
import { BATCHES_ROUTE_CACHE_TAG } from "@/lib/data/batches"
import { STUDENTS_ROUTE_CACHE_TAG } from "@/lib/data/students"
import {
  ensureStudentMonthlyLedger,
  recalculateCurrentStudentMonthlyLedger,
} from "@/lib/actions/fees"
import { redirectWithFlashToast } from "@/lib/flash-toast"
import { createClient } from "@/lib/supabase/server"
import {
  batchAssignmentSchema,
  batchSchema,
  classScheduleSchema,
  parseFormData,
  parseMultiValueFormData,
  studentBatchFeeOverrideSchema,
  type BatchFormData,
} from "@/lib/schemas"

export async function createBatch(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const payload = batchPayloadFromForm(formData, admin.tenantId)

  const { data, error } = await supabase
    .from("batches")
    .insert(payload)
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create batch.")
  }

  revalidateTag(BATCHES_ROUTE_CACHE_TAG, { expire: 0 })
  revalidateTag(STUDENTS_ROUTE_CACHE_TAG, { expire: 0 })
  revalidatePath("/batches")
  redirectWithFlashToast(`/batches/${data.id}`, {
    title: "Batch added",
    message: `${payload.name} has been created successfully.`,
    tone: "success",
  })
}

export async function updateBatch(batchId: string, formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const payload = batchPayloadFromForm(formData, admin.tenantId)
  const { data: currentBatch, error: currentBatchError } = await supabase
    .from("batches")
    .select("monthly_fee")
    .eq("tenant_id", admin.tenantId)
    .eq("id", batchId)
    .single()

  if (currentBatchError) {
    throw new Error(currentBatchError.message)
  }

  const { error } = await supabase
    .from("batches")
    .update(payload)
    .eq("tenant_id", admin.tenantId)
    .eq("id", batchId)

  if (error) {
    throw new Error(error.message)
  }

  if (Number(currentBatch.monthly_fee) !== Number(payload.monthly_fee)) {
    await refreshBatchLedgersForFeeChange(
      admin.tenantId,
      batchId,
      stringField(formData, "fee_start_option") === "next" ? "next" : "current"
    )
  }

  revalidateTag(BATCHES_ROUTE_CACHE_TAG, { expire: 0 })
  revalidateTag(STUDENTS_ROUTE_CACHE_TAG, { expire: 0 })
  revalidatePath("/batches")
  revalidatePath(`/batches/${batchId}`)
  redirectWithFlashToast(`/batches/${batchId}`, {
    title: "Batch updated",
    message: `${payload.name} changes have been saved.`,
    tone: "success",
  })
}

export async function archiveBatch(batchId: string, formData?: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const { error } = await supabase
    .from("batches")
    .update({ status: "archived" })
    .eq("tenant_id", admin.tenantId)
    .eq("id", batchId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateTag(BATCHES_ROUTE_CACHE_TAG, { expire: 0 })
  revalidateTag(STUDENTS_ROUTE_CACHE_TAG, { expire: 0 })
  revalidatePath("/batches")
  revalidatePath(`/batches/${batchId}`)
  redirectWithFlashToast(stringField(formData, "return_path") || "/batches", {
    title: "Batch archived",
    message: "The batch has been moved out of the active list.",
    tone: "archive",
  })
}

export async function assignStudentToBatch(batchId: string, formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const data = parseMultiValueFormData(batchAssignmentSchema, formData, [
    "student_ids",
  ])

  const joinedAt = data.joined_at || today()
  const rows = data.student_ids.map((studentId) => ({
    tenant_id: admin.tenantId,
    student_id: studentId,
    batch_id: batchId,
    joined_at: joinedAt,
    status: "active",
  }))

  const { error } = await supabase.from("student_batches").upsert(
    rows,
    { onConflict: "tenant_id,student_id,batch_id" }
  )

  if (error) {
    throw new Error(error.message)
  }

  const feeStartMonth = assignmentFeeStartMonth(formData)
  await Promise.all(
    data.student_ids.map((studentId) =>
      feeStartMonth === currentMonthStart()
        ? recalculateCurrentStudentMonthlyLedger(studentId, `/batches/${batchId}`)
        : ensureStudentMonthlyLedger(studentId, feeStartMonth)
    )
  )

  revalidateTag(STUDENTS_ROUTE_CACHE_TAG, { expire: 0 })
  revalidatePath("/fees")
  revalidatePath(`/batches/${batchId}`)
}

export async function updateStudentBatchFeeOverride(
  batchId: string,
  assignmentId: string,
  formData: FormData
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const { fee_override: feeOverride } = parseFormData(
    studentBatchFeeOverrideSchema,
    formData
  )
  const { error } = await supabase
    .from("student_batches")
    .update({
      custom_fee_override: feeOverride,
      fee_override: feeOverride,
    })
    .eq("tenant_id", admin.tenantId)
    .eq("batch_id", batchId)
    .eq("id", assignmentId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateTag(STUDENTS_ROUTE_CACHE_TAG, { expire: 0 })
  revalidatePath(`/batches/${batchId}`)
}

export async function updateBatchStudentFeeOverrides(
  batchId: string,
  formData: FormData
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const studentIds = formData
    .getAll("student_ids")
    .filter((value): value is string => typeof value === "string" && !!value)
  const { fee_override: feeOverride } = parseFormData(
    studentBatchFeeOverrideSchema,
    formData
  )

  if (!studentIds.length) {
    throw new Error("Select at least one student.")
  }

  const { error } = await supabase
    .from("student_batches")
    .update({
      custom_fee_override: feeOverride,
      fee_override: feeOverride,
    })
    .eq("tenant_id", admin.tenantId)
    .eq("batch_id", batchId)
    .eq("status", "active")
    .in("student_id", studentIds)

  if (error) {
    throw new Error(error.message)
  }

  const feeStartMonth = assignmentFeeStartMonth(formData)
  await Promise.all(
    studentIds.map((studentId) =>
      feeStartMonth === currentMonthStart()
        ? recalculateCurrentStudentMonthlyLedger(studentId, `/batches/${batchId}`)
        : ensureStudentMonthlyLedger(studentId, feeStartMonth)
    )
  )

  revalidateTag(STUDENTS_ROUTE_CACHE_TAG, { expire: 0 })
  revalidatePath("/fees")
  revalidatePath(`/batches/${batchId}`)
}

export async function archiveStudentBatch(
  batchId: string,
  assignmentId: string,
  formData?: FormData
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const { data: assignment, error: assignmentError } = await supabase
    .from("student_batches")
    .select("student_id")
    .eq("tenant_id", admin.tenantId)
    .eq("batch_id", batchId)
    .eq("id", assignmentId)
    .single()

  if (assignmentError || !assignment) {
    throw new Error(assignmentError?.message ?? "Batch assignment not found.")
  }

  const { error } = await supabase
    .from("student_batches")
    .update({ status: "archived" })
    .eq("tenant_id", admin.tenantId)
    .eq("batch_id", batchId)
    .eq("id", assignmentId)

  if (error) {
    throw new Error(error.message)
  }

  const feeStartMonth = assignmentFeeStartMonth(formData ?? new FormData())

  if (feeStartMonth === currentMonthStart()) {
    await recalculateCurrentStudentMonthlyLedger(
      assignment.student_id,
      `/batches/${batchId}`
    )
  } else {
    await ensureStudentMonthlyLedger(assignment.student_id, feeStartMonth)
  }

  revalidateTag(STUDENTS_ROUTE_CACHE_TAG, { expire: 0 })
  revalidatePath("/fees")
  revalidatePath(`/batches/${batchId}`)
}

export async function createClassSchedule(batchId: string, formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const data = parseFormData(classScheduleSchema, formData)
  const teacherId = data.teacher_id || null

  if (teacherId) {
    const { count, error: conflictError } = await supabase
      .from("class_schedules")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", admin.tenantId)
      .eq("teacher_id", teacherId)
      .eq("weekday", data.weekday)
      .eq("status", "active")
      .lt("start_time", data.end_time)
      .gt("end_time", data.start_time)

    if (conflictError) {
      throw new Error(conflictError.message)
    }

    if ((count ?? 0) > 0) {
      throw new Error(
        "This teacher already has a class scheduled during that time."
      )
    }
  }

  const { error } = await supabase.from("class_schedules").insert({
    tenant_id: admin.tenantId,
    batch_id: batchId,
    teacher_id: teacherId,
    subject: data.subject,
    weekday: data.weekday,
    start_time: data.start_time,
    end_time: data.end_time,
    room_name: data.room_name || null,
    status: "active",
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/batches/${batchId}`)
  revalidatePath("/schedule")
}

export async function archiveClassSchedule(batchId: string, scheduleId: string) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const { error } = await supabase
    .from("class_schedules")
    .update({ status: "archived" })
    .eq("tenant_id", admin.tenantId)
    .eq("batch_id", batchId)
    .eq("id", scheduleId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/batches/${batchId}`)
  revalidatePath("/schedule")
}

function batchPayloadFromForm(formData: FormData, tenantId: string) {
  const data = parseFormData(batchSchema, formData)

  return {
    tenant_id: tenantId,
    ...batchPayload(data),
  }
}

function batchPayload(data: BatchFormData) {
  return {
    name: data.name,
    subject: data.subject,
    class_level: data.class_level,
    medium: data.medium || null,
    group_name: data.group_name || null,
    monthly_fee: data.monthly_fee,
    teacher_id: null,
    status: data.status,
  }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function assignmentFeeStartMonth(formData: FormData) {
  return stringField(formData, "fee_start_option") === "next"
    ? addMonths(currentMonthStart(), 1)
    : currentMonthStart()
}

async function refreshBatchLedgersForFeeChange(
  tenantId: string,
  batchId: string,
  timing: "current" | "next"
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_batches")
    .select("student_id")
    .eq("tenant_id", tenantId)
    .eq("batch_id", batchId)
    .eq("status", "active")

  if (error) {
    throw new Error(error.message)
  }

  const studentIds = Array.from(
    new Set((data ?? []).map((assignment) => assignment.student_id))
  )

  if (!studentIds.length) {
    return
  }

  const ledgerMonth =
    timing === "next" ? addMonths(currentMonthStart(), 1) : currentMonthStart()
  const refreshStudentIds =
    timing === "next"
      ? studentIds
      : await unpaidCurrentLedgerStudentIds(tenantId, studentIds, ledgerMonth)

  if (!refreshStudentIds.length) {
    return
  }

  await Promise.all(
    refreshStudentIds.map((studentId) =>
      timing === "next"
        ? ensureStudentMonthlyLedger(studentId, ledgerMonth)
        : recalculateCurrentStudentMonthlyLedger(studentId, `/batches/${batchId}`)
    )
  )

  revalidatePath("/fees")
}

async function unpaidCurrentLedgerStudentIds(
  tenantId: string,
  studentIds: string[],
  ledgerMonth: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_monthly_ledgers")
    .select("student_id, status")
    .eq("tenant_id", tenantId)
    .eq("ledger_month", ledgerMonth)
    .in("student_id", studentIds)

  if (error) {
    throw new Error(error.message)
  }

  const paidStudentIds = new Set(
    (data ?? [])
      .filter((ledger) => ledger.status === "paid" || ledger.status === "waived")
      .map((ledger) => ledger.student_id)
  )

  return studentIds.filter((studentId) => !paidStudentIds.has(studentId))
}

function stringField(formData: FormData | undefined, key: string) {
  const value = formData?.get(key)

  return typeof value === "string" ? value.trim() : ""
}
