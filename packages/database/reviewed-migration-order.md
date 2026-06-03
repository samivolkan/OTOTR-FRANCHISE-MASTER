# Reviewed Migration Order Draft

Date: 2026-06-03

This is a review queue, not an execution instruction. No file listed here should be run against staging or production until it has passed local validation and role/RLS checks.

## Group 1 - Schema Foundations

1. `packages/database/raw-migrations/schema-foundations/2026-05-24-expertise-report-backbone.sql`
2. `packages/database/raw-migrations/schema-foundations/2026-05-25-crm-dealer-portal-backbone.sql`
3. `packages/database/raw-migrations/schema-foundations/2026-05-25-report-template-system.sql`

Review focus:

- table creation order,
- extension usage,
- trigger idempotency,
- view safety,
- `security definer` functions,
- RLS enablement on exposed `public` tables.

## Group 2 - RLS and Security

1. `packages/database/raw-migrations/rls-security/2026-05-25-private-rls-helpers.sql`
2. `packages/database/raw-migrations/rls-security/2026-05-24-fix-app-users-self-rls-recursion.sql`
3. `packages/database/raw-migrations/rls-security/2026-05-24-rls-read-policies-for-flutter.sql`
4. `packages/database/raw-migrations/rls-security/2026-05-25-live-rls-safety-fixes.sql`
5. `packages/database/raw-migrations/rls-security/2026-05-25-harden-security-advisor-warnings.sql`
6. `packages/database/raw-migrations/rls-security/2026-05-25-supabase-security-hardening.sql`
7. `packages/database/raw-migrations/rls-security/2026-05-25-move-report-delivery-policy-to-private-helper.sql`
8. `packages/database/raw-migrations/rls-security/2026-05-25-private-rls-helper-execute-hardening.sql`
9. `packages/database/raw-migrations/rls-security/2026-05-25-public-rls-helper-execute-revoke.sql`
10. `packages/database/raw-migrations/rls-security/2026-05-26-report-audit-log-trigger-security-definer.sql`
11. `packages/database/raw-migrations/rls-security/2026-05-24-public-report-verification-security.sql`

Review focus:

- policy replacement order,
- helper function schema placement,
- execute grants and revokes,
- `security_invoker` views,
- role matrix behavior for HQ, region manager, branch user and technician.

## Group 3 - RPC and Function Layer

1. `packages/database/raw-migrations/rpc-functions/2026-05-24-technical-task-ownership-rules.sql`
2. `packages/database/raw-migrations/rpc-functions/2026-05-25-branch-work-order-rpc.sql`
3. `packages/database/raw-migrations/rpc-functions/2026-05-25-list-branch-technicians.sql`
4. `packages/database/raw-migrations/rpc-functions/2026-05-25-manager-readonly-task-data.sql`
5. `packages/database/raw-migrations/rpc-functions/2026-05-26-live-mobile-work-order-flow.sql`
6. `packages/database/raw-migrations/rpc-functions/2026-05-26-final-report-media-live-gate.sql`

Review focus:

- duplicate function definitions,
- public RPC surface,
- `security definer set search_path`,
- app call compatibility,
- task ownership and report locking behavior.

## Manual Only

These files are not automatic migration candidates:

- `packages/database/raw-migrations/manual-only/2026-05-23-smart-vin-work-orders.md`
- `packages/database/raw-migrations/manual-only/2026-05-24-demo-seed-expertise-case.sql`
- `packages/database/raw-migrations/manual-only/2026-05-25-restore-rls-helper-execute.sql`
- `packages/database/raw-migrations/manual-only/2026-05-26-remove-demo-work-orders.sql`

Reason:

- design-only note,
- demo seed with cleanup statements,
- rollback/restore style SQL,
- cleanup/destructive intent.

