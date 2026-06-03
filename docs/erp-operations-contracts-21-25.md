# OTOTR ERP Operations - Steps 21-25 Contracts

Date: 2026-06-03
Scope: Thread 14 - OTOTR ERP / Tum Operasyon Yonetimi

This document executes the next five ERP operations actions after the first 20 planning outputs.

## Completed Scope

| # | Action | Output |
| ---: | --- | --- |
| 21 | Formal API contracts | First mobile/bayi portal ERP API domains and route contracts defined below. |
| 22 | Shared role constants | Shared role, scope, work order, gate and appointment constants added in `packages/shared/src/erp-contracts.ts`. |
| 23 | Branch capacity schema | Capacity entity and calculation model defined below and in shared contracts. |
| 24 | Appointment conversion contract | Appointment to work order conversion rules, request and response contracts defined. |
| 25 | Work order contract alignment | Admin, branch mobile, technician mobile and database expectations mapped to one canonical contract. |

## 21. Formal API Contracts

Backend layering stays unchanged:

1. Supabase/Postgres and RLS are the first data boundary.
2. Reviewed RPCs are preferred for branch/mobile operational mutations.
3. Supabase Edge Functions are used for public or server-only flows.
4. `apps/api` remains reserved until a dedicated long-running API server is justified.

### Auth / Current User Scope

| Field | Contract |
| --- | --- |
| `userId` | Auth user id |
| `role` | One of shared `OTOTR_ROLES` |
| `branchId` | Required for branch and technician scoped users |
| `regionId` | Required for region managers |
| `permissions` | Derived from role/scope, never trusted from client payload |

### Branch Dashboard

| Route shape | Backend |
| --- | --- |
| `GET /branches/:branchId/dashboard` | Supabase read/RPC first |

Required response sections:

- branch identity,
- today appointments,
- open work orders,
- technician load,
- missing evidence,
- manager approval queue,
- cashbox/payment state,
- quality/support alerts.

### Appointments

| Route shape | Backend | Notes |
| --- | --- | --- |
| `GET /branches/:branchId/appointments` | Supabase/RLS | Branch-scoped calendar/list |
| `POST /branches/:branchId/appointments` | Supabase/RLS or RPC | Internal branch-created appointment |
| `PATCH /appointments/:appointmentId/status` | RPC preferred | Status transitions audited |
| `POST /appointments/:appointmentId/convert` | RPC preferred | Creates or links work order |

### Work Orders

| Route shape | Backend | Notes |
| --- | --- | --- |
| `GET /branches/:branchId/work-orders` | Supabase/RLS | Branch users see own branch |
| `GET /work-orders/:workOrderId` | Supabase/RLS | Technician sees assigned tasks only |
| `POST /branches/:branchId/work-orders` | Existing reviewed RPC first | Creates expertise case and tasks |
| `PATCH /work-orders/:workOrderId/status` | RPC preferred | Status transition guard |
| `PATCH /work-order-tasks/:taskId/status` | Existing reviewed RPC first | Technician/manager ownership rules |

### Technician Tasks

| Route shape | Backend |
| --- | --- |
| `GET /technicians/me/tasks` | Supabase/RLS or RPC |
| `POST /tasks/:taskId/claim` | RPC |
| `POST /tasks/:taskId/evidence` | RPC/storage policy |
| `POST /tasks/:taskId/submit` | RPC |

### Finance / Quality / Support

| Domain | Backend rule |
| --- | --- |
| Payments | Server-only once payment provider is connected |
| Royalty | Supabase read/RPC first; provider callbacks server-only |
| Quality gates | RPC or database-derived gate checks |
| Support notifications | Server-only if SMS/WhatsApp/email is used |

## 22. Shared Role Constants

Created:

- `packages/shared/README.md`
- `packages/shared/src/erp-contracts.ts`

These contracts are not imported into apps yet. They are the canonical reference for the next refactor stage.

Role groups:

| Group | Roles |
| --- | --- |
| Global | CEO, HQ_ADMIN, ADMIN |
| Regional | REGION_MANAGER |
| Franchise | FRANCHISE_MANAGER |
| Branch | BRANCH_OWNER, BRANCH_MANAGER, RECEPTION_STAFF |
| Technical | TECHNICIAN |
| Back office | FINANCE, QUALITY, SUPPORT |
| Public | CUSTOMER_PUBLIC |

## 23. Branch Capacity Schema

### Capacity Inputs

| Field | Meaning |
| --- | --- |
| `branchId` | Capacity owner branch |
| `workingMinutesPerDay` | Net daily working minutes |
| `liftCount` | Physical lift count |
| `bayCount` | Usable inspection bay count |
| `activeTechnicianCount` | Available technician count |
| `technicianShiftMinutes` | Sum of active technician shift minutes |
| `scheduledPackageMinutes` | Total scheduled package workload |
| `walkInBufferMinutes` | Reserved buffer for non-scheduled arrivals |

### Capacity Outputs

