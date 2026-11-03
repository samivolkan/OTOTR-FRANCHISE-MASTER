# finance-command

Authenticated, allowlisted and server-committed GM Finance command endpoint. The first supported command is `retryIntegrationError`.

Security boundaries:

- the browser sends its user JWT and never receives `SUPABASE_SERVICE_ROLE_KEY`;
- user-token authorization resolves the canonical legal entity, dealer account and branch from the error record;
- the request scope must exactly match that canonical scope;
- the Edge Function hashes the trimmed resolution note and canonical command intent with SHA-256; raw note text is not persisted;
- only the server-side service-role call can invoke `commit_integration_error_retry`;
- idempotent replay is returned as `REPLAY`; different intent with the same key is `409 CONFLICT`.

Required configuration: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and explicit `OTOTR_FINANCE_ALLOWED_ORIGINS`.
