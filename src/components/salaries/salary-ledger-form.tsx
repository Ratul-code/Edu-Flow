import Link from "next/link"

import type { TeacherSalaryLedgerRecord } from "@/lib/data/salaries"
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

type SalaryLedgerFormProps = {
  action: (formData: FormData) => void | Promise<void>
  ledger: TeacherSalaryLedgerRecord
}

export function SalaryLedgerForm({ action, ledger }: SalaryLedgerFormProps) {
  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Salary amounts</CardTitle>
          <CardDescription>
            Expected salary defaults from the teacher profile. Adjustment can be
            positive or negative.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="expected_salary">Expected salary</FieldLabel>
              <Input
                id="expected_salary"
                min="0"
                name="expected_salary"
                defaultValue={String(ledger.expected_salary)}
                required
                step="0.01"
                type="number"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="adjustment_amount">
                Adjustment amount
              </FieldLabel>
              <Input
                id="adjustment_amount"
                name="adjustment_amount"
                defaultValue={String(ledger.adjustment_amount)}
                step="0.01"
                type="number"
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            render={<Link href={`/salaries?month=${ledger.ledger_month.slice(0, 7)}`} />}
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
