import { CalendarDaysIcon } from "lucide-react"

import { monthInputValue } from "@/lib/data/fees"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type SalaryMonthControlsProps = {
  month: string
}

export function SalaryMonthControls({ month }: SalaryMonthControlsProps) {
  const inputValue = monthInputValue(month)

  return (
    <form className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <Field>
        <FieldLabel htmlFor="month">Month</FieldLabel>
        <Input id="month" name="month" defaultValue={inputValue} type="month" />
      </Field>
      <Button type="submit" variant="outline">
        <CalendarDaysIcon data-icon="inline-start" />
        Open month
      </Button>
    </form>
  )
}
