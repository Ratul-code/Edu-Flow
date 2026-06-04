"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/user"
import { createClient } from "@/lib/supabase/server"

export async function createTeacher(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const payload = teacherPayloadFromForm(formData, admin.tenantId)

  const { data, error } = await supabase
    .from("teachers")
    .insert(payload)
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create teacher.")
  }

  revalidatePath("/teachers")
  redirect(`/teachers/${data.id}`)
}

export async function updateTeacher(teacherId: string, formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const payload = teacherPayloadFromForm(formData, admin.tenantId)

  const { error } = await supabase
    .from("teachers")
    .update(payload)
    .eq("tenant_id", admin.tenantId)
    .eq("id", teacherId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/teachers")
  revalidatePath(`/teachers/${teacherId}`)
  redirect(`/teachers/${teacherId}`)
}

export async function archiveTeacher(teacherId: string) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const { error } = await supabase
    .from("teachers")
    .update({ status: "archived" })
    .eq("tenant_id", admin.tenantId)
    .eq("id", teacherId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/teachers")
  revalidatePath(`/teachers/${teacherId}`)
  redirect("/teachers")
}

function teacherPayloadFromForm(formData: FormData, tenantId: string) {
  const name = stringField(formData, "name")

  if (!name) {
    throw new Error("Teacher name is required.")
  }

  return {
    tenant_id: tenantId,
    name,
    phone: nullableStringField(formData, "phone"),
    subject_specialty: nullableStringField(formData, "subject_specialty"),
    default_monthly_salary: numberField(formData, "default_monthly_salary"),
    status: teacherStatusField(formData),
    notes: nullableStringField(formData, "notes"),
  }
}

function teacherStatusField(formData: FormData) {
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

function numberField(formData: FormData, key: string) {
  const value = Number(stringField(formData, key))

  return Number.isFinite(value) && value >= 0 ? value : 0
}
