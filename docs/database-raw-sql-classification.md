# Raw SQL Classification

Date: 2026-06-03

No migration was executed during this classification.

## Summary

| Group | Count | Status |
| --- | ---: | --- |
| schema foundations | 3 | review before promotion |
| RLS/security | 11 | review before promotion |
| RPC/functions | 6 | review before promotion |
| manual-only | 4 | never automatic production chain |
| raw schemas/seeds | 5 | reconcile separately |

## Schema Foundations

| File | Classification | Main coverage | Risk |
| --- | --- | --- | --- |
| `2026-05-24-expertise-report-backbone.sql` | schema + RLS + triggers + functions | branches, users, customers, vehicles, appointments, expertise cases, inspection tasks/evidence, report audit/gates/delivery | medium-high |
| `2026-05-25-crm-dealer-portal-backbone.sql` | schema + RLS + views + audit | CRM, franchise applications, onboarding, documents, contracts, equipment, finance, quality, support, academy, announcements, consent, web forms, audit events | medium-high |
| `2026-05-25-report-template-system.sql` | schema + RLS + storage policies + RPC | report templates, answers, files, group status, final reports, report media policies | medium-high |

## RLS and Security

| File | Classification | Main coverage | Risk |
| --- | --- | --- | --- |
| `2026-05-24-fix-app-users-self-rls-recursion.sql` | RLS helper/fix | `app_users` self/HQ policy recursion | medium |
| `2026-05-24-public-report-verification-security.sql` | view security | `security_invoker` for public report verification | low-medium |
| `2026-05-24-rls-read-policies-for-flutter.sql` | read policies | package, customer, vehicle, appointment reads for Flutter | medium |
| `2026-05-25-harden-security-advisor-warnings.sql` | hardening | report delivery permissions, execute revokes, indexes | medium |
| `2026-05-25-live-rls-safety-fixes.sql` | live RLS fix | `app_users` policy and view invoker safety | medium |
| `2026-05-25-move-report-delivery-policy-to-private-helper.sql` | policy refactor | report delivery policy helper move | medium |
| `2026-05-25-private-rls-helper-execute-hardening.sql` | execute hardening | private helper execution | medium |
| `2026-05-25-private-rls-helpers.sql` | RLS helper layer | private helper functions and many table policies | medium-high |
| `2026-05-25-public-rls-helper-execute-revoke.sql` | execute revoke | public helper execution revoke | medium |
| `2026-05-25-supabase-security-hardening.sql` | general hardening | permission and policy tightening, indexes | medium |
| `2026-05-26-report-audit-log-trigger-security-definer.sql` | function security fix | audit trigger function security definer | medium |

## RPC and Functions

| File | Classification | Main coverage | Risk |
| --- | --- | --- | --- |
| `2026-05-24-technical-task-ownership-rules.sql` | task ownership RPC/triggers | claim/release/assign/submit task flows and ownership triggers | medium-high |
| `2026-05-25-branch-work-order-rpc.sql` | work-order RPC | create/update branch work order and tasks | medium |
| `2026-05-25-list-branch-technicians.sql` | helper RPC | branch technician list | low-medium |
| `2026-05-25-manager-readonly-task-data.sql` | task RPC update | manager/task functions and ownership enforcement | medium-high |
| `2026-05-26-final-report-media-live-gate.sql` | report gate function/trigger | final report media completeness gate | medium-high |
| `2026-05-26-live-mobile-work-order-flow.sql` | mobile work-order RPC | live mobile create/submit flow | medium |

## Manual Only

| File | Classification | Reason |
| --- | --- | --- |
| `2026-05-23-smart-vin-work-orders.md` | design note | markdown note, not executable SQL |
| `2026-05-24-demo-seed-expertise-case.sql` | demo seed/manual | contains cleanup/delete behavior and demo data |
| `2026-05-25-restore-rls-helper-execute.sql` | restore/rollback style | not a normal forward migration |
| `2026-05-26-remove-demo-work-orders.sql` | cleanup/destructive | contains delete behavior |

## Raw Schemas

| File | Classification | Note |
| --- | --- | --- |
| `inspection_sql_schema.sql` | inspection schema source | reconcile with report template migrations |
| `inspection_seed.sql` | seed source | local/demo only until reviewed |
| `inspection_schema_normalized.json` | schema catalog | useful for app/report contract |
| `inspection_schema_web.js` | web schema source | reconcile with JSON and SQL |
| `inspection_firestore_seed.json` | legacy/alternate seed | not production SQL |

## Unsafe SQL Patterns

- `delete from` exists in manual-only files.
- `drop policy if exists` is common in policy replacement files.
- `drop trigger if exists` is common before trigger recreation.
- `security definer` functions require `search_path` and execute-grant review.
- storage object policies need upload/read/update tests.

## Promotion Rule

Only a reviewed copy may be promoted into `supabase/migrations`. Raw files must remain unchanged as imported evidence.

