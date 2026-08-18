# Migration Log

## 2026-08-18

- Updated `apps/admin/prototype/index.html` report design studio with locked A4 letterhead support.
- Added default static letterhead asset under `apps/admin/prototype/docs/ototr-a4-master-locked-300dpi.png`; SHA256 matches the user-provided desktop PNG.
- Added editable-studio controls for A4 letterhead upload, reset to default, and `Kaydet ve Cik`.
- Added CRM navigation entry for `Kaporta Tasarim` pointing to `https://samivolkan.github.io/Ototr/kaporta-tasarim.html`.
- Validation passed: inline classic script syntax check, Chrome desktop QA, Chrome mobile QA.
- No Supabase migration, live database command, credential print, or production data operation was run.
- Fixed report PDF/print flow so printing from the design studio first saves/exits the editor and restores the full report preview before browser PDF generation.
- Validation passed: Chrome PDF QA generated 22 report pages with non-empty output and zero console errors.

## 2026-06-03

- Created clean target folder `OTOTR-FRANCHISE-MASTER`.
- Created empty structure for `apps`, `packages`, `infra`, `docs`, and `archive`.
- Created audit, migration plan and project memory documents.
- Created `.env.example` with placeholder key names only.
- Created `.gitignore`.
- No old project files were deleted.
- No old project folders were moved.
- No production or database command was run.
- No real `.env` values were copied.
- Created `docs/database-migration-inventory.md` from read-only inspection of existing SQL files.
- Created `docs/source-docs-import-plan.md` from read-only inspection of existing documentation.
- Copied Priority A source docs into `archive/old-notes/imported-docs-priority-a-2026-06-03/`.
- Updated canonical docs with distilled Priority A decisions: `business-rules.md`, `architecture.md`, `database.md`, `franchise-model.md`.
- Created `docs/mobile-import-plan.md` for Flutter branch app and Expo technician app import boundaries.
- Added mobile public env placeholder names to `.env.example`.
- Imported database SQL and schema source files into `packages/database` as raw grouped files. No migration was executed.
- Imported Flutter branch/operations app source into `apps/mobile-branch`, excluding build/cache/artifact outputs.
- Imported Expo/React Native technician app source into `apps/mobile-technician`, excluding `.expo`, `dist`, `artifacts`, `node_modules` and APK outputs.
- Imported web/admin prototype files into `apps/admin/prototype` and selected public web prototype files into `apps/web/public-prototype`.
- Imported Priority B source docs into `archive/old-notes/imported-docs-priority-b-2026-06-03`.
- Created `IMPORT_MANIFEST.md`.
- Validation: `flutter pub get` succeeded for `apps/mobile-branch`.
- Validation: `flutter analyze` initially crashed on the Turkish-character workspace path, then passed through short junction `C:\ototr_master`.
- Validation: `flutter test` passed through short junction `C:\ototr_master`.
- Validation: `npm install` succeeded for `apps/mobile-technician`; npm reported 10 moderate audit warnings from the dependency chain.
- Validation: `npm run typecheck` passed for `apps/mobile-technician`.
- Validation: admin prototype `tools/test-index.mjs` failed on `#page-dealer.active`; the same failure reproduced on the original baseline, so it is not introduced by import.
- Validation: admin prototype `tools/test-demo-data.mjs` passed.
- Validation: admin prototype `tools/test-vin-service.mjs` passed.
- Fixed imported Flutter Android `.gitignore` so Gradle wrapper files can be tracked in the master project.
- Copied missing admin prototype runtime assets: `data/inspection_schema_web.js`, `docs/kaporta-boya-harita.png`, `docs/obd-module-map.png`, `docs/airbag-srs-kontrol.png`, `docs/ototr-favicon.svg`, `docs/1000km-garanti.png`.
- Replaced stale detailed admin smoke test with stable master smoke test.
- Fixed admin prototype mock backend lead create/update paths so seed merge runs before mutation.
- Latest validation passed: Flutter analyze/test, Expo typecheck, admin demo-data/VIN/smoke tests.
- Created `AGENTS.md` and `NEXT_PHASES.md` for continuing from the new master folder.
- Created ChatGPT/Codex workflow documentation: `docs/CHATGPT_WORKFLOW.md`.
- Created missing planning docs: `docs/api.md`, `docs/auth-and-roles.md`, `docs/testing.md`, `docs/decisions/README.md`, `archive/README.md`.
- Updated `AGENTS.md`, `README.md` and `PROJECT_MEMORY.md` with workflow/read-order rules.
- Bug fix/test thread baseline validation rerun: Expo typecheck, admin prototype demo/VIN/index smoke tests, Flutter analyze and Flutter tests all passed. No database migration or live credential-dependent test was run.
- Set public website active workspace to `apps/web/public-prototype` and added `apps/web/README.md`. Reference copies under `apps/admin/prototype` were left untouched.
- Removed the hidden `Special.rar` download section, GitHub download URL and related browser download handler from both `apps/web/public-prototype/ototr-web.html` and `apps/admin/prototype/ototr-web.html`.
- Added database buildout roadmap for the first 10 Supabase/Postgres migration structure stages: `docs/database-buildout-roadmap.md`.
- Added local-only Supabase workspace skeleton under `supabase/`: `config.toml`, `README.md`, `migrations/README.md`, `schemas/README.md`, and `seed.sql`.
- Added database package rules and reviewed migration queue docs: `packages/database/README.md` and `packages/database/reviewed-migration-order.md`.
- Added metadata-only RLS/security verification query checklist: `packages/database/rls-verification-checklist.sql`.
- No database migration was executed. No remote Supabase command was run. No destructive SQL was run.
- Validation blocker recorded: `supabase` CLI and `docker` commands are not available on this machine.
- Completed first 5 database buildout follow-up outputs: `docs/database-migration-audit.md`, `docs/database-app-contract-map.md`, `docs/database-raw-sql-classification.md`, `docs/database-deployment-checklist.md`, and `docs/database-local-validation.md`.
- Static inspection found app database contracts in Flutter branch app, Expo technician app and admin prototype live paths. No app code was changed.
- Prepared public web static deployment support files in `apps/web/public-prototype`: `index.html`, `robots.txt`, `sitemap.xml`, `_headers`, `_redirects` and `DEPLOYMENT_CHECKLIST.md`. No backend endpoint was implemented in this web thread.
- Created clean public web production upload package at `apps/web/dist-public-web` with only allowed static files. Reference/test files were not copied. Upload package notes were added as `apps/web/DIST_PUBLIC_WEB_README.md`.
- Removed hardcoded public Supabase fallback URL/key values from Expo technician live API and admin prototype live dealer Supabase config. Live access now requires explicit env/runtime config.
- Redacted the same public Supabase fallback values from the imported legacy root snapshot copy under `docs/thread-sources`.
- Created first reviewed local baseline migration draft: `supabase/migrations/202606030001_reviewed_expertise_report_backbone.sql`.
- Added baseline review report and next 5 baseline work items: `docs/reviewed-baseline-001-expertise-report-backbone.md`.
- No migration was executed; Supabase CLI/Docker blockers still apply.
- Completed reviewed baseline work items 6-10 by drafting migrations 002-005 and local seed design documentation.
- Added `docs/reviewed-baseline-002-005-report-rpc-seed.md` and `docs/database-local-seed-design.md`.
- No seed data was inserted into `supabase/seed.sql`; local auth-user strategy is still required before executable seed.
- Completed reviewed baseline work items 11-15: static dependency audit, app contract re-check, expected contract verification SQL, local smoke seed template, and local validation blocker/run command record.
- Added `docs/reviewed-baseline-001-005-dependency-audit.md`, `docs/reviewed-baseline-001-005-app-contract-check.md`, `packages/database/expected-contract-verification.sql`, and `supabase/seeds/local_smoke_seed.template.sql`.
- No database command was executed; Supabase CLI/Docker blockers still apply.
- Added public web Supabase staging backend files: `supabase/migrations/202606030006_public_web_form_backend.sql`, `supabase/migrations/202606030007_public_complaints_location_fields.sql`, `supabase/functions/public-api/*`, and `docs/public-web-supabase-staging.md`.
- Added GitHub Actions workflows for GitHub Pages public web deployment and Supabase staging deployment: `.github/workflows/deploy-public-web.yml`, `.github/workflows/deploy-supabase.yml`.
- Updated public web source and clean dist package to call Supabase staging API at `https://bsjkohwbtrfwrqcyhsfz.supabase.co/functions/v1/public-api`.
- Applied staging Supabase migrations `public_web_form_backend` and `public_complaints_location_fields` to project `ototr-staging`.
- Deployed Supabase Edge Function `public-api` version 2 with `verify_jwt=false` and internal CORS/input validation controls.
- Live preview QA found complaint frontend/backend contract mismatch: public complaint form does not collect province/district while Edge Function required them through the shared lead validator.
- Updated `supabase/functions/public-api/index.ts` so complaint records use contact validation plus complaint-specific required fields.
- Deployed Supabase Edge Function `public-api` version 3.
- Live preview retest passed for quick appointment, franchise application, complaint submission, report lookup, branch rendering and desktop/mobile overflow checks.
- Attempted local validation work items 16-20.
- Verified Supabase CLI via `npx.cmd supabase --version` as `2.104.0`.
- Installed Docker Desktop via winget; Docker Desktop `4.76.0` is listed and Docker CLI `29.5.2` exists.
- Local Supabase validation remains blocked because Docker Desktop Linux engine is unhealthy and Windows Subsystem for Linux is not installed in this Windows environment.
- Attempted WSL installation from the current shell and an elevated PowerShell launch; completion still requires an admin/UAC flow outside this automation session.
- Re-tested WSL, Docker and `npx.cmd supabase start`; WSL still reports the optional component / Virtual Machine Platform blocker, and Supabase start still fails before migrations on Docker engine inspection.
- No local migration reset, seed execution or RLS/RPC smoke test was run.
- Rebuilt `apps/admin/prototype/bayi-portal/index.html` from a redirect stub into a standalone bayi portal operations prototype.
- New portal prototype includes role-scoped navigation for bayi sahibi, şube müdürü, müşteri kabul, usta/teknisyen and kasa/muhasebe; screens cover cockpit, appointments, work orders, technician tasks, manager approvals, reports, delivery/QR, customers, staff/roles, Academy, finance/cashbox, assets, quality/complaints, HQ support requests and branch settings.
- Generated bayi portal QA screenshots for desktop and mobile under `apps/admin/prototype/bayi-portal/`.
- Validation: Playwright smoke test passed for route navigation, role switching and mobile horizontal overflow.
- Completed ERP operations first 20 planning outputs for thread `14 - OTOTR ERP / Tum Operasyon Yonetimi`.
- Added `docs/erp-operations-20-step-execution.md` with current-system-based module map, role matrix, operation flow, work order contract, dashboard scopes, capacity model, assignment rules, appointment/work-order rules, quality gates, finance/royalty rules, franchise pipeline, branch opening model, API draft, database safety split, demo/production boundary, admin refactor plan, test matrix and MVP scope.
- Added visual companion report `docs/erp-operations-visual-report.html`.
- No old files were deleted or moved.
- No database migration or destructive command was run.
- No secret, token or real env value was printed or written.
- Completed ERP operations follow-up steps 21-25.
- Added `docs/erp-operations-contracts-21-25.md` for first formal API contracts, shared role constants, branch capacity schema, appointment conversion contract and work order alignment.
- Added shared contract source files under `packages/shared`: `README.md` and `src/erp-contracts.ts`.
- Shared contracts are not wired into app runtime yet; no app behavior was changed.
- Completed ERP operations follow-up steps 26-30.
- Added `docs/erp-operations-implementation-map-26-30.md` for admin module extraction inventory, branch portal live data binding map, technician task integration map, quality gate enforcement responsibilities and finance/royalty data contract.
- No app runtime behavior was changed for steps 26-30.
- Completed ERP operations follow-up steps 31-35.
- Added `docs/erp-operations-validation-31-35.md` for reviewed migration readiness, RLS role-test matrix, local/staging validation runbook, deterministic seed strategy and ERP MVP release/rollback checklist.
- No database command was executed for steps 31-35.
- No app runtime behavior was changed for steps 31-35.
- Completed ERP operations follow-up steps 36-40.
- Added `docs/erp-operations-release-candidate-36-40.md` for the first MVP demo slice, desktop/mobile visual QA checklist, end-to-end branch manager and technician smoke scenario, ERP MVP security review checklist and controlled release candidate checklist.
- No database command was executed for steps 36-40.
- No app runtime behavior was changed for steps 36-40.
- Started first ERP MVP implementation slice in `apps/admin/prototype/bayi-portal/index.html`.
- Added interactive MVP demo state for appointment conversion, technician assignment, evidence/report answer, manager approval, payment readiness and handover readiness.
- Added `apps/admin/prototype/tools/test-bayi-portal-mvp.mjs` for the branch portal MVP slice smoke test.
- No live backend or database command was used for this implementation slice.
- Validation passed: branch portal MVP smoke, admin demo-data smoke, admin index smoke, VIN service test and in-app Browser visual verification through local preview server.
- Completed Backend API first planning update for thread `05 - OTOTR Backend API`.
- Updated `docs/api.md` with the current Supabase Edge Function `public-api` contract, server-only API boundaries and mobile/bayi portal contract direction.
- Added `apps/api/README.md` to reserve the folder for a future dedicated backend API server without starting one now.
- Added `OTOTR_ALLOWED_ORIGINS` placeholder to `.env.example`; no real origin list, secret, token or credential value was written.
- No API server was started, no database migration was run and no destructive command was executed.
- Completed mobile/bayi portal backend contract pass for thread `05 - OTOTR Backend API`.
- Added `docs/mobile-bayi-api-contracts.md` with screen-by-screen Supabase table/RPC/storage contracts, server-only boundaries and final gap check.
- Linked the mobile/bayi portal contract from `docs/api.md`.
- Added current database role mapping references to `packages/shared/src/erp-contracts.ts`, `packages/shared/README.md` and `docs/auth-and-roles.md`.
- Expanded `packages/database/rls-verification-checklist.sql` with `report-media` storage bucket and policy checks.
- No app integration code was changed, no database migration was run and no live credential-dependent command was executed.
- Added read-only public API smoke test script `tools/test-public-api.mjs`.
- Added root script `npm.cmd run test:public-api`.
- Documented the smoke test command in `docs/public-web-supabase-staging.md`.
- Validation passed for read-only public API smoke test against staging: branches, stats, positive report verification and negative report verification. Write smoke was skipped by default.
- Added backend static contract check script `tools/check-backend-contracts.mjs` and package script `npm.cmd run check:backend-contracts`.
- Added Supabase local readiness script `tools/check-supabase-local-readiness.mjs` and package script `npm.cmd run check:supabase-readiness`.
- Added `docs/backend-local-readiness.md` with current local Supabase validation status and safe next commands.
- Validation passed: `npm.cmd run check:backend-contracts`.
- Validation passed: `npm.cmd run test:public-api`.
- Readiness check result: WSL, Docker and Supabase CLI respond, but local Supabase stack is not running because `supabase_db_ototr-local` does not exist.
- Attempted `npx.cmd supabase start` twice; both attempts timed out before containers were created. No database migration, remote command or destructive operation was run.

