"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/user"
import { createClient } from "@/lib/supabase/server"
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

  revalidatePath("/students")
  redirect(`/students/${created.id}`)
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

  revalidatePath("/students")
  revalidatePath(`/students/${studentId}`)
  redirect(`/students/${studentId}`)
}

export async function archiveStudent(studentId: string) {
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
  redirect("/students")
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
    school: data.school || null,
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
