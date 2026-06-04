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
])

const destructiveStatuses = new Set(["archived", "failed", "cancelled", "unpaid"])

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

  const variant = destructiveStatuses.has(normalized)
    ? "destructive"
    : secondaryStatuses.has(normalized)
      ? "secondary"
      : "outline"

  return <Badge variant={variant}>{status}</Badge>
}
