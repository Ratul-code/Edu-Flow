"use client"

import { useState } from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FeeStartOption = "current" | "next" | "custom"

type FeeStartControlsProps = {
  defaultMonth?: string
}

export function FeeStartControls({ defaultMonth }: FeeStartControlsProps) {
  const [option, setOption] = useState<FeeStartOption>("current")
  const currentMonth = normalizeMonth(defaultMonth)
  const selectedMonth =
    option === "next" ? addMonths(currentMonth, 1) : currentMonth

  return (
    <Field className="sm:col-span-2">
      <FieldLabel htmlFor="fee_start_option">Fee starts from</FieldLabel>
      <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[180px_1fr]">
        <select
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          id="fee_start_option"
          name="fee_start_option"
          onChange={(event) => setOption(event.target.value as FeeStartOption)}
          required
          value={option}
        >
          <option value="current">Current month</option>
          <option value="next">Next month</option>
          <option value="custom">Custom month</option>
        </select>
        {option === "custom" ? (
          <Input
            defaultValue={defaultMonth}
            id="fee_start_custom_month"
            name="fee_start_custom_month"
            required
            type="month"
          />
        ) : (
          <div className="flex min-h-8 items-center rounded-lg border bg-background px-2.5 text-sm">
            {formatMonth(selectedMonth)}
          </div>
        )}
      </div>
    </Field>
  )
}

function addMonths(value: string, months: number) {
  const [year, month] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1 + months, 1))

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}-01T00:00:00Z`))
}

function normalizeMonth(value?: string) {
  return value && /^\d{4}-\d{2}$/.test(value)
    ? value
    : new Date().toISOString().slice(0, 7)
}
