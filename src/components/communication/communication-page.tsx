"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  CopyIcon,
  Edit2Icon,
  FileTextIcon,
  MailIcon,
  MegaphoneIcon,
  MessageSquareIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  Settings2Icon,
  SmartphoneIcon,
  TrendingUpIcon,
  UsersIcon,
  XCircleIcon,
  ZapIcon,
} from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/app/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type CommunicationVariant =
  | "overview"
  | "sms"
  | "campaigns"
  | "templates"
  | "logs"
  | "settings"

type CommunicationPageProps = {
  description: string
  eyebrow: string
  tenantName: string
  title: string
  variant: CommunicationVariant
}

type MessageStatus = "completed" | "partial_failed" | "queued" | "failed"
type TemplateCategory =
  | "all"
  | "payment"
  | "fee-reminder"
  | "overdue"
  | "exam"
  | "holiday"
  | "general"
type TemplateChannel = "all" | "sms" | "email" | "whatsapp"
type DeliveryStatus = "delivered" | "failed" | "pending" | "partial"

const kpiCards = [
  {
    label: "Messages Sent",
    value: "1,284",
    change: "+12% this month",
    trend: "up",
    icon: SendIcon,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Scheduled",
    value: "3",
    change: "Next: Jun 10",
    trend: "neutral",
    icon: ClockIcon,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    label: "Active Automations",
    value: "5",
    change: "All running",
    trend: "up",
    icon: ZapIcon,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    label: "Recipients Reached",
    value: "892",
    change: "+48 this week",
    trend: "up",
    icon: UsersIcon,
    color: "text-success",
    bg: "bg-success/10",
  },
]

const recentCampaigns = [
  {
    name: "June Fee Reminder",
    channel: "SMS",
    audience: "All Students",
    recipients: 128,
    status: "completed" as MessageStatus,
    date: "Jun 1",
  },
  {
    name: "Batch Rescheduled - SSC Science A",
    channel: "SMS",
    audience: "SSC Science A",
    recipients: 24,
    status: "completed" as MessageStatus,
    date: "May 28",
  },
  {
    name: "Overdue Fee Warning",
    channel: "SMS",
    audience: "Due Students",
    recipients: 18,
    status: "queued" as MessageStatus,
    date: "Jun 10",
  },
  {
    name: "Teacher Vacancy Announcement",
    channel: "Email",
    audience: "All",
    recipients: 0,
    status: "queued" as MessageStatus,
    date: "Jun 5",
  },
]

const recentActivity = [
  {
    text: "June Fee Reminder sent to 128 students",
    time: "Jun 1, 2:14 PM",
    icon: CheckCircle2Icon,
    color: "text-success",
  },
  {
    text: "Overdue Warning scheduled for Jun 10",
    time: "May 31, 9:00 AM",
    icon: ClockIcon,
    color: "text-warning",
  },
  {
    text: "5 messages failed to deliver",
    time: "May 28, 7:30 PM",
    icon: AlertCircleIcon,
    color: "text-destructive",
  },
  {
    text: "Holiday Notice sent to 128 students",
    time: "May 20, 11:00 AM",
    icon: CheckCircle2Icon,
    color: "text-success",
  },
]

const automationStatus = [
  {
    name: "Payment Received",
    trigger: "On payment",
    status: "active",
    lastRun: "2h ago",
  },
  {
    name: "Fee Reminder (Day 1)",
    trigger: "Due date",
    status: "active",
    lastRun: "1d ago",
  },
  {
    name: "Overdue Warning",
    trigger: "+7 days overdue",
    status: "active",
    lastRun: "3d ago",
  },
  {
    name: "Exam Reminder",
    trigger: "1 day before exam",
    status: "paused",
    lastRun: "5d ago",
  },
]

