"use server"

import { revalidatePath } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"

import { getAuthenticatedUser, requireAdminContext } from "@/lib/auth/user"
import {
  getSmsWallet,
  getTenantSmsSettings,
  normalizeBdPhone,
  smsMessageType,
  smsSegments,
  type SmsRecipientType,
  type SmsTemplateRecord,
} from "@/lib/data/sms"
import { redirectWithFlashToast } from "@/lib/flash-toast"
import {
  assertBanglaSmsText,
  hasLatinLettersOutsideTemplateTokens,
} from "@/lib/sms/bangla-text"
import { createSmsProvider } from "@/lib/sms/provider"
import { createClient } from "@/lib/supabase/server"

type ManualSmsRecipient = {
  destination: string
  finalMessageBody: string
  normalizedDestination: string | null
  recipientName: string
  recipientType: "student" | "guardian" | "custom"
  studentId: string | null
}

type StudentSmsRecipient = {
  guardian_name: string | null
  guardian_phone: string | null
  id: string
  name: string
  phone: string | null
  smsVariables?: Record<string, string>
}

type StudentSmsLedgerVariableRow = {
  due_amount: number | string
  expected_amount: number | string
  grace_end_date: string
  ledger_month: string
  paid_amount: number | string
  payment_start_date: string
  student_id: string
}

const recipientTypes = new Set(["student", "guardian", "both"])
const paymentMethods = new Set(["bkash", "nagad", "bank", "cash", "other"])
const protectedSmsTemplateKeys = new Set([
  "payment_confirmation:Payment Confirmation",
  "payment_reminder:Payment Reminder",
  "grace_period:Grace Period Notice",
  "overdue_warning:Overdue Warning",
])
const manualSmsTemplateVariables = new Set([
  "amount",
  "coaching_name",
  "coaching_phone",
  "due_amount",
  "due_date",
  "expected_amount",
  "guardian_name",
  "month",
  "paid_amount",
  "payment_date",
  "payment_method",
  "receipt_no",
  "receipt_link",
  "student_name",
])

