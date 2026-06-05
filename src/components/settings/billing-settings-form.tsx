import { CalendarClockIcon, SaveIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { updateBillingSettings } from "@/lib/actions/fees"
import type { BillingSettingsRecord } from "@/lib/data/fees"

type BillingSettingsFormProps = {
  settings: BillingSettingsRecord
}

export function BillingSettingsForm({ settings }: BillingSettingsFormProps) {
  return (
    <form action={updateBillingSettings}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarClockIcon className="size-5 text-primary" />
            <CardTitle>Billing Settings</CardTitle>
          </div>
          <CardDescription>
            Choose when monthly fee collection opens and when unpaid ledgers
            become overdue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="payment_start_day">
                Payment start day
              </FieldLabel>
              <Input
                defaultValue={settings.payment_start_day}
                id="payment_start_day"
                max="31"
                min="1"
                name="payment_start_day"
                required
                type="number"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="grace_period_days">
                Grace period days
              </FieldLabel>
              <Input
                defaultValue={settings.grace_period_days}
                id="grace_period_days"
                max="31"
                min="1"
                name="grace_period_days"
                required
                type="number"
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">
            <SaveIcon data-icon="inline-start" />
            Save settings
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
