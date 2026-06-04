"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/user"
import { createClient } from "@/lib/supabase/server"

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

  revalidatePath("/batches")
  redirect(`/batches/${data.id}`)
}

export async function updateBatch(batchId: string, formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const payload = batchPayloadFromForm(formData, admin.tenantId)

  const { error } = await supabase
    .from("batches")
    .update(payload)
    .eq("tenant_id", admin.tenantId)
    .eq("id", batchId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/batches")
  revalidatePath(`/batches/${batchId}`)
  redirect(`/batches/${batchId}`)
}

export async function archiveBatch(batchId: string) {
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

  revalidatePath("/batches")
  revalidatePath(`/batches/${batchId}`)
  redirect("/batches")
}

export async function assignStudentToBatch(batchId: string, formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const studentIds = formData
    .getAll("student_ids")
    .filter((value): value is string => typeof value === "string" && !!value)

  if (!studentIds.length) {
    throw new Error("Select at least one student.")
  }

  const joinedAt = nullableString(formData, "joined_at") ?? today()
  const rows = studentIds.map((studentId) => ({
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

  revalidatePath(`/batches/${batchId}`)
}

export async function updateStudentBatchFeeOverride(
  batchId: string,
  assignmentId: string,
  formData: FormData
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const feeOverride = nullableNumber(formData, "fee_override")
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

  revalidatePath(`/batches/${batchId}`)
}

export async function archiveStudentBatch(
  batchId: string,
  assignmentId: string
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const { error } = await supabase
    .from("student_batches")
    .update({ status: "archived" })
    .eq("tenant_id", admin.tenantId)
    .eq("batch_id", batchId)
    .eq("id", assignmentId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/batches/${batchId}`)
}

export async function createClassSchedule(batchId: string, formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const teacherId = nullableString(formData, "teacher_id")
  const weekday = numberField(formData, "weekday")
  const startTime = requiredString(formData, "start_time", "Start time is required.")
  const endTime = requiredString(formData, "end_time", "End time is required.")

  if (teacherId) {
    const { count, error: conflictError } = await supabase
      .from("class_schedules")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", admin.tenantId)
      .eq("teacher_id", teacherId)
      .eq("weekday", weekday)
      .eq("status", "active")
      .lt("start_time", endTime)
      .gt("end_time", startTime)

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
    subject: requiredString(formData, "subject", "Subject is required."),
    weekday,
    start_time: startTime,
    end_time: endTime,
    room_name: nullableString(formData, "room_name"),
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
  const name = requiredString(formData, "name", "Batch name is required.")

  return {
    tenant_id: tenantId,
    name,
    subject: null,
    class_level: nullableString(formData, "class_level"),
    medium: nullableString(formData, "medium"),
    group_name: nullableString(formData, "group_name"),
    monthly_fee: numberField(formData, "monthly_fee"),
    teacher_id: null,
    status: statusField(formData),
  }
}

function statusField(formData: FormData) {
  return stringField(formData, "status") === "archived" ? "archived" : "active"
}

function requiredString(formData: FormData, key: string, message: string) {
  const value = stringField(formData, key)

  if (!value) {
    throw new Error(message)
  }

  return value
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

function nullableNumber(formData: FormData, key: string) {
  const rawValue = stringField(formData, key)

  if (!rawValue) {
    return null
  }

  const value = Number(rawValue)

  return Number.isFinite(value) && value >= 0 ? value : null
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
