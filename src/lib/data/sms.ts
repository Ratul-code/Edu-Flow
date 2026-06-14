import { createClient } from "@/lib/supabase/server"

export type SmsWalletRecord = {
  id: string
  tenant_id: string
  available_credits: number
  reserved_credits: number
  total_purchased_credits: number
  total_used_credits: number
  total_refunded_credits: number
  low_balance_threshold: number
  sms_enabled: boolean
  created_at: string
  updated_at: string
}

export type SmsCreditTransactionRecord = {
  id: string
  tenant_id: string
  admin_user_id: string | null
  transaction_type:
    | "purchase"
    | "manual_adjustment"
    | "campaign_reserved"
    | "campaign_used"
    | "campaign_refund"
    | "automation_used"
    | "failed_refund"
  credit_amount: number
  balance_before: number
  balance_after: number
  reference_type: string | null
  reference_id: string | null
  description: string | null
  created_at: string
}

export type SmsCreditPackageRecord = {
  id: string
  name: string
  credits: number
  price: number | string
  is_active: boolean
  sort_order: number
}

export type SmsTemplateRecord = {
  id: string
  tenant_id: string
  name: string
  category:
    | "payment_confirmation"
    | "payment_reminder"
    | "grace_period"
    | "overdue_warning"
    | "exam_notice"
    | "holiday_notice"
    | "general_notice"
  message_body: string
  is_active: boolean
  is_default: boolean
}

export type TenantSmsSettingsRecord = {
  id: string
  tenant_id: string
  default_recipient_type: SmsRecipientType
  sms_signature: string | null
  max_bulk_segments: number
  max_automated_segments: number
  max_single_sms_segments: number
  max_bulk_recipients: number
  payment_confirmation_enabled: boolean
  payment_confirmation_recipient: SmsRecipientType
  payment_confirmation_template_id: string | null
  payment_reminder_enabled: boolean
  payment_reminder_days_before_due: number
  payment_reminder_recipient: SmsRecipientType
  payment_reminder_template_id: string | null
  grace_period_enabled: boolean
  grace_period_days_after_due: number
  grace_period_recipient: SmsRecipientType
  grace_period_template_id: string | null
  overdue_warning_enabled: boolean
  overdue_warning_days_before_overdue: number
  overdue_warning_recipient: SmsRecipientType
  overdue_warning_template_id: string | null
}

export type SmsRecipientType = "student" | "guardian" | "both"

export type SmsMessageType = "gsm" | "unicode"

export type SmsCreditPreview = {
  available_credits: number
  character_count: number
  message_type: SmsMessageType
  recipient_count: number
  remaining_credits_after_send: number
  segment_size: 160 | 67
  segments_per_recipient: number
  total_credits_required: number
}

export function smsMessageType(messageBody: string): SmsMessageType {
  return isGsmSms(messageBody) ? "gsm" : "unicode"
}

export function isGsmSms(messageBody: string) {
  for (const character of messageBody) {
    if (character.charCodeAt(0) > 127) {
      return false
    }
  }

  return true
}

export function smsSegmentSize(messageBody: string): 160 | 67 {
  return isGsmSms(messageBody) ? 160 : 67
}

export function smsSegments(messageBody: string) {
  return Math.max(
    Math.ceil(Math.max(messageBody.length, 1) / smsSegmentSize(messageBody)),
    1
  )
}

export function smsRequiredCredits(messageBody: string, recipientCount: number) {
  return smsSegments(messageBody) * Math.max(Math.trunc(recipientCount), 0)
}

export function smsCreditPreview({
  availableCredits,
  messageBody,
  recipientCount,
}: {
  availableCredits: number
  messageBody: string
  recipientCount: number
}): SmsCreditPreview {
  const normalizedRecipientCount = Math.max(Math.trunc(recipientCount), 0)
  const totalCreditsRequired = smsRequiredCredits(
    messageBody,
    normalizedRecipientCount
  )

  return {
    available_credits: Math.max(Math.trunc(availableCredits), 0),
    character_count: messageBody.length,
    message_type: smsMessageType(messageBody),
    recipient_count: normalizedRecipientCount,
    remaining_credits_after_send:
      Math.max(Math.trunc(availableCredits), 0) - totalCreditsRequired,
    segment_size: smsSegmentSize(messageBody),
    segments_per_recipient: smsSegments(messageBody),
    total_credits_required: totalCreditsRequired,
  }
}

export function canSendSms({
  availableCredits,
  messageBody,
  recipientCount,
}: {
  availableCredits: number
  messageBody: string
  recipientCount: number
}) {
  return availableCredits >= smsRequiredCredits(messageBody, recipientCount)
}

export function normalizeBdPhone(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D+/g, "")

  if (/^8801[3-9]\d{8}$/.test(digits)) {
    return digits
  }

  if (/^01[3-9]\d{8}$/.test(digits)) {
    return `88${digits}`
  }

  if (/^1[3-9]\d{8}$/.test(digits)) {
    return `880${digits}`
  }

  return null
}

export async function getSmsWallet(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tenant_sms_wallets")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as SmsWalletRecord
}

export async function listSmsCreditTransactions(
  tenantId: string,
  limit = 50
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sms_credit_transactions")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as SmsCreditTransactionRecord[]
}

export async function listSmsCreditPackages() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sms_credit_packages")
    .select("id, name, credits, price, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("credits", { ascending: true })

  if (error || !data) {
    return []
  }

  return data as SmsCreditPackageRecord[]
}

export async function listSmsTemplates(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sms_templates")
    .select("id, tenant_id, name, category, message_body, is_active, is_default")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("is_default", { ascending: false })
    .order("name", { ascending: true })

  if (error || !data) {
    return []
  }

  return data as SmsTemplateRecord[]
}

export async function getTenantSmsSettings(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tenant_sms_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle()

  if (error || !data) {
    return defaultTenantSmsSettings(tenantId)
  }

  return data as TenantSmsSettingsRecord
}

function defaultTenantSmsSettings(tenantId: string): TenantSmsSettingsRecord {
  return {
    default_recipient_type: "guardian",
    grace_period_days_after_due: 1,
    grace_period_enabled: false,
    grace_period_recipient: "guardian",
    grace_period_template_id: null,
    id: "default",
    max_automated_segments: 3,
    max_bulk_recipients: 500,
    max_bulk_segments: 3,
    max_single_sms_segments: 3,
    overdue_warning_days_before_overdue: 1,
    overdue_warning_enabled: false,
    overdue_warning_recipient: "guardian",
    overdue_warning_template_id: null,
    payment_confirmation_enabled: false,
    payment_confirmation_recipient: "guardian",
    payment_confirmation_template_id: null,
    payment_reminder_days_before_due: 3,
    payment_reminder_enabled: false,
    payment_reminder_recipient: "guardian",
    payment_reminder_template_id: null,
    sms_signature: null,
    tenant_id: tenantId,
  }
}
