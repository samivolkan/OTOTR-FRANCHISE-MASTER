# Auth And Roles

Current status: role model exists in docs, demo data and SQL/RLS migrations, but final production auth is not yet frozen.

## Known Roles

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
- Customer/public report viewer

## Access Principles

- HQ/admin can see global network data.
- Region manager can see assigned regions.
- Branch users can see only their branch.
- Technician users can see assigned work orders/tasks.
- Customer/public users can see only verified report outputs.

## Database/RLS Direction

Supabase RLS is part of the security boundary. Any production-ready database chain must test:

- self user lookup,
- branch scope,
- region scope,
- technician task ownership,
- report visibility,
- public report verification,
- service-role-only operations.

## Manual Review Required

- `packages/database/raw-migrations/rls-security`
- `packages/database/raw-migrations/rpc-functions`
- `apps/mobile-branch/lib/core/config/supabase_config.dart`
- `apps/mobile-technician/src/live/api.ts`

## Security Rules

- Do not place `service_role` in mobile or browser code.
- Real env files are not committed.
- Any hardcoded public URL/key fallback must be reviewed before live use.
- Production auth changes need staging tests and rollback plan.
