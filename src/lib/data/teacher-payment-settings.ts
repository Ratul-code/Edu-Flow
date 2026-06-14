import { addMonths, monthStart } from "@/lib/data/fees"
import { createClient } from "@/lib/supabase/server"

export type TeacherPaymentSystem = "prepaid" | "postpaid"

export type TeacherPaymentSettingsRecord = {
  id?: string
  tenant_id?: string
  payment_system: TeacherPaymentSystem
  payment_start_day: number
  grace_period_days: number
  created_at?: string
  updated_at?: string
}

export const defaultTeacherPaymentSettings: TeacherPaymentSettingsRecord = {
  grace_period_days: 7,
  payment_start_day: 1,
  payment_system: "prepaid",
}

export async function getTeacherPaymentSettings(
  tenantId: string
): Promise<TeacherPaymentSettingsRecord> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teacher_payment_settings")
    .select("id, tenant_id, payment_system, payment_start_day, grace_period_days, created_at, updated_at")
    .eq("tenant_id", tenantId)
    .maybeSingle()

  if (error || !data) {
    return defaultTeacherPaymentSettings
  }

  return {
    ...(data as TeacherPaymentSettingsRecord),
    grace_period_days: numberOrDefault(
      (data as TeacherPaymentSettingsRecord).grace_period_days,
      defaultTeacherPaymentSettings.grace_period_days
    ),
    payment_start_day: numberOrDefault(
      (data as TeacherPaymentSettingsRecord).payment_start_day,
      defaultTeacherPaymentSettings.payment_start_day
    ),
    payment_system:
      (data as TeacherPaymentSettingsRecord).payment_system === "postpaid"
        ? "postpaid"
        : "prepaid",
  }
}

export function teacherSalaryPaymentStartDate(
  ledgerMonth: string,
  settings: TeacherPaymentSettingsRecord
) {
  const normalizedMonth = monthStart(ledgerMonth)
  const collectionMonth =
    settings.payment_system === "postpaid"
      ? addMonths(normalizedMonth, 1)
      : normalizedMonth
  const paymentStartDay = clamp(
    Math.trunc(settings.payment_start_day),
    1,
    15
  )

  return `${collectionMonth.slice(0, 8)}${String(
    Math.min(paymentStartDay, daysInMonth(collectionMonth))
  ).padStart(2, "0")}`
}

export function teacherSalaryGraceEndDate(
  paymentStartDate: string,
  settings: TeacherPaymentSettingsRecord
) {
  return addDays(
    paymentStartDate,
    clamp(Math.trunc(settings.grace_period_days), 0, 15)
  )
}

function numberOrDefault(value: number | string | null | undefined, fallback: number) {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function daysInMonth(value: string) {
  const [year, month] = value.split("-").map(Number)

  return new Date(year, month, 0).getDate()
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)

  return date.toISOString().slice(0, 10)
}
