# Franchise Model

Source reference:

- `archive/old-notes/imported-docs-priority-a-2026-06-03/bayi-portali-canli-sistem-blueprint.md`

## Product Split

OTOTR franchise operations must be split into three main product surfaces:

- HQ ERP for network control.
- Branch portal for daily branch operation.
- Public web/report surfaces for leads, customers and verification.

Suggested future domains:

- `erp.ototr.com.tr`
- `bayi.ototr.com.tr`
- `ototr.com.tr`
- `rapor.ototr.com.tr`

## Main Lifecycle 1 - Franchise Application

Flow:

1. public web form or sales lead,
2. lead record,
3. candidate scoring,
4. franchise application,
5. location and feasibility,
6. finance approval,
7. legal contract,
8. Academy assignment,
9. setup/opening file.

Candidate score inputs:

- investment budget,
- location,
- operator experience,
- brand fit,
- financial strength,
- who will operate the branch.

## Main Lifecycle 2 - Branch Setup

Opening project should track:

- signage and architecture standards,
- lifts and expertise equipment,
- measurement devices and consumables,
- camera and internet infrastructure,
- POS/cash/e-invoice readiness,
- Google Business Profile,
- staff plan,
- Academy training package,
- launch marketing,
- pre-opening quality audit.

## Main Lifecycle 3 - Daily Operation

The branch portal must cover:

- daily dashboard,
- appointments,
- work orders,
- staff tasks,
- vehicle intake,
- technician workflow,
- evidence and photo capture,
- report quality gates,
- report delivery,
- customer follow-up,
- finance and payment state,
- quality and support actions.

## Required Branch Portal Rule

The branch portal must not behave like a filtered HQ screen. It needs its own daily operational workflow and branch-scoped permissions.

## Canonical Franchise Objects

- lead,
- franchise application,
- application step,
- branch opening project,
- branch,
- branch user,
- branch document,
- contract,
- equipment asset,
- training assignment,
- quality audit,
- work order,
- report,
- finance transaction,
- support ticket,
- audit event.
