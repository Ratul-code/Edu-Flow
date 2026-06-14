import * as React from "react"
import {
  Clock, MessageSquare, CheckCircle2, Edit2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AutomationBuilder, type BuilderState } from "./AutomationBuilder"
import type { CommNavFn } from "./CommCenter"

interface EditMeta {
  id: number
  name: string
  status: "active" | "paused"
  lastRun: string
  messagesSent: number
  successRate: number
  lastModified: string
}

const AUTOMATION_DATA: Record<number, { meta: EditMeta; state: Partial<BuilderState> }> = {
  1: {
    meta: { id: 1, name: "Payment Received", status: "active", lastRun: "2 hours ago", messagesSent: 248, successRate: 99, lastModified: "Jun 2, 2025" },
    state: {
      name: "Payment Received",
      trigger: "payment-recorded",
      recipient: "guardian",
      channel: "sms",
      templateId: "payment-confirm",
      message: "Dear {{guardian_name}}, we received ৳{{amount}} for {{student_name}} for {{month}}. Thank you! - {{coaching_name}}",
      timing: "immediately",
    },
  },
  2: {
    meta: { id: 2, name: "Fee Due Reminder", status: "active", lastRun: "1 day ago", messagesSent: 186, successRate: 97, lastModified: "May 28, 2025" },
    state: {
      name: "Fee Due Reminder",
      trigger: "fee-due",
      recipient: "guardian",
      channel: "sms",
      templateId: "fee-reminder",
      message: "Dear {{guardian_name}}, {{student_name}}'s fee of ৳{{amount}} is due by {{due_date}}. - {{coaching_name}}",
      timing: "on-due-date",
      timingTime: "09:00",
    },
  },
  3: {
    meta: { id: 3, name: "Grace Period Reminder", status: "active", lastRun: "3 days ago", messagesSent: 62, successRate: 95, lastModified: "May 15, 2025" },
    state: {
      name: "Grace Period Reminder",
      trigger: "grace-period",
      recipient: "guardian",
      channel: "sms",
      message: "Dear {{guardian_name}}, {{student_name}}'s fee is 3 days overdue. Amount: ৳{{amount}}. Please pay soon. - {{coaching_name}}",
      timing: "days-after-due",
      timingValue: 3,
      timingTime: "10:00",
    },
  },
  4: {
    meta: { id: 4, name: "Overdue Warning", status: "active", lastRun: "5 days ago", messagesSent: 24, successRate: 100, lastModified: "May 10, 2025" },
    state: {
      name: "Overdue Warning",
      trigger: "overdue",
      recipient: "guardian",
      channel: "sms",
      templateId: "overdue-warning",
      message: "NOTICE: {{student_name}}'s fee is overdue. Amount: ৳{{amount}}. Please pay immediately to avoid suspension. - {{coaching_name}}",
      timing: "days-after-due",
      timingValue: 7,
      timingTime: "09:00",
    },
  },
  5: {
    meta: { id: 5, name: "Exam Reminder", status: "paused", lastRun: "12 days ago", messagesSent: 143, successRate: 94, lastModified: "Apr 28, 2025" },
    state: {
      name: "Exam Reminder",
      trigger: "exam-scheduled",
      recipient: "both",
      channel: "sms",
      templateId: "exam-notice",
      message: "Dear {{guardian_name}}, {{student_name}}'s exam is on {{due_date}}. Ensure timely attendance. - {{coaching_name}}",
      timing: "days-before-due",
      timingValue: 1,
      timingTime: "09:00",
    },
  },
  6: {
    meta: { id: 6, name: "Batch Rescheduled", status: "paused", lastRun: "18 days ago", messagesSent: 31, successRate: 100, lastModified: "Apr 20, 2025" },
    state: {
      name: "Batch Rescheduled",
      trigger: "batch-rescheduled",
      recipient: "guardian",
      channel: "sms",
      message: "Dear {{guardian_name}}, {{student_name}}'s batch has been rescheduled. Please check the updated schedule. - {{coaching_name}}",
      timing: "immediately",
    },
  },
}

interface CommAutomationEditProps {
  id: number
  onNavigate: CommNavFn
}

export function CommAutomationEdit({ id, onNavigate }: CommAutomationEditProps) {
  const [isActive, setIsActive] = React.useState(
    AUTOMATION_DATA[id]?.meta.status === "active"
  )
  const data = AUTOMATION_DATA[id] ?? AUTOMATION_DATA[1]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Edit metadata header */}
      <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Edit2 className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Editing: {data.meta.name}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3" />
            Last run {data.meta.lastRun}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquare className="size-3" />
            {data.meta.messagesSent} sent
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3 text-success" />
            {data.meta.successRate}% success
          </div>
          <div className="text-xs text-muted-foreground">
            Modified {data.meta.lastModified}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{isActive ? "Active" : "Paused"}</span>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onNavigate("automations-detail", id)}
          >
            View Details
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <AutomationBuilder
          mode="edit"
          initialState={data.state}
          onSave={() => onNavigate("automations")}
          onCancel={() => onNavigate("automations-detail", id)}
        />
      </div>
    </div>
  )
}
