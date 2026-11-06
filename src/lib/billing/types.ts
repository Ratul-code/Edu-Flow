export type PlanDefinition = {
  code: string
  name: string
  description: string | null
  price: number
  billing_period: string
  currency: string
  limits: Record<string, number>
  features: string[]
  is_default: boolean
  sort_order: number
}

export type TenantSubscription = {
  id: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  plan: PlanDefinition
}

export type SubscriptionPaymentRequest = {
  id: string
  amount: number
  currency: string
  payment_method: string
  transaction_id: string | null
  payment_note: string | null
  status: string
  created_at: string
  plan_name: string
}

export const PLAN_LIMIT_LABELS: Record<string, string> = {
  admin_user_limit: "Admin seats",
  batch_limit: "Batches",
  sms_credit_limit: "SMS credits",
  student_limit: "Students",
  teacher_limit: "Teachers",
}

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  cancelled: "Cancelled",
  expired: "Expired",
  past_due: "Past due",
  pending_payment: "Payment pending",
  trialing: "Trial",
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank: "Bank transfer",
  bkash: "bKash",
  cash: "Cash",
  nagad: "Nagad",
  other: "Other",
}

export function formatPlanPrice(plan: Pick<PlanDefinition, "price" | "currency">) {
  if (plan.price === 0) {
    return "Free"
  }

  return `${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(plan.price)} ${plan.currency}`
}

export function formatLimitValue(value: number) {
  if (value < 0) {
    return "Unlimited"
  }

  return new Intl.NumberFormat("en-BD").format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export function normalizePlan(raw: {
  code: string
  name: string
  description: string | null
  price: number | string
  billing_period: string
  currency: string
  limits: unknown
  features: unknown
  is_default: boolean
  sort_order: number
}): PlanDefinition {
  return {
    code: raw.code,
    name: raw.name,
    description: raw.description,
    price: Number(raw.price),
    billing_period: raw.billing_period,
    currency: raw.currency,
    limits: normalizeLimits(raw.limits),
    features: Array.isArray(raw.features)
      ? raw.features.filter((feature): feature is string => typeof feature === "string")
      : [],
    is_default: raw.is_default,
    sort_order: raw.sort_order,
  }
}

function normalizeLimits(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {}
  }

  const limits: Record<string, number> = {}

  for (const [key, value] of Object.entries(raw)) {
    const numeric = Number(value)

    if (Number.isFinite(numeric)) {
      limits[key] = numeric
    }
  }

  return limits
}
