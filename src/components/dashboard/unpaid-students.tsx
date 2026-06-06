"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { DueStudentLedger } from "@/lib/data/dashboard"

type UnpaidStudentsProps = {
  students: DueStudentLedger[]
}

export function UnpaidStudents({ students }: UnpaidStudentsProps) {
  const previewStudents = students.slice(0, 5)

  return (
    <div className="flex flex-col gap-4">
      {previewStudents.length ? (
        <div className="flex flex-col gap-3">
          {previewStudents.map((student) => (
            <UnpaidStudentRow key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Due students will appear after monthly fee ledgers are prepared.
        </p>
      )}

      <Dialog>
        <DialogTrigger
          render={
            <button
              className="w-fit text-sm font-medium text-primary hover:underline"
              type="button"
            />
          }
        >
          See All
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Due Students</DialogTitle>
            <DialogDescription>
              Search current-month due students by name, phone, or class.
            </DialogDescription>
          </DialogHeader>
          <UnpaidStudentsModal students={students} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UnpaidStudentsModal({ students }: UnpaidStudentsProps) {
  const [query, setQuery] = useState("")
  const [classLevel, setClassLevel] = useState("")

  const classLevels = useMemo(
    () =>
      Array.from(
        new Set(
          students
            .map((student) => student.classLevel?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((left, right) => left.localeCompare(right)),
    [students]
  )
  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return students.filter((student) => {
      const matchesClass =
        !classLevel || student.classLevel?.toLowerCase() === classLevel
      const searchable = [
        student.studentName,
        student.studentPhone ?? "",
        student.classLevel ?? "",
      ]
        .join(" ")
        .toLowerCase()
      const matchesQuery =
        !normalizedQuery || searchable.includes(normalizedQuery)

      return matchesClass && matchesQuery
    })
  }, [classLevel, query, students])

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search name or phone"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select
          value={classLevel}
          onValueChange={(value) => setClassLevel(value ?? "")}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="All classes" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="">All classes</SelectItem>
              {classLevels.map((level) => (
                <SelectItem key={level} value={level.toLowerCase()}>
                  {level}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="max-h-[420px] overflow-y-auto rounded-lg border p-3">
        {filteredStudents.length ? (
          <div className="flex flex-col gap-3">
            {filteredStudents.map((student) => (
              <UnpaidStudentRow key={student.id} student={student} />
            ))}
          </div>
        ) : (
          <p className="p-3 text-sm text-muted-foreground">
            No due students match these filters.
          </p>
        )}
      </div>
    </div>
  )
}

function UnpaidStudentRow({ student }: { student: DueStudentLedger }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar className="bg-destructive/10 text-destructive" size="lg">
        <AvatarFallback className="bg-destructive/10 text-sm font-medium text-destructive">
          {initials(student.studentName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{student.studentName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {student.studentPhone || "No phone"}
        </p>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3 max-sm:basis-full max-sm:justify-end">
        <p className="text-sm font-semibold">{formatTaka(student.dueAmount)}</p>
        <Badge variant="destructive">{student.status}</Badge>
        {student.studentId ? (
          <Button
            render={<Link href={`/students/${student.studentId}`} />}
            size="sm"
            variant="outline"
          >
            View details
          </Button>
        ) : (
          <Button disabled size="sm" variant="outline">
            View details
          </Button>
        )}
      </div>
    </div>
  )
}

function initials(name: string) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  return letters.toUpperCase() || "ST"
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