export async function sendManualSms(formData: FormData) {
  const admin = await requireAdminContext()
  const user = await getAuthenticatedUser()
  const supabase = await createClient()
  const provider = createSmsProvider()
  const messageBody = text(formData, "message_body")
  const settings = await getTenantSmsSettings(admin.tenantId)
  const signedMessageBody = appendSmsSignature(
    messageBody,
    settings.sms_signature
  )
  const recipientMode = text(formData, "recipient_mode") || "bulk"
  const recipientType = recipient(
    formData,
    "recipient_type",
    "guardian"
  )

  if (!user) {
    throw new Error("You must be signed in to send SMS.")
  }

  if (!messageBody) {
    throw new Error("Message is required.")
  }

  assertBanglaSmsText(signedMessageBody, "SMS message")

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

  const { data: tenantRow, error: tenantError } = await supabase
    .from("tenants")
    .select("name, contact_phone")
    .eq("id", admin.tenantId)
    .maybeSingle()

  if (tenantError) {
    throw new Error(tenantError.message)
  }

  const candidates = await buildManualSmsRecipients({
    adminTenantId: admin.tenantId,
    coachingName: tenantRow?.name ?? admin.tenantName,
    coachingPhone: tenantRow?.contact_phone ?? "",
    formData,
    messageBody: signedMessageBody,
    recipientMode,
    recipientType,
    supabase,
  })
  const recipients = dedupeSmsRecipients(candidates)

  assertResolvedSmsRecipientsAreBangla(recipients)

  const validRecipients = recipients.filter(
    (item) => item.normalizedDestination !== null
  )
  const invalidRecipients = recipients.filter(
    (item) => item.normalizedDestination === null
  )

  if (recipients.length === 0) {
    throw new Error("No recipients found for this SMS.")
  }

  if (validRecipients.length === 0) {
    throw new Error("No valid Bangladeshi phone numbers found.")
  }

  const creditsRequired = validRecipients.reduce(
    (total, item) => total + smsSegments(item.finalMessageBody),
    0
  )
  const wallet = await getSmsWallet(admin.tenantId)

  if (!wallet?.sms_enabled) {
    throw new Error("SMS is disabled for this tenant.")
  }

  if (wallet.available_credits < creditsRequired) {
    throw new Error("Insufficient SMS credits.")
  }

  const firstValidMessage =
    validRecipients[0]?.finalMessageBody ?? signedMessageBody
  const { data: communicationMessage, error: messageError } = await supabase
    .from("communication_messages")
    .insert({
      channel: "sms",
      channel_metadata: {
        provider: "greenweb",
        recipient_mode: recipientMode,
        recipient_type: recipientType,
      },
      character_count: firstValidMessage.length,
      credits_required: creditsRequired,
      message_body: signedMessageBody,
      message_preview: firstValidMessage.slice(0, 160),
      recipient_count: recipients.length,
      recipient_summary: `${validRecipients.length} valid, ${invalidRecipients.length} invalid`,
      segments_per_recipient: smsSegments(firstValidMessage),
      sent_by: adminRow.id,
      sms_type: smsMessageType(firstValidMessage),
      source: recipientMode === "bulk" ? "bulk" : "manual",
      status: "draft",
      tenant_id: admin.tenantId,
    })
    .select("id")
    .single()

  if (messageError) {
    throw new Error(messageError.message)
  }

  const recipientRows = recipients.map((recipient) => {
    const isValid = Boolean(recipient.normalizedDestination)

    return {
      channel: "sms",
      communication_message_id: communicationMessage.id,
      credits_used: 0,
      destination: recipient.destination,
      error_message: isValid ? null : "Invalid Bangladeshi phone number.",
      final_message_body: recipient.finalMessageBody,
      normalized_destination: recipient.normalizedDestination,
      recipient_name: recipient.recipientName,
      recipient_type: recipient.recipientType,
      segments: isValid ? smsSegments(recipient.finalMessageBody) : null,
      sms_type: isValid ? smsMessageType(recipient.finalMessageBody) : null,
      status: isValid ? "queued" : "invalid_number",
      student_id: recipient.studentId,
      tenant_id: admin.tenantId,
    }
  })
  const { data: insertedRecipients, error: recipientsError } = await supabase
    .from("communication_recipients")
    .insert(recipientRows)
    .select("id, normalized_destination, final_message_body, segments")

  if (recipientsError) {
    throw new Error(recipientsError.message)
  }

  const validRows = (insertedRecipients ?? []).filter(
    (row) => row.normalized_destination
  )

  const { error: reserveError } = await supabase.rpc(
    "sms_wallet_reserve_communication_message",
    {
      p_admin_user_id: adminRow.id,
      p_communication_message_id: communicationMessage.id,
      p_credits: creditsRequired,
      p_description: "Manual SMS credits reserved",
      p_tenant_id: admin.tenantId,
    }
  )

  if (reserveError) {
    throw new Error(reserveError.message)
  }

  const { error: sendingStatusError } = await supabase
    .from("communication_messages")
    .update({ status: "sending" })
    .eq("tenant_id", admin.tenantId)
    .eq("id", communicationMessage.id)

  if (sendingStatusError) {
    throw new Error(sendingStatusError.message)
  }

  const providerMessages = validRows.map((row) => ({
    message: String(row.final_message_body),
    to: String(row.normalized_destination),
  }))
  const sendResults = await provider
    .sendBulkSms(providerMessages)
    .catch((error: unknown) => ({
      raw: {
        error: error instanceof Error ? error.message : "GreenWeb request failed.",
      },
      results: providerMessages.map((message) => ({
        errorMessage:
          error instanceof Error ? error.message : "GreenWeb request failed.",
        providerMessageId: undefined,
        raw: {
          error:
            error instanceof Error ? error.message : "GreenWeb request failed.",
        },
        status: "failed" as const,
        to: message.to,
      })),
    }))
  let deliveredCount = 0
  let failedCount = invalidRecipients.length
  let creditsUsed = 0
  let creditsRefunded = 0

  for (let index = 0; index < validRows.length; index += 1) {
    const row = validRows[index]
    const result = sendResults.results[index]

    if (!row) {
      continue
    }

    const rowCredits = Number(row.segments ?? 1)

    if (result?.status === "sent") {
      deliveredCount += 1
      creditsUsed += rowCredits
      await supabase
        .from("communication_recipients")
        .update({
          credits_used: rowCredits,
          delivered_at: new Date().toISOString(),
          provider_message_id: result.providerMessageId ?? null,
          provider_response: result.raw ?? {},
          sent_at: new Date().toISOString(),
          status: "delivered",
        })
        .eq("tenant_id", admin.tenantId)
        .eq("id", row.id)
    } else {
      failedCount += 1
      creditsRefunded += rowCredits
      await supabase
        .from("communication_recipients")
        .update({
          error_message: result?.errorMessage ?? "GreenWeb SMS send failed.",
          provider_message_id: result?.providerMessageId ?? null,
          provider_response: result?.raw ?? {},
          sent_at: new Date().toISOString(),
          status: "failed",
        })
        .eq("tenant_id", admin.tenantId)
        .eq("id", row.id)
    }
  }

  if (creditsUsed > 0) {
    const { error: useError } = await supabase.rpc("sms_wallet_use_reserved", {
      p_admin_user_id: adminRow.id,
      p_communication_message_id: communicationMessage.id,
      p_credits: creditsUsed,
      p_description: "Manual SMS credits used",
      p_reference_id: communicationMessage.id,
      p_reference_type: "communication_message",
      p_tenant_id: admin.tenantId,
      p_transaction_type: "campaign_used",
    })

    if (useError) {
      throw new Error(useError.message)
    }
  }

  if (creditsRefunded > 0) {
    const { error: refundError } = await supabase.rpc("sms_wallet_refund_reserved", {
      p_admin_user_id: adminRow.id,
      p_communication_message_id: communicationMessage.id,
      p_credits: creditsRefunded,
      p_description: "Failed SMS credits refunded",
      p_reference_id: communicationMessage.id,
      p_reference_type: "communication_message",
      p_tenant_id: admin.tenantId,
      p_transaction_type: "failed_refund",
    })

    if (refundError) {
      throw new Error(refundError.message)
    }
  }

  await supabase
    .from("communication_messages")
    .update({
      delivered_count: deliveredCount,
      failed_count: failedCount,
      recipient_count: recipients.length,
      recipient_summary: `${deliveredCount} delivered, ${failedCount} failed`,
      sent_at: new Date().toISOString(),
      status:
        deliveredCount > 0 && failedCount > 0
          ? "partial_failed"
          : deliveredCount > 0
            ? "completed"
            : "failed",
    })
    .eq("tenant_id", admin.tenantId)
    .eq("id", communicationMessage.id)

  revalidatePath("/communication/sms")
  revalidatePath("/communication/logs")
  revalidatePath("/communication/settings")
  redirectWithFlashToast("/communication/sms", {
    title: "SMS send completed",
    message: `${deliveredCount} delivered, ${failedCount} failed.`,
    tone: deliveredCount > 0 ? "success" : "destructive",
  })
}

