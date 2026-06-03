# Database Deployment Checklist

Date: 2026-06-03

No staging or production deployment is approved by this checklist. It defines the gate process only.

## Pre-Local Checklist

- Supabase CLI installed.
- Docker Desktop installed and running.
- `supabase/config.toml` validated by local CLI.
- No real secrets in repo.
- `supabase/migrations` contains only reviewed SQL.
- `supabase/seed.sql` contains local/dev seed only.

## Local Validation Checklist

Run from `OTOTR-FRANCHISE-MASTER`:

```powershell
supabase start
supabase migration list
supabase db reset
```

Then run:

```powershell
psql "<LOCAL_DATABASE_URL>" -f packages/database/rls-verification-checklist.sql
```

Expected local result:

- migrations apply cleanly.
- no unexpected public table without RLS.
- policy inventory matches role matrix.
- `security definer` functions are reviewed.
- app-required RPCs exist.
- storage policies match app upload/read requirements.

## App Validation Checklist

Flutter branch app:

```powershell
cd C:\ototr_master\apps\mobile-branch
flutter analyze
flutter test
```

Expo technician app:

```powershell
cd C:\Users\Samivolkannnn\Documents\OTOTR_HAZIRAN\OTOTR-FRANCHISE-MASTER\apps\mobile-technician
npm.cmd run typecheck
```

Admin prototype:

```powershell
cd C:\Users\Samivolkannnn\Documents\OTOTR_HAZIRAN\OTOTR-FRANCHISE-MASTER\apps\admin\prototype
node tools\test-demo-data.mjs
node tools\test-vin-service.mjs
node tools\test-index.mjs
```

Do not run live Supabase scripts without explicit target approval.

## Staging Checklist

Before staging:

- export staging schema backup.
- confirm target Supabase project ref.
- confirm no production credentials are used.
- confirm migration SQL has no destructive statements.
- confirm manual-only files are excluded.
- get explicit staging approval.

Allowed staging commands after approval:

```powershell
supabase link --project-ref <STAGING_PROJECT_REF>
supabase migration list
```

Migration apply command must be decided after local validation. Do not run `supabase db push` without explicit approval.

Post-staging:

- run RLS verification queries.
- run mobile/admin smoke tests against staging.
- verify auth/session role scopes.
- verify storage upload/read flows.
- review Supabase advisors if CLI/tools are available.

## Production Checklist

Before production:

- staging passed with the same migration set.
- production schema backup/export completed.
- rollback/remediation notes completed.
- maintenance window or low-traffic window chosen.
- release order confirmed: database first, then app config/code if contracts require it.
- explicit production approval obtained.

Production blocked commands without approval:

```powershell
supabase db push
supabase db reset
```

## Rollback and Remediation

Preferred rollback for additive migrations:

- leave new columns/tables in place.
- revert app code/config to previous contract.
- disable newly exposed UI paths.
- apply a corrective forward migration if needed.

For RLS regressions:

- identify affected role and table.
- restore minimum required policy through a reviewed forward migration.
- verify with role-specific test account.

For RPC regressions:

- keep old RPC signature when possible.
- add a compatibility wrapper instead of removing functions.

For destructive cleanup:

- never run cleanup in the first production pass.
- schedule cleanup as a separate approved migration after backups and monitoring.

## Post-Deploy Verification Queries

Use `packages/database/rls-verification-checklist.sql` plus app-specific checks:

- list current policies.
- list exposed `security definer` functions.
- verify app-required RPC execute grants.
- verify public tables have RLS enabled.
- verify storage policies for report media bucket.

