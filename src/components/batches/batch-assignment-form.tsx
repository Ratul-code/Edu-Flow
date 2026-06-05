"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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

  function updateFilterValue(
    key: keyof StudentFilterValues,
    value: string
  ) {
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
    <Card>
      <CardHeader>
        <CardTitle>Add students</CardTitle>
        <CardDescription>
          Search and filter students, then bulk-add them to this batch.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          className="grid gap-2 xl:grid-cols-[minmax(12rem,1fr)_repeat(4,minmax(7.5rem,9rem))]"
          onSubmit={(event) => event.preventDefault()}
        >
          <Input
            className="h-9"
            name="studentQ"
            onChange={(event) =>
              updateFilterValue("studentQ", event.currentTarget.value)
            }
            placeholder="Search students"
            value={filterValues.studentQ}
          />
          <FilterSelect
            name="studentClassLevel"
            onChange={(value) => updateFilterValue("studentClassLevel", value)}
            options={classLevels}
            placeholder="All classes"
            value={filterValues.studentClassLevel}
          />
          <FilterSelect
            name="studentMedium"
            onChange={(value) => updateFilterValue("studentMedium", value)}
            options={mediums}
            placeholder="All mediums"
            value={filterValues.studentMedium}
          />
          <FilterSelect
            name="studentGroupName"
            onChange={(value) => updateFilterValue("studentGroupName", value)}
            options={groups}
            placeholder="All groups"
            value={filterValues.studentGroupName}
          />
          <FilterSelect
            name="studentTag"
            onChange={(value) => updateFilterValue("studentTag", value)}
            options={tags}
            placeholder="All tags"
            value={filterValues.studentTag}
          />
        </form>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <FieldLabel>Available students</FieldLabel>
              <div className="flex items-center gap-2">
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
            </div>
            <div className="max-h-72 overflow-y-auto rounded-lg border bg-muted/20">
              {students.length ? (
                students.map((student) => (
                  <label
                    className="flex items-start gap-2 border-b border-gray-200 px-3 py-2 text-sm last:border-b-0 hover:bg-emerald-50"
                    key={student.id}
                  >
                    <input
                      checked={selectedIds.has(student.id)}
                      className="mt-1"
                      name="student_ids"
                      onChange={() => toggleStudent(student.id)}
                      type="checkbox"
                      value={student.id}
                    />
                    <span>
                      <span className="block font-medium text-emerald-800">
                        {student.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {[student.class_level, student.medium, student.group_name]
                          .filter(Boolean)
                          .join(" - ") || "No classification"}
                      </span>
                    </span>
                  </label>
                ))
              ) : (
                <p className="px-3 py-4 text-sm text-muted-foreground">
                  No unassigned students match the current filters.
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button disabled={!selectedCount} type="submit">
              Add selected
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function FilterSelect({
  name,
  onChange,
  options,
  placeholder,
  value,
}: {
  name: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  value: string
}) {
  return (
    <select
      className="h-9 min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      name={name}
      onChange={(event) => onChange(event.currentTarget.value)}
      value={value}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
