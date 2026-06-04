-- Edu Flow Phase 8: Teacher Salary Ledger
-- Run this after 0002_student_fee_ledgers.sql.

create table if not exists public.teacher_salary_ledgers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  teacher_id uuid not null,
  ledger_month date not null,
  expected_salary numeric(12, 2) not null default 0 check (expected_salary >= 0),
  adjustment_amount numeric(12, 2) not null default 0,
  paid_amount numeric(12, 2) not null default 0 check (paid_amount >= 0),
  due_amount numeric(12, 2) not null default 0 check (due_amount >= 0),
  status text not null default 'unpaid'
    check (status in ('unpaid', 'partial', 'paid', 'waived')),
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, teacher_id, ledger_month),
  foreign key (tenant_id, teacher_id)
    references public.teachers(tenant_id, id)
    on delete cascade,
  check (ledger_month = date_trunc('month', ledger_month)::date)
);

create table if not exists public.teacher_salary_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  ledger_id uuid not null,
  teacher_id uuid not null,
  receipt_number text not null,
  amount numeric(12, 2) not null check (amount > 0),
  method text not null default 'cash'
    check (method in ('cash', 'bkash', 'nagad', 'bank', 'card', 'other')),
  payment_date date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, receipt_number),
  foreign key (tenant_id, ledger_id)
    references public.teacher_salary_ledgers(tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, teacher_id)
    references public.teachers(tenant_id, id)
    on delete cascade
);

create index if not exists teacher_salary_ledgers_tenant_month_idx
  on public.teacher_salary_ledgers(tenant_id, ledger_month);

create index if not exists teacher_salary_ledgers_tenant_status_idx
  on public.teacher_salary_ledgers(tenant_id, status);

create index if not exists teacher_salary_ledgers_tenant_teacher_idx
  on public.teacher_salary_ledgers(tenant_id, teacher_id);

create index if not exists teacher_salary_payments_tenant_ledger_idx
  on public.teacher_salary_payments(tenant_id, ledger_id);

create index if not exists teacher_salary_payments_tenant_teacher_idx
  on public.teacher_salary_payments(tenant_id, teacher_id);

create index if not exists teacher_salary_payments_tenant_payment_date_idx
  on public.teacher_salary_payments(tenant_id, payment_date);

drop trigger if exists set_teacher_salary_ledgers_updated_at
  on public.teacher_salary_ledgers;
create trigger set_teacher_salary_ledgers_updated_at
before update on public.teacher_salary_ledgers
for each row execute function public.set_updated_at();

drop trigger if exists set_teacher_salary_payments_updated_at
  on public.teacher_salary_payments;
create trigger set_teacher_salary_payments_updated_at
before update on public.teacher_salary_payments
for each row execute function public.set_updated_at();

alter table public.teacher_salary_ledgers enable row level security;
alter table public.teacher_salary_payments enable row level security;

drop policy if exists "Admins can manage teacher salary ledgers in their tenant"
  on public.teacher_salary_ledgers;
create policy "Admins can manage teacher salary ledgers in their tenant"
on public.teacher_salary_ledgers
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage teacher salary payments in their tenant"
  on public.teacher_salary_payments;
create policy "Admins can manage teacher salary payments in their tenant"
on public.teacher_salary_payments
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));
