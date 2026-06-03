# OTOTR ERP Operations - Steps 26-30 Implementation Map

Date: 2026-06-03
Scope: Thread 14 - OTOTR ERP / Tum Operasyon Yonetimi

This document executes the 26-30 block after the first shared ERP contracts. It maps the existing prototype screens and mobile flows to implementation responsibilities without changing runtime behavior.

## Completed Scope

| # | Action | Output |
| ---: | --- | --- |
| 26 | Admin module extraction inventory | Existing prototype modules grouped by future extract order. |
| 27 | Branch portal live data binding map | Bayi portal screens mapped to shared contracts and backend sources. |
| 28 | Technician task integration map | Technician mobile flow mapped to task/gate/evidence contracts. |
| 29 | Quality gate enforcement responsibilities | App, RPC, RLS and manager responsibilities separated. |
| 30 | Finance/royalty screen data contract | Finance/royalty model and payment-provider boundary defined. |

## 26. Admin Module Extraction Inventory

Current state:

- `apps/admin/prototype/index.html` remains the preserved large ERP prototype.
- `apps/admin/prototype/src` contains extractable service/data signals.
- `apps/admin/prototype/bayi-portal/index.html` is already a separate branch operations prototype.

Safe extraction order:

| Order | Extract module | Source signals | Test required |
| ---: | --- | --- | --- |
| 1 | Demo data and mock backend | `src/data/demo`, localStorage flows | `node tools/test-demo-data.mjs` |
| 2 | KPI/alert/legal services | `src/services/kpiService.js`, `alertService.js`, `legalService.js` | `node tools/test-index.mjs` |
| 3 | VIN service | `src/services/vinService.js` | `node tools/test-vin-service.mjs` |
| 4 | Dealer/branch portal API model | `src/dealer-portal-api-model.js` | admin smoke + branch portal smoke |
| 5 | HQ cockpit pages | CEO cockpit, branch ranking, alerts | visual smoke |
| 6 | Operations pages | appointment, work order, capacity, bottleneck widgets | admin smoke |
| 7 | Finance/royalty pages | revenue, royalty, disputes, branch finance rows | finance contract check |
| 8 | Quality/crisis pages | quality alerts, complaints, report risk | quality gate contract check |
| 9 | Franchise pipeline pages | lead/application/opening project | CRM/franchise contract check |
| 10 | Shared UI components | cards, tables, filters, nav, badges | visual desktop/mobile QA |

Do not extract visual components first. The current prototype mixes business behavior, demo data and UI, so service/data extraction must lead.

## 27. Branch Portal Live Data Binding Map

Existing branch portal screens:

- dashboard,
- appointments,
- work orders,
- technician,
- approvals,
- reports,
- delivery,
- customers,
- staff,
- academy,
- finance,
- assets,
- quality,
- support,
- settings.

### Screen To Contract Map

| Branch screen | Shared/API contract | Backend source |
| --- | --- | --- |
| Dashboard | branch dashboard, capacity snapshot, alerts | Supabase read/RPC |
| Appointments | appointment list/status/convert | `appointments`, conversion RPC |
| Work orders | work order list/detail/status/gates | `expertise_cases`, `inspection_tasks`, RPCs |
| Technician | assigned tasks, evidence state, progress | `inspection_tasks`, `inspection_evidence_assets` |
| Approvals | manager review, return reason, quality approval | gate RPC or status update RPC |
| Reports | final report status, revision, print lock | `final_reports`, report gate tables |
| Delivery | payment, handover, QR/delivery event | `report_delivery_events`, finance state |
| Customers | customer/vehicle/consent summary | `customers`, `vehicles`, consent events |
| Staff | staff, role, shift, active/passive | `app_users`, future HR/staff table |
| Academy | assignment/certificate locks | academy tables |
| Finance | cashbox, payment, royalty, dispute | finance transactions, royalty records |
| Assets | equipment, calibration, consumables | branch equipment/assets |
| Quality | complaints, audit findings, missing evidence | quality findings, support/complaints |
| Support | ticket list/messages/escalation | support tickets/messages |
| Settings | branch profile, hours, capacity | branches, capacity config |

### Binding Rules

1. Every branch screen reads through actor scope: branch users only their branch.
2. Technician role sees only dashboard + own technician tasks + relevant report/evidence surfaces.
3. Cashier role sees finance/cashbox and delivery/payment readiness, not technical findings.
4. Manager approval must use a server/RPC transition, not direct client-side field edits.
5. Local demo data remains valid for prototype only; live binding must be behind explicit environment config.

## 28. Technician Task Integration Map

Current Expo technician app uses:

- `/auth/v1/token`,
- `/rest/v1/expertise_cases`,
- `/rest/v1/inspection_tasks`,
- `/rest/v1/inspection_evidence_assets`,
- `/rest/v1/work_order_report_answers`,
- `/rest/v1/final_reports`,
- RPCs: `claim_inspection_task`, `submit_inspection_task`, `save_work_order_report_answer`.

### Technician Flow Contract

