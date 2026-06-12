import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"

type SearchInputProps = {
  placeholder: string
  value?: string
}

export function SearchInput({ placeholder, value }: SearchInputProps) {
  return (
    <label className="relative flex min-w-0 flex-1 items-center">
      <SearchIcon className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
      <span className="sr-only">Search</span>
      <Input
        className="h-8 pl-8 text-sm"
        name="q"
        placeholder={placeholder}
        defaultValue={value}
        autoComplete="off"
      />
    </label>
  )
}
