"use server"

import { revalidatePath } from "next/cache"

import { getAuthenticatedUser, requireAdminContext } from "@/lib/auth/user"
import { getTenantSmsSettings } from "@/lib/data/sms"
import { redirectWithFlashToast } from "@/lib/flash-toast"
import { createClient } from "@/lib/supabase/server"

type SmsRecipientType = "student" | "guardian" | "both"

const recipientTypes = new Set(["student", "guardian", "both"])
const paymentMethods = new Set(["bkash", "nagad", "bank", "cash", "other"])

export async function updateTenantSmsSettings(formData: FormData) {
  await saveTenantSmsSettings(formData)

  redirectWithFlashToast("/communication/settings", {
    title: "SMS settings saved",
    message: "Communication defaults and automation rules have been updated.",
    tone: "success",
  })
}

export async function updateTenantSmsSettingsInline(formData: FormData) {
  await saveTenantSmsSettings(formData)
}

async function saveTenantSmsSettings(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const current = await getTenantSmsSettings(admin.tenantId)

  const templateIds = [
    templateId(
      formData,
      "payment_confirmation_template_id",
      current.payment_confirmation_template_id
    ),
    templateId(
      formData,
      "payment_reminder_template_id",
      current.payment_reminder_template_id
    ),
    templateId(formData, "grace_period_template_id", current.grace_period_template_id),
    templateId(
      formData,
      "overdue_warning_template_id",
      current.overdue_warning_template_id
    ),
  ].filter((value): value is string => Boolean(value))

  if (templateIds.length > 0) {
    const { data, error } = await supabase
      .from("sms_templates")
      .select("id")
      .eq("tenant_id", admin.tenantId)
      .in("id", templateIds)

    if (error) {
      throw new Error(error.message)
    }

    if ((data?.length ?? 0) !== new Set(templateIds).size) {
      throw new Error("One or more SMS templates do not belong to this tenant.")
    }
  }

  const { error } = await supabase.from("tenant_sms_settings").upsert(
    {
      default_recipient_type: recipient(
        formData,
        "default_recipient_type",
        current.default_recipient_type
      ),
      grace_period_days_after_due: positiveInteger(
        formData,
        "grace_period_days_after_due",
        current.grace_period_days_after_due,
        0
      ),
      grace_period_enabled: booleanField(
        formData,
        "grace_period_enabled",
        current.grace_period_enabled
      ),
      grace_period_recipient: recipient(
        formData,
        "grace_period_recipient",
        current.grace_period_recipient
      ),
      grace_period_template_id: templateId(
        formData,
        "grace_period_template_id",
        current.grace_period_template_id
      ),
      max_automated_segments: positiveInteger(
        formData,
        "max_automated_segments",
        current.max_automated_segments
      ),
      max_bulk_recipients: positiveInteger(
        formData,
        "max_bulk_recipients",
        current.max_bulk_recipients
      ),
      max_bulk_segments: positiveInteger(
        formData,
        "max_bulk_segments",
        current.max_bulk_segments
      ),
      max_single_sms_segments: positiveInteger(
        formData,
        "max_single_sms_segments",
        current.max_single_sms_segments
      ),
      overdue_warning_days_before_overdue: positiveInteger(
        formData,
        "overdue_warning_days_before_overdue",
        current.overdue_warning_days_before_overdue,
        0
      ),
      overdue_warning_enabled: booleanField(
        formData,
        "overdue_warning_enabled",
        current.overdue_warning_enabled
      ),
      overdue_warning_recipient: recipient(
        formData,
        "overdue_warning_recipient",
        current.overdue_warning_recipient
      ),
      overdue_warning_template_id: templateId(
        formData,
        "overdue_warning_template_id",
        current.overdue_warning_template_id
      ),
      payment_confirmation_enabled: booleanField(
        formData,
        "payment_confirmation_enabled",
        current.payment_confirmation_enabled
      ),
      payment_confirmation_recipient: recipient(
        formData,
        "payment_confirmation_recipient",
        current.payment_confirmation_recipient
      ),
      payment_confirmation_template_id: templateId(
        formData,
        "payment_confirmation_template_id",
        current.payment_confirmation_template_id
      ),
      payment_reminder_days_before_due: positiveInteger(
        formData,
        "payment_reminder_days_before_due",
        current.payment_reminder_days_before_due,
        0
      ),
      payment_reminder_enabled: booleanField(
        formData,
        "payment_reminder_enabled",
        current.payment_reminder_enabled
      ),
      payment_reminder_recipient: recipient(
        formData,
        "payment_reminder_recipient",
        current.payment_reminder_recipient
      ),
      payment_reminder_template_id: templateId(
        formData,
        "payment_reminder_template_id",
        current.payment_reminder_template_id
      ),
      sms_signature: formData.has("sms_signature")
        ? text(formData, "sms_signature") || null
        : current.sms_signature,
      tenant_id: admin.tenantId,
    },
    { onConflict: "tenant_id" }
  )

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/communication/settings")
}

export async function createSmsRechargeRequest(formData: FormData) {
  const admin = await requireAdminContext()
  const user = await getAuthenticatedUser()
  const supabase = await createClient()
  const packageId = text(formData, "package_id")
  const paymentMethod = text(formData, "payment_method")

  if (!user) {
    throw new Error("You must be signed in to request SMS credits.")
  }

  if (!packageId) {
    throw new Error("Select an SMS credit package.")
  }

  if (!paymentMethods.has(paymentMethod)) {
    throw new Error("Select a valid payment method.")
  }

  const { data: packageRow, error: packageError } = await supabase
    .from("sms_credit_packages")
    .select("id, name, credits, price")
    .eq("id", packageId)
    .eq("is_active", true)
    .maybeSingle()

  if (packageError) {
    throw new Error(packageError.message)
  }

  if (!packageRow) {
    throw new Error("Selected SMS credit package is no longer available.")
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("tenant_id", admin.tenantId)
    .eq("auth_user_id", user.id)
    .eq("role", "admin")
    .eq("status", "active")
    .maybeSingle()

  if (adminError) {
    throw new Error(adminError.message)
  }

  if (!adminRow) {
    throw new Error("Your admin account could not be verified.")
  }

  const { error } = await supabase.from("sms_recharge_requests").insert({
    package_id: packageRow.id,
    package_name: packageRow.name,
    payable_amount: packageRow.price,
    payment_method: paymentMethod,
    payment_note: text(formData, "payment_note") || null,
    requested_by: adminRow.id,
    requested_credits: packageRow.credits,
    tenant_id: admin.tenantId,
    transaction_id: text(formData, "transaction_id") || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/communication/settings")
  redirectWithFlashToast("/communication/settings", {
    title: "Recharge requested",
    message: "Your SMS credit request has been submitted for approval.",
    tone: "success",
  })
}

function text(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

function recipient(
  formData: FormData,
  name: string,
  fallback: SmsRecipientType
): SmsRecipientType {
  const value = text(formData, name)
  return recipientTypes.has(value) ? (value as SmsRecipientType) : fallback
}

function templateId(formData: FormData, name: string, fallback: string | null) {
  if (!formData.has(name)) {
    return fallback
  }

  const value = text(formData, name)
  return value && value !== "none" ? value : null
}

function booleanField(formData: FormData, name: string, fallback: boolean) {
  const values = formData.getAll(name)

  if (values.length === 0) {
    return fallback
  }

  return values[values.length - 1] === "on"
}

function positiveInteger(
  formData: FormData,
  name: string,
  fallback: number,
  min = 1
) {
  const parsed = Number.parseInt(text(formData, name), 10)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.max(parsed, min)
}
