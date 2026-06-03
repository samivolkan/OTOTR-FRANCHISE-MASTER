# Reviewed Baseline 001-005 App Contract Check

Date: 2026-06-03

No application code was changed during this check. No database command was run.

## Flutter Branch App

Required tables from app code:

- `app_users`: covered by migration 001.
- `expertise_cases`: covered by migration 001.
- `technician_start_evidence`: covered by migration 001.
- `inspection_tasks`: covered by migration 001, extended by migrations 003 and 004.
- `inspection_item_values`: covered by migration 001.
- `inspection_evidence_assets`: covered by migration 001.
- `external_query_results`: covered by migration 001.
- `work_order_report_answers`: covered by migration 002.
- `final_reports`: covered by migration 002.
- `report_templates`: covered by migration 002.
- `report_template_groups`: covered by migration 002.
- `report_template_items`: covered by migration 002.
- `report_template_item_options`: covered by migration 002.
- `report_template_item_inputs`: covered by migration 002.

Required RPCs from app code:

- `list_branch_technicians`: covered by migration 005.
- `claim_inspection_task`: covered by migration 003.
- `release_inspection_task`: covered by migration 003.
- `manager_assign_inspection_task`: covered by migration 003.
- `manager_clear_inspection_task_owner`: covered by migration 003.
- `submit_inspection_task`: covered by migration 003.
- `save_work_order_report_answer`: covered by migration 002.
- `lock_work_order_report_item`: covered by migration 002.
- `unlock_work_order_report_item`: covered by migration 002.
- `create_branch_work_order`: covered by migration 004.
- `update_branch_work_order_task_status`: covered by migration 004.

Storage:

- App uploads through Supabase storage.
- Migration 002 creates `report-media` policies for `work-orders/<case_id>/...` paths.
- Verify bucket name used by the app before live upload validation.

## Expo Technician App

Required tables:

- `expertise_cases`: covered by migration 001.
- `inspection_tasks`: covered by migration 001, extended by migrations 003 and 004.
- `inspection_evidence_assets`: covered by migration 001.
- `work_order_report_answers`: covered by migration 002.
- `work_order_group_status`: covered by migration 002.
- `final_reports`: covered by migration 002.

Required RPCs:

- `claim_inspection_task`: covered by migration 003.
- `submit_inspection_task`: covered by migration 003.
- `save_work_order_report_answer`: covered by migration 002.

Auth/realtime:

- Auth password login uses Supabase Auth.
- Realtime watches public tables listed above.
- Local validation needs authenticated test user contexts and Realtime enabled.

## Admin Prototype

Required live tables:

- `app_users`: covered by migration 001.
- `vehicles`: covered by migration 001.
- `package_plans`: covered by migration 001; reference package rows added by migration 004.
- `expertise_cases`: covered by migration 001.
- `technician_start_evidence`: covered by migration 001.
- `inspection_tasks`: covered by migration 001, extended by migrations 003 and 004.
- `customers`: covered by migration 001.
- `report_template_items`: covered by migration 002.
- `work_order_report_answers`: covered by migration 002.
- `inspection_evidence_assets`: covered by migration 001.
- `inspection_item_values`: covered by migration 001.
- `external_query_results`: covered by migration 001.

Required RPCs:

- `create_branch_work_order`: covered by migration 004.
- `save_work_order_report_answer`: covered by migration 002.
- `claim_inspection_task`: covered by migration 003.
- `submit_inspection_task`: covered by migration 003.

High-risk tools:

- `tools/live_reset_single_work_order.mjs` can delete rows through REST.
- Do not run live reset scripts without explicit target approval.

## Contract Gaps To Test Locally

- Base table Data API grants for `app_users`, `expertise_cases`, `inspection_tasks`, `customers`, `vehicles`, and evidence tables.
- RLS behavior for branch manager vs technician.
- Task status transitions between `AVAILABLE`, `OPEN`, `CLAIMED`, `IN_PROGRESS`, `COMPLETED`.
- Report media storage upload path and bucket name.
- Realtime publication and subscription behavior for the watched tables.

## Decision

Reviewed migrations 001-005 cover the current static app database contract. Remaining gaps require local Supabase validation, role-matrix tests and seed data.

