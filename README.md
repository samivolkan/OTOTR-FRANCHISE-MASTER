# OTOTR Franchise Master

This is the clean master workspace for the OTOTR Franchise System.

Current status: clean master workspace with controlled imports completed.

Baseline reference: `C:\Users\Samivolkannnn\Documents\ototr_25052026`

Important: imported source areas now live under this master folder. The old
baseline folder remains read-only reference/archive material and must not be
deleted, moved, or overwritten.

## Structure

```text
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
supabase/
  config.toml
  migrations/
  schemas/
  seed.sql
docs/
archive/
```

## Rules

- Old project folders must not be deleted.
- Old code must be copied only after review.
- Real `.env` values must not be committed.
- Database migrations must be tested locally/staging before production.
- Every import must be logged in `MIGRATION_LOG.md`.

## Current Documents

- `OTOTR_PROJECT_AUDIT.md`
- `OTOTR_MIGRATION_PLAN.md`
- `PROJECT_MEMORY.md`
- `MIGRATION_LOG.md`
- `IMPORT_MANIFEST.md`
- `TEST_RESULTS.md`
- `NEXT_PHASES.md`
- `AGENTS.md`
- `docs/CHATGPT_WORKFLOW.md`
- `docs/api.md`
- `docs/auth-and-roles.md`
- `docs/testing.md`
- `docs/database-buildout-roadmap.md`

## Imported Source Areas

- `apps/mobile-branch`
- `apps/mobile-technician`
- `apps/admin/prototype`
- `apps/web/public-prototype`
- `packages/database`

Raw database files are imported for review only. They are not an approved
production migration chain.

The CLI-facing local Supabase workspace is `supabase/`. Reviewed migrations
will be promoted there only after audit. Do not run `supabase db push`.

## Ready Checks

Latest checks passed:

- Flutter analyze/test.
- Expo TypeScript typecheck.
- Admin prototype demo-data, VIN service and smoke tests.

Database local validation is not yet runnable on this machine because Supabase
CLI and Docker are not currently available.

## New Session Start

For a new Codex/ChatGPT session, read:

1. `PROJECT_MEMORY.md`
2. `OTOTR_PROJECT_AUDIT.md`
3. `OTOTR_MIGRATION_PLAN.md`
4. `AGENTS.md`
5. `NEXT_PHASES.md`
