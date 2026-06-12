import {
  ArrowLeft,
  Pencil,
  Archive,
  Users,
  Plus,
  Clock,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useNav } from "@/nav-context"

const assignedStudents = [
  { name: "Rashed Karim", phone: "01711-234567", classLevel: "SSC", since: "Jan 2024", feeStatus: "overdue" },
  { name: "Imran Hossain", phone: "01711-678901", classLevel: "SSC", since: "Mar 2024", feeStatus: "paid" },
  { name: "Farida Begum", phone: "01512-789012", classLevel: "SSC", since: "Jan 2024", feeStatus: "paid" },
  { name: "Mitu Khatun", phone: "01911-901234", classLevel: "SSC", since: "Feb 2024", feeStatus: "partial" },
  { name: "Arman Shaikh", phone: "01811-012345", classLevel: "SSC", since: "Apr 2024", feeStatus: "paid" },
]

const schedule = [
  { day: "Saturday", time: "4:00 PM – 6:00 PM", subject: "Physics", teacher: "Dr. Farhan Ali", room: "Room 1" },
  { day: "Monday", time: "4:00 PM – 6:00 PM", subject: "Chemistry", teacher: "Dr. Farhan Ali", room: "Room 1" },
  { day: "Wednesday", time: "4:00 PM – 5:30 PM", subject: "Biology", teacher: "Ms. Ritu Das", room: "Room 3" },
]

function FeeStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive border-destructive/20" },
    partial: { label: "Partial", className: "bg-info/10 text-info border-info/20" },
    paid: { label: "Paid", className: "bg-success/10 text-success border-success/20" },
    due: { label: "Due", className: "bg-warning/10 text-warning-foreground border-warning/20" },
  }
  const c = map[status] ?? { label: status, className: "" }
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${c.className}`}>{c.label}</span>
}

export function BatchDetail() {
  const { navigate } = useNav()

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground mb-3 -ml-2" onClick={() => navigate("batches")}>
          <ArrowLeft className="size-3.5" />
          Back to Batches
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">SSC Science A</h1>
                <span className="inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Batch ID: BAT-2024-001</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="size-3.5" />Edit Batch</Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive"><Archive className="size-3.5" />Archive</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Batch Profile */}
        <Card className="gap-4 py-5">
          <CardHeader className="px-5 pb-0 pt-0">
            <CardTitle className="text-sm font-semibold">Batch Profile</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pt-0 space-y-3">
            {[
              { label: "Class Level", value: "SSC" },
              { label: "Medium", value: "Bangla Medium" },
              { label: "Group", value: "Science" },
              { label: "Subjects", value: "Physics, Chemistry, Biology" },
              { label: "Monthly Fee", value: "৳3,000" },
              { label: "Active Students", value: "24 enrolled" },
              { label: "Created", value: "January 5, 2024" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-sm font-medium">{value}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {/* Assign Student */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0 flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Assign Student to Batch</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <div className="flex gap-2">
                <Input placeholder="Search student by name or phone..." className="h-8 text-sm flex-1" />
                <Button size="sm" className="gap-1.5"><Plus className="size-3.5" />Assign</Button>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0 flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Enrolled Students</CardTitle>
                <CardDescription className="text-xs mt-0.5">24 students enrolled</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-2">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 font-medium">Student</TableHead>
                    <TableHead className="text-xs h-8 font-medium">Class</TableHead>
                    <TableHead className="text-xs h-8 font-medium">Since</TableHead>
                    <TableHead className="text-xs h-8 font-medium">Fee Status</TableHead>
                    <TableHead className="h-8 w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedStudents.map((s) => (
                    <TableRow key={s.name} className="cursor-pointer" onClick={() => navigate("student-detail")}>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[10px] font-semibold bg-muted">
                              {s.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-sm">{s.classLevel}</TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground">{s.since}</TableCell>
                      <TableCell className="py-2.5"><FeeStatusBadge status={s.feeStatus} /></TableCell>
                      <TableCell className="py-2.5" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm" className="size-6 text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <Card className="gap-4 py-5">
            <CardHeader className="px-5 pb-0 pt-0 flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Weekly Schedule</CardTitle>
                <CardDescription className="text-xs mt-0.5">3 sessions per week</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Plus className="size-3" />
                Add Session
              </Button>
            </CardHeader>
            <CardContent className="px-5 pt-2 space-y-2">
              {schedule.map((s) => (
                <div key={s.day} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                      <Clock className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{s.day} · {s.time}</div>
                      <div className="text-xs text-muted-foreground">{s.subject} — {s.teacher}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-normal">{s.room}</Badge>
                    <Button variant="ghost" size="icon-sm" className="size-6 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
