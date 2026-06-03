# Master Source Of Truth

Date: 2026-06-03

## Decision

`OTOTR-FRANCHISE-MASTER` is the single clean source folder for future OTOTR Franchise System work.

Imported source groups under this folder are the active working copies:

- `apps/mobile-branch`
- `apps/mobile-technician`
- `apps/admin/prototype`
- `apps/web/public-prototype`
- `packages/database`

Old OTOTR folders remain reference/archive material only. They must not be deleted, moved, overwritten, or treated as active source without a specific review/import task.

## Context

The audit found the strongest historical baseline at:

`C:\Users\Samivolkannnn\Documents\ototr_25052026`

The migration work then copied selected source groups into the master folder and recorded the import in `IMPORT_MANIFEST.md` and `MIGRATION_LOG.md`.

## Alternatives Considered

- Continue working directly from `ototr_25052026`.
- Merge old project folders without review.
- Keep multiple active source folders.

These were rejected because the old folders differ by file hash, contain generated artifacts, and mix static web, Flutter, Expo, SQL, tools, docs and test outputs.

## Risk

- Some copied apps may still contain public Supabase fallback config that needs review.
- Raw SQL files are not yet an executable production migration chain.
- Documentation paths may show mojibake for the Turkish workspace character in older notes; use the actual filesystem path when running commands.
- Large admin prototype refactors can break behavior unless smoke tests are preserved.

## Rollback Or Revision Path

- Old folders remain untouched, so any import can be compared against the baseline.
- For app refactors, restore only the affected imported files from the baseline copy after reviewing `IMPORT_MANIFEST.md`.
- For database work, do not run production migrations until local/staging validation and backup/export strategy are documented.

## Affected Files And Areas

- `PROJECT_MEMORY.md`
- `README.md`
- `IMPORT_MANIFEST.md`
- `MIGRATION_LOG.md`
- `TEST_RESULTS.md`
- `NEXT_PHASES.md`
- `docs/CHATGPT_WORKFLOW.md`
- `apps/mobile-branch`
- `apps/mobile-technician`
- `apps/admin/prototype`
- `apps/web/public-prototype`
- `packages/database`

## Validation

No code or database command was run for this decision note.

Previous recorded validation in `TEST_RESULTS.md`:

- Flutter analyze/test passed through `C:\ototr_master`.
- Expo TypeScript typecheck passed.
- Admin prototype demo-data, VIN service and smoke tests passed.