## Pending

- Verify live Supabase env/runtime config in a local/staging target after Supabase CLI/Docker and approved credentials are available.
- Configure GitHub repository secrets for automated deploy: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`.
- Convert raw database migrations into a reviewed executable local Supabase migration chain.
- Install/enable WSL, restart Windows/Docker Desktop, then rerun local DB reset or migration validation.
- Refactor large admin prototype only after smoke tests.
- Decide long-term mobile technology strategy.

## Main Memory Next 20 Execution - 2026-06-03

- Created execution roadmap: `docs/next-20-work-plan.md`.
- Created execution result report: `docs/next-20-execution-status.md`.
- Added first MVP slice decision: `docs/decisions/2026-06-03-first-mvp-slice.md`.
- Added missing test login key names to `.env.example`; no real values were written.
- Verified `C:\ototr_master` junction exists.
- Verified Supabase CLI through `npx.cmd supabase --version`; version `2.104.0`.
- Verified Supabase CLI help output before using local commands.
- Attempted local Supabase start/reset; both are blocked because Docker Desktop Linux engine is not reachable.
- WSL status reports WSL/Virtual Machine Platform/virtualization is not fully enabled.
- Reviewed mobile/browser Supabase config boundaries. Service-role usage remains server-side Edge Function env only.
- Fixed one Flutter analyzer lint by making the report-entry empty state constructor `const`.
- Validation passed: Expo typecheck, admin prototype demo/VIN/index smoke tests, Flutter analyze and Flutter tests.
- Reviewed npm audit warnings; `npm audit fix --force` was not run because it would apply a breaking Expo downgrade.

## WSL/Docker Recovery Attempt - 2026-06-03

- Rechecked WSL, Docker Desktop and Supabase local start after user asked to proceed.
- Started Docker Desktop from `C:\Program Files\Docker\Docker\Docker Desktop.exe`; UI/backend processes started but Docker Desktop CLI still reported `Status stopped`.
- Ran `wsl --install Ubuntu-24.04 --no-launch`; command completed successfully and Windows reported that a system restart is required before changes take effect.
- Rechecked `wsl --status`, `docker desktop status` and `npx.cmd supabase start`; local Supabase remains blocked until Windows is restarted and Docker Desktop Linux engine starts successfully.
- No remote Supabase command, production database command, destructive SQL, seed execution or RLS verification was run.

## Local Supabase DB Validation - 2026-06-03

- Resumed after WSL2/Docker Desktop became healthy.
- Verified Docker Desktop running and Docker server reachable.
- Ran `npx.cmd supabase db start --debug`; local Postgres container `supabase_db_ototr-local` became healthy.
- Ran `npx.cmd supabase db reset --local`; reviewed migrations `202606030001` through `202606030007` applied successfully and `supabase/seed.sql` ran.
- Ran `npx.cmd supabase migration list --local`; migration list showed local migrations `202606030001` through `202606030007`.
- Ran `packages/database/expected-contract-verification.sql` through container `psql`; expected tables/RPC contracts passed.
- Ran `packages/database/rls-verification-checklist.sql` through container `psql`; no public table without RLS was reported.
- Recorded security follow-up: `audit_report_child_mutation` is callable by `anon` in the checklist output and should be reviewed before staging/production hardening.
- No remote Supabase command, production database command or destructive production operation was run.

## Local Supabase Full Stack And Audit Hardening - 2026-06-03

- Ran full local Supabase start after DB-only validation.
- Full local stack started; REST and Edge Function health endpoints responded.
- Supabase status reported `supabase_imgproxy_ototr-local` and `supabase_pooler_ototr-local` as stopped; Docker process output showed `supabase_vector_ototr-local` restarting.
- Created migration through Supabase CLI: `supabase/migrations/20260603193856_harden_audit_report_child_mutation_execute.sql`.
- Migration revokes direct execute on `public.audit_report_child_mutation()` from `public`, `anon` and `authenticated`.
- Re-ran `npx.cmd supabase db reset --local`; reviewed migration chain passed through `20260603193856`.
- Verified `audit_report_child_mutation` direct execute privilege is false for both `anon` and `authenticated`.
- Re-ran expected contract and RLS verification SQL through local container `psql`; both passed.
- Local generated keys were displayed by Supabase CLI status output but were not written into project files.
- No remote Supabase command, production database command or destructive production operation was run.

## Local Role Session Smoke And app_users RLS Fix - 2026-06-03

- Created local-only smoke tool `tools/local-role-session-smoke.mjs`.
- The tool ensures fake local Auth users, seeds deterministic branch/case/task rows and verifies role-scoped REST reads through real Supabase Auth password sessions.
- First smoke run exposed `app_users` RLS recursion on REST self-user lookup.
- Created migration through Supabase CLI: `supabase/migrations/20260603195028_fix_app_users_rls_recursion.sql`.
- Migration replaces `app_users_self_or_hq` with a non-recursive policy:
  - self-read uses `auth_user_id = auth.uid()`;
  - HQ/quality override uses `public.current_app_user_role()`.
- Ran `npx.cmd supabase db reset --local`; migration chain passed through `20260603195028`.
- Ran `node tools/local-role-session-smoke.mjs`; branch manager and technician sessions passed expected own-branch/other-branch visibility checks.
- Re-ran expected contract and RLS verification SQL through local container `psql`; both passed.
- No remote Supabase command, production database command or destructive production operation was run.
- Local generated keys/tokens were not written into project files.

## Bayi Portal Redesign Expansion - 2026-06-03

- Expanded `apps/admin/prototype/bayi-portal/index.html` into a full dealer portal surface covering branch operations plus commercial self-service.
- Added screens for listings/vehicles, offers, orders, payments, invoices, shipments, warranty, technical documents and analytics.
- Grouped the portal menu into Operasyon, Ticari Self-Servis and Yönetim sections while preserving role-scoped access.
- Generated desktop, commerce and mobile QA screenshots under `apps/admin/prototype/bayi-portal/`.
- Validation: Playwright smoke test passed for 24 route navigation checks, role switching, grouped menu labels and mobile horizontal overflow.
- No old project file was deleted or moved.
- No secret, token, live credential, database migration or production command was used.

## ERP Operations MVP Slice - 2026-06-03

- Added a visible ERP operations MVP flow to `apps/admin/prototype/bayi-portal/index.html`.
- The flow covers appointment-to-work-order conversion, technician assignment, evidence completion, manager approval, payment unlock and delivery readiness.
- Added/updated Playwright coverage in `apps/admin/prototype/tools/test-bayi-portal-mvp.mjs`.
- Generated visual QA evidence at `apps/admin/prototype/artifacts/visual-checks/bayi-portal-erp-mvp-final.png`.
- Revalidated after the bayi portal file changed during the run; the final implementation is mounted without deleting, moving or reverting older portal content.
- No secret, token, live credential, database migration or production command was used.

## ERP Operations MVP Slice Withdrawal - 2026-06-04

- Removed the visible `ERP operasyon MVP akisi` panel from `apps/admin/prototype/bayi-portal/index.html` after product review found it unusable.
- Removed the dedicated MVP smoke test `apps/admin/prototype/tools/test-bayi-portal-mvp.mjs` because the abandoned panel is no longer part of the product surface.
- Existing dealer portal structure, branch operation screens and older files were not deleted or moved.
- No secret, token, live credential, database migration or production command was used.

## Local E2E Acceptance Validation - 2026-06-18

- Validated the current Bayi Portal -> Usta APK -> final report handoff against local Supabase.
- Started Docker Desktop when the first E2E run failed because the Docker engine pipe was unavailable.
- Started local Supabase services and reran the acceptance suite successfully.
- Ran backend contract, dealer print, mobile validation, local E2E, real Storage upload and Android debug APK build checks.
- Started local preview servers for dealer portal and mobile preview; both returned HTTP 200.
- Installed and launched the APK on `emulator-5554`.
- No old project file was deleted or moved.
- No remote Supabase or production database command was run.
- No secret, token or live credential was written into project files.

## Mobile Status Transition Task Unlock Fix - 2026-06-18

- Created migration `supabase/migrations/20260618102338_mobile_status_transition_unlock_tasks.sql`.
- Local clean first-work-order E2E exposed that `TECHNICAL_ENTRY_OPEN` did not make generated inspection tasks available for the technician flow and evidence metadata registration could be denied by RLS when the case was not assigned.
- Updated `app_private.transition_mobile_work_order_status` so a technician who starts technical entry is assigned to the case when it is unassigned.
- Updated the same transition to move generated unowned `LOCKED` or `ASSIGNED` tasks to `AVAILABLE` without writing `owner_user_id`, preserving the existing task ownership trigger boundary.
- Applied and verified locally with `npm.cmd run smoke:first-work-order:clean`.
- Follow-up validation passed: backend contract check, dealer print test and mobile `validate:all`.
- No remote Supabase or production database command was run.
- No secret, token or live credential was written into project files.

## Dealer Portal Live Intake Grants - 2026-06-18

- Created migration `supabase/migrations/20260618150000_grant_technician_start_evidence_authenticated.sql`.
- The watched dealer portal flow exposed that authenticated branch users could create the work order through `create_branch_work_order`, but the portal could not create intake start evidence because `technician_start_evidence` lacked authenticated table grants.
- Added authenticated `select`, `insert` and `update` grants for `technician_start_evidence`.
- Added authenticated `update` grants for `expertise_cases` and `inspection_tasks`, matching the current dealer portal live technical-entry PATCH flow while still relying on existing RLS and task ownership triggers.
- Applied the migration to local Supabase and verified the new dealer-created work order `OTOTR-20260618-0003 / 35 YNI 618` reached `TECHNICAL_ENTRY_OPEN`.
- No remote Supabase or production database command was run.
- No secret, token or live credential was written into project files.

## Mobile Technician To Dealer Auto Sync Contract - 2026-06-18

- Created migration `supabase/migrations/20260618120533_mobile_to_dealer_realtime_sync_contract.sql`.
- Fixed mobile module to backend task mapping so technician motor entries land on the generated ERP task key `MOTOR_KONTROL` instead of falling back to the first task.
- Updated the mobile app mapping service to use the current dealer work-order task keys (`KAPORTA_KONTROL`, `MOTOR_KONTROL`, `ALT_TAKIM_KONTROL`, `FREN_KONTROL`, `ELEKTRIK_KONTROL`, `DYNO_TEST`, `IC_KONDISYON`).
- Added `inspection_item_values` to the dealer portal live sync read path and Realtime table list.
- Enabled the local Supabase `supabase_realtime` publication for dealer work-order, task, evidence, mobile answer and final report tables.
- Added a dealer portal background sync fallback so new ERP/mobile changes no longer require the user to click `Canli Yenile`.
- Added `tools/local-dealer-auto-sync-smoke.mjs` to verify a technician answer reaches the portal without clicking manual refresh.
- Applied and verified the migration locally only.
- No remote Supabase or production database command was run.
- No secret, token or live credential was written into project files.

## Report Header Overlay Cleanup - 2026-08-18

- Removed the extra dynamic report number, date/time and page-count overlays from the locked A4 report letterhead in `apps/admin/prototype/index.html`.
- Kept the locked letterhead image as the single source for the visible top header chrome, preventing duplicated/overlapping top fields.
- Verified the report preview and PDF path locally with 23 pages, zero visible top overlay fields and zero console errors.
- No Supabase, live database, secret, token or production operation was used.

## ERP Report 2 Route Copy - 2026-08-18

- Added a separate ERP navigation route `#report2` named `Rapor 2` without removing or renaming the existing `#report-design` report screen.
- Reused the current A4 report design for `Rapor 2`, but separated layout-studio and letterhead persistence so edits in `Rapor 2` do not overwrite the old report design draft.
- Scoped report navigation, filters, mobile preview, layout studio and print actions to the active report page to avoid duplicate report-page IDs crossing between the old report and `Rapor 2`.
- Verified both `#report2` and `#report-design` locally with Chrome/Playwright and zero console errors.
- No Supabase, live database, secret, token or production operation was used.

## ERP Report 2 Final 24-Page Flow - 2026-08-18

- Updated only the separate `#report2` route with the final report sequence on the locked A4 letterhead; the original `#report-design` route remains unchanged at 22 pages.
- Capped the final report at 24 pages, keeping it below the 25-page product limit.
- Centered the report flow around the latest Kaporta & Boya and Sasi/Yapisal Govde preparation: 3 body-paint pages, 3 structural pages, then technical tests, vehicle memory, final approval and photo evidence.
- Added final flow, body-paint map summary, structural evidence summary and approval/scope pages for `Rapor 2`.
- Kept the photo/evidence archive as the final report page and moved digital vehicle card content into a condensed single page.
- Verified `#report2` desktop and mobile locally with Playwright: 24 pages, zero visible top header overlays, all letterheads loaded, zero console errors and a generated PDF.
- Updated the admin prototype smoke test report-page locator to assert rendered report titles instead of a hidden toolbar text match; the smoke test now passes again.
- No Supabase, live database, secret, token or production database operation was used.
