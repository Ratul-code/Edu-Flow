import { Badge } from "@/components/ui/badge"

type StatusBadgeProps = {
  status: string
}

const secondaryStatuses = new Set([
  "active",
  "ready",
  "paid",
  "sent",
  "trial",
  "waived",
])

const destructiveStatuses = new Set([
  "archived",
  "cancelled",
  "due",
  "failed",
  "overdue",
  "unpaid",
])

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase()

  if (normalized === "active") {
    return (
      <Badge
        className="border-success/20 bg-success/10 text-success"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  if (normalized === "archived") {
    return (
      <Badge
        className="border-muted bg-muted text-muted-foreground"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  if (normalized === "paid") {
    return (
      <Badge
        className="border-success/20 bg-success/10 text-success"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  if (normalized === "partial") {
    return (
      <Badge
        className="border-info/20 bg-info/10 text-info"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  if (normalized === "due") {
    return (
      <Badge
        className="border-warning/20 bg-warning/10 text-warning-foreground"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  if (normalized === "overdue") {
    return (
      <Badge
        className="border-destructive/20 bg-destructive/10 text-destructive"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  if (normalized === "not started" || normalized === "waived") {
    return (
      <Badge
        className="border-border bg-muted text-muted-foreground"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  const variant = destructiveStatuses.has(normalized)
    ? "destructive"
    : secondaryStatuses.has(normalized)
      ? "secondary"
      : "outline"

  return <Badge variant={variant}>{status}</Badge>
}
