# Supabase Data Model

This document summarizes the domain model defined by `supabase/migrations`. It focuses on business entities and relationships, not every database column.

## Tenant Model

Edu Flow is tenant-scoped. A tenant represents one coaching centre workspace.

- `tenants` is the root entity for centre profile and subscription state.
- Tenant centre profile requires name, address, contact phone, and email.
- Tenant centre profile can store an optional `logo_url`, currently used for uploaded logo data.
- `admin_users` links Supabase Auth users to a tenant.
- Application tables store `tenant_id` and are isolated by row level security.
- The helper `current_admin_tenant_id()` resolves the active admin tenant from the authenticated Supabase user.
- Most business tables use tenant-scoped uniqueness so records from different centres cannot collide.

## Core Entities

### Students

`students` stores learner profiles for a tenant. Students have academic classification data, admission date, status, and a `fee_start_month` that controls when monthly fee ledgers should begin.

Relationships:

- A student belongs to one tenant.
- A student can join many batches through `student_batches`.
- A student can have one monthly fee ledger per billing month.
- A student can have many payments through those ledgers.

### Teachers

`teachers` stores teacher profiles and their default monthly salary.

Relationships:

- A teacher belongs to one tenant.
- A teacher can be assigned to batches and class schedules.
- A teacher can have one salary ledger per salary month.
- A teacher can have many salary payments through those ledgers.

### Batches

`batches` represent classes/courses with a monthly fee, academic classification, and optional assigned teacher.

Relationships:

- A batch belongs to one tenant.
- A batch can have many enrolled students through `student_batches`.
- A batch can have many class schedules.
- Batch monthly fee is used as the default source for future student fee ledgers.

### Student Batch Assignments

`student_batches` is the enrollment join between students and batches.

Business role:

- Controls which batch fees count toward a student’s expected monthly fee.
- Supports per-student fee overrides.
- Keeps assignment status so enrollments can be active, inactive, or archived.
- Existing monthly ledgers are snapshots; changing assignments or fees should affect future ledgers unless explicitly recalculated.

### Class Schedules

`class_schedules` stores recurring schedule rows for batches, optionally linked to teachers.

## Academic Taxonomy

Academic classification is tenant-managed.

- `class_levels` stores class/grade options per tenant.
- `academic_groups` stores group options per tenant.
- `medium_options` stores medium options per tenant.
- Default class levels are inserted for each tenant: Class 4 through Class 12.
- Default academic groups are inserted for each tenant: Science, Commerce, Arts.
- Default mediums are inserted for each tenant: Bangla Medium, English Version, English Medium.
- Students and batches store the selected class level, group, and medium as historical text values.

## Student Billing Model

Student billing is month-ledger based.

### Billing Settings

`billing_settings` stores the student payment policy for each tenant.

Business rules:

- `prepaid`: a month’s fee opens in the same month.
- `postpaid`: a month’s fee opens in the following month.
- Payment start day is limited to days 1-15.
- Grace period is limited to 0-15 days.

### Monthly Fee Ledgers

`student_monthly_ledgers` stores one student/month fee snapshot.

Business rules:

- Unique per tenant, student, and billing month.
- Expected amount is calculated from active batch assignments.
- Fee override on `student_batches` overrides the batch monthly fee for that student/batch.
- Payment window dates are stored on the ledger so historical months do not change unexpectedly.
- Status represents the month’s current state: not started, due, overdue, partial, paid, or waived.
- Waivers adjust the ledger due/discount state; they are not payment receipts.

### Ledger Creation

Ledgers can be created manually by the app or automatically by the scheduled Edge Function.

Business rules:

- A student should not receive ledgers before their `fee_start_month`.
- Ledger creation is idempotent and protected by tenant/student/month uniqueness.
- Future ledgers use the latest active batch fees and overrides.
- Historical ledgers preserve the old snapshot unless an admin explicitly recalculates the current month.

## Receipt Model

`student_payments` stores individual student payment records and receipt metadata.

Business rules:

- Payments belong to a tenant, student, and monthly ledger.
- A ledger can have multiple payments, so receipts are per payment, not per month.
- Receipt numbers follow a tenant/month sequence such as `RCPT-202606-0001`.
- Receipt numbers are unique within a tenant.
- Receipt preview is generated dynamically from payment, ledger, student, tenant, and batch data.
- PDF download is generated on demand.
- Optional PDF URL/path fields exist for future cached receipt files.

Relationship flow:

