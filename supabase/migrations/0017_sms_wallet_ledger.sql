-- Tenant-scoped SMS wallet, recharge, communication messages, templates, settings, and usage tracking.
-- Run this after 0016_required_tenant_profile_fields.sql.

create or replace function public.current_admin_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select au.id
  from public.admin_users au
  where au.auth_user_id = (select auth.uid())
    and au.role = 'admin'
    and au.status = 'active'
  limit 1
$$;

grant execute on function public.current_admin_user_id() to authenticated;

create table if not exists public.tenant_sms_wallets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  available_credits integer not null default 0 check (available_credits >= 0),
  reserved_credits integer not null default 0 check (reserved_credits >= 0),
  total_purchased_credits integer not null default 0 check (total_purchased_credits >= 0),
  total_used_credits integer not null default 0 check (total_used_credits >= 0),
  total_refunded_credits integer not null default 0 check (total_refunded_credits >= 0),
  low_balance_threshold integer not null default 100 check (low_balance_threshold >= 0),
  sms_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create table if not exists public.sms_credit_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credits integer not null check (credits > 0),
  price numeric(12, 2) not null check (price >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name),
  unique (credits, price)
);

create table if not exists public.sms_recharge_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  requested_by uuid not null,
  package_id uuid references public.sms_credit_packages(id) on delete set null,
  package_name text not null,
  requested_credits integer not null check (requested_credits > 0),
  payable_amount numeric(12, 2) not null check (payable_amount >= 0),
  payment_method text not null check (payment_method in ('bkash', 'nagad', 'bank', 'cash', 'other')),
  transaction_id text,
  payment_note text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid,
  approved_at timestamptz,
  rejected_by uuid,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, requested_by)
    references public.admin_users(tenant_id, id)
    on delete restrict,
  foreign key (tenant_id, approved_by)
    references public.admin_users(tenant_id, id),
  foreign key (tenant_id, rejected_by)
    references public.admin_users(tenant_id, id),
  check (
    (status = 'approved' and approved_by is not null and approved_at is not null)
    or status <> 'approved'
  ),
  check (
    (status = 'rejected' and rejected_by is not null and rejected_at is not null)
    or status <> 'rejected'
  )
);

create table if not exists public.sms_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  category text not null
    check (category in (
      'payment_confirmation',
      'payment_reminder',
      'grace_period',
      'overdue_warning',
      'exam_notice',
      'holiday_notice',
      'general_notice'
    )),
  channel text not null default 'sms' check (channel = 'sms'),
  message_body text not null,
  variables jsonb not null default '[]'::jsonb,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, name),
  foreign key (tenant_id, created_by)
    references public.admin_users(tenant_id, id),
  check (jsonb_typeof(variables) = 'array')
);

create table if not exists public.tenant_sms_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  default_recipient_type text not null default 'guardian'
    check (default_recipient_type in ('student', 'guardian', 'both')),
  sms_signature text,
  max_bulk_segments integer not null default 3 check (max_bulk_segments > 0),
  max_automated_segments integer not null default 3 check (max_automated_segments > 0),
  max_single_sms_segments integer not null default 3 check (max_single_sms_segments > 0),
  max_bulk_recipients integer not null default 500 check (max_bulk_recipients > 0),
  payment_confirmation_enabled boolean not null default false,
  payment_confirmation_recipient text not null default 'guardian'
    check (payment_confirmation_recipient in ('student', 'guardian', 'both')),
  payment_confirmation_template_id uuid,
  payment_reminder_enabled boolean not null default false,
  payment_reminder_days_before_due integer not null default 3
    check (payment_reminder_days_before_due >= 0),
  payment_reminder_recipient text not null default 'guardian'
    check (payment_reminder_recipient in ('student', 'guardian', 'both')),
  payment_reminder_template_id uuid,
  grace_period_enabled boolean not null default false,
  grace_period_days_after_due integer not null default 1
    check (grace_period_days_after_due >= 0),
  grace_period_recipient text not null default 'guardian'
    check (grace_period_recipient in ('student', 'guardian', 'both')),
  grace_period_template_id uuid,
  overdue_warning_enabled boolean not null default false,
  overdue_warning_days_before_overdue integer not null default 1
    check (overdue_warning_days_before_overdue >= 0),
  overdue_warning_recipient text not null default 'guardian'
    check (overdue_warning_recipient in ('student', 'guardian', 'both')),
  overdue_warning_template_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id),
  foreign key (tenant_id, payment_confirmation_template_id)
    references public.sms_templates(tenant_id, id),
  foreign key (tenant_id, payment_reminder_template_id)
    references public.sms_templates(tenant_id, id),
  foreign key (tenant_id, grace_period_template_id)
    references public.sms_templates(tenant_id, id),
  foreign key (tenant_id, overdue_warning_template_id)
    references public.sms_templates(tenant_id, id)
);

