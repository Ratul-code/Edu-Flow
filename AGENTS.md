## Architecture

- Tenant-scoped coaching management SaaS.
- Stack: Next.js App Router, React Server Components, Server Actions, shadcn/ui, Tailwind CSS v4, Supabase.
- App name/package: `edu-flow`.

## UI Reference Migration

There is a `ui-reference/` folder containing the Bolt-generated mockup project.

Use `ui-reference/` as the visual/design source of truth only.

The real app remains the source of truth for:

- business logic
- API calls
- authentication
- authorization
- validation
- routing
- permissions
- state management
- error handling
- loading behavior

Do not copy mock data from `ui-reference/`.

When replacing reusable components, preserve the real app's props, data flow, handlers, permissions, and API integrations.

Create and maintain `DESIGN.md` to document the design system extracted from `ui-reference/`.

## Structure

- `src/app/(app)` -> authenticated admin routes.
- `src/app/(auth)` -> authentication routes.
- `src/app/api` -> route handlers for receipts and downloads.
- `src/components/app` -> admin shell, page headers, shared module/table/filter helpers.
- `src/components/ui` -> shadcn/base UI primitives only.
- `src/components/<domain>` -> domain-specific UI for students, teachers, batches, fees, salaries, settings, dashboard, receipts.
- `src/lib/actions` -> server mutations.
- `src/lib/data` -> tenant-scoped reads, derived data, cache helpers, normalization.
- `src/lib/auth` -> user, admin, and tenant context.
- `src/lib/supabase` -> Supabase clients and config.
- `src/lib/schemas.ts` -> zod schemas, form parsing, shared form state.
- `src/lib/admin/module-config.ts` -> placeholder/admin module metadata.
- `supabase/migrations` -> schema source of truth.
- `supabase/functions` -> Edge Functions.
- `supabase/cron` -> scheduled jobs.
- `ui-reference` -> visual reference only.

## Development Workflow

Before implementing:

1. Search for existing patterns in `PATTERN.md`.
2. Reuse existing components, actions, schemas, data modules, and tables.
3. Keep new code domain-local unless it is clearly reused across multiple modules.
4. Update `DATA_MODEL.md` when domain concepts, relationships, billing rules, ledgers, receipts, or scheduled jobs change.
5. Update `DESIGN.md` when visual system decisions change.

## Folder Responsibilities

- `src/app` -> route composition, auth context, data loading, Suspense boundaries, redirects.
- `src/components/ui` -> reusable primitives with no domain business logic.
- `src/components/app` -> app shell and reusable admin UI building blocks.
- `src/components/<domain>` -> domain components, forms, tables, sheets, detail sections.
- `src/lib/actions` -> server actions, validation, mutations, revalidation, redirects/toasts.
- `src/lib/data` -> queries, record types, filters, calculations, cache tags, normalization.
- `src/lib/schemas.ts` -> zod schemas and `FormData` parsing.
- `src/lib/supabase/server.ts` -> cookie-aware authenticated client.
- `src/lib/supabase/admin.ts` -> service-role client for server-only cache/data operations.

## Coding Conventions

- Prefer Server Components; use Client Components only for interactivity, local state, dialogs, sheets, form guards, and action-state UX.
- Keep components small and close to their domain.
- Use existing `Button`, `Card`, `Table`, `Empty`, `Skeleton`, `Sheet`, `Dialog`, `StatusBadge`, and domain table patterns before introducing new primitives.
- Keep display strings concise, operational, and admin-focused.
- Do not silently refactor unrelated code.
- Preserve existing route URLs and handler response shapes.

## Critical Business Rules

- Every tenant record read or write must be scoped by `tenant_id`.
- Preserve historical ledgers, payments, and receipts unless explicitly requested.
- Receipt actions must use real payment data only and should not appear for rows without a payment.
- Payment actions should only appear when a real due amount exists.
- Ledger generation and scheduled jobs must be idempotent.
- Student fee start months, batch assignment fee timing, and salary/payment settings are business rules, not visual details.

## Supabase Rules

- Call `requireAdminContext()` before tenant-scoped app reads or mutations.
- Use `.eq("tenant_id", admin.tenantId)` or trusted tenant-scoped ids for every tenant query/mutation.
- Use `createClient()` for normal authenticated server reads/writes.
- Use `createAdminClient()` only for intentional server-only operations such as cached route data or RLS-bypassing jobs.
- Never expose service-role credentials to client code.
- New tables require migrations and RLS policies consistent with existing migrations.
- Add migrations instead of making schema assumptions.
- Update `DATA_MODEL.md` when introducing important domain concepts.

## Component Rules

- List pages use compact page padding, a `PageHeader`, a primary action, a table card with `py-0 gap-0`, a bordered filter band, and `CardContent className="p-0"`.
- Domain tables own domain-specific row rendering and actions.
- Reusable admin placeholders may use `AdminModulePage`, `ModuleToolbar`, `AdminDataTable`, and `AdminEmptyState`.
- Create/edit flows prefer sheets for students, teachers, and batches when that matches existing UX.
- Keep real actions, validation, pending states, dirty guards, redirects, and cache invalidation intact when changing visuals.

## Common Mistakes To Avoid

- Do not query Supabase without tenant filters.
- Do not use service-role clients in client-facing code.
- Do not copy mock data from `ui-reference/`.
- Do not mutate historical ledger snapshots unless explicitly requested.
- Do not show receipt actions for non-payment rows.
- Do not replace Server Actions or data loaders with client-only mock state.
- Do not move domain business logic into UI primitives.
- Run `npm run lint` and `npm run build` after code changes when feasible.

## Documentation Maintenance

Update documentation when repository patterns or business concepts change:

- Update `PATTERN.md` when introducing new implementation patterns.
- Update `DESIGN.md` when changing visual system choices.
- Update `DATA_MODEL.md` when introducing new entities, relationships, billing rules, ledgers, receipts, or scheduled jobs.
- Do not update documentation for routine CRUD changes that do not introduce new patterns or concepts.
