import { AlertCircleIcon } from "lucide-react"

import { signIn } from "@/lib/auth/actions"
import { hasSupabaseEnv } from "@/lib/supabase/config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const error = params?.error

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            EF
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-normal">
              Edu Flow
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your coaching workspace.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Admin login</CardTitle>
            <CardDescription>
              Use the admin account created in Supabase Auth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signIn}>
              <FieldGroup>
                {!hasSupabaseEnv ? (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Supabase is not configured</AlertTitle>
                    <AlertDescription>
                      Add the required values to .env.local before signing in.
                    </AlertDescription>
                  </Alert>
                ) : null}
                {error ? (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Login failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </Field>
                <Field>
                  <Button className="w-full" type="submit">
                    Sign in
                  </Button>
                  <FieldError />
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
