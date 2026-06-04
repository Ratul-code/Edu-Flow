-- Edu Flow Phase 2: Database & Tenant Model
-- Run this in the Supabase SQL editor after creating your Auth admin user.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  contact_phone text,
  subscription_status text not null default 'trial'
    check (subscription_status in ('trial', 'active', 'past_due', 'suspended', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  role text not null default 'admin' check (role in ('admin')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, auth_user_id)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  phone text,
  guardian_name text,
  guardian_phone text,
  school text,
  class_level text,
  admission_date date not null default current_date,
  status text not null default 'active' check (status in ('active', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id)
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  phone text,
  subject_specialty text,
  default_monthly_salary numeric(12, 2) not null default 0 check (default_monthly_salary >= 0),
  status text not null default 'active' check (status in ('active', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id)
);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  subject text,
  class_level text,
  monthly_fee numeric(12, 2) not null default 0 check (monthly_fee >= 0),
  teacher_id uuid,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, teacher_id)
    references public.teachers(tenant_id, id)
);

create table if not exists public.student_batches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  student_id uuid not null,
  batch_id uuid not null,
  custom_fee_override numeric(12, 2) check (custom_fee_override is null or custom_fee_override >= 0),
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  joined_at date not null default current_date,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, student_id, batch_id),
  foreign key (tenant_id, student_id)
    references public.students(tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, batch_id)
    references public.batches(tenant_id, id)
    on delete cascade
);

create table if not exists public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  batch_id uuid not null,
  teacher_id uuid,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  room_name text,
  status text not null default 'active' check (status in ('active', 'cancelled', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time),
  foreign key (tenant_id, batch_id)
    references public.batches(tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, teacher_id)
    references public.teachers(tenant_id, id)
);

create index if not exists admin_users_auth_user_id_idx on public.admin_users(auth_user_id);
create index if not exists admin_users_tenant_id_idx on public.admin_users(tenant_id);
create index if not exists students_tenant_status_idx on public.students(tenant_id, status);
create index if not exists students_tenant_name_idx on public.students(tenant_id, name);
create index if not exists teachers_tenant_status_idx on public.teachers(tenant_id, status);
create index if not exists batches_tenant_status_idx on public.batches(tenant_id, status);
create index if not exists batches_tenant_teacher_idx on public.batches(tenant_id, teacher_id);
create index if not exists student_batches_tenant_student_idx on public.student_batches(tenant_id, student_id);
create index if not exists student_batches_tenant_batch_idx on public.student_batches(tenant_id, batch_id);
create index if not exists class_schedules_tenant_batch_idx on public.class_schedules(tenant_id, batch_id);
create index if not exists class_schedules_tenant_teacher_idx on public.class_schedules(tenant_id, teacher_id);
create index if not exists class_schedules_tenant_weekday_idx on public.class_schedules(tenant_id, weekday);

drop trigger if exists set_tenants_updated_at on public.tenants;
create trigger set_tenants_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_users_updated_at on public.admin_users;
create trigger set_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists set_teachers_updated_at on public.teachers;
create trigger set_teachers_updated_at
before update on public.teachers
for each row execute function public.set_updated_at();

drop trigger if exists set_batches_updated_at on public.batches;
create trigger set_batches_updated_at
before update on public.batches
for each row execute function public.set_updated_at();

drop trigger if exists set_student_batches_updated_at on public.student_batches;
create trigger set_student_batches_updated_at
before update on public.student_batches
for each row execute function public.set_updated_at();

drop trigger if exists set_class_schedules_updated_at on public.class_schedules;
create trigger set_class_schedules_updated_at
before update on public.class_schedules
for each row execute function public.set_updated_at();

create or replace function public.current_admin_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select au.tenant_id
  from public.admin_users au
  where au.auth_user_id = (select auth.uid())
    and au.role = 'admin'
    and au.status = 'active'
  limit 1
$$;

grant execute on function public.current_admin_tenant_id() to authenticated;

alter table public.tenants enable row level security;
alter table public.admin_users enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.batches enable row level security;
alter table public.student_batches enable row level security;
alter table public.class_schedules enable row level security;

drop policy if exists "Admins can read their tenant" on public.tenants;
create policy "Admins can read their tenant"
on public.tenants
for select
to authenticated
using (id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can update their tenant" on public.tenants;
create policy "Admins can update their tenant"
on public.tenants
for update
to authenticated
using (id = (select public.current_admin_tenant_id()))
with check (id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can read admin users in their tenant" on public.admin_users;
create policy "Admins can read admin users in their tenant"
on public.admin_users
for select
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage admin users in their tenant" on public.admin_users;
create policy "Admins can manage admin users in their tenant"
on public.admin_users
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage students in their tenant" on public.students;
create policy "Admins can manage students in their tenant"
on public.students
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage teachers in their tenant" on public.teachers;
create policy "Admins can manage teachers in their tenant"
on public.teachers
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage batches in their tenant" on public.batches;
create policy "Admins can manage batches in their tenant"
on public.batches
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage student batches in their tenant" on public.student_batches;
create policy "Admins can manage student batches in their tenant"
on public.student_batches
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage class schedules in their tenant" on public.class_schedules;
create policy "Admins can manage class schedules in their tenant"
on public.class_schedules
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

-- Seed one test tenant and map one existing Supabase Auth user to it.
-- Change this email to the admin user you created in Authentication > Users.
do $$
declare
  v_admin_email text := 'hoptohopcoding@gmail.com';
  v_auth_user_id uuid;
  v_tenant_id uuid;
begin
  select id
  into v_auth_user_id
  from auth.users
  where email = v_admin_email
  limit 1;

  if v_auth_user_id is null then
    raise notice 'No Supabase Auth user found for %. Create the user first, then rerun this seed block.', v_admin_email;
    return;
  end if;

  select id
  into v_tenant_id
  from public.tenants
  where name = 'Dhaka Coaching Center'
  limit 1;

  if v_tenant_id is null then
    insert into public.tenants (name, address, contact_phone, subscription_status)
    values ('Dhaka Coaching Center', 'Dhaka, Bangladesh', '+8801000000000', 'trial')
    returning id into v_tenant_id;
  end if;

  insert into public.admin_users (tenant_id, auth_user_id, name, role, status)
  values (v_tenant_id, v_auth_user_id, 'Test Admin', 'admin', 'active')
  on conflict (auth_user_id)
  do update set
    tenant_id = excluded.tenant_id,
    name = excluded.name,
    role = excluded.role,
    status = excluded.status,
    updated_at = now();
end $$;
