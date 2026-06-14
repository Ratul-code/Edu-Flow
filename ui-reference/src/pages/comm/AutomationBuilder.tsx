import * as React from "react"
import {
  CreditCard, Calendar, Clock, AlertCircle, AlertTriangle, BookOpen,
  RefreshCw, UserPlus, Check, Plus, Trash2, ArrowRight, MessageSquare,
  Smartphone, Mail, Bell, Phone, Users, User, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Condition {
  id: string
  field: string
  operator: string
  value: string
}

export interface BuilderState {
  name: string
  trigger: string
  conditions: Condition[]
  conditionLogic: "AND" | "OR"
  recipient: "guardian" | "student" | "both" | "custom"
  customNumber: string
  channel: "sms"
  templateId: string
  message: string
  timing: "immediately" | "hours-after" | "days-after" | "days-before-due" | "on-due-date" | "days-after-due" | "specific-time"
  timingValue: number
  timingTime: string
}

export const DEFAULT_BUILDER_STATE: BuilderState = {
  name: "",
  trigger: "",
  conditions: [],
  conditionLogic: "AND",
  recipient: "guardian",
  customNumber: "",
  channel: "sms",
  templateId: "",
  message: "",
  timing: "immediately",
  timingValue: 1,
  timingTime: "09:00",
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRIGGERS = [
  { id: "payment-recorded",      label: "Payment Recorded",       icon: CreditCard,     desc: "When a fee payment is recorded" },
  { id: "fee-due",               label: "Fee Due Date Reached",   icon: Calendar,       desc: "On the student's monthly due date" },
  { id: "grace-period",          label: "Grace Period Started",   icon: Clock,          desc: "3 days after due date, fee unpaid" },
  { id: "one-day-before-overdue",label: "One Day Before Overdue", icon: AlertCircle,    desc: "6 days after due date, unpaid" },
  { id: "overdue",               label: "Fee Became Overdue",     icon: AlertTriangle,  desc: "7+ days after due date" },
  { id: "exam-scheduled",        label: "Exam Scheduled",         icon: BookOpen,       desc: "1 day before a scheduled exam" },
  { id: "batch-rescheduled",     label: "Batch Rescheduled",      icon: RefreshCw,      desc: "When a class time is changed" },
  { id: "student-registered",    label: "Student Registered",     icon: UserPlus,       desc: "When a new student is enrolled" },
]

const CONDITION_FIELDS = ["Class", "Medium", "Group", "Batch", "Tags", "Student Status", "Payment Status", "Due Amount"]
const OPERATORS = ["is", "is not", "contains", "greater than", "less than"]

const TEMPLATES = [
  { id: "fee-reminder", name: "Fee Reminder", body: "Dear {{guardian_name}}, {{student_name}}'s fee of ৳{{amount}} is due by {{due_date}}. - {{coaching_name}}" },
  { id: "payment-confirm", name: "Payment Confirmation", body: "Dear {{guardian_name}}, we received ৳{{amount}} for {{student_name}} for {{month}}. Thank you! - {{coaching_name}}" },
  { id: "overdue-warning", name: "Overdue Warning", body: "NOTICE: {{student_name}}'s fee is overdue. Amount: ৳{{amount}}. Please pay immediately to avoid suspension. - {{coaching_name}}" },
  { id: "exam-notice", name: "Exam Notice", body: "Dear {{guardian_name}}, {{student_name}}'s exam is on {{due_date}}. Ensure timely attendance. - {{coaching_name}}" },
]

const VARIABLES = ["{{student_name}}", "{{guardian_name}}", "{{amount}}", "{{month}}", "{{receipt_link}}", "{{due_date}}", "{{coaching_name}}"]

const STEPS = [
  { n: 1, key: "trigger",    label: "Trigger"    },
  { n: 2, key: "conditions", label: "Conditions" },
  { n: 3, key: "recipients", label: "Recipients" },
  { n: 4, key: "channel",    label: "Channel"    },
  { n: 5, key: "message",    label: "Message"    },
  { n: 6, key: "timing",     label: "Timing"     },
  { n: 7, key: "review",     label: "Review"     },
]

// ─── Step components ──────────────────────────────────────────────────────────

function StepTrigger({ state, update }: { state: BuilderState; update: (p: Partial<BuilderState>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">What triggers this automation?</h3>
        <p className="text-sm text-muted-foreground mt-1">Choose the event that starts this workflow</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TRIGGERS.map((t) => {
          const Icon = t.icon
          const selected = state.trigger === t.id
          return (
            <button
              key={t.id}
              onClick={() => update({ trigger: t.id })}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <div className={cn(
                "flex size-8 items-center justify-center rounded-lg shrink-0 mt-0.5",
                selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="size-4" />
              </div>
              <div>
                <p className={cn("text-sm font-medium", selected && "text-primary")}>{t.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.desc}</p>
              </div>
              {selected && (
                <div className="ml-auto shrink-0">
                  <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="size-3 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepConditions({ state, update }: { state: BuilderState; update: (p: Partial<BuilderState>) => void }) {
  const addCondition = () => {
    update({
      conditions: [
        ...state.conditions,
        { id: Date.now().toString(), field: "Class", operator: "is", value: "" },
      ],
    })
  }
  const removeCondition = (id: string) => update({ conditions: state.conditions.filter(c => c.id !== id) })
  const updateCondition = (id: string, patch: Partial<Condition>) => {
    update({ conditions: state.conditions.map(c => c.id === id ? { ...c, ...patch } : c) })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Add conditions</h3>
        <p className="text-sm text-muted-foreground mt-1">Only run this automation when these conditions are met (optional)</p>
      </div>

      {state.conditions.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Match</span>
          <div className="flex rounded-md border border-border overflow-hidden">
            {(["AND", "OR"] as const).map((l) => (
              <button
                key={l}
                onClick={() => update({ conditionLogic: l })}
                className={cn(
                  "px-3 py-1 text-xs font-medium transition-colors",
                  state.conditionLogic === l
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >{l}</button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">of the following conditions</span>
        </div>
      )}

      <div className="space-y-2">
        {state.conditions.map((cond, i) => (
          <div key={cond.id} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-xs font-medium text-muted-foreground w-7 text-center shrink-0">
                {state.conditionLogic}
              </span>
            )}
            {i === 0 && <span className="w-7 shrink-0" />}
            <div className="flex items-center gap-2 flex-1 rounded-lg border border-border bg-muted/30 p-2">
              <Select value={cond.field} onValueChange={(v) => updateCondition(cond.id, { field: v })}>
                <SelectTrigger className="h-7 text-xs w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_FIELDS.map(f => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={cond.operator} onValueChange={(v) => updateCondition(cond.id, { operator: v })}>
                <SelectTrigger className="h-7 text-xs w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                className="h-7 text-xs flex-1"
                placeholder="Value..."
                value={cond.value}
                onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
              />
            </div>
            <button onClick={() => removeCondition(cond.id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addCondition}>
        <Plus className="size-3.5" />
        Add Condition
      </Button>

      {state.conditions.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 py-6 text-center">
          <p className="text-sm text-muted-foreground">No conditions — runs for all matching students</p>
        </div>
      )}
    </div>
  )
}

function StepRecipients({ state, update }: { state: BuilderState; update: (p: Partial<BuilderState>) => void }) {
  const options = [
    { id: "guardian", label: "Guardian's phone", desc: "Send to the parent/guardian (recommended)", icon: User, badge: "Recommended" },
    { id: "student",  label: "Student's phone",  desc: "Send directly to the student",             icon: User, badge: null },
    { id: "both",     label: "Both",             desc: "Send to both student and guardian — counts as 2 SMS per student", icon: Users, badge: "2× SMS" },
    { id: "custom",   label: "Custom number",    desc: "Enter a specific number (for testing)",    icon: Phone, badge: "Testing" },
  ] as const

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Who receives this message?</h3>
        <p className="text-sm text-muted-foreground mt-1">Select who gets this automated SMS</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon
          const selected = state.recipient === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => update({ recipient: opt.id })}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <div className={cn(
                "flex size-8 items-center justify-center rounded-lg shrink-0 mt-0.5",
                selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", selected && "text-primary")}>{opt.label}</span>
                  {opt.badge && (
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
                      opt.badge === "Recommended" ? "bg-success/10 text-success border-success/20" :
                      opt.badge === "2× SMS" ? "bg-warning/10 text-warning border-warning/20" :
                      "bg-muted text-muted-foreground border-border"
                    )}>{opt.badge}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{opt.desc}</p>
              </div>
              {selected && (
                <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="size-3 text-primary-foreground" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {state.recipient === "custom" && (
        <div>
          <Label className="text-xs font-medium mb-1.5 block">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-sm max-w-xs"
              placeholder="+880 17XX-XXXXXX"
              value={state.customNumber}
              onChange={(e) => update({ customNumber: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-xs font-medium text-foreground mb-1">Recipient Preview</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">128</div>
            <div className="text-[10px] text-muted-foreground">Students matched</div>
          </div>
          <div>
            <div className="text-lg font-bold text-success">115</div>
            <div className="text-[10px] text-muted-foreground">Valid numbers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-warning">13</div>
            <div className="text-[10px] text-muted-foreground">Missing number</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepChannel({ state, update }: { state: BuilderState; update: (p: Partial<BuilderState>) => void }) {
  const channels = [
    { id: "sms",       label: "SMS",              icon: MessageSquare, desc: "Text message via SSL Wireless", active: true,  provider: "SSL Wireless · 4,820 credits" },
    { id: "whatsapp",  label: "WhatsApp",          icon: Smartphone,    desc: "Rich messages with media",      active: false, provider: "Coming soon" },
    { id: "email",     label: "Email",             icon: Mail,          desc: "Formatted email messages",      active: false, provider: "Coming soon" },
    { id: "push",      label: "App Push",          icon: Bell,          desc: "In-app push notification",      active: false, provider: "Coming soon" },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Which channel should this use?</h3>
        <p className="text-sm text-muted-foreground mt-1">More channels will be available soon</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {channels.map((ch) => {
          const Icon = ch.icon
          const selected = state.channel === ch.id
          return (
            <button
              key={ch.id}
              disabled={!ch.active}
              onClick={() => ch.active && update({ channel: ch.id as "sms" })}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all",
                !ch.active && "opacity-50 cursor-not-allowed",
                selected && ch.active ? "border-primary bg-primary/5 shadow-sm" : "border-border",
                ch.active && !selected && "hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <div className={cn(
                "flex size-8 items-center justify-center rounded-lg shrink-0 mt-0.5",
                selected && ch.active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", selected && ch.active && "text-primary")}>{ch.label}</span>
                  {!ch.active && (
                    <span className="text-[10px] font-medium bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{ch.desc}</p>
                <p className="text-[10px] font-medium text-muted-foreground mt-1">{ch.provider}</p>
              </div>
              {selected && ch.active && (
                <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="size-3 text-primary-foreground" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepMessage({ state, update }: { state: BuilderState; update: (p: Partial<BuilderState>) => void }) {
  const MAX_CHARS = 160
  const charCount = state.message.length
  const segments = Math.ceil(charCount / MAX_CHARS) || 1

  const selectTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find(t => t.id === templateId)
    if (tpl) update({ templateId, message: tpl.body })
  }

  const insertVariable = (v: string) => update({ message: state.message + v })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Compose your message</h3>
        <p className="text-sm text-muted-foreground mt-1">Write or pick a template for the automated SMS</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Composer */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium mb-1.5 block">Template</Label>
            <Select value={state.templateId} onValueChange={selectTemplate}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Start from a template..." />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-sm">{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium mb-1.5 block">Message</Label>
            <Textarea
              placeholder="Type your message..."
              className="min-h-[120px] text-sm resize-none font-mono"
              value={state.message}
              onChange={(e) => update({ message: e.target.value })}
            />
            <div className="flex items-center justify-between mt-1">
              <div className="flex flex-wrap gap-1">
                {VARIABLES.map((v) => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors font-mono"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <span className={cn("text-xs ml-2 shrink-0", segments > 1 ? "text-warning" : "text-muted-foreground")}>
                {charCount}/{MAX_CHARS * segments} · {segments} SMS
              </span>
            </div>
          </div>
        </div>

        {/* Phone preview */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-medium text-muted-foreground mb-3">Phone Preview</p>
          <div className="relative w-[180px]">
            <div className="bg-foreground rounded-[1.8rem] p-1.5 shadow-xl">
              <div className="bg-background rounded-[1.5rem] overflow-hidden">
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-12 h-1 bg-muted-foreground/20 rounded-full" />
                </div>
                <div className="px-2 pb-4 min-h-[300px]">
                  <div className="flex items-center gap-2 py-2 border-b border-border/50 mb-3">
                    <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="size-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold">Edu Flow</p>
                      <p className="text-[8px] text-muted-foreground">SMS</p>
                    </div>
                  </div>
                  {state.message ? (
                    <div className="bg-muted rounded-xl rounded-tl-sm px-2.5 py-2 mx-1">
                      <p className="text-[9px] leading-relaxed break-words whitespace-pre-wrap">{state.message}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 opacity-30">
                      <MessageSquare className="size-6 text-muted-foreground" />
                      <p className="text-[9px] text-muted-foreground mt-1 text-center">Preview here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepTiming({ state, update }: { state: BuilderState; update: (p: Partial<BuilderState>) => void }) {
  const options = [
    { id: "immediately",     label: "Immediately",                  desc: "Send as soon as the trigger fires",          hasValue: false },
    { id: "hours-after",     label: "X hours after trigger",        desc: "Send a few hours after the event",           hasValue: true,  unit: "hours" },
    { id: "days-after",      label: "X days after trigger",         desc: "Send some days after the event",             hasValue: true,  unit: "days" },
    { id: "days-before-due", label: "X days before due date",       desc: "Send before the due date as a heads-up",     hasValue: true,  unit: "days before" },
    { id: "on-due-date",     label: "On due date",                  desc: "Send on the exact due date",                 hasValue: false },
    { id: "days-after-due",  label: "X days after due date",        desc: "Follow up after the due date passes",        hasValue: true,  unit: "days after" },
    { id: "specific-time",   label: "At specific time of day",      desc: "Deliver at a set time (e.g. 9:00 AM)",       hasValue: false },
  ] as const

  const selected = options.find(o => o.id === state.timing)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">When should this be sent?</h3>
        <p className="text-sm text-muted-foreground mt-1">Choose the timing relative to the trigger event</p>
      </div>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = state.timing === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => update({ timing: opt.id })}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "size-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                isSelected ? "border-primary" : "border-muted-foreground/40"
              )}>
                {isSelected && <div className="size-2 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <span className={cn("text-sm font-medium", isSelected && "text-primary")}>{opt.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
              {isSelected && opt.hasValue && (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Input
                    type="number"
                    min={1}
                    className="h-7 w-16 text-xs text-center"
                    value={state.timingValue}
                    onChange={(e) => update({ timingValue: +e.target.value })}
                  />
                  <span className="text-xs text-muted-foreground">{opt.unit}</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selected && (selected.id !== "immediately") && (
        <div>
          <Label className="text-xs font-medium mb-1.5 block">Preferred time of day</Label>
          <Input
            type="time"
            className="h-8 text-sm w-32"
            value={state.timingTime}
            onChange={(e) => update({ timingTime: e.target.value })}
          />
          <p className="text-xs text-muted-foreground mt-1">Messages will be delivered at approximately this time</p>
        </div>
      )}
    </div>
  )
}

function StepReview({ state, mode, onSave }: { state: BuilderState; mode: "new" | "edit"; onSave: () => void }) {
  const trigger = TRIGGERS.find(t => t.id === state.trigger)
  const TriggerIcon = trigger?.icon

  const timingLabel = () => {
    switch (state.timing) {
      case "immediately": return "Immediately after trigger"
      case "hours-after": return `${state.timingValue} hour${state.timingValue !== 1 ? "s" : ""} after trigger at ${state.timingTime}`
      case "days-after": return `${state.timingValue} day${state.timingValue !== 1 ? "s" : ""} after trigger at ${state.timingTime}`
      case "days-before-due": return `${state.timingValue} day${state.timingValue !== 1 ? "s" : ""} before due date at ${state.timingTime}`
      case "on-due-date": return `On due date at ${state.timingTime}`
      case "days-after-due": return `${state.timingValue} day${state.timingValue !== 1 ? "s" : ""} after due date at ${state.timingTime}`
      case "specific-time": return `At ${state.timingTime}`
      default: return "—"
    }
  }

  const recipientLabel = {
    guardian: "Guardian's phone",
    student: "Student's phone",
    both: "Both (student + guardian)",
    custom: `Custom: ${state.customNumber}`,
  }[state.recipient]

  const estSms = state.recipient === "both" ? 230 : 115

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">Review your automation</h3>
        <p className="text-sm text-muted-foreground mt-1">Confirm everything looks right before saving</p>
      </div>

      {/* Workflow flow visualization */}
      <div className="rounded-xl border border-border overflow-hidden">
        {[
          {
            label: "TRIGGER",
            value: trigger?.label ?? "Not selected",
            icon: TriggerIcon ?? CreditCard,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "CONDITIONS",
            value: state.conditions.length > 0
              ? `${state.conditions.length} condition${state.conditions.length > 1 ? "s" : ""} (${state.conditionLogic})`
              : "No conditions — all students",
            icon: Check,
            color: "text-success",
            bg: "bg-success/10",
          },
          {
            label: "RECIPIENTS",
            value: recipientLabel,
            icon: Users,
            color: "text-info",
            bg: "bg-info/10",
          },
          {
            label: "CHANNEL",
            value: "SMS",
            icon: MessageSquare,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "MESSAGE",
            value: state.message ? `${state.message.slice(0, 50)}${state.message.length > 50 ? "…" : ""}` : "Not set",
            icon: MessageSquare,
            color: "text-muted-foreground",
            bg: "bg-muted",
          },
          {
            label: "TIMING",
            value: timingLabel(),
            icon: Clock,
            color: "text-warning",
            bg: "bg-warning/10",
          },
        ].map((row, i, arr) => {
          const Icon = row.icon
          return (
            <React.Fragment key={row.label}>
              <div className="flex items-start gap-3 px-4 py-3">
                <div className={cn("flex size-8 items-center justify-center rounded-lg shrink-0 mt-0.5", row.bg)}>
                  <Icon className={cn("size-4", row.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">{row.label}</p>
                  <p className="text-sm font-medium mt-0.5 truncate">{row.value}</p>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="flex items-center gap-2 pl-7 py-0">
                  <div className="w-px h-4 bg-border ml-3.5" />
                  <ArrowRight className="size-3 text-muted-foreground" />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Estimated SMS */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center gap-3">
        <MessageSquare className="size-4 text-primary shrink-0" />
        <div>
          <p className="text-sm font-medium">Estimated SMS per run: ~{estSms}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Based on current active students with {state.recipient === "both" ? "both" : "guardian"} numbers on file
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <Button className="gap-1.5" onClick={onSave}>
          {mode === "new" ? "Activate Automation" : "Save Changes"}
        </Button>
        <Button variant="outline" className="gap-1.5" onClick={onSave}>
          {mode === "new" ? "Save as Draft" : "Save as Draft"}
        </Button>
      </div>
    </div>
  )
}

// ─── Preview panel ─────────────────────────────────────────────────────────────

function PreviewPanel({ state }: { state: BuilderState }) {
  const trigger = TRIGGERS.find(t => t.id === state.trigger)

  return (
    <div className="w-64 shrink-0 border-l border-border bg-muted/20 flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Live Preview</p>
      </div>
      <div className="flex-1 px-4 py-4 space-y-3 overflow-auto">
        {/* Name */}
        {state.name && (
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Name</p>
            <p className="text-xs font-medium mt-0.5">{state.name}</p>
          </div>
        )}

        {/* Flow diagram */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Workflow</p>
          {[
            { label: trigger?.label ?? "Choose trigger", done: !!state.trigger },
            { label: state.conditions.length > 0 ? `${state.conditions.length} condition${state.conditions.length > 1 ? "s" : ""}` : "No conditions", done: true },
            { label: { guardian: "Guardian", student: "Student", both: "Both", custom: "Custom" }[state.recipient], done: true },
            { label: "SMS", done: true },
            { label: state.message ? "Message set" : "Write message", done: !!state.message },
            { label: state.timing === "immediately" ? "Immediately" : "Scheduled timing", done: true },
          ].map((item, i) => (
            <React.Fragment key={i}>
              <div className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                item.done && (i === 0 ? !!state.trigger : true) ? "bg-card border border-border" : "bg-muted/40"
              )}>
                <div className={cn(
                  "size-4 rounded-full flex items-center justify-center shrink-0",
                  item.done ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                )}>
                  {item.done ? <Check className="size-2.5" /> : <span className="text-[8px] font-bold">{i + 1}</span>}
                </div>
                <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
              </div>
              {i < 5 && (
                <div className="w-px h-2 bg-border ml-3.5" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Message preview */}
        {state.message && (
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1.5">Message</p>
            <div className="rounded-lg bg-muted px-2.5 py-2">
              <p className="text-[10px] leading-relaxed text-foreground">{state.message.slice(0, 120)}{state.message.length > 120 ? "…" : ""}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

interface AutomationBuilderProps {
  mode: "new" | "edit"
  initialState?: Partial<BuilderState>
  onSave: () => void
  onCancel: () => void
}

export function AutomationBuilder({ mode, initialState, onSave, onCancel }: AutomationBuilderProps) {
  const [step, setStep] = React.useState(1)
  const [state, setState] = React.useState<BuilderState>({
    ...DEFAULT_BUILDER_STATE,
    ...initialState,
  })

  const update = (patch: Partial<BuilderState>) => setState(prev => ({ ...prev, ...patch }))

  const canProceed = () => {
    if (step === 1) return !!state.trigger
    return true
  }

  const stepProps = { state, update }

  return (
    <div className="flex h-full min-h-screen">
      {/* Step navigator */}
      <div className="w-44 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="px-4 py-4 border-b border-border">
          <p className="text-xs font-semibold">
            {mode === "new" ? "New Automation" : "Edit Automation"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Step {step} of {STEPS.length}</p>
        </div>
        <nav className="flex-1 px-3 py-3">
          <ul className="space-y-1">
            {STEPS.map(({ n, label }) => {
              const isActive = step === n
              const isDone = step > n
              return (
                <li key={n}>
                  <button
                    onClick={() => n < step || isDone ? setStep(n) : undefined}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors text-left",
                      isActive ? "bg-primary/10 text-primary font-medium" :
                      isDone   ? "text-muted-foreground hover:bg-muted cursor-pointer" :
                                 "text-muted-foreground/50 cursor-default"
                    )}
                  >
                    <div className={cn(
                      "size-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                      isActive ? "bg-primary text-primary-foreground" :
                      isDone   ? "bg-success text-white" :
                                 "bg-muted text-muted-foreground"
                    )}>
                      {isDone ? <Check className="size-3" /> : n}
                    </div>
                    {label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="px-3 py-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {/* Name input at top */}
        <div className="px-6 pt-5 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <Input
              className="h-8 text-sm font-medium max-w-xs"
              placeholder="Automation name (e.g. Fee Due Reminder)"
              value={state.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
        </div>

        {/* Step content area */}
        <div className="px-6 py-5">
          {step === 1 && <StepTrigger {...stepProps} />}
          {step === 2 && <StepConditions {...stepProps} />}
          {step === 3 && <StepRecipients {...stepProps} />}
          {step === 4 && <StepChannel {...stepProps} />}
          {step === 5 && <StepMessage {...stepProps} />}
          {step === 6 && <StepTiming {...stepProps} />}
          {step === 7 && <StepReview state={state} mode={mode} onSave={onSave} />}
        </div>

        {/* Navigation buttons */}
        {step < 7 && (
          <div className="px-6 pb-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-1.5"
            >
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => setStep(s => Math.min(7, s + 1))}
              disabled={!canProceed()}
              className="gap-1.5"
            >
              Continue
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Live preview panel */}
      <PreviewPanel state={state} />
    </div>
  )
}
