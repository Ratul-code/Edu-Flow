"use client"

import { useRef, useState, type ReactNode } from "react"
import { EyeIcon, FileTextIcon, PlusIcon, Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { SmsTemplateRecord } from "@/lib/data/sms"
import {
  hasLatinLettersOutsideTemplateTokens,
  hasBanglaText,
  stripLatinLettersOutsideTemplateTokens,
} from "@/lib/sms/bangla-text"

type SmsTemplateAction = (formData: FormData) => void | Promise<void>

type SmsTemplatesManagerProps = {
  createAction: SmsTemplateAction
  deleteAction: SmsTemplateAction
  smsSignature: string | null
  templates: SmsTemplateRecord[]
  updateAction: SmsTemplateAction
}

const protectedTemplateKeys = new Set([
  "payment_confirmation:Payment Confirmation",
  "payment_reminder:Payment Reminder",
  "grace_period:Grace Period Notice",
  "overdue_warning:Overdue Warning",
])

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
  amount: "৳২,০০০",
  coaching_name: "উত্তরা কোচিং সেন্টার",
  coaching_phone: "০১৭১২-৩৪৫৬৭৮",
  due_amount: "৳১,২০০",
  due_date: "১০ জুন ২০২৬",
  guardian_name: "নাসিমা আক্তার",
  month: "জুন ২০২৬",
  paid_amount: "৳৮০০",
  payment_date: "৫ জুন ২০২৬",
  receipt_link: "",
  student_name: "রাহিম উদ্দিন",
}

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

