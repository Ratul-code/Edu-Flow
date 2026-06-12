import * as React from "react"
import { Search, Plus, Bell, Mail, Megaphone, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const notifications = [
  { id: 1, title: "June Fee Reminder", audience: "All Students", channel: "SMS", status: "sent", date: "Jun 1, 2025", recipients: 128, type: "fee" },
  { id: 2, title: "Batch Rescheduled – SSC Science A", audience: "SSC Science A", channel: "SMS", status: "sent", date: "May 28, 2025", recipients: 24, type: "schedule" },
  { id: 3, title: "Teacher Vacancy Announcement", audience: "All", channel: "Email", status: "draft", date: "Jun 5, 2025", recipients: 0, type: "general" },
  { id: 4, title: "Overdue Fee Warning", audience: "Due Students", channel: "SMS + App", status: "scheduled", date: "Jun 10, 2025", recipients: 18, type: "fee" },
  { id: 5, title: "Holiday Notice – Eid-ul-Adha", audience: "All", channel: "SMS", status: "sent", date: "May 20, 2025", recipients: 128, type: "general" },
  { id: 6, title: "Exam Schedule – June Batch Test", audience: "SSC Students", channel: "App", status: "sent", date: "May 15, 2025", recipients: 61, type: "exam" },
]

const typeIcons: Record<string, React.ElementType> = {
  fee: Bell,
  schedule: Bell,
  general: Megaphone,
  exam: Bell,
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    sent: { label: "Sent", className: "bg-success/10 text-success border-success/20" },
    draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
    scheduled: { label: "Scheduled", className: "bg-info/10 text-info border-info/20" },
    failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20" },
  }
  const c = map[status] ?? { label: status, className: "" }
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${c.className}`}>{c.label}</span>
}

export function NotificationsPage() {
  const [search, setSearch] = React.useState("")

  const filtered = notifications.filter(
    (n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.audience.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {notifications.filter(n => n.status === "sent").length} sent ·{" "}
            {notifications.filter(n => n.status === "scheduled").length} scheduled ·{" "}
            {notifications.filter(n => n.status === "draft").length} drafts
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New Notification
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sent", value: "3", icon: Bell, className: "text-success" },
          { label: "Scheduled", value: "1", icon: Bell, className: "text-info" },
          { label: "Drafts", value: "1", icon: Mail, className: "text-muted-foreground" },
          { label: "Recipients Reached", value: "341", icon: Users, className: "text-primary" },
        ].map(({ label, value, icon: Icon, className }) => (
          <Card key={label} className="py-4 gap-2">
            <CardContent className="px-4 pt-0">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-muted-foreground">{label}</div>
                <Icon className={`size-3.5 ${className}`} />
              </div>
              <div className="text-xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="py-0 gap-0">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select>
              <SelectTrigger size="sm" className="w-[110px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="fee">Fee</SelectItem>
                <SelectItem value="schedule">Schedule</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger size="sm" className="w-[110px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs h-9 font-medium pl-4">Title</TableHead>
                <TableHead className="text-xs h-9 font-medium">Audience</TableHead>
                <TableHead className="text-xs h-9 font-medium">Channel</TableHead>
                <TableHead className="text-xs h-9 font-medium">Status</TableHead>
                <TableHead className="text-xs h-9 font-medium">Date</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Recipients</TableHead>
                <TableHead className="h-9 w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((notif) => {
                const Icon = typeIcons[notif.type] ?? Bell
                return (
                  <TableRow key={notif.id}>
                    <TableCell className="py-3 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                          <Icon className="size-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">{notif.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">{notif.audience}</TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-xs font-normal">{notif.channel}</Badge>
                    </TableCell>
                    <TableCell className="py-3"><StatusBadge status={notif.status} /></TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">{notif.date}</TableCell>
                    <TableCell className="py-3 text-sm text-right">{notif.recipients || "—"}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" className="text-xs">View</Button>
                        {notif.status === "draft" && (
                          <Button variant="ghost" size="xs" className="text-xs">Send</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
