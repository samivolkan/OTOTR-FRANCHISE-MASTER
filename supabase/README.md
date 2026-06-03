# OTOTR Local Supabase Workspace

This folder is the CLI-facing local Supabase workspace for reviewed OTOTR migrations.

It is separate from `packages/database/raw-migrations`, which contains imported raw SQL that still needs audit.

## Current Status

- `config.toml` is local-development only.
- `migrations` currently has no approved executable SQL migration.
- `schemas` is reserved for a future declarative schema workflow if the project adopts it.
- `seed.sql` is intentionally empty except for safety notes.

## Blocked Local Commands

The current machine does not have Supabase CLI or Docker available. Until both exist, these commands cannot be validated:

```powershell
supabase start
supabase db reset
supabase migration list
```

## Install/Verify

```powershell
supabase --version
docker --version
```

If Supabase CLI is missing:

```powershell
npm install -g supabase
```

Docker Desktop must be installed and running before local Supabase can start.

## Hard Rules

- Do not run `supabase db push`.
- Do not link to remote staging or production without explicit approval.
- Do not place destructive SQL in `migrations`.
- Do not place service-role secrets in this repo.
- Run reviewed migrations locally before any staging plan.

