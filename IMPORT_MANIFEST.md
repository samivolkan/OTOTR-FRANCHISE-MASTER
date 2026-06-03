# Import Manifest

Import date: 2026-06-03
Source baseline: `C:\Users\Samivolkannnn\Documents\ototr_25052026`

This manifest records copied source groups. Old source folders were not deleted or moved.

## Database

Target: `packages/database`

Imported:

- `docs/migrations/*.sql` and `2026-05-23-smart-vin-work-orders.md`, grouped under:
  - `raw-migrations/schema-foundations`
  - `raw-migrations/rls-security`
  - `raw-migrations/rpc-functions`
  - `raw-migrations/manual-only`
- `data/inspection_sql_schema.sql`
- `data/inspection_seed.sql`
- `data/inspection_schema_normalized.json`
- `data/inspection_schema_web.js`
- `data/inspection_firestore_seed.json`

Important: no migration was executed. `manual-only` files are not production migration candidates.

## Flutter Branch / Operations App

Target: `apps/mobile-branch`

Imported:

- `pubspec.yaml`
- `pubspec.lock`
- `analysis_options.yaml`
- `.metadata`
- `README.md`
- `lib`
- `test`
- `android`
- `web`
- `windows`
- selected runtime `data` files

Excluded:

- `build`
- `.dart_tool`
- `.codex-screenshots`
- `artifacts`
- generated APK/AAB files
- real env files

Manual review required:

- `lib/core/config/supabase_config.dart`
- `lib/data/remote/supabase_*.dart`
- `lib/data/repositories/app_repositories.dart`
- upload/media services and technician evidence/report screens

Import note:

- The copied Android `.gitignore` was adjusted so `gradlew`, `gradlew.bat` and `gradle-wrapper.jar` can be tracked. Build/cache/local secrets remain ignored.

## Expo / React Native Technician App

Target: `apps/mobile-technician`

Imported:

- `src`
- `assets`
- `App.tsx`
- `index.ts`
- `app.json`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `README.md`
- `LICENSE`
- `.gitignore`
- `AGENTS.md`

Excluded:

- `node_modules`
- `.expo`
- `dist`
- `artifacts`
- generated APK files
- Android build outputs
- real env files

Manual review required:

- `src/live/api.ts`
- Supabase public env fallback handling
- any Android prebuild workflow before release

## Web / Admin Prototype

Target: `apps/admin/prototype`

Imported:

- `index.html`
- `index2.html`
- `index3.html`
- `ototr-web.html`
- `ototr-android-preview.html`
- `index-local-upload.html`
- `src`
- `tools`
- `bayi-portal`
- `data/inspection_schema_web.js`
- required runtime docs/assets:
  - `docs/kaporta-boya-harita.png`
  - `docs/obd-module-map.png`
  - `docs/airbag-srs-kontrol.png`
  - `docs/ototr-favicon.svg`
  - `docs/1000km-garanti.png`

Target: `apps/web/public-prototype`

Imported:

- `ototr-web.html`
- `web2.html`
- `ototr-android-firebase-test.html`

Manual review required:

- split large `index.html` before production work,
- verify hardcoded external URLs,
- verify browser smoke tests after any refactor.

Validation note:

- `tools/test-index.mjs` has been replaced with a stable master smoke test and now passes.
- `tools/test-demo-data.mjs` and `tools/test-vin-service.mjs` pass.

## Priority B Documentation

Target: `archive/old-notes/imported-docs-priority-b-2026-06-03`

Imported:

- `bayi-usta-rapor-giris-mvp.md`
- `ototr-android-mobile-roadmap.md`
- `ototr-android-technician-mvp-plan.md`
- `ototr-flutter-report-backbone-implementation-plan.md`
- `dealer-staff-task-management-plan.md`

## Thread Source Archive

Target: `docs/thread-sources/_legacy-ototr-25052026`

Imported on 2026-06-03:

- `docs` source folder from `C:\Users\Samivolkannnn\Documents\ototr_25052026`
- `data` source folder from `C:\Users\Samivolkannnn\Documents\ototr_25052026`
- `images` source folder from `C:\Users\Samivolkannnn\Documents\ototr_25052026`
- selected old root snapshots:
  - `README.md`
  - `AGENTS.md`
  - `index.html`
  - `index2.html`
  - `index3.html`
  - `ototr-web.html`
  - `ototr-android-preview.html`
  - `ototr-android-firebase-test.html`
  - `ototr-cockpit-format-qa.png`
  - `ototr-cockpit-secretary-detail-qa.png`
  - `window_dump.xml`

Purpose:

- Preserve useful old ERP, CRM, Academy, legal, complaint, quality, report, warranty, Google Business and design work as topic-conversation source material.
- Avoid overwriting active app code while still making the old work easy to find.
- Let each topic conversation start from `docs/thread-sources/README.md`.

Imported file count: 83.

## Still Not Imported

By design:

- generated builds and caches,
- old project folders as full copies,
- production env files,
- screenshots/browser profiles,
- APK/AAB outputs.
