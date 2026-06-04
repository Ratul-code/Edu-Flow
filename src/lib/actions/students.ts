"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/user"
import { createClient } from "@/lib/supabase/server"

export async function createStudent(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const payload = studentPayloadFromForm(formData, admin.tenantId)

  const { data, error } = await supabase
    .from("students")
    .insert(payload)
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create student.")
  }

  await syncStudentBatchAssignments(admin.tenantId, data.id, formData)

  revalidatePath("/students")
  redirect(`/students/${data.id}`)
}

export async function updateStudent(studentId: string, formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const payload = studentPayloadFromForm(formData, admin.tenantId)

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

function studentPayloadFromForm(formData: FormData, tenantId: string) {
  const name = stringField(formData, "name")

  if (!name) {
    throw new Error("Student name is required.")
  }

  return {
    tenant_id: tenantId,
    name,
    phone: nullableStringField(formData, "phone"),
    guardian_name: nullableStringField(formData, "guardian_name"),
    guardian_phone: nullableStringField(formData, "guardian_phone"),
    school: nullableStringField(formData, "school"),
    class_level: nullableStringField(formData, "class_level"),
    medium: nullableStringField(formData, "medium"),
    group_name: nullableStringField(formData, "group_name"),
    tags: tagsField(formData),
    admission_date:
      nullableStringField(formData, "admission_date") ??
      new Date().toISOString().slice(0, 10),
    status: studentStatusField(formData),
    notes: nullableStringField(formData, "notes"),
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

  if (error) {
    throw new Error(error.message)
  }

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
    const { error: upsertError } = await supabase
      .from("student_batches")
      .upsert(rowsToUpsert, { onConflict: "tenant_id,student_id,batch_id" })

    if (upsertError) {
      throw new Error(upsertError.message)
    }
  }

  const assignmentIdsToArchive = existingRows
    .filter((row) => !selected.has(row.batch_id))
    .map((row) => row.id)

  if (assignmentIdsToArchive.length) {
    const { error: archiveError } = await supabase
      .from("student_batches")
      .update({ status: "archived" })
      .eq("tenant_id", tenantId)
      .eq("student_id", studentId)
      .in("id", assignmentIdsToArchive)

    if (archiveError) {
      throw new Error(archiveError.message)
    }
  }

  const assignmentIdsToActivate = existingRows
    .filter((row) => selected.has(row.batch_id))
    .map((row) => row.id)

  if (assignmentIdsToActivate.length) {
    const { error: activeError } = await supabase
      .from("student_batches")
      .update({ status: "active" })
      .eq("tenant_id", tenantId)
      .eq("student_id", studentId)
      .in("id", assignmentIdsToActivate)

    if (activeError) {
      throw new Error(activeError.message)
    }
  }

  for (const batchId of selected) {
    if (existingBatchIds.has(batchId)) {
      revalidatePath(`/batches/${batchId}`)
    }
  }
}

function studentStatusField(formData: FormData) {
  const status = stringField(formData, "status")

  return status === "archived" ? "archived" : "active"
}

function stringField(formData: FormData, key: string) {
  const value = formData.get(key)

  return typeof value === "string" ? value.trim() : ""
}

function nullableStringField(formData: FormData, key: string) {
  const value = stringField(formData, key)

  return value || null
}

function tagsField(formData: FormData) {
  const tags = stringField(formData, "tags")

  if (!tags) {
    return []
  }

  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}
