import type { ModuleFilter } from "@/lib/admin/module-config"
import { CreateRecordDialog } from "@/components/app/create-record-dialog"
import { FilterControls } from "@/components/app/filter-controls"
import { SearchInput } from "@/components/app/search-input"

type ModuleToolbarProps = {
  createLabel: string
  filters: ModuleFilter[]
  moduleName: string
  searchPlaceholder: string
}

export function ModuleToolbar({
  createLabel,
  filters,
  moduleName,
  searchPlaceholder,
}: ModuleToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <form className="flex min-w-0 flex-1" role="search">
        <SearchInput placeholder={searchPlaceholder} />
      </form>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <FilterControls filters={filters} />
        <CreateRecordDialog label={createLabel} moduleName={moduleName} />
      </div>
    </div>
  )
}
