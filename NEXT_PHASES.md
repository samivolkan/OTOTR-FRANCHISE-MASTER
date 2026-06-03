# Next Phases

Status date: 2026-06-03

Execution roadmap:

- `docs/next-20-work-plan.md`
- `docs/next-20-execution-status.md`

The project is ready to continue from:

`C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER`

## Completed

- Created clean master folder.
- Imported database raw migration/schema files.
- Imported Flutter branch/operations app.
- Imported Expo/React Native technician app.
- Imported admin/web prototype.
- Imported Priority A and Priority B documentation.
- Added source-of-truth docs, manifest and test results.
- Fixed admin prototype smoke test and lead creation render issue.
- Verified core tests.

## Phase 1 - Stabilize Master Workspace

Goal: make this folder the only active development base.

Actions:

- Keep old folders read-only/reference.
- Commit or otherwise snapshot the current master folder.
- Continue using `IMPORT_MANIFEST.md`, `MIGRATION_LOG.md` and `TEST_RESULTS.md`.
- Keep `C:\ototr_master` junction for Flutter validation on Windows.

## Phase 2 - Database Review

Goal: convert raw SQL files into a reviewed, executable local/staging migration chain.

Actions:

- Review `packages/database/raw-migrations`.
- Keep `manual-only` files out of production chain.
- Split schema, RLS/security, RPC/functions and seed/demo data.
- Create a local/staging Supabase or Postgres test target.
- Run migrations only after backup/export strategy is documented.

## Phase 3 - Admin Prototype Refactor

Goal: turn the large static prototype into maintainable app modules.

Actions:

- Keep current `apps/admin/prototype/index.html` as preserved working prototype.
- Extract data/services first, then page modules.
- Preserve `tools/test-index.mjs`, `test-demo-data.mjs` and `test-vin-service.mjs`.
- Do not refactor visual/behavioral surface without smoke tests.

## Phase 4 - Mobile Decision

Goal: decide the long-term mobile structure.

Options:

- Keep Flutter branch app and Expo technician app separately.
- Make Flutter the main branch app and keep Expo technician-only.
- Port technician workflow into Flutter later.

Near-term rule: keep both apps separate until backend contracts are stable.

## Phase 5 - Env and Auth Hardening

Goal: prevent secret/config risk before live work.

Actions:

- Review `lib/core/config/supabase_config.dart`.
- Review `src/live/api.ts`.
- Move hardcoded public fallbacks to env-safe config where needed.
- Define dev/staging/prod env separation.
- Test RLS with role matrix.

## Phase 6 - Product MVP

Initial MVP scope:

- CEO cockpit.
- CRM lead records.
- Appointment management.
- Branch card.
- Franchise sales funnel.
- Finance/royalty tracking.
- Quality/crisis alerts.
- Audit history.

## Current Known Warnings

- Expo dependency chain reports moderate npm audit warnings; do not run `npm audit fix --force` blindly.
- Flutter path with Turkish characters can crash analysis server; use `C:\ototr_master`.
- Database SQL files are imported but not yet execution-ready.
- Local Supabase DB validation now passes for reviewed migrations through `20260603193856`.
- Full local stack can start; REST and Edge Function health endpoints respond.
- `audit_report_child_mutation` direct execute privilege has been revoked from `anon` and `authenticated`.
- Next database/auth work: create deterministic local auth fixtures and run role-session app smoke tests for branch manager and technician.
