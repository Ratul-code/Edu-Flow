# Edu Flow

Edu Flow is a coaching management SaaS MVP for Bangladeshi coaching centers.
Phase 1 sets up the Next.js foundation, shadcn/ui component system, Supabase
Auth wiring, and the protected admin dashboard shell.

## Getting Started

Install dependencies and run the local server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

Create a Supabase project, then copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Create an admin user in Supabase Auth. Optional user metadata can include:

```json
{
  "full_name": "Admin Name",
  "tenant_name": "Dhaka Coaching Center"
}
```

Without Supabase env values, `/dashboard` redirects to `/login` and the login
page shows a configuration warning.

## Phase 1 Routes

- `/login` - admin login page
- `/dashboard` - protected dashboard shell
- `/students`, `/teachers`, `/batches`, `/schedule`, `/fees`, `/salaries`,
  `/notifications`, `/settings` - protected placeholder routes for upcoming
  milestones

## Checks

```bash
npm run lint
npm run build
```
