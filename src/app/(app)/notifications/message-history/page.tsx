import {
  DownloadIcon,
  EyeIcon,
  RotateCcwIcon,
  SearchIcon,
} from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/app/page-header"
import { StatusBadge } from "@/components/app/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireAdminContext } from "@/lib/auth/user"
import {
  getCommunicationMessageDetails,
  listCommunicationMessages,
  listCommunicationSenders,
  type CommunicationMessageFilters,
  type CommunicationMessageRecord,
  type CommunicationRecipientRecord,
} from "@/lib/data/communication"

type MessageHistoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const channels = [
  { label: "All channels", value: "all" },
  { label: "SMS", value: "sms" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Email", value: "email" },
  { label: "Push", value: "push" },
  { label: "In-App", value: "in_app" },
]

const sources = [
  { label: "All sources", value: "all" },
  { label: "Manual", value: "manual" },
  { label: "Bulk", value: "bulk" },
  { label: "Payment Confirmation", value: "payment_confirmation" },
  { label: "Payment Reminder", value: "payment_reminder" },
  { label: "Grace Period", value: "grace_period" },
  { label: "Overdue Warning", value: "overdue_warning" },
  { label: "System", value: "system" },
]

const statuses = [
  { label: "All statuses", value: "all" },
  { label: "Queued", value: "queued" },
  { label: "Sending", value: "sending" },
  { label: "Completed", value: "completed" },
  { label: "Partial Failed", value: "partial_failed" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
]

export default async function MessageHistoryPage({
  searchParams,
}: MessageHistoryPageProps) {
  const admin = await requireAdminContext()
  const params = await searchParams
  const filters: CommunicationMessageFilters = {
    channel: stringParam(params.channel),
    dateFrom: stringParam(params.dateFrom),
    dateTo: stringParam(params.dateTo),
    search: stringParam(params.q),
    sentBy: stringParam(params.sentBy),
    source: stringParam(params.source),
    status: stringParam(params.status),
  }
  const selectedMessageId = stringParam(params.messageId)
  const [messages, senders] = await Promise.all([
    listCommunicationMessages(admin.tenantId, filters),
    listCommunicationSenders(admin.tenantId),
  ])
  const details = selectedMessageId
    ? await getCommunicationMessageDetails(admin.tenantId, selectedMessageId)
    : null

  return (
    <div className="space-y-5 p-4 md:p-6">
      <PageHeader
        description="Review every message sent or attempted by manual sends and automated rules."
        title="Message History"
      />

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <MessageHistoryFilters
            filters={filters}
            messageId={selectedMessageId}
            senders={senders}
          />
        </CardHeader>
        <CardContent className="p-0">
          <MessageHistoryTable messages={messages} params={params} />
        </CardContent>
      </Card>

      {details ? <MessageDetailsSheet details={details} /> : null}
    </div>
  )
}

function MessageHistoryFilters({
  filters,
  messageId,
  senders,
}: {
  filters: CommunicationMessageFilters
  messageId?: string
  senders: Array<{ id: string; name: string }>
}) {
  return (
    <form className="flex flex-wrap items-center gap-2">
      {messageId ? <input name="messageId" type="hidden" value={messageId} /> : null}
      <div className="relative min-w-[220px] max-w-sm flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-8 pl-8 text-sm"
          defaultValue={filters.search ?? ""}
          name="q"
          placeholder="Search message text"
        />
      </div>
      <NativeSelect name="channel" options={channels} value={filters.channel} />
      <NativeSelect name="source" options={sources} value={filters.source} />
      <NativeSelect name="status" options={statuses} value={filters.status} />
      <NativeSelect
        name="sentBy"
        options={[
          { label: "All senders", value: "all" },
          { label: "System", value: "system" },
          ...senders.map((sender) => ({ label: sender.name, value: sender.id })),
        ]}
        value={filters.sentBy}
      />
      <Input
        className="h-8 w-[145px] text-sm"
        defaultValue={filters.dateFrom ?? ""}
        name="dateFrom"
        type="date"
      />
      <Input
        className="h-8 w-[145px] text-sm"
        defaultValue={filters.dateTo ?? ""}
        name="dateTo"
        type="date"
      />
      <Button size="sm" type="submit">
        Apply
      </Button>
      <Button render={<Link href="/notifications/message-history" />} size="sm" variant="outline">
        Reset
      </Button>
    </form>
  )
}

function MessageHistoryTable({
  messages,
  params,
}: {
  messages: CommunicationMessageRecord[]
  params: Record<string, string | string[] | undefined>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 pl-4 text-xs font-medium">Channel</TableHead>
          <TableHead className="h-9 text-xs font-medium">Source</TableHead>
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
          <TableHead className="h-9 text-xs font-medium">Sent By</TableHead>
          <TableHead className="h-9 text-xs font-medium">Sent At</TableHead>
          <TableHead className="h-9 text-xs font-medium">Status</TableHead>
          <TableHead className="h-9 pr-4 text-right text-xs font-medium">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map((message) => (
          <TableRow key={message.id}>
            <TableCell className="py-3 pl-4">
              <ChannelBadge channel={message.channel} />
            </TableCell>
            <TableCell className="py-3 text-sm text-muted-foreground">
              {sourceLabel(message.source)}
            </TableCell>
            <TableCell className="py-3">
              <p className="max-w-md truncate text-sm font-medium">
                {messagePreview(message)}
              </p>
              {message.subject ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {message.subject}
                </p>
              ) : null}
            </TableCell>
            <TableCell className="py-3 text-right text-sm">
              {message.recipient_count.toLocaleString("en-US")}
            </TableCell>
            <TableCell className="py-3 text-right text-sm">
              {message.delivered_count.toLocaleString("en-US")}
            </TableCell>
            <TableCell className="py-3 text-right text-sm">
              {message.failed_count.toLocaleString("en-US")}
            </TableCell>
            <TableCell className="py-3 text-right text-sm">
              {message.credits_used.toLocaleString("en-US")}
            </TableCell>
            <TableCell className="py-3 text-sm text-muted-foreground">
              {message.sent_by_name ?? "System"}
            </TableCell>
            <TableCell className="py-3 text-sm text-muted-foreground">
              {formatDateTime(message.sent_at ?? message.created_at)}
            </TableCell>
            <TableCell className="py-3">
              <StatusPill status={message.status} />
            </TableCell>
            <TableCell className="py-3 pr-4">
              <div className="flex justify-end gap-1">
                <Button
                  render={
                    <Link
                      href={`/notifications/message-history?${paramsWith(
                        params,
                        "messageId",
                        message.id
                      )}`}
                    />
                  }
                  size="icon-sm"
                  variant="ghost"
                >
                  <EyeIcon />
                  <span className="sr-only">View Details</span>
                </Button>
                <Button
                  disabled={message.failed_count === 0}
                  size="icon-sm"
                  title="Retry Failed"
                  variant="ghost"
                >
                  <RotateCcwIcon />
                  <span className="sr-only">Retry Failed</span>
                </Button>
                <Button size="icon-sm" title="Export Recipients" variant="ghost">
                  <DownloadIcon />
                  <span className="sr-only">Export Recipients</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {messages.length === 0 ? (
          <TableRow>
            <TableCell
              className="h-24 text-center text-sm text-muted-foreground"
              colSpan={11}
            >
              No message history found.
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  )
}

function MessageDetailsSheet({
  details,
}: {
  details: {
    message: CommunicationMessageRecord
    recipients: CommunicationRecipientRecord[]
  }
}) {
  const { message, recipients } = details
  const pendingCount = Math.max(
    message.recipient_count - message.delivered_count - message.failed_count,
    0
  )

  return (
    <Sheet defaultOpen>
      <SheetContent className="w-full overflow-hidden p-0 data-[side=right]:!w-[92vw] data-[side=right]:!max-w-5xl">
        <SheetHeader className="px-5 py-4">
          <SheetTitle>Message Details</SheetTitle>
          <SheetDescription>{messagePreview(message)}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <section className="grid gap-3 md:grid-cols-4">
            <Detail label="Channel" value={channelLabel(message.channel)} />
            <Detail label="Source" value={sourceLabel(message.source)} />
            <Detail label="Sent by" value={message.sent_by_name ?? "System"} />
            <Detail
              label="Sent time"
              value={formatDateTime(message.sent_at ?? message.created_at)}
            />
          </section>

          <section className="rounded-lg border p-4">
            <p className="text-sm font-medium">Full message body</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {message.message_body}
            </p>
          </section>

          <section className="grid gap-3 md:grid-cols-4">
            <Metric label="Recipients" value={message.recipient_count} />
            <Metric label="Delivered" value={message.delivered_count} />
            <Metric label="Failed" value={message.failed_count} />
            <Metric label="Pending" value={pendingCount} />
          </section>

          <section className="grid gap-3 md:grid-cols-4">
            <Metric label="Credits Required" value={message.credits_required} />
            <Metric label="Credits Used" value={message.credits_used} />
            <Metric label="Credits Refunded" value={message.credits_refunded} />
            <Detail
              label="Recipient summary"
              value={message.recipient_summary ?? "Not recorded"}
            />
          </section>

          <section className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium">Recipients</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Recipient Name</TableHead>
                  <TableHead>Recipient Type</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Credits Used</TableHead>
                  <TableHead>Error Message</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Delivered At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell className="py-3 pl-4 text-sm font-medium">
                      {recipient.recipient_name}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {titleize(recipient.recipient_type)}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {recipient.student_name ?? "—"}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {recipient.destination}
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge status={titleize(recipient.status)} />
                    </TableCell>
                    <TableCell className="py-3 text-right text-sm">
                      {recipient.credits_used.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell className="max-w-[220px] py-3 text-sm text-muted-foreground">
                      <span className="line-clamp-2">
                        {recipient.error_message ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {recipient.sent_at ? formatDateTime(recipient.sent_at) : "—"}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {recipient.delivered_at
                        ? formatDateTime(recipient.delivered_at)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {recipients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="h-20 text-center text-sm text-muted-foreground"
                      colSpan={9}
                    >
                      No recipients recorded.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function NativeSelect({
  name,
  options,
  value,
}: {
  name: string
  options: Array<{ label: string; value: string }>
  value?: string
}) {
  return (
    <select
      className="h-8 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      defaultValue={value || "all"}
      name={name}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function ChannelBadge({ channel }: { channel: string }) {
  const className =
    channel === "sms"
      ? "border-primary/20 bg-primary/10 text-primary"
      : channel === "whatsapp"
        ? "border-success/20 bg-success/10 text-success"
        : "border-border bg-muted text-muted-foreground"

  return (
    <Badge className={className} variant="outline">
      {channelLabel(channel)}
    </Badge>
  )
}

function StatusPill({ status }: { status: string }) {
  const className =
    status === "completed"
      ? "border-success/20 bg-success/10 text-success"
      : status === "failed" || status === "cancelled"
        ? "border-destructive/20 bg-destructive/10 text-destructive"
        : status === "partial_failed"
          ? "border-warning/20 bg-warning/10 text-warning-foreground"
          : "border-info/20 bg-info/10 text-info"

  return (
    <Badge className={className} variant="outline">
      {statusLabel(status)}
    </Badge>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">
        {value.toLocaleString("en-US")}
      </p>
    </div>
  )
}

function messagePreview(message: CommunicationMessageRecord) {
  return (message.message_preview || message.message_body).slice(0, 80)
}

function channelLabel(channel: string) {
  const labels: Record<string, string> = {
    email: "Email",
    in_app: "In-App",
    push: "Push",
    sms: "SMS",
    whatsapp: "WhatsApp",
  }

  return labels[channel] ?? titleize(channel)
}

function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    bulk: "Bulk",
    grace_period: "Grace Period",
    manual: "Manual",
    overdue_warning: "Overdue Warning",
    payment_confirmation: "Payment Confirmation",
    payment_reminder: "Payment Reminder",
    system: "System",
  }

  return labels[source] ?? titleize(source)
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    cancelled: "Cancelled",
    completed: "Completed",
    failed: "Failed",
    partial_failed: "Partial Failed",
    queued: "Queued",
    sending: "Sending",
  }

  return labels[status] ?? titleize(status)
}

function titleize(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ")
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function paramsWith(
  params: Record<string, string | string[] | undefined>,
  key: string,
  value: string
) {
  const next = new URLSearchParams()

  for (const [paramKey, paramValue] of Object.entries(params)) {
    const normalizedValue = Array.isArray(paramValue) ? paramValue[0] : paramValue

    if (normalizedValue && paramKey !== key) {
      next.set(paramKey, normalizedValue)
    }
  }

  next.set(key, value)
  return next.toString()
}
