# Database Migration Audit

Date: 2026-06-03
Scope: OTOTR Supabase/Postgres database setup, raw SQL inventory, app contracts and deployment readiness.

## Observed

Active master project:

`C:\Users\Samivolkannnn\Documents\OTOTR_HAZIRAN\OTOTR-FRANCHISE-MASTER`

Reference project:

`C:\Users\Samivolkannnn\Documents\ototr_25052026`

Current master database structure:

- `supabase/config.toml`: local-only skeleton exists.
- `supabase/migrations/`: exists, no approved SQL migration yet.
- `supabase/schemas/`: exists as reserved placeholder.
- `supabase/seed.sql`: exists, intentionally safe/empty.
- `packages/database/raw-migrations/`: imported raw SQL source.
- `packages/database/raw-schemas/`: imported inspection schema/seed source.
- generated Supabase types: none found.

Tooling status:

- Supabase CLI is not available on PATH.
- Docker is not available on PATH.
- Local Supabase validation is blocked until both are installed and Docker is running.

## Plan

- Keep old project as source/reference only.
- Keep new work inside `OTOTR-FRANCHISE-MASTER`.
- Promote raw SQL into `supabase/migrations` only after file-by-file review.
- Keep demo seed and cleanup SQL outside the automatic migration chain.
- Do not rewrite old migrations or squash history without explicit approval.
- Use additive/backfill patterns for any future destructive-looking schema change.

## Changes

This audit phase created documentation and local scaffolding only. No SQL was executed.

Files created before this audit:

- `supabase/config.toml`
- `supabase/README.md`
- `supabase/seed.sql`
- `supabase/migrations/README.md`
- `supabase/schemas/README.md`
- `packages/database/README.md`
- `packages/database/reviewed-migration-order.md`
- `packages/database/rls-verification-checklist.sql`
- `docs/database-buildout-roadmap.md`

## Database

Raw SQL source groups:

- schema foundations: 3 files.
- RLS/security: 11 files.
- RPC/functions: 6 files.
- manual-only: 4 files.
- raw schemas/seeds: 5 files.

Main schema foundation candidates:

- `2026-05-24-expertise-report-backbone.sql`
- `2026-05-25-crm-dealer-portal-backbone.sql`
- `2026-05-25-report-template-system.sql`

Manual-only or unsafe-by-default files:

- `2026-05-24-demo-seed-expertise-case.sql`
- `2026-05-25-restore-rls-helper-execute.sql`
- `2026-05-26-remove-demo-work-orders.sql`
- `2026-05-23-smart-vin-work-orders.md`

Unsafe patterns found:

- `delete from` exists in manual-only seed/cleanup SQL.
- many `drop policy if exists` statements exist in RLS/policy replacement files.
- many `drop trigger if exists` statements exist before trigger recreation.
- many `security definer` functions exist and require `search_path` and execute-grant review.
- storage policies exist for `storage.objects` and must be tested with upload/read/update flows.

RLS notes:

- Public tables generally enable RLS in foundation migrations.
- Policy helpers depend on `auth.uid()` and `app_users.auth_user_id`.
- `UPDATE` flows must have matching `SELECT` policies or app updates may silently affect zero rows.
- Views must use `security_invoker=true` or be kept away from anon/authenticated exposure.

Seed notes:

- `supabase/seed.sql` currently has no data.
- Demo seed remains manual-only because it contains cleanup/delete behavior.
- Production migrations must not include seed/demo data.

## Validation

Static validation performed:

- inspected `supabase/` structure.
- inspected `packages/database/raw-migrations`.
- inspected app Supabase usage in Flutter, Expo technician and admin prototype.
- confirmed generated DB types are not present.

Blocked validation:

- `supabase start`
- `supabase db reset`
- `supabase migration list`
- local type generation

Blocker:

- Supabase CLI and Docker are unavailable on this machine.

## Risks

- Raw migrations are not yet an executable canonical chain.
- Some raw SQL uses policy/trigger replacement; this is normal for review migrations but risky against an existing live DB.
- Manual-only cleanup SQL can delete data and must not be promoted.
- Admin prototype contains live Supabase paths and a delete/reset flow; those scripts must stay manual/live-test-only.
- Expo technician and admin prototype hardcoded public Supabase fallback configuration was removed on 2026-06-03. Live access now requires explicit env/runtime config.
- Flutter/Expo code depends on current table/RPC names and can break if the canonical chain renames contracts.

## Manual Commands

Prerequisite checks:

```powershell
supabase --version
docker --version
```

If Supabase CLI is missing:

```powershell
npm install -g supabase
```

After Docker Desktop is installed and running:

```powershell
supabase start
supabase migration list
```

Do not run:

```powershell
supabase db push
```

## Deployment Checklist

No deployment is approved from this audit.

Before staging:

- create reviewed baseline migration.
- run local `supabase db reset`.
- run RLS verification checklist.
- run app tests/typechecks.
- export staging schema backup.
- get explicit approval.

Before production:

- staging migration and smoke tests must pass.
- production backup/export must be completed.
- rollback/remediation notes must be written.
- explicit production approval must be given.
