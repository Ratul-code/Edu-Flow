"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { AlertCircleIcon } from "lucide-react"

import { PlanPicker } from "@/components/auth/plan-picker"
import { FormFieldError } from "@/components/auth/field-error"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { type PlanDefinition } from "@/lib/billing/types"
import {
  provisionCoachingCenter,
  type SignupState,
} from "@/lib/auth/signup"

export function OnboardingForm({
  plans,
  defaultName,
  defaultPhone,
  defaultEmail,
}: {
  plans: PlanDefinition[]
  defaultName?: string
  defaultPhone?: string
  defaultEmail?: string
}) {
  const [state, formAction] = useActionState<SignupState, FormData>(
    provisionCoachingCenter,
    {}
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your coaching centre</CardTitle>
        <CardDescription>
          {defaultEmail
            ? `Signed in as ${defaultEmail}. Add your centre details to continue.`
            : "Add your centre details to continue."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            {state.message ? (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Could not create your centre</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            ) : null}

            <Field>
              <FieldLabel htmlFor="admin_name">Your name</FieldLabel>
              <Input
                id="admin_name"
                name="admin_name"
                defaultValue={defaultName}
                placeholder="Rafi Hasan"
                required
              />
              <FormFieldError error={state.errors?.admin_name} />
            </Field>

            <Field>
              <FieldLabel htmlFor="admin_phone">Phone (optional)</FieldLabel>
              <Input
                id="admin_phone"
                name="admin_phone"
                defaultValue={defaultPhone}
                placeholder="+8801XXXXXXXXX"
              />
              <FormFieldError error={state.errors?.admin_phone} />
            </Field>

            <Field>
              <FieldLabel htmlFor="center_name">Centre name</FieldLabel>
              <Input
                id="center_name"
                name="center_name"
                placeholder="Dhaka Coaching Center"
                required
              />
              <FormFieldError error={state.errors?.center_name} />
            </Field>

            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                name="address"
                placeholder="House 12, Road 5, Dhaka"
                required
              />
              <FieldDescription>
                Shown on fee receipts and SMS to guardians.
              </FieldDescription>
              <FormFieldError error={state.errors?.address} />
            </Field>

            <Field>
              <FieldLabel htmlFor="contact_phone">Contact phone</FieldLabel>
              <Input
                id="contact_phone"
                name="contact_phone"
                placeholder="+8801XXXXXXXXX"
                required
              />
              <FormFieldError error={state.errors?.contact_phone} />
            </Field>

            <Field>
              <FieldLabel>Choose a plan</FieldLabel>
              <PlanPicker plans={plans} selectedCode="free" />
              <FormFieldError error={state.errors?.plan_code} />
            </Field>

            <SubmitButton />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating your centre..." : "Create my centre"}
    </Button>
  )
}
