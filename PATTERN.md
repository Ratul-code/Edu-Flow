# Implementation Patterns

This file records patterns already used in the repository. Use it as a map for consistent future changes.

## Page Patterns

### Authenticated app shell

Routes under `src/app/(app)` render inside the authenticated layout. The layout calls `requireAdminContext()`, renders `AppSidebar`, `Topbar`, `SidebarProvider`, and a scrollable main area.

Reference files:

- `src/app/(app)/layout.tsx`
- `src/components/app/app-sidebar.tsx`
- `src/components/app/topbar.tsx`
- `src/lib/auth/user.ts`

### Authenticated server page

Pages under `src/app/(app)` are async Server Components. They call `requireAdminContext()`, await promised `searchParams` or `params`, fetch tenant-scoped data, and compose domain components.

Reference files:

- `src/app/(app)/students/page.tsx`
- `src/app/(app)/batches/page.tsx`
- `src/app/(app)/fees/page.tsx`
- `src/app/(app)/salaries/page.tsx`
- `src/app/(app)/settings/page.tsx`

### Operational list page

Current list pages use compact `p-4 md:p-6` page padding, `PageHeader`, a right-aligned primary action, then a table `Card` with `className="gap-0 py-0"` and `CardContent className="p-0"`. Filters live in a bordered band above the results.

Reference files:

- `src/app/(app)/students/page.tsx`
- `src/app/(app)/batches/page.tsx`
- `src/app/(app)/teachers/page.tsx`
- `src/app/(app)/fees/page.tsx`
- `src/app/(app)/salaries/page.tsx`

### Tabbed settings page

Mature settings surfaces use `Tabs`, `TabsList variant="line"`, and `TabsTrigger` from `src/components/ui/tabs`. The route remains an authenticated Server Component that loads real tenant-scoped settings and passes them to domain forms/managers.

Reference files:

- `src/app/(app)/settings/page.tsx`
- `src/components/settings/billing-settings-form.tsx`
- `src/components/settings/teacher-payment-settings-form.tsx`

### Suspense results page

Pages that filter or page data split static chrome, filter options, and result tables into nested Server Components with `Suspense` skeletons. The inner result boundary uses a key derived from normalized search params.

Reference files:

- `src/app/(app)/students/page.tsx`
- `src/app/(app)/batches/page.tsx`
- `src/app/(app)/fees/page.tsx`
- `src/app/(app)/salaries/page.tsx`

### Placeholder module page

Placeholder or generic admin modules use `AdminModulePage` with `adminModules` metadata. This is for scaffolded modules only; mature domains should keep dedicated pages and domain components.

Reference files:

- `src/components/app/admin-module-page.tsx`
- `src/components/app/admin-data-table.tsx`
- `src/components/app/module-toolbar.tsx`
- `src/lib/admin/module-config.ts`

### Route handler

API routes are `route.ts` files under `src/app/api`. They authenticate with `requireAdminContext()`, await promised `params`, load tenant-scoped data, and return `Response` or `Response.json`.

Reference files:

- `src/app/api/payments/[paymentId]/receipt/route.ts`
- `src/app/api/payments/[paymentId]/receipt.pdf/route.ts`
- `src/app/api/salary-payments/[paymentId]/receipt/route.ts`
- `src/app/api/salary-payments/[paymentId]/receipt.pdf/route.ts`

## Table Patterns

### Domain table component

Domain tables use shared primitives from `src/components/ui/table`, accept typed records as props, render status via `StatusBadge`, keep money columns right-aligned, and keep row actions in a right-aligned flex container.

Reference files:

- `src/components/students/students-table.tsx`
- `src/components/teachers/teachers-table.tsx`
- `src/components/batches/batches-table.tsx`
- `src/components/fees/fee-ledgers-table.tsx`
- `src/components/salaries/salary-ledgers-table.tsx`

### Dense table style

List tables follow the reference density: headers use `h-9 text-xs font-medium`, primary identity cells come first, avatars use compact initials, rows use `py-3`, and actions use `xs` or compact icon buttons.

Reference files:

- `src/components/fees/fee-ledgers-table.tsx`
- `src/components/salaries/salary-ledgers-table.tsx`
- `src/components/students/students-table.tsx`
- `DESIGN.md`

### Row actions

