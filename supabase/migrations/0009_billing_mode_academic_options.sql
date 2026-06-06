-- Billing mode, tenant profile fields, and tenant-managed academic groups.
-- Run this after 0008_rename_student_school_to_institution.sql.

alter table public.tenants
  add column if not exists secondary_phone text,
  add column if not exists email text;

alter table public.billing_settings
  add column if not exists billing_mode text not null default 'prepaid';

update public.billing_settings
set
  payment_start_day = case
    when payment_start_day = 25 and grace_period_days = 10 then 1
    else least(greatest(payment_start_day, 1), 15)
  end,
  grace_period_days = case
    when payment_start_day = 25 and grace_period_days = 10 then 7
    else least(greatest(grace_period_days, 0), 15)
  end,
  billing_mode = coalesce(billing_mode, 'prepaid');

alter table public.billing_settings
  drop constraint if exists billing_settings_billing_mode_check,
  drop constraint if exists billing_settings_payment_start_day_check,
  drop constraint if exists billing_settings_grace_period_days_check,
  add constraint billing_settings_billing_mode_check
    check (billing_mode in ('prepaid', 'postpaid')),
  add constraint billing_settings_payment_start_day_check
    check (payment_start_day between 1 and 15),
  add constraint billing_settings_grace_period_days_check
    check (grace_period_days between 0 and 15);

alter table public.billing_settings
  alter column payment_start_day set default 1,
  alter column grace_period_days set default 7,
  alter column billing_mode set default 'prepaid';

create table if not exists public.academic_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

drop trigger if exists set_academic_groups_updated_at
  on public.academic_groups;
create trigger set_academic_groups_updated_at
before update on public.academic_groups
for each row execute function public.set_updated_at();

alter table public.academic_groups enable row level security;

drop policy if exists "Admins can manage academic groups in their tenant"
  on public.academic_groups;
create policy "Admins can manage academic groups in their tenant"
on public.academic_groups
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

grant select, insert, update, delete on table public.academic_groups to authenticated;

insert into public.academic_groups (tenant_id, name, sort_order)
select tenant.id, defaults.name, defaults.sort_order
from public.tenants tenant
cross join (
  values
    ('Science', 10),
    ('Commerce', 20),
    ('Arts', 30)
) as defaults(name, sort_order)
on conflict (tenant_id, name) do nothing;

create index if not exists academic_groups_tenant_sort_idx
  on public.academic_groups(tenant_id, sort_order, name);