| Step | App action | Backend responsibility | Shared contract |
| --- | --- | --- | --- |
| Login | email/password sign-in | Supabase auth and RLS scope | role `TECHNICIAN` |
| List jobs | fetch live work orders | return only assigned/open tasks | `WORK_ORDER_STATUS` |
| Claim task | claim button/action | lock task ownership | `WORK_ORDER_TASK_STATUS.IN_PROGRESS` |
| Save technical answer | body/paint or module answer | save answer and audit actor | report answer contract |
| Add evidence | upload or synthetic evidence marker | storage/RLS or RPC validates task scope | evidence requirement |
| Submit task | submit final task data | status change + group recalculation | `WORK_ORDER_TASK_STATUS.COMPLETED` |
| Final review | submit inspection complete | move case to manager review | `WORK_ORDER_STATUS.MANAGER_REVIEW` |
| Realtime refresh | websocket changes | update list and badges | realtime tables |

### Integration Controls

- Technician app must never receive service-role credentials.
- REST string paths must stay aligned with reviewed migration table names.
- Task status vocabulary must be normalized before cross-app binding.
- Evidence quality status must be visible to technician and manager.
- Manager return must reopen only the returned task/group, not the full work order unless required.

## 29. Quality Gate Enforcement Responsibilities

Quality gates must be enforced in layers:

| Gate group | UI responsibility | RPC/database responsibility | Manager/HQ responsibility |
| --- | --- | --- | --- |
| Vehicle identity | Show VIN/plate mismatch warning | block report gate if identity conflict exists | approve correction path |
| Consent/scope | Prevent progress without visible missing consent state | require consent flags before report gate | resolve exception with audit |
| Required evidence | Show missing photos/files per task | count required evidence before gate ready | return task or approve exception |
| Technical completion | Show module progress | require completed required tasks | review risky findings |
| External queries | Show pending query state | block when required query missing | approve manual override only with reason |
| High-risk findings | Surface second-control requirement | require second approval where configured | complete second control |
| Legal wording | Flag unsafe/unresolved language | keep report draft locked | HQ/quality final review |
| Payment/handover | Show delivery lock | block delivery until payment/handover ready | finance exception handling |

### Gate Owner Model

| Gate | Primary owner | Secondary owner |
| --- | --- | --- |
| Appointment/intake | Reception / branch manager | HQ operations |
| Technical modules | Technician | Branch manager |
| Evidence | Technician | Quality |
| External queries | Reception / system | Branch manager |
| Quality approval | Branch manager | Quality/HQ |
| Payment | Finance/cashier | Branch owner |
| Delivery | Reception | Branch manager |

### Enforcement Rule

UI can display and guide, but final gate readiness must be computed by database/RPC/server logic before report publication or delivery.

## 30. Finance/Royalty Screen Data Contract

### Core Finance Entities

| Entity | Required fields |
| --- | --- |
| Work order payment | `workOrderId`, `branchId`, `amount`, `status`, `method`, `paidAt`, `invoiceStatus` |
| Branch cashbox | `branchId`, `businessDate`, `openingBalance`, `cash`, `pos`, `transfer`, `refunds`, `closingStatus` |
| Royalty record | `branchId`, `period`, `baseRevenue`, `royaltyRate`, `royaltyAmount`, `status`, `dueDate` |
| Royalty dispute | `royaltyId`, `branchId`, `reason`, `evidenceFiles`, `status`, `openedBy`, `resolvedBy` |
| Finance audit | `entityType`, `entityId`, `actorId`, `action`, `before`, `after`, `reason`, `createdAt` |

### Finance Status Vocabulary

| Status | Meaning |
| --- | --- |
| `UNPAID` | Payment required |
| `PARTIAL` | Partial payment received |
| `PAID` | Fully paid |
| `REFUND_REQUESTED` | Refund workflow open |
| `REFUNDED` | Refunded |
| `INVOICED` | Invoice issued |
| `ROYALTY_PENDING` | Royalty not settled |
| `ROYALTY_DELAYED` | Royalty overdue |
| `DISPUTED` | Branch opened dispute |
| `CLOSED` | Finance period/day closed |

### Payment Provider Boundary

| Operation | Client allowed? | Server-only? | Notes |
| --- | --- | --- | --- |
| Show payment state | Yes | No | RLS-scoped read |
| Mark manual cash payment | Branch finance role via RPC | Recommended RPC | Must audit actor/reason |
| Start card/payment provider flow | Yes, via provider-safe public token | Yes for secret callbacks | No provider secret in client |
| Receive provider callback | No | Yes | Edge Function or future API |
| Reconcile royalty | No direct client mutation | Yes/RPC | Finance/HQ only |
| Royalty dispute evidence upload | Yes with scoped policy | Server/RPC final status | Files must link to dispute |

### Delivery Link

Report delivery requires:

1. `REPORT_PRINTED`,
2. `PAYMENT_COMPLETED` or approved finance exception,
3. `HANDOVER_APPROVED`,
4. `report_delivery_events` record,
5. public report verification record where applicable.

## Output Summary

This block does not change app code. It creates the implementation map needed before wiring live data into the admin prototype, branch portal or technician app.

## Next Recommended Block: 31-35

| # | Action |
| ---: | --- |
| 31 | Build reviewed migration chain readiness checklist against ERP contracts. |
| 32 | Build RLS role-test matrix for global, region, branch and technician sessions. |
| 33 | Define local/staging validation runbook for the ERP operation flow. |
| 34 | Define deterministic seed strategy for one branch, one appointment, one work order and one technician. |
| 35 | Define release/rollback checklist for ERP MVP slices. |