Navigation actions use `Button` with `render={<Link ... />}`. Destructive/archive actions use `ArchiveConfirmDialog`. Payment and receipt actions are conditional on due amounts and real latest payment records.

Reference files:

- `src/components/students/students-table.tsx`
- `src/components/teachers/teachers-table.tsx`
- `src/components/batches/batches-table.tsx`
- `src/components/fees/fee-ledgers-table.tsx`
- `src/components/salaries/salary-ledgers-table.tsx`

### Status colors

Status display is centralized in `StatusBadge`; domain code passes normalized labels where needed.

Reference files:

- `src/components/app/status-badge.tsx`
- `src/lib/fee-status.ts`
- `src/components/fees/fee-ledgers-table.tsx`
- `src/components/salaries/salary-ledgers-table.tsx`

## Form Patterns

### Card form

Standalone forms use `<form action={action}>` around a `Card`, with `CardHeader`, `CardContent`, `CardFooter`, and shared field primitives.

Reference files:

- `src/components/teachers/teacher-form.tsx`
- `src/components/fees/payment-form.tsx`
- `src/components/salaries/salary-payment-form.tsx`
- `src/components/settings/billing-settings-form.tsx`

### Sheet create/edit form

Create/edit flows for students, teachers, and batches use sheet client wrappers for interactive state, while server components load option data and pass actions/records down.

Reference files:

- `src/components/students/student-form.tsx`
- `src/components/students/student-create-sheet-client.tsx`
- `src/components/students/student-edit-sheet-client.tsx`
- `src/components/teachers/teacher-form.tsx`
- `src/components/batches/batch-sheet.tsx`
- `src/components/batches/batch-form-client.tsx`

### Dirty and validation guards

Interactive sheet forms can track dirty state, validation errors, and pending state, then confirm before discarding changes.

Reference files:

- `src/components/students/student-create-sheet-client.tsx`
- `src/components/students/student-edit-sheet-client.tsx`
- `src/components/batches/batch-form-client.tsx`

## Zod Validation Patterns

### Central schema file

Form schemas live in `src/lib/schemas.ts`. Shared helpers trim text, parse numbers from strings, validate date/month/time strings, and format zod errors.

Reference files:

- `src/lib/schemas.ts`

### Server parsing

Server actions parse `FormData` with `parseFormData(schema, formData)` when errors should throw, or `safeParse` when returning `FormState` for `useActionState`.

Reference files:

- `src/lib/actions/students.ts`
- `src/lib/actions/teachers.ts`
- `src/lib/actions/batches.ts`
- `src/lib/actions/fees.ts`
- `src/lib/actions/salaries.ts`
- `src/lib/actions/settings.ts`

### Client-side prevalidation

Interactive sheet forms may call the same zod schema before submit to display immediate errors while preserving the server action as the authority.

Reference files:

- `src/components/students/student-create-sheet-client.tsx`
- `src/components/batches/batch-form-client.tsx`

## Server Action Patterns

### Mutation action

Actions start with `"use server"`, call `requireAdminContext()`, create the Supabase server client, validate input, scope by tenant, mutate, revalidate affected paths/tags, then redirect or toast.

Reference files:

- `src/lib/actions/students.ts`
- `src/lib/actions/teachers.ts`
- `src/lib/actions/batches.ts`
- `src/lib/actions/fees.ts`
- `src/lib/actions/salaries.ts`
- `src/lib/actions/settings.ts`

### Form state action

Create actions used with `useActionState` return `FormState` on validation or insert failure, and redirect with flash toast on success.

Reference files:

- `src/lib/actions/students.ts`
- `src/lib/actions/teachers.ts`

### Flash toast redirect

Successful mutations use `redirectWithFlashToast()` or `setFlashToast()` so the next page owns the visible notification.

Reference files:

- `src/lib/flash-toast.ts`
- `src/lib/flash-toast-shared.ts`
- `src/components/app/flash-toast.tsx`
- `src/lib/actions/students.ts`

### Idempotent ledger creation

Ledger creation checks existing rows or uses upsert/conflict options so repeated runs do not create duplicates.

Reference files:

- `src/lib/actions/fees.ts`
- `src/lib/actions/salaries.ts`
- `src/lib/data/salaries.ts`
- `supabase/functions/generate-monthly-ledgers/index.ts`
- `supabase/cron/generate-monthly-ledgers.sql`

