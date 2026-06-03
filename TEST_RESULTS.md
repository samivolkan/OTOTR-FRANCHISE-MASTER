# Test Results

Test date: 2026-06-03

## Flutter Branch App

Path:

- `apps/mobile-branch`
- Short validation path used: `C:\ototr_master\apps\mobile-branch`

Results:

- `flutter pub get`: passed.
- `flutter analyze`: passed through `C:\ototr_master`.
- `flutter test`: passed through `C:\ototr_master`; all tests passed.

Note:

- Running `flutter analyze` directly under `C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\...` crashed the Flutter analysis server because of path handling. The same project passed when accessed through the short junction `C:\ototr_master`.

## Expo / React Native Technician App

Path:

- `apps/mobile-technician`

Results:

- `npm.cmd install`: passed.
- `npm.cmd run typecheck`: passed.

Notes:

- PowerShell blocked `npm.ps1`; `npm.cmd` was used.
- `npm install` reported 10 moderate audit warnings from the dependency chain. `npm audit fix --force` was not run because it can break Expo compatibility.

## Admin / Web Prototype

Path:

- `apps/admin/prototype`

Results:

- `node tools/test-demo-data.mjs`: passed.
- `node tools/test-vin-service.mjs`: passed.
- `node tools/test-index.mjs`: passed.

Fixes made before passing:

- Copied missing admin prototype assets under `data` and `docs`.
- Replaced stale detailed smoke flow with a stable master smoke test.
- Fixed lead creation flow by making mock backend create/update paths run through seed merge.

## Database

No database migration was executed.

Imported SQL files are raw source files only and remain grouped for review.

Database structure work on 2026-06-03:

- Added local-only Supabase workspace skeleton under `supabase/`.
- Added migration review queue and RLS verification checklist under `packages/database/`.
- `supabase --version`: failed because Supabase CLI is not installed or not on PATH.
- `docker --version`: failed because Docker is not installed, not running, or not on PATH.

Blocked commands until prerequisites are available:

- `supabase start`
- `supabase db reset`
- `supabase migration list`

First 5 database buildout follow-up outputs completed:

- `docs/database-migration-audit.md`
- `docs/database-app-contract-map.md`
- `docs/database-raw-sql-classification.md`
- `docs/database-deployment-checklist.md`
- `docs/database-local-validation.md`

No database command was run for these outputs.

Supabase config hardening on 2026-06-03:

- Removed hardcoded public Supabase fallback config from Expo technician live API.
- Removed hardcoded public Supabase fallback config from admin prototype live dealer flow.
- Redacted the same public Supabase fallback values from the imported legacy root snapshot copy under `docs/thread-sources`.
- `npm.cmd run typecheck`: passed for `apps/mobile-technician`.
- `node tools/test-index.mjs`: passed for `apps/admin/prototype`.
- `node tools/test-demo-data.mjs`: passed for `apps/admin/prototype`.
- `node tools/test-vin-service.mjs`: passed for `apps/admin/prototype`.
- Secret/fallback scan: no hardcoded Supabase project URL or publishable key remains in active app/docs paths; only env-variable placeholder references remain.

Reviewed baseline 001 on 2026-06-03:

- Created `supabase/migrations/202606030001_reviewed_expertise_report_backbone.sql`.
- Static review only; no database command was run.
- Local validation remains blocked by missing Supabase CLI and Docker.

Reviewed baseline 002-005 on 2026-06-03:

- Created reviewed migration drafts for report template schema, task ownership RPCs, branch work-order RPCs and technician list RPC.
- Created local seed design documentation.
- Static review only; no database command was run.
- Local validation remains blocked by missing Supabase CLI and Docker.

Reviewed baseline 011-015 on 2026-06-03:

- Added static SQL dependency audit for reviewed migrations 001-005.
- Added app contract re-check against reviewed migrations 001-005.
- Added expected metadata verification SQL.
- Added local smoke seed template requiring local auth user UUIDs.
- Static review only; no database command was run.
- Local validation remains blocked by missing Supabase CLI and Docker.

Reviewed baseline 016-020 attempt on 2026-06-03:

