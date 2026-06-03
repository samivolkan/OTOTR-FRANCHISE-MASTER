# Source Documentation Import Plan

Plan date: 2026-06-03
Source folder: `C:\Users\Samivolkannnn\Documents\ototr_25052026\docs`

No source documentation was copied during this phase. This file defines import priority.

## Import Priority A - Canonical Business / Architecture

Copy or merge these first after manual read-through:

- `bayi-portali-canli-sistem-blueprint.md`
- `data-model.md`
- `ekspertiz-data-backbone-v1.md`
- `erp-crm-roadmap.md`
- `sprint-1-backlog.md`
- `calisma-duzeni.md`

Target locations:

- `docs/franchise-model.md`
- `docs/database.md`
- `docs/architecture.md`
- `docs/business-rules.md`

## Import Priority B - Mobile / Operational App Planning

- `bayi-usta-rapor-giris-mvp.md`
- `ototr-android-mobile-roadmap.md`
- `ototr-android-technician-mvp-plan.md`
- `ototr-flutter-report-backbone-implementation-plan.md`
- `dealer-staff-task-management-plan.md`

Target locations:

- `docs/mobile-branch-app.md`
- `docs/mobile-technician-app.md`
- `docs/operations-workflows.md`

Mobile code import boundaries are tracked separately in `docs/mobile-import-plan.md`.

## Import Priority C - Academy / Growth / Marketing

- `academy-content-roadmap.md`
- `academy-full-content-v1.md`
- `academy-operations-backlog.md`
- `google-business-profile-aksiyon-plani.md`
- `ototr-yol-haritasi-otomasyon.md`

Target locations:

- `docs/academy.md`
- `docs/growth-marketing.md`

## Import Priority D - Design / Visual References

Keep as references, do not mix into source architecture docs automatically:

- `ekspertiz-design-preview.html`
- `ekspertiz-pdf-report-preview.html`
- `ototr-ekspertiz-pdf-preview.pdf`
- `ototr-ekspertiz-pdf-preview-page1.png`
- `ototr-ekspertiz-pdf-preview-kaporta-list.png`
- `ototr-report-design-route-preview.png`
- `1000km-garanti.png`
- `ototr-guarantee-seal.png`
- `airbag-srs-kontrol.png`
- `kaporta-boya-harita.png`
- `obd-module-map.png`
- `ototr-favicon.svg`

Target locations:

- `archive/old-notes/design-references.md` first.
- Later, selected assets can move to app asset folders after license/usage review.

## Import Priority E - Recovery / Historical Reference

- `ALL.docx`
- `recovered-sources.md`
- `ototr-quality-gate-latest.json`
- `inspection_schema_report.md`
- `inspection_ui_behavior.md`

These are important but should not overwrite canonical docs without review.

## Proposed Next Copy Step

For the next phase, copy only Priority A markdown files into `archive/old-notes/imported-docs-priority-a/` or merge their content into canonical docs.

Recommended safer approach:

1. Copy Priority A originals into a dated reference folder.
2. Update canonical docs with distilled decisions only.
3. Log the source and target paths in `MIGRATION_LOG.md`.

## Import Status

Completed on 2026-06-03:

- Priority A originals copied to `archive/old-notes/imported-docs-priority-a-2026-06-03/`.
- Canonical docs updated with distilled decisions:
  - `docs/business-rules.md`
  - `docs/architecture.md`
  - `docs/database.md`
  - `docs/franchise-model.md`

## Open Questions

- Should `ALL.docx` remain the business master book, or should its accepted decisions be extracted into markdown?
- Should the static ERP/CRM prototype remain a web app, or become only a reference while a new admin app is built?
- Should Flutter branch app and Expo technician app both continue, or should one mobile technology be selected?
