"use server"

import { revalidatePath } from "next/cache"

import { requireAdminContext } from "@/lib/auth/user"
import { currentMonthStart } from "@/lib/data/fees"
import {
  teacherSalaryGraceEndDate,
  teacherSalaryPaymentStartDate,
} from "@/lib/data/teacher-payment-settings"
import { redirectWithFlashToast } from "@/lib/flash-toast"
import {
  academicGroupSchema,
  adminProfileSchema,
  mediumOptionSchema,
  parseFormData,
  teacherPaymentSettingsSchema,
  tenantProfileSchema,
} from "@/lib/schemas"
import { createClient } from "@/lib/supabase/server"

export async function updateTenantProfile(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const logoFile = formData.get("logo")
  const profileFormData = new FormData()

  for (const [key, value] of formData.entries()) {
    if (key !== "logo") {
      profileFormData.append(key, value)
    }
  }

  const data = parseFormData(tenantProfileSchema, profileFormData)
  const logoDataUrl = await logoDataUrlFromFile(logoFile)

  const { error } = await supabase
    .from("tenants")
    .update({
      address: data.address,
      contact_phone: data.contact_phone,
      email: data.email,
      ...(logoDataUrl ? { logo_url: logoDataUrl } : {}),
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

async function logoDataUrlFromFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null
  }

  const allowedTypes = new Set([
    "image/png",
    "image/svg+xml",
    "image/jpeg",
    "image/webp",
  ])

  if (!allowedTypes.has(value.type)) {
    throw new Error("Logo must be a PNG, SVG, JPG, or WebP file.")
  }

  if (value.size > 512 * 1024) {
    throw new Error("Logo file must be 512 KB or smaller.")
  }

  const buffer = Buffer.from(await value.arrayBuffer())

  return `data:${value.type};base64,${buffer.toString("base64")}`
}

export async function updateAdminProfile(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const data = parseFormData(adminProfileSchema, formData)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Authenticated admin not found.")
  }

  const { error } = await supabase
    .from("admin_users")
    .update({
      name: data.name,
      phone: data.phone || null,
    })
    .eq("tenant_id", admin.tenantId)
    .eq("auth_user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/account/settings")
  revalidatePath("/settings")
  redirectWithFlashToast("/account/settings", {
    title: "Profile saved",
    message: "Your admin profile has been updated.",
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

export async function createMediumOption(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const data = parseFormData(mediumOptionSchema, formData)

  const { data: existing } = await supabase
    .from("medium_options")
    .select("sort_order")
    .eq("tenant_id", admin.tenantId)
    .order("sort_order", { ascending: false })
    .limit(1)

  const sortOrder = Number(existing?.[0]?.sort_order ?? 0) + 10
  const { error } = await supabase.from("medium_options").insert({
    name: data.name,
    sort_order: sortOrder,
    tenant_id: admin.tenantId,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidateSettings()
}

export async function updateMediumOption(
  mediumId: string,
  formData: FormData
) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const data = parseFormData(mediumOptionSchema, formData)

  const { error } = await supabase
    .from("medium_options")
    .update({
      name: data.name,
    })
    .eq("tenant_id", admin.tenantId)
    .eq("id", mediumId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateSettings()
}

export async function deleteMediumOption(mediumId: string) {
  const admin = await requireAdminContext()
  const supabase = await createClient()

  const { error } = await supabase
    .from("medium_options")
    .delete()
    .eq("tenant_id", admin.tenantId)
    .eq("id", mediumId)

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
        payment_start_day: data.payment_start_day,
        grace_period_days: data.grace_period_days,
        tenant_id: admin.tenantId,
      },
      { onConflict: "tenant_id" }
    )

  if (error) {
    throw new Error(error.message)
  }

  await refreshOpenTeacherSalaryWindows(admin.tenantId, data)

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
  settings: ReturnType<typeof teacherPaymentSettingsSchema.parse>
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
        grace_end_date: teacherSalaryGraceEndDate(
          teacherSalaryPaymentStartDate(ledger.ledger_month, settings),
          settings
        ),
        payment_start_date: teacherSalaryPaymentStartDate(
          ledger.ledger_month,
          settings
        ),
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
