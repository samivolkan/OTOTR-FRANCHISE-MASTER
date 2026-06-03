# Backend Local Readiness

Status date: 2026-06-03

## Purpose

Track the local backend validation state for Supabase migrations, RLS checks, RPC checks and storage policy checks.

## Current Result

Passing checks:

- WSL command is available.
- Docker Desktop engine responds.
- Supabase CLI is available through `npx.cmd supabase`.
- Backend contract static checks pass.
- Public API read-only staging smoke test passes.

Blocked check:

- Local Supabase stack is not running.
- `npx.cmd supabase status` fails because `supabase_db_ototr-local` does not exist.
- `npx.cmd supabase start` was attempted twice and timed out before a local stack was created.

## Commands

Contract/static check:

```powershell
npm.cmd run check:backend-contracts
```

Read-only public API staging smoke:

```powershell
npm.cmd run test:public-api
```

Local Supabase readiness:

```powershell
npm.cmd run check:supabase-readiness
```

Start local Supabase stack:

```powershell
npx.cmd supabase start
```

## Safety Notes

- Do not run `supabase db push`.
- Do not link a remote project without explicit approval.
- Do not run production migrations from this workspace.
- Use local or staging only for `packages/database/rls-verification-checklist.sql`.

## Next Required Action

Resolve why `npx.cmd supabase start` hangs before creating containers. Likely areas to check:

- Docker Desktop resource/network image pull status.
- Supabase CLI debug output in an interactive terminal.
- Whether required Supabase images are still downloading.
- Local port conflicts after the stack begins creating containers.

After `supabase start` succeeds, run:

```powershell
npm.cmd run check:supabase-readiness
```

Then run the reviewed migration reset/verification flow only against local Supabase.
