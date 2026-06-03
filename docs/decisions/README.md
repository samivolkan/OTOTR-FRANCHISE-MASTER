# Decisions

Use this folder for durable architecture and product decisions.

## Decision Format

Each decision note should include:

- date,
- decision,
- context,
- alternatives considered,
- risk,
- rollback or revision path,
- affected files/apps,
- tests or validation.

## Current Durable Decisions

- Main source folder is `OTOTR-FRANCHISE-MASTER`.
- Old folders remain reference/archive only.
- Supabase/Postgres is the current database backbone candidate.
- Raw migrations are imported but not production execution-ready.
- Flutter branch app and Expo technician app remain separate until backend contracts are stable.
- Admin prototype is preserved as a working prototype before modular refactor.

## Decision Notes

- `2026-06-03-master-source-of-truth.md`
- `2026-06-03-first-mvp-slice.md`
