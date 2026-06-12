"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/app/status-badge"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DueStudentLedger } from "@/lib/data/dashboard"

type UnpaidStudentsProps = {
  students: DueStudentLedger[]
}

export function UnpaidStudents({ students }: UnpaidStudentsProps) {
  const previewStudents = students.slice(0, 5)

  return (
    <div className="flex flex-col gap-3">
      {previewStudents.length ? (
        <DueStudentsTable students={previewStudents} />
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

      <div className="max-h-[420px] overflow-y-auto rounded-lg border">
        {filteredStudents.length ? (
          <DueStudentsTable students={filteredStudents} />
        ) : (
          <p className="p-3 text-sm text-muted-foreground">
            No due students match these filters.
          </p>
        )}
      </div>
    </div>
  )
}

function DueStudentsTable({ students }: UnpaidStudentsProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-8 text-xs font-medium">Student</TableHead>
          <TableHead className="h-8 text-xs font-medium">Class</TableHead>
          <TableHead className="h-8 text-right text-xs font-medium">
            Due
          </TableHead>
          <TableHead className="h-8 text-xs font-medium">Status</TableHead>
          <TableHead className="h-8 w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="py-2.5">
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-muted text-[10px] font-semibold">
                    {initials(student.studentName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium leading-none">
                    {student.studentName}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {student.studentPhone || "No phone"}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="py-2.5 text-xs text-muted-foreground">
              {student.classLevel || "-"}
            </TableCell>
            <TableCell className="py-2.5 text-right text-sm font-medium">
              {formatTaka(student.dueAmount)}
            </TableCell>
            <TableCell className="py-2.5">
              <StatusBadge status={student.status} />
            </TableCell>
            <TableCell className="py-2.5">
              {student.studentId ? (
                <Button
                  render={<Link href={`/students/${student.studentId}`} />}
                  size="sm"
                  variant="ghost"
                >
                  View
                </Button>
              ) : (
                <Button disabled size="sm" variant="ghost">
                  View
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
