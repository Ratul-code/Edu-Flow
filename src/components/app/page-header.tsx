import { AlertCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

type PageHeaderProps = {
  title: string
  description: string
  badge?: string
}

export function PageHeader({ title, description, badge }: PageHeaderProps) {
  const isActive = badge?.toLowerCase() === "active"
  const isOverdue = badge?.toLowerCase().includes("overdue")

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {badge ? (
          <Badge
            className={
              isOverdue
                ? "gap-1 border-destructive/20 bg-destructive/10 text-destructive"
                : isActive
                  ? "border-success/20 bg-success/10 text-success"
                  : ""
            }
            variant="outline"
          >
            {isOverdue ? <AlertCircleIcon className="size-3" /> : null}
            {badge}
          </Badge>
        ) : null}
      </div>
      <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
