# Mobile Branch Auth Session Design

Status date: 2026-06-03

This document defines the safe target before replacing the branch app's legacy/demo login surface.

## Current State

- `apps/mobile-branch/lib/core/config/supabase_config.dart` reads Supabase URL and anon key only from compile-time environment values.
- `apps/mobile-branch/lib/data/repositories/app_repositories.dart` initializes Supabase, optionally signs in with test credentials, and loads the active `app_users` row through `auth_user_id`.
- `apps/mobile-branch/lib/data/services/auth_service.dart` is still a legacy demo service and must not become the live authorization source.
- The login screen still behaves as a direct navigation/demo-style entry point and is not yet a full email/password session screen.

## Live Session Target

The live branch app session must use Supabase Auth as the only session authority.

Required flow:

1. Read `OTOTR_SUPABASE_URL` and `OTOTR_SUPABASE_ANON_KEY` from environment.
2. Fail closed when either value is missing.
3. Sign in with Supabase Auth using email/password.
4. Resolve the active application user from `public.app_users` where `auth_user_id = auth.uid()`.
5. Require `is_active = true`.
6. Resolve branch and role from the database row, not from editable user metadata.
7. Initialize repositories only after the active app user is loaded.
8. On logout, call Supabase sign-out and clear app repository/session state.

## Demo Login Separation

- Demo login must stay clearly labeled as local/demo-only when used.
- Demo/test credentials must be provided only through local environment variables.
- No demo user, password, branch code or fallback Supabase project value may be hardcoded into the live login path.
- The live login screen should not navigate to the dashboard until Supabase sign-in and `app_users` lookup both succeed.

## UI Requirements

- Email/password fields must be user-entered values, not fixed initial values.
- Branch code can be displayed only as resolved branch context after login, unless a future branch selection flow is explicitly designed.
- Login error messages must be safe and generic; do not expose raw token, key, SQL or RLS internals.
- Logout must be reachable from authenticated app surfaces.

## Authorization Requirements

- Branch manager and branch owner style users must remain branch-scoped.
- Reception-style users must not see finance-sensitive or manager-only mutation fields.
- Technicians must use assigned task scope for task mutation.
- HQ/quality users may read broader data only when RLS grants it.
- Any UI permission check is a usability layer only; the database policy is the security boundary.

## Implementation Acceptance Criteria

- `flutter analyze` passes through `C:\ototr_master\apps\mobile-branch`.
- `flutter test` passes through `C:\ototr_master\apps\mobile-branch`.
- Missing Supabase config produces a controlled login/setup error and no demo-data fallback.
- Authenticated user without active `app_users` row cannot enter live workflows.
- Branch-scoped test user cannot read another branch's work order in staging/local RLS tests.
- Technician test user cannot mutate unassigned tasks in staging/local RLS tests.

## Deployment Blocker

- Phone password recovery must not ship until Supabase phone/SMS provider settings are configured and staging live SMS OTP delivery is verified end to end.
- Email password recovery must not ship until the reset redirect URL and new-password flow are verified in staging.
- Local/demo fallback is acceptable for development tests only and cannot be used as production evidence.

## Follow-Up Code Work

- Replace the legacy `AuthService.demoLogin()` dependency with an explicit live session service.
- Update `LoginScreen` to collect credentials and wait for live session resolution.
- Add a repository/session reset method for logout.
- Add widget/service tests for missing config, failed login and missing `app_users` row.
