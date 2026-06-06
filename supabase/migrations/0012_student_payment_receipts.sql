-- Student payment receipt fields.
-- Run this after 0011_student_fee_start_and_cron_indexes.sql.

alter table public.student_payments
  add column if not exists receipt_no text,
  add column if not exists receipt_generated_at timestamptz,
  add column if not exists receipt_pdf_url text,
  add column if not exists receipt_pdf_path text;

update public.student_payments
set
  receipt_no = coalesce(receipt_no, receipt_number),
  receipt_generated_at = coalesce(receipt_generated_at, created_at)
where receipt_no is null
   or receipt_generated_at is null;

alter table public.student_payments
  alter column receipt_no set not null,
  alter column receipt_generated_at set not null;

alter table public.student_payments
  drop constraint if exists student_payments_tenant_receipt_no_key,
  add constraint student_payments_tenant_receipt_no_key unique (tenant_id, receipt_no);

create index if not exists student_payments_tenant_receipt_no_idx
  on public.student_payments(tenant_id, receipt_no);
