import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
          >
            EF
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-normal">Edu Flow</h1>
            <p className="text-sm text-muted-foreground">
              Coaching management for centres.
            </p>
          </div>
        </div>
        {children}
      </div>
    </main>
  )
}
