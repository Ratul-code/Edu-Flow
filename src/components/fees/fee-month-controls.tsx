import { CalendarDaysIcon, RotateCwIcon } from "lucide-react"

import { generateStudentMonthlyLedgers } from "@/lib/actions/fees"
import { monthInputValue } from "@/lib/data/fees"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FeeMonthControlsProps = {
  month: string
}

export function FeeMonthControls({ month }: FeeMonthControlsProps) {
  const inputValue = monthInputValue(month)

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
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
      <form action={generateStudentMonthlyLedgers}>
        <input name="month" type="hidden" value={inputValue} />
        <Button type="submit">
          <RotateCwIcon data-icon="inline-start" />
          Generate ledger
        </Button>
      </form>
    </div>
  )
}
