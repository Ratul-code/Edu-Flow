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
  const variant = destructiveStatuses.has(normalized)
    ? "destructive"
    : secondaryStatuses.has(normalized)
      ? "secondary"
      : "outline"

  return <Badge variant={variant}>{status}</Badge>
}
