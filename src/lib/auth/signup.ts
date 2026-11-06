"use server"

import { redirect } from "next/navigation"

import { hasSupabaseEnv } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import {
  formatZodErrors,
  signupSchema,
  tenantOnboardingSchema,
  type FormState,
} from "@/lib/schemas"

export type SignupState = FormState & {
  step?: number
  values?: Record<string, string>
}

/**
 * Shown when the centre could not be provisioned. The real cause is logged on
 * the server rather than shown, since it can name database internals.
 */
const PROVISION_FAILED_MESSAGE =
  "Your account is ready, but we could not create your centre. Please try again."

/**
 * Which wizard step owns each field. Used to send the user back to the step
 * that failed validation instead of always jumping to the first one.
 */
const STEP_FIELDS: Record<string, string[]> = {
  step1: ["admin_name", "admin_phone", "email", "password", "confirm_password"],
  step2: ["center_name", "address", "contact_phone"],
  step3: ["plan_code"],
}

function stepForErrors(errors: Record<string, string | string[]>) {
  for (const [stepKey, fields] of Object.entries(STEP_FIELDS)) {
    if (fields.some((field) => errors[field])) {
      return Number(stepKey.replace("step", ""))
    }
  }

  return 1
}

/**
 * Maps a Supabase auth error to a message that is safe to show a visitor.
 *
 * Supabase error strings leak internals ("email rate limit exceeded",
 * "Database error saving new user"). Visitors get an actionable sentence
 * instead, and the raw error goes to the server log.
 */
function signupErrorMessage(error: { message: string; code?: string }) {
  const code = error.code ?? ""
  const message = error.message.toLowerCase()

  console.error("[signup] supabase auth error", error.code, error.message)

  if (code === "over_email_send_rate_limit" || message.includes("rate limit")) {
    return "Too many sign-up attempts just now. Please wait a few minutes and try again."
  }

  if (
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered")
  ) {
    return "An account already exists for this email. Try signing in instead."
  }

  if (message.includes("password")) {
    return "That password is not acceptable. Use at least 8 characters."
  }

  if (message.includes("email") && message.includes("invalid")) {
    return "Enter a valid email address."
  }

  return "We could not create your account. Please try again in a moment."
}

/**
 * Creates the Supabase auth account, then provisions the coaching centre.
 *
 * The account is created first and the centre second. If provisioning fails
 * the account still exists, and the user lands on /onboarding where they can
 * retry -- `provision_tenant` is idempotent, so a retry is safe.
 */
export async function signUp(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  if (!hasSupabaseEnv) {
    return { message: "Supabase environment variables are not configured yet." }
  }

  const result = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    const errors = formatZodErrors(result.error)

    return { errors, step: stepForErrors(errors) }
  }

  const data = result.data
  const supabase = await createClient()

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.admin_name,
      },
    },
  })

  if (signUpError) {
    return {
      message: signupErrorMessage(signUpError),
      step: 1,
      values: { email: data.email, admin_name: data.admin_name },
    }
  }

  // The centre is only created once the address is confirmed. Check the
  // confirmation flag rather than the session: with "Confirm email" enabled
  // Supabase establishes the session and returns tokens, but the address is
  // still unverified, so provisioning now would attach the centre to an
  // address nobody has proven they own.
  const isConfirmed = Boolean(signUpData.user?.email_confirmed_at)

  if (!isConfirmed) {
    redirect("/signup?awaitingConfirmation=1&email=" + encodeURIComponent(data.email))
  }

  const userId = signUpData.user?.id

  if (!userId) {
    return { message: "Could not create your account. Please try again.", step: 1 }
  }

  const { error: provisionError } = await supabase.rpc("provision_tenant", {
    p_address: data.address,
    p_admin_name: data.admin_name,
    p_admin_phone: data.admin_phone || null,
    p_auth_user_id: userId,
    p_center_name: data.center_name,
    p_contact_phone: data.contact_phone,
    p_plan_code: data.plan_code,
  })

  if (provisionError) {
    // The account exists but the centre does not. Send the user to onboarding
    // so they can complete the step rather than hitting a dead end.
    console.error("[signup] provision_tenant failed", provisionError.message)
    redirect("/onboarding?error=" + encodeURIComponent(PROVISION_FAILED_MESSAGE))
  }

  redirect("/dashboard")
}

/**
 * Provisions a coaching centre for an account that already exists.
 *
 * Used by /onboarding, which is reachable when a user is signed in but not
 * yet linked to a tenant.
 */
export async function provisionCoachingCenter(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  if (!hasSupabaseEnv) {
    return { message: "Supabase environment variables are not configured yet." }
  }

  const result = tenantOnboardingSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!result.success) {
    return { errors: formatZodErrors(result.error), step: 1 }
  }

  const data = result.data
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const { error: provisionError } = await supabase.rpc("provision_tenant", {
    p_address: data.address,
    p_admin_name: data.admin_name,
    p_admin_phone: data.admin_phone || null,
    p_auth_user_id: user.id,
    p_center_name: data.center_name,
    p_contact_phone: data.contact_phone,
    p_plan_code: data.plan_code,
  })

  if (provisionError) {
    console.error("[onboarding] provision_tenant failed", provisionError.message)
    return { message: PROVISION_FAILED_MESSAGE, step: 1 }
  }

  redirect("/dashboard")
}