export function SmsTemplatesManager({
  createAction,
  deleteAction,
  smsSignature,
  templates,
  updateAction,
}: SmsTemplatesManagerProps) {
  const firstTemplate = templates[0]
  const [selectedId, setSelectedId] = useState(firstTemplate?.id ?? "new")
  const selectedTemplate = templates.find((template) => template.id === selectedId)
  const [name, setName] = useState(selectedTemplate?.name ?? "")
  const [category, setCategory] = useState<SmsTemplateRecord["category"]>(
    selectedTemplate?.category ?? "general_notice"
  )
  const [isActive, setIsActive] = useState(selectedTemplate?.is_active ?? true)
  const [messageBody, setMessageBody] = useState(
    selectedTemplate?.message_body ?? ""
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isNew = selectedId === "new"
  const isProtectedTemplate = selectedTemplate
    ? isProtectedConstantTemplate(selectedTemplate)
    : false
  const preview = appendSmsSignature(
    renderPreviewMessage(messageBody),
    smsSignature
  )
  const hasInvalidSmsText = hasLatinLettersOutsideTemplateTokens(
    appendSmsSignature(messageBody, smsSignature)
  )
  const hasBanglaSmsText = hasBanglaText(
    appendSmsSignature(messageBody, smsSignature)
  )
  const variables = extractVariables(messageBody)
  const messageType = isGsmSms(preview) ? "GSM" : "Unicode"
  const segmentSize = messageType === "GSM" ? 160 : 67
  const segments = smsSegments(preview)

  function selectTemplate(templateId: string) {
    if (templateId === "new") {
      setSelectedId("new")
      setName("")
      setCategory("general_notice")
      setIsActive(true)
      setMessageBody("")
      return
    }

    const template = templates.find((item) => item.id === templateId)

    if (!template) {
      return
    }

    setSelectedId(template.id)
    setName(template.name)
    setCategory(template.category)
    setIsActive(template.is_active)
    setMessageBody(stripLatinLettersOutsideTemplateTokens(template.message_body))
  }

  function insertVariable(variableName: string) {
    if (variableName === "none") {
      return
    }

    const token = `{{${variableName}}}`
    const textarea = textareaRef.current
    const selectionStart = textarea?.selectionStart ?? messageBody.length
    const selectionEnd = textarea?.selectionEnd ?? messageBody.length
    const nextMessage = stripLatinLettersOutsideTemplateTokens(
      `${messageBody.slice(0, selectionStart)}${token}${messageBody.slice(
        selectionEnd
      )}`
    )

    setMessageBody(nextMessage)

    window.requestAnimationFrame(() => {
      const cursorPosition = selectionStart + token.length
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(cursorPosition, cursorPosition)
    })
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <FileTextIcon className="size-4 text-primary" />
            <CardTitle>Template Library</CardTitle>
          </div>
          <CardDescription>
            Reusable SMS copy for manual sends and automated rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-5">
          <Button
            className="w-full justify-start shadow-sm hover:-translate-y-0.5 hover:shadow-md"
            onClick={() => selectTemplate("new")}
            type="button"
          >
            <PlusIcon />
            New template
          </Button>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                  selectedId === template.id
                    ? "border-primary bg-primary/10"
                    : "bg-background hover:bg-muted/50"
                }`}
                key={template.id}
                onClick={() => selectTemplate(template.id)}
                type="button"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold">
                    {template.name}
                  </span>
                  {isProtectedConstantTemplate(template) ? (
                    <Badge variant="outline">Default</Badge>
                  ) : null}
                </span>
              </button>
            ))}
            {templates.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-6 text-sm text-muted-foreground">
                No templates yet. Create one to use it in SMS Channel and
                Communication Settings.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <form action={isNew ? createAction : updateAction}>
        <Card>
          <CardHeader className="border-b">
            <CardTitle>{isNew ? "Create Template" : "Edit Template"}</CardTitle>
            <CardDescription>
              Insert variables with braces in the message, and preview them with
              dummy values before saving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {!isNew ? (
              <input name="template_id" type="hidden" value={selectedId} />
            ) : null}
            <input name="category" type="hidden" value={category} />
            <input name="is_active" type="hidden" value={isActive ? "true" : "false"} />

            <div className="grid gap-4">
              <Field label="Template name">
                <Input
                  name="name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="June Fee Reminder"
                  readOnly={isProtectedTemplate}
                  required
                  value={name}
                />
              </Field>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <div className="space-y-4">
                <Field label="Variable">
                  <select
                    className={selectClassName}
                    defaultValue="none"
                    onChange={(event) => {
                      insertVariable(event.target.value)
                      event.currentTarget.value = "none"
                    }}
                  >
                    <option value="none">Select variable</option>
                    {messageVariables.map((variable) => (
                      <option key={variable} value={variable}>
                        {variable}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Message">
                  <Textarea
                    className="min-h-56 resize-y"
                    name="message_body"
                    onChange={(event) =>
                      setMessageBody(
                        stripLatinLettersOutsideTemplateTokens(event.target.value)
                      )
                    }
                    placeholder="প্রিয় {{guardian_name}}, {{student_name}} এর {{month}} মাসের বকেয়া {{due_amount}}।"
                    ref={textareaRef}
                    required
                    value={messageBody}
                  />
                </Field>
                {hasInvalidSmsText ? (
                  <p className="text-sm text-destructive">
                    SMS template must be written in Bangla only. Variable tokens are allowed.
                  </p>
                ) : null}
                {messageBody.trim() && !hasBanglaSmsText ? (
                  <p className="text-sm text-destructive">
                    SMS template must include Bangla text.
                  </p>
                ) : null}
              </div>

              <div className="rounded-lg border bg-muted/20">
                <div className="flex items-center gap-2 border-b px-4 py-3">
                  <EyeIcon className="size-4 text-primary" />
                  <p className="text-sm font-medium">Preview</p>
                </div>
                <div className="space-y-4 p-4">
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <p className="min-h-32 whitespace-pre-wrap text-sm leading-6">
                      {preview.trim() || "Template preview will appear here."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Metric label="Characters" value={preview.length} />
                    <Metric label="Type" value={messageType} />
                    <Metric label="Segment size" value={`${segmentSize}`} />
                    <Metric label="Credits / recipient" value={segments} />
                  </div>
                  {smsSignature?.trim() ? (
                    <p className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
                      Signature is appended automatically for sending and credit
                      calculation.
                    </p>
                  ) : null}
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Variables found
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {variables.length > 0 ? (
                        variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {variable}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No variables in this template.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between gap-3 border-t">
            {!isNew && !isProtectedTemplate ? (
              <DeleteTemplateDialog
                action={deleteAction}
                templateId={selectedId}
                templateName={name}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {isProtectedTemplate
                  ? "This fixed template can only have its message body edited."
                  : ""}
              </p>
            )}
            <Button
              disabled={
                !name.trim() ||
                !messageBody.trim() ||
                hasInvalidSmsText ||
                !hasBanglaSmsText
              }
              type="submit"
            >
              {isNew ? "Create template" : "Save template"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

function DeleteTemplateDialog({
  action,
  templateId,
  templateName,
}: {
  action: SmsTemplateAction
  templateId: string
  templateName: string
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            className="bg-red-700 text-white hover:bg-red-800"
            type="button"
            variant="destructive"
          />
        }
      >
        <Trash2Icon />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete template?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {templateName || "this template"} from template
            selectors. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={action}>
          <input name="template_id" type="hidden" value={templateId} />
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button type="button" variant="outline" />}>
              Cancel
            </AlertDialogCancel>
            <Button
              className="border-red-700 bg-red-700 text-white hover:bg-red-800"
              type="submit"
            >
              Delete template
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function renderPreviewMessage(messageBody: string) {
  return messageBody.replace(/\{\{([a-z_]+)\}\}/g, (match, variableName) => {
    return previewVariableValues[variableName] ?? match
  })
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border bg-background px-2.5 py-2">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  )
}

function appendSmsSignature(messageBody: string, signature: string | null) {
  const normalizedMessage = messageBody.trimEnd()
  const normalizedSignature = signature?.trim()

  if (!normalizedSignature) {
    return normalizedMessage
  }

  return `${normalizedMessage}\n${normalizedSignature}`
}

function smsSegments(messageBody: string) {
  return Math.max(
    Math.ceil(Math.max(messageBody.length, 1) / (isGsmSms(messageBody) ? 160 : 67)),
    1
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

function isProtectedConstantTemplate(template: SmsTemplateRecord) {
  return (
    template.is_default ||
    protectedTemplateKeys.has(`${template.category}:${template.name}`)
  )
}

function extractVariables(messageBody: string) {
  return Array.from(
    new Set(
      Array.from(messageBody.matchAll(/\{\{([a-z_]+)\}\}/g)).map(
        (match) => match[1]
      )
    )
  )
}
