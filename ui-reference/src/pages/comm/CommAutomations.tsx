import * as React from "react"
import {
  Plus, Zap, Clock, MessageSquare, Mail, Smartphone,
  Pause, MoreHorizontal, ArrowRight, Send,
  TrendingUp, AlertCircle, CheckCircle2, Edit2, Copy, Trash2,
  CreditCard, Calendar, AlertTriangle, GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { CommNavFn } from "./CommCenter"

interface Automation {
  id: number
  name: string
  description: string
  trigger: string
  triggerIcon: React.ElementType
  triggerColor: string
  channels: ("sms" | "whatsapp" | "email")[]
  recipientType: string
  status: "active" | "paused"
  lastRun: string
  messagesSent: number
  successRate: number
}

const AUTOMATIONS: Automation[] = [
  {
    id: 1,
    name: "Payment Received",
    description: "Send a confirmation message when a student fee payment is recorded",
    trigger: "Payment Recorded",
    triggerIcon: CreditCard,
    triggerColor: "text-emerald-600 bg-emerald-500/10",
    channels: ["sms"],
    recipientType: "Guardian",
    status: "active",
    lastRun: "2h ago",
    messagesSent: 248,
    successRate: 99,
  },
  {
    id: 2,
    name: "Fee Due Reminder",
    description: "Remind guardians on the fee due date if payment hasn't been made",
    trigger: "Due Date Reached",
    triggerIcon: Calendar,
    triggerColor: "text-blue-600 bg-blue-500/10",
    channels: ["sms"],
    recipientType: "Guardian",
    status: "active",
    lastRun: "1d ago",
    messagesSent: 186,
    successRate: 97,
  },
  {
    id: 3,
    name: "Grace Period Reminder",
    description: "Follow-up reminder 3 days after due date if still unpaid",
    trigger: "3 Days Overdue",
    triggerIcon: AlertTriangle,
    triggerColor: "text-amber-600 bg-amber-500/10",
    channels: ["sms"],
    recipientType: "Guardian",
    status: "active",
    lastRun: "3d ago",
    messagesSent: 62,
    successRate: 95,
  },
  {
    id: 4,
    name: "Overdue Warning",
    description: "Escalated warning at 7+ days overdue — stern tone for urgency",
    trigger: "7 Days Overdue",
    triggerIcon: AlertCircle,
    triggerColor: "text-red-600 bg-red-500/10",
    channels: ["sms"],
    recipientType: "Guardian",
    status: "active",
    lastRun: "5d ago",
    messagesSent: 24,
    successRate: 100,
  },
  {
    id: 5,
    name: "Exam Reminder",
    description: "Notify students and guardians 1 day before a scheduled exam",
    trigger: "1 Day Before Exam",
    triggerIcon: GraduationCap,
    triggerColor: "text-violet-600 bg-violet-500/10",
    channels: ["sms"],
    recipientType: "Both",
    status: "paused",
    lastRun: "12d ago",
    messagesSent: 143,
    successRate: 94,
  },
]

const channelMeta: Record<string, { icon: React.ElementType; label: string }> = {
  sms: { icon: MessageSquare, label: "SMS" },
  whatsapp: { icon: Smartphone, label: "WhatsApp" },
  email: { icon: Mail, label: "Email" },
}

interface CommAutomationsProps {
  onNavigate: CommNavFn
}

export function CommAutomations({ onNavigate }: CommAutomationsProps) {
  const [statuses, setStatuses] = React.useState<Record<number, boolean>>(
    Object.fromEntries(AUTOMATIONS.map(a => [a.id, a.status === "active"]))
  )
  const [channels, setChannels] = React.useState<Record<number, ("sms" | "whatsapp" | "email")[]>>(
    Object.fromEntries(AUTOMATIONS.map(a => [a.id, a.channels]))
  )

  const toggle = (id: number) => setStatuses(p => ({ ...p, [id]: !p[id] }))

  const toggleChannel = (id: number, ch: "sms" | "whatsapp" | "email") => {
    setChannels(p => {
      const current = p[id]
      if (ch === "sms") return p // can't disable the only active channel
      return { ...p, [id]: current.includes(ch) ? current.filter(c => c !== ch) : [...current, ch] }
    })
  }

  const activeCount = Object.values(statuses).filter(Boolean).length
  const pausedCount = Object.values(statuses).filter(v => !v).length
  const totalSent = AUTOMATIONS.reduce((s, a) => s + a.messagesSent, 0)

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Automations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Trigger-based messages sent automatically across your student lifecycle
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => onNavigate("automations-new")}>
          <Plus className="size-4" />
          New Automation
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="py-0 gap-0">
          <CardContent className="px-4 py-3 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Zap className="size-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-0 gap-0">
          <CardContent className="px-4 py-3 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10">
              <Pause className="size-4 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{pausedCount}</p>
              <p className="text-xs text-muted-foreground">Paused</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-0 gap-0">
          <CardContent className="px-4 py-3 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Send className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{totalSent}</p>
              <p className="text-xs text-muted-foreground">Messages sent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation workflow cards */}
      <div className="space-y-3">
        {AUTOMATIONS.map((automation) => {
          const isOn = statuses[automation.id]
          const activeChannels = channels[automation.id]
          const TriggerIcon = automation.triggerIcon

          return (
            <Card
              key={automation.id}
              className={cn("py-0 gap-0 transition-opacity", !isOn && "opacity-50")}
            >
              <CardContent className="px-5 py-4">
                <div className="flex items-start gap-4">
                  {/* Trigger icon + flow arrow */}
                  <div className="flex items-center gap-2 pt-0.5 shrink-0">
                    <div className={cn("flex size-10 items-center justify-center rounded-xl", automation.triggerColor)}>
                      <TriggerIcon className="size-5" />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground/40" />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          className="text-sm font-semibold hover:text-primary transition-colors text-left truncate"
                          onClick={() => onNavigate("automations-detail", automation.id)}
                        >
                          {automation.name}
                        </button>
                        {isOn ? (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/10">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                            Paused
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status toggle */}
                        <Switch
                          checked={isOn}
                          onCheckedChange={() => toggle(automation.id)}
                        />

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7">
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              className="text-xs gap-2"
                              onClick={() => onNavigate("automations-detail", automation.id)}
                            >
                              <CheckCircle2 className="size-3.5" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs gap-2"
                              onClick={() => onNavigate("automations-edit", automation.id)}
                            >
                              <Edit2 className="size-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2">
                              <Copy className="size-3.5" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs gap-2 text-destructive focus:text-destructive">
                              <Trash2 className="size-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mt-0.5">{automation.description}</p>

                    {/* Flow visualization: trigger → channel → recipient */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {/* Trigger badge */}
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted px-2.5 py-1 rounded-md border border-border">
                        <Zap className="size-3 text-amber-600" />
                        {automation.trigger}
                      </div>

                      <ArrowRight className="size-3 text-muted-foreground/30" />

                      {/* Channel selector */}
                      <div className="inline-flex items-center gap-1.5">
                        {(["sms", "whatsapp", "email"] as const).map((ch) => {
                          const meta = channelMeta[ch]
                          const ChIcon = meta.icon
                          const isEnabled = activeChannels.includes(ch)
                          const isSmsAndOnly = ch === "sms" && isEnabled && activeChannels.length === 1

                          return (
                            <label
                              key={ch}
                              className={cn(
                                "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer select-none",
                                isEnabled
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : "bg-muted/50 text-muted-foreground border-border hover:border-muted-foreground/30",
                                ch === "whatsapp" && "opacity-60 cursor-not-allowed",
                                ch === "email" && "opacity-60 cursor-not-allowed",
                              )}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={isEnabled}
                                disabled={isSmsAndOnly || ch === "whatsapp" || ch === "email"}
                                onChange={() => toggleChannel(automation.id, ch)}
                              />
                              <ChIcon className="size-3" />
                              {meta.label}
                            </label>
                          )
                        })}
                      </div>

                      <ArrowRight className="size-3 text-muted-foreground/30" />

                      {/* Recipient badge */}
                      <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border">
                        {automation.recipientType}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        Last run: {automation.lastRun}
                      </div>
                      <div className="flex items-center gap-1">
                        <Send className="size-3" />
                        {automation.messagesSent.toLocaleString()} sent
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="size-3" />
                        <span className={cn(
                          automation.successRate >= 97 ? "text-emerald-600" :
                          automation.successRate >= 90 ? "text-amber-600" :
                          "text-red-600"
                        )}>
                          {automation.successRate}%
                        </span>
                        success
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