create table if not exists public.communication_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sent_by uuid,
  channel text not null default 'sms'
    check (channel in ('sms', 'whatsapp', 'email', 'push', 'in_app')),
  source text not null
    check (source in (
      'manual',
      'bulk',
      'payment_confirmation',
      'payment_reminder',
      'grace_period',
      'overdue_warning',
      'system'
    )),
  message_body text not null,
  message_preview text,
  subject text,
  sms_type text check (sms_type in ('gsm', 'unicode')),
  character_count integer check (character_count is null or character_count >= 0),
  segments_per_recipient integer check (
    segments_per_recipient is null or segments_per_recipient > 0
  ),
  recipient_count integer not null default 0 check (recipient_count >= 0),
  delivered_count integer not null default 0 check (delivered_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  credits_required integer not null default 0 check (credits_required >= 0),
  credits_reserved integer not null default 0 check (credits_reserved >= 0),
  credits_used integer not null default 0 check (credits_used >= 0),
  credits_refunded integer not null default 0 check (credits_refunded >= 0),
  recipient_summary text,
  channel_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in (
      'draft',
      'queued',
      'sending',
      'completed',
      'partial_failed',
      'failed',
      'cancelled'
    )),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, sent_by)
    references public.admin_users(tenant_id, id),
  check (jsonb_typeof(channel_metadata) = 'object'),
  check (credits_reserved >= credits_used + credits_refunded)
);

create table if not exists public.communication_recipients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  communication_message_id uuid not null,
  student_id uuid,
  recipient_type text not null
    check (recipient_type in ('student', 'guardian', 'custom', 'system')),
  recipient_name text not null,
  destination text not null,
  normalized_destination text,
  channel text not null default 'sms'
    check (channel in ('sms', 'whatsapp', 'email', 'push', 'in_app')),
  final_message_body text not null,
  subject text,
  sms_type text check (sms_type in ('gsm', 'unicode')),
  segments integer check (segments is null or segments > 0),
  credits_used integer not null default 0 check (credits_used >= 0),
  status text not null default 'pending'
    check (status in (
      'pending',
      'queued',
      'sent',
      'delivered',
      'failed',
      'skipped',
      'invalid_number',
      'duplicate_removed'
    )),
  provider_message_id text,
  provider_response jsonb not null default '{}'::jsonb,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, communication_message_id)
    references public.communication_messages(tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, student_id)
    references public.students(tenant_id, id),
  check (jsonb_typeof(provider_response) = 'object')
);

create table if not exists public.sms_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  admin_user_id uuid,
  transaction_type text not null
    check (transaction_type in (
      'purchase',
      'manual_adjustment',
      'campaign_reserved',
      'campaign_used',
      'campaign_refund',
      'automation_used',
      'failed_refund'
    )),
  credit_amount integer not null check (credit_amount <> 0),
  balance_before integer not null check (balance_before >= 0),
  balance_after integer not null check (balance_after >= 0),
  reference_type text,
  reference_id uuid,
  description text,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, admin_user_id)
    references public.admin_users(tenant_id, id)
);

create index if not exists tenant_sms_wallets_tenant_idx
  on public.tenant_sms_wallets(tenant_id);
create index if not exists sms_credit_transactions_tenant_created_idx
  on public.sms_credit_transactions(tenant_id, created_at desc);
create index if not exists sms_recharge_requests_tenant_status_idx
  on public.sms_recharge_requests(tenant_id, status);
create index if not exists sms_templates_tenant_category_idx
  on public.sms_templates(tenant_id, category);
create index if not exists communication_messages_tenant_status_idx
  on public.communication_messages(tenant_id, status);
