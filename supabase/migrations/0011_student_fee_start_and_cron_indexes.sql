-- Persist student fee start month and add indexes for scheduled ledger creation.
-- Run this after 0010_teacher_payment_settings.sql.

alter table public.students
  add column if not exists fee_start_month date;

update public.students
set fee_start_month = date_trunc('month', admission_date)::date
where fee_start_month is null;

alter table public.students
  alter column fee_start_month set not null,
  alter column fee_start_month set default date_trunc('month', current_date)::date,
  add constraint students_fee_start_month_is_month_start
    check (fee_start_month = date_trunc('month', fee_start_month)::date);

create index if not exists students_tenant_fee_start_status_idx
  on public.students(tenant_id, status, fee_start_month);

create index if not exists teacher_payment_settings_tenant_system_idx
  on public.teacher_payment_settings(tenant_id, payment_system);
