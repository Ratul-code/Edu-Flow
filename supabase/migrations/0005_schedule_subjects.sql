-- Edu Flow batch-first scheduling refinement.
-- Run this after 0004_batch_first_mvp_fields.sql.

alter table public.class_schedules
  add column if not exists subject text;

update public.class_schedules cs
set subject = b.subject
from public.batches b
where cs.batch_id = b.id
  and cs.tenant_id = b.tenant_id
  and cs.subject is null
  and b.subject is not null;

create index if not exists class_schedules_tenant_subject_idx
  on public.class_schedules(tenant_id, subject);
