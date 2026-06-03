# Reviewed Baseline 001-005 Dependency Audit

Date: 2026-06-03

Scope:

- `supabase/migrations/202606030001_reviewed_expertise_report_backbone.sql`
- `supabase/migrations/202606030002_reviewed_report_template_system.sql`
- `supabase/migrations/202606030003_reviewed_task_ownership_rules.sql`
- `supabase/migrations/202606030004_reviewed_branch_work_order_rpc.sql`
- `supabase/migrations/202606030005_reviewed_list_branch_technicians.sql`

No database command was run during this audit.

## Migration Order

1. `001_reviewed_expertise_report_backbone`
   - Creates base operational tables, base RLS helpers and branch-scoped policies.
2. `002_reviewed_report_template_system`
   - Depends on `expertise_cases`, `app_users`, `set_updated_at`, `public.current_user_can_access_branch`.
   - Adds report template, report answer, final report and storage policy layer.
3. `003_reviewed_task_ownership_rules`
   - Depends on `inspection_tasks`, `inspection_item_values`, `inspection_evidence_assets`, `report_audit_logs`, `app_users`.
   - Adds ownership columns and task RPCs.
4. `004_reviewed_branch_work_order_rpc`
   - Depends on `app_private`, `package_plans`, `customers`, `vehicles`, `expertise_cases`, `inspection_tasks`, task audit helpers.
   - Adds branch work order RPCs.
5. `005_reviewed_list_branch_technicians`
   - Depends on `app_users`.
   - Adds constrained technician picker RPC.

## Dependency Findings

Resolved during review:

- `002` originally expected `app_private.current_user_can_access_branch`; reviewed draft now uses `public.current_user_can_access_branch`.
- `002` now creates `app_private` before using private helpers.
- `002` now drops report update triggers before recreating them.
- `003` and `004` extend `inspection_tasks.status` to include the app vocabulary.
- `004` no longer checks `RECEPTION_STAFF`, which is not allowed by baseline `app_users.role`.

Important dependencies still requiring local validation:

- `002` inserts/updates `storage.buckets`; local Supabase storage schema must exist during `supabase db reset`.
- `003` and `004` both replace `inspection_tasks_status_check`; final constraint order must be validated by local reset.
- `004` calls `public.append_task_audit`, created by `003`; migration order must not change.
- `004` grants execute on `app_private` functions. These are in a private schema, but execute exposure should be revisited after local tests.
- `001` does not explicitly grant Data API table access for all app tables. `002` adds grants for report tables only. Base table grants may need a separate hardening/visibility migration depending on Supabase project Data API settings.

## Object Coverage

Base tables:

- covered in `001`.

Report tables:

- covered in `002`.

Task RPCs:

- covered in `003`.

Branch work-order RPCs:

- covered in `004`.

Technician list RPC:

- covered in `005`.

Storage:

- `report-media` bucket and storage object policies are covered in `002`.

## Static Risks

- Static review cannot verify SQL syntax across all function bodies.
- Static review cannot verify Supabase storage/auth schemas.
- Static review cannot verify RLS behavior without authenticated JWT contexts.
- Local seed still needs local auth user UUIDs.

## Decision

Reviewed migrations 001-005 are ready for local-only validation once Supabase CLI and Docker are available. They are not approved for staging or production.

