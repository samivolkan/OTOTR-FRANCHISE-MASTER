# OTOTR Shared Contracts

This package is reserved for shared OTOTR business constants and contract definitions.

Current status:

- Contract source only.
- Not imported by app surfaces yet.
- TypeScript contracts are used as a readable canonical reference for admin, API, mobile and database planning.

Rules:

- Do not put secrets, API keys or environment values here.
- Do not add runtime dependencies until a package manager/workspace decision is finalized.
- Keep names aligned with `docs/erp-operations-contracts-21-25.md`.
- Flutter must not import this TypeScript file directly; generate or mirror platform-specific constants in a later reviewed step.

Current files:

- `src/erp-contracts.ts`: ERP roles, scopes, appointment statuses, work order statuses, gate keys and capacity contracts.
- `src/auth-contracts.test.ts`: compile-time/runtime contract assertions for auth role matrix coverage.

Role note:

- Product-facing roles are exposed as `OTOTR_ROLES`.
- Current reviewed database role values are exposed as `OTOTR_DB_ROLES`.
- `ROLE_TO_DB_ROLE` and `DB_ROLE_TO_ROLE` document the temporary mapping until app, SQL and product role names are fully unified.
- `AUTH_ROLE_MATRIX` and `AUTH_RLS_TEST_SCENARIOS` document the reviewed auth/RLS contract surface for app and database planning.