const channels = [
  {
    id: "sms",
    name: "SMS",
    icon: MessageSquareIcon,
    status: "active",
    description: "Send text messages to students and guardians",
    stats: "1,284 sent · 99% delivery",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: SmartphoneIcon,
    status: "soon",
    description: "Rich messages with media and quick replies",
    stats: "Coming soon",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  {
    id: "email",
    name: "Email",
    icon: MailIcon,
    status: "soon",
    description: "Send formatted emails and newsletters",
    stats: "Coming soon",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
]

const campaigns = [
  {
    creditsUsed: 256,
    delivered: 125,
    id: 1,
    failed: 3,
    messagePreview: "Dear guardian, June fee is due by 10 Jun 2026.",
    name: "June Fee Reminder",
    channel: "SMS",
    recipients: 128,
    sentAt: "Jun 1, 2026",
    sentBy: "Arif",
    source: "Manual",
    status: "completed" as MessageStatus,
  },
  {
    creditsUsed: 24,
    delivered: 24,
    id: 2,
    failed: 0,
    messagePreview: "SSC Science A class has been rescheduled to 5 PM.",
    name: "Batch Rescheduled - SSC Science A",
    channel: "SMS",
    recipients: 24,
    sentAt: "Jun 3, 2026",
    sentBy: "Arif",
    source: "Manual",
    status: "completed" as MessageStatus,
  },
  {
    creditsUsed: 1,
    delivered: 1,
    id: 3,
    failed: 0,
    messagePreview: "Payment received. Paid ৳2,000 for June 2026.",
    name: "Payment Confirmation",
    channel: "SMS",
    recipients: 1,
    sentAt: "Jun 1, 2026",
    sentBy: "System",
    source: "Payment Auto",
    status: "completed" as MessageStatus,
  },
  {
    creditsUsed: 18,
    delivered: 17,
    id: 4,
    failed: 1,
    messagePreview: "Your fee is overdue. Please pay as soon as possible.",
    name: "Overdue Fee Warning",
    channel: "SMS",
    recipients: 18,
    sentAt: "Jun 10, 2026",
    sentBy: "System",
    source: "Reminder Auto",
    status: "partial_failed" as MessageStatus,
  },
  {
    creditsUsed: 128,
    delivered: 124,
    id: 5,
    failed: 4,
    messagePreview: "The coaching center will remain closed for Eid-ul-Adha.",
    name: "Holiday Notice - Eid-ul-Adha",
    channel: "SMS",
    recipients: 128,
    sentAt: "May 20, 2026",
    sentBy: "Nusrat",
    source: "Manual",
    status: "completed" as MessageStatus,
  },
  {
    creditsUsed: 122,
    delivered: 61,
    id: 6,
    failed: 0,
    messagePreview: "June batch test routine has been published.",
    name: "Exam Schedule - June Batch Test",
    channel: "SMS",
    recipients: 61,
    sentAt: "May 15, 2026",
    sentBy: "Arif",
    source: "Manual",
    status: "completed" as MessageStatus,
  },
  {
    creditsUsed: 0,
    delivered: 0,
    failed: 0,
    id: 7,
    messagePreview: "WhatsApp notice draft for new HSC batch.",
    name: "New Batch Announcement",
    channel: "WhatsApp",
    recipients: 128,
    sentAt: "Queued",
    sentBy: "Arif",
    source: "Manual",
    status: "queued" as MessageStatus,
  },
  {
    creditsUsed: 0,
    delivered: 0,
    id: 8,
    failed: 0,
    messagePreview: "Monthly progress report for guardians.",
    name: "Monthly Progress Report",
    channel: "Email",
    recipients: 0,
    sentAt: "Queued",
    sentBy: "Nusrat",
    source: "Manual",
    status: "queued" as MessageStatus,
  },
]

const categories: { id: TemplateCategory; label: string }[] = [
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
    category: "fee-reminder" as TemplateCategory,
    channels: ["sms"],
    body: "Dear {guardian_name}, your child {student_name}'s monthly fee of ৳{amount} is due by {due_date}. Please pay at the academy or contact us. - Edu Flow Academy",
    usageCount: 8,
    lastUsed: "Jun 1, 2025",
  },
  {
    id: 2,
    name: "Payment Received Confirmation",
    category: "payment" as TemplateCategory,
    channels: ["sms"],
    body: "Dear {guardian_name}, we have received ৳{amount} for {student_name} (Ref: {ref_no}). Thank you! - Edu Flow Academy",
    usageCount: 24,
    lastUsed: "Jun 5, 2025",
  },
  {
    id: 3,
    name: "Overdue Warning",
    category: "overdue" as TemplateCategory,
    channels: ["sms"],
    body: "Dear {guardian_name}, {student_name}'s fee is overdue by {days} days. Outstanding: ৳{amount}. Please contact us immediately to avoid suspension. - Edu Flow",
    usageCount: 3,
    lastUsed: "May 28, 2025",
  },
  {
    id: 4,
    name: "Exam Date Notice",
    category: "exam" as TemplateCategory,
    channels: ["sms"],
    body: "Dear {guardian_name}, {student_name}'s {exam_type} exam is scheduled on {exam_date} at {time}. Ensure punctual attendance with required materials. - Edu Flow",
    usageCount: 5,
    lastUsed: "May 15, 2025",
  },
  {
    id: 5,
    name: "Holiday Announcement",
    category: "holiday" as TemplateCategory,
    channels: ["sms"],
    body: "Dear Parent/Guardian, Edu Flow Academy will remain closed on {date} for {occasion}. Classes resume on {resume_date}. Thank you for your understanding.",
    usageCount: 6,
    lastUsed: "May 20, 2025",
  },
  {
    id: 6,
    name: "Batch Rescheduled",
    category: "general" as TemplateCategory,
    channels: ["sms"],
    body: "Dear {guardian_name}, the {batch_name} class on {old_date} has been rescheduled to {new_date} at {new_time}. We apologize for the inconvenience. - Edu Flow",
    usageCount: 2,
    lastUsed: "May 28, 2025",
  },
  {
    id: 7,
    name: "Grace Period Warning",
    category: "overdue" as TemplateCategory,
    channels: ["sms"],
    body: "NOTICE: {student_name}'s account is in grace period. Fee due: ৳{amount}. Payment must be received by {deadline} to avoid class suspension. - Edu Flow Academy",
    usageCount: 1,
    lastUsed: "May 10, 2025",
  },
  {
    id: 8,
    name: "Welcome New Student",
    category: "general" as TemplateCategory,
    channels: ["sms"],
    body: "Welcome to Edu Flow Academy! Dear {guardian_name}, {student_name} has been enrolled in {batch_name}. First class: {start_date}. For help: {contact}.",
    usageCount: 12,
    lastUsed: "Jun 3, 2025",
  },
  {
    id: 9,
    name: "Fee Reminder Email",
    category: "fee-reminder" as TemplateCategory,
    channels: ["email"],
    body: "Dear {guardian_name},\n\nThis is a reminder that {student_name}'s monthly fee of ৳{amount} is due on {due_date}.\n\nPlease visit the academy or pay online.\n\nThank you,\nEdu Flow Academy",
    usageCount: 0,
    lastUsed: "—",
  },
]

const logs = [
  {
    id: 1,
    recipient: "Rashed Karim",
    phone: "01711-234567",
    channel: "SMS",
    preview:
      "Dear Mr. Islam, your child Rashed's monthly fee of ৳3,000 is due...",
    sentAt: "Jun 1, 2:14 PM",
    status: "delivered" as DeliveryStatus,
    campaign: "June Fee Reminder",
  },
  {
    id: 2,
    recipient: "Nadia Islam",
    phone: "01812-345678",
    channel: "SMS",
    preview:
      "Dear Mrs. Begum, your child Nadia's monthly fee of ৳2,500 is due...",
    sentAt: "Jun 1, 2:14 PM",
    status: "delivered" as DeliveryStatus,
    campaign: "June Fee Reminder",
  },
  {
    id: 3,
    recipient: "Tanvir Ahmed",
    phone: "01912-456789",
    channel: "SMS",
    preview:
      "Dear Mr. Ahmed, your child Tanvir's monthly fee of ৳2,000 is due...",
    sentAt: "Jun 1, 2:15 PM",
    status: "delivered" as DeliveryStatus,
    campaign: "June Fee Reminder",
  },
  {
    id: 4,
    recipient: "Sadia Akter",
    phone: "01611-567890",
    channel: "SMS",
    preview:
      "Dear Mrs. Akter, your child Sadia's monthly fee of ৳1,800 is due...",
    sentAt: "Jun 1, 2:15 PM",
    status: "failed" as DeliveryStatus,
    campaign: "June Fee Reminder",
  },
  {
    id: 5,
    recipient: "Imran Hossain",
    phone: "01711-678901",
    channel: "SMS",
    preview:
      "Dear Mr. Hossain, your child Imran's monthly fee of ৳3,000 is due...",
    sentAt: "Jun 1, 2:16 PM",
    status: "delivered" as DeliveryStatus,
    campaign: "June Fee Reminder",
  },
  {
    id: 6,
    recipient: "Farida Begum",
    phone: "01512-789012",
    channel: "SMS",
    preview:
      "Dear Mrs. Karim, we have received ৳4,000 for Farida (Ref: TXN-0892)...",
    sentAt: "May 31, 11:02 AM",
    status: "delivered" as DeliveryStatus,
    campaign: "Payment Confirmation (Auto)",
  },
  {
    id: 7,
    recipient: "Rashed Karim",
    phone: "01711-234567",
    channel: "SMS",
    preview: "NOTICE: Rashed's account is in grace period. Fee due: ৳3,000...",
    sentAt: "May 28, 9:00 AM",
    status: "delivered" as DeliveryStatus,
    campaign: "Grace Period Warning (Auto)",
  },
  {
    id: 8,
    recipient: "SSC Science A",
    phone: "24 students",
    channel: "SMS",
    preview:
      "Dear Guardian, the SSC Science A class on May 28 has been rescheduled...",
    sentAt: "May 27, 4:30 PM",
    status: "delivered" as DeliveryStatus,
    campaign: "Batch Rescheduled",
  },
  {
    id: 9,
    recipient: "All Students",
    phone: "128 students",
    channel: "SMS",
    preview:
      "Dear Parent/Guardian, Edu Flow Academy will remain closed on May 20...",
    sentAt: "May 19, 8:00 AM",
    status: "partial" as DeliveryStatus,
    campaign: "Holiday Notice",
  },
  {
    id: 10,
    recipient: "Mitu Khatun",
    phone: "01911-901234",
    channel: "SMS",
    preview:
      "Dear Mrs. Rahman, we have received ৳2,200 for Mitu (Ref: TXN-0801)...",
    sentAt: "May 18, 3:15 PM",
    status: "delivered" as DeliveryStatus,
    campaign: "Payment Confirmation (Auto)",
  },
]

export function CommunicationPage({
  description,
  eyebrow,
  title,
  variant,
}: CommunicationPageProps) {
  return (
    <div className="flex flex-col gap-0">
      <div className="px-6 pt-6">
        <PageHeader title={title} description={description} badge={eyebrow} />
      </div>
      {variant === "overview" ? (
        <CommOverview />
      ) : variant === "campaigns" ? (
        <CommCampaigns />
      ) : variant === "templates" ? (
        <CommTemplates />
      ) : variant === "logs" ? (
        <CommLogs />
      ) : variant === "sms" ? (
        <DemoPlaceholder
          description="The SMS composer can be wired to this mock communication system when you are ready."
          icon={MessageSquareIcon}
          title="SMS Channel"
        />
      ) : (
        <DemoPlaceholder
          description="Provider, channel, signature, and credential controls can be expanded here later."
          icon={Settings2Icon}
          title="Communication Settings"
        />
      )}
    </div>
  )
}

function CommOverview() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpiCards.map(
          ({ label, value, change, trend, icon: Icon, color, bg }) => (
            <Card className="gap-2 py-4" key={label}>
              <CardContent className="px-4 pt-0">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-medium text-muted-foreground">
                    {label}
                  </div>
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-md",
                      bg
                    )}
                  >
                    <Icon className={cn("size-3.5", color)} />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight">
                  {value}
                </div>
                <div
                  className={cn(
                    "mt-0.5 flex items-center gap-1 text-xs",
                    trend === "up" ? "text-success" : "text-muted-foreground"
                  )}
                >
                  {trend === "up" ? (
                    <TrendingUpIcon className="size-3" />
                  ) : null}
                  {change}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          <div>
            <h2 className="text-sm font-semibold">Channels</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Connected communication channels
            </p>
          </div>
          <div className="space-y-2">
            {channels.map((channel) => {
              const Icon = channel.icon

              return (
                <Card
                  className={cn(
                    "gap-0 py-3",
                    channel.status === "soon" && "opacity-60"
                  )}
                  key={channel.id}
                >
                  <CardContent className="px-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex size-8 items-center justify-center rounded-lg",
                          channel.bg
                        )}
                      >
                        <Icon className={cn("size-4", channel.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {channel.name}
                          </span>
                          {channel.status === "active" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
                              <span className="inline-block size-1.5 rounded-full bg-success" />
                              Active
                            </span>
                          ) : (
                            <Badge
                              className="h-4 px-1.5 py-0 text-[10px]"
                              variant="outline"
                            >
                              Soon
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
                          {channel.description}
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                          {channel.stats}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="pt-1">
            <h2 className="mb-2 text-sm font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "New Message",
                  icon: MegaphoneIcon,
                  href: "/notifications/message-history",
                },
                {
                  label: "Send SMS",
                  icon: MessageSquareIcon,
                  href: "/communication/sms",
                },
                {
                  label: "Create Template",
                  icon: FileTextIcon,
                  href: "/communication/templates",
                },
                {
                  label: "Settings",
                  icon: Settings2Icon,
                  href: "/communication/settings",
                },
              ].map(({ label, icon: Icon, href }) => (
                <Link
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  href={href}
                  key={label}
                >
                  <Icon className="size-3.5 shrink-0 text-primary" />
                  <span className="text-xs leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Recent Messages
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs">
                    Last 30 days
                  </CardDescription>
                </div>
                <Button
                  className="h-7 gap-1 text-xs text-primary"
                  render={<Link href="/notifications/message-history" />}
                  size="sm"
                  variant="ghost"
                >
                  View all <ArrowRightIcon className="size-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentCampaigns.map((campaign) => (
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    key={campaign.name}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {campaign.name}
                        </span>
                        <ChannelBadge channel={campaign.channel} />
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {campaign.audience}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {campaign.date}
                      </span>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {campaign.recipients > 0
                          ? `${campaign.recipients} recipients`
                          : "—"}
                      </span>
                      <CampaignStatusBadge status={campaign.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="gap-0 py-0">
              <CardHeader className="border-b px-4 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Automations
                  </CardTitle>
                  <Button
                    className="h-7 gap-1 text-xs text-primary"
                    disabled
                    size="sm"
                    variant="ghost"
                  >
                    Manage <ArrowRightIcon className="size-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {automationStatus.map((automation) => (
                    <div
                      className="flex items-center gap-3 px-4 py-2.5"
                      key={automation.name}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">
                          {automation.name}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {automation.trigger}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        {automation.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
                            <span className="inline-block size-1.5 rounded-full bg-success" />
                            On
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                            <span className="inline-block size-1.5 rounded-full bg-muted-foreground" />
                            Off
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {automation.lastRun}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 py-0">
              <CardHeader className="border-b px-4 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Recent Activity
                  </CardTitle>
                  <Button
                    className="h-7 gap-1 text-xs text-primary"
                    render={<Link href="/communication/logs" />}
                    size="sm"
                    variant="ghost"
                  >
                    View logs <ArrowRightIcon className="size-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon

                    return (
                      <div
                        className="flex items-start gap-3 px-4 py-2.5"
                        key={activity.text}
                      >
                        <Icon
                          className={cn(
                            "mt-0.5 size-3.5 shrink-0",
                            activity.color
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs leading-snug">
                            {activity.text}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {activity.time}
                          </p>
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

function CommCampaigns() {
  const [search, setSearch] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filtered = campaigns.filter((campaign) => {
    const query = search.toLowerCase()
    const matchSearch =
      campaign.name.toLowerCase().includes(query) ||
      campaign.messagePreview.toLowerCase().includes(query) ||
      campaign.source.toLowerCase().includes(query)
    const matchChannel =
      channelFilter === "all" ||
      campaign.channel.toLowerCase() === channelFilter
    const matchStatus =
      statusFilter === "all" || campaign.status === statusFilter

    return matchSearch && matchChannel && matchStatus
  })

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Message History</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {campaigns.filter((campaign) => campaign.status === "completed").length}{" "}
            completed ·{" "}
            {campaigns.filter((campaign) => campaign.status === "queued").length}{" "}
            queued ·{" "}
            {
              campaigns.filter((campaign) => campaign.status === "partial_failed")
                .length
            }{" "}
            partial
          </p>
        </div>
        <Button className="gap-1.5" size="sm">
          <PlusIcon className="size-4" />
          New Message
        </Button>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-xs min-w-[200px] flex-1">
              <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-sm"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages..."
                value={search}
              />
            </div>
            <Select
              value={channelFilter}
              onValueChange={(value) => {
                if (value) setChannelFilter(value)
              }}
            >
              <SelectTrigger className="w-[120px]" size="sm">
                <SelectValue placeholder="All channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (value) setStatusFilter(value)
              }}
            >
              <SelectTrigger className="w-[110px]" size="sm">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="partial_failed">Partial</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 text-xs font-medium">
                  Channel
                </TableHead>
                <TableHead className="h-9 text-xs font-medium">
                  Source
                </TableHead>
                <TableHead className="h-9 min-w-64 text-xs font-medium">
                  Message Preview
                </TableHead>
                <TableHead className="h-9 text-right text-xs font-medium">
                  Recipients
                </TableHead>
                <TableHead className="h-9 text-right text-xs font-medium">
                  Delivered
                </TableHead>
                <TableHead className="h-9 text-right text-xs font-medium">
                  Failed
                </TableHead>
                <TableHead className="h-9 text-right text-xs font-medium">
                  Credits Used
                </TableHead>
                <TableHead className="h-9 text-xs font-medium">
                  Sent By
                </TableHead>
                <TableHead className="h-9 text-xs font-medium">Sent At</TableHead>
                <TableHead className="h-9 text-xs font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="py-3">
                    <ChannelBadge channel={campaign.channel} />
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {campaign.source}
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">
                        {campaign.messagePreview}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right text-sm">
                    {campaign.recipients > 0 ? campaign.recipients : "—"}
                  </TableCell>
                  <TableCell className="py-3 text-right text-sm">
                    {campaign.delivered}
                  </TableCell>
                  <TableCell className="py-3 text-right text-sm">
                    {campaign.failed}
                  </TableCell>
                  <TableCell className="py-3 text-right text-sm">
                    {campaign.creditsUsed}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {campaign.sentBy}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {campaign.sentAt}
                  </TableCell>
                  <TableCell className="py-3">
                    <CampaignStatusBadge status={campaign.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-sm text-muted-foreground"
                    colSpan={10}
                  >
                    No messages found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CommTemplates() {
  const [search, setSearch] = React.useState("")
  const [activeCategory, setActiveCategory] =
    React.useState<TemplateCategory>("all")
  const [channelFilter, setChannelFilter] =
    React.useState<TemplateChannel>("all")

  const filtered = templates.filter((template) => {
    const matchSearch = template.name
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchCategory =
      activeCategory === "all" || template.category === activeCategory
    const matchChannel =
      channelFilter === "all" || template.channels.includes(channelFilter)

    return matchSearch && matchCategory && matchChannel
  })

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Templates</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {templates.length} templates across {categories.length - 1}{" "}
            categories
          </p>
        </div>
        <Button className="gap-1.5" size="sm">
          <PlusIcon className="size-4" />
          New Template
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-8 text-sm"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates..."
            value={search}
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          {(["all", "sms", "email", "whatsapp"] as TemplateChannel[]).map(
            (channel) => (
              <button
                className={cn(
                  "rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
                  channelFilter === channel
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                key={channel}
                onClick={() => setChannelFilter(channel)}
                type="button"
              >
                {channel === "all" ? "All" : channel.toUpperCase()}
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category) => (
          <button
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeCategory === category.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((template) => (
          <Card
            className="group gap-0 py-0 transition-shadow hover:shadow-sm"
            key={template.id}
          >
            <CardHeader className="border-b px-4 pb-3 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">
                      {template.name}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {template.channels.map((channel) => (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          channel === "sms"
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : channel === "email"
                              ? "border-blue-200 bg-blue-500/10 text-blue-600"
                              : "border-green-200 bg-green-500/10 text-green-600"
                        )}
                        key={channel}
                      >
                        <ChannelIcon channel={channel} />
                        {channel.toUpperCase()}
                      </span>
                    ))}
                    <span className="text-[10px] capitalize text-muted-foreground">
                      {
                        categories.find(
                          (category) => category.id === template.category
                        )?.label
                      }
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button className="size-6" size="icon" variant="ghost">
                    <CopyIcon className="size-3" />
                  </Button>
                  <Button className="size-6" size="icon" variant="ghost">
                    <Edit2Icon className="size-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 py-3">
              <p className="line-clamp-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {template.body}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2">
                <span className="text-[10px] text-muted-foreground">
                  Used {template.usageCount}x
                  {template.lastUsed !== "—"
                    ? ` · Last: ${template.lastUsed}`
                    : ""}
                </span>
                <Button className="h-6 px-2 text-[10px]" size="sm" variant="outline">
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 ? (
          <div className="col-span-full flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageSquareIcon className="size-8 opacity-40" />
            <p className="text-sm">No templates found.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function CommLogs() {
  const [search, setSearch] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filtered = logs.filter((log) => {
    const query = search.toLowerCase()
    const matchSearch =
      log.recipient.toLowerCase().includes(query) ||
      log.preview.toLowerCase().includes(query) ||
      log.campaign.toLowerCase().includes(query)
    const matchChannel =
      channelFilter === "all" || log.channel.toLowerCase() === channelFilter
    const matchStatus = statusFilter === "all" || log.status === statusFilter

    return matchSearch && matchChannel && matchStatus
  })

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="text-base font-semibold">Communication Logs</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {logs.filter((log) => log.status === "delivered").length} delivered ·{" "}
          {logs.filter((log) => log.status === "failed").length} failed ·{" "}
          {logs.filter((log) => log.status === "partial").length} partial
        </p>
      </div>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-xs min-w-[200px] flex-1">
              <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-sm"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search logs..."
                value={search}
              />
            </div>
            <Select
              value={channelFilter}
              onValueChange={(value) => {
                if (value) setChannelFilter(value)
              }}
            >
              <SelectTrigger className="w-[120px]" size="sm">
                <SelectValue placeholder="All channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (value) setStatusFilter(value)
              }}
            >
              <SelectTrigger className="w-[120px]" size="sm">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-4 text-xs font-medium">
                  Recipient
                </TableHead>
                <TableHead className="h-9 text-xs font-medium">
                  Channel
                </TableHead>
                <TableHead className="h-9 text-xs font-medium">
                  Message Preview
                </TableHead>
                <TableHead className="h-9 text-xs font-medium">
                  Message
                </TableHead>
                <TableHead className="h-9 text-xs font-medium">
                  Sent At
                </TableHead>
                <TableHead className="h-9 text-xs font-medium">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="bg-muted text-[9px]">
                          {initials(log.recipient)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {log.recipient}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {log.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <ChannelBadge channel={log.channel} showIcon />
                  </TableCell>
                  <TableCell className="max-w-[240px] py-3">
                    <p className="truncate text-xs text-muted-foreground">
                      {log.preview}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs text-muted-foreground">
                      {log.campaign}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {log.sentAt}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <DeliveryBadge status={log.status} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-sm text-muted-foreground"
                    colSpan={6}
                  >
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function DemoPlaceholder({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: LucideIcon
  title: string
}) {
  return (
    <div className="p-6">
      <Card className="gap-0 py-0">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ChannelBadge({
  channel,
  showIcon = false,
}: {
  channel: string
  showIcon?: boolean
}) {
  const map: Record<string, string> = {
    SMS: "border-primary/20 bg-primary/10 text-primary",
    Email: "border-blue-200 bg-blue-500/10 text-blue-600",
    WhatsApp: "border-green-200 bg-green-500/10 text-green-600",
    Push: "border-orange-200 bg-orange-500/10 text-orange-600",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        showIcon && "gap-1",
        map[channel] ?? "border-border bg-muted text-muted-foreground"
      )}
    >
      {showIcon ? <ChannelIcon channel={channel.toLowerCase()} /> : null}
      {channel}
    </span>
  )
}

function CampaignStatusBadge({ status }: { status: MessageStatus }) {
  const map: Record<MessageStatus, string> = {
    completed: "border-success/20 bg-success/10 text-success",
    failed: "border-destructive/20 bg-destructive/10 text-destructive",
    partial_failed: "border-warning/20 bg-warning/10 text-warning",
    queued: "border-info/20 bg-info/10 text-info",
  }
  const labels: Record<MessageStatus, string> = {
    completed: "Completed",
    failed: "Failed",
    partial_failed: "Partial",
    queued: "Queued",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        map[status]
      )}
    >
      {labels[status]}
    </span>
  )
}

function ChannelIcon({ channel }: { channel: string }) {
  const map: Record<string, { icon: LucideIcon; color: string }> = {
    sms: { icon: MessageSquareIcon, color: "text-primary" },
    email: { icon: MailIcon, color: "text-blue-600" },
    whatsapp: { icon: SmartphoneIcon, color: "text-green-600" },
  }
  const config = map[channel]

  if (!config) {
    return null
  }

  const Icon = config.icon

  return <Icon className={cn("size-3", config.color)} />
}

function DeliveryBadge({ status }: { status: DeliveryStatus }) {
  const map: Record<
    DeliveryStatus,
    { label: string; icon: LucideIcon; className: string }
  > = {
    delivered: {
      label: "Delivered",
      icon: CheckCircle2Icon,
      className: "text-success",
    },
    failed: {
      label: "Failed",
      icon: XCircleIcon,
      className: "text-destructive",
    },
    pending: {
      label: "Pending",
      icon: ClockIcon,
      className: "text-warning",
    },
    partial: {
      label: "Partial",
      icon: AlertTriangleIcon,
      className: "text-warning",
    },
  }
  const config = map[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        config.className
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
}
