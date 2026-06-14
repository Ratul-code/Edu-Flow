import * as React from "react"
import {
  ChevronLeft, Edit2, Copy, Trash2, Pause, Play, MessageSquare,
  Clock, CheckCircle2, AlertCircle, ArrowRight, Users, Calendar,
  TrendingUp, CreditCard, BookOpen, RefreshCw, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { CommNavFn } from "./CommCenter"

interface AutomationDetail {
  id: number
  name: string
  description: string
  trigger: string
  triggerIcon: React.ElementType
  conditions: string[]
  recipient: string
  recipientCount: number
  channel: string
  message: string
  timing: string
  status: "active" | "paused"
  lastRun: string
  lastModified: string
  totalSent: number
  successRate: number
  failedRuns: number
  history: { date: string; triggered: number; sent: number; failed: number; status: "success" | "partial" | "failed" }[]
}

const DETAIL_DATA: Record<number, AutomationDetail> = {
  1: {
    id: 1, name: "Payment Received", description: "Sends a confirmation SMS to the guardian immediately after a payment is recorded in the system.",
    trigger: "Payment Recorded", triggerIcon: CreditCard, conditions: ["Payment Status is Paid"],
    recipient: "Guardian's phone", recipientCount: 115, channel: "SMS",
    message: "Dear {{guardian_name}}, we received ৳{{amount}} for {{student_name}} for {{month}}. Thank you! - Edu Flow Academy",
    timing: "Immediately after payment recorded",
    status: "active", lastRun: "2 hours ago", lastModified: "Jun 2, 2025", totalSent: 248, successRate: 99, failedRuns: 2,
    history: [
      { date: "Jun 5, 2025 2:10 PM", triggered: 3, sent: 3, failed: 0, status: "success" },
      { date: "Jun 4, 2025 11:42 AM", triggered: 2, sent: 2, failed: 0, status: "success" },
      { date: "Jun 3, 2025 4:15 PM", triggered: 1, sent: 1, failed: 0, status: "success" },
      { date: "Jun 2, 2025 9:00 AM", triggered: 5, sent: 4, failed: 1, status: "partial" },
      { date: "Jun 1, 2025 3:30 PM", triggered: 7, sent: 7, failed: 0, status: "success" },
    ],
  },
  2: {
    id: 2, name: "Fee Due Reminder", description: "Sends a reminder to guardians on the day the monthly fee becomes due.",
    trigger: "Fee Due Date Reached", triggerIcon: Calendar, conditions: ["Payment Status is Unpaid", "Student Status is Active"],
    recipient: "Guardian's phone", recipientCount: 115, channel: "SMS",
    message: "Dear {{guardian_name}}, {{student_name}}'s fee of ৳{{amount}} is due by {{due_date}}. Please pay at the academy. - Edu Flow",
    timing: "On due date at 9:00 AM",
    status: "active", lastRun: "1 day ago", lastModified: "May 28, 2025", totalSent: 186, successRate: 97, failedRuns: 5,
    history: [
      { date: "Jun 1, 2025 9:00 AM", triggered: 128, sent: 124, failed: 4, status: "partial" },
      { date: "May 1, 2025 9:00 AM", triggered: 122, sent: 122, failed: 0, status: "success" },
      { date: "Apr 1, 2025 9:00 AM", triggered: 118, sent: 118, failed: 0, status: "success" },
    ],
  },
  3: {
    id: 3, name: "Grace Period Reminder", description: "Follow-up reminder sent 3 days after the due date for unpaid students.",
    trigger: "3 Days After Due Date", triggerIcon: Clock, conditions: ["Payment Status is Unpaid"],
    recipient: "Guardian's phone", recipientCount: 18, channel: "SMS",
    message: "Dear {{guardian_name}}, {{student_name}}'s fee is 3 days overdue. Amount: ৳{{amount}}. Please pay soon. - Edu Flow",
    timing: "3 days after due date at 10:00 AM",
    status: "active", lastRun: "3 days ago", lastModified: "May 15, 2025", totalSent: 62, successRate: 95, failedRuns: 3,
    history: [
      { date: "Jun 4, 2025 10:00 AM", triggered: 18, sent: 17, failed: 1, status: "partial" },
      { date: "May 4, 2025 10:00 AM", triggered: 14, sent: 14, failed: 0, status: "success" },
    ],
  },
  4: {
    id: 4, name: "Overdue Warning", description: "Sends a strong warning when fee is more than 7 days overdue.",
    trigger: "7 Days Overdue", triggerIcon: AlertTriangle, conditions: ["Payment Status is Unpaid", "Days Overdue greater than 7"],
    recipient: "Guardian's phone", recipientCount: 6, channel: "SMS",
    message: "NOTICE: {{student_name}}'s fee is overdue. Amount: ৳{{amount}}. Please pay immediately to avoid class suspension. - Edu Flow",
    timing: "7 days after due date at 9:00 AM",
    status: "active", lastRun: "5 days ago", lastModified: "May 10, 2025", totalSent: 24, successRate: 100, failedRuns: 0,
    history: [
      { date: "Jun 8, 2025 9:00 AM", triggered: 6, sent: 6, failed: 0, status: "success" },
      { date: "May 8, 2025 9:00 AM", triggered: 4, sent: 4, failed: 0, status: "success" },
    ],
  },
  5: {
    id: 5, name: "Exam Reminder", description: "Sends exam schedule reminder to students and guardians 1 day before the exam.",
    trigger: "1 Day Before Exam", triggerIcon: BookOpen, conditions: [],
    recipient: "Both (student + guardian)", recipientCount: 230, channel: "SMS",
    message: "Dear {{guardian_name}}, {{student_name}}'s exam is scheduled for {{due_date}}. Please ensure timely attendance. - Edu Flow",
    timing: "1 day before exam at 9:00 AM",
    status: "paused", lastRun: "12 days ago", lastModified: "Apr 28, 2025", totalSent: 143, successRate: 94, failedRuns: 9,
    history: [
      { date: "Jun 2, 2025 9:00 AM", triggered: 45, sent: 42, failed: 3, status: "partial" },
      { date: "May 28, 2025 9:00 AM", triggered: 38, sent: 38, failed: 0, status: "success" },
    ],
  },
  6: {
    id: 6, name: "Batch Rescheduled", description: "Notifies guardians when a class is rescheduled.",
    trigger: "Batch Rescheduled", triggerIcon: RefreshCw, conditions: [],
    recipient: "Guardian's phone", recipientCount: 24, channel: "SMS",
    message: "Dear {{guardian_name}}, {{student_name}}'s batch has been rescheduled. Please check the updated schedule. - Edu Flow",
    timing: "Immediately after reschedule",
    status: "paused", lastRun: "18 days ago", lastModified: "Apr 20, 2025", totalSent: 31, successRate: 100, failedRuns: 0,
    history: [
      { date: "May 28, 2025 4:30 PM", triggered: 24, sent: 24, failed: 0, status: "success" },
    ],
  },
}

interface CommAutomationDetailProps {
  id: number
  onNavigate: CommNavFn
}

function RunStatusBadge({ status }: { status: "success" | "partial" | "failed" }) {
  return status === "success" ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
      <CheckCircle2 className="size-3" /> Success
    </span>
  ) : status === "partial" ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
      <AlertCircle className="size-3" /> Partial
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
      <AlertCircle className="size-3" /> Failed
    </span>
  )
}

