-- Edu Flow: Dynamic Class Levels Management.
-- Run this in the Supabase SQL editor or CLI.

create table if not exists public.class_levels (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

alter table public.class_levels enable row level security;

drop policy if exists "Admins can manage class levels in their tenant" on public.class_levels;
create policy "Admins can manage class levels in their tenant"
on public.class_levels
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));