export async function sendPaymentConfirmationSms({
  amount,
  dueAmountAfterPayment,
  expectedAmount,
  guardianName,
  guardianPhone,
  ledgerId,
  ledgerMonth,
  paidAmountAfterPayment,
  paymentDate,
  paymentMethod,
  receiptNo,
  studentId,
  studentName,
  studentPhone,
}: {
  amount: number
  dueAmountAfterPayment: number
  expectedAmount: number
  guardianName: string | null
  guardianPhone: string | null
  ledgerId: string
  ledgerMonth: string
  paidAmountAfterPayment: number
  paymentDate: string
  paymentMethod: string
  receiptNo: string
  studentId: string
  studentName: string
  studentPhone: string | null
}) {
  const admin = await requireAdminContext()
  const user = await getAuthenticatedUser()
  const supabase = await createClient()

  if (!user) {
    return { delivered: 0, failed: 0, skipped: "Not signed in." }
  }

  const settings = await getTenantSmsSettings(admin.tenantId)

  if (!settings.payment_confirmation_enabled) {
    return { delivered: 0, failed: 0, skipped: "Payment SMS disabled." }
  }

  const wallet = await getSmsWallet(admin.tenantId)

  if (!wallet?.sms_enabled) {
    return { delivered: 0, failed: 0, skipped: "SMS wallet disabled." }
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("tenant_id", admin.tenantId)
    .eq("auth_user_id", user.id)
    .eq("role", "admin")
    .eq("status", "active")
    .maybeSingle()

  if (adminError || !adminRow) {
    return {
      delivered: 0,
      failed: 0,
      skipped: adminError?.message ?? "Admin account not verified.",
    }
  }

  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("name, contact_phone")
    .eq("id", admin.tenantId)
    .maybeSingle()
  const template = await paymentConfirmationTemplate({
    settings,
    supabase,
    tenantId: admin.tenantId,
  })

  if (!template) {
    return { delivered: 0, failed: 0, skipped: "Payment SMS template missing." }
  }

  const signedMessageBody = appendSmsSignature(
    template.message_body,
    settings.sms_signature
  )
  assertBanglaSmsText(signedMessageBody, "Payment confirmation SMS template")
  const student: StudentSmsRecipient = {
    guardian_name: guardianName,
    guardian_phone: guardianPhone,
    id: studentId,
    name: studentName,
    phone: studentPhone,
    smsVariables: {
      amount: formatSmsTaka(amount),
      coaching_name: tenantRow?.name ?? admin.tenantName,
      coaching_phone: tenantRow?.contact_phone ?? "",
      due_amount: formatSmsTaka(dueAmountAfterPayment),
      due_date: "",
      expected_amount: formatSmsTaka(expectedAmount),
      month: formatSmsMonth(ledgerMonth),
      paid_amount: formatSmsTaka(paidAmountAfterPayment),
      payment_date: formatSmsDate(paymentDate),
      payment_method: formatSmsPaymentMethod(paymentMethod),
      receipt_link: "",
      receipt_no: formatSmsReceiptNo(receiptNo),
    },
  }
  const recipients = dedupeSmsRecipients(
    studentSmsRecipients({
      coachingName: tenantRow?.name ?? admin.tenantName,
      coachingPhone: tenantRow?.contact_phone ?? "",
      messageBody: signedMessageBody,
      recipientType: settings.payment_confirmation_recipient,
      student,
    })
  )

  if (hasNonBanglaResolvedSmsRecipient(recipients)) {
    return {
      delivered: 0,
      failed: 0,
      skipped: "Resolved payment confirmation SMS contains English text.",
    }
  }

  const validRecipients = recipients.filter(
    (recipient) => recipient.normalizedDestination !== null
  )
  const invalidRecipients = recipients.filter(
    (recipient) => recipient.normalizedDestination === null
  )

  if (validRecipients.length === 0) {
    return { delivered: 0, failed: invalidRecipients.length, skipped: "No valid phone number." }
  }

  const creditsRequired = validRecipients.reduce(
    (total, recipient) => total + smsSegments(recipient.finalMessageBody),
    0
  )

  if (wallet.available_credits < creditsRequired) {
    return { delivered: 0, failed: 0, skipped: "Insufficient SMS credits." }
  }

  const firstValidMessage = validRecipients[0]?.finalMessageBody ?? signedMessageBody
  const { data: communicationMessage, error: messageError } = await supabase
    .from("communication_messages")
    .insert({
      channel: "sms",
      channel_metadata: {
        ledger_id: ledgerId,
        provider: "greenweb",
        receipt_no: receiptNo,
        recipient_type: settings.payment_confirmation_recipient,
      },
      character_count: firstValidMessage.length,
      credits_required: creditsRequired,
      message_body: signedMessageBody,
      message_preview: firstValidMessage.slice(0, 160),
      recipient_count: recipients.length,
      recipient_summary: `${validRecipients.length} valid, ${invalidRecipients.length} invalid`,
      segments_per_recipient: smsSegments(firstValidMessage),
      sent_by: adminRow.id,
      sms_type: smsMessageType(firstValidMessage),
      source: "payment_confirmation",
      status: "draft",
      tenant_id: admin.tenantId,
    })
    .select("id")
    .single()

  if (messageError) {
    return { delivered: 0, failed: 0, skipped: messageError.message }
  }

  const recipientRows = recipients.map((recipient) => {
    const isValid = Boolean(recipient.normalizedDestination)

    return {
      channel: "sms",
      communication_message_id: communicationMessage.id,
      credits_used: 0,
      destination: recipient.destination,
      error_message: isValid ? null : "Invalid Bangladeshi phone number.",
      final_message_body: recipient.finalMessageBody,
      normalized_destination: recipient.normalizedDestination,
      recipient_name: recipient.recipientName,
      recipient_type: recipient.recipientType,
      segments: isValid ? smsSegments(recipient.finalMessageBody) : null,
      sms_type: isValid ? smsMessageType(recipient.finalMessageBody) : null,
      status: isValid ? "queued" : "invalid_number",
      student_id: recipient.studentId,
      tenant_id: admin.tenantId,
    }
  })
  const { data: insertedRecipients, error: recipientsError } = await supabase
    .from("communication_recipients")
    .insert(recipientRows)
    .select("id, normalized_destination, final_message_body, segments")

  if (recipientsError) {
    return { delivered: 0, failed: 0, skipped: recipientsError.message }
  }

  const { error: reserveError } = await supabase.rpc(
    "sms_wallet_reserve_communication_message",
    {
      p_admin_user_id: adminRow.id,
      p_communication_message_id: communicationMessage.id,
      p_credits: creditsRequired,
      p_description: "Payment confirmation SMS credits reserved",
      p_tenant_id: admin.tenantId,
    }
  )

  if (reserveError) {
    return { delivered: 0, failed: 0, skipped: reserveError.message }
  }

  await supabase
    .from("communication_messages")
    .update({ status: "sending" })
    .eq("tenant_id", admin.tenantId)
    .eq("id", communicationMessage.id)

  const validRows = (insertedRecipients ?? []).filter(
    (row) => row.normalized_destination
  )
  const providerMessages = validRows.map((row) => ({
    message: String(row.final_message_body),
    to: String(row.normalized_destination),
  }))
  const sendResults = await createSmsProvider()
    .sendBulkSms(providerMessages)
    .catch((error: unknown) => ({
      raw: {
        error: error instanceof Error ? error.message : "GreenWeb request failed.",
      },
      results: providerMessages.map((message) => ({
        errorMessage:
          error instanceof Error ? error.message : "GreenWeb request failed.",
        providerMessageId: undefined,
        raw: {
          error:
            error instanceof Error ? error.message : "GreenWeb request failed.",
        },
        status: "failed" as const,
        to: message.to,
      })),
    }))
  let delivered = 0
  let failed = invalidRecipients.length
  let creditsUsed = 0
  let creditsRefunded = 0

  for (let index = 0; index < validRows.length; index += 1) {
    const row = validRows[index]
    const result = sendResults.results[index]

    if (!row) {
      continue
    }

    const rowCredits = Number(row.segments ?? 1)

    if (result?.status === "sent") {
      delivered += 1
      creditsUsed += rowCredits
      await supabase
        .from("communication_recipients")
        .update({
          credits_used: rowCredits,
          delivered_at: new Date().toISOString(),
          provider_message_id: result.providerMessageId ?? null,
          provider_response: result.raw ?? {},
          sent_at: new Date().toISOString(),
          status: "delivered",
        })
        .eq("tenant_id", admin.tenantId)
        .eq("id", row.id)
    } else {
      failed += 1
      creditsRefunded += rowCredits
      await supabase
        .from("communication_recipients")
        .update({
          error_message: result?.errorMessage ?? "GreenWeb SMS send failed.",
          provider_message_id: result?.providerMessageId ?? null,
          provider_response: result?.raw ?? {},
          sent_at: new Date().toISOString(),
          status: "failed",
        })
        .eq("tenant_id", admin.tenantId)
        .eq("id", row.id)
    }
  }

  if (creditsUsed > 0) {
    await supabase.rpc("sms_wallet_use_reserved", {
      p_admin_user_id: adminRow.id,
      p_communication_message_id: communicationMessage.id,
      p_credits: creditsUsed,
      p_description: "Payment confirmation SMS credits used",
      p_reference_id: communicationMessage.id,
      p_reference_type: "communication_message",
      p_tenant_id: admin.tenantId,
      p_transaction_type: "automation_used",
    })
  }

  if (creditsRefunded > 0) {
    await supabase.rpc("sms_wallet_refund_reserved", {
      p_admin_user_id: adminRow.id,
      p_communication_message_id: communicationMessage.id,
      p_credits: creditsRefunded,
      p_description: "Failed payment confirmation SMS credits refunded",
      p_reference_id: communicationMessage.id,
      p_reference_type: "communication_message",
      p_tenant_id: admin.tenantId,
      p_transaction_type: "failed_refund",
    })
  }

  await supabase
    .from("communication_messages")
    .update({
      delivered_count: delivered,
      failed_count: failed,
      recipient_count: recipients.length,
      recipient_summary: `${delivered} delivered, ${failed} failed`,
      sent_at: new Date().toISOString(),
      status:
        delivered > 0 && failed > 0
          ? "partial_failed"
          : delivered > 0
            ? "completed"
            : "failed",
    })
    .eq("tenant_id", admin.tenantId)
    .eq("id", communicationMessage.id)

  revalidatePath("/communication/logs")
  revalidatePath("/communication/settings")

  return { delivered, failed, skipped: null }
}

async function buildManualSmsRecipients({
  adminTenantId,
  coachingName,
  coachingPhone,
  formData,
  messageBody,
  recipientMode,
  recipientType,
  supabase,
}: {
  adminTenantId: string
  coachingName: string
  coachingPhone: string
  formData: FormData
  messageBody: string
  recipientMode: string
  recipientType: SmsRecipientType
  supabase: SupabaseClient
}) {
  if (recipientMode === "custom") {
    return customSmsRecipients({
      coachingName,
      coachingPhone,
      messageBody,
      value: text(formData, "custom_numbers"),
    })
  }

  const students = await smsRecipientStudents({
    formData,
    recipientMode,
    supabase,
    tenantId: adminTenantId,
  })
  const studentIds = students.map((student) => student.id)
  const smsVariablesByStudentId = await studentSmsVariablesByStudentId({
    studentIds,
    supabase,
    tenantId: adminTenantId,
  })

  return students.flatMap((student) =>
    studentSmsRecipients({
      coachingName,
      coachingPhone,
      messageBody,
      recipientType,
      student: {
        ...student,
        smsVariables: smsVariablesByStudentId[student.id] ?? {},
      },
    })
  )
}

async function smsRecipientStudents({
  formData,
  recipientMode,
  supabase,
  tenantId,
}: {
  formData: FormData
  recipientMode: string
  supabase: SupabaseClient
  tenantId: string
}) {
  const studentId = text(formData, "student_id")

  if (recipientMode === "individual" && studentId) {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, phone, guardian_name, guardian_phone")
      .eq("tenant_id", tenantId)
      .eq("id", studentId)
      .eq("status", "active")
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? ([data] as StudentSmsRecipient[]) : []
  }

  const selectedStudentIds = formData
    .getAll("student_ids")
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)

  if (recipientMode === "bulk" && selectedStudentIds.length > 0) {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, phone, guardian_name, guardian_phone")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .in("id", selectedStudentIds)
      .limit(1000)

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []) as StudentSmsRecipient[]
  }

  let query = supabase
    .from("students")
    .select("id, name, phone, guardian_name, guardian_phone")
    .eq("tenant_id", tenantId)
    .eq("status", text(formData, "status") === "archived" ? "archived" : "active")
    .limit(1000)

  const classLevel = text(formData, "class_level")
  const medium = text(formData, "medium")
  const groupName = text(formData, "group_name")
  const tag = text(formData, "tag")

  if (classLevel && classLevel !== "all") {
    query = query.eq("class_level", classLevel)
  }

  if (medium && medium !== "all") {
    query = query.eq("medium", medium)
  }

  if (groupName && groupName !== "all") {
    query = query.eq("group_name", groupName)
  }

  if (tag && tag !== "all") {
    query = query.contains("tags", [tag])
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as StudentSmsRecipient[]
}