## Data Fetching Patterns

### Data module per domain

Read queries, record types, filter types, normalization helpers, month/status helpers, and list/detail functions live in `src/lib/data`.

Reference files:

- `src/lib/data/students.ts`
- `src/lib/data/teachers.ts`
- `src/lib/data/batches.ts`
- `src/lib/data/fees.ts`
- `src/lib/data/salaries.ts`
- `src/lib/data/payment-receipts.ts`
- `src/lib/data/salary-receipts.ts`

### Cached route data

High-traffic list route data can use `unstable_cache` with explicit cache tags. Mutations must call `revalidateTag(..., { expire: 0 })` and revalidate affected paths.

Reference files:

- `src/lib/data/students.ts`
- `src/lib/data/batches.ts`
- `src/lib/actions/students.ts`
- `src/lib/actions/batches.ts`

### Nested Supabase normalization

Supabase nested selects can return an object or array; data modules normalize them before passing records to components.

Reference files:

- `src/lib/data/fees.ts`
- `src/lib/data/salaries.ts`
- `src/lib/data/payment-receipts.ts`
- `src/lib/data/salary-receipts.ts`

### Tenant record helpers

Generic counts and previews for admin modules live in tenant-record helpers and always receive an explicit `tenantId`.

Reference files:

- `src/lib/data/tenant-records.ts`
- `src/components/app/admin-module-page.tsx`
- `src/app/(app)/students/page.tsx`
- `src/app/(app)/batches/page.tsx`

## Receipt Generation Patterns

### Receipt data loader

Receipt routes and preview dialogs share data loaders that gather payment, ledger, person, tenant, and payment history data.

Reference files:

- `src/lib/data/payment-receipts.ts`
- `src/lib/data/salary-receipts.ts`

### Receipt preview component

The modal preview renders shared receipt data and links to the download route.

Reference files:

- `src/components/receipts/student-payment-receipt.tsx`
- `src/components/receipts/student-payment-receipt-dialog.tsx`
- `src/components/salaries/salary-payment-receipt.tsx`
- `src/components/salaries/salary-payment-receipt-dialog.tsx`

### Receipt download route

PDF download routes load receipt data and return an `application/pdf` response with an attachment filename.

Reference files:

- `src/app/api/payments/[paymentId]/receipt.pdf/route.ts`
- `src/app/api/salary-payments/[paymentId]/receipt.pdf/route.ts`
- `src/lib/receipts/student-payment-receipt-pdf.ts`
- `src/lib/receipts/teacher-salary-receipt-pdf.ts`

## Supabase Query Patterns

### Authenticated client

Most server actions and data reads use the cookie-aware client from `src/lib/supabase/server.ts`.

Reference files:

- `src/lib/supabase/server.ts`
- `src/lib/actions/fees.ts`
- `src/lib/data/fees.ts`

### Admin client

The service-role client is isolated in `src/lib/supabase/admin.ts`. Use it only for intentional server-only operations that require bypassing RLS or for cached server data where tenant ids are still explicit.

Reference files:

- `src/lib/supabase/admin.ts`
- `src/lib/data/students.ts`
- `src/lib/data/batches.ts`

### Tenant scoping

Queries and mutations include `.eq("tenant_id", tenantId)` or tenant-specific ids after `requireAdminContext()`.

Reference files:

- `src/lib/auth/user.ts`
- `src/lib/actions/students.ts`
- `src/lib/actions/teachers.ts`
- `src/lib/actions/batches.ts`
- `src/lib/actions/fees.ts`
- `src/lib/data/tenant-records.ts`

## Design Migration Patterns

### Visual source of truth

Use `ui-reference/` and `DESIGN.md` for layout, density, colors, and component feel only. Keep production routes, data, actions, validation, auth, loading states, and error handling.

Reference files:

- `ui-reference/src/pages/Students.tsx`
- `ui-reference/src/pages/Batches.tsx`
- `ui-reference/src/pages/Fees.tsx`
- `DESIGN.md`

### No mock data

Do not copy arrays, names, phone numbers, fees, counts, or reference-only navigation from `ui-reference/`. Production pages must render real Supabase data or existing empty/loading states.

Reference files:

- `AGENTS.md`
- `DESIGN.md`