| Field | Formula |
| --- | --- |
| `physicalCapacityMinutes` | `min(liftCount + bayCount, activeTechnicianCount) * workingMinutesPerDay` |
| `technicianCapacityMinutes` | `technicianShiftMinutes` |
| `usableCapacityMinutes` | `min(physicalCapacityMinutes, technicianCapacityMinutes)` |
| `loadMinutes` | `scheduledPackageMinutes + walkInBufferMinutes` |
| `loadRatio` | `loadMinutes / usableCapacityMinutes` |
| `riskLevel` | green under 75%, amber under 95%, red at/over 95% |

## 24. Appointment Conversion Contract

### Allowed Input State

An appointment can convert to a work order only when:

- appointment belongs to the actor branch or allowed global/regional scope,
- appointment is `CONFIRMED`, `ARRIVED` or `INTAKE_STARTED`,
- customer identity and phone are present,
- vehicle plate or VIN is present,
- package is selected or a default intake package is explicitly supplied,
- consent state is recorded.

### Request

```json
{
  "appointmentId": "uuid",
  "branchId": "uuid",
  "packagePlanId": "uuid",
  "assignedTechnicianId": "uuid-or-null",
  "vehicleIntake": {
    "plate": "34ABC123",
    "vin": "optional",
    "mileageKm": 100000
  },
  "consents": {
    "kvkkReady": true,
    "scopeAccepted": true,
    "roadTestAccepted": false
  },
  "notes": "optional"
}
```

### Response

```json
{
  "ok": true,
  "appointmentId": "uuid",
  "expertiseCaseId": "uuid",
  "workOrderNo": "WO-2026-0001",
  "createdTaskCount": 8,
  "nextStatus": "VEHICLE_ACCEPTED"
}
```

### Failure Cases

| Error | Reason |
| --- | --- |
| `SCOPE_DENIED` | Actor cannot access appointment branch |
| `INVALID_APPOINTMENT_STATE` | Appointment cannot be converted yet |
| `MISSING_CUSTOMER` | Customer identity/phone missing |
| `MISSING_VEHICLE` | Vehicle identifier missing |
| `MISSING_PACKAGE` | Package not selected |
| `CONSENT_REQUIRED` | Consent/scope acceptance missing |
| `ALREADY_CONVERTED` | Work order already exists |

## 25. Work Order Contract Alignment

| Contract area | Admin prototype | Flutter branch app | Expo technician app | Database/RPC |
| --- | --- | --- | --- | --- |
| Identity | `dealer_work_orders`, work order views | `WorkOrder.id`, `number` | `LiveWorkOrder.workOrderNo` | `expertise_cases.work_order_no` |
| Customer | Demo/customer panels | `Customer` model | `LiveCustomer` | `customers` |
| Vehicle | VIN and intake panels | `Vehicle` model | `LiveVehicle` | `vehicles` |
| Package | Package and finance widgets | `PackagePlan` | `packageName`, `durationMinutes` | `package_plans` |
| Tasks | Dealer API model | `WorkOrderTask` | `LiveTask` | `inspection_tasks` |
| Evidence | Quality/report widgets | `PhotoEvidence` | `LiveEvidence` | `inspection_evidence_assets`, report files |
| Gates | Report/quality views | `operationGates`, `reportPrintGateReady` | `gates` subset | report gate functions/tables |
| Final report | ERP report outputs | report/final preview | final review draft | `final_reports`, delivery/audit tables |
| Audit | ERP audit/history | `AuditLog` | live status actions | `audit_events`, `report_audit_logs` |

### Canonical Gate Set

The shared gate list is:

1. `APPOINTMENT_READY`
2. `VEHICLE_INTAKE_READY`
3. `CUSTOMER_CONSENT_READY`
4. `PACKAGE_APPROVED`
5. `TECHNICAL_ASSIGNMENT_READY`
6. `TECHNICIAN_START_EVIDENCE_READY`
7. `INSPECTION_MODULES_READY`
8. `REQUIRED_PHOTOS_READY`
9. `EXTERNAL_QUERIES_READY`
10. `QUALITY_APPROVED`
11. `REPORT_PRINTED`
12. `PAYMENT_COMPLETED`
13. `HANDOVER_APPROVED`
14. `DELIVERY_READY`

## Implementation Guardrails

- Do not import the shared TypeScript constants into Flutter directly.
- Use the shared file as naming/source-of-truth until a generated cross-platform contract step is planned.
- Do not add service-role logic to browser or mobile apps.
- Do not change live Supabase behavior until local/staging validation is available.
- Keep appointment conversion as RPC-first because it creates linked customer, vehicle, expertise case, tasks, evidence gates and audit entries.

## Next Recommended Block: 26-30

| # | Action |
| ---: | --- |
| 26 | Add admin module extraction inventory from `apps/admin/prototype/index.html`. |
| 27 | Create branch portal live data binding map against the shared work order contract. |
| 28 | Map technician task integration to shared task/gate constants. |
| 29 | Define quality gate enforcement RPC/app responsibilities. |
| 30 | Define finance/royalty screen data contract and payment-provider boundary. |
