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
        className="border-emerald-200 bg-emerald-100 text-emerald-700"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  if (normalized === "archived") {
    return (
      <Badge
        className="border-gray-200 bg-gray-100 text-gray-600"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  if (normalized === "paid") {
    return (
      <Badge
        className="border-emerald-200 bg-emerald-100 text-emerald-700"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  if (normalized === "partial") {
    return (
      <Badge
        className="border-amber-200 bg-amber-100 text-amber-700"
        variant="outline"
      >
        {status}
      </Badge>
    )
  }

  if (normalized === "due" || normalized === "overdue") {
    return (
      <Badge
        className="border-red-200 bg-red-100 text-red-700"
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
