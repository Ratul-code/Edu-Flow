import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { monthInputValue } from "@/lib/data/fees"

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
  const previousMonth = shiftMonth(inputValue, -1)
  const nextMonth = shiftMonth(inputValue, 1)

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-2">
        <Button
          render={<Link href={`/fees?month=${previousMonth}`} />}
          size="icon-sm"
          variant="outline"
        >
          <ChevronLeftIcon className="size-3.5" />
          <span className="sr-only">Previous month</span>
        </Button>
        <span className="min-w-[90px] px-1 text-center text-sm font-medium">
          {formatMonth(month)}
        </span>
        <Button
          render={<Link href={`/fees?month=${nextMonth}`} />}
          size="icon-sm"
          variant="outline"
        >
          <ChevronRightIcon className="size-3.5" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        Starts {formatDate(paymentStartDate)} · Grace ends {formatDate(graceEndDate)}
      </div>
    </div>
  )
}

function shiftMonth(value: string, offset: number) {
  const [year, month] = value.split("-").map(Number)
  const date = new Date(year, month - 1 + offset, 1)

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`))
}
