"use server"

import { revalidatePath } from "next/cache"

import { requireAdminContext } from "@/lib/auth/user"
import { currentMonthStart } from "@/lib/data/fees"
import { teacherSalaryPaymentStartDate } from "@/lib/data/teacher-payment-settings"
import { redirectWithFlashToast } from "@/lib/flash-toast"
import {
  academicGroupSchema,
  parseFormData,
  teacherPaymentSettingsSchema,
  tenantProfileSchema,
} from "@/lib/schemas"
import { createClient } from "@/lib/supabase/server"

export async function updateTenantProfile(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const data = parseFormData(tenantProfileSchema, formData)

  const { error } = await supabase
    .from("tenants")
    .update({
      address: data.address || null,
      contact_phone: data.contact_phone || null,
      email: data.email || null,
      name: data.name,
      secondary_phone: data.secondary_phone || null,
    })
    .eq("id", admin.tenantId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateSettings()
  redirectWithFlashToast("/settings", {
    title: "Centre profile saved",
    message: "The centre name and contact information have been updated.",
    tone: "success",
  })
}

export async function createAcademicGroup(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const data = parseFormData(academicGroupSchema, formData)

  const { data: existing } = await supabase
    .from("academic_groups")
    .select("sort_order")
    .eq("tenant_id", admin.tenantId)
    .order("sort_order", { ascending: false })
    .limit(1)

  const sortOrder = Number(existing?.[0]?.sort_order ?? 0) + 10
  const { error } = await supabase.from("academic_groups").insert({
    name: data.name,
    sort_order: sortOrder,
    tenant_id: admin.tenantId,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidateSettings()
}

export async function updateAcademicGroup(
  groupId: string,
  formData: FormData
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const data = parseFormData(academicGroupSchema, formData)

  const { error } = await supabase
    .from("academic_groups")
    .update({
      name: data.name,
    })
    .eq("tenant_id", admin.tenantId)
    .eq("id", groupId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateSettings()
}

export async function deleteAcademicGroup(groupId: string) {
  const admin = await requireAdminContext()
  const supabase = await createClient()

  const { error } = await supabase
    .from("academic_groups")
    .delete()
    .eq("tenant_id", admin.tenantId)
    .eq("id", groupId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateSettings()
}

export async function updateTeacherPaymentSettings(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const data = parseFormData(teacherPaymentSettingsSchema, formData)

  const { error } = await supabase
    .from("teacher_payment_settings")
    .upsert(
      {
        payment_system: data.payment_system,
        tenant_id: admin.tenantId,
      },
      { onConflict: "tenant_id" }
    )

  if (error) {
    throw new Error(error.message)
  }

  await refreshOpenTeacherSalaryWindows(admin.tenantId, data.payment_system)

  revalidateSettings()
  revalidatePath("/salaries")
  redirectWithFlashToast("/settings", {
    title: "Teacher payment saved",
    message: "Teacher salary payment timing has been updated.",
    tone: "success",
  })
}

async function refreshOpenTeacherSalaryWindows(
  tenantId: string,
  paymentSystem: "prepaid" | "postpaid"
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teacher_salary_ledgers")
    .select("id, ledger_month")
    .eq("tenant_id", tenantId)
    .gte("ledger_month", currentMonthStart())
    .eq("status", "unpaid")

  if (error) {
    throw new Error(error.message)
  }

  const updates = (data ?? []).map((ledger) =>
    supabase
      .from("teacher_salary_ledgers")
      .update({
        payment_start_date: teacherSalaryPaymentStartDate(ledger.ledger_month, {
          payment_system: paymentSystem,
        }),
      })
      .eq("tenant_id", tenantId)
      .eq("id", ledger.id)
  )

  const results = await Promise.all(updates)
  const updateError = results.find((result) => result.error)?.error

  if (updateError) {
    throw new Error(updateError.message)
  }
}

function revalidateSettings() {
  revalidatePath("/settings")
  revalidatePath("/students")
  revalidatePath("/batches")
  revalidatePath("/batches/new")
}
