-- Tenant subscriptions, subscription payment requests, and subscription events.
-- Run this after 0019_plan_definitions.sql.
--
-- One active subscription per tenant. `tenants.subscription_status` remains the
-- denormalised summary read by the app (and by `getAdminContext()`); it is
-- kept in sync by the helper functions in this migration so there is exactly
-- one source of truth (`tenant_subscriptions.status`).

create table if not exists public.tenant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid not null references public.plan_definitions(id) on delete restrict,
  status text not null default 'active'
    check (status in ('trialing', 'pending_payment', 'active', 'past_due', 'cancelled', 'expired')),
  current_period_start date,
  current_period_end date,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id)
);

-- At most one non-terminal subscription per tenant.
create unique index if not exists tenant_subscriptions_active_idx
  on public.tenant_subscriptions (tenant_id)
  where status in ('trialing', 'pending_payment', 'active', 'past_due');

create table if not exists public.subscription_payment_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid not null references public.plan_definitions(id) on delete restrict,
  requested_by uuid not null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'BDT',
  payment_method text not null check (payment_method in ('bkash', 'nagad', 'bank', 'cash', 'other')),
  transaction_id text,
  payment_note text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid,
  approved_at timestamptz,
  rejected_by uuid,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, requested_by)
    references public.admin_users(tenant_id, id)
    on delete restrict,
  foreign key (tenant_id, approved_by)
    references public.admin_users(tenant_id, id),
  foreign key (tenant_id, rejected_by)
    references public.admin_users(tenant_id, id),
  check (
    (status = 'approved' and approved_by is not null and approved_at is not null)
    or status <> 'approved'
  ),
  check (
    (status = 'rejected' and rejected_by is not null and rejected_at is not null)
    or status <> 'rejected'
  )
);

-- Append-only audit trail for every subscription state change.
create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_type text not null
    check (event_type in (
      'subscription_created',
      'plan_changed',
      'payment_requested',
      'payment_approved',
      'payment_rejected',
      'subscription_cancelled',
      'subscription_expired',
      'renewed'
    )),
  from_plan_id uuid references public.plan_definitions(id) on delete set null,
  to_plan_id uuid references public.plan_definitions(id) on delete set null,
  amount numeric(12, 2) check (amount is null or amount >= 0),
  currency text not null default 'BDT',
  reference_type text,
  reference_id uuid,
  note text,
  created_at timestamptz not null default now(),
  unique (tenant_id, id)
);

create index if not exists tenant_subscriptions_tenant_idx
  on public.tenant_subscriptions(tenant_id);
create index if not exists subscription_payment_requests_tenant_status_idx
  on public.subscription_payment_requests(tenant_id, status);
create index if not exists subscription_payment_requests_tenant_created_idx
  on public.subscription_payment_requests(tenant_id, created_at desc);
create index if not exists subscription_events_tenant_created_idx
  on public.subscription_events(tenant_id, created_at desc);

drop trigger if exists set_tenant_subscriptions_updated_at on public.tenant_subscriptions;
create trigger set_tenant_subscriptions_updated_at
before update on public.tenant_subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_subscription_payment_requests_updated_at
  on public.subscription_payment_requests;
create trigger set_subscription_payment_requests_updated_at
before update on public.subscription_payment_requests
for each row execute function public.set_updated_at();

alter table public.tenant_subscriptions enable row level security;
alter table public.subscription_payment_requests enable row level security;
alter table public.subscription_events enable row level security;

drop policy if exists "Admins can read their tenant subscriptions" on public.tenant_subscriptions;
create policy "Admins can read their tenant subscriptions"
on public.tenant_subscriptions
for select
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()));

-- A tenant admin may request a payment and cancel their own request, but may
-- not approve or reject one. Approval is a platform operation.
drop policy if exists "Admins can manage tenant subscription payment requests"
  on public.subscription_payment_requests;
create policy "Admins can manage tenant subscription payment requests"
on public.subscription_payment_requests
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can read their tenant subscription events"
  on public.subscription_events;
create policy "Admins can read their tenant subscription events"
on public.subscription_events
for select
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()));

grant select on table public.tenant_subscriptions to authenticated;
grant select, insert, update, delete on table public.subscription_payment_requests to authenticated;
grant select on table public.subscription_events to authenticated;

-- ---------------------------------------------------------------------------
-- Helper: keep `tenants.subscription_status` in sync with the subscription.
-- ---------------------------------------------------------------------------

create or replace function public.sync_tenant_subscription_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_tenant_id uuid;
  next_status text;
begin
  target_tenant_id := coalesce(new.tenant_id, old.tenant_id);

  select case
    when status = 'active' then 'active'
    when status = 'trialing' then 'trial'
    when status = 'pending_payment' then 'trial'
    when status = 'past_due' then 'past_due'
    when status = 'expired' then 'suspended'
    when status = 'cancelled' then 'cancelled'
    else 'trial'
  end
  into next_status
  from public.tenant_subscriptions
  where tenant_id = target_tenant_id
    and status in ('trialing', 'pending_payment', 'active', 'past_due', 'expired', 'cancelled')
  order by
    case status
      when 'active' then 1
      when 'trialing' then 2
      when 'pending_payment' then 3
      when 'past_due' then 4
      when 'expired' then 5
      else 6
    end,
    created_at desc
  limit 1;

  if next_status is null then
    next_status := 'trial';
  end if;

  update public.tenants
  set subscription_status = next_status
  where id = target_tenant_id
    and subscription_status <> next_status;

  return coalesce(new, old);
end;
$$;

drop trigger if exists sync_tenant_subscription_status on public.tenant_subscriptions;
create trigger sync_tenant_subscription_status
after insert or update or delete on public.tenant_subscriptions
for each row execute function public.sync_tenant_subscription_status();

-- ---------------------------------------------------------------------------
-- Resolve a tenant's current plan limits.
-- ---------------------------------------------------------------------------

create or replace function public.current_tenant_plan_id(p_tenant_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select ts.plan_id
  from public.tenant_subscriptions ts
  where ts.tenant_id = p_tenant_id
    and ts.status in ('trialing', 'pending_payment', 'active', 'past_due')
  order by
    case ts.status
      when 'active' then 1
      when 'trialing' then 2
      when 'pending_payment' then 3
      else 4
    end,
    ts.created_at desc
  limit 1
$$;

grant execute on function public.current_tenant_plan_id(uuid) to authenticated;

-- Feature/limit lookup used by the app to enforce plan limits.
-- Returns -1 when the tenant has no subscription (no limit) and 0 when the
-- feature is not included in the current plan.
create or replace function public.current_plan_limit(
  p_tenant_id uuid,
  p_feature_key text
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select (pd.limits ->> p_feature_key)::integer
      from public.tenant_subscriptions ts
      join public.plan_definitions pd on pd.id = ts.plan_id
      where ts.tenant_id = p_tenant_id
        and ts.status in ('trialing', 'pending_payment', 'active', 'past_due')
        and pd.limits ? p_feature_key
      order by
        case ts.status
          when 'active' then 1
          when 'trialing' then 2
          when 'pending_payment' then 3
          else 4
        end,
        ts.created_at desc
      limit 1
    ),
    -1
  )
$$;

grant execute on function public.current_plan_limit(uuid, text) to authenticated;
