import Link from "next/link"

import type { StudentLedgerRecord } from "@/lib/data/fees"
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
import { Textarea } from "@/components/ui/textarea"

type PaymentFormProps = {
  action: (formData: FormData) => void | Promise<void>
  ledger: StudentLedgerRecord
}

export function PaymentForm({ action, ledger }: PaymentFormProps) {
  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Payment details</CardTitle>
          <CardDescription>
            Record a partial or full payment. A receipt number is generated
            automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="amount">Amount</FieldLabel>
              <Input
                id="amount"
                max={String(ledger.due_amount)}
                min="0.01"
                name="amount"
                defaultValue={String(ledger.due_amount)}
                required
                step="0.01"
                type="number"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="method">Method</FieldLabel>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                defaultValue="cash"
                id="method"
                name="method"
              >
                <option value="cash">Cash</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="bank">Bank</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="payment_date">Payment date</FieldLabel>
              <Input
                id="payment_date"
                name="payment_date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                type="date"
              />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="note">Note</FieldLabel>
              <Textarea id="note" name="note" rows={4} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button render={<Link href={`/fees?month=${ledger.ledger_month.slice(0, 7)}`} />} variant="outline">
            Cancel
          </Button>
          <Button type="submit">Save payment</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
