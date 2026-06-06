# Supabase Data Model

This document summarizes the current Edu Flow database model defined by the migrations in `supabase/migrations`.

## Tenant And Admin

### `tenants`
Coaching centre workspace record.

- `id uuid` primary key
- `name text` required
- `address text`
- `contact_phone text`
- `secondary_phone text`
- `email text`
- `subscription_status text` values: `trial`, `active`, `past_due`, `suspended`, `cancelled`
- `created_at timestamptz`
- `updated_at timestamptz`

### `admin_users`
Admin account mapped to Supabase Auth and a tenant.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `auth_user_id uuid` references `auth.users(id)`, unique
- `name text` required
- `phone text`
- `role text` value: `admin`
- `status text` values: `active`, `archived`
- `created_at timestamptz`
- `updated_at timestamptz`

## Students And Classes

### `students`
Student profile inside one tenant.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `name text` required
- `phone text`
- `guardian_name text`
- `guardian_phone text`
- `institution text`
- `class_level text`
- `medium text`
- `group_name text`
- `tags text[]`
- `admission_date date`
- `fee_start_month date`
- `status text` values: `active`, `archived`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `teachers`
Teacher profile and default salary snapshot source for new salary ledgers.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `name text` required
- `phone text`
- `subject_specialty text`
- `default_monthly_salary numeric(12,2)`
- `status text` values: `active`, `archived`
- `notes text`
- `created_at timestamptz`
- `updated_at timestamptz`

### `batches`
Batch/course record.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `name text` required
- `subject text`
- `class_level text`
- `medium text`
- `group_name text`
- `monthly_fee numeric(12,2)`
- `teacher_id uuid` references `teachers`
- `status text` values: `active`, `archived`
- `created_at timestamptz`
- `updated_at timestamptz`

### `student_batches`
Student enrollment in batches, including optional fee overrides.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `student_id uuid` references `students`
- `batch_id uuid` references `batches`
- `custom_fee_override numeric(12,2)`
- `fee_override numeric(12,2)`
- `discount_amount numeric(12,2)`
- `joined_at date`
- `status text` values: `active`, `inactive`, `archived`
- `created_at timestamptz`
- `updated_at timestamptz`

Unique constraint: `tenant_id`, `student_id`, `batch_id`.

### `class_schedules`
Recurring class schedule for batches.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `batch_id uuid` references `batches`
- `teacher_id uuid` references `teachers`
- `subject text`
- `weekday smallint` values: `0` through `6`
- `start_time time`
- `end_time time`
- `room_name text`
- `status text` values: `active`, `cancelled`, `archived`
- `created_at timestamptz`
- `updated_at timestamptz`

## Student Payments

### `billing_settings`
Student payment rules per tenant.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`, unique
- `billing_mode text` values: `prepaid`, `postpaid`
- `payment_start_day smallint` values: `1` through `15`
- `grace_period_days smallint` values: `0` through `15`
- `created_at timestamptz`
- `updated_at timestamptz`

### `student_monthly_ledgers`
One fee ledger per student per billing month.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `student_id uuid` references `students`
- `ledger_month date` first day of month
- `expected_amount numeric(12,2)`
- `discount_amount numeric(12,2)`
- `paid_amount numeric(12,2)`
- `due_amount numeric(12,2)`
- `status text` values: `not_started`, `due`, `overdue`, `partial`, `paid`, `waived`
- `payment_start_date date`
- `grace_end_date date`
- `generated_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Unique constraint: `tenant_id`, `student_id`, `ledger_month`.

### `student_payments`
Individual payment receipts against student ledgers.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `ledger_id uuid` references `student_monthly_ledgers`
- `student_id uuid` references `students`
- `receipt_number text`
- `receipt_no text`
- `receipt_generated_at timestamptz`
- `receipt_pdf_url text`
- `receipt_pdf_path text`
- `amount numeric(12,2)`
- `method text` values: `cash`, `bkash`, `nagad`, `bank`, `card`, `other`
- `payment_date date`
- `note text`
- `created_at timestamptz`
- `updated_at timestamptz`

Unique constraints:

- `tenant_id`, `receipt_number`
- `tenant_id`, `receipt_no`

## Teacher Salaries

### `teacher_payment_settings`
Teacher salary payment timing per tenant.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`, unique
- `payment_system text` values: `prepaid`, `postpaid`
- `created_at timestamptz`
- `updated_at timestamptz`

### `teacher_salary_ledgers`
One salary ledger per active teacher per salary month.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `teacher_id uuid` references `teachers`
- `ledger_month date` first day of month
- `expected_salary numeric(12,2)`
- `adjustment_amount numeric(12,2)`
- `paid_amount numeric(12,2)`
- `due_amount numeric(12,2)`
- `status text` values: `unpaid`, `partial`, `paid`, `waived`
- `payment_start_date date`
- `generated_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Unique constraint: `tenant_id`, `teacher_id`, `ledger_month`.

### `teacher_salary_payments`
Individual salary payment receipts against teacher salary ledgers.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `ledger_id uuid` references `teacher_salary_ledgers`
- `teacher_id uuid` references `teachers`
- `receipt_number text`
- `amount numeric(12,2)`
- `method text` values: `cash`, `bkash`, `nagad`, `bank`, `card`, `other`
- `payment_date date`
- `note text`
- `created_at timestamptz`
- `updated_at timestamptz`

Unique constraint: `tenant_id`, `receipt_number`.

## Academic Taxonomy

### `class_levels`
Tenant-managed class or grade options.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `name text` required
- `created_at timestamptz`
- `updated_at timestamptz`

Unique constraint: `tenant_id`, `name`.

### `academic_groups`
Tenant-managed group options. Default rows are Science, Commerce, and Arts.

- `id uuid` primary key
- `tenant_id uuid` references `tenants(id)`
- `name text` required
- `sort_order integer`
- `created_at timestamptz`
- `updated_at timestamptz`

Unique constraint: `tenant_id`, `name`.

## Tenant Isolation

Most application tables include `tenant_id`, tenant-scoped unique constraints, and row level security policies that compare `tenant_id` with `current_admin_tenant_id()`. The helper reads the active admin row for the authenticated Supabase user.

## Scheduled Jobs

### `generate-monthly-ledgers`
Supabase Edge Function intended to be called by Supabase Cron once per day.

- Creates missing student fee ledgers when the tenant's student payment window has opened.
- Creates missing teacher salary ledgers when the tenant's teacher payment window has opened.
- Uses `fee_start_month` so newly admitted students do not receive ledgers before their selected starting month.
- Uses tenant/month unique constraints with conflict-ignore behavior, so repeated runs do not duplicate ledgers.
