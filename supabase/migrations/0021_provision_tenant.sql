-- Tenant provisioning, subscription management, and plan-change helpers.
-- Run this after 0020_tenant_subscriptions.sql.
--
-- `provision_tenant` is the single entry point for creating a coaching centre
-- from the signup flow. It is a `security definer` function for two reasons:
--
--   1. RLS. The `admin_users` policy is keyed on
--      `tenant_id = current_admin_tenant_id()`, which is NULL for a brand new
--      user who has no tenant yet. A plain authenticated INSERT would be
--      rejected, so the tenant bootstrap has to run with elevated rights.
--   2. Atomicity. Creating a centre touches the tenant row, the admin link,
--      the subscription, and a set of per-tenant option rows. Doing that as
--      separate statements from the app risks leaving a half-built tenant
--      behind. One function call is one transaction.
--
-- The function is idempotent on `p_auth_user_id`: calling it again for a user
-- that already owns a centre returns the existing tenant instead of creating
-- a second one. That makes the signup form safe to double-submit and makes
-- the onboarding retry path safe.

create or replace function public.provision_tenant(
  p_auth_user_id uuid,
  p_center_name text,
  p_address text,
  p_contact_phone text,
  p_admin_name text,
  p_admin_phone text,
  p_plan_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  existing_tenant_id uuid;
  new_tenant_id uuid;
  new_admin_id uuid;
  selected_plan_id uuid;
  new_subscription_id uuid;
  plan_price numeric(12, 2);
begin
  caller_id := (select auth.uid());

  if caller_id is null then
    raise exception 'You must be signed in to create a coaching centre.';
  end if;

  if p_auth_user_id is distinct from caller_id then
    raise exception 'You can only create a coaching centre for your own account.';
  end if;

  -- Input validation. These values end up on the tenant and admin rows, so
  -- they are trimmed and length-capped here rather than trusting the client.
  if p_center_name is null or trim(p_center_name) = '' then
    raise exception 'Coaching centre name is required.';
  end if;

  if p_address is null or trim(p_address) = '' then
    raise exception 'Coaching centre address is required.';
  end if;

  if p_contact_phone is null or trim(p_contact_phone) = '' then
    raise exception 'Coaching centre contact phone is required.';
  end if;

  if p_admin_name is null or trim(p_admin_name) = '' then
    raise exception 'Your name is required.';
  end if;

  -- Idempotency: an account may only own one centre.
  select au.tenant_id
  into existing_tenant_id
  from public.admin_users au
  where au.auth_user_id = p_auth_user_id
  limit 1;

  if existing_tenant_id is not null then
    return existing_tenant_id;
  end if;

  -- Resolve the requested plan, falling back to the default plan.
  select pd.id, pd.price
  into selected_plan_id, plan_price
  from public.plan_definitions pd
  where pd.code = coalesce(nullif(trim(p_plan_code), ''), 'free')
    and pd.is_active = true
  limit 1;

  if selected_plan_id is null then
    select pd.id, pd.price
    into selected_plan_id, plan_price
    from public.plan_definitions pd
    where pd.is_default = true
      and pd.is_active = true
    limit 1;
  end if;

  if selected_plan_id is null then
    raise exception 'No active plan is available.';
  end if;

  -- 1. The centre itself.
  insert into public.tenants (
    name,
    address,
    contact_phone,
    email,
    subscription_status
  )
  values (
    left(trim(p_center_name), 160),
    left(trim(p_address), 320),
    left(trim(p_contact_phone), 40),
    (
      select email
      from auth.users
      where id = p_auth_user_id
    ),
    'trial'
  )
  returning id into new_tenant_id;

  -- 2. The admin link. `auth.users` cascades on delete, so deleting the auth
  --    account removes the admin row and, through it, the centre.
  insert into public.admin_users (
    tenant_id,
    auth_user_id,
    name,
    phone,
    role,
    status
  )
  values (
    new_tenant_id,
    p_auth_user_id,
    left(trim(p_admin_name), 160),
    nullif(left(trim(coalesce(p_admin_phone, '')), 40), ''),
    'admin',
    'active'
  )
  returning id into new_admin_id;

  -- 3. The subscription. Paid plans start in `pending_payment`: the centre is
  --    provisioned and usable immediately, and the plan is activated once the
  --    payment request is approved. The free plan starts active.
  insert into public.tenant_subscriptions (
    tenant_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  )
  values (
    new_tenant_id,
    selected_plan_id,
    case when plan_price > 0 then 'pending_payment' else 'active' end,
    case when plan_price > 0 then null else current_date end,
    case when plan_price > 0 then null else (current_date + interval '1 month')::date end
  )
  returning id into new_subscription_id;

  -- 4. Per-tenant option rows. These are normally seeded by the migrations
  --    for tenants that existed at migration time, so a tenant created at
  --    runtime needs them created here.
  insert into public.billing_settings (tenant_id, payment_start_day, grace_period_days)
  values (new_tenant_id, 1, 7)
  on conflict (tenant_id) do nothing;

  insert into public.class_levels (tenant_id, name)
  select new_tenant_id, defaults.name
  from (
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

  insert into public.academic_groups (tenant_id, name, sort_order)
  select new_tenant_id, defaults.name, defaults.sort_order
  from (
    values
      ('Science', 10),
      ('Commerce', 20),
      ('Arts', 30)
  ) as defaults(name, sort_order)
  on conflict (tenant_id, name) do nothing;

  insert into public.medium_options (tenant_id, name, sort_order)
  select new_tenant_id, defaults.name, defaults.sort_order
  from (
    values
      ('Bangla Medium', 10),
      ('English Version', 20),
      ('English Medium', 30)
  ) as defaults(name, sort_order)
  on conflict (tenant_id, name) do nothing;

  -- The SMS wallet and default templates are created by the
  -- `initialize_sms_resources_for_tenant` trigger on `tenants`, but that
  -- trigger is created in migration 0017 and may not exist on a partially
  -- migrated database. Seed defensively.
  insert into public.tenant_sms_wallets (tenant_id)
  values (new_tenant_id)
  on conflict (tenant_id) do nothing;

  -- 5. Audit trail.
  insert into public.subscription_events (
    tenant_id,
    event_type,
    to_plan_id,
    amount,
    currency
  )
  values (
    new_tenant_id,
    'subscription_created',
    selected_plan_id,
    plan_price,
    'BDT'
  );

  return new_tenant_id;
end;
$$;

grant execute on function public.provision_tenant(uuid, text, text, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Subscription management helpers used by the billing screen.
-- ---------------------------------------------------------------------------

-- Change a tenant's plan. Paid plans go to `pending_payment` and require an
-- approved payment request; the free plan activates immediately.
create or replace function public.change_tenant_plan(
  p_tenant_id uuid,
  p_plan_code text,
  p_payment_method text default null,
  p_transaction_id text default null,
  p_payment_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_tenant_id uuid;
  caller_admin_id uuid;
  target_plan_id uuid;
  target_price numeric(12, 2);
  previous_plan_id uuid;
  new_subscription_id uuid;
  new_request_id uuid;
  new_status text;
begin
  caller_tenant_id := (select public.current_admin_tenant_id());
  caller_admin_id := (select public.current_admin_user_id());

  if caller_tenant_id is null then
    raise exception 'You are not linked to an active coaching centre.';
  end if;

  if p_tenant_id <> caller_tenant_id then
    raise exception 'Subscription tenant mismatch.';
  end if;

  select pd.id, pd.price
  into target_plan_id, target_price
  from public.plan_definitions pd
  where pd.code = p_plan_code
    and pd.is_active = true
  limit 1;

  if target_plan_id is null then
    raise exception 'Unknown plan.';
  end if;

  select plan_id into previous_plan_id
  from public.tenant_subscriptions
  where tenant_id = p_tenant_id
    and status in ('trialing', 'pending_payment', 'active', 'past_due')
  order by created_at desc
  limit 1;

  -- Close out any subscription that is being replaced.
  update public.tenant_subscriptions
  set status = 'cancelled'
  where tenant_id = p_tenant_id
    and status in ('trialing', 'pending_payment', 'active', 'past_due');

  new_status := case when target_price > 0 then 'pending_payment' else 'active' end;

  insert into public.tenant_subscriptions (
    tenant_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  )
  values (
    p_tenant_id,
    target_plan_id,
    new_status,
    case when target_price > 0 then null else current_date end,
    case when target_price > 0 then null else (current_date + interval '1 month')::date end
  )
  returning id into new_subscription_id;

  if target_price > 0 then
    insert into public.subscription_payment_requests (
      tenant_id,
      plan_id,
      requested_by,
      amount,
      payment_method,
      transaction_id,
      payment_note
    )
    values (
      p_tenant_id,
      target_plan_id,
      caller_admin_id,
      target_price,
      coalesce(nullif(trim(p_payment_method), ''), 'other'),
      nullif(left(trim(coalesce(p_transaction_id, '')), 120), ''),
      nullif(left(trim(coalesce(p_payment_note, '')), 500), '')
    )
    returning id into new_request_id;
  end if;

  insert into public.subscription_events (
    tenant_id,
    event_type,
    from_plan_id,
    to_plan_id,
    amount,
    reference_type,
    reference_id
  )
  values (
    p_tenant_id,
    case when previous_plan_id is null then 'subscription_created' else 'plan_changed' end,
    previous_plan_id,
    target_plan_id,
    target_price,
    case when new_request_id is null then null else 'payment_request' end,
    new_request_id
  );

  return new_subscription_id;
end;
$$;

grant execute on function public.change_tenant_plan(uuid, text, text, text, text) to authenticated;

-- Approve a pending subscription payment request. This activates the
-- subscription. The `approved_by` admin must belong to the same tenant.
create or replace function public.approve_subscription_payment_request(
  p_request_id uuid,
  p_approved_by uuid
)
returns public.subscription_payment_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.subscription_payment_requests;
  target_subscription_id uuid;
begin
  select * into request_row
  from public.subscription_payment_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Subscription payment request not found.';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Only pending payment requests can be approved.';
  end if;

  if not exists (
    select 1
    from public.admin_users
    where tenant_id = request_row.tenant_id
      and id = p_approved_by
      and status = 'active'
  ) then
    raise exception 'Approving admin does not belong to this coaching centre.';
  end if;

  update public.subscription_payment_requests
  set
    status = 'approved',
    approved_by = p_approved_by,
    approved_at = now(),
    rejected_by = null,
    rejected_at = null,
    rejection_reason = null
  where id = p_request_id
  returning * into request_row;

  select id into target_subscription_id
  from public.tenant_subscriptions
  where tenant_id = request_row.tenant_id
    and plan_id = request_row.plan_id
    and status = 'pending_payment'
  order by created_at desc
  limit 1;

  if target_subscription_id is not null then
    update public.tenant_subscriptions
    set
      status = 'active',
      current_period_start = current_date,
      current_period_end = (current_date + interval '1 month')::date
    where id = target_subscription_id;
  end if;

  insert into public.subscription_events (
    tenant_id,
    event_type,
    to_plan_id,
    amount,
    reference_type,
    reference_id
  )
  values (
    request_row.tenant_id,
    'payment_approved',
    request_row.plan_id,
    request_row.amount,
    'payment_request',
    request_row.id
  );

  return request_row;
end;
$$;

grant execute on function public.approve_subscription_payment_request(uuid, uuid) to authenticated;

-- Reject a pending subscription payment request. The subscription stays
-- inactive; the tenant can request payment again.
create or replace function public.reject_subscription_payment_request(
  p_request_id uuid,
  p_rejected_by uuid,
  p_rejection_reason text
)
returns public.subscription_payment_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.subscription_payment_requests;
begin
  select * into request_row
  from public.subscription_payment_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Subscription payment request not found.';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'Only pending payment requests can be rejected.';
  end if;

  if not exists (
    select 1
    from public.admin_users
    where tenant_id = request_row.tenant_id
      and id = p_rejected_by
      and status = 'active'
  ) then
    raise exception 'Rejecting admin does not belong to this coaching centre.';
  end if;

  update public.subscription_payment_requests
  set
    status = 'rejected',
    rejected_by = p_rejected_by,
    rejected_at = now(),
    rejection_reason = nullif(left(trim(coalesce(p_rejection_reason, '')), 500), ''),
    approved_by = null,
    approved_at = null
  where id = p_request_id
  returning * into request_row;

  insert into public.subscription_events (
    tenant_id,
    event_type,
    to_plan_id,
    amount,
    reference_type,
    reference_id,
    note
  )
  values (
    request_row.tenant_id,
    'payment_rejected',
    request_row.plan_id,
    request_row.amount,
    'payment_request',
    request_row.id,
    nullif(left(trim(coalesce(p_rejection_reason, '')), 500), '')
  );

  return request_row;
end;
$$;

grant execute on function public.reject_subscription_payment_request(uuid, uuid, text) to authenticated;
