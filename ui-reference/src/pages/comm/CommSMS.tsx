import * as React from "react"
import {
  Send,
  Clock,
  FileText,
  Users,
  User,
  ChevronDown,
  Phone,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type RecipientMode = "individual" | "bulk"
type IndividualTarget = "student" | "guardian" | "both" | "custom"

const templates = [
  { id: "fee-reminder", name: "Fee Reminder", body: "Dear {guardian_name}, your child {student_name}'s monthly fee of ৳{amount} is due. Please pay by {due_date}. - Edu Flow Academy" },
  { id: "overdue", name: "Overdue Warning", body: "Dear {guardian_name}, {student_name}'s fee is overdue by {days} days. Amount due: ৳{amount}. Please contact us immediately. - Edu Flow" },
  { id: "exam-notice", name: "Exam Notice", body: "Dear {guardian_name}, {student_name}'s exam is scheduled on {exam_date} at {time}. Please ensure punctual attendance. - Edu Flow Academy" },
  { id: "holiday", name: "Holiday Notice", body: "Dear Parent, Edu Flow Academy will remain closed on {date} for {occasion}. Classes will resume on {resume_date}. Thank you." },
  { id: "batch-reschedule", name: "Batch Rescheduled", body: "Dear {guardian_name}, the {batch_name} class on {old_date} has been rescheduled to {new_date} at {new_time}. - Edu Flow" },
]

const MAX_CHARS = 160

export function CommSMS() {
  const [mode, setMode] = React.useState<RecipientMode>("bulk")
  const [individualTarget, setIndividualTarget] = React.useState<IndividualTarget>("both")
  const [message, setMessage] = React.useState("")
  const [selectedTemplate, setSelectedTemplate] = React.useState("")
  const [customNumber, setCustomNumber] = React.useState("")

  const charCount = message.length
  const smsCount = Math.ceil(charCount / MAX_CHARS) || 1
  const remaining = MAX_CHARS * smsCount - charCount

  const handleTemplateSelect = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId)
    if (tpl) {
      setMessage(tpl.body)
      setSelectedTemplate(templateId)
    }
  }

  const recipientSummary = mode === "bulk"
    ? { students: 128, guardians: 115, valid: 124, sms: smsCount * 124 }
    : { students: 1, guardians: 1, valid: 1, sms: smsCount }

  return (
    <div className="p-6 space-y-4">
      {/* Top actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" className="gap-1.5">
          <Send className="size-3.5" />
          Send Now
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Clock className="size-3.5" />
          Schedule
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5">
          <FileText className="size-3.5" />
          Use Template
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left column: Recipient + Composer */}
        <div className="xl:col-span-2 space-y-4">
          {/* Recipient Selection */}
          <Card className="py-0 gap-0">
            <CardHeader className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Recipients</CardTitle>
                <div className="flex rounded-md border border-border overflow-hidden">
                  {(["individual", "bulk"] as RecipientMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium capitalize transition-colors",
                        mode === m
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {m === "individual" ? <User className="size-3 inline mr-1" /> : <Users className="size-3 inline mr-1" />}
                      {m === "individual" ? "Individual" : "Bulk"}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {mode === "individual" ? (
                <div className="space-y-4">
                  {/* Individual target selector */}
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Send To</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["student", "guardian", "both", "custom"] as IndividualTarget[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setIndividualTarget(t)}
                          className={cn(
                            "px-3 py-2 text-xs font-medium rounded-md border transition-colors capitalize",
                            individualTarget === t
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border bg-card text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {t === "custom" ? "Custom No." : t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {individualTarget !== "custom" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium mb-1.5 block">Student</Label>
                        <Select>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select student..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rashed">Rashed Karim</SelectItem>
                            <SelectItem value="nadia">Nadia Islam</SelectItem>
                            <SelectItem value="tanvir">Tanvir Ahmed</SelectItem>
                            <SelectItem value="sadia">Sadia Akter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {(individualTarget === "guardian" || individualTarget === "both") && (
                        <div>
                          <Label className="text-xs font-medium mb-1.5 block">Guardian Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <Input className="pl-8 h-8 text-sm" placeholder="Auto-filled from student" readOnly value="01711-234567" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs font-medium mb-1.5 block">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                          className="pl-8 h-8 text-sm"
                          placeholder="+880 17XX-XXXXXX"
                          value={customNumber}
                          onChange={(e) => setCustomNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Bulk filters */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Class", placeholder: "All classes" },
                      { label: "Medium", placeholder: "All mediums" },
                      { label: "Group", placeholder: "All groups" },
                      { label: "Batch", placeholder: "All batches" },
                    ].map(({ label, placeholder }) => (
                      <div key={label}>
                        <Label className="text-xs font-medium mb-1.5 block">{label}</Label>
                        <Select>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder={placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {label === "Class" && <>
                              <SelectItem value="ssc">SSC</SelectItem>
                              <SelectItem value="hsc">HSC</SelectItem>
                              <SelectItem value="class8">Class 8</SelectItem>
                            </>}
                            {label === "Medium" && <>
                              <SelectItem value="bangla">Bangla</SelectItem>
                              <SelectItem value="english">English</SelectItem>
                            </>}
                            {label === "Group" && <>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="commerce">Commerce</SelectItem>
                              <SelectItem value="arts">Arts</SelectItem>
                            </>}
                            {label === "Batch" && <>
                              <SelectItem value="ssc-science-a">SSC Science A</SelectItem>
                              <SelectItem value="hsc-commerce-b">HSC Commerce B</SelectItem>
                              <SelectItem value="class-8-math">Class 8 Math</SelectItem>
                            </>}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}

                    {[
                      { label: "Tags", placeholder: "All tags" },
                      { label: "Status", placeholder: "All status" },
                    ].map(({ label, placeholder }) => (
                      <div key={label}>
                        <Label className="text-xs font-medium mb-1.5 block">{label}</Label>
                        <Select>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder={placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {label === "Tags" && <>
                              <SelectItem value="scholarship">Scholarship</SelectItem>
                              <SelectItem value="new">New Student</SelectItem>
                            </>}
                            {label === "Status" && <>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="due">Fee Due</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </>}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  {/* Recipient summary card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {[
                      { label: "Students Matched", value: recipientSummary.students, color: "text-primary" },
                      { label: "Guardians Matched", value: recipientSummary.guardians, color: "text-info" },
                      { label: "Valid Numbers", value: recipientSummary.valid, color: "text-success" },
                      { label: "Est. SMS Count", value: recipientSummary.sms, color: "text-warning" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-md border border-border bg-muted/40 px-3 py-2">
                        <div className={`text-lg font-bold ${color}`}>{value}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS Composer */}
          <Card className="py-0 gap-0">
            <CardHeader className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Message Composer</CardTitle>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="h-7 w-[180px] text-xs">
                    <FileText className="size-3 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Use template..." />
                    <ChevronDown className="size-3 ml-auto" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-sm">{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <Textarea
                  placeholder="Type your message here, or select a template above..."
                  className="min-h-[120px] text-sm resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-2">
                    {charCount > MAX_CHARS && (
                      <span className="flex items-center gap-1 text-xs text-warning">
                        <AlertCircle className="size-3" />
                        Multi-part SMS ({smsCount} parts)
                      </span>
                    )}
                  </div>
                  <span className={cn("text-xs", remaining < 20 ? "text-destructive" : "text-muted-foreground")}>
                    {charCount} / {MAX_CHARS * smsCount} chars ({smsCount} SMS)
                  </span>
                </div>
              </div>

              {/* Variable hints */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground">Variables:</span>
                {["{student_name}", "{guardian_name}", "{amount}", "{due_date}", "{batch_name}"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setMessage((prev) => prev + v)}
                    className="text-xs px-2 py-0.5 rounded border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors font-mono"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Phone Preview */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Preview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">How it looks on a phone</p>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative w-[200px]">
              {/* Phone frame */}
              <div className="relative bg-foreground rounded-[2rem] p-1.5 shadow-xl">
                <div className="bg-background rounded-[1.6rem] overflow-hidden">
                  {/* Notch */}
                  <div className="flex justify-center pt-2.5 pb-1">
                    <div className="w-16 h-1.5 bg-muted-foreground/20 rounded-full" />
                  </div>

                  {/* Screen content */}
                  <div className="px-2 pb-4 min-h-[360px] bg-background">
                    {/* SMS header */}
                    <div className="flex items-center gap-2 py-2 border-b border-border/50 mb-3">
                      <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                        <MessageSquare className="size-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-foreground">Edu Flow</p>
                        <p className="text-[9px] text-muted-foreground">SMS</p>
                      </div>
                    </div>

                    {/* Message bubble */}
                    {message ? (
                      <div className="mx-1">
                        <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 max-w-full">
                          <p className="text-[10px] leading-relaxed text-foreground break-words whitespace-pre-wrap">
                            {message}
                          </p>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1 ml-1">
                          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {smsCount > 1 && ` · ${smsCount} parts`}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 gap-2 opacity-40">
                        <MessageSquare className="size-8 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground text-center">
                          Type a message to preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Send summary */}
          {message && (
            <Card className="py-3 gap-0">
              <CardContent className="px-4">
                <h4 className="text-xs font-semibold mb-2">Send Summary</h4>
                <div className="space-y-1.5">
                  {[
                    { label: "Recipients", value: mode === "bulk" ? `${recipientSummary.valid} valid numbers` : "1 number" },
                    { label: "SMS parts", value: `${smsCount} per recipient` },
                    { label: "Total SMS", value: `${mode === "bulk" ? recipientSummary.valid * smsCount : smsCount}` },
                    { label: "Characters", value: `${charCount}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 gap-1.5 h-8 text-xs">
                    <Send className="size-3" />
                    Send
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                    <Clock className="size-3" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
