"use client"

import { useState, type ComponentProps } from "react"

import { Textarea } from "@/components/ui/textarea"
import {
  hasLatinLettersOutsideTemplateTokens,
  hasBanglaText,
  stripLatinLettersOutsideTemplateTokens,
} from "@/lib/sms/bangla-text"

type BanglaSmsTextareaProps = Omit<
  ComponentProps<typeof Textarea>,
  "defaultValue" | "onChange" | "value"
> & {
  defaultValue?: string | null
}

export function BanglaSmsTextarea({
  defaultValue,
  ...props
}: BanglaSmsTextareaProps) {
  const [value, setValue] = useState(
    stripLatinLettersOutsideTemplateTokens(defaultValue ?? "")
  )
  const hasInvalidText = hasLatinLettersOutsideTemplateTokens(value)
  const missingBanglaText = value.trim().length > 0 && !hasBanglaText(value)

  return (
    <div className="space-y-2">
      <Textarea
        {...props}
        onChange={(event) =>
          setValue(stripLatinLettersOutsideTemplateTokens(event.target.value))
        }
        value={value}
      />
      {hasInvalidText ? (
        <p className="text-sm text-destructive">
          SMS text must be written in Bangla only. Variable tokens are allowed.
        </p>
      ) : null}
      {missingBanglaText ? (
        <p className="text-sm text-destructive">
          SMS text must include Bangla text.
        </p>
      ) : null}
    </div>
  )
}
