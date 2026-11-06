# Edu Flow

Edu Flow is a tenant-based coaching center management app. It helps coaching admins manage students, teachers, batches, schedules, monthly student fees, teacher salaries, payment receipts, and center settings.

The app is built with Next.js App Router, React, Supabase Auth/Postgres, shadcn-style UI components, Server Actions, and Supabase Edge Functions for scheduled ledger generation.

## Features

- Admin login with Supabase Auth
- Public signup that creates a coaching center and attaches a plan
- Subscription plans (Free, Standard 500 BDT, Premium 1500 BDT) with feature limits
- Manual subscription payment requests with platform approval, matching the SMS recharge flow
- Tenant-isolated students, teachers, and batches
- Student batch assignments and fee overrides
- Student monthly fee ledgers with prepaid/postpaid payment settings
- Teacher salary ledgers with prepaid/postpaid salary settings
- Student payment recording, receipts, preview, and PDF download
- Student profile payment history by month
- Center profile, billing settings, class levels, and academic groups
- Supabase Edge Function for scheduled monthly ledger creation

## Requirements

- Node.js compatible with the installed Next.js version
- npm
- A Supabase project
- Supabase SQL editor or CLI for running migrations
- Optional: Supabase Edge Functions/Cron for automatic ledger generation

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` is not present, create `.env.local` manually using the variables below.

## Environment Variables

The fastest way to get started is to copy the template and fill it in:

```bash
cp .env.example .env.local
```

Used by the Next.js app:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key for server-only admin reads

Used by SMS (GreenWeb):

```bash
SMS_MODE=demo
GREENWEB_SMS_TOKEN=
GREENWEB_SMS_API_URL=https://api.greenweb.com.bd/api.php?json
GREENWEB_SMS_INFO_URL=https://api.greenweb.com.bd/g_api.php
```

- `SMS_MODE`: `demo` (default) logs messages instead of sending real SMS. Set to
  `production` to send through GreenWeb.
- `GREENWEB_SMS_TOKEN`: GreenWeb API token. Required only when `SMS_MODE=production`.
- `GREENWEB_SMS_API_URL` / `GREENWEB_SMS_INFO_URL`: optional endpoint overrides; the
  defaults above are used when unset.

Used by the Supabase Edge Function:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
LEDGER_TIMEZONE=Asia/Dhaka
```

- `CRON_SECRET` is checked by the scheduled ledger function when provided.
- `LEDGER_TIMEZONE` defaults to `Asia/Dhaka` if not set.

These are set as Edge Function secrets rather than read from `.env.local`:

```bash
supabase secrets set --env-file .env.local
```

The app degrades gracefully when Supabase is unconfigured: the login page shows a
"Supabase is not configured" notice instead of failing to render.

## Database Setup

Run the SQL migrations in order from:

```txt
supabase/migrations
```

The current data model summary is documented in:

```txt
supabase/DATA_MODEL.md
```

After creating the first tenant and admin user, make sure the authenticated admin user has a matching row in `admin_users`, linked to the tenant and Supabase Auth user id.

### Automated local setup

Instead of pasting migrations into the SQL editor by hand, you can apply them and
seed the admin link in one step:

```bash
export SUPABASE_ACCESS_TOKEN=sbp_xxx   # https://supabase.com/dashboard/account/tokens
export ADMIN_AUTH_USER_ID=<auth.users id>

npm run db:setup
```

The script:

1. applies every migration in `supabase/migrations` in order,
2. inserts a demo tenant,
3. links `ADMIN_AUTH_USER_ID` to it as an active admin,
4. seeds the per-tenant option rows that the migrations only backfill for
   tenants that existed at migration time (`billing_settings`, `class_levels`,
   `academic_groups`, `medium_options`),
5. attaches any tenant without a subscription to the default (Free) plan.

The access token can also be saved to `.supabase-token` in the repo root, or
pasted interactively when the script runs. It is gitignored either way.

To list the auth users in the project and find their ids:

```bash
npm run db:list-users
```

### Creating a coaching center

