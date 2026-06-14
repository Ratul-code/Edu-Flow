"use client"

import { BookOpenIcon, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"

import {
  FeeTimingActionForm,
  FeeTimingPendingOverlay,
} from "@/components/app/fee-timing-action-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { BatchRecord } from "@/lib/data/batches"

type StudentAssignBatchSheetProps = {
  action: (formData: FormData) => void | Promise<void>
  assignedBatchIds: string[]
  batches: BatchRecord[]
}

export function StudentAssignBatchSheet({
  action,
  assignedBatchIds,
  batches,
}: StudentAssignBatchSheetProps) {
  const [search, setSearch] = useState("")
  const [classLevel, setClassLevel] = useState("")
  const [medium, setMedium] = useState("")
  const [groupName, setGroupName] = useState("")
  const [selectedBatchId, setSelectedBatchId] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isLedgerPending, setIsLedgerPending] = useState(false)
  const assigned = useMemo(() => new Set(assignedBatchIds), [assignedBatchIds])
  const availableBatches = useMemo(
    () => batches.filter((batch) => !assigned.has(batch.id)),
    [assigned, batches]
  )
  const classLevels = uniqueValues(availableBatches.map((batch) => batch.class_level))
  const mediums = uniqueValues(availableBatches.map((batch) => batch.medium))
  const groups = uniqueValues(availableBatches.map((batch) => batch.group_name))
  const filteredBatches = availableBatches.filter((batch) => {
    const searchable = [
      batch.name,
      batch.subject,
      batch.class_level,
      batch.medium,
      batch.group_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return (
      (!search.trim() || searchable.includes(search.trim().toLowerCase())) &&
      (!classLevel || batch.class_level === classLevel) &&
      (!medium || batch.medium === medium) &&
      (!groupName || batch.group_name === groupName)
    )
  })

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger
        render={
          <Button className="gap-1.5 text-xs" size="sm" type="button" variant="outline" />
        }
      >
        <BookOpenIcon className="size-3" />
        Assign Batch
      </SheetTrigger>
      <SheetContent className="w-full overflow-hidden p-0 data-[side=right]:!w-[92vw] data-[side=right]:!max-w-md">
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>Assign Batch</SheetTitle>
            <SheetDescription>
              Search active batches and assign one to this student.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-sm"
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder="Search batches"
                value={search}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <FilterSelect
                onChange={setClassLevel}
                options={classLevels}
                placeholder="Class"
                value={classLevel}
              />
              <FilterSelect
                onChange={setMedium}
                options={mediums}
                placeholder="Medium"
                value={medium}
              />
              <FilterSelect
                onChange={setGroupName}
                options={groups}
                placeholder="Group"
                value={groupName}
              />
            </div>
            <div className="max-h-[22rem] overflow-y-auto rounded-lg border">
              {filteredBatches.length ? (
                filteredBatches.map((batch) => (
                  <label
                    className="flex cursor-pointer items-center justify-between gap-3 border-b px-3 py-3 last:border-b-0 hover:bg-muted/50"
                    key={batch.id}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <input
                        checked={selectedBatchId === batch.id}
                        className="size-4 accent-primary"
                        name="batch_id"
                        onChange={() => setSelectedBatchId(batch.id)}
                        type="radio"
                        value={batch.id}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {batch.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[batch.subject, batch.class_level, batch.medium, batch.group_name]
                            .filter(Boolean)
                            .join(" · ") || "-"}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium">
                      {formatTaka(batch.monthly_fee)}
                    </span>
                  </label>
                ))
              ) : (
                <p className="px-3 py-6 text-sm text-muted-foreground">
                  No active unassigned batches match the current filters.
                </p>
              )}
            </div>
          </div>
          <SheetFooter className="border-t bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              disabled={!selectedBatchId}
              onClick={() => setConfirmOpen(true)}
              type="button"
            >
              Assign Batch
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>When should fees start?</DialogTitle>
            <DialogDescription>
              Choose whether to generate the monthly ledger for this batch from
              this month or next month. Discard will close this prompt without
              assigning the batch.
            </DialogDescription>
          </DialogHeader>
          <FeeTimingActionForm
            action={action}
            onPendingChange={setIsLedgerPending}
            onSubmitStart={() => {
              setConfirmOpen(false)
              setSheetOpen(false)
            }}
            successMessage="The batch was assigned and fee ledgers were updated."
            successTitle="Batch assigned"
          >
            <input name="batch_id" type="hidden" value={selectedBatchId} />
          </FeeTimingActionForm>
        </DialogContent>
      </Dialog>
      {isLedgerPending ? <FeeTimingPendingOverlay /> : null}
    </Sheet>
  )
}

function FilterSelect({
  onChange,
  options,
  placeholder,
  value,
}: {
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  value: string
}) {
  return (
    <Select onValueChange={(nextValue) => onChange(nextValue ?? "")} value={value}>
      <SelectTrigger className="h-8 w-full min-w-0 rounded-md text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger>
        <SelectGroup>
          <SelectItem value="">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function uniqueValues(values: Array<string | null>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value?.trim())))
  ).sort((left, right) => left.localeCompare(right))
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
