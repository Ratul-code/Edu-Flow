import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"

type SearchInputProps = {
  placeholder: string
  value?: string
}

export function SearchInput({ placeholder, value }: SearchInputProps) {
  return (
    <label className="relative flex min-w-0 flex-1 items-center">
      <SearchIcon className="pointer-events-none absolute left-2.5 text-muted-foreground" />
      <span className="sr-only">Search</span>
      <Input
        className="pl-8"
        name="q"
        placeholder={placeholder}
        defaultValue={value}
        autoComplete="off"
      />
    </label>
  )
}
