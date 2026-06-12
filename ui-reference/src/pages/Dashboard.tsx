import {
  Users,
  BookOpen,
  CreditCard,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
  UserPlus,
  BookPlus,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useNav } from "@/nav-context"

const metricCards = [
  {
    title: "Active Students",
    value: "128",
    change: "+6 this month",
    trend: "up",
    icon: Users,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    title: "Active Batches",
    value: "12",
    change: "+2 this month",
    trend: "up",
    icon: BookOpen,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    title: "Fee Collected",
    value: "৳1,85,000",
    change: "Jun 2025",
    trend: "up",
    icon: CreditCard,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    title: "Due Fee",
    value: "৳42,500",
    change: "18 students",
    trend: "down",
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
]

const dueStudents = [
  { name: "Rashed Karim", phone: "01711-234567", batch: "SSC Science A", due: "৳3,000", status: "overdue" },
  { name: "Nadia Islam", phone: "01812-345678", batch: "HSC Commerce B", due: "৳2,500", status: "due" },
  { name: "Tanvir Ahmed", phone: "01912-456789", batch: "SSC Arts C", due: "৳2,000", status: "partial" },
  { name: "Sadia Akter", phone: "01611-567890", batch: "Class 8 Math", due: "৳1,500", status: "overdue" },
  { name: "Imran Hossain", phone: "01711-678901", batch: "SSC Science A", due: "৳1,800", status: "due" },
]

const upcomingClasses = [
  { batch: "SSC Science A", subject: "Physics", teacher: "Dr. Farhan Ali", time: "Today 4:00 PM", students: 24 },
  { batch: "HSC Commerce B", subject: "Accounting", teacher: "Mst. Rina Begum", time: "Today 6:00 PM", students: 18 },
  { batch: "Class 8 Math", subject: "Mathematics", teacher: "Md. Kamal Uddin", time: "Tomorrow 10:00 AM", students: 30 },
  { batch: "SSC Arts C", subject: "Bengali", teacher: "Ms. Taslima Khatun", time: "Tomorrow 3:00 PM", students: 22 },
  { batch: "HSC Science A", subject: "Chemistry", teacher: "Dr. Farhan Ali", time: "Tomorrow 5:00 PM", students: 19 },
]

const quickActions = [
  { label: "New Student", icon: UserPlus, action: "students" as const },
  { label: "Create Batch", icon: BookPlus, action: "batches" as const },
  { label: "Record Fee", icon: CreditCard, action: "fees" as const },
  { label: "View Schedule", icon: Calendar, action: "schedule" as const },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    overdue: { label: "Overdue", className: "bg-destructive/15 text-destructive border-destructive/20" },
    due: { label: "Due", className: "bg-warning/15 text-warning-foreground border-warning/20" },
    partial: { label: "Partial", className: "bg-info/15 text-info border-info/20" },
  }
  const config = map[status] ?? { label: status, className: "" }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export function Dashboard() {
  const { navigate } = useNav()

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, Arif. Here's what's happening.</p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs font-medium">
          <Calendar className="size-3" />
          June 2025
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <Card key={card.title} className="gap-3 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  {card.title}
                </CardDescription>
                <div className={`flex size-8 items-center justify-center rounded-lg ${card.bg}`}>
                  <card.icon className={`size-4 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pt-0">
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {card.trend === "up" ? (
                  <TrendingUp className="size-3 text-success" />
                ) : (
                  <TrendingDown className="size-3 text-destructive" />
                )}
                <span className="text-xs text-muted-foreground">{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fee Collection Progress */}
      <Card className="py-5 gap-4">
        <CardHeader className="px-5 pb-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Fee Collection Progress</CardTitle>
              <CardDescription className="text-xs mt-0.5">June 2025 — ৳1,85,000 of ৳2,27,500 collected</CardDescription>
            </div>
            <span className="text-sm font-semibold text-success">81%</span>
          </div>
        </CardHeader>
        <CardContent className="px-5 pt-0">
          <Progress value={81} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>110 paid · 18 due · 5 overdue</span>
            <span>৳42,500 remaining</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Due Students */}
        <Card className="lg:col-span-2 gap-3 py-5">
          <CardHeader className="px-5 pb-0 pt-0 flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Students With Due Fees</CardTitle>
              <CardDescription className="text-xs mt-0.5">Requires immediate attention</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("fees")}>
              View all <ArrowRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="px-5 pt-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="text-xs h-8 font-medium">Student</TableHead>
                  <TableHead className="text-xs h-8 font-medium">Batch</TableHead>
                  <TableHead className="text-xs h-8 font-medium text-right">Due</TableHead>
                  <TableHead className="text-xs h-8 font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dueStudents.map((s) => (
                  <TableRow key={s.name} className="cursor-pointer" onClick={() => navigate("student-detail")}>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px] font-semibold bg-muted">
                            {s.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium leading-none">{s.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{s.phone}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground">{s.batch}</TableCell>
                    <TableCell className="py-2.5 text-sm font-medium text-right">{s.due}</TableCell>
                    <TableCell className="py-2.5">
                      <StatusBadge status={s.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <Card className="gap-3 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pt-2 grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-3 text-xs font-medium"
                  onClick={() => navigate(action.action)}
                >
                  <action.icon className="size-4 text-muted-foreground" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="gap-3 py-5">
            <CardHeader className="px-5 pb-0 pt-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Zap className="size-3.5 text-warning" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pt-2 space-y-2.5">
              {[
                { label: "Active Batches", value: "12 / 15 capacity", pct: 80 },
                { label: "Seat Utilization", value: "128 / 180 seats", pct: 71 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <Progress value={item.pct} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Classes */}
      <Card className="gap-3 py-5">
        <CardHeader className="px-5 pb-0 pt-0 flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Upcoming Classes</CardTitle>
            <CardDescription className="text-xs mt-0.5">Next 5 scheduled sessions</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("schedule")}>
            Full schedule <ArrowRight className="size-3" />
          </Button>
        </CardHeader>
        <CardContent className="px-5 pt-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-xs h-8 font-medium">Batch</TableHead>
                <TableHead className="text-xs h-8 font-medium">Subject</TableHead>
                <TableHead className="text-xs h-8 font-medium">Teacher</TableHead>
                <TableHead className="text-xs h-8 font-medium">Time</TableHead>
                <TableHead className="text-xs h-8 font-medium text-right">Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingClasses.map((c) => (
                <TableRow key={c.batch + c.time} onClick={() => navigate("schedule")} className="cursor-pointer">
                  <TableCell className="py-2.5 font-medium text-sm">{c.batch}</TableCell>
                  <TableCell className="py-2.5 text-sm">{c.subject}</TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground">{c.teacher}</TableCell>
                  <TableCell className="py-2.5">
                    <span className={`text-xs font-medium ${c.time.startsWith("Today") ? "text-info" : "text-muted-foreground"}`}>
                      {c.time}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-right">{c.students}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