```txt
student -> student_monthly_ledger -> student_payment -> receipt preview/PDF
```

## Teacher Salary Model

Teacher salaries are also month-ledger based.

### Teacher Payment Settings

`teacher_payment_settings` stores the tenant’s salary payment system and payment window policy.

Business rules:

- `prepaid`: the salary ledger opens in the same month.
- `postpaid`: the salary ledger opens in the following month.
- Payment start day is limited to days 1-15.
- Grace period is limited to 0-15 days.

### Salary Ledgers

`teacher_salary_ledgers` stores one teacher/month salary snapshot.

Business rules:

- Unique per tenant, teacher, and salary month.
- Expected salary starts from the teacher’s default monthly salary.
- Adjustments can change the amount due for that month.
- Payment start date and grace end date are stored on the ledger.
- Status tracks unpaid, partial, paid, or waived.
- Changing a teacher’s default salary affects future ledgers, not existing snapshots.

### Salary Payments

`teacher_salary_payments` stores payment records against teacher salary ledgers.

Relationship flow:

```txt
teacher -> teacher_salary_ledger -> teacher_salary_payment
```

## Scheduled Ledger Generation

The `generate-monthly-ledgers` Edge Function is intended to run daily through Supabase Cron.

It creates missing ledgers when payment windows open:

- Student fee ledgers according to each tenant’s student billing settings.
- Teacher salary ledgers according to each tenant’s teacher payment settings.

The function is idempotent:

- It uses tenant/month uniqueness to avoid duplicates.
- It only creates missing rows.
- It respects student `fee_start_month`.

## SMS Credit And Messaging Model

SMS is tenant-scoped. Credits belong to the coaching centre, not individual admins, but usage records keep the admin id for audit history.

### SMS Wallet

`tenant_sms_wallets` stores one wallet per tenant.

Business rules:

- `available_credits` are immediately usable credits.
- `reserved_credits` are locked for queued/sending communication messages.
- Purchased, used, and refunded lifetime totals are tracked on the wallet.
- Credits cannot go below zero.
- If `sms_enabled` is false, communication message reservation is blocked.

### SMS Credit Ledger

`sms_credit_transactions` is the immutable credit statement.

Business rules:

- Every wallet mutation creates one transaction row.
- Positive `credit_amount` means credits were added or refunded.
- Negative `credit_amount` means credits were reserved, used, or removed.
- Transactions can reference communication messages, recharge requests, or manual adjustments.

### Recharge And Packages

`sms_credit_packages` stores active recharge package definitions.
`sms_recharge_requests` stores tenant recharge requests.

Business rules:

- Approving a recharge request adds purchased credits to the wallet.
- Approval creates a `purchase` credit transaction.
- Rejected requests do not affect wallet credits.

### Templates And Settings

`sms_templates` stores tenant message templates, including default templates for payment confirmation, reminders, grace-period notices, and overdue warnings.
`tenant_sms_settings` stores each tenant’s SMS preferences and automation template selections.

Business rules:

- Templates and settings are tenant-scoped.
- Recipient options are student, guardian, or both.
- Automatic SMS rules should skip and record recipient/message history when credits are insufficient.

### Communication Messages And Recipients

`communication_messages` stores one send action for any current or future
communication channel. Examples include manual SMS, payment confirmations, fee
reminders, and future WhatsApp, email, push, or in-app notices.

`communication_recipients` stores one recipient row under a communication
message. Recipient-level delivery status, provider ids, provider responses, and
errors live here for MVP, so a separate SMS log table is not needed.

Business rules:

- ASCII-only SMS credit math uses 160 characters per segment.
- Any non-ASCII character makes the whole message Unicode, using 67 characters per segment.
- Required credits are `segments_per_recipient * recipient_count`.
- Manual/bulk sending must be blocked when `available_credits < required credits`.
- Sending reserves credits first.
- Successful sends consume reserved credits.
- Failed or unbilled sends refund reserved credits.
- `communication_messages.channel` supports `sms`, `whatsapp`, `email`, `push`, and `in_app`.
- `communication_messages` stores aggregate counts and credit totals.
- `communication_recipients` stores the final rendered message body and per-recipient delivery state.

## Isolation And Integrity

- Row level security is enabled for tenant business tables.
- Tenant policies restrict authenticated admins to their active tenant.
- Most relationships include tenant-aware foreign keys or tenant-scoped uniqueness.
- Shared update timestamp triggers keep records timestamped consistently.
