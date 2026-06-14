-- Tenant logo URL for center profile branding.
-- Run this after 0014_teacher_payment_window_settings.sql.

alter table public.tenants
  add column if not exists logo_url text;
