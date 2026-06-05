"use server"

import { revalidatePath } from "next/cache"

import { requireAdminContext } from "@/lib/auth/user"
import {
  addMonths,
  currentMonthStart,
  monthStart,
} from "@/lib/data/fees"
import { ensureStudentMonthlyLedger } from "@/lib/actions/fees"
import { createClient } from "@/lib/supabase/server"
import { redirectWithFlashToast } from "@/lib/flash-toast"
import {
  formatZodErrors,
  studentSchema,
  parseFormData,
  type FormState,
  type StudentFormData,
} from "@/lib/schemas"

export async function createStudent(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const result = studentSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return { errors: formatZodErrors(result.error) }
  }

  const data = result.data
  let startingFeeMonth: string

  try {
    startingFeeMonth = studentFeeStartMonth(formData)
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Select when the student should start paying fees.",
    }
  }

  const payload = buildStudentPayload(data, admin.tenantId)

  const { data: created, error } = await supabase
    .from("students")
    .insert(payload)
    .select("id")
    .single()

  if (error || !created) {
    return { message: error?.message ?? "Could not create student." }
  }

  await syncStudentBatchAssignments(admin.tenantId, created.id, formData)
  await ensureStudentMonthlyLedger(created.id, startingFeeMonth)

  revalidatePath("/students")
  revalidatePath("/fees")
  redirectWithFlashToast(`/students/${created.id}`, {
    title: "Student added",
    message: `${data.name} has been added and the fee start month is ready.`,
    tone: "success",
  })
}

export async function updateStudent(
  studentId: string,
  formData: FormData
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const data = parseFormData(studentSchema, formData)
  const payload = buildStudentPayload(data, admin.tenantId)

  const { error } = await supabase
    .from("students")
    .update(payload)
    .eq("tenant_id", admin.tenantId)
    .eq("id", studentId)

  if (error) {
    throw new Error(error.message)
  }

  await syncStudentBatchAssignments(admin.tenantId, studentId, formData)

  const returnPath = stringField(formData, "return_path") || `/students/${studentId}`

  revalidatePath("/students")
  revalidatePath(`/students/${studentId}`)
  redirectWithFlashToast(returnPath, {
    title: "Student updated",
    message: `${data.name}'s profile changes have been saved.`,
    tone: "success",
  })
}

export async function archiveStudent(studentId: string, formData?: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const { error } = await supabase
    .from("students")
    .update({ status: "archived" })
    .eq("tenant_id", admin.tenantId)
    .eq("id", studentId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/students")
  revalidatePath(`/students/${studentId}`)
  redirectWithFlashToast(stringField(formData, "return_path") || "/students", {
    title: "Student archived",
    message: "The student has been moved out of the active list.",
    tone: "archive",
  })
}

function buildStudentPayload(
  data: StudentFormData,
  tenantId: string
) {
  const tags = data.tags
    ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  return {
    tenant_id: tenantId,
    name: data.name,
    phone: data.phone || null,
    guardian_name: data.guardian_name || null,
    guardian_phone: data.guardian_phone || null,
    institution: data.institution || null,
    class_level: data.class_level || null,
    medium: data.medium || null,
    group_name: data.group_name || null,
    tags,
    admission_date:
      data.admission_date || new Date().toISOString().slice(0, 10),
    status: data.status,
    notes: data.notes || null,
  }
}

async function syncStudentBatchAssignments(
  tenantId: string,
  studentId: string,
  formData: FormData
) {
  const supabase = await createClient()
  const selectedBatchIds = formData
    .getAll("batch_ids")
    .filter((value): value is string => typeof value === "string" && !!value)

  const { data: existing, error } = await supabase
    .from("student_batches")
    .select("id, batch_id")
    .eq("tenant_id", tenantId)
    .eq("student_id", studentId)

  if (error) return

  const selected = new Set(selectedBatchIds)
  const existingRows = existing ?? []
  const existingBatchIds = new Set(existingRows.map((row) => row.batch_id))
  const rowsToUpsert = selectedBatchIds.map((batchId) => ({
    tenant_id: tenantId,
    student_id: studentId,
    batch_id: batchId,
    joined_at: new Date().toISOString().slice(0, 10),
    status: "active",
  }))

  if (rowsToUpsert.length) {
    await supabase
      .from("student_batches")
      .upsert(rowsToUpsert, { onConflict: "tenant_id,student_id,batch_id" })
  }

  const idsToArchive = existingRows
    .filter((row) => !selected.has(row.batch_id))
    .map((row) => row.id)

  if (idsToArchive.length) {
    await supabase
      .from("student_batches")
      .update({ status: "archived" })
      .eq("tenant_id", tenantId)
      .eq("student_id", studentId)
      .in("id", idsToArchive)
  }

  const idsToActivate = existingRows
    .filter((row) => selected.has(row.batch_id))
    .map((row) => row.id)

  if (idsToActivate.length) {
    await supabase
      .from("student_batches")
      .update({ status: "active" })
      .eq("tenant_id", tenantId)
      .eq("student_id", studentId)
      .in("id", idsToActivate)
  }

  for (const batchId of selected) {
    if (existingBatchIds.has(batchId)) {
      revalidatePath(`/batches/${batchId}`)
    }
  }
}

function studentFeeStartMonth(formData: FormData) {
  const option = stringField(formData, "fee_start_option")

  if (option === "next") {
    return addMonths(currentMonthStart(), 1)
  }

  if (option === "custom") {
    const customMonth = stringField(formData, "fee_start_custom_month")

    if (!/^\d{4}-\d{2}$/.test(customMonth)) {
      throw new Error("Select a custom fee start month.")
    }

    return monthStart(customMonth)
  }

  return currentMonthStart()
}

function stringField(formData: FormData | undefined, key: string) {
  const value = formData?.get(key)

  return typeof value === "string" ? value.trim() : ""
}
