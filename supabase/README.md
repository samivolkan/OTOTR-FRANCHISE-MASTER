# OTOTR Local Supabase Workspace

This folder is the CLI-facing local Supabase workspace for reviewed OTOTR migrations.

It is separate from `packages/database/raw-migrations`, which contains imported raw SQL that still needs audit.

## Current Status

- `config.toml` is local-development only.
- `migrations` contains reviewed additive migration files, including the GM İK production foundation. Presence in this folder is not remote deployment approval.
- `schemas` is reserved for a future declarative schema workflow if the project adopts it.
- `seed.sql` is intentionally empty except for safety notes.

## Blocked Local Commands

The current machine does not have Docker available. Supabase CLI is run as the pinned one-shot package `npx supabase@3.0.0`; Docker-dependent local stack commands cannot be validated:

```powershell
npx supabase@3.0.0 start
npx supabase@3.0.0 db reset
```

## Install/Verify

```powershell
npx supabase@3.0.0 --version
docker --version
```

Docker Desktop must be installed and running before local Supabase can start.

The GM İK migration has a Docker-independent PostgreSQL 17/PGlite acceptance suite:

```powershell
npm run test:gm-hr
```

This test is evidence for SQL behavior and does not replace a staging Supabase Auth/Storage/backup rehearsal.

## Hard Rules

- Do not run `supabase db push`.
- Do not link to remote staging or production without explicit approval.
- Do not place destructive SQL in `migrations`.
- Do not place service-role secrets in this repo.
- Run reviewed migrations locally before any staging plan.

