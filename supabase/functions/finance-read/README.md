# finance-read

Authenticated, request-scoped finance read endpoint. The browser sends a publishable key and a Supabase user JWT. The function verifies the user, calls `finance_api.authorize_scope`, and only then reads the branch-scoped projection.

Allowed operations are an explicit allowlist covering the 17 GM Finance read screens, including headquarters/operational health, contracts and rules, statements, payments, refunds, services, expenses, disputes, export packages, integration errors, approvals and audit traces. Arbitrary RPC names are rejected.

Required secrets/configuration:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`; legacy anon and secret keys are rejected)
- `OTOTR_FINANCE_ALLOWED_ORIGINS` (explicit comma-separated origins; `*` is rejected)

The function keeps the default `verify_jwt = true`. It performs no service-role or raw table access. Deployment remains blocked until the finance migration parity gate and `finance_api` RPCs are approved and applied.

The browser integration must provide the user token through the ERP shell's in-memory `window.OTOTR_FINANCE_AUTH.getAccessToken()` adapter. The finance module intentionally does not read the portal's legacy localStorage session. The ERP identity bridge must also resolve `legalEntityId`, `dealerAccountId`, and `branchId`; the current legacy `app_users` model only carries `branch_id` and is insufficient by itself.
