import * as React from "react"
import { Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNav } from "@/nav-context"

const batches = [
  { id: 1, name: "SSC Science A", subject: "Physics, Chemistry", classLevel: "SSC", medium: "Bangla", group: "Science", fee: "৳3,000", students: 24, status: "active" },
  { id: 2, name: "HSC Commerce B", subject: "Accounting, Finance", classLevel: "HSC", medium: "Bangla", group: "Commerce", fee: "৳2,500", students: 18, status: "active" },
  { id: 3, name: "SSC Arts C", subject: "Bengali, History", classLevel: "SSC", medium: "Bangla", group: "Arts", fee: "৳2,000", students: 22, status: "active" },
  { id: 4, name: "Class 8 Math", subject: "Mathematics", classLevel: "Class 8", medium: "Bangla", group: "General", fee: "৳1,800", students: 30, status: "active" },
  { id: 5, name: "HSC Science A", subject: "Physics, Chemistry, Biology", classLevel: "HSC", medium: "English", group: "Science", fee: "৳4,000", students: 19, status: "active" },
  { id: 6, name: "Class 9 Science", subject: "Science, Math", classLevel: "Class 9", medium: "Bangla", group: "Science", fee: "৳2,200", students: 28, status: "active" },
  { id: 7, name: "SSC Commerce B", subject: "Accounting", classLevel: "SSC", medium: "Bangla", group: "Commerce", fee: "৳2,000", students: 15, status: "inactive" },
  { id: 8, name: "HSC Arts A", subject: "Bengali, English, History", classLevel: "HSC", medium: "Bangla", group: "Arts", fee: "৳2,200", students: 16, status: "active" },
]

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
  }
  return <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">Inactive</span>
}

export function Batches() {
  const { navigate } = useNav()
  const [search, setSearch] = React.useState("")

  const filtered = batches.filter(
    (b) => b.name.toLowerCase().includes(search.toLowerCase()) || b.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Batches</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {batches.filter(b => b.status === "active").length} active ·{" "}
            {batches.reduce((a, b) => a + b.students, 0)} total students
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate("batch-detail")}>
          <Plus className="size-4" />
          Create Batch
        </Button>
      </div>

      <Card className="py-0 gap-0">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search batches..."
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
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
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
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs h-9 font-medium pl-4">Batch Name</TableHead>
                <TableHead className="text-xs h-9 font-medium">Subject</TableHead>
                <TableHead className="text-xs h-9 font-medium">Class</TableHead>
                <TableHead className="text-xs h-9 font-medium">Medium</TableHead>
                <TableHead className="text-xs h-9 font-medium">Group</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Monthly Fee</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Students</TableHead>
                <TableHead className="text-xs h-9 font-medium">Status</TableHead>
                <TableHead className="h-9 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((batch) => (
                <TableRow
                  key={batch.id}
                  className="cursor-pointer"
                  onClick={() => navigate("batch-detail")}
                >
                  <TableCell className="py-3 pl-4 font-medium text-sm">{batch.name}</TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground max-w-[160px] truncate">{batch.subject}</TableCell>
                  <TableCell className="py-3 text-sm">{batch.classLevel}</TableCell>
                  <TableCell className="py-3 text-sm">{batch.medium}</TableCell>
                  <TableCell className="py-3 text-sm">{batch.group}</TableCell>
                  <TableCell className="py-3 text-sm font-medium text-right">{batch.fee}</TableCell>
                  <TableCell className="py-3 text-sm text-right">{batch.students}</TableCell>
                  <TableCell className="py-3">
                    <StatusBadge status={batch.status} />
                  </TableCell>
                  <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="size-7">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate("batch-detail")}>View batch</DropdownMenuItem>
                        <DropdownMenuItem>Edit batch</DropdownMenuItem>
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
          <span className="text-xs text-muted-foreground">Showing {filtered.length} of {batches.length} batches</span>
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
