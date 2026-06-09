# Edu Flow

Edu Flow is a tenant-based coaching center management app. It helps coaching admins manage students, teachers, batches, schedules, monthly student fees, teacher salaries, payment receipts, and center settings.

The app is built with Next.js App Router, React, Supabase Auth/Postgres, shadcn-style UI components, Server Actions, and Supabase Edge Functions for scheduled ledger generation.

## Features

- Admin login with Supabase Auth
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

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Used by the Next.js app:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key for server-only admin reads

Used by the Supabase Edge Function:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
LEDGER_TIMEZONE=Asia/Dhaka
```

- `CRON_SECRET` is checked by the scheduled ledger function when provided.
- `LEDGER_TIMEZONE` defaults to `Asia/Dhaka` if not set.

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
