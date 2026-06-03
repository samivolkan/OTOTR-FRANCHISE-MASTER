# Mobile And Bayi Portal API Contracts

Status date: 2026-06-03

Purpose: freeze the first backend contracts for the mobile branch app, technician app and bayi portal before deeper UI/backend integration work.

## Contract Decision

Use Supabase auth, RLS, tables and reviewed RPCs as the first backend contract. Do not build a separate `apps/api` server for these flows yet.

Server-only Edge Functions are reserved for public website intake, payment/webhook flows, external integrations, PDF/report rendering if private credentials are needed, admin-only bulk operations and any service-role operation.

## Client Boundaries

| Client | Current Backend Shape | Near-Term Rule |
| --- | --- | --- |
| Flutter branch app | `supabase_flutter` repositories and data sources | Keep direct Supabase access behind RLS/RPCs |
| Expo technician app | Supabase Auth, REST and Realtime over fetch/WebSocket | Keep env-only public anon key, no hardcoded fallback |
| Bayi portal prototype | Static HTML/demo data today | Treat as UI contract source; do not connect live until endpoint/scope is verified |
| Public web | Supabase Edge Function `public-api` | Keep server-only service-role logic in Edge Function |
| Future `apps/api` | Reserved only | Use only if Edge Functions/RPCs are insufficient |

## Auth And Scope Contract

Every authenticated mobile/bayi request starts from the current auth user.

Required lookup:

- auth user id from Supabase session,
- active `app_users` row,
- `role`,
- `branch_id`,
- optional region assignments for HQ/region users.

Current Flutter lookup:

- `apps/mobile-branch/lib/data/repositories/app_repositories.dart`
- table: `app_users`
- selected fields: `id, branch_id, full_name, email, phone, role, is_active`

Rules:

- HQ/admin can access global data.
- Region manager can access assigned region data.
- Branch owner/manager/reception/cashier can access only their branch.
- Technician can access assigned or claimable technician tasks only.
- Browser/mobile clients use anon/publishable keys only.
- `SUPABASE_SERVICE_ROLE_KEY` is never used in mobile, browser or static portal code.

## First Bayi Portal Screen Contracts

| Portal Screen | Roles | Read Contract | Write Contract | Backend Shape |
| --- | --- | --- | --- | --- |
| Kokpit | owner, manager, reception, technician, cashier | branch KPIs, active work orders, delayed jobs, report gates, finance summary | none in first pass | Supabase views/RPC later; existing tables first |
| Randevular | owner, manager, reception | appointments, customers, vehicles, package plans | create/update appointment, convert to work order | Supabase tables/RPC first |
| Is Emirleri | owner, manager, reception | expertise cases, customers, vehicles, tasks, gates | `create_branch_work_order`, `update_branch_work_order_task_status` | reviewed RPC |
| Usta Gorevleri | owner, manager, technician | inspection tasks, owner/assignee, evidence counts | claim, release, assign, submit task | reviewed RPC |
| Mudur Onayi | owner, manager | submitted cases, gate issues, missing evidence | approve/return/revision request | `approve_expertise_case` and `request_expertise_case_revision` exist; execute grants/security path must be reviewed before browser use |
| Rapor Merkezi | owner, manager, reception, technician | templates, answers, final reports, audit state | save answers, lock/unlock item, save/lock final report | existing RPC/table; PDF may require Edge Function |
| Teslim / QR | owner, manager, reception, cashier | final report, payment gate, delivery events | mark delivered, send/share QR | table/RPC; external messaging via Edge Function |
| Musteriler | owner, manager, reception | customers, vehicles, appointments, reports | update notes/consent/follow-up | Supabase RLS first |
| Personel & Roller | owner, manager | branch staff, roles, academy/cert status | staff invite/update role | server-only or admin RPC required |
| Academy | owner, manager, technician | courses, enrollments, certificates | enrollment/certificate status | Supabase RLS first |
| Finans / Kasa | owner, manager, reception, cashier | finance transactions, payment status, royalty | payment record, day close | server-only when payment provider exists |
| Stok & Cihaz | owner, manager, technician | equipment assets, calibration, consumables | update calibration/service status | Supabase RLS first |
| Kalite & Sikayet | owner, manager | complaints, quality audits/findings, CAPA | create/update finding, response note | Supabase RLS first; notifications via Edge Function |
| Merkez Talepleri | all branch roles | support tickets/messages | create ticket, reply | Supabase RLS first |
| Sube Ayarlari | owner, manager | branch profile, policies, service scope | update branch settings | manager-only RLS/RPC |

## First Mobile Branch Contracts

### Current User

Read:

- `app_users`

Required fields:

- `id`
- `auth_user_id`
- `branch_id`
- `full_name`
- `email`
- `phone`
- `role`
- `is_active`

Acceptance:

- inactive users cannot enter live flows,
- missing `app_users` row fails closed,
- role mapping is stable across Flutter, Expo and database policies.

### Work Order List

Read:

- `expertise_cases`
- nested `vehicles`
- nested `package_plans`
- nested `customers`
- `technician_start_evidence`
- `inspection_tasks`

Current filters:

- active statuses: `DRAFT`, `ASSIGNED`, `CLAIMED`, `START_EVIDENCE_REQUIRED`, `TECHNICAL_ENTRY_OPEN`, `SUBMITTED`, `MANAGER_REVIEW`, `REPORT_GATE_BLOCKED`, `REPORT_GATE_READY`, `APPROVED`
- ordered by `opened_at desc`

Acceptance:

- branch users see only their branch work orders,
- technicians see assignable/owned task work orders,
- HQ/quality users can read according to final role matrix.

