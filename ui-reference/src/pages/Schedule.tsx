import * as React from "react"
import { Search, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const schedule = [
  { day: "Saturday", time: "4:00 PM – 6:00 PM", batch: "SSC Science A", subject: "Physics", teacher: "Dr. Farhan Ali", room: "Room 1", status: "active" },
  { day: "Saturday", time: "6:00 PM – 8:00 PM", batch: "HSC Commerce B", subject: "Accounting", teacher: "Mst. Rina Begum", room: "Room 2", status: "active" },
  { day: "Sunday", time: "10:00 AM – 12:00 PM", batch: "Class 8 Math", subject: "Mathematics", teacher: "Md. Kamal Uddin", room: "Room 3", status: "active" },
  { day: "Sunday", time: "3:00 PM – 5:00 PM", batch: "SSC Arts C", subject: "Bengali", teacher: "Ms. Taslima Khatun", room: "Room 1", status: "active" },
  { day: "Monday", time: "4:00 PM – 6:00 PM", batch: "SSC Science A", subject: "Chemistry", teacher: "Dr. Farhan Ali", room: "Room 1", status: "active" },
  { day: "Monday", time: "6:00 PM – 8:00 PM", batch: "HSC Science A", subject: "Physics", teacher: "Dr. Farhan Ali", room: "Room 2", status: "active" },
  { day: "Tuesday", time: "4:00 PM – 6:00 PM", batch: "Class 9 Science", subject: "Science", teacher: "Ms. Ritu Das", room: "Room 3", status: "active" },
  { day: "Wednesday", time: "4:00 PM – 5:30 PM", batch: "SSC Science A", subject: "Biology", teacher: "Ms. Ritu Das", room: "Room 3", status: "active" },
  { day: "Wednesday", time: "6:00 PM – 8:00 PM", batch: "HSC Commerce B", subject: "Finance", teacher: "Mst. Rina Begum", room: "Room 2", status: "cancelled" },
  { day: "Thursday", time: "10:00 AM – 12:00 PM", batch: "Class 8 Math", subject: "Mathematics", teacher: "Md. Kamal Uddin", room: "Room 3", status: "active" },
]

const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export function Schedule() {
  const [search, setSearch] = React.useState("")

  const filtered = schedule.filter(
    (s) =>
      s.batch.toLowerCase().includes(search.toLowerCase()) ||
      s.teacher.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{schedule.length} sessions per week</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Create Session
        </Button>
      </div>

      <Card className="py-0 gap-0">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search batch, teacher, subject..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger size="sm" className="w-[120px]">
                <SelectValue placeholder="All batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All batches</SelectItem>
                <SelectItem value="ssc-sci">SSC Science A</SelectItem>
                <SelectItem value="hsc-com">HSC Commerce B</SelectItem>
                <SelectItem value="class8">Class 8 Math</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger size="sm" className="w-[130px]">
                <SelectValue placeholder="All teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All teachers</SelectItem>
                <SelectItem value="farhan">Dr. Farhan Ali</SelectItem>
                <SelectItem value="rina">Mst. Rina Begum</SelectItem>
                <SelectItem value="kamal">Md. Kamal Uddin</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger size="sm" className="w-[110px]">
                <SelectValue placeholder="All days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All days</SelectItem>
                {days.map((d) => (
                  <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs h-9 font-medium pl-4">Day</TableHead>
                <TableHead className="text-xs h-9 font-medium">Time</TableHead>
                <TableHead className="text-xs h-9 font-medium">Batch</TableHead>
                <TableHead className="text-xs h-9 font-medium">Subject</TableHead>
                <TableHead className="text-xs h-9 font-medium">Teacher</TableHead>
                <TableHead className="text-xs h-9 font-medium">Room</TableHead>
                <TableHead className="text-xs h-9 font-medium">Status</TableHead>
                <TableHead className="h-9 w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((session, i) => (
                <TableRow key={i}>
                  <TableCell className="py-3 pl-4">
                    <Badge variant="outline" className="text-xs font-medium">{session.day}</Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="size-3.5 text-muted-foreground" />
                      {session.time}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm font-medium">{session.batch}</TableCell>
                  <TableCell className="py-3 text-sm">{session.subject}</TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">{session.teacher}</TableCell>
                  <TableCell className="py-3">
                    <Badge variant="secondary" className="text-xs font-normal">{session.room}</Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    {session.status === "active" ? (
                      <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Cancelled</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="xs" className="text-xs">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
