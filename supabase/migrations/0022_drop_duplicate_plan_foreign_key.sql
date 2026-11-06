-- Run this after 0020_tenant_subscriptions.sql.
--
-- 0020 declared the plan foreign keys twice on subscription_payment_requests
-- and subscription_events: once inline on the column, and again as a
-- table-level constraint. Postgres treats those as two separate constraints,
-- so PostgREST sees two relationships between each table and
-- plan_definitions and refuses to embed the plan:
--
--   Could not embed because more than one relationship was found for
--   'subscription_payment_requests' and 'plan_definitions'
--
-- Dropping the table-level duplicates leaves a single relationship per
-- column, so the embedded select works again. The inline constraints keep
-- their _fkey names and stay in place.

do $$
declare
  rec record;
begin
  -- For each (table, column) that points at plan_definitions, keep only the
  -- first constraint found and drop the rest. The inline constraint is named
  -- <table>_<column>_fkey; the table-level duplicate gets a numeric suffix.
  for rec in
    select
      t.relname as table_name,
      c.conname as constraint_name,
      row_number() over (
        partition by t.relname, kcu.column_name
        order by c.conname
      ) as dup_rank
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_class rt on rt.oid = c.confrelid
    join pg_namespace n on n.oid = t.relnamespace
    join pg_attribute a on a.attrelid = t.oid and a.attnum = any (c.conkey)
    join information_schema.key_column_usage kcu
      on kcu.constraint_name = c.conname
      and kcu.constraint_schema = n.nspname
    where n.nspname = 'public'
      and t.relname in (
        'subscription_payment_requests',
        'subscription_events'
      )
      and rt.relname = 'plan_definitions'
      and c.contype = 'f'
  loop
    if rec.dup_rank > 1 then
      execute format(
        'alter table public.%I drop constraint %I',
        rec.table_name,
        rec.constraint_name
      );
    end if;
  end loop;
end
$$;
