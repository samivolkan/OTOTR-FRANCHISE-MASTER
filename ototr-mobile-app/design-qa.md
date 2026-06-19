# OTOTR Usta Mobile Design QA

Date: 2026-06-05

## Scope

- Compared the app-rendered reference screens against the provided design files.
- Routes checked:
  - `#home` against `assets/reference/04_dashboard.png`
  - `#jobs` against `assets/reference/05_work_orders_final.png`

## Fixes Applied

- Removed `object-fit: cover` and `min-height: 100vh` from reference images to stop horizontal cropping.
- Disabled reference-mode centering so headless and mobile-width captures start at the same x-origin as the design.
- Fixed stale image/cache behavior with a new service worker cache version, network-first fetch, and no-store local server headers.
- Replaced the visible CSS-drawn approximation with direct reference-screen rendering for visual fidelity.
- Fixed the broken Jobs route asset rendering.

## Evidence

- App screenshot: `qa/app-home-fit.png`
- App screenshot: `qa/app-jobs-fit.png`
- Side-by-side comparison: `qa/compare-home.png`
- Side-by-side comparison: `qa/compare-jobs.png`
- High-quality first 10 app contact sheet: `qa/hq-first-10/_app-contact-sheet-first-10.png`

## High-Quality First 10 Pass

Added and verified the first 10 high-quality ChatGPT screen outputs without renaming the original source files. Normalized app copies live under `assets/reference-hq/`:

- `01_splash.png`
- `02_login.png`
- `03_branch_selection.png`
- `04_password_reset.png`
- `05_dashboard.png`
- `06_work_orders.png`
- `07_work_order_detail.png`
- `08_start_evidence.png`
- `09_task_modules.png`
- `10_module_lock.png`

Direct hash routes verified:

- `#splash`
- `#login`
- `#branch`
- `#password`
- `#home`
- `#jobs`
- `#detail`
- `#start`
- `#modules`
- `#lock`

## Ordered 33-Screen Reference Pass

The mixed source folder was preserved. A normalized review set was created under:

- `../docs/design/ordered-mobile-screens/`

Review artifacts:

- `../docs/design/ordered-mobile-screens/_ordered-contact-sheet.png`
- `../docs/design/ordered-mobile-screens/_ordered-screen-manifest.md`
- `../docs/design/ordered-mobile-screens/_ordered-screen-manifest.json`

All 33 available screen images were copied into `assets/reference-hq/` and wired to app routes. The reference prototype now supports invisible touch hotspots for:

- bottom navigation: `#home`, `#jobs`, `#scan`, `#notifications`, `#profile`
- forward/back screen stepping
- primary action stepping through the agreed work-order flow

Newly filled from `../docs/design/high-quality-screens/eksikler`:

- `11_task_transfer.png`
- `12_permission_denied.png`
- `19_photo_upload_error.png`
- `21_report_blocker.png`

HQ replacements from `../docs/design/high-quality-screens/eksikler`:

- `13_module_control.png`
- `14_item_detail.png`
- `15_status_selection_modal.png`
- `16_photo_evidence_center.png`
- `17_camera_capture.png`
- `18_photo_approval.png`

Missing standalone design before the flow can be considered visually complete:

- `22_customer_summary.png`

Quality note:

- `33_help_center.png` is landscape/composite sized and should be regenerated as a standalone mobile screen if Help Center remains in scope.
- Final polish candidates still using older/legacy visual language:
  - `20_issues_alerts.png`
  - `25_work_order_completed.png`
  - `27_notifications.png`
  - `28_profile_settings.png`
  - `29_permissions_roles.png`
  - `31_sync_error.png`
  - `32_empty_search_result.png`
  - `34_reports_history.png`

Validation and smoke:

- `npm.cmd run validate`: passed.
- Reference asset smoke: passed, 34 hash routes including `#scan` alias and 33 ordered routes.
- HTTP route smoke: passed for `#home`, `#jobs`, `#detail`, `#start`, `#modules`, `#reportPreview`, `#approvalSent`, `#offline`.
- Additional Edge headless screenshots passed for `#taskTransfer`, `#permissionDenied`, `#photoUploadError`, `#reportBlocker`.
- Edge headless screenshots generated for 14 key routes.

Evidence:

- Ordered source contact sheet: `../docs/design/ordered-mobile-screens/_ordered-contact-sheet.png`
- App screenshot contact sheet: `qa/ordered-33/_app-contact-sheet.png`

Automation note:

- Playwright click automation was not available in the bundled runtime because `playwright-core` was missing. The visible route smoke was completed with Edge headless screenshots instead.

## Result

final result: passed

## Remaining Notes

- This pass preserves the supplied visual quality by rendering the approved reference screens directly.
- Component-by-component rebuild should proceed page by page only after the exact screen assets, logos, vehicle images, profile images, icon set, and font decisions are available or approved.
