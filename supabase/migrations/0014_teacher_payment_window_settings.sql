-- Teacher salary payment start and grace-window settings.
-- Run this after 0013_default_academic_options.sql.

alter table public.teacher_payment_settings
  add column if not exists payment_start_day smallint not null default 1
    check (payment_start_day between 1 and 15),
  add column if not exists grace_period_days smallint not null default 7
    check (grace_period_days between 0 and 15);

alter table public.teacher_salary_ledgers
  add column if not exists grace_end_date date;

update public.teacher_salary_ledgers ledger
set grace_end_date = (
  ledger.payment_start_date
  + coalesce(settings.grace_period_days, 7) * interval '1 day'
)::date
from public.teacher_payment_settings settings
where settings.tenant_id = ledger.tenant_id
  and ledger.grace_end_date is null;

alter table public.teacher_salary_ledgers
  alter column grace_end_date set not null;

alter table public.teacher_salary_ledgers
  drop constraint if exists teacher_salary_ledgers_payment_window_check,
  add constraint teacher_salary_ledgers_payment_window_check
    check (payment_start_date <= grace_end_date);

create index if not exists teacher_salary_ledgers_tenant_grace_end_idx
  on public.teacher_salary_ledgers(tenant_id, grace_end_date);
