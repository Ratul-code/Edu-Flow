"use server"

import { revalidatePath } from "next/cache"

import { requireAdminContext } from "@/lib/auth/user"
import { redirectWithFlashToast } from "@/lib/flash-toast"
import { createClient } from "@/lib/supabase/server"
import {
  formatZodErrors,
  teacherSchema,
  type FormState,
  type TeacherFormData,
} from "@/lib/schemas"

export async function createTeacher(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const result = teacherSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return { errors: formatZodErrors(result.error) }
  }

  const { data, error } = await supabase
    .from("teachers")
    .insert({
      tenant_id: admin.tenantId,
      ...teacherPayload(result.data),
    })
    .select("id")
    .single()

  if (error || !data) {
    return { message: error?.message ?? "Could not create teacher." }
  }

  revalidatePath("/teachers")
  redirectWithFlashToast(`/teachers/${data.id}`, {
    title: "Teacher added",
    message: `${result.data.name} has been added to your teacher list.`,
    tone: "success",
  })
}

export async function updateTeacher(
  teacherId: string,
  redirectPath: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const result = teacherSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return { errors: formatZodErrors(result.error) }
  }

  const { error } = await supabase
    .from("teachers")
    .update(teacherPayload(result.data))
    .eq("tenant_id", admin.tenantId)
    .eq("id", teacherId)

  if (error) {
    return { message: error.message }
  }

  revalidatePath("/teachers")
  revalidatePath(`/teachers/${teacherId}`)
  redirectWithFlashToast(redirectPath, {
    title: "Teacher updated",
    message: `${result.data.name}'s teacher profile has been saved.`,
    tone: "warning",
  })
}

export async function archiveTeacher(teacherId: string, formData?: FormData) {
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
  redirectWithFlashToast(stringField(formData, "return_path") || "/teachers", {
    title: "Teacher archived",
    message: "The teacher has been moved out of the active list.",
    tone: "archive",
  })
}

function stringField(formData: FormData | undefined, key: string) {
  const value = formData?.get(key)

  return typeof value === "string" ? value.trim() : ""
}

function teacherPayload(data: TeacherFormData) {
  return {
    name: data.name,
    phone: data.phone,
    subject_specialty: data.subject_specialty,
    default_monthly_salary: data.default_monthly_salary,
    status: data.status,
    notes: data.notes,
  }
}
