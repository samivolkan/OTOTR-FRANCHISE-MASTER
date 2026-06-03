# Business Rules

Source references:

- `archive/old-notes/imported-docs-priority-a-2026-06-03/bayi-portali-canli-sistem-blueprint.md`
- `archive/old-notes/imported-docs-priority-a-2026-06-03/ekspertiz-data-backbone-v1.md`
- `PROJECT_MEMORY.md`

## Product Boundary

OTOTR is not only a record-keeping panel. It is the operating system that protects franchise quality, central control and customer trust.

The product must keep these surfaces separate:

- `OTOTR Genel Merkez ERP`: HQ, franchise pipeline, audit, finance, strategy and network control.
- `OTOTR Bayi Portali`: daily branch operation, staff, work orders, reports, finance and quality actions for one branch.
- `OTOTR Web`: public customer and franchise candidate surface.
- `OTOTR Rapor`: public QR/report verification surface.

## Franchise Application Gates

A franchise candidate cannot advance unless required gates are complete:

- contact and consent are present,
- investment budget is above minimum threshold or finance review is opened,
- location data is complete before feasibility,
- finance approval exists before contract,
- legal approval exists before setup order,
- required Academy assignments are complete before full branch portal authority.

## Branch Opening Gates

A branch cannot go live until:

- equipment and calibration records exist,
- staff are defined,
- Google Business Profile / location readiness is recorded,
- pre-opening quality audit passes,
- portal permissions are activated for the right users.

## Expertise / Report Gates

`expertise_case` is the operational data core. A final report cannot be published when:

- chassis/VIN, plate, motor number and work order identity conflict,
- required evidence is missing,
- processed body/paint points lack photo/proof,
- high-risk findings lack second control where required,
- consent and scope acceptance are missing,
- report language has unresolved legal/quality risk,
- final quality score or gate checks fail.

## Evidence Rules

Evidence can include:

- photo,
- video,
- device screen,
- second technician approval,
- customer/staff signature,
- QR verified external query,
- audit log entry.

Every evidence item must be linked to a work order, task, report, finding or report field.

## Role Scope

Access must stay role-scoped:

- CEO and HQ see global network data.
- Region managers see assigned regions.
- Branch users see only their branch.
- Technicians see assigned tasks/work orders.
- Customer/public report viewers see only verified report output.

## Demo / Production Rule

Demo, seed and cleanup scripts must never be mixed into automatic production migration flow.
