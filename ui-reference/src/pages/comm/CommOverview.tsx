import {
  MessageSquare,
  Clock,
  Zap,
  Users,
  ArrowRight,
  Megaphone,
  FileText,
  Settings2,
  Send,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Mail,
  Smartphone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type CommTab = "overview" | "sms" | "campaigns" | "templates" | "automations" | "logs" | "settings"

interface CommOverviewProps {
  onTabChange: (tab: CommTab) => void
}

const kpiCards = [
  {
    label: "Messages Sent",
    value: "1,284",
    change: "+12% this month",
    trend: "up",
    icon: Send,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Scheduled",
    value: "3",
    change: "Next: Jun 10",
    trend: "neutral",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    label: "Active Automations",
    value: "5",
    change: "All running",
    trend: "up",
    icon: Zap,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    label: "Recipients Reached",
    value: "892",
    change: "+48 this week",
    trend: "up",
    icon: Users,
    color: "text-success",
    bg: "bg-success/10",
  },
]

const recentCampaigns = [
  { name: "June Fee Reminder", channel: "SMS", audience: "All Students", recipients: 128, status: "sent", date: "Jun 1" },
  { name: "Batch Rescheduled – SSC Science A", channel: "SMS", audience: "SSC Science A", recipients: 24, status: "sent", date: "May 28" },
  { name: "Overdue Fee Warning", channel: "SMS", audience: "Due Students", recipients: 18, status: "scheduled", date: "Jun 10" },
  { name: "Teacher Vacancy Announcement", channel: "Email", audience: "All", recipients: 0, status: "draft", date: "Jun 5" },
]

const recentActivity = [
  { text: "June Fee Reminder sent to 128 students", time: "Jun 1, 2:14 PM", icon: CheckCircle2, color: "text-success" },
  { text: "Overdue Warning scheduled for Jun 10", time: "May 31, 9:00 AM", icon: Clock, color: "text-warning" },
  { text: "5 messages failed to deliver", time: "May 28, 7:30 PM", icon: AlertCircle, color: "text-destructive" },
  { text: "Holiday Notice sent to 128 students", time: "May 20, 11:00 AM", icon: CheckCircle2, color: "text-success" },
]

const automationStatus = [
  { name: "Payment Received", trigger: "On payment", status: "active", lastRun: "2h ago", sent: 24 },
  { name: "Fee Reminder (Day 1)", trigger: "Due date", status: "active", lastRun: "1d ago", sent: 18 },
  { name: "Overdue Warning", trigger: "+7 days overdue", status: "active", lastRun: "3d ago", sent: 6 },
  { name: "Exam Reminder", trigger: "1 day before exam", status: "paused", lastRun: "5d ago", sent: 0 },
]

const channels = [
  {
    id: "sms",
    name: "SMS",
    icon: MessageSquare,
    status: "active",
    description: "Send text messages to students and guardians",
    stats: "1,284 sent · 99% delivery",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: Smartphone,
    status: "soon",
    description: "Rich messages with media and quick replies",
    stats: "Coming soon",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    status: "soon",
    description: "Send formatted emails and newsletters",
    stats: "Coming soon",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
]

function CampaignStatusBadge({ status }: { status: string }) {
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

export function CommOverview({ onTabChange }: CommOverviewProps) {
  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map(({ label, value, change, trend, icon: Icon, color, bg }) => (
          <Card key={label} className="py-4 gap-2">
            <CardContent className="px-4 pt-0">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground font-medium">{label}</div>
                <div className={`flex size-7 items-center justify-center rounded-md ${bg}`}>
                  <Icon className={`size-3.5 ${color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight">{value}</div>
              <div className={`text-xs mt-0.5 flex items-center gap-1 ${trend === "up" ? "text-success" : "text-muted-foreground"}`}>
                {trend === "up" && <TrendingUp className="size-3" />}
                {change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Channel Breakdown */}
        <div className="lg:col-span-1 space-y-3">
          <div>
            <h2 className="text-sm font-semibold">Channels</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Connected communication channels</p>
          </div>
          <div className="space-y-2">
            {channels.map((ch) => {
              const Icon = ch.icon
              return (
                <Card key={ch.id} className={`py-3 gap-0 ${ch.status === "soon" ? "opacity-60" : ""}`}>
                  <CardContent className="px-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex size-8 items-center justify-center rounded-lg mt-0.5 ${ch.bg}`}>
                        <Icon className={`size-4 ${ch.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{ch.name}</span>
                          {ch.status === "active" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
                              <span className="size-1.5 rounded-full bg-success inline-block" />
                              Active
                            </span>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{ch.description}</p>
                        <p className="text-xs font-medium mt-1.5 text-muted-foreground">{ch.stats}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="pt-1">
            <h2 className="text-sm font-semibold mb-2">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "New Campaign", icon: Megaphone, tab: "campaigns" as CommTab },
                { label: "Send SMS", icon: MessageSquare, tab: "sms" as CommTab },
                { label: "Create Template", icon: FileText, tab: "templates" as CommTab },
                { label: "Automations", icon: Settings2, tab: "automations" as CommTab },
              ].map(({ label, icon: Icon, tab }) => (
                <button
                  key={label}
                  onClick={() => onTabChange(tab)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <Icon className="size-3.5 text-primary shrink-0" />
                  <span className="text-xs leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Campaigns + Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Campaigns */}
          <Card className="py-0 gap-0">
            <CardHeader className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Recent Campaigns</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Last 30 days</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 gap-1 text-primary"
                  onClick={() => onTabChange("campaigns")}
                >
                  View all <ArrowRight className="size-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentCampaigns.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate">{c.name}</span>
                        <ChannelBadge channel={c.channel} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.audience}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">{c.date}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">{c.recipients > 0 ? `${c.recipients} recipients` : "—"}</span>
                      <CampaignStatusBadge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Automation Status + Recent Activity side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Automation Status */}
            <Card className="py-0 gap-0">
              <CardHeader className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Automations</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 gap-1 text-primary"
                    onClick={() => onTabChange("automations")}
                  >
                    Manage <ArrowRight className="size-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {automationStatus.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{a.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{a.trigger}</div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        {a.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
                            <span className="size-1.5 rounded-full bg-success inline-block" />
                            On
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                            <span className="size-1.5 rounded-full bg-muted-foreground inline-block" />
                            Off
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{a.lastRun}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="py-0 gap-0">
              <CardHeader className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 gap-1 text-primary"
                    onClick={() => onTabChange("logs")}
                  >
                    View logs <ArrowRight className="size-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentActivity.map((a, i) => {
                    const Icon = a.icon
                    return (
                      <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                        <Icon className={`size-3.5 mt-0.5 shrink-0 ${a.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-snug">{a.text}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
