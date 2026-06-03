# Database Local Validation Runbook

Date: 2026-06-03

## Current Blocker

Local database validation cannot run on this machine right now:

- `supabase --version` fails because Supabase CLI is unavailable.
- `docker --version` fails because Docker is unavailable.

No local DB reset or migration command has been run.

## Install Checks

Run:

```powershell
supabase --version
docker --version
```

If Supabase CLI is missing:

```powershell
npm install -g supabase
```

Docker Desktop must be installed and running.

## Local-Only Commands

After prerequisites are ready:

```powershell
cd C:\Users\Samivolkannnn\Documents\OTOTR_HAZIRAN\OTOTR-FRANCHISE-MASTER
supabase start
supabase migration list
supabase db reset
```

If the hand-authored `supabase/config.toml` is rejected, run:

```powershell
supabase init
```

Then compare generated config with the existing local config before overwriting anything.

## Type Generation

Do not generate database types until the repo decides where generated types belong.

Candidate commands after local DB is running:

```powershell
supabase gen types typescript --local
```

The output path must be decided before running this command.

## Blocked Commands

Do not run:

```powershell
supabase db push
supabase db reset --linked
```

Do not link to staging or production without explicit approval.

## Static Work That Can Continue

- promote audited SQL into a reviewed local migration file.
- remove hardcoded public Supabase fallback config from app code after deciding env policy.
- write role-matrix RLS tests.
- reconcile inspection schema JSON/JS/SQL sources.