- `npx.cmd supabase --version`: passed, Supabase CLI resolved to `2.104.0`.
- `winget install --id Docker.DockerDesktop --source winget --accept-package-agreements --accept-source-agreements --silent`: completed; `winget list` reports Docker Desktop `4.76.0`.
- Docker CLI exists at `C:\Program Files\Docker\Docker\resources\bin\docker.exe` and reports Docker version `29.5.2`.
- Docker daemon is not healthy: `docker info` / `docker version` returns `500 Internal Server Error` for `dockerDesktopLinuxEngine`.
- `wsl --status` reports Windows Subsystem for Linux is not installed.
- `wsl --install --no-distribution` could not proceed from this session and returned the same WSL-not-installed system message.
- Direct WSL feature inspection with DISM failed with `Error: 740` because the current shell is not elevated.
- A separate elevated PowerShell window was launched for `wsl --install`, but the current automation session cannot complete or inspect the UAC/admin flow.
- Re-tested after the user's request:
  - `wsl --status` now reports default WSL version 2, but still says the WSL optional component / Virtual Machine Platform is not enabled and no Linux distribution is installed.
  - `systeminfo` reports virtualization-based security is running and a hypervisor is detected.
  - `npx.cmd supabase start` failed before migrations with Docker engine inspection error against `dockerDesktopLinuxEngine`.
  - A second elevated PowerShell window was launched to enable `Microsoft-Windows-Subsystem-Linux` and `VirtualMachinePlatform` with DISM and run `wsl --install --no-distribution`; current non-elevated checks still show the same WSL/Docker blocker.
- `supabase start`, `supabase migration list`, `supabase db reset`, local smoke seed execution and RLS/RPC smoke tests were not run because Docker engine is unavailable.

## Latest Full Validation

Passed on 2026-06-03:

- `flutter analyze`
- `flutter test`
- `npm.cmd run typecheck`
- `node tools/test-demo-data.mjs`
- `node tools/test-vin-service.mjs`
- `node tools/test-index.mjs`

## Bug Fix / Test Thread Baseline

Revalidated on 2026-06-03 for thread `09 - OTOTR Bug Fix ve Testler`:

- `npm.cmd run typecheck`: passed for `apps/mobile-technician`.
- `node tools/test-demo-data.mjs`: passed for `apps/admin/prototype`.
- `node tools/test-vin-service.mjs`: passed for `apps/admin/prototype`.
- `node tools/test-index.mjs`: passed for `apps/admin/prototype`.
- `flutter analyze`: passed through `C:\ototr_master\apps\mobile-branch`.
- `flutter test`: passed through `C:\ototr_master\apps\mobile-branch`; all tests passed.

Notes:

- Flutter still reports newer package versions that are incompatible with current dependency constraints; no package upgrade was performed.
- No database migration or live credential-dependent smoke test was run.

## Public Web Supabase Staging

Validated on 2026-06-03 against Supabase project `ototr-staging`:

- `GET /branches`: passed, returned 8 active branches.
- `GET /stats`: passed, returned `8,1,1,1` after smoke inserts.
- `GET /reports/verify?query=OTR-2026-1842&verifyCode=1842`: passed.
- Negative report lookup: passed, returned HTTP 404.
- `POST /appointments`: passed, created a staging test request.
- `POST /franchise-applications`: passed, created a staging test application.
- `POST /complaints`: passed after adding complaint `province` and `district` fields.
- CORS smoke test from `https://example.github.io`: passed.
- Dist HTML inline JavaScript syntax check: passed.
- Local dist HTTP check on `http://127.0.0.1:4176/ototr-web.html`: passed and contains the Supabase staging API base.

Direct database count verification:

- `public_appointment_requests`: 1
- `public_franchise_applications`: 1
- `public_complaints`: 1
- `public_branches`: 8 active
- `public_report_records`: 1 public staging test record

## Public Web Live Preview QA

Validated on 2026-06-03 against:

`https://samivolkan.github.io/OTOTR-WEB-PREVIEW/ototr-web.html`

- Live page: HTTP 200.
- Desktop title/canonical: passed.
- Mobile layout horizontal overflow check: passed.
- Desktop layout horizontal overflow check: passed.
- Missing hash anchors: 0.
- Empty visible form message boxes: 0.
- Branch API: passed, rendered 8 `.branch-item` records.
- Report verification: passed for `OTR-2026-1842` + `1842`.
- Quick appointment form: passed, API returned HTTP 201.
- Franchise application form: passed, API returned HTTP 201.
- Complaint form: initially failed because the frontend form does not collect province/district while the Edge Function required them for all contact flows.
- Complaint backend validation was fixed to require only contact identity, consent and complaint-specific fields.
- Complaint form retest: passed, API returned HTTP 201.
- Supabase count after live QA: appointments 3, franchise applications 3, complaints 3, active branches 8, public reports 1.

QA screenshots:

- `apps/web/live-preview-desktop-qa.png`
- `apps/web/live-preview-mobile-qa.png`
- `apps/web/live-preview-form-qa.png`
