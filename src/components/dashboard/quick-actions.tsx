import {
  BellIcon,
  BookOpenIcon,
  ReceiptTextIcon,
  UserPlusIcon,
} from "lucide-react"
import Link from "next/link"

import { createBatch } from "@/lib/actions/batches"
import { recordStudentPaymentFromDashboard } from "@/lib/actions/fees"
import { createStudent } from "@/lib/actions/students"
import type { BatchRecord } from "@/lib/data/batches"
import { StudentCreateSheet } from "@/components/students/student-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

type DueLedgerOption = {
  dueAmount: number | string
  id: string
  studentName: string
}

type QuickActionsProps = {
  batches: BatchRecord[]
  dueLedgers: DueLedgerOption[]
}

const actions = [
  {
    icon: UserPlusIcon,
    title: "New Student",
    tone: "text-muted-foreground",
    type: "student",
  },
  {
    icon: BookOpenIcon,
    title: "Create Batch",
    tone: "text-muted-foreground",
    type: "batch",
  },
  {
    icon: ReceiptTextIcon,
    title: "Record Fee",
    tone: "text-muted-foreground",
    type: "payment",
  },
  {
    icon: BellIcon,
    title: "Notifications",
    tone: "text-muted-foreground",
    type: "notification",
  },
] as const

export function QuickActions({ batches, dueLedgers }: QuickActionsProps) {
  return (
    <>
      {actions.map((action) => {
        const Icon = action.icon

        if (action.type === "student") {
          return (
            <StudentCreateSheet
              action={createStudent}
              batches={batches}
              key={action.type}
              triggerLabel={action.title}
              triggerClassName="h-auto flex-col gap-2 py-3 text-xs font-medium"
              triggerVariant="outline"
            />
          )
        }

        if (action.type === "notification") {
          return (
            <Button
              className="h-auto flex-col gap-2 py-3 text-xs font-medium"
              key={action.type}
              render={<Link href="/notifications" />}
              variant="outline"
            >
              <Icon className={`size-4 ${action.tone}`} />
              {action.title}
            </Button>
          )
        }

        return (
          <Dialog key={action.type}>
            <DialogTrigger
              render={
                <button
                  className="inline-flex h-auto flex-col items-center justify-center gap-2 rounded-md border bg-background px-3 py-3 text-xs font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                  type="button"
                />
              }
            >
              <Icon className={`size-4 ${action.tone}`} />
              {action.title}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              {action.type === "batch" ? <BatchDialog /> : null}
              {action.type === "payment" ? (
                <PaymentDialog dueLedgers={dueLedgers} />
              ) : null}
            </DialogContent>
          </Dialog>
        )
      })}
    </>
  )
}

function BatchDialog() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Batch</DialogTitle>
        <DialogDescription>
          Create the batch first; add class schedules from the batch page.
        </DialogDescription>
      </DialogHeader>
      <form action={createBatch} className="flex flex-col gap-4">
        <FieldGroup className="sm:grid sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="qa-batch-name">Batch name</FieldLabel>
            <Input id="qa-batch-name" name="name" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="qa-monthly-fee">Monthly fee</FieldLabel>
            <Input
              id="qa-monthly-fee"
              min="0"
              name="monthly_fee"
              defaultValue="0"
              step="0.01"
              type="number"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="qa-batch-class">Class level</FieldLabel>
            <Input id="qa-batch-class" name="class_level" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="qa-batch-subject">Subjects</FieldLabel>
            <Input id="qa-batch-subject" name="subject" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="qa-batch-medium">Medium</FieldLabel>
            <Select defaultValue="" name="medium">
              <SelectTrigger className="h-8 w-full" id="qa-batch-medium">
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectItem value="">Not set</SelectItem>
                  <SelectItem value="Bangla Medium">Bangla Medium</SelectItem>
                  <SelectItem value="English Version">English Version</SelectItem>
                  <SelectItem value="English Medium">English Medium</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button type="submit">Create batch</Button>
        </DialogFooter>
      </form>
    </>
  )
}

function PaymentDialog({ dueLedgers }: { dueLedgers: DueLedgerOption[] }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Record Fee Payment</DialogTitle>
        <DialogDescription>
          Select a current-month ledger and record a partial or full payment.
        </DialogDescription>
      </DialogHeader>
      <form action={recordStudentPaymentFromDashboard} className="flex flex-col gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="qa-ledger">Student ledger</FieldLabel>
            <Select defaultValue="" name="ledger_id" required>
              <SelectTrigger className="h-8 w-full" id="qa-ledger">
                <SelectValue placeholder="Select due ledger" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectItem value="">Select due ledger</SelectItem>
                  {dueLedgers.map((ledger) => (
                    <SelectItem key={ledger.id} value={ledger.id}>
                      {ledger.studentName} - Due {formatTaka(ledger.dueAmount)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="qa-payment-amount">Amount</FieldLabel>
            <Input
              id="qa-payment-amount"
              min="0.01"
              name="amount"
              required
              step="0.01"
              type="number"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="qa-payment-method">Method</FieldLabel>
            <Select defaultValue="cash" name="method">
              <SelectTrigger className="h-8 w-full" id="qa-payment-method">
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
        </FieldGroup>
        <DialogFooter>
          <Button disabled={!dueLedgers.length} type="submit">
            Save payment
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function formatTaka(value: number | string) {
  return `৳${Number(value).toLocaleString("en-BD")}`
}