create index if not exists communication_messages_tenant_channel_created_idx
  on public.communication_messages(tenant_id, channel, created_at desc);
create index if not exists communication_messages_tenant_sent_idx
  on public.communication_messages(tenant_id, sent_at desc);
create index if not exists communication_recipients_tenant_message_idx
  on public.communication_recipients(tenant_id, communication_message_id);
create index if not exists communication_recipients_tenant_destination_idx
  on public.communication_recipients(
    tenant_id,
    communication_message_id,
    normalized_destination
  )
  where normalized_destination is not null;

drop trigger if exists set_tenant_sms_wallets_updated_at on public.tenant_sms_wallets;
create trigger set_tenant_sms_wallets_updated_at
before update on public.tenant_sms_wallets
for each row execute function public.set_updated_at();

drop trigger if exists set_sms_credit_packages_updated_at on public.sms_credit_packages;
create trigger set_sms_credit_packages_updated_at
before update on public.sms_credit_packages
for each row execute function public.set_updated_at();

drop trigger if exists set_sms_recharge_requests_updated_at on public.sms_recharge_requests;
create trigger set_sms_recharge_requests_updated_at
before update on public.sms_recharge_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_sms_templates_updated_at on public.sms_templates;
create trigger set_sms_templates_updated_at
before update on public.sms_templates
for each row execute function public.set_updated_at();

drop trigger if exists set_tenant_sms_settings_updated_at on public.tenant_sms_settings;
create trigger set_tenant_sms_settings_updated_at
before update on public.tenant_sms_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_communication_messages_updated_at on public.communication_messages;
create trigger set_communication_messages_updated_at
before update on public.communication_messages
for each row execute function public.set_updated_at();

drop trigger if exists set_communication_recipients_updated_at on public.communication_recipients;
create trigger set_communication_recipients_updated_at
before update on public.communication_recipients
for each row execute function public.set_updated_at();

insert into public.tenant_sms_wallets (tenant_id)
select id
from public.tenants
on conflict (tenant_id) do nothing;

insert into public.sms_credit_packages (name, credits, price, sort_order)
values
  ('500 SMS Credits', 500, 250, 10),
  ('1000 SMS Credits', 1000, 500, 20),
  ('2000 SMS Credits', 2000, 1000, 30),
  ('5000 SMS Credits', 5000, 2500, 40)
on conflict (credits, price) do nothing;

insert into public.sms_templates (
  tenant_id,
  name,
  category,
  message_body,
  variables,
  is_default
)
select
  tenants.id,
  defaults.name,
  defaults.category,
  defaults.message_body,
  defaults.variables::jsonb,
  true
from public.tenants
cross join (
  values
    (
      'Payment Confirmation',
      'payment_confirmation',
      'Dear {{guardian_name}}, payment of {{amount}} for {{student_name}} has been received by {{coaching_name}}.',
      '["guardian_name","amount","student_name","coaching_name"]'
    ),
    (
      'Payment Reminder',
      'payment_reminder',
      'Dear {{guardian_name}}, {{student_name}} has a payment due of {{amount}} for {{month}}. Please pay by {{due_date}}.',
      '["guardian_name","student_name","amount","month","due_date"]'
    ),
    (
      'Grace Period Notice',
      'grace_period',
      'Dear {{guardian_name}}, {{student_name}} is in the grace period for {{month}} payment of {{amount}}.',
      '["guardian_name","student_name","month","amount"]'
    ),
    (
      'Overdue Warning',
      'overdue_warning',
      'Dear {{guardian_name}}, {{student_name}} has an overdue payment of {{amount}} for {{month}}.',
      '["guardian_name","student_name","amount","month"]'
    )
) as defaults(name, category, message_body, variables)
on conflict (tenant_id, name) do nothing;

insert into public.tenant_sms_settings (
  tenant_id,
  payment_confirmation_template_id,
  payment_reminder_template_id,
  grace_period_template_id,
  overdue_warning_template_id
)
select
  tenants.id,
  confirmation.id,
  reminder.id,
  grace.id,
  overdue.id
from public.tenants tenants
left join public.sms_templates confirmation
  on confirmation.tenant_id = tenants.id
  and confirmation.category = 'payment_confirmation'
  and confirmation.is_default
