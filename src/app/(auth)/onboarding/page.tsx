import { redirect } from "next/navigation"

import { OnboardingForm } from "@/components/auth/onboarding-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getPlanCatalog } from "@/lib/billing/plans"
import {
  getAuthenticatedUser,
  hasTenantMembership,
} from "@/lib/auth/user"

type OnboardingPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = await searchParams
  const user = await getAuthenticatedUser()

  // Signed-out visitors belong on the login page.
  if (!user) {
    redirect("/login?next=/onboarding")
  }

  // Already part of a centre: nothing to do here.
  if (await hasTenantMembership()) {
    redirect("/dashboard")
  }

  const plans = await getPlanCatalog()
  const metadata = user.user_metadata ?? {}
  const defaultName =
    typeof metadata.full_name === "string" ? metadata.full_name : undefined
  const defaultPhone =
    typeof metadata.phone === "string" ? metadata.phone : undefined

  return (
    <>
      {params?.error ? (
        <Alert variant="destructive">
          <AlertTitle>Setup failed</AlertTitle>
          <AlertDescription>{params.error}</AlertDescription>
        </Alert>
      ) : null}

      <OnboardingForm
        plans={plans}
        defaultName={defaultName}
        defaultPhone={defaultPhone}
        defaultEmail={user.email}
      />
    </>
  )
}
