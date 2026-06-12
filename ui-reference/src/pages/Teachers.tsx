import * as React from "react"
import { Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const teachers = [
  { id: 1, name: "Dr. Farhan Ali", phone: "01711-111222", specialty: "Physics, Chemistry", salary: "৳25,000", status: "active", batches: 3 },
  { id: 2, name: "Mst. Rina Begum", phone: "01812-222333", specialty: "Accounting, Finance", salary: "৳18,000", status: "active", batches: 2 },
  { id: 3, name: "Md. Kamal Uddin", phone: "01912-333444", specialty: "Mathematics", salary: "৳20,000", status: "active", batches: 4 },
  { id: 4, name: "Ms. Taslima Khatun", phone: "01611-444555", specialty: "Bengali, History", salary: "৳16,000", status: "active", batches: 2 },
  { id: 5, name: "Ms. Ritu Das", phone: "01511-555666", specialty: "Biology", salary: "৳18,000", status: "active", batches: 2 },
  { id: 6, name: "Md. Jahangir Alam", phone: "01711-666777", specialty: "English", salary: "৳15,000", status: "inactive", batches: 0 },
]

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
  }
  return <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">Inactive</span>
}

export function Teachers() {
  const { navigate } = useNav()
  const [search, setSearch] = React.useState("")

  const filtered = teachers.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.specialty.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {teachers.filter(t => t.status === "active").length} active ·{" "}
            {teachers.length} total
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate("teacher-detail")}>
          <Plus className="size-4" />
          New Teacher
        </Button>
      </div>

      <Card className="py-0 gap-0">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs h-9 font-medium pl-4">Teacher</TableHead>
                <TableHead className="text-xs h-9 font-medium">Phone</TableHead>
                <TableHead className="text-xs h-9 font-medium">Subject Specialty</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Batches</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Monthly Salary</TableHead>
                <TableHead className="text-xs h-9 font-medium">Status</TableHead>
                <TableHead className="h-9 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((teacher) => (
                <TableRow key={teacher.id} className="cursor-pointer" onClick={() => navigate("teacher-detail")}>
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-xs font-semibold bg-muted">
                          {teacher.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{teacher.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">{teacher.phone}</TableCell>
                  <TableCell className="py-3 text-sm">{teacher.specialty}</TableCell>
                  <TableCell className="py-3 text-sm text-right">{teacher.batches}</TableCell>
                  <TableCell className="py-3 text-sm font-medium text-right">{teacher.salary}</TableCell>
                  <TableCell className="py-3"><StatusBadge status={teacher.status} /></TableCell>
                  <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="size-7"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate("teacher-detail")}>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit teacher</DropdownMenuItem>
                        <DropdownMenuItem>Record salary</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        <div className="border-t px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {teachers.length} teachers</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" disabled><ChevronLeft className="size-3.5" /></Button>
            <Button variant="outline" size="icon-sm" className="size-7 text-xs">1</Button>
            <Button variant="outline" size="icon-sm"><ChevronRight className="size-3.5" /></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
