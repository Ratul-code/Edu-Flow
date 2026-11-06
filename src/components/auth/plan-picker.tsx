"use client"

import { CheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  formatLimitValue,
  formatPlanPrice,
  PLAN_LIMIT_LABELS,
  type PlanDefinition,
} from "@/lib/billing/types"

export function PlanPicker({
  plans,
  selectedCode,
  name = "plan_code",
}: {
  plans: PlanDefinition[]
  selectedCode?: string
  name?: string
}) {
  return (
    <div className="grid gap-3">
      {plans.map((plan) => {
        const isSelected = plan.code === selectedCode

        return (
          <label
            key={plan.code}
            className={cn(
              "relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-colors",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:bg-accent/40"
            )}
          >
            <input
              type="radio"
              name={name}
              value={plan.code}
              defaultChecked={isSelected}
              className="sr-only"
            />

            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{plan.name}</span>
                  {plan.is_default ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Default
                    </Badge>
                  ) : null}
                </div>
                {plan.description ? (
                  <p className="text-xs text-muted-foreground">
                    {plan.description}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className="text-sm font-semibold">
                  {formatPlanPrice(plan)}
                </span>
                {plan.price > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    per {plan.billing_period === "yearly" ? "year" : "month"}
                  </span>
                ) : null}
              </div>
            </div>

            {plan.features.length > 0 ? (
              <ul className="grid gap-1.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <CheckIcon className="size-3 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-3">
              {Object.entries(plan.limits).map(([key, value]) => (
                <span key={key} className="text-xs text-muted-foreground">
                  {PLAN_LIMIT_LABELS[key] ?? key}:{" "}
                  <span className="font-medium text-foreground">
                    {formatLimitValue(value)}
                  </span>
                </span>
              ))}
            </div>
          </label>
        )
      })}
    </div>
  )
}
