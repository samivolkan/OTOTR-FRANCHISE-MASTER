# Reviewed Baseline 001 - Expertise Report Backbone

Date: 2026-06-03
Reviewed migration draft:

`supabase/migrations/202606030001_reviewed_expertise_report_backbone.sql`

Source raw SQL:

`packages/database/raw-migrations/schema-foundations/2026-05-24-expertise-report-backbone.sql`

No database command was run during this review.

## Stage 1 - Schema Foundation Review

The raw foundation file covers:

- branches,
- app users,
- customers,
- vehicles,
- package plans,
- appointments,
- expertise cases,
- technician start evidence,
- inspection tasks,
- inspection item values,
- inspection evidence assets,
- external query results,
- report gate issues,
- report revisions,
- report audit logs,
- report delivery events,
- indexes,
- update timestamp triggers,
- locked report mutation guards,
- report audit triggers,
- approval/revision functions,
- public report verification view,
- initial RLS policies.

## Stage 2 - Baseline Migration Draft

The first reviewed local migration draft was created under `supabase/migrations`.

Review adjustments applied:

- added a reviewed migration header,
- kept the raw schema content intact where possible,
- added explicit `set search_path = public` to `security definer` functions,
- changed `public_report_verification` to a `security_invoker` view.

This is still a local validation candidate, not a staging/production migration.

## Stage 3 - RLS and Security Definer Review

Functions reviewed in this migration:

- `approve_expertise_case`
- `request_expertise_case_revision`
- `current_app_user`
- `current_user_can_access_branch`

Security notes:

- `security definer` functions now set `search_path = public`.
- `current_app_user` and `current_user_can_access_branch` rely on `auth.uid()` and `app_users.auth_user_id`.
- Policies are broad branch-access policies and need role-matrix tests.
- No explicit execute grants/revokes were added in this migration draft; later hardening migrations must review this.

View notes:

- `public_report_verification` now uses `security_invoker = true`.
- Public/anonymous report access still needs a separate explicit product decision.

## Stage 4 - App Contract Check

Covered by this migration:

- `app_users`
- `expertise_cases`
- `technician_start_evidence`
- `inspection_tasks`
- `inspection_item_values`
- `inspection_evidence_assets`
- `external_query_results`

Partially covered:

- `customers`
- `vehicles`
- `package_plans`
- `appointments`

Not covered yet but used by apps:

- `report_templates`
- `report_template_groups`
- `report_template_items`
- `report_template_item_options`
- `report_template_item_inputs`
- `work_order_report_answers`
- `work_order_group_status`
- `final_reports`

RPCs not covered yet but used by apps:

- `list_branch_technicians`
- `claim_inspection_task`
- `release_inspection_task`
- `manager_assign_inspection_task`
- `manager_clear_inspection_task_owner`
- `submit_inspection_task`
- `save_work_order_report_answer`
- `lock_work_order_report_item`
- `unlock_work_order_report_item`
- `create_branch_work_order`
- `update_branch_work_order_task_status`

Important mismatch:

- app code uses task statuses such as `AVAILABLE`, `CLAIMED`, `IN_PROGRESS` and `RETURNED` in some places.
- the first foundation file does not fully support that status vocabulary.
- later RPC migration files modify task behavior, but their status constraints still need focused review before local validation.

## Stage 5 - Local Validation Readiness

Local validation remains blocked because Supabase CLI and Docker are unavailable.

Pending commands after prerequisites:

```powershell
supabase start
supabase migration list
supabase db reset
```

After reset:

```powershell
psql "<LOCAL_DATABASE_URL>" -f packages/database/rls-verification-checklist.sql
```

## Risks

- This migration is only the first foundation; it is not sufficient for current app live flows.
- RLS policies need role-specific test users.
- Function execute permissions need review in later hardening stage.
- Task status vocabulary mismatch must be fixed before live mobile task flows are validated.
- No seed data exists yet, so local app smoke testing will need deterministic local seed design.

## Decision

Use this file as the first local reviewed baseline candidate, then continue with report template schema and task/RPC compatibility before any local reset attempt.

