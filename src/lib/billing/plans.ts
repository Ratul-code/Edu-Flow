import "server-only"

import { createClient } from "@/lib/supabase/server"
import {
  normalizePlan,
  type PlanDefinition,
  type SubscriptionPaymentRequest,
  type TenantSubscription,
} from "@/lib/billing/types"

export type {
  PlanDefinition,
  SubscriptionPaymentRequest,
  TenantSubscription,
} from "@/lib/billing/types"

/**
 * The global plan catalog. Readable by any authenticated user so the pricing
 * screen can render before a tenant exists.
 */
export async function getPlanCatalog(): Promise<PlanDefinition[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("plan_definitions")
    .select(
      "code, name, description, price, billing_period, currency, limits, features, is_default, sort_order"
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => normalizePlan(row))
}

export async function getTenantSubscription(
  tenantId: string
): Promise<TenantSubscription | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tenant_subscriptions")
    .select(
      `
        id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        plan:plan_definitions (
          code,
          name,
          description,
          price,
          billing_period,
          currency,
          limits,
          features,
          is_default,
          sort_order
        )
      `
    )
    .eq("tenant_id", tenantId)
    .in("status", ["trialing", "pending_payment", "active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  const plan = Array.isArray(data.plan) ? data.plan[0] : data.plan

  if (!plan) {
    return null
  }

  return {
    id: data.id,
    status: data.status,
    current_period_start: data.current_period_start,
    current_period_end: data.current_period_end,
    cancel_at_period_end: data.cancel_at_period_end,
    plan: normalizePlan(plan),
  }
}

export async function getSubscriptionPaymentRequests(
  tenantId: string
): Promise<SubscriptionPaymentRequest[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("subscription_payment_requests")
    .select(
      `
        id,
        amount,
        currency,
        payment_method,
        transaction_id,
        payment_note,
        status,
        created_at,
        plan:plan_definitions (name)
      `
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => {
    const plan = Array.isArray(row.plan) ? row.plan[0] : row.plan

    return {
      id: row.id,
      amount: Number(row.amount),
      currency: row.currency,
      payment_method: row.payment_method,
      transaction_id: row.transaction_id,
      payment_note: row.payment_note,
      status: row.status,
      created_at: row.created_at,
      plan_name: plan?.name ?? "Plan",
    }
  })
}
