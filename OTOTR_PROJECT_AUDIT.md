# OTOTR Project Audit

Audit date: 2026-06-03
Workspace audited: `C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN`

## Executive Summary

The current workspace folder is effectively empty except for a new Git repository. The meaningful OTOTR work is scattered under `C:\Users\Samivolkannnn\Documents`.

Recommended main baseline: `C:\Users\Samivolkannnn\Documents\ototr_25052026`

Reason: it has the broadest and newest source footprint: Flutter branch app, static ERP/CRM prototype, Supabase/Postgres migration documents, tests, tools, docs, QA artifacts, and the separate `ototr-usta-app`.

No old project files were deleted, moved, or copied during this audit. The new clean target folder is `OTOTR-FRANCHISE-MASTER`.

## Found OTOTR Folders

| Folder | Role / purpose | Current assessment |
| --- | --- | --- |
| `C:\Users\Samivolkannnn\Documents\ototr_25052026` | Main active OTOTR work area. Contains static ERP/CRM demo, Flutter branch operations app, Supabase SQL migrations, docs, tests, screenshots, and React Native/Expo technician app. | Best current baseline. Preserve. |
| `C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN` | Current requested consolidation workspace. Initially empty except `.git`. | New reporting and master workspace. |
| `C:\Users\Samivolkannnn\Documents\ototr_pages_static_deploy` | Static deploy output/docs area. | Archive/reference candidate. Do not use as source of truth. |
| `C:\Users\Samivolkannnn\Documents\_OTOTR_ESKI` | Old/locked copies and local artifact backups. | Archive only. Preserve as reference. |
| `C:\Users\Samivolkannnn\Documents\New project 2` | Older Flutter/branch app attempt. | Archive candidate; compare before reusing. |
| `C:\Users\Samivolkannnn\Documents\New project-push-dealer-cockpit-actions` | Older action-focused branch/dealer variant. | Archive candidate; compare before reusing. |
| `C:\Users\Samivolkannnn\Documents\Codex\2026-05-26\biz-ototr-projesi-i-in-web` | Codex-created work folder candidate. | No strong source markers found in this pass. |

## Technology Inventory

### `ototr_25052026`

- Frontend/static prototype: large `index.html`, older `index2.html`, `index3.html`, `ototr-web.html`, `src/services/*.js`, `src/data/demo/*.js`.
- Mobile branch app: Flutter, project name `ototr_branch_app`, SDK `>=3.3.0 <4.0.0`.
- Flutter dependencies: `supabase_flutter`, `image_picker`.
- Mobile platforms present: Android, web, Windows.
- Separate technician app: `ototr-usta-app`, Expo/React Native, TypeScript, React 19, React Native 0.85, Expo 56.
- Database: Supabase/Postgres SQL files under `docs/migrations` and `data`.
- ORM/migration system: no Prisma schema found; no Supabase CLI project folder found. Migrations are SQL documents/manual migration files.
- Package managers:
  - Flutter/Dart: `pubspec.yaml`, `pubspec.lock`.
  - Node/Expo app: `package.json`.
- Deployment:
  - `.github/workflows/deploy-pages.yml` exists.
  - Static demo can run by opening `index.html`.
- Config/env:
  - No `.env` or `.env.example` found in the scan.
  - Supabase-related references exist in docs/tools/code. Values were not printed in this report.

### Other folders

- `New project 2`: older Flutter branch app shape, with `pubspec.yaml`, SQL/data files, docs, migrations.
- `New project-push-dealer-cockpit-actions`: older Flutter branch app shape, smaller file count and fewer data/docs files.
- `_OTOTR_ESKI`: locked/archived copies, publish-clean folders, local artifacts, APKs.
- `ototr_pages_static_deploy`: static docs/data deployment output.

## Important Files Found

In `ototr_25052026`:

- `README.md`
- `AGENTS.md`
- `index.html`
- `pubspec.yaml`
- `pubspec.lock`
- `analysis_options.yaml`
- `.github/workflows/deploy-pages.yml`
- `lib/core/navigation/app_router.dart`
- `lib/core/navigation/app_routes.dart`
- `lib/data/models/branch_model.dart`
- `lib/data/models/customer_model.dart`
- `lib/data/models/vehicle_model.dart`
- `lib/data/services/auth_service.dart`
- `lib/data/services/branch_service.dart`
- `lib/data/repositories/supabase_branch_work_order_repository.dart`
- `lib/features/dashboard/branch_dashboard_screen.dart`
- `lib/features/branch/branch_kpi_screen.dart`
- `lib/features/branch/branch_settings_screen.dart`
- `lib/features/customer/customer_info_screen.dart`
- `lib/features/vehicle_intake/vehicle_intake_screen.dart`
- `docs/migrations/*.sql`
- `docs/bayi-portali-canli-sistem-blueprint.md`
- `docs/bayi-usta-rapor-giris-mvp.md`
- `docs/data-model.md`
- `docs/erp-crm-roadmap.md`
- `docs/sprint-1-backlog.md`
- `data/inspection_sql_schema.sql`
- `data/inspection_seed.sql`
- `data/inspection_schema_normalized.json`
- `data/inspection_schema_web.js`
- `tools/*.mjs`
- `test/*.dart`
- `ototr-usta-app/package.json`

## Entity Coverage

Detected entities or modules:

- Franchise applications and franchise application steps.
- Branches / bayi / dealer branches.
- App users, roles, user-region assignments.
- Customers.
- Vehicles.
- Appointments.
- Expertise cases.
- Inspection tasks, values, evidence assets.
- Work order report answers/files/status.
- Report templates, final reports, delivery events, audit logs, revisions and gate issues.
- CRM leads, opportunities, activities and tasks.
- Dealer contracts, branch documents, branch onboarding, branch equipment.
- Finance transactions and royalty-like demo logic.
- Quality audits and findings.
- Support tickets and messages.
- Academy courses, enrollments and certificates.
- Dealer announcements.
- Customer consent and web form submissions.
- Audit events.

Missing or weakly defined for a production franchise platform:

- Explicit subscription table.
- Explicit payment provider integration model.
- Full commission model.
- Clear listing/ilan entity for vehicle listings.
- Production-ready auth/session boundary documentation.
- Formal migration runner and environment split.

## Database Inventory

### Base inspection schema

`data/inspection_sql_schema.sql` contains:

- `inspection_groups`
- `inspection_items`
- `inspection_options`
- `inspection_input_fields`
- `inspection_media_requirements`
- `inspection_rules`
- `inspection_reports`
- `inspection_report_answers`
- `inspection_report_answer_media`

### Main Supabase/Postgres migration set

Key migrations under `docs/migrations`:

- `2026-05-24-expertise-report-backbone.sql`: app users, branches, package plans, customers, vehicles, appointments, expertise cases, inspection tasks/values/evidence, report audit/gate/revision/delivery, external query results.
- `2026-05-25-crm-dealer-portal-backbone.sql`: CRM, franchise applications, branch onboarding, documents, contracts, equipment, finance, quality, support, academy, announcements, consent, web forms, audit events.
- `2026-05-25-report-template-system.sql`: report templates, report answers/files, final reports, report media policies.
- Security and RLS follow-ups: private RLS helpers, live safety fixes, security hardening, report delivery policies.

### Database risk notes

- Several migrations contain `drop policy if exists`, `drop trigger if exists`, and constraint replacement. These are common for policy refactors but must be applied only in a reviewed migration order.
- `2026-05-24-demo-seed-expertise-case.sql` contains `delete from` statements for demo cleanup/seed behavior. Do not run against production without review.
- `2026-05-26-remove-demo-work-orders.sql` is intentionally cleanup oriented and must be treated as destructive until verified against a staging copy.
- No Supabase CLI `supabase/migrations` structure was found. Current migration history appears document-based/manual.
- Multiple schema sources exist: `data/inspection_sql_schema.sql`, `data/inspection_schema_web.js`, `data/inspection_schema_normalized.json`, and later report template migrations. These need reconciliation.

