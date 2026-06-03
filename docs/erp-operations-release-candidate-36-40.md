# OTOTR ERP Operations - Steps 36-40 MVP Release Candidate Plan

Date: 2026-06-03
Scope: Thread 14 - OTOTR ERP / Tum Operasyon Yonetimi

This document executes steps 36-40. It turns the ERP operations planning and contracts into the first controlled MVP release-candidate plan.

## Completed Scope

| # | Action | Output |
| ---: | --- | --- |
| 36 | Define first MVP demo slice | First vertical slice selected: appointment to work order to technician task to manager approval to delivery readiness. |
| 37 | Define desktop/mobile visual QA checklist | Visual QA checklist created for admin ERP, branch portal and technician mobile. |
| 38 | Define end-to-end smoke test scenario | Branch manager + technician smoke scenario created. |
| 39 | Define security review checklist | ERP MVP security checklist created for roles, RLS, secrets, public exposure and finance boundaries. |
| 40 | Prepare first controlled release candidate checklist | RC entry/exit gates, rollback and evidence requirements defined. |

## 36. First MVP Demo Slice

### Selected Slice

First controlled MVP slice:

```text
Branch appointment -> vehicle intake -> work order creation -> technician task -> evidence/report answer -> manager review -> report gate -> payment/delivery readiness
```

This is the correct first slice because it touches the real OTOTR operational core without requiring full finance provider integration, full franchise sales automation or production database deployment.

### Included User Roles

| Role | Purpose in slice |
| --- | --- |
| Branch manager | Owns appointment conversion, task assignment, manager approval and return decisions. |
| Reception staff | Owns appointment, vehicle intake, consent and delivery readiness screens. |
| Technician | Owns assigned task, evidence and technical report answer. |
| Finance/cashier | Confirms payment readiness or manual exception in branch context. |
| Quality/HQ viewer | Observes gate issues and audit trail after manager action. |

### Included Surfaces

| Surface | Included in first slice |
| --- | --- |
| Admin ERP prototype | HQ/manager view of branch work order, quality and audit state. |
| Bayi portal | Appointment, work order, technician, approval, report, delivery and finance readiness screens. |
| Flutter branch app | Work order model, gates and manager/technician operational concepts. |
| Expo technician app | Live task list, task claim, evidence and submit/final review flow. |
| Supabase/Postgres | Reviewed migration/RPC contract only; runtime validation waits for local/staging readiness. |

### Out Of Scope For First Slice

| Excluded | Reason |
| --- | --- |
| Payment provider integration | Requires server-only callback and provider credentials. |
| Production database migration | Requires explicit approval, backup and staging pass. |
| Full franchise sales pipeline automation | Separate business lifecycle; not needed for first operations slice. |
| Full report PDF rendering | Gate/delivery readiness can be validated before PDF production. |
| Bulk data import | High risk and unrelated to MVP slice. |

### Acceptance Criteria

The slice is accepted when:

1. branch manager can see the appointment/work order state,
2. appointment conversion contract is represented,
3. technician task and evidence flow is represented,
4. missing gate states are visible,
5. manager approval/return path is defined,
6. payment/delivery readiness is visible,
7. role boundaries are testable,
8. no service-role key appears in browser/mobile code,
9. smoke tests for touched app surfaces pass,
10. rollback path is documented.

## 37. Desktop/Mobile Visual QA Checklist

### Shared Visual QA Rules

| Check | Pass condition |
| --- | --- |
| No horizontal overflow | 390px mobile and desktop widths do not create document-level horizontal scroll. |
| Text containment | Long Turkish labels fit or wrap cleanly inside buttons, cards and tables. |
| Role-specific navigation | Hidden routes are not visible for lower-scope roles. |
| Status visibility | Critical/warning/ready statuses are distinguishable without relying only on color. |
| Gate visibility | Missing gates are obvious and actionable. |
| Dense ERP layout | Operational pages remain scannable; no decorative marketing layout. |
| Touch targets | Mobile buttons and role selectors are usable. |
| Modal/table safety | Tables and panels do not overlap or clip important action buttons. |