export function CommAutomationDetail({ id, onNavigate }: CommAutomationDetailProps) {
  const [isActive, setIsActive] = React.useState(
    DETAIL_DATA[id]?.status === "active"
  )
  const detail = DETAIL_DATA[id] ?? DETAIL_DATA[1]
  const TriggerIcon = detail.triggerIcon

  return (
    <div className="p-6 space-y-5">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onNavigate("automations")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <ChevronLeft className="size-4" />
            Automations
          </button>
          <div className="h-5 w-px bg-border mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{detail.name}</h1>
              <div className="flex items-center gap-1.5">
                <Switch checked={isActive} onCheckedChange={setIsActive} className="scale-75" />
                <span className={cn("text-xs font-medium", isActive ? "text-success" : "text-muted-foreground")}>
                  {isActive ? "Active" : "Paused"}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{detail.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => onNavigate("automations-edit", id)}>
            <Edit2 className="size-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <Copy className="size-3.5" /> Duplicate
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setIsActive(a => !a)}>
            {isActive ? <><Pause className="size-3.5" /> Pause</> : <><Play className="size-3.5" /> Resume</>}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive">
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sent", value: detail.totalSent.toString(), icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
          { label: "Success Rate", value: `${detail.successRate}%`, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
          { label: "Failed Runs", value: detail.failedRuns.toString(), icon: AlertCircle, color: detail.failedRuns > 0 ? "text-destructive" : "text-success", bg: detail.failedRuns > 0 ? "bg-destructive/10" : "bg-success/10" },
          { label: "Last Run", value: detail.lastRun, icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="py-3 gap-0">
            <CardContent className="px-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{label}</span>
                <div className={cn("flex size-6 items-center justify-center rounded-md", bg)}>
                  <Icon className={cn("size-3", color)} />
                </div>
              </div>
              <div className="text-lg font-bold tracking-tight">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Workflow diagram */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="py-0 gap-0">
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-sm font-semibold">Workflow</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {[
                  {
                    step: "TRIGGER",
                    value: detail.trigger,
                    icon: TriggerIcon,
                    color: "text-primary",
                    bg: "bg-primary/10",
                    sublabel: `Fires when: ${detail.trigger.toLowerCase()}`,
                  },
                  {
                    step: "CONDITIONS",
                    value: detail.conditions.length > 0 ? detail.conditions.join(` AND `) : "No conditions — runs for all active students",
                    icon: CheckCircle2,
                    color: "text-success",
                    bg: "bg-success/10",
                    sublabel: null,
                  },
                  {
                    step: "RECIPIENTS",
                    value: `${detail.recipient} · ~${detail.recipientCount} numbers`,
                    icon: Users,
                    color: "text-info",
                    bg: "bg-info/10",
                    sublabel: null,
                  },
                  {
                    step: "CHANNEL",
                    value: "SMS via SSL Wireless",
                    icon: MessageSquare,
                    color: "text-primary",
                    bg: "bg-primary/10",
                    sublabel: null,
                  },
                  {
                    step: "TIMING",
                    value: detail.timing,
                    icon: Clock,
                    color: "text-warning",
                    bg: "bg-warning/10",
                    sublabel: `Last modified: ${detail.lastModified}`,
                  },
                ].map((row, i, arr) => {
                  const Icon = row.icon
                  return (
                    <React.Fragment key={row.step}>
                      <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 bg-card">
                        <div className={cn("flex size-8 items-center justify-center rounded-lg shrink-0", row.bg)}>
                          <Icon className={cn("size-4", row.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">{row.step}</p>
                          <p className="text-sm font-medium mt-0.5 truncate">{row.value}</p>
                          {row.sublabel && <p className="text-xs text-muted-foreground mt-0.5">{row.sublabel}</p>}
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex items-center gap-1 pl-7">
                          <div className="w-px h-3 bg-border ml-3" />
                          <ArrowRight className="size-3 text-muted-foreground" />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Execution history */}
          <Card className="py-0 gap-0">
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-sm font-semibold">Execution History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-9 font-medium pl-4">Date</TableHead>
                    <TableHead className="text-xs h-9 font-medium text-right">Triggered</TableHead>
                    <TableHead className="text-xs h-9 font-medium text-right">Sent</TableHead>
                    <TableHead className="text-xs h-9 font-medium text-right">Failed</TableHead>
                    <TableHead className="text-xs h-9 font-medium">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.history.map((run, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-2.5 pl-4 text-sm text-muted-foreground">{run.date}</TableCell>
                      <TableCell className="py-2.5 text-sm text-right">{run.triggered}</TableCell>
                      <TableCell className="py-2.5 text-sm text-right text-success font-medium">{run.sent}</TableCell>
                      <TableCell className="py-2.5 text-sm text-right text-destructive font-medium">{run.failed || "—"}</TableCell>
                      <TableCell className="py-2.5"><RunStatusBadge status={run.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right: Message preview + delivery stats */}
        <div className="space-y-4">
          {/* Message preview */}
          <Card className="py-0 gap-0">
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-sm font-semibold">Message Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-center mb-3">
                <div className="w-[140px]">
                  <div className="bg-foreground rounded-[1.8rem] p-1.5 shadow-lg">
                    <div className="bg-background rounded-[1.5rem] overflow-hidden">
                      <div className="flex justify-center pt-2 pb-1">
                        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
                      </div>
                      <div className="px-1.5 pb-3 min-h-[200px]">
                        <div className="flex items-center gap-1.5 py-1.5 border-b border-border/50 mb-2">
                          <div className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                            <MessageSquare className="size-2.5 text-primary" />
                          </div>
                          <p className="text-[8px] font-semibold">Edu Flow</p>
                        </div>
                        <div className="bg-muted rounded-lg rounded-tl-sm px-2 py-1.5 mx-0.5">
                          <p className="text-[8px] leading-relaxed">{detail.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 border-t border-border pt-3 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Characters</span>
                  <span className="font-medium">{detail.message.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">SMS parts</span>
                  <span className="font-medium">{Math.ceil(detail.message.length / 160)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Est. recipients</span>
                  <span className="font-medium">{detail.recipientCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery stats */}
          <Card className="py-0 gap-0">
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-sm font-semibold">Delivery Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { label: "Delivered", pct: detail.successRate, color: "bg-success" },
                { label: "Failed", pct: 100 - detail.successRate, color: "bg-destructive" },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-md bg-muted/40 px-3 py-2 text-center">
                  <div className="text-base font-bold text-success">{detail.totalSent}</div>
                  <div className="text-[10px] text-muted-foreground">Total sent</div>
                </div>
                <div className="rounded-md bg-muted/40 px-3 py-2 text-center">
                  <div className="text-base font-bold text-destructive">{detail.failedRuns}</div>
                  <div className="text-[10px] text-muted-foreground">Failed runs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
