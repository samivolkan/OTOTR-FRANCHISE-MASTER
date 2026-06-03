# Database App Contract Map

Date: 2026-06-03

This document maps current app code to Supabase tables, RPCs, auth, realtime and storage contracts. It is based on static inspection only.

## Flutter Branch App

Path:

`apps/mobile-branch`

Supabase areas:

- `lib/data/remote/supabase_work_order_data_source.dart`
- `lib/data/remote/supabase_work_order_report_data_source.dart`
- `lib/data/remote/supabase_final_report_data_source.dart`
- `lib/data/remote/supabase_report_template_data_source.dart`
- `lib/data/repositories/supabase_branch_work_order_repository.dart`
- `lib/data/repositories/app_repositories.dart`
- `lib/data/services/photo_upload_service.dart`

Tables read or written:

- `app_users`
- `expertise_cases`
- `technician_start_evidence`
- `inspection_tasks`
- `inspection_item_values`
- `inspection_evidence_assets`
- `external_query_results`
- `work_order_report_answers`
- `final_reports`
- `report_templates`
- `report_template_groups`
- `report_template_items`
- `report_template_item_options`
- `report_template_item_inputs`

RPC functions called:

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

Storage:

- uploads through `PhotoUploadService`.
- bucket name must be verified against the final storage policy and app config.

Risk:

- This app depends heavily on RLS allowing branch/technician-scoped reads and updates.
- Any RPC rename or signature change requires Flutter code updates.

## Expo Technician App

Path:

`apps/mobile-technician/src/live/api.ts`

Supabase areas:

- Auth password login through `/auth/v1/token`.
- REST access through `/rest/v1`.
- Realtime websocket subscription through `/realtime/v1/websocket`.

Tables read or written:

- `expertise_cases`
- `inspection_tasks`
- `inspection_evidence_assets`
- `work_order_report_answers`
- `work_order_group_status`
- `final_reports`

RPC functions called:

- `claim_inspection_task`
- `submit_inspection_task`
- `save_work_order_report_answer`

Realtime tables:

- `expertise_cases`
- `inspection_tasks`
- `inspection_evidence_assets`
- `work_order_report_answers`
- `work_order_group_status`
- `final_reports`

Risk:

- Public Supabase fallback configuration was removed on 2026-06-03. Live access now requires `EXPO_PUBLIC_OTOTR_SUPABASE_URL` and `EXPO_PUBLIC_OTOTR_SUPABASE_KEY`.
- REST paths are string-built and must stay aligned with table names and RLS policies.

## Admin Prototype

Path:

`apps/admin/prototype`

Current state:

- Mostly localStorage/mock backend.
- Contains live Supabase work-order flows in the large prototype and `tools/live_*.mjs`.

Live tables or REST paths observed:

- `app_users`
- `vehicles`
- `package_plans`
- `expertise_cases`
- `technician_start_evidence`
- `inspection_tasks`
- `customers`
- `report_template_items`
- `work_order_report_answers`
- `inspection_evidence_assets`
- `inspection_item_values`
- `external_query_results`

RPC functions called:

- `create_branch_work_order`
- `save_work_order_report_answer`
- `claim_inspection_task`
- `submit_inspection_task`

High-risk live/reset behavior:

- `tools/live_reset_single_work_order.mjs` and prototype live reset paths can delete/reset live rows if pointed at a live project.
- These tools must not run unless target environment and credentials are explicitly approved.
- The prototype no longer stores default live Supabase URL/key constants. Live browser usage requires `window.OTOTR_SUPABASE_CONFIG` or localStorage key `ototr-dealer-supabase-config-v1`.

## Contract Stabilization Rules

- Do not rename tables or RPCs until all app references are updated.
- Prefer adding new RPCs over changing existing signatures during migration stabilization.
- Keep mobile/browser clients on anon/publishable keys only.
- Verify every table above has correct RLS for app flows.
- Verify storage upload requires the correct insert/select/update policies.
