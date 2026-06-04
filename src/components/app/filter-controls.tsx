"use client"

import * as React from "react"

import type { ModuleFilter } from "@/lib/admin/module-config"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FilterControlsProps = {
  filters: ModuleFilter[]
}

export function FilterControls({ filters }: FilterControlsProps) {
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((filter) => [filter.label, filter.options[0] ?? "All"]))
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Select
          key={filter.label}
          value={values[filter.label]}
          onValueChange={(value) =>
            setValues((current) => ({
              ...current,
              [filter.label]: value ?? filter.options[0] ?? "All",
            }))
          }
        >
          <SelectTrigger aria-label={filter.label} size="sm">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              {filter.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ))}
    </div>
  )
}
