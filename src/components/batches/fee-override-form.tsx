"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

type FeeOverrideFormProps = {
  action: (formData: FormData) => void | Promise<void>
  feeUsed: number | string | null
  initialValue: number | string | null
}

export function FeeOverrideForm({
  action,
  feeUsed,
  initialValue,
}: FeeOverrideFormProps) {
  const [value, setValue] = useState(String(initialValue ?? ""))
  const showSave = normalizeFeeValue(value) !== normalizeFeeValue(feeUsed)

  return (
    <form action={action} className="flex min-w-36 items-center gap-2">
      <input
        className="h-8 w-24 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        min="0"
        name="fee_override"
        onChange={(event) => setValue(event.target.value)}
        placeholder="Batch fee"
        step="0.01"
        type="number"
        value={value}
      />
      {showSave ? (
        <Button size="sm" type="submit" variant="outline">
          Save
        </Button>
      ) : null}
    </form>
  )
}

function normalizeFeeValue(value: number | string | null) {
  if (value === null || value === undefined) {
    return ""
  }

  const trimmed = String(value).trim()

  if (!trimmed) {
    return ""
  }

  const numericValue = Number(trimmed)

  return Number.isFinite(numericValue) ? String(numericValue) : trimmed
}
