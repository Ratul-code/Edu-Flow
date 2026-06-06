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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="payment_action">Action</FieldLabel>
              <Select defaultValue="payment" name="payment_action">
                <SelectTrigger className="h-8 w-full" id="payment_action">
                  <SelectValue placeholder="Record payment" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="payment">Record payment</SelectItem>
                    <SelectItem value="waive">Waive remaining due</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
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
              <Select defaultValue="cash" name="method">
                <SelectTrigger className="h-8 w-full" id="method">
                  <SelectValue placeholder="Cash" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
