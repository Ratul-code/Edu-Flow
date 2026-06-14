import * as React from "react"
import { Search, MessageSquare, Mail, Smartphone, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const logs = [
  { id: 1, recipient: "Rashed Karim", phone: "01711-234567", channel: "SMS", preview: "Dear Mr. Islam, your child Rashed's monthly fee of ৳3,000 is due…", sentAt: "Jun 1, 2:14 PM", status: "delivered", campaign: "June Fee Reminder" },
  { id: 2, recipient: "Nadia Islam", phone: "01812-345678", channel: "SMS", preview: "Dear Mrs. Begum, your child Nadia's monthly fee of ৳2,500 is due…", sentAt: "Jun 1, 2:14 PM", status: "delivered", campaign: "June Fee Reminder" },
  { id: 3, recipient: "Tanvir Ahmed", phone: "01912-456789", channel: "SMS", preview: "Dear Mr. Ahmed, your child Tanvir's monthly fee of ৳2,000 is due…", sentAt: "Jun 1, 2:15 PM", status: "delivered", campaign: "June Fee Reminder" },
  { id: 4, recipient: "Sadia Akter", phone: "01611-567890", channel: "SMS", preview: "Dear Mrs. Akter, your child Sadia's monthly fee of ৳1,800 is due…", sentAt: "Jun 1, 2:15 PM", status: "failed", campaign: "June Fee Reminder" },
  { id: 5, recipient: "Imran Hossain", phone: "01711-678901", channel: "SMS", preview: "Dear Mr. Hossain, your child Imran's monthly fee of ৳3,000 is due…", sentAt: "Jun 1, 2:16 PM", status: "delivered", campaign: "June Fee Reminder" },
  { id: 6, recipient: "Farida Begum", phone: "01512-789012", channel: "SMS", preview: "Dear Mrs. Karim, we have received ৳4,000 for Farida (Ref: TXN-0892)…", sentAt: "May 31, 11:02 AM", status: "delivered", campaign: "Payment Confirmation (Auto)" },
  { id: 7, recipient: "Rashed Karim", phone: "01711-234567", channel: "SMS", preview: "NOTICE: Rashed's account is in grace period. Fee due: ৳3,000…", sentAt: "May 28, 9:00 AM", status: "delivered", campaign: "Grace Period Warning (Auto)" },
  { id: 8, recipient: "SSC Science A", phone: "24 students", channel: "SMS", preview: "Dear Guardian, the SSC Science A class on May 28 has been rescheduled…", sentAt: "May 27, 4:30 PM", status: "delivered", campaign: "Batch Rescheduled" },
  { id: 9, recipient: "All Students", phone: "128 students", channel: "SMS", preview: "Dear Parent/Guardian, Edu Flow Academy will remain closed on May 20…", sentAt: "May 19, 8:00 AM", status: "partial", campaign: "Holiday Notice" },
  { id: 10, recipient: "Mitu Khatun", phone: "01911-901234", channel: "SMS", preview: "Dear Mrs. Rahman, we have received ৳2,200 for Mitu (Ref: TXN-0801)…", sentAt: "May 18, 3:15 PM", status: "delivered", campaign: "Payment Confirmation (Auto)" },
]

function ChannelBadge({ channel }: { channel: string }) {
  const map: Record<string, { icon: React.ElementType; cls: string }> = {
    SMS: { icon: MessageSquare, cls: "bg-primary/10 text-primary border-primary/20" },
    Email: { icon: Mail, cls: "bg-blue-500/10 text-blue-600 border-blue-200" },
    WhatsApp: { icon: Smartphone, cls: "bg-green-500/10 text-green-600 border-green-200" },
  }
  const cfg = map[channel]
  if (!cfg) return <span className="text-xs text-muted-foreground">{channel}</span>
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>
      <Icon className="size-3" />
      {channel}
    </span>
  )
}

function DeliveryBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    delivered: { label: "Delivered", icon: CheckCircle2, cls: "text-success" },
    failed: { label: "Failed", icon: XCircle, cls: "text-destructive" },
    pending: { label: "Pending", icon: Clock, cls: "text-warning" },
    partial: { label: "Partial", icon: AlertTriangle, cls: "text-warning" },
  }
  const cfg = map[status] ?? { label: status, icon: Clock, cls: "text-muted-foreground" }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.cls}`}>
      <Icon className="size-3" />
      {cfg.label}
    </span>
  )
}

export function CommLogs() {
  const [search, setSearch] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.recipient.toLowerCase().includes(search.toLowerCase()) ||
      l.preview.toLowerCase().includes(search.toLowerCase()) ||
      l.campaign.toLowerCase().includes(search.toLowerCase())
    const matchChannel = channelFilter === "all" || l.channel.toLowerCase() === channelFilter
    const matchStatus = statusFilter === "all" || l.status === statusFilter
    return matchSearch && matchChannel && matchStatus
  })

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold">Communication Logs</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {logs.filter(l => l.status === "delivered").length} delivered ·{" "}
          {logs.filter(l => l.status === "failed").length} failed ·{" "}
          {logs.filter(l => l.status === "partial").length} partial
        </p>
      </div>

      <Card className="py-0 gap-0">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
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
              <SelectTrigger size="sm" className="w-[120px]">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs h-9 font-medium pl-4">Recipient</TableHead>
                <TableHead className="text-xs h-9 font-medium">Channel</TableHead>
                <TableHead className="text-xs h-9 font-medium">Message Preview</TableHead>
                <TableHead className="text-xs h-9 font-medium">Campaign</TableHead>
                <TableHead className="text-xs h-9 font-medium">Sent At</TableHead>
                <TableHead className="text-xs h-9 font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[9px] bg-muted">
                          {log.recipient.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{log.recipient}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{log.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <ChannelBadge channel={log.channel} />
                  </TableCell>
                  <TableCell className="py-3 max-w-[240px]">
                    <p className="text-xs text-muted-foreground truncate">{log.preview}</p>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs text-muted-foreground">{log.campaign}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{log.sentAt}</span>
                  </TableCell>
                  <TableCell className="py-3">
                    <DeliveryBadge status={log.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    No logs found.
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
