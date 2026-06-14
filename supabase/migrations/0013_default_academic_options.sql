-- Default tenant academic options.

grant select, insert, update, delete on table public.class_levels to authenticated;

insert into public.class_levels (tenant_id, name)
select tenant.id, defaults.name
from public.tenants tenant
cross join (
  values
    ('Class 4'),
    ('Class 5'),
    ('Class 6'),
    ('Class 7'),
    ('Class 8'),
    ('Class 9'),
    ('Class 10'),
    ('Class 11'),
    ('Class 12')
) as defaults(name)
on conflict (tenant_id, name) do nothing;

create table if not exists public.medium_options (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

drop trigger if exists set_medium_options_updated_at
  on public.medium_options;
create trigger set_medium_options_updated_at
before update on public.medium_options
for each row execute function public.set_updated_at();

alter table public.medium_options enable row level security;

drop policy if exists "Admins can manage medium options in their tenant"
  on public.medium_options;
create policy "Admins can manage medium options in their tenant"
on public.medium_options
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

grant select, insert, update, delete on table public.medium_options to authenticated;

insert into public.medium_options (tenant_id, name, sort_order)
select tenant.id, defaults.name, defaults.sort_order
from public.tenants tenant
cross join (
  values
    ('Bangla Medium', 10),
    ('English Version', 20),
    ('English Medium', 30)
) as defaults(name, sort_order)
on conflict (tenant_id, name) do nothing;

create index if not exists medium_options_tenant_sort_idx
  on public.medium_options(tenant_id, sort_order, name);
