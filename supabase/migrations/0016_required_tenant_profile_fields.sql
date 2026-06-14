-- Require tenant contact fields used by the center profile.
-- Run this after 0015_tenant_logo_url.sql.

update public.tenants
set
  address = coalesce(nullif(address, ''), 'Address not configured'),
  contact_phone = coalesce(nullif(contact_phone, ''), 'Phone not configured'),
  email = coalesce(nullif(email, ''), 'not-configured@eduflow.local');

alter table public.tenants
  alter column address set not null,
  alter column contact_phone set not null,
  alter column email set not null;
