# Architecture

Source references:

- `archive/old-notes/imported-docs-priority-a-2026-06-03/calisma-duzeni.md`
- `archive/old-notes/imported-docs-priority-a-2026-06-03/erp-crm-roadmap.md`
- `archive/old-notes/imported-docs-priority-a-2026-06-03/sprint-1-backlog.md`

## Current Baseline

Previous active baseline:

`C:\Users\Samivolkannnn\Documents\ototr_25052026`

New clean target:

`C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER`

`ototr_25052026` remains the source reference until controlled imports are completed.

## Existing Code Surfaces

- Static ERP/CRM prototype: `index.html`, `src`, `tools`.
- Bayi portal static entry: `bayi-portal/index.html`.
- Flutter branch/mobile app: `lib`, `android`, `web`, `windows`, `test`.
- Expo/React Native technician app: `ototr-usta-app`.
- Database and planning docs: `docs`, `data`, `docs/migrations`.

## Target App Boundaries

Recommended master layout:

- `apps/web`: public web, franchise lead forms and customer-facing surfaces.
- `apps/admin`: HQ ERP/CRM, franchise pipeline, finance, quality and network control.
- `apps/mobile-branch`: imported Flutter branch/operations app candidate.
- `apps/mobile-technician`: imported Expo/React Native technician app candidate.
- `apps/api`: server-only API layer if Supabase alone is not enough.
- `packages/database`: canonical schema, migrations, seeds and database docs.
- `packages/shared`: shared types, role constants and business rules.
- `packages/ui`: shared web UI if React/Next app is selected.
- `infra/supabase`: Supabase local/staging setup and reviewed migrations.

## Technical Direction

Preferred target stack from existing docs:

- Frontend/admin: React or Next.js.
- Backend/API: Node.js/NestJS or Laravel, decision pending.
- Database: PostgreSQL/Supabase.
- File/report storage: S3-compatible object storage or Supabase Storage.
- BI/reporting: PostgreSQL views plus dashboard layer.
- Auth: role-based access with audit log.

## Import Rule

Do not merge all code at once.

Safe order:

1. documentation and project memory,
2. database/migration package,
3. one app surface,
4. tests and smoke checks,
5. next app surface.

## MVP Scope

Initial real MVP modules:

- CEO cockpit,
- CRM lead records,
- appointment management,
- branch card,
- franchise sales funnel,
- finance/royalty tracking,
- quality/crisis alerts,
- audit history.

## Open Architecture Decisions

- Static prototype refactor vs new Next.js admin app.
- Node.js/NestJS vs Laravel backend.
- Supabase-only API vs custom API layer.
- Flutter branch app and Expo technician app continuation strategy.
- Monorepo package manager after app choices are finalized.

See `mobile-import-plan.md` for mobile import boundaries.
