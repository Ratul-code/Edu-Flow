import { CalendarDaysIcon, RotateCwIcon } from "lucide-react"

import { generateStudentMonthlyLedgers } from "@/lib/actions/fees"
import { monthInputValue } from "@/lib/data/fees"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FeeMonthControlsProps = {
  graceEndDate: string
  month: string
  paymentStartDate: string
}

export function FeeMonthControls({
  graceEndDate,
  month,
  paymentStartDate,
}: FeeMonthControlsProps) {
  const inputValue = monthInputValue(month)

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3">
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
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Starts {formatDate(paymentStartDate)}</span>
          <span>Grace ends {formatDate(graceEndDate)}</span>
        </div>
      </div>
      <form action={generateStudentMonthlyLedgers}>
        <input name="month" type="hidden" value={inputValue} />
        <Button type="submit">
          <RotateCwIcon data-icon="inline-start" />
          Prepare Month
        </Button>
      </form>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}
