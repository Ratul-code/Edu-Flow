# Implementation Patterns

This file records patterns already used in the repository. Use it as a map for consistent future changes.

## Page Patterns

### Authenticated server page

Pages under `src/app/(app)` are async Server Components. They call `requireAdminContext()`, read promised `params`/`searchParams`, fetch tenant-scoped data, and compose domain components inside `PageHeader` + `Card`.

Reference files:

- `src/app/(app)/students/page.tsx`
- `src/app/(app)/fees/page.tsx`
- `src/app/(app)/salaries/page.tsx`
- `src/app/(app)/settings/page.tsx`

### Search/filter/pagination page

List pages parse search params locally with small helpers, fetch filtered data, compute pagination, and pass current URLs/filters into table and filter components.

Reference files:

- `src/app/(app)/students/page.tsx`
- `src/app/(app)/fees/page.tsx`
- `src/components/students/student-list-filters.tsx`
- `src/components/fees/fee-ledger-filters.tsx`

### Route handler

API routes are `route.ts` files under `src/app/api`. They authenticate with `requireAdminContext()`, await promised `params`, load tenant-scoped data, and return `Response`/`Response.json`.

Reference files:

- `src/app/api/payments/[paymentId]/receipt/route.ts`
- `src/app/api/payments/[paymentId]/receipt.pdf/route.ts`

## Table Patterns

### Domain table component

Tables use shared primitives from `src/components/ui/table`, accept typed records as props, render status via `StatusBadge`, and keep action buttons in a right-aligned flex container.

Reference files:

- `src/components/students/students-table.tsx`
- `src/components/fees/fee-ledgers-table.tsx`
- `src/components/salaries/salary-ledgers-table.tsx`
- `src/components/teachers/teachers-table.tsx`

### Row actions

Navigation actions use `Button` with `render={<Link ... />}`. Archive actions use `ArchiveConfirmDialog`. Receipt actions use `StudentPaymentReceiptDialog`.

Reference files:

- `src/components/students/students-table.tsx`
- `src/components/batches/batches-table.tsx`
- `src/components/fees/fee-ledgers-table.tsx`

### Status colors

Status display is centralized in `StatusBadge`; domain code passes normalized labels where needed.

Reference files:

- `src/components/app/status-badge.tsx`
- `src/lib/fee-status.ts`
- `src/components/fees/fee-ledgers-table.tsx`

## Form Patterns

### Card form

Standalone forms use `<form action={action}>` around a `Card`, with `CardHeader`, `CardContent`, `CardFooter`, and shared field primitives.

Reference files:

- `src/components/teachers/teacher-form.tsx`
- `src/components/fees/payment-form.tsx`
- `src/components/settings/billing-settings-form.tsx`

### Sheet create/edit form

Create/edit flows for students and teachers use sheet client wrappers for interactive state, while server components load option data and pass actions/records down.

Reference files:

- `src/components/students/student-form.tsx`
- `src/components/students/student-create-sheet-client.tsx`
- `src/components/students/student-edit-sheet-client.tsx`
- `src/components/teachers/teacher-form.tsx`

### Dirty/validation sheet guard

Student create sheet tracks dirty state, client validation errors, pending state, and opens a confirmation dialog before discarding changes.

Reference files:

- `src/components/students/student-create-sheet-client.tsx`

## Zod Validation Patterns

### Central schema file

Form schemas live in `src/lib/schemas.ts`. Shared helpers trim text, parse numbers from strings, validate date strings, and format zod errors.

Reference files:

- `src/lib/schemas.ts`

### Server parsing

Server actions parse `FormData` with `parseFormData(schema, formData)` when errors should throw, or `safeParse` when returning form state.

Reference files:

- `src/lib/actions/students.ts`
- `src/lib/actions/fees.ts`
- `src/lib/actions/settings.ts`

### Client-side prevalidation

Interactive sheet forms can call the same zod schema before submit to display immediate errors.

Reference files:

- `src/components/students/student-create-sheet-client.tsx`

## Server Action Patterns