### Work Order Create

RPC:

- `create_branch_work_order`

Inputs:

- customer full name, phone, email, identity number, role,
- vehicle plate, VIN, brand, model, year, fuel type, transmission, kilometers, seller type, arrival note,
- package type,
- work order notes.

Acceptance:

- creates or links customer and vehicle,
- creates `expertise_cases`,
- creates initial `inspection_tasks`,
- returns new expertise case id,
- works only for branch-operating roles.

### Task Ownership

RPCs:

- `list_branch_technicians`
- `claim_inspection_task`
- `release_inspection_task`
- `manager_assign_inspection_task`
- `manager_clear_inspection_task_owner`
- `submit_inspection_task`

Acceptance:

- technician cannot mutate another technician's owned task unless policy/RPC allows it,
- manager actions require branch manager/HQ role,
- release and manager assignment require reason text,
- submit blocks when required evidence/answers are incomplete.

### Start Evidence

Tables:

- `technician_start_evidence`
- `expertise_cases`
- `inspection_tasks`

Current completion rule from Flutter:

- VIN must be 17 characters,
- VIN photo required,
- plate photo required,
- odometer value required,
- odometer photo required.

Acceptance:

- incomplete start evidence keeps case in `START_EVIDENCE_REQUIRED`,
- complete start evidence moves case to `TECHNICAL_ENTRY_OPEN`,
- unowned locked/assigned tasks can become `AVAILABLE` after start evidence.

### Report Template And Answer Entry

Tables:

- `report_templates`
- `report_template_groups`
- `report_template_items`
- `report_template_item_options`
- `report_template_item_inputs`
- `work_order_report_answers`
- `work_order_group_status`

RPCs:

- `save_work_order_report_answer`
- `lock_work_order_report_item`
- `unlock_work_order_report_item`
- `recalculate_work_order_group_status`

Acceptance:

- active template is loaded by latest active `report_templates` record,
- answer save recalculates group status,
- item lock prevents conflicting edit,
- image URLs are references only; upload policy must authorize the user.

### Evidence Upload

Storage:

- default bucket: `report-media`
- path pattern: `work-orders/{workOrderId}/report/{itemId}/{timestamp}.{ext}`

Tables:

- `inspection_evidence_assets`

Acceptance:

- storage insert/select policies match branch/task ownership,
- local fallback is allowed only for non-live/demo mode,
- live report finalization must require uploaded evidence where catalog says required.

### Final Report

Tables:

- `final_reports`
- `report_audit_logs`
- `report_gate_issues`
- `report_delivery_events`
- `report_revisions`

Current mobile table operations:

- fetch latest final report,
- upsert draft,
- lock final report when local gate says complete.

Acceptance:

- final report cannot lock with missing required answers/evidence,
- manager/quality approval status is explicit,
- delivery/QR/public verification is separate from draft save,
- PDF/rendering contract is not assumed to be solved by mobile client.

## Expo Technician Contracts

Current live app uses:

- password login through `/auth/v1/token`,
- REST under `/rest/v1`,
- Realtime websocket under `/realtime/v1/websocket`.

Tables:

- `expertise_cases`
- `inspection_tasks`
- `inspection_evidence_assets`
- `work_order_report_answers`
- `work_order_group_status`
- `final_reports`

RPCs:

- `claim_inspection_task`
- `submit_inspection_task`
- `save_work_order_report_answer`

Acceptance:

- `EXPO_PUBLIC_OTOTR_SUPABASE_URL` and `EXPO_PUBLIC_OTOTR_SUPABASE_KEY` are required,
- no public fallback URL/key is allowed,
- Realtime subscription must be covered by RLS and publication rules before staging/live use.

## Server-Only API Needed Later

Do not implement these in mobile/browser clients:

- payment provider callback,
- WhatsApp/SMS/email provider calls,
- report PDF generation with private templates or storage signing,
- admin bulk data repair,
- branch staff invite if service role is required,
- public report verification when service-role lookup is needed,
- production data export/import.

## Gap Check

| Gap | Impact | Next Action |
| --- | --- | --- |
| Local Supabase stack is not running | Cannot prove migrations/RLS/RPCs locally in this thread | WSL, Docker and Supabase CLI now respond; `supabase start` timed out before creating `supabase_db_ototr-local`. See `docs/backend-local-readiness.md` |
| Dedicated local unit tests for `public-api` Edge Function are not present | Function internals are not unit-tested without Deno/local tooling | Read-only staging smoke test added as `npm.cmd run test:public-api`; add Deno/Supabase local tests when tooling is available |
| Bayi portal is static demo data | UI can drift from backend contracts | Connect one screen at a time after contract approval |
| Manager approval/revision functions are not wired in app code | Report review flow may be incomplete | Existing `approve_expertise_case` and `request_expertise_case_revision` functions need grant/security review and app wiring before live manager screen |
| Finance/payment integration is not modeled as a provider contract | Payment/royalty cannot be production-ready | Keep finance UI mock until provider/webhook contract is chosen |
| Storage policy for `report-media` needs verification | Evidence upload/final report gates may fail in live use | Checklist added to `packages/database/rls-verification-checklist.sql`; still requires local/staging execution |
| Role naming differs across docs, SQL and app mappings | RLS mistakes can expose or block data | Canonical product/database role mapping added to `packages/shared/src/erp-contracts.ts`; app code still needs later adoption |

## Completion Rule For This Phase

This phase is complete when:

- contracts are documented,
- API plan links to this contract,
- no secret values are added,
- no destructive database command is run,
- gap list is explicit for the next implementation phase.
