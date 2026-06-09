## Architecture

- Tenant-scoped coaching management SaaS.
- Stack: Next.js App Router, React Server Components, Server Actions, shadcn/ui, Supabase.

### Structure

- `src/app/(app)` → authenticated routes
- `src/app/(auth)` → authentication
- `src/app/api` → route handlers
- `src/components` → UI components by domain
- `src/lib/actions` → mutations
- `src/lib/data` → reads and derived data
- `src/lib/auth` → auth and tenant context
- `src/lib/supabase` → Supabase clients
- `supabase/migrations` → schema source of truth
- `supabase/functions` → Edge Functions
- `supabase/cron` → scheduled jobs

## Development Workflow

Before implementing:

1. Search for existing patterns in PATTERNS.md.
2. Reuse existing components, actions, schemas, and tables.
3. Create new abstractions only when used across multiple domains.
4. Update DATA_MODEL.md when domain concepts change.

## Folder Responsibilities

- `src/app` → route composition, auth context, data loading.
- `src/components/ui` → reusable UI primitives only.
- `src/components/<domain>` → domain-specific UI.
- `src/lib/actions` → server mutations.
- `src/lib/data` → queries, calculations, derived data.
- `src/lib/schemas.ts` → zod schemas and form parsing.
- `src/lib/supabase/server.ts` → authenticated client.
- `src/lib/supabase/admin.ts` → service-role client (server-only).

## Coding Conventions

- Prefer existing components and patterns before creating new abstractions.
- Keep components small and domain-local unless clearly reusable.
- Do not silently refactor unrelated code.
- Keep display strings concise and workflow-focused.

## Critical Business Rules

- Preserve historical ledgers, receipts, and payments unless explicitly requested.

## Supabase Rules

- Every tenant query or mutation must be scoped by `tenant_id`.
- Use `createAdminClient()` only for intentional server-only service-role operations.
- Never expose service-role credentials to client code.
- New tables require RLS policies consistent with existing migrations.
- Add migrations instead of making schema assumptions.
- Update `DATA_MODEL.md` when introducing important domain concepts.
- Scheduled jobs and ledger generation must be idempotent.

## Component Rules

- Prefer Server Components; use Client Components only when interactivity requires them.
- Reuse existing patterns before creating new UI abstractions.

## Common Mistakes To Avoid

- Do not query Supabase without tenant filters.
- Do not use service-role clients in client-facing code.
- Do not mutate historical ledger snapshots unless explicitly requested.
- Do not show receipt actions for non-payment rows.
- Run `npm run lint` and `npm run build` after code changes.

## Documentation Maintenance

Update documentation when repository patterns or business concepts change:

- Update `PATTERNS.md` when introducing new implementation patterns.
- Update `DATA_MODEL.md` when introducing new entities, relationships, billing rules, or scheduled jobs.
- Do not update documentation for routine CRUD changes that do not introduce new patterns or concepts.
