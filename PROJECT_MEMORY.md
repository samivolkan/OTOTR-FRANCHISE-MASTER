# OTOTR Franchise System Project Memory

This file is the working memory for the OTOTR Franchise System.

Important: from now on, `OTOTR-FRANCHISE-MASTER` is the intended single source folder for clean future work. Code import has been completed in controlled groups, and `C:\Users\Samivolkannnn\Documents\ototr_25052026` remains a read-only baseline reference.

## Purpose

OTOTR Franchise System aims to manage the full franchise and branch operation lifecycle:

- franchise sales and application funnel,
- branch onboarding,
- branch operations,
- appointment and customer flow,
- vehicle intake and expertise/inspection,
- report generation and delivery,
- finance, royalty and payment tracking,
- quality control,
- support, academy and compliance,
- admin and HQ oversight.

## Business Rules

- Branches must be scoped by role and region.
- HQ/admin users can see global data.
- Region managers see assigned regions.
- Branch/bayi users see their own branch data.
- Technician users should only see assigned work/order tasks.
- Inspection reports require evidence, audit logs and final report controls.
- Demo/seed data must not be mixed with production data.
- RLS policies are part of the product boundary and must be tested.

## User Roles

Known or expected roles:

- CEO
- HQ / Genel Merkez
- Admin
- Region Manager / Bolge Muduru
- Franchise Manager
- Branch Owner / Bayi
- Branch Manager / Sube Muduru
- Technician / Usta
- Finance
- Quality
- Support
- Customer-facing/public report viewer

## Franchise / Branch Model

Core franchise entities:

- franchise applications,
- application steps,
- branches,
- dealer contracts,
- onboarding checklists and items,
- branch documents,
- branch equipment assets,
- user-region assignments,
- finance transactions,
- quality audits and findings,
- academy enrollments and certificates.

## Admin Panel Targets

Admin panel should support:

- global dashboard,
- franchise sales funnel,
- branch portfolio,
- operations KPIs,
- CRM leads and appointments,
- finance/royalty status,
- quality alerts,
- support tickets,
- academy tracking,
- audit and compliance views,
- RLS/role-aware access.

## Database Decisions

Current baseline database appears to be Supabase/Postgres.

Current SQL sources:

- `docs/migrations/*.sql`
- `data/inspection_sql_schema.sql`
- `data/inspection_seed.sql`
- `data/inspection_schema_normalized.json`
- `data/inspection_schema_web.js`

Decision pending:

- canonical migration runner folder,
- final migration order,
- separation of schema vs seed/demo cleanup,
- dev/staging/prod database separation.

## Architecture Decisions

Recommended direction:

- Use `OTOTR-FRANCHISE-MASTER` as the clean parent.
- Keep separate app boundaries:
  - `apps/web` for ERP/CRM/admin web,
  - `apps/admin` if admin is split,
  - `apps/api` for server-only APIs,
  - Flutter branch app can be imported as a separate app when ready,
  - Expo technician app can be imported separately.
- Keep shared business types in `packages/shared`.
- Keep database/migrations in `packages/database` or `infra/supabase`.

Current imported app boundaries:

- Flutter branch/operations app: `apps/mobile-branch`.
- Expo/React Native technician app: `apps/mobile-technician`.
- Admin/web prototype: `apps/admin/prototype`.
- Public web prototype: `apps/web/public-prototype`.
- Database raw sources: `packages/database`.

Public web source decision:

- Public website updates continue in `apps/web/public-prototype`, starting from `ototr-web.html`.
- Duplicate/reference copies under `apps/admin/prototype` are preserved but are not the active public website editing target.

Durable decision record:

- Main source-of-truth decision is recorded in `docs/decisions/2026-06-03-master-source-of-truth.md`.

## Learned Points

- `ototr_25052026` is currently the strongest source baseline.
- Current workspace `OTOTR_HAZİRAN` was initially empty except Git.
- Old folders are not identical copies; some important files differ by hash.
- There is no `.env.example` in the baseline scan.
- There are manual SQL migrations with RLS/security work.
- Some SQL files contain cleanup/delete behavior and must be reviewed before running.
- Static prototype, Flutter app and Expo app are separate code realities and should not be merged blindly.

## Development Rules

- Never delete old project folders during consolidation.
- Never run production/destructive database operations without explicit review.
- Never expose secrets in logs or reports.
- Create `.env.example`; keep real `.env` ignored.
- Import by copy only, not move.
- Log every migration/import action.
- Run tests after each import phase.
- Keep documentation updated with decisions.
- Treat this folder as the single clean source for future OTOTR work.
- Raw SQL files are review material until a tested local/staging migration chain is created.

## ChatGPT / Codex Workflow

Main ChatGPT project: `OTOTR Franchise Master`.

Conversation model:

- one main project,
- topic-specific conversations,
- one permanent local memory,
- one main folder,
- one reviewed database decision path.

The permanent workflow is documented in `docs/CHATGPT_WORKFLOW.md`.

Each topic conversation must end with:

- decisions made,
- files changed,
- tests run,
- risks discovered,
- decisions that should be added to this memory file.
