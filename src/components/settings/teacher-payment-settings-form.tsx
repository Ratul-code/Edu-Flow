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
        <CardHeader>
          <div className="flex items-center gap-2">
            <WalletCardsIcon className="size-5 text-primary" />
            <CardTitle>Teacher Payment</CardTitle>
          </div>
          <CardDescription>
            Choose whether teacher salary opens in the same month or the next
            month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
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
                      Prepaid - June salary opens on June 1
                    </SelectItem>
                    <SelectItem value="postpaid">
                      Postpaid - June salary opens on July 1
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save teacher payment</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
