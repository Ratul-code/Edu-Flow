-- SaaS plan catalog.
-- Run this after 0018_bangla_sms_templates.sql.
--
-- This is the Edu Flow *subscription* layer (what a coaching centre pays for
-- using the product). It is deliberately separate from the tuition-fee
-- collection tables (`student_monthly_ledgers`, `student_payments`) and from
-- the SMS credit wallet (`sms_credit_packages`), which are tenant-side money
-- flows.
--
-- Table naming note: the shared Supabase project this app was developed
-- against also hosts another product's leftover `plans` / `subscriptions`
-- tables. Those names are avoided here on purpose -- `plan_definitions` and
-- `tenant_subscriptions` cannot be mistaken for them.

create table if not exists public.plan_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  billing_period text not null default 'monthly'
    check (billing_period in ('monthly', 'yearly')),
  currency text not null default 'BDT',
  -- Feature limits keyed by feature name, e.g. {"student_limit": 50}.
  -- Stored as jsonb so a new plan tier does not require a schema migration.
  limits jsonb not null default '{}'::jsonb,
  features jsonb not null default '[]'::jsonb,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(limits) = 'object'),
  check (jsonb_typeof(features) = 'array')
);

drop trigger if exists set_plan_definitions_updated_at on public.plan_definitions;
create trigger set_plan_definitions_updated_at
before update on public.plan_definitions
for each row execute function public.set_updated_at();

alter table public.plan_definitions enable row level security;

-- The catalog is global reference data: every authenticated user may read it
-- so the pricing screen can render before a tenant exists. Writes are
-- intentionally not granted to `authenticated`; plan changes are a platform
-- operation.
-- The plan catalog is public reference data. The pricing screen renders before
-- a visitor has an account, so anonymous reads are allowed. Only active plans
-- are visible. Writes are not granted to anon or authenticated -- changing the
-- catalog is a platform operation.
drop policy if exists "Users can read active plan definitions" on public.plan_definitions;
create policy "Users can read active plan definitions"
on public.plan_definitions
for select
to anon, authenticated
using (is_active = true);

grant select on table public.plan_definitions to anon, authenticated;

-- Only one plan may be the default. Enforced with a partial unique index so
-- the invariant holds no matter the insert order.
create unique index if not exists plan_definitions_single_default_idx
  on public.plan_definitions (is_default)
  where is_default = true;

insert into public.plan_definitions (
  code,
  name,
  description,
  price,
  billing_period,
  limits,
  features,
  is_default,
  sort_order
)
values
  (
    'free',
    'Free',
    'For a new coaching centre getting started.',
    0,
    'monthly',
    '{"student_limit": 30, "teacher_limit": 5, "batch_limit": 10, "admin_user_limit": 1, "sms_credit_limit": 0}'::jsonb,
    '["Student management","Batch scheduling","Fee ledgers","Teacher salaries"]'::jsonb,
    true,
    10
  ),
  (
    'standard',
    'Standard',
    'For a growing centre with a full student roster.',
    500,
    'monthly',
    '{"student_limit": 200, "teacher_limit": 20, "batch_limit": 50, "admin_user_limit": 3, "sms_credit_limit": 1000}'::jsonb,
    '["Student management","Batch scheduling","Fee ledgers","Teacher salaries","SMS automation","Priority support"]'::jsonb,
    false,
    20
  ),
  (
    'premium',
    'Premium',
    'For established centres running large operations.',
    1500,
    'monthly',
    '{"student_limit": 1000, "teacher_limit": 100, "batch_limit": 200, "admin_user_limit": 10, "sms_credit_limit": 10000}'::jsonb,
    '["Student management","Batch scheduling","Fee ledgers","Teacher salaries","SMS automation","Custom reports","Priority support","Dedicated onboarding"]'::jsonb,
    false,
    30
  )
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  billing_period = excluded.billing_period,
  limits = excluded.limits,
  features = excluded.features,
  is_default = excluded.is_default,
  sort_order = excluded.sort_order,
  updated_at = now();
