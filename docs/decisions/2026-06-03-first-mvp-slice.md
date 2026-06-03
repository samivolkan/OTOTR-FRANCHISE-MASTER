# First MVP Slice

Date: 2026-06-03

## Decision

The first MVP implementation slice is:

- CEO cockpit
- CRM lead records
- Appointment management
- Branch card
- Franchise sales funnel
- Finance and royalty tracking
- Quality and crisis alerts
- Audit history

## Context

The project now has controlled app imports, reviewed database migration drafts, public web staging notes and baseline test coverage. The next product work must stay aligned with database/RLS validation and app contract verification.

## Alternatives Considered

- Start with public website polish only.
- Start with mobile technician workflow only.
- Start with full ERP scope at once.

These were rejected for the first MVP slice because OTOTR needs an HQ-operational core that connects franchise growth, branch operations, finance and quality control before broader feature expansion.

## Risk

- Live-data behavior depends on local/staging database validation.
- RLS policies must be proven for admin, region manager, branch user and technician roles.
- Finance and royalty screens must not imply real payment-provider integration until provider contracts are defined.

## Rollback Or Revision Path

- Keep MVP work in small vertical slices.
- Each slice must include database contract, app UI, tests and a decision/update note.
- If database validation fails, pause live-data behavior and continue only with mock/prototype-safe UI work.

## Affected Areas

- `apps/admin/prototype`
- `apps/mobile-branch`
- `apps/mobile-technician`
- `packages/database`
- `supabase/migrations`
- `docs/api.md`
- `docs/auth-and-roles.md`

## Validation

MVP scope decision only. No production database command was run.
