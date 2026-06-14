"use client"

import { useMemo, useRef, useState, type ReactNode } from "react"
import {
  EyeIcon,
  FilePlus2Icon,
  FilterIcon,
  PhoneIcon,
  SendIcon,
  UsersIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { BatchRecord } from "@/lib/data/batches"
import type { SmsTemplateRecord } from "@/lib/data/sms"

type RecipientMode = "individual" | "bulk" | "custom"
type RecipientType = "student" | "guardian" | "both"

type SmsChannelComposeProps = {
  availableCredits: number
  batches: BatchRecord[]
  classLevels: string[]
  groups: string[]
  mediums: string[]
  tags: string[]
  templates: SmsTemplateRecord[]
  totalActiveStudents: number
}

const messageVariables = [
  "student_name",
  "guardian_name",
  "amount",
  "due_amount",
  "paid_amount",
  "month",
  "due_date",
  "payment_date",
  "receipt_link",
  "coaching_name",
  "coaching_phone",
]

const previewVariableValues: Record<string, string> = {
  amount: "৳2,000",
  coaching_name: "Uttara Coaching Center",
  coaching_phone: "01712-345678",
  due_amount: "৳1,200",
  due_date: "10 Jun 2026",
  guardian_name: "Mst. Nasima Akter",
  month: "June 2026",
  paid_amount: "৳800",
  payment_date: "5 Jun 2026",
  receipt_link: "https://edu.flow/r/8F2K9",
  student_name: "Rahim Uddin",
}

export function SmsChannelCompose({
  availableCredits,
  batches,
  classLevels,
  groups,
  mediums,
  tags,
  templates,
  totalActiveStudents,
}: SmsChannelComposeProps) {
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("bulk")
  const [recipientType, setRecipientType] = useState<RecipientType>("guardian")
  const [selectedTemplateId, setSelectedTemplateId] = useState("none")
  const [selectedVariable, setSelectedVariable] = useState("none")
  const [message, setMessage] = useState("")
  const [customNumbers, setCustomNumbers] = useState("")
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId
  )
  const customRecipientCount = countCustomNumbers(customNumbers)
  const recipientCount =
    recipientMode === "individual"
      ? 1
      : recipientMode === "custom"
        ? customRecipientCount
        : totalActiveStudents
  const recipientMultiplier = recipientType === "both" ? 2 : 1
  const phoneCount = recipientCount * recipientMultiplier
  const renderedMessage = renderPreviewMessage(message)
  const messageForCalculation = renderedMessage.trim() ? renderedMessage : message
  const messageType = isGsmSms(messageForCalculation) ? "GSM" : "Unicode"
  const segmentSize = messageType === "GSM" ? 160 : 67
  const segments = Math.max(
    Math.ceil(Math.max(messageForCalculation.length, 1) / segmentSize),
    1
  )
  const creditsRequired = segments * phoneCount
  const remainingCredits = availableCredits - creditsRequired
  const canSend = message.trim().length > 0 && phoneCount > 0 && remainingCredits >= 0

  const recipientSummary = useMemo(() => {
    if (recipientMode === "individual") {
      return "1 selected student"
    }

    if (recipientMode === "custom") {
      return `${customRecipientCount.toLocaleString("en-US")} custom number${
        customRecipientCount === 1 ? "" : "s"
      }`
    }

    return `${totalActiveStudents.toLocaleString("en-US")} matching students`
  }, [customRecipientCount, recipientMode, totalActiveStudents])

  function applyTemplate(value: string | null) {
    const nextValue = value ?? "none"
    setSelectedTemplateId(nextValue)

    const template = templates.find((item) => item.id === nextValue)

    if (template) {
      setMessage(template.message_body)
    }
  }

  function insertVariable(value: string | null) {
    const variableName = value ?? "none"

    if (variableName === "none") {
      return
    }

    const token = `{{${variableName}}}`
    const textarea = messageTextareaRef.current
    const selectionStart = textarea?.selectionStart ?? message.length
    const selectionEnd = textarea?.selectionEnd ?? message.length
    const nextMessage = `${message.slice(0, selectionStart)}${token}${message.slice(
      selectionEnd
    )}`

    setMessage(nextMessage)
    setSelectedVariable("none")

    window.requestAnimationFrame(() => {
      const cursorPosition = selectionStart + token.length
      messageTextareaRef.current?.focus()
      messageTextareaRef.current?.setSelectionRange(cursorPosition, cursorPosition)
    })
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-primary" />
                <CardTitle>Recipient Selection</CardTitle>
              </div>
              <CardDescription>
                Choose who should receive this SMS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid gap-2 sm:grid-cols-3">
                <ModeButton
                  active={recipientMode === "individual"}
                  description="Search or select one student."
                  label="Individual"
                  onClick={() => setRecipientMode("individual")}
                />
                <ModeButton
                  active={recipientMode === "bulk"}
                  description="Use filters for many students."
                  label="Bulk"
                  onClick={() => setRecipientMode("bulk")}
                />
                <ModeButton
                  active={recipientMode === "custom"}
                  description="Paste phone numbers directly."
                  label="Custom Numbers"
                  onClick={() => setRecipientMode("custom")}
                />
              </div>

              {recipientMode === "individual" ? (
                <Field label="Student">
                  <Input placeholder="Search by name or phone" />
                </Field>
              ) : null}

              {recipientMode === "custom" ? (
                <Field label="Custom numbers">
                  <Textarea
                    className="min-h-24"
                    onChange={(event) => setCustomNumbers(event.target.value)}
                    placeholder="One number per line or comma separated"
                    value={customNumbers}
                  />
                </Field>
              ) : null}

              {recipientMode === "bulk" ? (
                <div className="rounded-lg border">
                  <div className="flex items-center gap-2 border-b px-4 py-3">
                    <FilterIcon className="size-4 text-primary" />
                    <p className="text-sm font-medium">Filters</p>
                  </div>
                  <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    <OptionSelect label="Class" options={classLevels} />
                    <OptionSelect label="Medium" options={mediums} />
                    <OptionSelect label="Group" options={groups} />
                    <OptionSelect
                      label="Batch"
                      options={batches.map((batch) => batch.name)}
                    />
                    <OptionSelect label="Tags" options={tags} />
                    <OptionSelect
                      label="Status"
                      options={["Active", "Archived"]}
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Recipient type">
                  <Select
                    onValueChange={(value) =>
                      setRecipientType((value || "guardian") as RecipientType)
                    }
                    value={recipientType}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        <SelectItem value="student">Student Phone</SelectItem>
                        <SelectItem value="guardian">Guardian Phone</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="rounded-lg border bg-muted/20 px-4 py-3">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Recipient Summary
                  </p>
                  <p className="mt-1 text-sm font-semibold">{recipientSummary}</p>
                  <p className="text-xs text-muted-foreground">
                    {phoneCount.toLocaleString("en-US")} phone destination
                    {phoneCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Message Composer</CardTitle>
              <CardDescription>
                Write the SMS or start from an existing template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Template">
                  <Select onValueChange={applyTemplate} value={selectedTemplateId}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        <SelectItem value="none">No template</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Variable">
                  <Select onValueChange={insertVariable} value={selectedVariable}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Insert variable" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectGroup>
                        <SelectItem value="none">Select variable</SelectItem>
                        {messageVariables.map((variable) => (
                          <SelectItem key={variable} value={variable}>
                            {variable}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Message">
                <Textarea
                  className="min-h-40 resize-y"
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type your SMS message..."
                  ref={messageTextareaRef}
                  value={message}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Characters" value={messageForCalculation.length} />
                <Stat label="Type" value={messageType} />
                <Stat label="Segments" value={segments} />
                <Stat label="Credits Required" value={creditsRequired} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <EyeIcon className="size-4 text-primary" />
                <CardTitle>Preview</CardTitle>
              </div>
              <CardDescription>SMS preview and sending summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="rounded-xl border bg-muted/20 p-3">
                <div className="rounded-lg border bg-background p-3 shadow-sm">
                  <p className="min-h-24 whitespace-pre-wrap text-sm leading-6">
                    {renderedMessage.trim() || "Your SMS preview will appear here."}
                  </p>
                </div>
                {selectedTemplate ? (
                  <Badge className="mt-3" variant="outline">
                    {selectedTemplate.name}
                  </Badge>
                ) : null}
              </div>

              <SummaryRow label="Recipients" value={recipientSummary} />
              <SummaryRow
                label="Phone destinations"
                value={phoneCount.toLocaleString("en-US")}
              />
              <SummaryRow label="Segment size" value={`${segmentSize} chars`} />
              <SummaryRow label="Segments / recipient" value={segments} />
              <SummaryRow label="Credits required" value={creditsRequired} />
              <SummaryRow
                label="Available credits"
                value={availableCredits.toLocaleString("en-US")}
              />
              <SummaryRow
                danger={remainingCredits < 0}
                label="Remaining after send"
                value={remainingCredits.toLocaleString("en-US")}
              />

              <div className="grid gap-2">
                <Button disabled={!canSend}>
                  <SendIcon />
                  Send Now
                </Button>
                <Button disabled={!message.trim()} variant="outline">
                  <FilePlus2Icon />
                  Save as Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <PhoneIcon className="size-4 text-primary" />
                <CardTitle>Credit Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
              <p className="text-sm text-muted-foreground">
                Credits are calculated as segments per recipient multiplied by
                phone destinations. Any non-ASCII character uses 67
                characters per segment.
              </p>
              {remainingCredits < 0 ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Not enough SMS credits to send this message.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function ModeButton({
  active,
  description,
  label,
  onClick,
}: {
  active: boolean
  description: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={`rounded-lg border px-4 py-3 text-left transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "bg-background hover:bg-muted/50"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="mt-1 block text-xs text-muted-foreground">
        {description}
      </span>
    </button>
  )
}

function OptionSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <Field label={label}>
      <Select defaultValue="all">
        <SelectTrigger className="h-9 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function SummaryRow({
  danger,
  label,
  value,
}: {
  danger?: boolean
  label: string
  value: number | string
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={danger ? "font-semibold text-destructive" : "font-semibold"}>
        {value}
      </span>
    </div>
  )
}

function isGsmSms(messageBody: string) {
  for (const character of messageBody) {
    if (character.charCodeAt(0) > 127) {
      return false
    }
  }

  return true
}

function countCustomNumbers(value: string) {
  return value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean).length
}

function renderPreviewMessage(messageBody: string) {
  return messageBody.replace(/\{\{([a-z_]+)\}\}/g, (match, variableName) => {
    return previewVariableValues[variableName] ?? match
  })
}
