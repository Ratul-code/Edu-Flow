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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import type { BatchRecord } from "@/lib/data/batches"
import type { SmsTemplateRecord } from "@/lib/data/sms"
import type { StudentRecord } from "@/lib/data/students"
import {
  hasLatinLettersOutsideTemplateTokens,
  hasBanglaText,
  stripLatinLettersOutsideTemplateTokens,
} from "@/lib/sms/bangla-text"

type RecipientMode = "individual" | "bulk" | "custom"
type RecipientType = "student" | "guardian" | "both"

type SmsChannelComposeProps = {
  availableCredits: number
  assignedBatchIdsByStudent: Record<string, string[]>
  batches: BatchRecord[]
  classLevels: string[]
  groups: string[]
  mediums: string[]
  sendAction: (formData: FormData) => void | Promise<void>
  smsMode: "demo" | "production"
  smsSignature: string | null
  students: StudentRecord[]
  tags: string[]
  templates: SmsTemplateRecord[]
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

const nativeSelectClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

export function SmsChannelCompose({
  availableCredits,
  assignedBatchIdsByStudent,
  batches,
  classLevels,
  groups,
  mediums,
  sendAction,
  smsMode,
  smsSignature,
  students,
  tags,
  templates,
}: SmsChannelComposeProps) {
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("bulk")
  const [recipientType, setRecipientType] = useState<RecipientType>("guardian")
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [classLevel, setClassLevel] = useState("all")
  const [medium, setMedium] = useState("all")
  const [groupName, setGroupName] = useState("all")
  const [batchId, setBatchId] = useState("all")
  const [tag, setTag] = useState("all")
  const [bulkSheetOpen, setBulkSheetOpen] = useState(false)
  const [selectedBulkStudentIds, setSelectedBulkStudentIds] = useState<
    Set<string>
  >(new Set())
  const [selectedTemplateId, setSelectedTemplateId] = useState("none")
  const [selectedVariable, setSelectedVariable] = useState("none")
  const [message, setMessage] = useState("")
  const [studentSearch, setStudentSearch] = useState("")
  const [customNumbers, setCustomNumbers] = useState("")
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId
  )
  const matchingStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase()

    if (!query) {
      return students
    }

    return students.filter((student) => {
      return [
        student.name,
        student.phone,
        student.guardian_phone,
        student.guardian_name,
      ].some((value) => value?.toLowerCase().includes(query))
    })
  }, [studentSearch, students])
  const selectedStudent = students.find((item) => item.id === selectedStudentId)
  const filteredBulkStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesClass =
        classLevel === "all" || student.class_level === classLevel
      const matchesMedium = medium === "all" || student.medium === medium
      const matchesGroup = groupName === "all" || student.group_name === groupName
      const matchesBatch =
        batchId === "all" ||
        (assignedBatchIdsByStudent[student.id] ?? []).includes(batchId)
      const matchesTag = tag === "all" || student.tags?.includes(tag)

      return (
        matchesClass &&
        matchesMedium &&
        matchesGroup &&
        matchesBatch &&
        matchesTag
      )
    })
  }, [
    assignedBatchIdsByStudent,
    batchId,
    classLevel,
    groupName,
    medium,
    students,
    tag,
  ])
  const selectedBulkCount = selectedBulkStudentIds.size
  const selectedBulkStudents = useMemo(
    () => students.filter((student) => selectedBulkStudentIds.has(student.id)),
    [selectedBulkStudentIds, students]
  )
  const customRecipientCount = countCustomNumbers(customNumbers)
  const recipientCount =
    recipientMode === "individual"
      ? selectedStudentId
        ? 1
        : 0
      : recipientMode === "custom"
        ? customRecipientCount
        : selectedBulkCount
  const recipientMultiplier = recipientType === "both" ? 2 : 1
  const phoneCount = recipientCount * recipientMultiplier
  const renderedMessage = renderPreviewMessage(message)
  const signedPreviewMessage = appendSmsSignature(renderedMessage, smsSignature)
  const messageForCalculation = signedPreviewMessage.trim()
    ? signedPreviewMessage
    : appendSmsSignature(message, smsSignature)
  const hasInvalidSmsText = hasLatinLettersOutsideTemplateTokens(
    appendSmsSignature(message, smsSignature)
  )
  const hasBanglaSmsText = hasBanglaText(appendSmsSignature(message, smsSignature))
  const messageType = isGsmSms(messageForCalculation) ? "GSM" : "Unicode"
  const segmentSize = messageType === "GSM" ? 160 : 67
  const segments = Math.max(
    Math.ceil(Math.max(messageForCalculation.length, 1) / segmentSize),
    1
  )
  const creditsRequired = segments * phoneCount
  const remainingCredits = availableCredits - creditsRequired
  const canSend =
    message.trim().length > 0 &&
    phoneCount > 0 &&
    remainingCredits >= 0 &&
    !hasInvalidSmsText &&
    hasBanglaSmsText &&
    (recipientMode !== "individual" || Boolean(selectedStudentId)) &&
    (recipientMode !== "bulk" || selectedBulkCount > 0)

  const recipientSummary = useMemo(() => {
    if (recipientMode === "individual") {
      return selectedStudent ? selectedStudent.name : "No student selected"
    }

    if (recipientMode === "custom") {
      return `${customRecipientCount.toLocaleString("en-US")} custom number${
        customRecipientCount === 1 ? "" : "s"
      }`
    }

    return `${selectedBulkCount.toLocaleString("en-US")} selected student${
      selectedBulkCount === 1 ? "" : "s"
    }`
  }, [
    customRecipientCount,
    recipientMode,
    selectedStudent,
    selectedBulkCount,
  ])

  function applyTemplate(value: string) {
    setSelectedTemplateId(value)

    const template = templates.find((item) => item.id === value)

    if (template) {
      setMessage(stripLatinLettersOutsideTemplateTokens(template.message_body))
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

  function toggleBulkStudent(studentId: string) {
    setSelectedBulkStudentIds((current) => {
      const next = new Set(current)

      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }

      return next
    })
  }

  function toggleVisibleBulkStudents() {
    setSelectedBulkStudentIds((current) => {
      const next = new Set(current)
      const visibleIds = filteredBulkStudents.map((student) => student.id)
      const everyVisibleSelected =
        visibleIds.length > 0 && visibleIds.every((id) => next.has(id))

      if (everyVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id))
      } else {
        visibleIds.forEach((id) => next.add(id))
      }

      return next
    })
  }

  return (
    <form action={sendAction} className="space-y-5 p-4 md:p-6">
      <input name="recipient_mode" type="hidden" value={recipientMode} />
      {recipientMode === "bulk"
        ? Array.from(selectedBulkStudentIds).map((studentId) => (
            <input
              key={studentId}
              name="student_ids"
              type="hidden"
              value={studentId}
            />
          ))
        : null}
      {smsMode === "demo" ? (
        <div className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
          Demo SMS Mode
        </div>
      ) : null}
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
                  <input name="student_id" type="hidden" value={selectedStudentId} />
                  <input
                    className={nativeSelectClassName}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    placeholder="Search by student name, phone, or guardian phone"
                    type="search"
                    value={studentSearch}
                  />
                  <div className="h-[205px] overflow-y-auto rounded-lg border">
                    {matchingStudents.length > 0 ? (
                      matchingStudents.map((student) => {
                        const active = student.id === selectedStudentId

                        return (
                          <button
                            className={`grid min-h-[68px] w-full gap-1 border-b px-4 py-3 text-left last:border-b-0 transition-colors ${
                              active
                                ? "bg-primary/10 text-primary"
                                : "bg-background hover:bg-muted/50"
                            }`}
                            key={student.id}
                            onClick={() => setSelectedStudentId(student.id)}
                            type="button"
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="truncate text-sm font-semibold">
                                {student.name}
                              </span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {student.class_level ?? "No class"}
                              </span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {[student.phone, student.guardian_phone]
                                .filter(Boolean)
                                .join(" · ") || "No phone saved"}
                            </span>
                          </button>
                        )
                      })
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                        No students match this search.
                      </div>
                    )}
                  </div>
                  {students.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No active students are available for selection.
                    </p>
                  ) : null}
                  {selectedStudent ? (
                    <p className="text-xs text-muted-foreground">
                      Selected: {selectedStudent.name}
                    </p>
                  ) : null}
                </Field>
              ) : null}

              {recipientMode === "custom" ? (
                <Field label="Custom numbers">
                  <Textarea
                    className="min-h-24"
                    name="custom_numbers"
                    onChange={(event) => setCustomNumbers(event.target.value)}
                    placeholder="One number per line or comma separated"
                    value={customNumbers}
                  />
                </Field>
              ) : null}

              {recipientMode === "bulk" ? (
                <div className="space-y-3">
                  <div>
                    <Sheet open={bulkSheetOpen} onOpenChange={setBulkSheetOpen}>
                      <SheetTrigger
                        render={
                          <Button type="button">
                            <UsersIcon />
                            Select Students
                          </Button>
                        }
                      />
                      <SheetContent className="w-full overflow-hidden p-0 data-[side=right]:!w-[92vw] data-[side=right]:!max-w-5xl">
                        <SheetHeader className="px-6 py-5">
                          <SheetTitle>Select Students</SheetTitle>
                          <SheetDescription>
                            Filter the student list, then choose who receives this SMS.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-6 py-4">
                          <div className="rounded-lg border">
                            <div className="flex items-center gap-2 border-b px-4 py-2.5">
                              <FilterIcon className="size-4 text-primary" />
                              <p className="text-sm font-medium">Filters</p>
                            </div>
                            <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-5">
                              <OptionSelect
                                label="Class"
                                name="bulk_class_level"
                                onChange={setClassLevel}
                                options={classLevels}
                                value={classLevel}
                              />
                              <OptionSelect
                                label="Medium"
                                name="bulk_medium"
                                onChange={setMedium}
                                options={mediums}
                                value={medium}
                              />
                              <OptionSelect
                                label="Group"
                                name="bulk_group_name"
                                onChange={setGroupName}
                                options={groups}
                                value={groupName}
                              />
                              <OptionSelect
                                label="Batch"
                                name="bulk_batch"
                                onChange={setBatchId}
                                options={batches.map((batch) => ({
                                  label: batch.name,
                                  value: batch.id,
                                }))}
                                value={batchId}
                              />
                              <OptionSelect
                                label="Tags"
                                name="bulk_tag"
                                onChange={setTag}
                                options={tags}
                                value={tag}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-muted-foreground">
                              {filteredBulkStudents.length.toLocaleString("en-US")} shown,
                              {" "}
                              {selectedBulkCount.toLocaleString("en-US")} selected
                            </div>
                            <Button
                              disabled={filteredBulkStudents.length === 0}
                              onClick={toggleVisibleBulkStudents}
                              type="button"
                              variant="outline"
                            >
                              {filteredBulkStudents.length > 0 &&
                              filteredBulkStudents.every((student) =>
                                selectedBulkStudentIds.has(student.id)
                              )
                                ? "Unselect shown"
                                : "Select shown"}
                            </Button>
                          </div>

                          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border">
                            {filteredBulkStudents.length > 0 ? (
                              filteredBulkStudents.map((student) => {
                                const checked = selectedBulkStudentIds.has(student.id)

                                return (
                                  <button
                                    aria-pressed={checked}
                                    className={`grid w-full cursor-pointer grid-cols-[auto_1fr] items-start gap-3 border-b px-4 py-3 text-left last:border-b-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                      checked
                                        ? "bg-primary/10"
                                        : "bg-background hover:bg-muted/50"
                                    }`}
                                    key={student.id}
                                    onClick={() => toggleBulkStudent(student.id)}
                                    type="button"
                                  >
                                    <Checkbox
                                      aria-hidden="true"
                                      checked={checked}
                                      tabIndex={-1}
                                      className="pointer-events-none mt-0.5"
                                    />
                                    <span className="grid gap-1">
                                      <span className="flex items-center justify-between gap-3">
                                        <span className="truncate text-sm font-semibold">
                                          {student.name}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                          {student.class_level ?? "No class"}
                                        </span>
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {[student.phone, student.guardian_phone]
                                          .filter(Boolean)
                                          .join(" · ") || "No phone saved"}
                                      </span>
                                    </span>
                                  </button>
                                )
                              })
                            ) : (
                              <div className="flex h-full min-h-48 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                                No students match these filters.
                              </div>
                            )}
                          </div>
                        </div>
                        <SheetFooter className="border-t bg-muted/20 px-6 py-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                              {selectedBulkCount.toLocaleString("en-US")} student
                              {selectedBulkCount === 1 ? "" : "s"} selected
                            </p>
                            <div className="flex gap-2">
                              <Button
                                disabled={selectedBulkCount === 0}
                                onClick={() => setSelectedBulkStudentIds(new Set())}
                                type="button"
                                variant="outline"
                              >
                                Clear
                              </Button>
                              <Button
                                onClick={() => setBulkSheetOpen(false)}
                                type="button"
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  </div>
                  {selectedBulkStudents.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedBulkStudents.slice(0, 6).map((student) => (
                        <Badge key={student.id} variant="outline">
                          {student.name}
                        </Badge>
                      ))}
                      {selectedBulkStudents.length > 6 ? (
                        <Badge variant="secondary">
                          +{selectedBulkStudents.length - 6} more
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Recipient type">
                  <Select
                    name="recipient_type"
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
                  <select
                    className={nativeSelectClassName}
                    onChange={(event) => applyTemplate(event.target.value)}
                    value={selectedTemplateId}
                  >
                    <option value="none">No template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Variable">
                  <select
                    className={nativeSelectClassName}
                    onChange={(event) => insertVariable(event.target.value)}
                    value={selectedVariable}
                  >
                    <option value="none">Select variable</option>
                    {messageVariables.map((variable) => (
                      <option key={variable} value={variable}>
                        {variable}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Message">
                <Textarea
                  className="min-h-40 resize-y"
                  name="message_body"
                  onChange={(event) =>
                    setMessage(
                      stripLatinLettersOutsideTemplateTokens(event.target.value)
                    )
                  }
                  placeholder="বাংলায় এসএমএস লিখুন..."
                  ref={messageTextareaRef}
                  value={message}
                />
              </Field>
              {hasInvalidSmsText ? (
                <p className="text-sm text-destructive">
                  SMS message must be written in Bangla only. Variable tokens are allowed.
                </p>
              ) : null}
              {message.trim() && !hasBanglaSmsText ? (
                <p className="text-sm text-destructive">
                  SMS message must include Bangla text.
                </p>
              ) : null}
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
                    {signedPreviewMessage.trim() ||
                      "Your SMS preview will appear here."}
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
              <SummaryRow
                label="Characters"
                value={messageForCalculation.length.toLocaleString("en-US")}
              />
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
                <Button disabled={!canSend} type="submit">
                  <SendIcon />
                  Send Now
                </Button>
                <Button disabled={!message.trim()} type="button" variant="outline">
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
    </form>
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

function OptionSelect({
  label,
  name,
  onChange,
  options,
  value,
}: {
  label: string
  name: string
  onChange: (value: string) => void
  options: Array<string | { label: string; value: string }>
  value: string
}) {
  return (
    <Field label={label}>
      <Select
        name={name}
        onValueChange={(nextValue) => onChange(nextValue ?? "all")}
        value={value}
      >
        <SelectTrigger className="h-9 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
            {options.map((option) => {
              const optionValue = typeof option === "string" ? option : option.value
              const optionLabel = typeof option === "string" ? option : option.label

              return (
                <SelectItem key={optionValue} value={optionValue}>
                  {optionLabel}
                </SelectItem>
              )
            })}
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

function appendSmsSignature(messageBody: string, signature: string | null) {
  const normalizedMessage = messageBody.trimEnd()
  const normalizedSignature = signature?.trim()

  if (!normalizedSignature) {
    return normalizedMessage
  }

  return `${normalizedMessage}\n${normalizedSignature}`
}