### Admin ERP Prototype QA

| Area | Required checks |
| --- | --- |
| CEO cockpit | KPI cards, alerts and branch risk rows render without overlap. |
| Operations pages | Work order, capacity and bottleneck widgets remain readable. |
| Finance/royalty | Revenue, royalty, delayed payment and dispute states are visible. |
| Quality/crisis | Complaint, missing evidence and report-risk alerts are visible. |
| Branch detail | Branch card, manager, region and status remain clear. |
| Smoke | `node tools/test-demo-data.mjs`, `node tools/test-vin-service.mjs`, `node tools/test-index.mjs`. |

### Bayi Portal QA

| Screen | Required checks |
| --- | --- |
| Dashboard | Daily KPIs and role-specific summary cards render. |
| Appointments | Convert-to-work-order action is visible only for allowed roles. |
| Work orders | Status, plate, package, technician and gate states are scannable. |
| Technician | Assigned task list and missing evidence states are visible. |
| Approvals | Manager approve/return actions are clear. |
| Reports | Report gate and revision states are readable. |
| Delivery | Payment, handover and QR/delivery readiness are visible. |
| Finance | Cashbox, payment and royalty states are separated from technical findings. |
| Quality | Complaints, CAPA and missing evidence are visible. |
| Mobile | 390px viewport has no document-level horizontal overflow. |

### Technician Mobile QA

| Screen | Required checks |
| --- | --- |
| Login/live config | Missing env config gives a clear safe error, not a secret leak. |
| Job list | Assigned tasks, plate, package and status are readable. |
| Work order detail | Customer/vehicle/task/gate info fits mobile layout. |
| Task modules | Module progress and evidence count are visible. |
| Evidence | Required/missing evidence states are clear. |
| Final review | Submit/manager-review action is clear and gated. |
| Typecheck | `npm.cmd run typecheck` passes. |

## 38. End-To-End Smoke Test Scenario

### Scenario: Branch Manager And Technician

| Step | Actor | Action | Expected result |
| ---: | --- | --- | --- |
| 1 | Branch manager | Opens branch dashboard. | Own branch data only is visible. |
| 2 | Reception/manager | Opens today's appointments. | Appointment list shows confirmed/arrived state. |
| 3 | Reception/manager | Starts intake. | Customer, vehicle, package and consent are required. |
| 4 | Branch manager | Converts appointment to work order. | Work order/expertise case and task list are created or represented. |
| 5 | Branch manager | Assigns or confirms technician task. | Technician sees assigned task only. |
| 6 | Technician | Claims task. | Task moves to in-progress/claimed state. |
| 7 | Technician | Saves report answer and evidence. | Evidence count and answer state update. |
| 8 | Technician | Submits task. | Task moves to completed/submitted state. |
| 9 | Branch manager | Reviews work order. | Gate list shows complete/missing items. |
| 10 | Branch manager | Approves or returns. | Approved moves toward report gate; returned reopens task with reason. |
| 11 | Finance/cashier | Confirms payment readiness. | Delivery gate can proceed only when allowed. |
| 12 | Reception/manager | Marks handover/delivery readiness. | Delivery event/report readiness is visible. |
| 13 | HQ/quality viewer | Reviews audit/gate result. | Audit trail and quality state are visible without cross-branch leakage. |

### Negative Smoke Tests

| Test | Expected |
| --- | --- |
| Branch A manager opens Branch B work order | blocked |
| Technician opens unassigned task | blocked |
| Public/anon calls work-order RPC | blocked |
| Finance role edits technical report answer | blocked |
| Missing required evidence attempts report gate | blocked |
| Missing payment attempts delivery | blocked unless explicit finance exception exists |
| Browser/mobile config contains service role | fail release |

### Evidence To Capture

| Evidence | Required |
| --- | --- |
| Desktop screenshot | Branch dashboard, work order, approval/report gate |
| Mobile screenshot | Technician task and evidence/final review |
| Test logs | Admin smoke, Flutter analyze/test, Expo typecheck |
| Database verification | Expected contract SQL and RLS checklist after local/staging DB is available |
| Security scan notes | Secret/env/service-role check |

