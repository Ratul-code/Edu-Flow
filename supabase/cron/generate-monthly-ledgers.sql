-- Schedule the generate-monthly-ledgers Edge Function.
-- Replace PROJECT_REF and CRON_SECRET_VALUE before running this in Supabase SQL editor.

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists vault;

select vault.create_secret(
  'https://PROJECT_REF.supabase.co',
  'project_url'
)
where not exists (
  select 1 from vault.secrets where name = 'project_url'
);

select vault.create_secret(
  'CRON_SECRET_VALUE',
  'ledger_cron_secret'
)
where not exists (
  select 1 from vault.secrets where name = 'ledger_cron_secret'
);

select cron.schedule(
  'generate-monthly-ledgers-daily',
  '5 0 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/generate-monthly-ledgers',
    headers := jsonb_build_object(
      'Content-type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'ledger_cron_secret')
    ),
    body := jsonb_build_object('source', 'supabase-cron', 'time', now())
  ) as request_id;
  $$
);
