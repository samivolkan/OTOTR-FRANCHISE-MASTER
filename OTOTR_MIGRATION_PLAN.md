# OTOTR Migration Plan

Plan date: 2026-06-03
Target folder: `C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER`

## Guiding Rules

- Do not delete old files or folders.
- Do not run destructive database commands.
- Do not copy real `.env` values into public docs.
- Treat `ototr_25052026` as the baseline, but import selectively.
- Log every copy/import step in `MIGRATION_LOG.md`.
- Run tests after each meaningful import.

## Phase 1 - Clean Workspace

Status: started.

Actions:

- Create `OTOTR-FRANCHISE-MASTER`.
- Add reports and project memory.
- Add placeholder structure for apps, packages, infra and archive notes.
- Add `.env.example` with key names only.
- Add `.gitignore` that excludes secrets, build outputs, caches and artifacts.

No old code is copied in this phase.

## Phase 2 - Source Import Candidates

Recommended import order:

1. Documentation and project memory from `ototr_25052026\docs`.
2. Database package from reviewed SQL files:
   - `docs/migrations`
   - `data/inspection_sql_schema.sql`
   - `data/inspection_seed.sql`
   - schema catalog files after reconciliation.
3. Flutter branch app:
   - `lib`
   - `test`
   - `android`, `web`, and required Flutter metadata.
4. Static ERP/CRM prototype:
   - `index.html`
   - `src`
   - `tools`
   - relevant static assets.
5. Technician app:
   - `ototr-usta-app`

Do not import generated folders: `build`, `.dart_tool`, `.codex-screenshots`, `artifacts`, APK outputs, browser profiles.

Mobile-specific import plan: `docs/mobile-import-plan.md`.

Recommended mobile targets:

- Flutter branch app -> `apps/mobile-branch`
- Expo/React Native technician app -> `apps/mobile-technician`

Mobile import must not include build outputs, generated APKs, `.expo`, `.dart_tool`, `dist`, `artifacts`, or real env files.

Import status on 2026-06-03:

- Database raw files imported into `packages/database`.
- Flutter branch app imported into `apps/mobile-branch`.
- Expo technician app imported into `apps/mobile-technician`.
- Web/admin prototype imported into `apps/admin/prototype`.
- Public web prototype files imported into `apps/web/public-prototype`.
- Priority B docs imported into `archive/old-notes/imported-docs-priority-b-2026-06-03`.

See `IMPORT_MANIFEST.md` for details.

## Files That Require Manual Control

- `index.html`: large monolithic file; split only after tests and screenshots.
- `docs/migrations/*.sql`: review order, idempotency, RLS effects and destructive statements.
- `tools/live_smoke_test.mjs`: may require live credentials; do not run until env policy is set.
- `src/services/vinService.js`: uses external VIN API endpoint; document external dependency.
- Supabase/auth service files: verify no hardcoded secrets before import.
- `ototr-usta-app/package.json`: dependency versions are very new; verify install compatibility.

## Archive Strategy

Use `archive/old-projects` only for references/notes first. Do not copy entire old folders until there is a reason.

Recommended archive notes:

- `New project 2`: old Flutter variant; compare selected diffs.
- `New project-push-dealer-cockpit-actions`: old branch cockpit variant; compare selected diffs.
- `ototr_pages_static_deploy`: deployment output; keep as reference.
- `_OTOTR_ESKI`: locked historical backups and artifacts.

## Database Migration Strategy

1. Build a canonical ordered migration list.
2. Move reviewed SQL into `infra/supabase/migrations` or `packages/database/migrations`.
3. Split seed/demo data from schema migrations.
4. Mark destructive/cleanup migrations clearly:
   - `2026-05-24-demo-seed-expertise-case.sql`
   - `2026-05-26-remove-demo-work-orders.sql`
5. Run against a local or staging Supabase/Postgres database first.
6. Export current production schema before any production migration.
7. Verify RLS policies using role-based test accounts.
8. Only then prepare production migration commands.

Current classification output: `docs/database-migration-inventory.md`.

## Env / Config Strategy

Create `.env.example` only with key names. Suggested keys:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `APP_ENV`
- `PUBLIC_APP_URL`
- `VIN_API_BASE_URL`
- `PAYMENT_PROVIDER`
- `PAYMENT_API_KEY`
- `EXPO_PUBLIC_OTOTR_SUPABASE_URL`
- `EXPO_PUBLIC_OTOTR_SUPABASE_KEY`
- `OTOTR_SUPABASE_URL`
- `OTOTR_SUPABASE_ANON_KEY`

Rules:

- Real `.env` files stay local and ignored by Git.
- Frontend uses only public/anon-safe keys.
- Service role keys are server-only.
- Dev/staging/prod values must be separate.

## Test Strategy

After import:

- Flutter:
  - `flutter pub get`
  - `flutter analyze`
  - `flutter test`
- Static web:
  - run existing `tools/test-index.mjs` if runtime is available.
  - open `index.html` manually or via browser QA.
- Expo technician app:
  - `npm install`
  - `npm run typecheck`
- Database:
  - apply migrations to local/staging only.
  - run schema diff and RLS access tests.

## Rollback Strategy

- Keep old folders untouched.
- Import files by copy, never move.
- Commit/report after each phase.
- For database work, export schema before migrations.
- Keep migration batches small and reversible where possible.
- If an import breaks tests, remove only the newly imported files from the new master folder and keep the source folder intact.

## Immediate Next Development Direction

1. Decide first production app surface:
   - Flutter branch app for operations, or
   - web/admin ERP/CRM panel.
2. Freeze canonical database model from the Supabase SQL set.
3. Create env policy and local Supabase test target.
4. Import one codebase at a time into the master folder.
