"use client"

import { PlusIcon, SearchIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useRef, useState } from "react"

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
import type { StudentRecord } from "@/lib/data/students"

type BatchAssignmentFormProps = {
  action: (formData: FormData) => void | Promise<void>
  classLevels: string[]
  filters: {
    classLevel?: string
    groupName?: string
    medium?: string
    search?: string
    tag?: string
  }
  groups: string[]
  mediums: string[]
  students: StudentRecord[]
  tags: string[]
}

type StudentFilterValues = {
  studentClassLevel: string
  studentGroupName: string
  studentMedium: string
  studentQ: string
  studentTag: string
}

export function BatchAssignmentForm({
  action,
  classLevels,
  filters,
  groups,
  mediums,
  students,
  tags,
}: BatchAssignmentFormProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterSubmitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [filterValues, setFilterValues] = useState<StudentFilterValues>({
    studentClassLevel: filters.classLevel ?? "",
    studentGroupName: filters.groupName ?? "",
    studentMedium: filters.medium ?? "",
    studentQ: filters.search ?? "",
    studentTag: filters.tag ?? "",
  })
  const studentIds = useMemo(
    () => students.map((student) => student.id),
    [students]
  )
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const selectedCount = studentIds.filter((id) => selectedIds.has(id)).length
  const allVisibleSelected =
    studentIds.length > 0 && studentIds.every((id) => selectedIds.has(id))

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
        studentIds.forEach((id) => next.delete(id))
      } else {
        studentIds.forEach((id) => next.add(id))
      }

      return next
    })
  }

  function updateFilterValue(key: keyof StudentFilterValues, value: string) {
    const nextValues = {
      ...filterValues,
      [key]: value,
    }

    setFilterValues(nextValues)
    scheduleFilterSubmit(nextValues)
  }

  function scheduleFilterSubmit(nextValues: StudentFilterValues) {
    if (filterSubmitTimeoutRef.current) {
      clearTimeout(filterSubmitTimeoutRef.current)
    }

    filterSubmitTimeoutRef.current = setTimeout(() => {
      updateStudentFilters(nextValues)
    }, 250)
  }

  function updateStudentFilters(nextValues: StudentFilterValues) {
    const nextParams = new URLSearchParams(searchParams.toString())
    const filterKeys = [
      "studentQ",
      "studentClassLevel",
      "studentMedium",
      "studentGroupName",
      "studentTag",
      "assignmentPage",
    ]

    filterKeys.forEach((key) => nextParams.delete(key))

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value.trim()) {
        nextParams.set(key, value.trim())
      }
    })

    const query = nextParams.toString()

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  return (
    <>
      <Sheet>
        <SheetTrigger render={<Button className="gap-1.5" size="sm" type="button" />}>
          <PlusIcon className="size-3.5" />
          Assign
        </SheetTrigger>
        <SheetContent className="w-full overflow-hidden p-0 data-[side=right]:!w-[92vw] data-[side=right]:!max-w-2xl">
          <div className="flex min-h-0 flex-1 flex-col">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle>Assign Students</SheetTitle>
              <SheetDescription>
                Search, filter, and bulk select students for this batch.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-8 pl-8 text-sm"
                  onChange={(event) =>
                    updateFilterValue("studentQ", event.currentTarget.value)
                  }
                  placeholder="Search students"
                  value={filterValues.studentQ}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <FilterSelect
                  onChange={(value) => updateFilterValue("studentClassLevel", value)}
                  options={classLevels}
                  placeholder="Class"
                  value={filterValues.studentClassLevel}
                />
                <FilterSelect
                  onChange={(value) => updateFilterValue("studentMedium", value)}
                  options={mediums}
                  placeholder="Medium"
                  value={filterValues.studentMedium}
                />
                <FilterSelect
                  onChange={(value) => updateFilterValue("studentGroupName", value)}
                  options={groups}
                  placeholder="Group"
                  value={filterValues.studentGroupName}
                />
                <FilterSelect
                  onChange={(value) => updateFilterValue("studentTag", value)}
                  options={tags}
                  placeholder="Tag"
                  value={filterValues.studentTag}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {selectedCount} selected
                </span>
                <Button
                  disabled={!studentIds.length}
                  onClick={toggleAllVisible}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {allVisibleSelected ? "Clear" : "Select all"}
                </Button>
              </div>
              <div className="max-h-[26rem] overflow-y-auto rounded-lg border">
                {students.length ? (
                  students.map((student) => (
                    <label
                      className="flex cursor-pointer items-start gap-2 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/50"
                      key={student.id}
                    >
                      <Checkbox
                        checked={selectedIds.has(student.id)}
                        className="mt-1"
                        onCheckedChange={() => toggleStudent(student.id)}
                        value={student.id}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {student.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {[student.phone, student.class_level, student.medium, student.group_name]
                            .filter(Boolean)
                            .join(" · ") || "No classification"}
                        </span>
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="px-3 py-6 text-sm text-muted-foreground">
                    No unassigned students match the current filters.
                  </p>
                )}
              </div>
            </div>
            <SheetFooter className="border-t bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end">
              <Button
                disabled={!selectedCount}
                onClick={() => setConfirmOpen(true)}
                type="button"
              >
                Assign selected
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>When should fee collection start?</DialogTitle>
              <DialogDescription>
                Choose when to generate monthly ledgers for the selected
                students after assigning them to this batch.
              </DialogDescription>
            </DialogHeader>
            <form action={action}>
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
    </>
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
