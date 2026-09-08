# Kaporta 360 studio — reviewed additive migration

Date: 2026-09-08. Target: verified `ototr-staging` project `bsjkohwbtrfwrqcyhsfz`. No real customer session was created, modified or used as a test fixture.

Reviewed execution set: **only** `20260908104520_kaporta_360_presentation_studio.sql`, after the two previously applied Kaporta migrations. Generated using Supabase CLI 2.117.0. The CLI file and reviewed copy have identical SHA-256:

`a76b37b0cfccecf8e0e5b1fdd63cd45567ed3350ad3376e3feeb033aa7334c73`

Remote migration recorded as `20260908111128 / kaporta_360_presentation_studio` by the connector. The local filename retains the original CLI creation timestamp; do not run a broad migration push against the unrelated June migration backlog. Future migration-history reconciliation must account for the connector timestamp explicitly.

## Review findings

- Only one nullable-free defaulted JSON column, private validation functions, an authenticated save RPC and a review-transition trigger are added. No deletion, destructive alteration, role/schema migration of ERP business tables or replacement of ownership/approval functions.
- Strict accepted fields, type/length/count limits, profile/part validation, own-session immutable photo references, active-slot requirement, evidence links, SHA match, normalized non-crossing polygons and exact existing measurement values are validated server-side.
- Original/upper binding must use the current capture. Detail binding must be attached evidence for the selected part. Narration references an examined part and evidence; cutout narration references a reviewed binding.
- Existing owner/branch/role/task/case/session gates and optimistic revision are reused with matching row locks. Every studio editor is added to the self-approval exclusion list.
- Both submit and approve validate the plan inside the existing transaction. A rejection during approval rolls back the report snapshot insertion too. Existing final ERP report lock, capability lifetime and revocation gates remain intact.
- Legacy `{}` plans keep existing behavior. An explicitly disabled valid plan disables only this optional preparation workflow, never the mandatory inspection or final approval requirements.
- The client cannot invoke private helpers or directly mutate session tables. SECURITY DEFINER is intentional for the guarded public RPC, with an empty search path.

## Validation and deployed metadata

Exact SQL passed the PGlite/PostgreSQL suite alongside existing ownership/RLS/approval cases. Added synthetic assertions cover anonymous/foreign/non-owner save, stale revision, unknown fields/model, crossing polygons, wrong SHA, unattached detail, altered measurement and out-of-bounds pin, invalid duration, incomplete manual checks, review freeze and immutable prepared report snapshots. Domain and Edge Function tests passed in the 46-test suite.

After applying to staging: studio column exists; RLS enabled; anonymous save false; authenticated save true; direct authenticated UPDATE false; client private-validator execution false; exactly one enabled review guard trigger. Read-only public probes: anonymous save 401, nonexistent capability 404, unexpected Origin 403, authorized preflight 204.

Customer Edge Function `kaporta-360-report` deployed **version 2**, ACTIVE. The custom capability authentication remains in the request body, so gateway JWT checking retains its previous disabled setting. No service key is published. Photo dimensions/hash and minimal approved studio content are added; equipment/check internals and original object paths remain server-side.

Security advisor review identifies one additional [authenticated SECURITY DEFINER notice](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) for `k360_save_studio`. This is the intentional guarded RPC boundary described above, not an anonymous grant. Existing [RLS without policy notices](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) for reports, shares and events reflect deliberately denied client table access. No module missing-RLS or anonymous-executable finding was introduced. Unrelated project notices are outside this change.

Rollback: restore prior frontend/Edge Function versions and revoke the new save RPC if preparation writes must stop. Keep evidence, studio values, reports and audit events. Do not remove the column or bypass the technical-review guard as a routine rollback. Physical Android/iPhone capture, an identified OTOTR vehicle and independent field approval are still required before broader rollout.
