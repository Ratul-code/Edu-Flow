import { createClient } from "@/lib/supabase/server"

export type CommunicationChannel = "sms" | "whatsapp" | "email" | "push" | "in_app"
export type CommunicationSource =
  | "manual"
  | "bulk"
  | "payment_confirmation"
  | "payment_reminder"
  | "grace_period"
  | "overdue_warning"
  | "system"
export type CommunicationStatus =
  | "queued"
  | "sending"
  | "completed"
  | "partial_failed"
  | "failed"
  | "cancelled"
  | "draft"

export type CommunicationMessageRecord = {
  id: string
  tenant_id: string
  sent_by: string | null
  channel: CommunicationChannel
  source: CommunicationSource
  message_body: string
  message_preview: string | null
  subject: string | null
  sms_type: "gsm" | "unicode" | null
  character_count: number | null
  segments_per_recipient: number | null
  recipient_count: number
  delivered_count: number
  failed_count: number
  credits_required: number
  credits_used: number
  credits_refunded: number
  status: CommunicationStatus
  recipient_summary: string | null
  channel_metadata: Record<string, unknown>
  created_at: string
  sent_at: string | null
  updated_at: string
  sent_by_name: string | null
}

export type CommunicationRecipientRecord = {
  id: string
  tenant_id: string
  communication_message_id: string
  student_id: string | null
  recipient_type: string
  recipient_name: string
  destination: string
  normalized_destination: string | null
  channel: CommunicationChannel
  final_message_body: string
  subject: string | null
  sms_type: "gsm" | "unicode" | null
  segments: number | null
  credits_used: number
  status: string
  provider_message_id: string | null
  provider_response: Record<string, unknown>
  error_message: string | null
  sent_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  student_name: string | null
}

export type CommunicationMessageFilters = {
  channel?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  sentBy?: string
  source?: string
  status?: string
}

export type CommunicationSenderRecord = {
  id: string
  name: string
}

const messageSelect = `
  id,
  tenant_id,
  sent_by,
  channel,
  source,
  message_body,
  message_preview,
  subject,
  sms_type,
  character_count,
  segments_per_recipient,
  recipient_count,
  delivered_count,
  failed_count,
  credits_required,
  credits_used,
  credits_refunded,
  status,
  recipient_summary,
  channel_metadata,
  created_at,
  sent_at,
  updated_at
`

const recipientSelect = `
  id,
  tenant_id,
  communication_message_id,
  student_id,
  recipient_type,
  recipient_name,
  destination,
  normalized_destination,
  channel,
  final_message_body,
  subject,
  sms_type,
  segments,
  credits_used,
  status,
  provider_message_id,
  provider_response,
  error_message,
  sent_at,
  delivered_at,
  created_at,
  updated_at
`

export async function listCommunicationMessages(
  tenantId: string,
  filters: CommunicationMessageFilters = {}
) {
  const supabase = await createClient()
  let query = supabase
    .from("communication_messages")
    .select(messageSelect)
    .eq("tenant_id", tenantId)
    .order("sent_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100)

  if (filters.channel && filters.channel !== "all") {
    query = query.eq("channel", filters.channel)
  }

  if (filters.source && filters.source !== "all") {
    query = query.eq("source", filters.source)
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }

  if (filters.sentBy && filters.sentBy !== "all") {
    query =
      filters.sentBy === "system"
        ? query.is("sent_by", null)
        : query.eq("sent_by", filters.sentBy)
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", `${filters.dateFrom}T00:00:00`)
  }

  if (filters.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59`)
  }

  const search = sanitizeSearchTerm(filters.search)

  if (search) {
    query = query.or(
      `message_body.ilike.%${search}%,message_preview.ilike.%${search}%,subject.ilike.%${search}%`
    )
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return attachSenderNames(tenantId, data as CommunicationMessageRecord[])
}

export async function getCommunicationMessageDetails(
  tenantId: string,
  messageId: string
) {
  const supabase = await createClient()
  const { data: message, error: messageError } = await supabase
    .from("communication_messages")
    .select(messageSelect)
    .eq("tenant_id", tenantId)
    .eq("id", messageId)
    .maybeSingle()

  if (messageError || !message) {
    return null
  }

  const [messageWithSender] = await attachSenderNames(tenantId, [
    message as CommunicationMessageRecord,
  ])
  const { data: recipients, error: recipientsError } = await supabase
    .from("communication_recipients")
    .select(recipientSelect)
    .eq("tenant_id", tenantId)
    .eq("communication_message_id", messageId)
    .order("created_at", { ascending: true })

  const recipientRows =
    recipientsError || !recipients
      ? []
      : await attachStudentNames(
          tenantId,
          recipients as CommunicationRecipientRecord[]
        )

  return {
    message: messageWithSender,
    recipients: recipientRows,
  }
}

export async function listCommunicationSenders(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .order("name", { ascending: true })

  if (error || !data) {
    return []
  }

  return data as CommunicationSenderRecord[]
}

async function attachSenderNames(
  tenantId: string,
  messages: CommunicationMessageRecord[]
) {
  const senderIds = Array.from(
    new Set(messages.map((message) => message.sent_by).filter(Boolean))
  ) as string[]

  if (senderIds.length === 0) {
    return messages.map((message) => ({ ...message, sent_by_name: null }))
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("admin_users")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .in("id", senderIds)

  const namesById = new Map(
    (data ?? []).map((sender) => [sender.id as string, sender.name as string])
  )

  return messages.map((message) => ({
    ...message,
    sent_by_name: message.sent_by ? namesById.get(message.sent_by) ?? null : null,
  }))
}

async function attachStudentNames(
  tenantId: string,
  recipients: CommunicationRecipientRecord[]
) {
  const studentIds = Array.from(
    new Set(recipients.map((recipient) => recipient.student_id).filter(Boolean))
  ) as string[]

  if (studentIds.length === 0) {
    return recipients.map((recipient) => ({ ...recipient, student_name: null }))
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("students")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .in("id", studentIds)

  const namesById = new Map(
    (data ?? []).map((student) => [student.id as string, student.name as string])
  )

  return recipients.map((recipient) => ({
    ...recipient,
    student_name: recipient.student_id
      ? namesById.get(recipient.student_id) ?? null
      : null,
  }))
}

function sanitizeSearchTerm(value: string | undefined) {
  return value?.trim().replaceAll("%", "").replaceAll(",", "") ?? ""
}
