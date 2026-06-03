# Auth RLS Helper Order Review

Status date: 2026-06-03

No SQL was executed during this review. This is a static dependency note for the reviewed migration chain.

## Reviewed Inputs

- `packages/database/reviewed-migration-order.md`
- `packages/database/raw-migrations/schema-foundations/*`
- `packages/database/raw-migrations/rls-security/*`
- `packages/database/raw-migrations/rpc-functions/*`
- `packages/database/rls-verification-checklist.sql`
- `packages/database/rls-role-fixtures.template.sql`

## Required Order

1. Schema foundations must create base tables first.
2. Private RLS helper layer must exist before policies are tightened around `app_private.current_*` helpers.
3. Self-user lookup recursion fix must run before role-heavy `app_users` policies are trusted.
4. Flutter/mobile read policies can be reviewed only after branch/case scope helpers are available.
5. RPC functions must come after the tables, helper functions and base RLS policies they depend on.
6. Execute grants/revokes must be applied after all referenced functions exist.
7. Public report verification policies should be reviewed after final report and report delivery tables/functions exist.
8. Manual-only cleanup/seed/restore files must stay outside the automatic chain.

## Helper Dependency Notes

- `public.current_app_user()`, `public.current_app_user_id()` and `public.current_app_user_role()` are central to resolving `auth.uid()` into application identity.
- Branch policies depend on `current_user_can_access_branch` or the newer `app_private.current_user_can_access_branch` helpers.
- Region manager behavior depends on `user_region_assignments`; missing assignments should fail closed.
- Technician mutation behavior depends on task ownership/claim functions and must be tested with assigned and unassigned task fixtures.
- Report media storage policies depend on case/report branch access and must be checked separately from table RLS.

## Current Static Risk Flags

- Some schema foundation files already reference `app_private` helpers, so reviewed migrations must ensure helper definitions are present before those policies are relied on.
- Multiple hardening files alter function `search_path` and execute grants. These should be treated as one reviewed security layer, not ad hoc fixes.
- `security definer` functions in exposed schemas require explicit grant review and `search_path` verification.
- Views in public schema require `security_invoker` or restricted grants before frontend exposure.
- Role names in product contracts are broader than the current DB check constraints; compatibility mapping must stay explicit until SQL roles are expanded.

## Local/Staging Acceptance Criteria

- `packages/database/rls-verification-checklist.sql` returns no unexpected public table without RLS.
- `app_users.auth_user_id` exists and has uniqueness/index coverage.
- Authenticated user without an active `app_users` row cannot read operational data.
- Region manager fixture can read assigned-region branch rows and cannot read other-region branch rows.
- Branch manager fixture can read own branch rows and cannot read other branch rows.
- Technician fixture can mutate assigned/claimed task rows and cannot mutate unassigned task rows.
- Public verification can read only publishable report output and cannot read raw operational rows.
- Client anon/auth keys cannot call service-role-only operations.

## Blocker

Local executable validation still requires a healthy local/staging Supabase runtime. Do not run this against production to compensate for local Docker/Supabase blockers.