function customSmsRecipients({
  coachingName,
  coachingPhone,
  messageBody,
  value,
}: {
  coachingName: string
  coachingPhone: string
  messageBody: string
  value: string
}): ManualSmsRecipient[] {
  return value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((destination) => ({
      destination,
      finalMessageBody: renderSmsTemplate(messageBody, {
        coaching_name: coachingName,
        coaching_phone: coachingPhone,
      }),
      normalizedDestination: normalizeBdPhone(destination),
      recipientName: "Custom number",
      recipientType: "custom",
      studentId: null,
    }))
}

function studentSmsRecipients({
  coachingName,
  coachingPhone,
  messageBody,
  recipientType,
  student,
}: {
  coachingName: string
  coachingPhone: string
  messageBody: string
  recipientType: SmsRecipientType
  student: StudentSmsRecipient
}): ManualSmsRecipient[] {
  const values = {
    ...student.smsVariables,
    amount: student.smsVariables?.amount ?? "",
    coaching_name: coachingName,
    coaching_phone: coachingPhone,
    due_amount: student.smsVariables?.due_amount ?? "",
    due_date: student.smsVariables?.due_date ?? "",
    guardian_name: student.guardian_name ?? "",
    month: student.smsVariables?.month ?? "",
    paid_amount: student.smsVariables?.paid_amount ?? "",
    payment_date: student.smsVariables?.payment_date ?? "",
    payment_method: student.smsVariables?.payment_method ?? "",
    receipt_no: student.smsVariables?.receipt_no ?? "",
    receipt_link: "",
    student_name: student.name,
  }
  const finalMessageBody = renderSmsTemplate(messageBody, values)
  const recipients: ManualSmsRecipient[] = []

  if (recipientType === "student" || recipientType === "both") {
    recipients.push({
      destination: student.phone ?? "",
      finalMessageBody,
      normalizedDestination: normalizeBdPhone(student.phone ?? ""),
      recipientName: student.name,
      recipientType: "student",
      studentId: student.id,
    })
  }

  if (recipientType === "guardian" || recipientType === "both") {
    recipients.push({
      destination: student.guardian_phone ?? "",
      finalMessageBody,
      normalizedDestination: normalizeBdPhone(student.guardian_phone ?? ""),
      recipientName: student.guardian_name || `${student.name} guardian`,
      recipientType: "guardian",
      studentId: student.id,
    })
  }

  return recipients
}

