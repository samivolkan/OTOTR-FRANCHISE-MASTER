# API Plan And Contracts

Status date: 2026-06-03

## Current Decision

OTOTR backend work will proceed in layers:

1. Supabase/Postgres remains the first data backbone.
2. Mobile and browser clients use anon/publishable keys only, protected by RLS.
3. Server-only endpoints are implemented first as Supabase Edge Functions when service-role access, public forms, external integrations, payments, SMS/WhatsApp, Google services or report generation require private credentials.
4. `apps/api` is reserved for a future dedicated Node/NestJS/Fastify API only if Edge Functions and Supabase RPCs are no longer enough.

Do not start a separate production API server until the mobile branch app and bayi portal contracts prove that a dedicated server is needed.

## Existing API Surface

### Public Web Edge Function

Implementation:

- `supabase/functions/public-api/index.ts`
- Supabase function name: `public-api`
- JWT verification: disabled in `supabase/config.toml` because the public website visitor is not logged in.

Staging notes:

- `docs/public-web-supabase-staging.md`

Routes:

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/branches` | Lists active public branches. | Public Edge Function origin check |
| `GET` | `/stats` | Returns public landing-page counters. | Public Edge Function origin check |
| `GET` | `/reports/verify?query=...&verifyCode=...` | Verifies a public report by report no or plate plus verify code. | Public Edge Function origin check |
| `POST` | `/appointments` | Creates a public appointment request. | Public Edge Function origin check |
| `POST` | `/franchise-applications` | Creates a public franchise application. | Public Edge Function origin check |
| `POST` | `/complaints` | Creates a public complaint or objection request. | Public Edge Function origin check |

Response convention for public mutations:

```json
{
  "ok": true,
  "referenceNo": "WEB-CRM-XXXXXXXX"
}
```

Error convention:

```json
{
  "ok": false,
  "error": "Human-readable Turkish error message."
}
```

Security rules:

- `SUPABASE_SERVICE_ROLE_KEY` stays only in the Edge Function environment.
- Browser/mobile clients must never receive service-role values.
- CORS is controlled by `OTOTR_ALLOWED_ORIGINS` plus the built-in localhost, GitHub Pages and OTOTR domain allow-list.
- Honeypot form payloads are accepted with `202` and are not inserted.

## Mobile And Bayi Portal Contract Direction

The branch mobile app and technician app currently use Supabase tables/RPCs directly. Keep that model until the UI flows stabilize.

Current app contract map:

- `docs/database-app-contract-map.md`
- `docs/mobile-bayi-api-contracts.md`

Near-term mobile/bayi portal contracts must be documented before refactors rely on them:

| Domain | First Contract | Expected Backend Shape |
| --- | --- | --- |
| Current user scope | current profile, role, branch and region scope | Supabase auth + RLS, optional RPC |
| Branch dashboard | branch card, KPIs, today's work orders | Supabase read/RPC |
| Appointments | list, create, update status, assign branch/staff | Supabase table/RPC first |
| Work orders | create, detail, task status, technician ownership | Existing reviewed RPCs first |
| Vehicle intake | customer, vehicle, package, consent, initial evidence | Supabase table/RPC first |
| Inspection entry | task claim, answer save, media upload, submit | Existing RPC + storage policies |
| Final reports | preview, gate checks, lock/finalize, delivery | RPC/Edge Function if PDF/rendering needs server credentials |
| Finance/royalty | payment events, royalty records, reconciliation | Server-only API required when payment provider is added |
| Quality/support | complaint, audit, finding, ticket flows | Supabase RLS first; server-only for external notifications |

## Server-Only Candidates

Use Edge Functions or a future `apps/api` server for:

- payment provider callbacks and reconciliation,
- SMS, WhatsApp, email or Google integrations,
- report PDF generation if private templates, storage signing or service role is required,
- public report verification,
- public website form intake,
- admin-only bulk actions,
- any operation requiring `SUPABASE_SERVICE_ROLE_KEY`.

## Testing Rules

- Public Edge Functions require local or staging Supabase validation before production changes.
- Database/RLS changes must be reviewed with `docs/auth-and-roles.md`, `docs/database.md` and `docs/database-app-contract-map.md`.
- Mobile/browser app changes must keep anon/publishable key usage only.
- API contract changes must be logged in `TEST_RESULTS.md` and `MIGRATION_LOG.md`.

## Next Backend Steps

1. Keep the existing public Edge Function as the active server-only API surface.
2. Freeze the first mobile/bayi portal contract list from active screens.
3. Verify reviewed migrations locally or in staging before changing live API behavior.
4. Add tests for `public-api` when Deno/Supabase CLI tooling is available.
5. Revisit `apps/api` only after the MVP flows show a dedicated server is necessary.
