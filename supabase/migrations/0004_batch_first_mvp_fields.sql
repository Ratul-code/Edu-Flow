-- Edu Flow batch-first MVP fields.
-- Run this after 0003_teacher_salary_ledgers.sql.

alter table public.students
  add column if not exists medium text,
  add column if not exists group_name text,
  add column if not exists tags text[] not null default '{}';

alter table public.batches
  add column if not exists medium text,
  add column if not exists group_name text;

alter table public.student_batches
  add column if not exists fee_override numeric(12, 2)
    check (fee_override is null or fee_override >= 0);

update public.student_batches
set fee_override = custom_fee_override
where fee_override is null
  and custom_fee_override is not null;

create index if not exists students_tenant_medium_idx
  on public.students(tenant_id, medium);

create index if not exists students_tenant_group_name_idx
  on public.students(tenant_id, group_name);

create index if not exists students_tenant_tags_idx
  on public.students using gin(tags);

create index if not exists batches_tenant_medium_idx
  on public.batches(tenant_id, medium);

create index if not exists batches_tenant_group_name_idx
  on public.batches(tenant_id, group_name);
