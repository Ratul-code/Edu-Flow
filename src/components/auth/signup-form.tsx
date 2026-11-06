"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import { PlanPicker } from "@/components/auth/plan-picker";
import { FormFieldError } from "@/components/auth/field-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type PlanDefinition } from "@/lib/billing/types";
import { signUp, type SignupState } from "@/lib/auth/signup";

const STEPS = ["Account", "Centre", "Plan"] as const;

export function SignupForm({
  plans,
  initialValues,
}: {
  plans: PlanDefinition[];
  initialValues?: Record<string, string>;
}) {
  const [state, formAction] = useActionState<SignupState, FormData>(signUp, {});
  const [step, setStep] = useState(1);

  // The server reports the step that failed validation. It only applies once,
  // otherwise every later keystroke would yank the user back to that step.
  const [serverStep, setServerStep] = useState<number | undefined>(undefined);

  if (state.step !== undefined && state.step !== serverStep) {
    setServerStep(state.step);
  }

  const visibleStep = Math.min(Math.max(serverStep ?? step, 1), STEPS.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your coaching centre</CardTitle>
        <CardDescription>
          Step {visibleStep} of {STEPS.length} — {STEPS[visibleStep - 1]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} noValidate>
          <input type="hidden" name="step" value={visibleStep} />

          <FieldGroup>
            {state.message ? (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Could not create your account</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            ) : null}

            <StepPanel step={1} visibleStep={visibleStep}>
              <Field>
                <FieldLabel htmlFor="admin_name">Your name</FieldLabel>
                <Input
                  id="admin_name"
                  name="admin_name"
                  defaultValue={initialValues?.admin_name}
                  placeholder="Rafi Hasan"
                  autoComplete="name"
                  required
                />
                <FormFieldError error={state.errors?.admin_name} />
              </Field>

              <Field>
                <FieldLabel htmlFor="admin_phone">Phone (optional)</FieldLabel>
                <Input
                  id="admin_phone"
                  name="admin_phone"
                  defaultValue={initialValues?.admin_phone}
                  placeholder="+8801XXXXXXXXX"
                  autoComplete="tel"
                />
                <FormFieldError error={state.errors?.admin_phone} />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={initialValues?.email}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <FormFieldError error={state.errors?.email} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <FormFieldError error={state.errors?.password} />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm_password">
                  Confirm password
                </FieldLabel>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <FormFieldError error={state.errors?.confirm_password} />
              </Field>
            </StepPanel>

            <StepPanel step={2} visibleStep={visibleStep}>
              <Field>
                <FieldLabel htmlFor="center_name">Centre name</FieldLabel>
                <Input
                  id="center_name"
                  name="center_name"
                  defaultValue={initialValues?.center_name}
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
                  defaultValue={initialValues?.address}
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
                  defaultValue={initialValues?.contact_phone}
                  placeholder="+8801XXXXXXXXX"
                  required
                />
                <FormFieldError error={state.errors?.contact_phone} />
              </Field>
            </StepPanel>

            <StepPanel step={3} visibleStep={visibleStep}>
              <Field>
                <FieldLabel>Choose a plan</FieldLabel>
                <PlanPicker plans={plans} selectedCode="free" />
                <FormFieldError error={state.errors?.plan_code} />
                <FieldDescription>
                  Paid plans start as pending payment. Your centre is created
                  right away and the plan activates once the payment is
                  approved.
                </FieldDescription>
              </Field>
            </StepPanel>

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((current) => Math.max(current - 1, 1))}
                disabled={visibleStep === 1}
              >
                <ChevronLeftIcon />
                Back
              </Button>

              {visibleStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={() => setStep((current) => current + 1)}
                >
                  Continue
                  <ChevronRightIcon />
                </Button>
              ) : (
                <SubmitButton />
              )}
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating your centre..." : "Create my centre"}
    </Button>
  );
}

/**
 * A wizard step that stays mounted while it is not the visible one.
 *
 * The form submits every field at once, so a step that unmounted when the
 * user advanced would discard its values. Hiding the panel with CSS keeps the
 * inputs in the DOM and in the submitted FormData.
 *
 * The panel is hidden with `display: none` rather than the `inert`
 * attribute: inert subtrees are excluded from form submission, which would
 * drop exactly the hidden fields this component exists to preserve.
 */
function StepPanel({
  step,
  visibleStep,
  children,
}: {
  step: number;
  visibleStep: number;
  children: React.ReactNode;
}) {
  const isVisible = step === visibleStep;

  return (
    <div
      className={isVisible ? "grid gap-5" : "hidden"}
      aria-hidden={isVisible ? undefined : true}
    >
      {children}
    </div>
  );
}
