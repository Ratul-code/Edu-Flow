import { PageHeader } from "@/components/app/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} badge="Phase 1" />
      <Card>
        <CardHeader>
          <CardTitle>Ready for the next milestone</CardTitle>
          <CardDescription>
            The protected route and shell are in place. Feature-specific data
            and actions will be added in the upcoming phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            This page is intentionally minimal for the foundation phase.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