left join public.sms_templates reminder
  on reminder.tenant_id = tenants.id
  and reminder.category = 'payment_reminder'
  and reminder.is_default
left join public.sms_templates grace
  on grace.tenant_id = tenants.id
  and grace.category = 'grace_period'
  and grace.is_default
left join public.sms_templates overdue
  on overdue.tenant_id = tenants.id
  and overdue.category = 'overdue_warning'
  and overdue.is_default
on conflict (tenant_id) do nothing;

create or replace function public.initialize_sms_resources_for_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  confirmation_template_id uuid;
  reminder_template_id uuid;
  grace_template_id uuid;
  overdue_template_id uuid;
begin
  insert into public.tenant_sms_wallets (tenant_id)
  values (new.id)
  on conflict (tenant_id) do nothing;

  insert into public.sms_templates (
    tenant_id,
    name,
    category,
    message_body,
    variables,
    is_default
  )
  values
    (
      new.id,
      'Payment Confirmation',
      'payment_confirmation',
      'Dear {{guardian_name}}, payment of {{amount}} for {{student_name}} has been received by {{coaching_name}}.',
      '["guardian_name","amount","student_name","coaching_name"]'::jsonb,
      true
    ),
    (
      new.id,
      'Payment Reminder',
      'payment_reminder',
      'Dear {{guardian_name}}, {{student_name}} has a payment due of {{amount}} for {{month}}. Please pay by {{due_date}}.',
      '["guardian_name","student_name","amount","month","due_date"]'::jsonb,
      true
    ),
    (
      new.id,
      'Grace Period Notice',
      'grace_period',
      'Dear {{guardian_name}}, {{student_name}} is in the grace period for {{month}} payment of {{amount}}.',
      '["guardian_name","student_name","month","amount"]'::jsonb,
      true
    ),
    (
      new.id,
      'Overdue Warning',
      'overdue_warning',
      'Dear {{guardian_name}}, {{student_name}} has an overdue payment of {{amount}} for {{month}}.',
      '["guardian_name","student_name","amount","month"]'::jsonb,
      true
    )
  on conflict (tenant_id, name) do nothing;

  select id into confirmation_template_id
  from public.sms_templates
  where tenant_id = new.id
    and category = 'payment_confirmation'
    and is_default
  limit 1;

  select id into reminder_template_id
  from public.sms_templates
  where tenant_id = new.id
    and category = 'payment_reminder'
    and is_default
  limit 1;

  select id into grace_template_id
  from public.sms_templates
  where tenant_id = new.id
    and category = 'grace_period'
    and is_default
  limit 1;

  select id into overdue_template_id
  from public.sms_templates
  where tenant_id = new.id
    and category = 'overdue_warning'
    and is_default
  limit 1;

  insert into public.tenant_sms_settings (
    tenant_id,
    payment_confirmation_template_id,
    payment_reminder_template_id,
    grace_period_template_id,
    overdue_warning_template_id
  )
  values (
    new.id,
    confirmation_template_id,
    reminder_template_id,
    grace_template_id,
    overdue_template_id
  )
  on conflict (tenant_id) do nothing;

  return new;
end;
$$;

drop trigger if exists initialize_sms_resources_for_tenant on public.tenants;
create trigger initialize_sms_resources_for_tenant
after insert on public.tenants
for each row execute function public.initialize_sms_resources_for_tenant();

alter table public.tenant_sms_wallets enable row level security;
alter table public.sms_credit_transactions enable row level security;
alter table public.sms_recharge_requests enable row level security;
alter table public.sms_templates enable row level security;
alter table public.tenant_sms_settings enable row level security;
alter table public.communication_messages enable row level security;
alter table public.communication_recipients enable row level security;
alter table public.sms_credit_packages enable row level security;

drop policy if exists "Admins can read their tenant sms wallets" on public.tenant_sms_wallets;
create policy "Admins can read their tenant sms wallets"
on public.tenant_sms_wallets
for select
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can read sms credit packages" on public.sms_credit_packages;
create policy "Admins can read sms credit packages"
on public.sms_credit_packages
for select
to authenticated
using (true);

