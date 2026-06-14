import { WalletCardsIcon } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateTeacherPaymentSettings } from "@/lib/actions/settings"
import type { TeacherPaymentSettingsRecord } from "@/lib/data/teacher-payment-settings"

type TeacherPaymentSettingsFormProps = {
  settings: TeacherPaymentSettingsRecord
}

export function TeacherPaymentSettingsForm({
  settings,
}: TeacherPaymentSettingsFormProps) {
  return (
    <form action={updateTeacherPaymentSettings}>
      <Card>
        <CardHeader className="gap-1">
          <div className="flex items-center gap-2">
            <WalletCardsIcon className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm">Teacher Payment</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Configure salary collection month, start day, and grace period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="teacher_payment_system">
                Payment system
              </FieldLabel>
              <Select
                defaultValue={settings.payment_system}
                name="payment_system"
              >
                <SelectTrigger className="h-8 w-full" id="teacher_payment_system">
                  <SelectValue placeholder="Prepaid" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="prepaid">
                      Prepaid - June salary opens in June
                    </SelectItem>
                    <SelectItem value="postpaid">
                      Postpaid - June salary opens in July
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="teacher_payment_start_day">
                Payment start day
              </FieldLabel>
              <Input
                defaultValue={settings.payment_start_day}
                id="teacher_payment_start_day"
                max="15"
                min="1"
                name="payment_start_day"
                required
                type="number"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="teacher_grace_period_days">
                Grace period days
              </FieldLabel>
              <Input
                defaultValue={settings.grace_period_days}
                id="teacher_grace_period_days"
                max="15"
                min="0"
                name="grace_period_days"
                required
                type="number"
              />
            </Field>
          </FieldGroup>
          <p className="mt-3 text-sm text-muted-foreground">
            Salary start day is locked between 1-15. Grace period is locked
            between 0-15 days.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="sm" type="submit">
            Save teacher payment
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
