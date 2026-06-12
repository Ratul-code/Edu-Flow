import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { monthInputValue } from "@/lib/data/fees"

type SalaryMonthControlsProps = {
  month: string
}

export function SalaryMonthControls({ month }: SalaryMonthControlsProps) {
  const inputValue = monthInputValue(month)

  return (
    <div className="flex items-center gap-2">
      <Button
        render={<Link href={`/salaries?month=${shiftMonth(inputValue, -1)}`} />}
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
        render={<Link href={`/salaries?month=${shiftMonth(inputValue, 1)}`} />}
        size="icon-sm"
        variant="outline"
      >
        <ChevronRightIcon className="size-3.5" />
        <span className="sr-only">Next month</span>
      </Button>
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
