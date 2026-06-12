import * as React from "react"
import { Search, Plus, Filter, MoreHorizontal, ChevronLeft, ChevronRight, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNav } from "@/nav-context"

const students = [
  { id: 1, name: "Rashed Karim", phone: "01711-234567", classLevel: "SSC", medium: "Bangla", group: "Science", batches: ["SSC Science A"], status: "active", tag: "scholarship" },
  { id: 2, name: "Nadia Islam", phone: "01812-345678", classLevel: "HSC", medium: "English", group: "Commerce", batches: ["HSC Commerce B"], status: "active", tag: null },
  { id: 3, name: "Tanvir Ahmed", phone: "01912-456789", classLevel: "SSC", medium: "Bangla", group: "Arts", batches: ["SSC Arts C"], status: "active", tag: null },
  { id: 4, name: "Sadia Akter", phone: "01611-567890", classLevel: "Class 8", medium: "Bangla", group: "General", batches: ["Class 8 Math"], status: "active", tag: "new" },
  { id: 5, name: "Imran Hossain", phone: "01711-678901", classLevel: "SSC", medium: "Bangla", group: "Science", batches: ["SSC Science A", "Class 8 Math"], status: "active", tag: null },
  { id: 6, name: "Farida Begum", phone: "01512-789012", classLevel: "HSC", medium: "Bangla", group: "Science", batches: ["HSC Science A"], status: "active", tag: "scholarship" },
  { id: 7, name: "Raihan Uddin", phone: "01611-890123", classLevel: "Class 9", medium: "English", group: "Science", batches: ["Class 9 Science"], status: "inactive", tag: null },
  { id: 8, name: "Mitu Khatun", phone: "01911-901234", classLevel: "SSC", medium: "Bangla", group: "Commerce", batches: ["SSC Commerce B"], status: "active", tag: null },
  { id: 9, name: "Arman Shaikh", phone: "01811-012345", classLevel: "HSC", medium: "English", group: "Science", batches: ["HSC Science A"], status: "active", tag: "new" },
  { id: 10, name: "Sumaiya Rahman", phone: "01711-123450", classLevel: "Class 8", medium: "Bangla", group: "General", batches: ["Class 8 Math"], status: "active", tag: null },
]

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
  }
  return <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">Inactive</span>
}

function TagBadge({ tag }: { tag: string | null }) {
  if (!tag) return null
  const map: Record<string, string> = {
    scholarship: "bg-info/10 text-info border-info/20",
    new: "bg-warning/10 text-warning-foreground border-warning/20",
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[tag] ?? ""}`}>
      {tag}
    </span>
  )
}

export function Students() {
  const { navigate } = useNav()
  const [search, setSearch] = React.useState("")

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search)
  )

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {students.filter(s => s.status === "active").length} active ·{" "}
            {students.length} total
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate("student-detail")}>
          <Plus className="size-4" />
          New Student
        </Button>
      </div>

      {/* Main Card */}
      <Card className="py-0 gap-0">
        {/* Filters */}
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search name or phone..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger size="sm" className="w-[130px]">
                <SelectValue placeholder="Class level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                <SelectItem value="ssc">SSC</SelectItem>
                <SelectItem value="hsc">HSC</SelectItem>
                <SelectItem value="class8">Class 8</SelectItem>
                <SelectItem value="class9">Class 9</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger size="sm" className="w-[110px]">
                <SelectValue placeholder="Medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All mediums</SelectItem>
                <SelectItem value="bangla">Bangla</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger size="sm" className="w-[110px]">
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger size="sm" className="w-[100px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
              <Filter className="size-3.5" />
              Filter
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <UserX className="size-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No students found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs h-9 font-medium pl-4">Student</TableHead>
                  <TableHead className="text-xs h-9 font-medium">Phone</TableHead>
                  <TableHead className="text-xs h-9 font-medium">Class</TableHead>
                  <TableHead className="text-xs h-9 font-medium">Medium</TableHead>
                  <TableHead className="text-xs h-9 font-medium">Group</TableHead>
                  <TableHead className="text-xs h-9 font-medium">Batches</TableHead>
                  <TableHead className="text-xs h-9 font-medium">Status</TableHead>
                  <TableHead className="h-9 w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student) => (
                  <TableRow
                    key={student.id}
                    className="cursor-pointer"
                    onClick={() => navigate("student-detail")}
                  >
                    <TableCell className="py-3 pl-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="text-xs font-semibold bg-muted">
                            {student.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium leading-none">{student.name}</div>
                          {student.tag && (
                            <div className="mt-1">
                              <TagBadge tag={student.tag} />
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">{student.phone}</TableCell>
                    <TableCell className="py-3 text-sm">{student.classLevel}</TableCell>
                    <TableCell className="py-3 text-sm">{student.medium}</TableCell>
                    <TableCell className="py-3 text-sm">{student.group}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {student.batches.map((b) => (
                          <Badge key={b} variant="secondary" className="text-xs font-normal">
                            {b}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge status={student.status} />
                    </TableCell>
                    <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="size-7">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate("student-detail")}>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit student</DropdownMenuItem>
                          <DropdownMenuItem>Record payment</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        <div className="border-t px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Showing {filtered.length} of {students.length} students
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" disabled>
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button variant="outline" size="icon-sm" className="size-7 text-xs">1</Button>
            <Button variant="ghost" size="icon-sm" className="size-7 text-xs">2</Button>
            <Button variant="ghost" size="icon-sm" className="size-7 text-xs">3</Button>
            <Button variant="outline" size="icon-sm">
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
