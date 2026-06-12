"use client"

import { PencilIcon, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type { StudentBatchRecord } from "@/lib/data/batches"

type BatchFeeOverrideSheetProps = {
  action: (formData: FormData) => void | Promise<void>
  assignments: StudentBatchRecord[]
}

export function BatchFeeOverrideSheet({
  action,
  assignments,
}: BatchFeeOverrideSheetProps) {
  const [search, setSearch] = useState("")
  const [classLevel, setClassLevel] = useState("")
  const [medium, setMedium] = useState("")
  const [groupName, setGroupName] = useState("")
  const [tag, setTag] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [feeOverride, setFeeOverride] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const filteredAssignments = useMemo(() => {
    const q = search.trim().toLowerCase()

    return assignments.filter((assignment) => {
      const searchable = [
        assignment.student?.name,
        assignment.student?.phone,
        assignment.student?.class_level,
        assignment.student?.medium,
        assignment.student?.group_name,
        ...(assignment.student?.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return (
        (!q || searchable.includes(q)) &&
        (!classLevel || assignment.student?.class_level === classLevel) &&
        (!medium || assignment.student?.medium === medium) &&
        (!groupName || assignment.student?.group_name === groupName) &&
        (!tag || assignment.student?.tags?.includes(tag))
      )
    })
  }, [assignments, classLevel, groupName, medium, search, tag])
  const classLevels = uniqueValues(
    assignments.map((assignment) => assignment.student?.class_level ?? null)
  )
  const mediums = uniqueValues(
    assignments.map((assignment) => assignment.student?.medium ?? null)
  )
  const groups = uniqueValues(
    assignments.map((assignment) => assignment.student?.group_name ?? null)
  )
  const tags = Array.from(
    new Set(assignments.flatMap((assignment) => assignment.student?.tags ?? []))
  ).sort((left, right) => left.localeCompare(right))
  const selectedCount = filteredAssignments.filter((assignment) =>
    selectedIds.has(assignment.student_id)
  ).length
  const allVisibleSelected =
    filteredAssignments.length > 0 &&
    filteredAssignments.every((assignment) => selectedIds.has(assignment.student_id))

  function toggleStudent(studentId: string) {
    setSelectedIds((current) => {
      const next = new Set(current)

      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }

      return next
    })
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current)

      if (allVisibleSelected) {
        filteredAssignments.forEach((assignment) => next.delete(assignment.student_id))
      } else {
        filteredAssignments.forEach((assignment) => next.add(assignment.student_id))
      }

      return next
    })
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button className="gap-1.5 text-xs" size="sm" type="button" variant="outline" />
        }
      >
        <PencilIcon className="size-3" />
        Set Fee Override
      </SheetTrigger>
      <SheetContent className="w-full overflow-hidden p-0 data-[side=right]:!w-[92vw] data-[side=right]:!max-w-xl">
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>Edit Fee Override</SheetTitle>
            <SheetDescription>
              Search assigned students and apply a fee override.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-sm"
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder="Search assigned students"
                value={search}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
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
              <FilterSelect
                onChange={setTag}
                options={tags}
                placeholder="Tag"
                value={tag}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="fee_override">
                Override fee
              </label>
              <Input
                className="h-9 text-sm"
                id="fee_override"
                min="0"
                onChange={(event) => setFeeOverride(event.currentTarget.value)}
                placeholder="Leave blank to use batch fee"
                step="0.01"
                type="number"
                value={feeOverride}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {selectedCount} selected
              </span>
              <Button
                disabled={!filteredAssignments.length}
                onClick={toggleAllVisible}
                size="sm"
                type="button"
                variant="outline"
              >
                {allVisibleSelected ? "Clear" : "Select all"}
              </Button>
            </div>
            <div className="max-h-[24rem] overflow-y-auto rounded-lg border">
              {filteredAssignments.length ? (
                filteredAssignments.map((assignment) => (
                  <label
                    className="flex cursor-pointer items-start gap-2 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/50"
                    key={assignment.id}
                  >
                    <Checkbox
                      checked={selectedIds.has(assignment.student_id)}
                      className="mt-1"
                      onCheckedChange={() => toggleStudent(assignment.student_id)}
                      value={assignment.student_id}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {assignment.student?.name ?? "Unknown student"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Current override:{" "}
                        {assignment.fee_override ??
                          assignment.custom_fee_override ??
                          "Batch fee"}
                      </span>
                    </span>
                  </label>
                ))
              ) : (
                <p className="px-3 py-6 text-sm text-muted-foreground">
                  No assigned students match the current search.
                </p>
              )}
            </div>
          </div>
          <SheetFooter className="border-t bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              disabled={!selectedIds.size}
              onClick={() => setConfirmOpen(true)}
              type="button"
            >
              Save override
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>When should the override apply?</DialogTitle>
            <DialogDescription>
              Choose when to regenerate monthly ledgers with this override fee.
            </DialogDescription>
          </DialogHeader>
          <form action={action}>
            <input name="fee_override" type="hidden" value={feeOverride} />
            {Array.from(selectedIds).map((studentId) => (
              <input
                key={studentId}
                name="student_ids"
                type="hidden"
                value={studentId}
              />
            ))}
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Discard
              </DialogClose>
              <Button name="fee_start_option" type="submit" value="next" variant="outline">
                Next month
              </Button>
              <Button name="fee_start_option" type="submit" value="current">
                This month
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
