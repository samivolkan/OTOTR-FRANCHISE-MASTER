# Reviewed Baseline 002-005 - Report, RPC and Seed Design

Date: 2026-06-03

No database command was run during this review.

## Stage 6 - Report Template Schema Migration

Reviewed migration draft:

`supabase/migrations/202606030002_reviewed_report_template_system.sql`

Source:

`packages/database/raw-migrations/schema-foundations/2026-05-25-report-template-system.sql`

Covered app contracts:

- `report_templates`
- `report_template_groups`
- `report_template_items`
- `report_template_item_options`
- `report_template_item_inputs`
- `report_template_item_media_fields`
- `work_order_report_answers`
- `work_order_report_files`
- `work_order_group_status`
- `final_reports`
- `save_work_order_report_answer`
- `lock_work_order_report_item`
- `unlock_work_order_report_item`

Review adjustments:

- `app_private` schema is created before helper use.
- `current_app_user_id` and `current_app_user_role` are defined for later RPC use.
- RLS policies use `public.current_user_can_access_branch` from baseline 001.
- update triggers are dropped before recreation for idempotency.
- explicit authenticated grants are kept for Data API visibility.

## Stage 7 - Task Ownership/RPC Compatibility

Reviewed migration draft:

`supabase/migrations/202606030003_reviewed_task_ownership_rules.sql`

Source:

`packages/database/raw-migrations/rpc-functions/2026-05-24-technical-task-ownership-rules.sql`

Covered app contracts:

- `claim_inspection_task`
- `release_inspection_task`
- `manager_assign_inspection_task`
- `manager_clear_inspection_task_owner`
- `submit_inspection_task`
- `manager_return_inspection_task`
- task ownership trigger enforcement

Review adjustments:

- task status constraint now includes current app vocabulary: `AVAILABLE`, `CLAIMED`, `IN_PROGRESS`, `RETURNED` and existing legacy statuses.
- `security definer` functions set `search_path = public`.
- execute grants are explicit for authenticated users and revoked from public/anon.

Remaining review note:

- Functions still set claimed tasks to `OPEN`; apps accept `OPEN`, but UI labels also know `CLAIMED`. This is acceptable for now but should be tested with local data.

## Stage 8 - Branch Work Order RPC Layer

Reviewed migration draft:

`supabase/migrations/202606030004_reviewed_branch_work_order_rpc.sql`

Source:

`packages/database/raw-migrations/rpc-functions/2026-05-25-branch-work-order-rpc.sql`

Covered app contracts:

- package plan defaults,
- `create_branch_work_order`,
- `update_branch_work_order_task_status`,
- branch work-order task specs,
- admin bypass flags for controlled task status updates.

Review adjustments:

- task status constraint extended to current app vocabulary.
- branch access check uses `public.current_user_can_access_branch`.
- `RECEPTION_STAFF` removed from role checks because baseline `app_users.role` does not allow that value.

Remaining review note:

- Package plan seed is embedded in the migration. This is operational reference data, not demo customer data. Keep under review before production.

## Stage 9 - List/Save/Lock Mobile RPC Layer

Reviewed migration draft:

`supabase/migrations/202606030005_reviewed_list_branch_technicians.sql`

Source:

`packages/database/raw-migrations/rpc-functions/2026-05-25-list-branch-technicians.sql`

Covered app contracts:

- `list_branch_technicians`

Report save/lock/unlock RPCs are covered by reviewed migration 002:

- `save_work_order_report_answer`
- `lock_work_order_report_item`
- `unlock_work_order_report_item`

Review adjustments:

- function stays a constrained `security definer` RPC.
- execute grant/revoke remains explicit.

## Stage 10 - Local Seed Design

Seed design document:

`docs/database-local-seed-design.md`

Decision:

- Do not put executable data into `supabase/seed.sql` yet.
- First validate migrations locally.
- Then create a deterministic local seed using local auth user IDs.

Required local seed entities:

- one branch,
- CEO/HQ user,
- branch manager,
- technician,
- customer,
- vehicle,
- active package plan,
- one expertise case,
- task rows,
- report template rows,
- initial group status,
- optional evidence placeholder rows.

## Current Reviewed Draft Chain

1. `202606030001_reviewed_expertise_report_backbone.sql`
2. `202606030002_reviewed_report_template_system.sql`
3. `202606030003_reviewed_task_ownership_rules.sql`
4. `202606030004_reviewed_branch_work_order_rpc.sql`
5. `202606030005_reviewed_list_branch_technicians.sql`

## Validation Status

Blocked:

- Supabase CLI unavailable.
- Docker unavailable.
- Local DB reset not run.

Pending commands after prerequisites:

```powershell
supabase start
supabase migration list
supabase db reset
```

## Risks

- Migration order must be validated locally; static review cannot catch all SQL dependency errors.
- Storage policies need upload/read/update testing with the report-media bucket.
- Package plan reference data in migration 004 should be approved as production-safe reference data.
- Auth users must exist before app_users seed can map `auth_user_id`.
- Explicit table grants are important for current Supabase Data API behavior.

