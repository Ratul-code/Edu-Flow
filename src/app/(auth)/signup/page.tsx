import Link from "next/link"

import { MailCheckIcon } from "lucide-react"

import { SignupForm } from "@/components/auth/signup-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPlanCatalog } from "@/lib/billing/plans"

type SignupPageProps = {
  searchParams?: Promise<{
    awaitingConfirmation?: string
    email?: string
  }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  const awaitingConfirmation = params?.awaitingConfirmation === "1"
  const plans = await getPlanCatalog()

  if (awaitingConfirmation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheckIcon className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Confirm your email</h2>
            <p className="text-sm text-muted-foreground">
              {params?.email
                ? `We sent a confirmation link to ${params.email}.`
                : "We sent a confirmation link to your email address."}{" "}
              Open it to activate your account, then sign in to create your
              coaching centre.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/login" />}
          >
            Go to sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <SignupForm
        plans={plans}
        initialValues={params?.email ? { email: params.email } : undefined}
      />
      <p className="text-center text-sm text-muted-foreground">
        Already run a centre?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
