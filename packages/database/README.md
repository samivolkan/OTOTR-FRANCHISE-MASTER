# OTOTR Database Package

This package contains database source material for review. It is not yet an executable production migration chain.

## Folder Roles

- `raw-migrations/schema-foundations`: imported schema backbone candidates.
- `raw-migrations/rls-security`: imported RLS and security candidates.
- `raw-migrations/rpc-functions`: imported RPC/function candidates.
- `raw-migrations/manual-only`: design notes, demo seed, rollback or cleanup files. These must not enter automatic production migrations.
- `raw-schemas`: imported inspection schema and seed sources that still need reconciliation.

## Canonical Output

Reviewed, executable local migrations belong in:

`../../supabase/migrations`

Do not rewrite imported raw SQL in place. If a raw file needs correction, create a new reviewed migration or document the required edit before copying it into the local chain.

## Verification Assets

- `rls-verification-checklist.sql`: metadata checks for RLS, function grants, security definer usage, storage policies, auth linkage, region scope and public report surfaces.
- `rls-role-fixtures.template.sql`: local/staging-only fixture template for CEO, region manager, branch manager, technician, finance and quality role checks. It starts a transaction and rolls back by default.

## Safety Rules

- Do not run production or staging database commands without explicit approval.
- Do not run `supabase db push` from this project without explicit approval.
- Do not put manual-only files in the automatic migration chain.
- Do not include `delete from`, `truncate`, table drops, column drops or cleanup scripts in reviewed migrations unless explicitly approved.
- Prefer additive migrations: add new fields, backfill locally/staging, then clean up later.
- Every RLS change needs verification queries or test cases.

## Current Status

- Local Supabase CLI structure is being introduced under `supabase`.
- Supabase CLI and Docker are not currently available on this machine, so local reset/up validation is blocked.
- No generated database types are currently present in the repo.
