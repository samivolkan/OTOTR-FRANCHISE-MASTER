# finance-read

Authenticated, request-scoped finance read endpoint. The browser sends a publishable key and a Supabase user JWT. The function verifies the user, calls `finance_api.authorize_scope`, and only then reads the branch-scoped projection.

Required secrets/configuration:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`; legacy anon and secret keys are rejected)
- `OTOTR_FINANCE_ALLOWED_ORIGINS` (explicit comma-separated origins; `*` is rejected)

The function keeps the default `verify_jwt = true`. It performs no service-role or raw table access. Deployment remains blocked until the finance migration parity gate and `finance_api` RPCs are approved and applied.
