-- Teacher salary payment settings and automatic salary window dates.
-- Run this after 0009_billing_mode_academic_options.sql.

create table if not exists public.teacher_payment_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  payment_system text not null default 'prepaid'
    check (payment_system in ('prepaid', 'postpaid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

insert into public.teacher_payment_settings (tenant_id, payment_system)
select id, 'prepaid'
from public.tenants
on conflict (tenant_id) do nothing;

drop trigger if exists set_teacher_payment_settings_updated_at
  on public.teacher_payment_settings;
create trigger set_teacher_payment_settings_updated_at
before update on public.teacher_payment_settings
for each row execute function public.set_updated_at();

alter table public.teacher_payment_settings enable row level security;

drop policy if exists "Admins can manage teacher payment settings in their tenant"
  on public.teacher_payment_settings;
create policy "Admins can manage teacher payment settings in their tenant"
on public.teacher_payment_settings
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

grant select, insert, update, delete on table public.teacher_payment_settings to authenticated;

alter table public.teacher_salary_ledgers
  add column if not exists payment_start_date date;

update public.teacher_salary_ledgers ledger
set payment_start_date = case
  when settings.payment_system = 'postpaid'
    then (ledger.ledger_month + interval '1 month')::date
  else ledger.ledger_month
end
from public.teacher_payment_settings settings
where settings.tenant_id = ledger.tenant_id
  and ledger.payment_start_date is null;

alter table public.teacher_salary_ledgers
  alter column payment_start_date set not null;

create index if not exists teacher_salary_ledgers_tenant_payment_start_idx
  on public.teacher_salary_ledgers(tenant_id, payment_start_date);