drop policy if exists "Admins can manage tenant sms recharge requests" on public.sms_recharge_requests;
create policy "Admins can manage tenant sms recharge requests"
on public.sms_recharge_requests
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage tenant sms templates" on public.sms_templates;
create policy "Admins can manage tenant sms templates"
on public.sms_templates
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage tenant sms settings" on public.tenant_sms_settings;
create policy "Admins can manage tenant sms settings"
on public.tenant_sms_settings
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage tenant communication messages" on public.communication_messages;
create policy "Admins can manage tenant communication messages"
on public.communication_messages
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can manage tenant communication recipients" on public.communication_recipients;
create policy "Admins can manage tenant communication recipients"
on public.communication_recipients
for all
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()))
with check (tenant_id = (select public.current_admin_tenant_id()));

drop policy if exists "Admins can read tenant sms credit transactions" on public.sms_credit_transactions;
create policy "Admins can read tenant sms credit transactions"
on public.sms_credit_transactions
for select
to authenticated
using (tenant_id = (select public.current_admin_tenant_id()));

grant select on table public.tenant_sms_wallets to authenticated;
grant select on table public.sms_credit_packages to authenticated;
grant select, insert, update, delete on table public.sms_recharge_requests to authenticated;
grant select, insert, update, delete on table public.sms_templates to authenticated;
grant select, insert, update, delete on table public.tenant_sms_settings to authenticated;
grant select, insert, update, delete on table public.communication_messages to authenticated;
grant select, insert, update, delete on table public.communication_recipients to authenticated;
grant select on table public.sms_credit_transactions to authenticated;

create or replace function public.sms_is_gsm(message_body text)
returns boolean
language sql
immutable
as $$
  select coalesce(message_body, '') ~ '^[\x00-\x7F]*$'
$$;

create or replace function public.sms_segment_limit(message_body text)
returns integer
language sql
immutable
as $$
  select case when public.sms_is_gsm(message_body) then 160 else 67 end
$$;

create or replace function public.sms_message_type(message_body text)
returns text
language sql
immutable
as $$
  select case when public.sms_is_gsm(message_body) then 'gsm' else 'unicode' end
$$;

create or replace function public.sms_segments(message_body text)
returns integer
language sql
immutable
as $$
  select greatest(
    ceil(
      greatest(char_length(coalesce(message_body, '')), 1)::numeric
      / public.sms_segment_limit(message_body)
    )::integer,
    1
  )
$$;

create or replace function public.sms_required_credits(
  message_body text,
  recipient_count integer
)
returns integer
language sql
immutable
as $$
  select public.sms_segments(message_body) * greatest(coalesce(recipient_count, 0), 0)
$$;

create or replace function public.normalize_bd_phone(phone_number text)
returns text
language plpgsql
immutable
as $$
declare
  digits text;
begin
  digits := regexp_replace(coalesce(phone_number, ''), '[^0-9]+', '', 'g');

  if digits ~ '^8801[3-9][0-9]{8}$' then
    return digits;
  end if;

  if digits ~ '^01[3-9][0-9]{8}$' then
    return '88' || digits;
  end if;

  if digits ~ '^1[3-9][0-9]{8}$' then
    return '880' || digits;
  end if;

  return null;
end;
$$;

