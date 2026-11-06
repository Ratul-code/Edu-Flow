import Link from "next/link"

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
    next?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const error = params?.error
  const next = params?.next

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <CardDescription>
            Sign in to your coaching workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signIn}>
            {next ? <input type="hidden" name="next" value={next} /> : null}

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

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start your own centre</CardTitle>
          <CardDescription>
            Create a new coaching centre and pick a plan. The free plan works
            forever.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/signup" />}
          >
            Create a coaching centre
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
