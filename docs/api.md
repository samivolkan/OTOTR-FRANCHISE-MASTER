# API Plan

Current status: no dedicated production API server has been finalized.

## Existing Signals

- Admin prototype uses a localStorage mock backend.
- Flutter branch app uses Supabase-oriented repositories and remote data sources.
- Expo technician app has `src/live/api.ts` for live Supabase-oriented access.
- Database migrations include RPC/function files under `packages/database/raw-migrations/rpc-functions`.

## API Direction

Recommended API approach:

- Use Supabase/Postgres as the first data backbone.
- Keep public anon/publishable client access limited by RLS.
- Add server-only API endpoints where service role, payments, Google integrations, SMS/WhatsApp or report generation require private credentials.

## Initial API Domains

- Auth/session and current user scope.
- Franchise application and lead management.
- Branch and staff management.
- Appointment and work order management.
- Vehicle intake and inspection.
- Report templates and final reports.
- Finance/royalty/payment events.
- Quality/audit/support workflows.
- Public report verification.

## Rules

- Never expose service role keys to web/mobile clients.
- API contracts must be documented before app refactors rely on them.
- External integrations must go through server-only routes.
- API changes that affect RLS must be reviewed with `docs/auth-and-roles.md` and `docs/database.md`.
