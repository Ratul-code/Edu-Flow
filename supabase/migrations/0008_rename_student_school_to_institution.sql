-- Rename student school field to institution while preserving existing values.
-- Run this after 0007_billing_settings_student_ledgers.sql.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'students'
      and column_name = 'school'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'students'
      and column_name = 'institution'
  ) then
    alter table public.students rename column school to institution;
  elsif not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'students'
      and column_name = 'institution'
  ) then
    alter table public.students add column institution text;
  end if;
end $$;