create or replace function public.insert_sms_credit_transaction(
  p_tenant_id uuid,
  p_admin_user_id uuid,
  p_transaction_type text,
  p_credit_amount integer,
  p_balance_before integer,
  p_balance_after integer,
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  transaction_id uuid;
begin
  if p_tenant_id <> (select public.current_admin_tenant_id()) then
    raise exception 'SMS credit transaction tenant mismatch.';
  end if;

  if p_admin_user_id is not null and not exists (
    select 1
    from public.admin_users
    where tenant_id = p_tenant_id
      and id = p_admin_user_id
  ) then
    raise exception 'Admin user does not belong to this tenant.';
  end if;

  insert into public.sms_credit_transactions (
    tenant_id,
    admin_user_id,
    transaction_type,
    credit_amount,
    balance_before,
    balance_after,
    reference_type,
    reference_id,
    description
  )
  values (
    p_tenant_id,
    p_admin_user_id,
    p_transaction_type,
    p_credit_amount,
    p_balance_before,
    p_balance_after,
    p_reference_type,
    p_reference_id,
    p_description
  )
  returning id into transaction_id;

  return transaction_id;
end;
$$;

create or replace function public.sms_wallet_purchase(
  p_tenant_id uuid,
  p_admin_user_id uuid,
  p_credits integer,
  p_reference_type text default 'recharge_request',
  p_reference_id uuid default null,
  p_description text default null
)
returns public.tenant_sms_wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  wallet public.tenant_sms_wallets;
  before_balance integer;
begin
  if p_tenant_id <> (select public.current_admin_tenant_id()) then
    raise exception 'SMS wallet tenant mismatch.';
  end if;

  if p_credits <= 0 then
    raise exception 'Purchased credits must be greater than zero.';
  end if;

  insert into public.tenant_sms_wallets (tenant_id)
  values (p_tenant_id)
  on conflict (tenant_id) do nothing;

  select * into wallet
  from public.tenant_sms_wallets
  where tenant_id = p_tenant_id
  for update;

  before_balance := wallet.available_credits;

  update public.tenant_sms_wallets
  set
    available_credits = available_credits + p_credits,
    total_purchased_credits = total_purchased_credits + p_credits
  where id = wallet.id
  returning * into wallet;

  perform public.insert_sms_credit_transaction(
    p_tenant_id,
    p_admin_user_id,
    'purchase',
    p_credits,
    before_balance,
    wallet.available_credits,
    p_reference_type,
    p_reference_id,
    coalesce(p_description, 'SMS credit purchase')
  );

  return wallet;
end;
$$;

create or replace function public.sms_wallet_manual_adjustment(
  p_tenant_id uuid,
  p_admin_user_id uuid,
  p_credit_delta integer,
  p_reference_type text default 'manual_adjustment',
  p_reference_id uuid default null,
  p_description text default null
)
returns public.tenant_sms_wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  wallet public.tenant_sms_wallets;
  before_balance integer;
begin
  if p_tenant_id <> (select public.current_admin_tenant_id()) then
    raise exception 'SMS wallet tenant mismatch.';
  end if;

  if p_credit_delta = 0 then
    raise exception 'Manual adjustment cannot be zero.';
  end if;

  insert into public.tenant_sms_wallets (tenant_id)
  values (p_tenant_id)
  on conflict (tenant_id) do nothing;

  select * into wallet
  from public.tenant_sms_wallets
  where tenant_id = p_tenant_id
  for update;

  if wallet.available_credits + p_credit_delta < 0 then
    raise exception 'SMS available credits cannot go below zero.';
  end if;

  before_balance := wallet.available_credits;

  update public.tenant_sms_wallets
  set available_credits = available_credits + p_credit_delta
  where id = wallet.id
  returning * into wallet;

  perform public.insert_sms_credit_transaction(
    p_tenant_id,
    p_admin_user_id,
    'manual_adjustment',
    p_credit_delta,
    before_balance,
    wallet.available_credits,
    p_reference_type,
    p_reference_id,
    coalesce(p_description, 'SMS credit manual adjustment')
  );

  return wallet;
end;
$$;

drop function if exists public.sms_wallet_reserve_campaign(
  uuid,
  uuid,
  uuid,
  integer,
  text
);

create or replace function public.sms_wallet_reserve_communication_message(
  p_tenant_id uuid,
  p_admin_user_id uuid,
  p_communication_message_id uuid,
  p_credits integer,
  p_description text default null
)
returns public.tenant_sms_wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  wallet public.tenant_sms_wallets;
  before_balance integer;
  communication_message_exists boolean;
begin
  if p_tenant_id <> (select public.current_admin_tenant_id()) then
    raise exception 'SMS wallet tenant mismatch.';
  end if;

  if p_credits <= 0 then
    raise exception 'Reserved credits must be greater than zero.';
  end if;

  select * into wallet
  from public.tenant_sms_wallets
  where tenant_id = p_tenant_id
  for update;

  if not found then
    raise exception 'SMS wallet not found for tenant.';
  end if;

  if not wallet.sms_enabled then
    raise exception 'SMS is disabled for this tenant.';
  end if;

  if wallet.available_credits < p_credits then
    raise exception 'Insufficient SMS credits.';
  end if;

  select exists (
    select 1
    from public.communication_messages
    where tenant_id = p_tenant_id
      and id = p_communication_message_id
  ) into communication_message_exists;

  if not communication_message_exists then
    raise exception 'Communication message not found for tenant.';
  end if;

  before_balance := wallet.available_credits;

  update public.tenant_sms_wallets
  set
    available_credits = available_credits - p_credits,
    reserved_credits = reserved_credits + p_credits
  where id = wallet.id
  returning * into wallet;

  update public.communication_messages
  set
    credits_reserved = credits_reserved + p_credits,
    status = case when status = 'draft' then 'queued' else status end
  where tenant_id = p_tenant_id
    and id = p_communication_message_id;

  perform public.insert_sms_credit_transaction(
    p_tenant_id,
    p_admin_user_id,
    'campaign_reserved',
    -p_credits,
    before_balance,
    wallet.available_credits,
    'communication_message',
    p_communication_message_id,
    coalesce(p_description, 'Communication message credits reserved')
  );

  return wallet;
end;
$$;

drop function if exists public.sms_wallet_use_reserved(
  uuid,
  uuid,
  uuid,
  integer,
  text,
  text,
  uuid,
  text
);

create or replace function public.sms_wallet_use_reserved(
  p_tenant_id uuid,
  p_admin_user_id uuid,
  p_communication_message_id uuid,
  p_credits integer,
  p_transaction_type text default 'campaign_used',
  p_reference_type text default 'communication_message',
  p_reference_id uuid default null,
  p_description text default null
)
returns public.tenant_sms_wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  wallet public.tenant_sms_wallets;
begin
  if p_tenant_id <> (select public.current_admin_tenant_id()) then
    raise exception 'SMS wallet tenant mismatch.';
  end if;

  if p_credits <= 0 then
    raise exception 'Used credits must be greater than zero.';
  end if;

  if p_transaction_type not in ('campaign_used', 'automation_used') then
    raise exception 'Invalid SMS usage transaction type.';
  end if;

  select * into wallet
  from public.tenant_sms_wallets
  where tenant_id = p_tenant_id
  for update;

  if not found then
    raise exception 'SMS wallet not found for tenant.';
  end if;

  if wallet.reserved_credits < p_credits then
    raise exception 'Insufficient reserved SMS credits.';
  end if;

  update public.tenant_sms_wallets
  set
    reserved_credits = reserved_credits - p_credits,
    total_used_credits = total_used_credits + p_credits
  where id = wallet.id
  returning * into wallet;

  if p_communication_message_id is not null then
    update public.communication_messages
    set credits_used = credits_used + p_credits
    where tenant_id = p_tenant_id
      and id = p_communication_message_id;
  end if;

  perform public.insert_sms_credit_transaction(
    p_tenant_id,
    p_admin_user_id,
    p_transaction_type,
    -p_credits,
    wallet.available_credits,
    wallet.available_credits,
    p_reference_type,
    coalesce(p_reference_id, p_communication_message_id),
    coalesce(p_description, 'SMS credits used')
  );

  return wallet;
end;
$$;

drop function if exists public.sms_wallet_refund_reserved(
  uuid,
  uuid,
  uuid,
  integer,
  text,
  text,
  uuid,
  text
);

create or replace function public.sms_wallet_refund_reserved(
  p_tenant_id uuid,
  p_admin_user_id uuid,
  p_communication_message_id uuid,
  p_credits integer,
  p_transaction_type text default 'campaign_refund',
  p_reference_type text default 'communication_message',
  p_reference_id uuid default null,
  p_description text default null
)
returns public.tenant_sms_wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  wallet public.tenant_sms_wallets;
  before_balance integer;
begin
  if p_tenant_id <> (select public.current_admin_tenant_id()) then
    raise exception 'SMS wallet tenant mismatch.';
  end if;

  if p_credits <= 0 then
    raise exception 'Refunded credits must be greater than zero.';
  end if;

  if p_transaction_type not in ('campaign_refund', 'failed_refund') then
    raise exception 'Invalid SMS refund transaction type.';
  end if;

  select * into wallet
  from public.tenant_sms_wallets
  where tenant_id = p_tenant_id
  for update;

  if not found then
    raise exception 'SMS wallet not found for tenant.';
  end if;

  if wallet.reserved_credits < p_credits then
    raise exception 'Insufficient reserved SMS credits to refund.';
  end if;

  before_balance := wallet.available_credits;

  update public.tenant_sms_wallets
  set
    reserved_credits = reserved_credits - p_credits,
    available_credits = available_credits + p_credits,
    total_refunded_credits = total_refunded_credits + p_credits
  where id = wallet.id
  returning * into wallet;

  if p_communication_message_id is not null then
    update public.communication_messages
    set credits_refunded = credits_refunded + p_credits
    where tenant_id = p_tenant_id
      and id = p_communication_message_id;
  end if;

  perform public.insert_sms_credit_transaction(
    p_tenant_id,
    p_admin_user_id,
    p_transaction_type,
    p_credits,
    before_balance,
    wallet.available_credits,
    p_reference_type,
    coalesce(p_reference_id, p_communication_message_id),
    coalesce(p_description, 'SMS reserved credits refunded')
  );

  return wallet;
end;
$$;

create or replace function public.approve_sms_recharge_request(
  p_request_id uuid,
  p_approved_by uuid
)
returns public.sms_recharge_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  recharge public.sms_recharge_requests;
begin
  select * into recharge
  from public.sms_recharge_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'SMS recharge request not found.';
  end if;

  if recharge.tenant_id <> (select public.current_admin_tenant_id()) then
    raise exception 'SMS recharge tenant mismatch.';
  end if;

  if recharge.status <> 'pending' then
    raise exception 'Only pending SMS recharge requests can be approved.';
  end if;

  update public.sms_recharge_requests
  set
    status = 'approved',
    approved_by = p_approved_by,
    approved_at = now(),
    rejected_by = null,
    rejected_at = null,
    rejection_reason = null
  where id = p_request_id
  returning * into recharge;

  perform public.sms_wallet_purchase(
    recharge.tenant_id,
    p_approved_by,
    recharge.requested_credits,
    'recharge_request',
    recharge.id,
    'SMS recharge approved'
  );

  return recharge;
end;
$$;

create or replace function public.reject_sms_recharge_request(
  p_request_id uuid,
  p_rejected_by uuid,
  p_rejection_reason text
)
returns public.sms_recharge_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  recharge public.sms_recharge_requests;
begin
  select * into recharge
  from public.sms_recharge_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'SMS recharge request not found.';
  end if;

  if recharge.tenant_id <> (select public.current_admin_tenant_id()) then
    raise exception 'SMS recharge tenant mismatch.';
  end if;

  if recharge.status <> 'pending' then
    raise exception 'Only pending SMS recharge requests can be rejected.';
  end if;

  if not exists (
    select 1
    from public.admin_users
    where tenant_id = recharge.tenant_id
      and id = p_rejected_by
  ) then
    raise exception 'Rejecting admin does not belong to this tenant.';
  end if;

  update public.sms_recharge_requests
  set
    status = 'rejected',
    rejected_by = p_rejected_by,
    rejected_at = now(),
    rejection_reason = nullif(trim(coalesce(p_rejection_reason, '')), ''),
    approved_by = null,
    approved_at = null
  where id = p_request_id
  returning * into recharge;

  return recharge;
end;
$$;

grant execute on function public.sms_segments(text) to authenticated;
grant execute on function public.sms_is_gsm(text) to authenticated;
grant execute on function public.sms_segment_limit(text) to authenticated;
grant execute on function public.sms_message_type(text) to authenticated;
grant execute on function public.sms_required_credits(text, integer) to authenticated;
grant execute on function public.normalize_bd_phone(text) to authenticated;
grant execute on function public.sms_wallet_purchase(uuid, uuid, integer, text, uuid, text) to authenticated;
grant execute on function public.sms_wallet_manual_adjustment(uuid, uuid, integer, text, uuid, text) to authenticated;
grant execute on function public.sms_wallet_reserve_communication_message(uuid, uuid, uuid, integer, text) to authenticated;
grant execute on function public.sms_wallet_use_reserved(uuid, uuid, uuid, integer, text, text, uuid, text) to authenticated;
grant execute on function public.sms_wallet_refund_reserved(uuid, uuid, uuid, integer, text, text, uuid, text) to authenticated;
grant execute on function public.approve_sms_recharge_request(uuid, uuid) to authenticated;
grant execute on function public.reject_sms_recharge_request(uuid, uuid, text) to authenticated;