## 39. ERP MVP Security Review Checklist

### Secret And Config

| Check | Pass condition |
| --- | --- |
| No service role in app code | `service_role` is not present in browser/mobile/runtime source. |
| No real env values committed | `.env` ignored; `.env.example` has placeholders only. |
| Public keys only in clients | Browser/mobile use anon/publishable keys only. |
| Edge Functions hold private keys | Service role stays in server-only environment. |

### RLS And Role Scope

| Check | Pass condition |
| --- | --- |
| Branch isolation | Branch users cannot read other branches. |
| Technician ownership | Technicians see only assigned tasks/work orders. |
| Region isolation | Region managers see assigned regions only. |
| Public report isolation | Public viewer sees verified output only, not internal work order data. |
| Finance isolation | Technical roles cannot mutate finance; finance cannot mutate report findings. |

### Public And Customer Data

| Check | Pass condition |
| --- | --- |
| Public forms | Validate input, consent and anti-spam fields server-side. |
| Report verification | Requires report identifier plus verification code or safe equivalent. |
| PII minimization | Public outputs do not expose internal customer or branch private data. |
| Logs | Test logs do not print credentials or private customer datasets. |

### Database And Operations

| Check | Pass condition |
| --- | --- |
| No destructive SQL | No `drop`, `truncate`, cleanup or manual-only file in automatic chain. |
| SECURITY DEFINER safety | Explicit `search_path` and minimum grants. |
| Audit trail | Mutations create actor/time/reason records where required. |
| Storage policies | Evidence/report media scoped by actor/branch/task/report. |
| Payment boundary | Provider secrets and callbacks are server-only. |

## 40. Controlled Release Candidate Checklist

### RC Entry Criteria

| Gate | Required before RC starts |
| --- | --- |
| Scope frozen | First MVP slice paths, screens, roles and backend objects listed. |
| Contracts frozen | Shared constants and app/database contracts reviewed. |
| Environment selected | Local or staging target explicitly chosen. |
| Credentials approved | Only approved staging/local credentials used. |
| Rollback drafted | Rollback/remediation plan written before deployment. |

### RC Exit Criteria

| Gate | Required before RC can be accepted |
| --- | --- |
| App tests | Relevant admin, Flutter and Expo checks pass. |
| Visual QA | Desktop/mobile screenshots pass checklist. |
| RLS tests | Role matrix passes for affected roles. |
| Database verification | Expected tables/functions/policies pass metadata checks. |
| Security review | Secret, public exposure, payment and storage checks pass. |
| Logs updated | `MIGRATION_LOG.md` and `TEST_RESULTS.md` include exact result. |
| Known risks | Remaining blockers are explicit and assigned. |

### Rollback / Remediation

| Failure | Action |
| --- | --- |
| UI regression | Revert touched UI module or restore preserved prototype file. |
| App test failure | Stop release; fix in same surface; rerun relevant test. |
| RLS exposure | Stop release; revoke/patch policy before any wider validation. |
| Migration failure | Stop; capture exact SQL error; do not continue migration chain. |
| Payment/security issue | Disable affected path; keep provider/server-only credentials untouched. |
| Public report exposure issue | Disable public report route or verification record until fixed. |

### RC Package Contents

| Artifact | Required |
| --- | --- |
| Implementation summary | What changed and why |
| Changed files | Exact list |
| Test evidence | Commands and results |
| Screenshots | Desktop/mobile where UI changed |
| Database evidence | Migration/verification result if DB changed |
| Security evidence | Secret/RLS/public exposure notes |
| Rollback plan | Exact revert/remediation instructions |

## Final Status For Steps 1-40

The ERP operations thread now has:

- first 20 operational planning outputs,
- steps 21-25 contracts,
- steps 26-30 implementation map,
- steps 31-35 validation/release controls,
- steps 36-40 first MVP release-candidate plan.

No production database command, destructive SQL, secret output or service-role exposure is part of these outputs.
