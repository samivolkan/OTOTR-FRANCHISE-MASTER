# Reviewed Migrations

Only audited, local-validated SQL migrations belong here.

## Naming

Use Supabase CLI naming when available:

```powershell
supabase migration new descriptive_name
```

Do not invent production migration filenames manually once the CLI is available.

## Current Rule

Reviewed local migration drafts may live here, but they are not approved for staging or production until local validation passes and explicit deployment approval is given.

The raw source queue is documented in:

`../../packages/database/reviewed-migration-order.md`

## Current Drafts

- `202606030001_reviewed_expertise_report_backbone.sql`
- `202606030002_reviewed_report_template_system.sql`
- `202606030003_reviewed_task_ownership_rules.sql`
- `202606030004_reviewed_branch_work_order_rpc.sql`
- `202606030005_reviewed_list_branch_technicians.sql`
- `202606030006_public_web_form_backend.sql`
- `202606030007_public_complaints_location_fields.sql`
- `20260603193856_harden_audit_report_child_mutation_execute.sql`
- `20260603195028_fix_app_users_rls_recursion.sql`

Local validation status on 2026-06-03:

- `npx.cmd supabase db reset --local` passed through `20260603195028`.
- `packages/database/expected-contract-verification.sql` passed through local container `psql`.
- `packages/database/rls-verification-checklist.sql` passed through local container `psql`.
- Full local stack started; REST and Edge Function health endpoints responded.
- `node tools\local-role-session-smoke.mjs` passed for local branch manager and technician Auth sessions.

Do not run remote `supabase db push` without explicit staging/production approval.
