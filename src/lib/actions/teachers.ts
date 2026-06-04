"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdminContext } from "@/lib/auth/user"
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
  redirect(`/teachers/${data.id}`)
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
  redirect(redirectPath)
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
