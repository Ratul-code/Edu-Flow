import * as React from "react"
import { Search, Plus, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const campaigns = [
  { id: 1, name: "June Fee Reminder", channel: "SMS", audience: "All Students", recipients: 128, status: "sent", date: "Jun 1, 2025", deliveryRate: 99 },
  { id: 2, name: "Batch Rescheduled – SSC Science A", channel: "SMS", audience: "SSC Science A", recipients: 24, status: "sent", date: "May 28, 2025", deliveryRate: 100 },
  { id: 3, name: "Teacher Vacancy Announcement", channel: "Email", audience: "All", recipients: 0, status: "draft", date: "Jun 5, 2025", deliveryRate: 0 },
  { id: 4, name: "Overdue Fee Warning", channel: "SMS", audience: "Due Students", recipients: 18, status: "scheduled", date: "Jun 10, 2025", deliveryRate: 0 },
  { id: 5, name: "Holiday Notice – Eid-ul-Adha", channel: "SMS", audience: "All", recipients: 128, status: "sent", date: "May 20, 2025", deliveryRate: 97 },
  { id: 6, name: "Exam Schedule – June Batch Test", channel: "SMS", audience: "SSC Students", recipients: 61, status: "sent", date: "May 15, 2025", deliveryRate: 98 },
  { id: 7, name: "New Batch Announcement", channel: "SMS", audience: "All", recipients: 128, status: "sent", date: "Apr 30, 2025", deliveryRate: 96 },
  { id: 8, name: "Monthly Progress Report", channel: "Email", audience: "All Parents", recipients: 0, status: "draft", date: "Jun 8, 2025", deliveryRate: 0 },
]

function ChannelBadge({ channel }: { channel: string }) {
  const map: Record<string, string> = {
    SMS: "bg-primary/10 text-primary border-primary/20",
    Email: "bg-blue-500/10 text-blue-600 border-blue-200",
    WhatsApp: "bg-green-500/10 text-green-600 border-green-200",
    Push: "bg-orange-500/10 text-orange-600 border-orange-200",
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[channel] ?? "bg-muted text-muted-foreground border-border"}`}>
      {channel}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sent: "bg-success/10 text-success border-success/20",
    draft: "bg-muted text-muted-foreground border-border",
    scheduled: "bg-info/10 text-info border-info/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
  }
  const labels: Record<string, string> = { sent: "Sent", draft: "Draft", scheduled: "Scheduled", failed: "Failed" }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  )
}

export function CommCampaigns() {
  const [search, setSearch] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filtered = campaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.audience.toLowerCase().includes(search.toLowerCase())
    const matchChannel = channelFilter === "all" || c.channel.toLowerCase() === channelFilter
    const matchStatus = statusFilter === "all" || c.status === statusFilter
    return matchSearch && matchChannel && matchStatus
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Campaigns</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {campaigns.filter(c => c.status === "sent").length} sent ·{" "}
            {campaigns.filter(c => c.status === "scheduled").length} scheduled ·{" "}
            {campaigns.filter(c => c.status === "draft").length} drafts
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New Campaign
        </Button>
      </div>

      <Card className="py-0 gap-0">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger size="sm" className="w-[120px]">
                <SelectValue placeholder="All channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <TableHead className="text-xs h-9 font-medium pl-4">Campaign</TableHead>
                <TableHead className="text-xs h-9 font-medium">Channel</TableHead>
                <TableHead className="text-xs h-9 font-medium">Audience</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Recipients</TableHead>
                <TableHead className="text-xs h-9 font-medium">Status</TableHead>
                <TableHead className="text-xs h-9 font-medium">Date</TableHead>
                <TableHead className="text-xs h-9 font-medium text-right">Delivery</TableHead>
                <TableHead className="h-9 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="py-3 pl-4">
                    <span className="text-sm font-medium">{c.name}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <ChannelBadge channel={c.channel} />
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">{c.audience}</TableCell>
                  <TableCell className="py-3 text-sm text-right">{c.recipients > 0 ? c.recipients : "—"}</TableCell>
                  <TableCell className="py-3"><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">{c.date}</TableCell>
                  <TableCell className="py-3 text-right">
                    {c.deliveryRate > 0 ? (
                      <span className="text-sm font-medium text-success">{c.deliveryRate}%</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <Button variant="ghost" size="icon" className="size-7">
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                    No campaigns found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
