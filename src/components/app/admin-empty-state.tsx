import type { LucideIcon } from "lucide-react"

import { CreateRecordDialog } from "@/components/app/create-record-dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type AdminEmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  createLabel: string
  moduleName: string
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  createLabel,
  moduleName,
}: AdminEmptyStateProps) {
  return (
    <Empty className="min-h-80 border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateRecordDialog label={createLabel} moduleName={moduleName} />
      </EmptyContent>
    </Empty>
  )
}