New centers are created from the app. A visitor picks "Start your own centre"
on the login page, completes the signup wizard, and the app calls the
`provision_tenant(...)` Postgres function. That function creates the tenant,
the `admin_users` link, the subscription, and the per-tenant option rows in a
single transaction.

The function is idempotent on the auth user id, so submitting twice is safe.
If an account exists but has no center, `/onboarding` picks up where signup
left off.

Plans are seeded by migration `0019`: `free` (0 BDT), `standard` (500 BDT),
and `premium` (1500 BDT). Selecting a paid plan does not charge at signup.
It creates a payment request that stays `pending` until approved, and the
plan activates on approval. Use `approve_subscription_payment_request(...)`
to approve one.

### Supabase auth email limits

Signup creates the account and provisions the centre in one step when the
Supabase project has "Confirm email" turned off. With it on, the account is
created first and the centre is provisioned after the address is confirmed.

Supabase's shared SMTP sender allows only a small number of confirmation
emails per hour per project (`rate_limit_email_sent` defaults to `2`), and
that limit **cannot be raised above the default without configuring your own
SMTP provider**. Symptom: signup fails with
`over_email_send_rate_limit`, and the app shows "Too many sign-up attempts
just now."

Two ways out:

- Turn off "Confirm email" in the Supabase dashboard (Authentication -> Sign
  In / Providers -> Email). Signup then works without sending any email.
  Addresses are not verified, so use this for a private beta only.
- Configure a custom SMTP provider (Resend, SES, Postmark). This raises the
  email limit substantially and lets you send from your own domain. It needs
  SPF and DKIM DNS records.

### Schema conflicts

The migrations use `create table if not exists` and never drop tables. If the
target project already has tables with the same names but a different shape
(for example a `workspace_id` schema instead of Edu Flow's `tenant_id`), the
script stops with a schema conflict message instead of applying a partial
migration.

Use a dedicated project for Edu Flow, or reset the schema:

```bash
npm run db:reset        # drops and rebuilds the public schema
```

`db:reset` writes a JSON backup of every existing row to
`supabase-backup-<date>.json` before it drops anything, and refuses to continue
if that backup fails. To take a backup without resetting:

```bash
npm run db:backup
```

The backup contains row data only, not schema DDL, and is gitignored because it
can contain credentials from other tables.

### Clearing data without dropping tables

To delete every row while keeping the schema (tables, columns, RLS policies,
indexes) intact:

```bash
npm run db:wipe            # wipe all rows
npm run db:wipe -- --dry-run  # show row counts without deleting
```

This uses the service role key, so no personal access token is needed. It
writes a backup first, deletes rows in foreign-key dependency order, and
verifies at the end that every table is empty. Supabase Auth users are not
affected, since they live in the `auth` schema rather than `public`.


## Local Development

Start the dev server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Useful checks:

```bash
npm run lint
npm run build
```

Run these before pushing changes.

## Supabase Edge Function

The scheduled ledger function lives at:

```txt
supabase/functions/generate-monthly-ledgers
```

It creates missing monthly student fee ledgers and teacher salary ledgers when payment windows open. It is designed to be idempotent, so repeated runs should not duplicate ledgers.

A cron SQL template is provided at:

```txt
supabase/cron/generate-monthly-ledgers.sql
```

Before running it, replace the placeholder project URL and cron secret values.

## Deployment

### App Deployment

Deploy the Next.js app to a platform that supports Next.js App Router, such as Vercel.

Set these production environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start
```

### Supabase Deployment

1. Apply all migrations in `supabase/migrations`.
2. Deploy the Edge Function in `supabase/functions/generate-monthly-ledgers`.
3. Set Edge Function secrets.
4. Configure the cron job using the SQL template in `supabase/cron`.
5. Confirm the scheduled function can insert missing ledgers without duplicates.

## Project Structure

```txt
src/app              Next.js routes and API route handlers
src/components       Shared and domain UI components
src/lib/actions      Server Actions for mutations
src/lib/data         Supabase reads, derived data, and record types
src/lib/auth         Auth and admin context helpers
src/lib/supabase     Supabase client setup
supabase/migrations  Database migrations
supabase/functions   Edge Functions
supabase/cron        Cron setup SQL
```
