import * as React from "react"
import { Search, Plus, Copy, Edit2, MessageSquare, Mail, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Category = "all" | "payment" | "fee-reminder" | "overdue" | "exam" | "holiday" | "general"
type Channel = "all" | "sms" | "email" | "whatsapp"

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "payment", label: "Payment" },
  { id: "fee-reminder", label: "Fee Reminder" },
  { id: "overdue", label: "Overdue Warning" },
  { id: "exam", label: "Exam Notice" },
  { id: "holiday", label: "Holiday Notice" },
  { id: "general", label: "General" },
]

const templates = [
  {
    id: 1,
    name: "Fee Reminder",
    category: "fee-reminder",
    channels: ["sms"],
    body: "Dear {guardian_name}, your child {student_name}'s monthly fee of ৳{amount} is due by {due_date}. Please pay at the academy or contact us. - Edu Flow Academy",
    usageCount: 8,
    lastUsed: "Jun 1, 2025",
  },
  {
    id: 2,
    name: "Payment Received Confirmation",
    category: "payment",
    channels: ["sms"],
    body: "Dear {guardian_name}, we have received ৳{amount} for {student_name} (Ref: {ref_no}). Thank you! - Edu Flow Academy",
    usageCount: 24,
    lastUsed: "Jun 5, 2025",
  },
  {
    id: 3,
    name: "Overdue Warning",
    category: "overdue",
    channels: ["sms"],
    body: "Dear {guardian_name}, {student_name}'s fee is overdue by {days} days. Outstanding: ৳{amount}. Please contact us immediately to avoid suspension. - Edu Flow",
    usageCount: 3,
    lastUsed: "May 28, 2025",
  },
  {
    id: 4,
    name: "Exam Date Notice",
    category: "exam",
    channels: ["sms"],
    body: "Dear {guardian_name}, {student_name}'s {exam_type} exam is scheduled on {exam_date} at {time}. Ensure punctual attendance with required materials. - Edu Flow",
    usageCount: 5,
    lastUsed: "May 15, 2025",
  },
  {
    id: 5,
    name: "Holiday Announcement",
    category: "holiday",
    channels: ["sms"],
    body: "Dear Parent/Guardian, Edu Flow Academy will remain closed on {date} for {occasion}. Classes resume on {resume_date}. Thank you for your understanding.",
    usageCount: 6,
    lastUsed: "May 20, 2025",
  },
  {
    id: 6,
    name: "Batch Rescheduled",
    category: "general",
    channels: ["sms"],
    body: "Dear {guardian_name}, the {batch_name} class on {old_date} has been rescheduled to {new_date} at {new_time}. We apologize for the inconvenience. - Edu Flow",
    usageCount: 2,
    lastUsed: "May 28, 2025",
  },
  {
    id: 7,
    name: "Grace Period Warning",
    category: "overdue",
    channels: ["sms"],
    body: "NOTICE: {student_name}'s account is in grace period. Fee due: ৳{amount}. Payment must be received by {deadline} to avoid class suspension. - Edu Flow Academy",
    usageCount: 1,
    lastUsed: "May 10, 2025",
  },
  {
    id: 8,
    name: "Welcome New Student",
    category: "general",
    channels: ["sms"],
    body: "Welcome to Edu Flow Academy! Dear {guardian_name}, {student_name} has been enrolled in {batch_name}. First class: {start_date}. For help: {contact}.",
    usageCount: 12,
    lastUsed: "Jun 3, 2025",
  },
  {
    id: 9,
    name: "Fee Reminder Email",
    category: "fee-reminder",
    channels: ["email"],
    body: "Dear {guardian_name},\n\nThis is a reminder that {student_name}'s monthly fee of ৳{amount} is due on {due_date}.\n\nPlease visit the academy or pay online.\n\nThank you,\nEdu Flow Academy",
    usageCount: 0,
    lastUsed: "—",
  },
]

function ChannelIcon({ channel }: { channel: string }) {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    sms: { icon: MessageSquare, color: "text-primary" },
    email: { icon: Mail, color: "text-blue-600" },
    whatsapp: { icon: Smartphone, color: "text-green-600" },
  }
  const cfg = map[channel]
  if (!cfg) return null
  const Icon = cfg.icon
  return <Icon className={`size-3 ${cfg.color}`} />
}

export function CommTemplates() {
  const [search, setSearch] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<Category>("all")
  const [channelFilter, setChannelFilter] = React.useState<Channel>("all")

  const filtered = templates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === "all" || t.category === activeCategory
    const matchChannel = channelFilter === "all" || t.channels.includes(channelFilter)
    return matchSearch && matchCategory && matchChannel
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Templates</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{templates.length} templates across {categories.length - 1} categories</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New Template
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Channel filter */}
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          {(["all", "sms", "email", "whatsapp"] as Channel[]).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded capitalize transition-colors",
                channelFilter === ch
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {ch === "all" ? "All" : ch.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((t) => (
          <Card key={t.id} className="py-0 gap-0 hover:shadow-sm transition-shadow group">
            <CardHeader className="px-4 pt-4 pb-3 border-b">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {t.channels.map((ch) => (
                      <span
                        key={ch}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          ch === "sms" ? "bg-primary/10 text-primary border-primary/20" :
                          ch === "email" ? "bg-blue-500/10 text-blue-600 border-blue-200" :
                          "bg-green-500/10 text-green-600 border-green-200"
                        )}
                      >
                        <ChannelIcon channel={ch} />
                        {ch.toUpperCase()}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {categories.find(c => c.id === t.category)?.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon" className="size-6">
                    <Copy className="size-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-6">
                    <Edit2 className="size-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-mono">
                {t.body}
              </p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">
                  Used {t.usageCount}×
                  {t.lastUsed !== "—" && ` · Last: ${t.lastUsed}`}
                </span>
                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
            <MessageSquare className="size-8 opacity-40" />
            <p className="text-sm">No templates found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
