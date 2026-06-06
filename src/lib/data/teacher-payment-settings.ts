import { addMonths, monthStart } from "@/lib/data/fees"
import { createClient } from "@/lib/supabase/server"

export type TeacherPaymentSystem = "prepaid" | "postpaid"

export type TeacherPaymentSettingsRecord = {
  id?: string
  tenant_id?: string
  payment_system: TeacherPaymentSystem
  created_at?: string
  updated_at?: string
}

export const defaultTeacherPaymentSettings: TeacherPaymentSettingsRecord = {
  payment_system: "prepaid",
}

export async function getTeacherPaymentSettings(tenantId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teacher_payment_settings")
    .select("id, tenant_id, payment_system, created_at, updated_at")
    .eq("tenant_id", tenantId)
    .maybeSingle()

  if (error || !data) {
    return defaultTeacherPaymentSettings
  }

  return data as TeacherPaymentSettingsRecord
}

export function teacherSalaryPaymentStartDate(
  ledgerMonth: string,
  settings: TeacherPaymentSettingsRecord
) {
  const normalizedMonth = monthStart(ledgerMonth)

  return settings.payment_system === "postpaid"
    ? addMonths(normalizedMonth, 1)
    : normalizedMonth
}
