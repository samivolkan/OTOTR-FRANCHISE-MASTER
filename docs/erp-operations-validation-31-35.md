# OTOTR ERP Operations - Steps 31-35 Validation And Release Plan

Date: 2026-06-03
Scope: Thread 14 - OTOTR ERP / Tum Operasyon Yonetimi

This document executes steps 31-35 after the ERP implementation map. It prepares the database, RLS, seed, validation and release controls needed before wiring live ERP behavior.

## Completed Scope

| # | Action | Output |
| ---: | --- | --- |
| 31 | Reviewed migration readiness checklist | ERP contract-based migration readiness checklist defined. |
| 32 | RLS role-test matrix | Role-by-role access expectations defined for global, region, branch, technician and public sessions. |
| 33 | Local/staging validation runbook | Current local blocker captured; safe local/staging command order defined. |
| 34 | Deterministic seed strategy | One branch, one appointment, one work order and one technician seed model defined. |
| 35 | Release/rollback checklist | ERP MVP slice release gates and rollback plan defined. |

## 31. Reviewed Migration Readiness Checklist

Before any ERP operation flow is treated as live-ready, the reviewed migration chain must cover these contracts:

| Area | Required tables/functions | Ready when |
| --- | --- | --- |
| Identity and scope | `app_users`, `branches`, `user_region_assignments` where applicable | Role lookup and branch/region scope are tested. |
| CRM/appointment | `customers`, `vehicles`, `appointments` | Appointment can be read and converted only by allowed role/scope. |
| Work order core | `expertise_cases`, `inspection_tasks` | Work order creation produces expected task rows. |
| Evidence | `technician_start_evidence`, `inspection_evidence_assets`, storage bucket/policies | Required evidence can be uploaded/read by assigned actor only. |
| Report answers | `work_order_report_answers`, `work_order_report_files`, `work_order_group_status` | Task answer save/lock/unlock works through reviewed RPCs. |
| Quality gates | `report_gate_issues`, `report_revisions`, `report_audit_logs` | Gate issue and manager return states are auditable. |
| Final reports | `final_reports`, `report_delivery_events` | Final report cannot publish before required gates. |
| Finance | `finance_transactions` or reviewed equivalent | Payment/delivery and royalty state have a canonical source. |
| Support/quality | `quality_audits`, `quality_findings`, `support_tickets` | Branch quality/support actions are branch-scoped. |
| RPCs | `create_branch_work_order`, task claim/submit, report save/lock/unlock, `list_branch_technicians` | Function grants and RLS behavior pass role tests. |

### Migration Readiness Gates

| Gate | Pass condition |
| --- | --- |
| SQL order | Reviewed migrations apply from empty local database without manual intervention. |
| Manual-only safety | `manual-only` and cleanup/demo SQL are not in automatic chain. |
| RLS enabled | All sensitive app tables have RLS enabled. |
| Function grants | `anon` cannot execute authenticated-only ERP RPCs. |
| Search path | SECURITY DEFINER functions have explicit `search_path`. |
| Storage | Report/evidence bucket policy is scoped by actor and branch/task/report. |
| App contract | Tables/RPCs used by Flutter, Expo and admin prototype exist with expected names. |
| Metadata verification | `packages/database/expected-contract-verification.sql` returns no missing required objects. |

## 32. RLS Role-Test Matrix

These are the required test scenarios once local/staging auth users are available.

| Role/session | Must be able to read | Must be able to mutate | Must be blocked from |
| --- | --- | --- | --- |
| CEO | All branches, cases, finance summaries, quality alerts | Approved HQ/admin actions | Service-role-only internals from client |
| HQ admin | All operational data | Admin/HQ actions with audit | Unsafe direct destructive operations |
| Region manager | Assigned region branches and cases | Region-scoped operational follow-up | Other regions |
| Franchise manager | Franchise pipeline, opening projects, candidate records | Application stages and opening tasks | Technical report findings |
| Branch owner | Own branch dashboard, finance, staff, quality | Own branch non-technical actions | Other branches |
| Branch manager | Own branch appointments, work orders, tasks, gates | Assign/return/approve work orders | Other branches; service role actions |
| Reception staff | Own branch appointments, intake, delivery | Appointment/intake/delivery updates | Technical findings and HQ finance |
| Technician | Assigned tasks, own work orders, required evidence | Claim/submit assigned tasks and evidence | Unassigned work orders, finance, other branches |
| Finance | Finance/cashbox/royalty records in allowed scope | Payment/royalty status through audited RPC | Technical report mutation |
| Quality | Quality findings, gate issues, report risk | Quality audit/finding updates | Payment provider secrets |
| Support | Assigned support tickets/messages | Ticket updates and escalation | Private finance unless scoped |
| Public report viewer | Verified public report output only | None except public form submissions | Internal report/work order tables |

### RLS Smoke Assertions

| Assertion | Expected result |
| --- | --- |
| Branch A manager reads Branch B work order | Blocked |
| Technician reads unassigned task | Blocked |
| Technician updates assigned task status | Allowed through RPC |
| Reception converts own branch appointment | Allowed through RPC |
| Public anon calls work-order RPC | Blocked |
| Authenticated user calls report verification public endpoint | Not required; public endpoint controls its own path |
| Finance user edits technical report answer | Blocked |
| Quality user reads missing evidence/gate issues | Allowed in quality scope |
| CEO sees all branch dashboards | Allowed |
| Region manager sees unassigned region | Blocked |

## 33. Local/Staging Validation Runbook

### Current Local Blocker

