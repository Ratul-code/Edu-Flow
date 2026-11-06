"use server"

import { revalidatePath } from "next/cache"

import { requireAdminContext } from "@/lib/auth/user"
import { redirectWithFlashToast } from "@/lib/flash-toast"
import {
  formatZodErrors,
  planChangeSchema,
  type FormState,
} from "@/lib/schemas"
import { createClient } from "@/lib/supabase/server"

export async function changePlan(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireAdminContext()
  const result = planChangeSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!result.success) {
    return { errors: formatZodErrors(result.error) }
  }

  const data = result.data
  const supabase = await createClient()

  const { error } = await supabase.rpc("change_tenant_plan", {
    p_payment_method: data.payment_method,
    p_payment_note: data.payment_note || null,
    p_plan_code: data.plan_code,
    p_tenant_id: admin.tenantId,
    p_transaction_id: data.transaction_id || null,
  })

  if (error) {
    return { message: error.message }
  }

  revalidatePath("/settings")
  revalidatePath("/dashboard")

  const isFree = data.plan_code === "free"

  redirectWithFlashToast("/settings", {
    title: isFree ? "Plan updated" : "Payment submitted",
    message: isFree
      ? "Your centre is now on the Free plan."
      : "We received your payment request. The plan activates once it is approved.",
    tone: "success",
  })
}
