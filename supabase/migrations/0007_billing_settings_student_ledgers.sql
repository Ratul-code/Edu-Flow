-- Edu Flow student fee billing settings and ledger lifecycle dates.
-- Run this after 0006_class_levels.sql.

create table if not exists public.billing_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  payment_start_day smallint not null default 25
    check (payment_start_day between 1 and 31),
  grace_period_days smallint not null default 10
    check (grace_period_days between 1 and 31),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

insert into public.billing_settings (tenant_id, payment_start_day, grace_period_days)
select id, 25, 10
from public.tenants
on conflict (tenant_id) do nothing;

drop trigger if exists set_billing_settings_updated_at
  on public.billing_settings;
create trigger set_billing_settings_updated_at
before update on public.billing_settings
for each row execute function public.set_updated_at();

alter table public.billing_settings enable row level security;

drop policy if exists "Admins can manage billing settings in their tenant"
  on public.billing_settings;
create policy "Admins can manage billing settings in their tenant"
on public.billing_settings
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

grant select, insert, update, delete on table public.billing_settings to authenticated;

alter table public.student_monthly_ledgers
  add column if not exists payment_start_date date,
  add column if not exists grace_end_date date;

with settings as (
  select
    t.id as tenant_id,
    coalesce(bs.payment_start_day, 25) as payment_start_day,
    coalesce(bs.grace_period_days, 10) as grace_period_days
  from public.tenants t
  left join public.billing_settings bs on bs.tenant_id = t.id
)
update public.student_monthly_ledgers ledger
set
  payment_start_date = make_date(
    extract(year from ledger.ledger_month)::int,
    extract(month from ledger.ledger_month)::int,
    least(
      settings.payment_start_day,
      extract(
        day from (ledger.ledger_month + interval '1 month' - interval '1 day')
      )::int
    )
  ),
  grace_end_date = (
    make_date(
      extract(year from ledger.ledger_month)::int,
      extract(month from ledger.ledger_month)::int,
      least(
        settings.payment_start_day,
        extract(
          day from (ledger.ledger_month + interval '1 month' - interval '1 day')
        )::int
      )
    )
    + (greatest(settings.grace_period_days, 1) - 1) * interval '1 day'
  )::date
from settings
where settings.tenant_id = ledger.tenant_id
  and (
    ledger.payment_start_date is null
    or ledger.grace_end_date is null
  );

update public.student_monthly_ledgers
set status = case
  when status = 'waived' then 'waived'
  when due_amount <= 0 then 'paid'
  when paid_amount > 0 then 'partial'
  when current_date < payment_start_date then 'not_started'
  when current_date <= grace_end_date then 'due'
  else 'overdue'
end
where status = 'unpaid'
   or status not in ('not_started', 'due', 'overdue', 'partial', 'paid', 'waived');

alter table public.student_monthly_ledgers
  alter column payment_start_date set not null,
  alter column grace_end_date set not null,
  alter column status set default 'not_started';

alter table public.student_monthly_ledgers
  drop constraint if exists student_monthly_ledgers_status_check,
  drop constraint if exists student_monthly_ledgers_billing_window_check,
  add constraint student_monthly_ledgers_status_check
    check (status in ('not_started', 'due', 'overdue', 'partial', 'paid', 'waived')),
  add constraint student_monthly_ledgers_billing_window_check
    check (payment_start_date <= grace_end_date);

create index if not exists student_monthly_ledgers_tenant_payment_start_idx
  on public.student_monthly_ledgers(tenant_id, payment_start_date);

create index if not exists student_monthly_ledgers_tenant_grace_end_idx
  on public.student_monthly_ledgers(tenant_id, grace_end_date);
