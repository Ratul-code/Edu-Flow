import { FieldError } from "@/components/ui/field"

/**
 * Renders a single form error for a field.
 *
 * `FormState.errors` values can be a string or an array of strings, while the
 * `FieldError` component expects an array of `{ message }` objects.
 */
export function FormFieldError({
  error,
}: {
  error?: string | string[]
}) {
  const messages = Array.isArray(error) ? error : error ? [error] : []

  if (!messages.length) {
    return null
  }

  return (
    <FieldError
      errors={messages.map((message) => ({ message }))}
    />
  )
}
