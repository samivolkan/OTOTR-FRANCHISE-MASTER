# Next 20 Work Plan

Date: 2026-06-03
Scope: OTOTR Franchise Master first execution roadmap after controlled imports.

## Start Point

Start with Phase 1: master workspace stabilization.

Reason:

- The master folder is now the source of truth, but the repository state still needs a clean snapshot.
- Database migrations exist in reviewed draft form, but local Supabase validation is blocked until Docker/WSL is healthy.
- Product work should not move ahead of database, env and auth hardening because most app flows depend on RLS, RPCs and public/private key separation.

## First 20 Jobs

| No | Stage | Job | Start timing | Output | Validation |
| --- | --- | --- | --- | --- | --- |
| 1 | Phase 1 - Stabilize | Review current git status and decide the exact snapshot scope. | Start now | Clean file scope list | `git status --short` |
| 2 | Phase 1 - Stabilize | Exclude or ignore accidental OS files such as `desktop.ini`. | Start now | Updated ignore/scope decision | Git status clean from unwanted files |
| 3 | Phase 1 - Stabilize | Create first master workspace snapshot/commit after user approval. | Start now | Baseline commit | Commit hash recorded |
| 4 | Phase 1 - Stabilize | Verify `README.md`, `PROJECT_MEMORY.md`, `NEXT_PHASES.md`, `IMPORT_MANIFEST.md`, `MIGRATION_LOG.md`, `TEST_RESULTS.md` agree with current state. | Start now | Consistency notes or doc fixes | Read-only/doc review |
| 5 | Phase 1 - Stabilize | Keep `C:\ototr_master` junction available for Flutter validation. | Start now | Confirmed validation path | `Test-Path C:\ototr_master` |
| 6 | Phase 2 - Environment | Install/enable WSL because Docker Desktop Linux engine is blocked without it. | Before DB reset | Working WSL backend | `wsl --status` |
| 7 | Phase 2 - Environment | Start Docker Desktop and verify Docker engine. | After WSL | Healthy Docker engine | `docker version` |
| 8 | Phase 2 - Environment | Verify Supabase CLI through pinned/project-safe command. | After Docker | CLI version recorded | `npx.cmd supabase --version` |
| 9 | Phase 2 - Database | Run local Supabase startup only, not remote deployment. | After Docker/CLI | Local Supabase stack | `npx.cmd supabase start` |
| 10 | Phase 2 - Database | Run reviewed local migration reset and capture exact errors. | After local stack | Reset report | `npx.cmd supabase db reset` |
| 11 | Phase 2 - Database | Fix only migration syntax/dependency errors found by local reset. | After reset errors | Corrected reviewed migrations | Repeat db reset |
| 12 | Phase 2 - Database | Finalize local smoke seed with deterministic local auth UUID strategy. | After clean reset | Executable local seed | Seed applies locally |
| 13 | Phase 2 - Database | Run expected contract verification SQL. | After seed | Tables/RPC/policy report | `packages/database/expected-contract-verification.sql` |
| 14 | Phase 2 - Database | Run RLS verification checklist for branch manager and technician scenarios. | After local users | RLS evidence | `packages/database/rls-verification-checklist.sql` |
| 15 | Phase 5 - Env/Auth | Review mobile and browser Supabase config boundaries. | After DB contracts stable | Config risk report | No service-role in client code |
| 16 | Phase 5 - Env/Auth | Confirm `.env.example` covers web, Expo, Flutter, Supabase and deployment keys without real values. | After config review | Env catalog | Secret scan / manual review |
| 17 | Phase 4 - Mobile | Run Flutter branch app checks through `C:\ototr_master`. | After DB/env review | Mobile branch validation | `flutter analyze`, `flutter test` |
| 18 | Phase 4 - Mobile | Run Expo technician typecheck and review audit warnings without force fixes. | After DB/env review | Technician validation | `npm.cmd run typecheck` |
| 19 | Phase 3 - Admin/Web | Run admin prototype smoke tests before any refactor. | Before admin changes | Baseline admin QA | `node tools/test-demo-data.mjs`, `node tools/test-vin-service.mjs`, `node tools/test-index.mjs` |
| 20 | Phase 6 - MVP Planning | Freeze first MVP slice: CEO cockpit, CRM lead, appointment, branch card, franchise funnel, finance, quality alerts, audit history. | After DB/env baseline | MVP implementation brief | Decision note / scoped backlog |

## After The First 20

21. Start admin prototype modular refactor: extract data/services before visual changes.
22. Build API/service boundary for server-only operations.
23. Generate typed database contracts if app code starts consuming generated types.
24. Add automated role-matrix tests for CEO/admin, region manager, branch user and technician.
25. Prepare staging migration runbook with backup/export steps.
26. Apply reviewed migrations to staging only after explicit approval.
27. Run staging app smoke tests and RLS access tests.
28. Wire public web deployment workflow after domain, SSL and analytics ownership checks.
29. Harden public Edge Function rate limits, CORS, honeypot and validation logs.
30. Start MVP implementation in small vertical slices: database contract, app UI, test, deployment note.
31. Add finance/royalty model details and payment provider abstraction.
32. Add franchise application workflow states and document checklist automation.
33. Add quality/crisis alert workflow and escalation rules.
34. Add academy/enrollment/certificate operational screens.
35. Add support ticket workflow and SLA reporting.
36. Add customer-facing report verification hardening and audit logs.
37. Add production release checklist and rollback runbook.
38. Prepare production migration only after clean staging result, backup/export and explicit approval.
39. Run production smoke tests with non-destructive checks.
40. Record final production decisions in `PROJECT_MEMORY.md` and `docs/decisions`.

## What We Should Start Doing Now

Start with jobs 1-5 immediately.

Then resolve jobs 6-8 because Docker/WSL/Supabase CLI availability is the current hard blocker for safe local database validation.

Only after jobs 9-14 pass should we begin serious app feature work. Admin, mobile and public web can be visually improved before that, but any live-data behavior should wait for database/RLS validation.

## What Must Wait

- Production database migration.
- Destructive SQL or cleanup scripts.
- Service-role usage outside server-only code.
- Large admin refactor without smoke test baseline.
- Payment or external provider integration without env and secret policy.
- Production public web deployment without domain, SSL, backend endpoint and analytics ownership checks.