function dedupeSmsRecipients(recipients: ManualSmsRecipient[]) {
  const seen = new Set<string>()
  const deduped: ManualSmsRecipient[] = []

  for (const recipient of recipients) {
    const key = recipient.normalizedDestination
      ? `${recipient.normalizedDestination}:${recipient.finalMessageBody}`
      : `invalid:${recipient.destination}:${recipient.finalMessageBody}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    deduped.push(recipient)
  }

  return deduped
}

function assertResolvedSmsRecipientsAreBangla(recipients: ManualSmsRecipient[]) {
  if (hasNonBanglaResolvedSmsRecipient(recipients)) {
    throw new Error(
      "Resolved SMS contains English text. Use Bangla text and Bangla student/coaching data before sending."
    )
  }
}

function hasNonBanglaResolvedSmsRecipient(recipients: ManualSmsRecipient[]) {
  return recipients.some((recipient) =>
    hasLatinLettersOutsideTemplateTokens(recipient.finalMessageBody)
  )
}

function renderSmsTemplate(messageBody: string, values: Record<string, string>) {
  return messageBody.replace(/\{\{([a-z_]+)\}\}/g, (match, variableName) => {
    if (values[variableName] !== undefined) {
      return values[variableName]
    }

    return manualSmsTemplateVariables.has(variableName) ? "" : match
  })
}

async function studentSmsVariablesByStudentId({
  studentIds,
  supabase,
  tenantId,
}: {
  studentIds: string[]
  supabase: SupabaseClient
  tenantId: string
}) {
  const uniqueStudentIds = Array.from(new Set(studentIds)).filter(Boolean)

  if (uniqueStudentIds.length === 0) {
    return {}
  }

  const { data, error } = await supabase
    .from("student_monthly_ledgers")
    .select(
      "student_id, ledger_month, expected_amount, paid_amount, due_amount, payment_start_date, grace_end_date"
    )
    .eq("tenant_id", tenantId)
    .in("student_id", uniqueStudentIds)
    .neq("status", "waived")
    .order("due_amount", { ascending: false })
    .order("ledger_month", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const variablesByStudentId: Record<string, Record<string, string>> = {}

  for (const row of (data ?? []) as StudentSmsLedgerVariableRow[]) {
    if (variablesByStudentId[row.student_id]) {
      continue
    }

    variablesByStudentId[row.student_id] = {
      amount: formatSmsTaka(row.due_amount || row.expected_amount),
      due_amount: formatSmsTaka(row.due_amount),
      due_date: formatSmsDate(row.grace_end_date || row.payment_start_date),
      month: formatSmsMonth(row.ledger_month),
      paid_amount: formatSmsTaka(row.paid_amount),
      payment_date: "",
    }
  }

  return variablesByStudentId
}

async function paymentConfirmationTemplate({
  settings,
  supabase,
  tenantId,
}: {
  settings: Awaited<ReturnType<typeof getTenantSmsSettings>>
  supabase: SupabaseClient
  tenantId: string
}) {
  if (settings.payment_confirmation_template_id) {
    const { data, error } = await supabase
      .from("sms_templates")
      .select("id, tenant_id, name, category, message_body, is_active, is_default")
      .eq("tenant_id", tenantId)
      .eq("id", settings.payment_confirmation_template_id)
      .eq("is_active", true)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (data) {
      return data as SmsTemplateRecord
    }
  }

  const { data, error } = await supabase
    .from("sms_templates")
    .select("id, tenant_id, name, category, message_body, is_active, is_default")
    .eq("tenant_id", tenantId)
    .eq("category", "payment_confirmation")
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data ? (data as SmsTemplateRecord) : null
}

function formatSmsTaka(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)
  return `৳${(Number.isFinite(amount) ? amount : 0).toLocaleString("bn-BD")}`
}

function formatSmsDate(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("bn-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatSmsMonth(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 7)
  }

  return date.toLocaleDateString("bn-BD", {
    month: "long",
    year: "numeric",
  })
}

function formatSmsPaymentMethod(value: string) {
  const methods: Record<string, string> = {
    bank: "ব্যাংক",
    bkash: "বিকাশ",
    card: "কার্ড",
    cash: "নগদ",
    nagad: "নগদ",
    other: "অন্যান্য",
  }

  return methods[value] ?? ""
}

function formatSmsReceiptNo(value: string) {
  return value
    .replace(/^RCPT/i, "রসিদ")
    .replace(/[0-9]/g, (digit) =>
      Number(digit).toLocaleString("bn-BD", { useGrouping: false })
    )
}

function appendSmsSignature(messageBody: string, signature: string | null) {
  const normalizedMessage = messageBody.trimEnd()
  const normalizedSignature = signature?.trim()

  if (!normalizedSignature) {
    return normalizedMessage
  }

  return `${normalizedMessage}\n${normalizedSignature}`
}

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
        ? banglaOptionalText(formData, "sms_signature", "SMS signature")
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

export async function createSmsTemplate(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const name = text(formData, "name")
  const category = smsTemplateCategory(formData)
  const messageBody = text(formData, "message_body")

  if (!name) {
    throw new Error("Template name is required.")
  }

  if (!messageBody) {
    throw new Error("Template message is required.")
  }

  assertBanglaSmsText(messageBody, "Template message")

  const { error } = await supabase.from("sms_templates").insert({
    category,
    channel: "sms",
    is_active: true,
    message_body: messageBody,
    name,
    tenant_id: admin.tenantId,
    variables: templateVariables(messageBody),
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/communication/templates")
  revalidatePath("/communication/settings")
  revalidatePath("/communication/sms")
  redirectWithFlashToast("/communication/templates", {
    title: "Template created",
    message: "The SMS template is ready to use.",
    tone: "success",
  })
}

export async function updateSmsTemplate(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const templateId = text(formData, "template_id")
  const name = text(formData, "name")
  const category = smsTemplateCategory(formData)
  const messageBody = text(formData, "message_body")

  if (!templateId) {
    throw new Error("Template id is required.")
  }

  if (!name) {
    throw new Error("Template name is required.")
  }

  if (!messageBody) {
    throw new Error("Template message is required.")
  }

  assertBanglaSmsText(messageBody, "Template message")

  const { data: currentTemplate, error: currentTemplateError } = await supabase
    .from("sms_templates")
    .select("id, name, category, is_active, is_default")
    .eq("tenant_id", admin.tenantId)
    .eq("id", templateId)
    .maybeSingle()

  if (currentTemplateError) {
    throw new Error(currentTemplateError.message)
  }

  if (!currentTemplate) {
    throw new Error("Template not found.")
  }

  const isProtectedTemplate =
    currentTemplate.is_default ||
    protectedSmsTemplateKeys.has(
      `${currentTemplate.category}:${currentTemplate.name}`
    )

  const updatePayload = isProtectedTemplate
    ? {
        message_body: messageBody,
        variables: templateVariables(messageBody),
      }
    : {
        category,
        is_active: formData.get("is_active") !== "false",
        message_body: messageBody,
        name,
        variables: templateVariables(messageBody),
      }

  const { error } = await supabase
    .from("sms_templates")
    .update(updatePayload)
    .eq("tenant_id", admin.tenantId)
    .eq("id", templateId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/communication/templates")
  revalidatePath("/communication/settings")
  revalidatePath("/communication/sms")
  redirectWithFlashToast("/communication/templates", {
    title: "Template saved",
    message: "The SMS template has been updated.",
    tone: "success",
  })
}

export async function deleteSmsTemplate(formData: FormData) {
  const admin = await requireAdminContext()
  const supabase = await createClient()
  const templateId = text(formData, "template_id")

  if (!templateId) {
    throw new Error("Template id is required.")
  }

  const { data: template, error: templateError } = await supabase
    .from("sms_templates")
    .select("id, name, category, is_default")
    .eq("tenant_id", admin.tenantId)
    .eq("id", templateId)
    .maybeSingle()

  if (templateError) {
    throw new Error(templateError.message)
  }

  if (!template) {
    throw new Error("Template not found.")
  }

  if (
    template.is_default ||
    protectedSmsTemplateKeys.has(`${template.category}:${template.name}`)
  ) {
    throw new Error("Fixed SMS templates cannot be deleted.")
  }

  const { error } = await supabase
    .from("sms_templates")
    .delete()
    .eq("tenant_id", admin.tenantId)
    .eq("id", templateId)
    .eq("is_default", false)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/communication/templates")
  revalidatePath("/communication/settings")
  revalidatePath("/communication/sms")
  redirectWithFlashToast("/communication/templates", {
    title: "Template deleted",
    message: "The custom SMS template has been removed.",
    tone: "success",
  })
}

function text(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

function banglaOptionalText(
  formData: FormData,
  name: string,
  fieldLabel: string
) {
  const value = text(formData, name)

  if (!value) {
    return null
  }

  assertBanglaSmsText(value, fieldLabel)

  return value
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

function smsTemplateCategory(formData: FormData) {
  const value = text(formData, "category")
  const categories = new Set([
    "payment_confirmation",
    "payment_reminder",
    "grace_period",
    "overdue_warning",
    "exam_notice",
    "holiday_notice",
    "general_notice",
  ])

  return categories.has(value) ? value : "general_notice"
}

function templateVariables(messageBody: string) {
  return Array.from(
    new Set(
      Array.from(messageBody.matchAll(/\{\{([a-z_]+)\}\}/g)).map(
        (match) => match[1]
      )
    )
  )
}