## Conflicts and Duplicates

Hash comparisons show similar files are not identical:

- `ototr_25052026\pubspec.yaml` differs from `New project 2\pubspec.yaml`.
- `ototr_25052026\pubspec.yaml` differs from `New project-push-dealer-cockpit-actions\pubspec.yaml`.
- `ototr_25052026\data\inspection_sql_schema.sql` differs from `New project 2\data\inspection_sql_schema.sql`.
- `ototr_25052026\data\inspection_schema_web.js` differs from `New project-push-dealer-cockpit-actions\data\inspection_schema_web.js`.

This means old folders cannot be blindly archived or overwritten; they may contain useful deltas.

## Risky Areas

- Large static `index.html` is about 2.7 MB and likely mixes UI, demo data, and logic.
- `README.md` states the current prototype is `index.html`, while the folder also contains Flutter, migrations, Expo app, tools and tests. Documentation is behind the actual scope.
- Migration files are not in a standard migration runner folder.
- Environment strategy is missing: no `.env.example` found.
- Supabase/auth references exist in code/docs/tools, but no canonical secret handling document exists.
- Build/cache/artifact folders exist inside active folders: `.dart_tool`, `build`, `.codex-screenshots`, `artifacts`, APKs.
- `_OTOTR_ESKI` contains old locked copies and generated artifacts; useful for recovery but not suitable as source of truth.

## What To Preserve

- `ototr_25052026` source files, docs, migrations, tests and tools.
- All SQL migrations under `ototr_25052026\docs\migrations`.
- Flutter app under `ototr_25052026\lib`, `android`, `web`, `test`, `pubspec.*`.
- Static prototype files, especially `index.html`, `src`, `docs`, `tools`.
- `ototr-usta-app` as a separate technician app candidate.
- Old folders only as references until detailed diff review is complete.

## Archive Candidates

- `New project 2`
- `New project-push-dealer-cockpit-actions`
- `ototr_pages_static_deploy`
- `_OTOTR_ESKI`
- Generated active artifacts under `ototr_25052026`: `build`, `.dart_tool`, `.codex-screenshots`, `artifacts`, APK outputs. Do not delete now; exclude from source import.

## Recommended Main Project Folder

Create and use:

`C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER`

Recommended relationship:

- `OTOTR-FRANCHISE-MASTER` becomes the clean planning and future source folder.
- `ototr_25052026` remains the current source baseline until selective import is completed.
- Old folders remain untouched and referenced in `archive/old-projects`.

## Recommended New Architecture

Recommended initial structure:

```text
OTOTR-FRANCHISE-MASTER/
  README.md
  PROJECT_MEMORY.md
  OTOTR_PROJECT_AUDIT.md
  OTOTR_MIGRATION_PLAN.md
  MIGRATION_LOG.md
  docs/
    business-rules.md
    architecture.md
    database.md
    franchise-model.md
    deployment.md
  apps/
    web/
    admin/
    api/
  packages/
    shared/
    database/
    ui/
  infra/
    docker/
    supabase/
    scripts/
  archive/
    old-projects/
    old-database-schemas/
    old-notes/
  .env.example
  .gitignore
```

Monorepo is reasonable as a target, but only after import rules are set. Do not immediately merge Flutter, static web, and Expo code into one package manager. First create a documentation-controlled master folder, then import one application at a time.

## Missing Documentation

- Canonical database migration order.
- Environment variable catalog and dev/staging/prod split.
- Auth and RLS access model by role.
- Source-of-truth decision for static web vs Flutter vs Expo app.
- API contract for franchise/admin/branch flows.
- Test matrix and release checklist.
- Rollback procedure for database migrations.