Local Supabase validation is still blocked until Docker Desktop Linux engine and WSL/Virtual Machine Platform are healthy. Do not represent the reviewed chain as runtime-validated until `supabase db reset` succeeds.

### Local Validation Order

Run only after Docker/WSL are healthy:

```powershell
cd C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER
npx.cmd supabase --version
npx.cmd supabase start
npx.cmd supabase migration list
npx.cmd supabase db reset
```

After reset succeeds:

```powershell
psql "<LOCAL_DATABASE_URL>" -f packages\database\expected-contract-verification.sql
psql "<LOCAL_DATABASE_URL>" -f packages\database\rls-verification-checklist.sql
```

Then run app checks:

```powershell
cd C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER\apps\admin\prototype
node tools\test-demo-data.mjs
node tools\test-vin-service.mjs
node tools\test-index.mjs
```

```powershell
cd C:\ototr_master\apps\mobile-branch
flutter analyze
flutter test
```

```powershell
cd C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER\apps\mobile-technician
npm.cmd run typecheck
```

### Staging Validation Order

Staging requires explicit approval and approved credentials.

| Stage | Action |
| --- | --- |
| 1 | Confirm staging project id and backup/export plan. |
| 2 | Confirm no production credentials are used. |
| 3 | Apply only reviewed migrations. |
| 4 | Run metadata verification SQL. |
| 5 | Create test auth users and deterministic smoke data. |
| 6 | Run RLS role matrix. |
| 7 | Run app smoke tests against staging env. |
| 8 | Record exact results in `TEST_RESULTS.md` and `MIGRATION_LOG.md`. |

Blocked without approval:

- `supabase db push`,
- `supabase db reset --linked`,
- production/staging destructive cleanup,
- service-role use from browser/mobile.

## 34. Deterministic Seed Strategy

Existing template:

- `supabase/seeds/local_smoke_seed.template.sql`

Required deterministic smoke dataset:

| Object | Identifier | Purpose |
| --- | --- | --- |
| Branch | `LOCAL-IST-001` | Branch-scope tests |
| CEO user | `local.ceo@ototr.test` | Global read test |
| Branch manager | `local.manager@ototr.test` | Branch operations test |
| Technician | `local.technician@ototr.test` | Assigned task test |
| Customer | `local.customer@ototr.test` | Appointment/work order customer |
| Vehicle | `34LOCAL01` | Vehicle intake and report identity |
| Appointment | `LOCAL-APT-001` or generated uuid with stable notes marker | Appointment conversion test |
| Package | Existing reviewed package or `LOCAL_SMOKE_PACKAGE` | Task expansion and duration |
| Work order | created through `create_branch_work_order` RPC | Avoid direct bypass of business logic |
| Report template | `local_template_v1` | Report answer/gate test |

### Seed Rules

- No `delete`, `truncate` or `drop`.
- Use deterministic codes/emails/plates and `on conflict` upserts.
- Work order should be created through reviewed RPC after local auth session exists.
- Auth user UUIDs must be supplied as variables, never hardcoded as production-like accounts.
- Seed must remain local/staging only.
- Public report records for verification tests must not expose real customer data.

### Minimum Smoke Flow

1. Create local auth users.
2. Insert branch, app users, customer, vehicle, package and report template.
3. Create appointment.
4. Convert appointment to work order through RPC.
5. Claim technician task.
6. Save one report answer.
7. Add one evidence item.
8. Submit task.
9. Manager approves or returns.
10. Verify report gate state and RLS access.

## 35. Release/Rollback Checklist

### ERP MVP Slice Release Gates

| Gate | Required evidence |
| --- | --- |
| Scope | Slice states exactly which screens, tables, RPCs and roles are touched. |
| Tests | Relevant app tests pass. |
| Database | Migration chain applies in local/staging and metadata verification passes. |
| RLS | Role matrix smoke passes for affected roles. |
| Secrets | No service-role or real env values in app/browser/mobile code. |
| Demo data | Demo/mock/seed data cannot flow into production. |
| Visual QA | Desktop/mobile screenshots for touched UI surfaces. |
| Audit | Mutations create audit records where required. |
| Rollback | Revert path is written before staging/prod application. |
| Logs | `MIGRATION_LOG.md` and `TEST_RESULTS.md` are updated. |

### Rollback Plan Template

For every MVP slice:

| Item | Required value |
| --- | --- |
| Slice name | Example: branch appointment conversion |
| Files changed | Exact paths |
| Database migrations | Exact migration filenames |
| Feature flag/env | How to disable if needed |
| Data rollback | Whether data change is reversible; if not, remediation plan |
| App rollback | Commit/revert or deployment rollback method |
| Validation after rollback | Commands and checks |
| Owner approval | User/HQ approval before production |

### High-Risk Operations That Need Explicit Approval

- Production database migration.
- Any destructive SQL.
- Running manual-only SQL.
- Linking local CLI to staging/production.
- Adding service-role or private credentials.
- Payment provider integration.
- Bulk import/export of customer data.
- Public report exposure changes.

## Output Summary

Steps 31-35 are planning/validation controls. No database command was executed and no runtime app behavior changed.

## Next Recommended Block: 36-40

| # | Action |
| ---: | --- |
| 36 | Define first MVP demo slice from lead/appointment to work order. |
| 37 | Define desktop/mobile visual QA checklist for ERP screens. |
| 38 | Define end-to-end smoke test scenario for branch manager and technician. |
| 39 | Define security review checklist for ERP MVP. |
| 40 | Prepare first controlled release candidate checklist. |
