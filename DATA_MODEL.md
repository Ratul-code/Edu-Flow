# Supabase Data Model

This document summarizes the domain model defined by `supabase/migrations`. It focuses on business entities and relationships, not every database column.

## Tenant Model

Edu Flow is tenant-scoped. A tenant represents one coaching centre workspace.

- `tenants` is the root entity for centre profile and subscription state.
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
- Default academic groups are inserted for each tenant: Science, Commerce, Arts.
- Medium is stored on students and batches but is not tenant-managed by a separate table.

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

`teacher_payment_settings` stores the tenant’s salary payment system.

Business rules:

- `prepaid`: the salary ledger opens in the same month.
- `postpaid`: the salary ledger opens in the following month.

### Salary Ledgers

`teacher_salary_ledgers` stores one teacher/month salary snapshot.

Business rules:

- Unique per tenant, teacher, and salary month.
- Expected salary starts from the teacher’s default monthly salary.
- Adjustments can change the amount due for that month.
- Payment start date is stored on the ledger.
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

## Isolation And Integrity

- Row level security is enabled for tenant business tables.
- Tenant policies restrict authenticated admins to their active tenant.
- Most relationships include tenant-aware foreign keys or tenant-scoped uniqueness.
- Shared update timestamp triggers keep records timestamped consistently.
