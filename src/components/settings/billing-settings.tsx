"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"

import { AlertCircleIcon } from "lucide-react"

import { FormFieldError } from "@/components/auth/field-error"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { changePlan } from "@/lib/actions/billing"
import {
  formatDate,
  formatLimitValue,
  formatPlanPrice,
  PAYMENT_METHOD_LABELS,
  PLAN_LIMIT_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  type PlanDefinition,
  type SubscriptionPaymentRequest,
  type TenantSubscription,
} from "@/lib/billing/types"
import { cn } from "@/lib/utils"

export function BillingSettings({
  subscription,
  plans,
  paymentRequests,
}: {
  subscription: TenantSubscription | null
  plans: PlanDefinition[]
  paymentRequests: SubscriptionPaymentRequest[]
}) {
  const [state, formAction] = useActionState(changePlan, {})
  const [selectedPlan, setSelectedPlan] = useState(
    subscription?.plan.code ?? "free"
  )

  const currentPlan = subscription?.plan
  const selected = plans.find((plan) => plan.code === selectedPlan)
  const requiresPayment = (selected?.price ?? 0) > 0
  const pendingRequest = paymentRequests.find(
    (request) => request.status === "pending"
  )

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">Current plan</CardTitle>
          <CardDescription className="text-xs">
            The plan this centre is subscribed to.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentPlan ? (
            <>
              <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                <div>
                  <div className="text-sm font-medium">{currentPlan.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatPlanPrice(currentPlan)}
                    {currentPlan.price > 0
                      ? ` per ${currentPlan.billing_period === "yearly" ? "year" : "month"}`
                      : ""}
                  </div>
                </div>
                <SubscriptionBadge status={subscription?.status ?? "trial"} />
              </div>

              {subscription?.current_period_end ? (
                <Detail
                  label="Renews on"
                  value={formatDate(subscription.current_period_end)}
                />
              ) : null}

              <div className="grid gap-2">
                {Object.entries(currentPlan.limits).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground">
                      {PLAN_LIMIT_LABELS[key] ?? key}
                    </span>
                    <span className="text-sm font-medium">
                      {formatLimitValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active subscription. Pick a plan below to get started.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">Change plan</CardTitle>
          <CardDescription className="text-xs">
            Paid plans activate after the payment request is approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequest ? (
            <Alert className="mb-4">
              <AlertCircleIcon />
              <AlertTitle>Payment awaiting approval</AlertTitle>
              <AlertDescription>
                A {formatPlanPrice({
                  price: pendingRequest.amount,
                  currency: pendingRequest.currency,
                })}{" "}
                payment request is pending. We will activate the plan once it is
                approved.
              </AlertDescription>
            </Alert>
          ) : null}

          <form action={formAction}>
            <FieldGroup>
              {state.message ? (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Could not update the plan</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              ) : null}

              <Field>
                <FieldLabel>Plan</FieldLabel>
                <div className="grid gap-2">
                  {plans.map((plan) => (
                    <PlanOption
                      key={plan.code}
                      plan={plan}
                      isSelected={plan.code === selectedPlan}
                      isCurrent={plan.code === currentPlan?.code}
                      onSelect={() => setSelectedPlan(plan.code)}
                    />
                  ))}
                </div>
                <FormFieldError error={state.errors?.plan_code} />
              </Field>

              {requiresPayment ? (
                <>
                  <Field>
                    <FieldLabel htmlFor="payment_method">Payment method</FieldLabel>
                    <Select name="payment_method" defaultValue="bkash">
                      <SelectTrigger id="payment_method">
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PAYMENT_METHOD_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormFieldError error={state.errors?.payment_method} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="transaction_id">
                      Transaction ID
                    </FieldLabel>
                    <Input
                      id="transaction_id"
                      name="transaction_id"
                      placeholder="e.g. 9F7K2LM4XZ"
                    />
                    <FormFieldError error={state.errors?.transaction_id} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="payment_note">Note (optional)</FieldLabel>
                    <Textarea
                      id="payment_note"
                      name="payment_note"
                      placeholder="Add any details that help us verify the payment."
                      rows={3}
                    />
                    <FormFieldError error={state.errors?.payment_note} />
                  </Field>
                </>
              ) : null}

              <SubmitButton
                disabled={
                  !selectedPlan ||
                  selectedPlan === currentPlan?.code ||
                  !!pendingRequest
                }
              />
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {paymentRequests.length > 0 ? (
        <Card className="lg:col-span-2">
          <CardHeader className="gap-1">
            <CardTitle className="text-sm">Payment history</CardTitle>
            <CardDescription className="text-xs">
              Requests submitted for this centre.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {paymentRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">
                    {request.plan_name} —{" "}
                    {formatPlanPrice({
                      price: request.amount,
                      currency: request.currency,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {PAYMENT_METHOD_LABELS[request.payment_method] ??
                      request.payment_method}
                    {request.transaction_id
                      ? ` · ${request.transaction_id}`
                      : ""}{" "}
                    · {formatDate(request.created_at)}
                  </div>
                </div>
                <Badge
                  variant={
                    request.status === "approved"
                      ? "default"
                      : request.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {request.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function PlanOption({
  plan,
  isSelected,
  isCurrent,
  onSelect,
}: {
  plan: PlanDefinition
  isSelected: boolean
  isCurrent: boolean
  onSelect: () => void
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 transition-colors",
        isSelected ? "border-primary bg-primary/5" : "hover:bg-accent/40"
      )}
    >
      <div className="flex items-center gap-2">
        <input
          type="radio"
          name="plan_code"
          value={plan.code}
          checked={isSelected}
          onChange={onSelect}
          className="sr-only"
        />
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium">
            {plan.name}
            {isCurrent ? (
              <Badge variant="outline" className="text-[10px]">
                Current
              </Badge>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatPlanPrice(plan)}
            {plan.price > 0
              ? ` per ${plan.billing_period === "yearly" ? "year" : "month"}`
              : ""}
          </div>
        </div>
      </div>
    </label>
  )
}

function SubscriptionBadge({ status }: { status: string }) {
  const label = SUBSCRIPTION_STATUS_LABELS[status] ?? status

  return (
    <Badge
      variant={
        status === "active"
          ? "default"
          : status === "past_due"
            ? "destructive"
            : "secondary"
      }
    >
      {label}
    </Badge>
  )
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Saving..." : "Update plan"}
    </Button>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border px-3 py-2">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  )
}