### Mutation action

Actions start with `"use server"`, call `requireAdminContext()`, create the Supabase server client, validate input, scope by tenant, mutate, revalidate affected paths/tags, then redirect or toast.

Reference files:

- `src/lib/actions/students.ts`
- `src/lib/actions/teachers.ts`
- `src/lib/actions/batches.ts`
- `src/lib/actions/fees.ts`

### Form state action

Create actions used with `useActionState` return `FormState` on validation or insert failure, and redirect with toast on success.

Reference files:

- `src/lib/actions/students.ts`
- `src/lib/actions/teachers.ts`

### Idempotent ledger creation

Ledger creation checks existing rows or uses upsert/conflict options so repeated runs do not create duplicates.

Reference files:

- `src/lib/actions/fees.ts`
- `src/lib/data/salaries.ts`
- `supabase/functions/generate-monthly-ledgers/index.ts`

## Data Fetching Patterns

### Data module per domain

Read queries, record types, normalization helpers, month/status helpers, and list/detail functions live in `src/lib/data`.

Reference files:

- `src/lib/data/students.ts`
- `src/lib/data/fees.ts`
- `src/lib/data/salaries.ts`
- `src/lib/data/batches.ts`

### Cached route data

Student list data uses `unstable_cache` with a cache tag and explicit revalidation from mutations.

Reference files:

- `src/lib/data/students.ts`
- `src/lib/actions/students.ts`

### Nested Supabase normalization

Supabase nested selects can return an object or array; data modules normalize them with `firstNested`.

Reference files:

- `src/lib/data/fees.ts`
- `src/lib/data/salaries.ts`
- `src/lib/data/payment-receipts.ts`

## Receipt Generation Patterns

### Receipt data loader

Receipt routes and preview share a single loader that gathers payment, ledger, student, tenant, batches, and payment history.

Reference files:

- `src/lib/data/payment-receipts.ts`

### Receipt preview component

The modal preview renders `StudentPaymentReceipt` from shared receipt data.

Reference files:

- `src/components/receipts/student-payment-receipt.tsx`
- `src/components/receipts/student-payment-receipt-dialog.tsx`

### Receipt download route

PDF download uses a route handler that loads receipt data and returns an `application/pdf` response with an attachment filename.

Reference files:

- `src/app/api/payments/[paymentId]/receipt.pdf/route.ts`
- `src/lib/receipts/student-payment-receipt-pdf.ts`

## Supabase Query Patterns

### Authenticated client

Most server actions and data reads use the cookie-aware client from `src/lib/supabase/server.ts`.

Reference files:

- `src/lib/supabase/server.ts`
- `src/lib/actions/fees.ts`
- `src/lib/data/fees.ts`

### Admin client

The service-role client is isolated in src/lib/supabase/admin.ts.
Use only for intentional server-only operations that require bypassing RLS.
Never expose service-role access to client code.

### Tenant scoping

Queries and mutations include `.eq("tenant_id", tenantId)` or tenant-specific ids after `requireAdminContext()`.

Reference files:

- `src/lib/actions/students.ts`
- `src/lib/actions/fees.ts`
- `src/lib/data/payment-receipts.ts`

### Select strings with joins

Nested data is fetched with Supabase select strings and aliases, then typed locally.

Reference files:

- `src/lib/data/fees.ts`
- `src/lib/data/payment-receipts.ts`
- `src/lib/auth/user.ts`

## Flash Toast Patterns

### Redirect with toast payload

Successful mutations use `redirectWithFlashToast(path, payload)` to encode the toast into the redirected URL.

Reference files:

- `src/lib/flash-toast.ts`
- `src/lib/actions/students.ts`
- `src/lib/actions/fees.ts`
- `src/lib/actions/settings.ts`

### Client toast display

The app-level flash toast component reads the payload and displays Sonner toasts with tone-specific styling.

Reference files:

- `src/components/app/flash-toast.tsx`
- `src/components/ui/sonner.tsx`
- `src/lib/flash-toast-shared.ts`
