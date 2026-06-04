import { Badge } from "@/components/ui/badge"

type PageHeaderProps = {
  title: string
  description: string
  badge?: string
}

export function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {badge ? (
        <Badge className="mt-1" variant="outline">
          {badge}
        </Badge>
      ) : null}
    </div>
  )
}
