# finance-command

Authenticated, allowlisted and server-committed GM Finance command endpoint. It supports integration retry, payment lifecycle, dispute lifecycle, contract/rule lifecycle, and pass-through expense creation, share calculation, approval, posting and reversal commands.

Security boundaries:

- the browser sends its user JWT and never receives `SUPABASE_SERVICE_ROLE_KEY`;
- user-token authorization resolves the canonical legal entity, dealer account and branch from the error record;
- the request scope must exactly match that canonical scope;
- the Edge Function hashes the trimmed resolution note and canonical command intent with SHA-256; raw note text is not persisted;
- only the server-side service-role call can invoke `commit_integration_error_retry`;
- fee-rule updates are accepted only for draft rule/version pairs, resolve their canonical ERP finance scope with `finance.fee-rules.update`, and can invoke `commit_fee_rule_update` only through the service-role adapter;
- fee-rule command intent is canonically serialized and hashed before commit; optimistic version and idempotency conflicts are returned without overwriting a newer draft;
- contract-version submission, independent approval and publication are separate commands; the maker cannot approve their own version and only an approved version can be published;
- pass-through expense commands validate gross/net/tax equality, unique dealer/branch targets, immutable intent hashes, lifecycle state, headquarters role scope and maker-checker separation before the service-role commit;
- idempotent replay is returned as `REPLAY`; different intent with the same key is `409 CONFLICT`.

Required configuration: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and explicit `OTOTR_FINANCE_ALLOWED_ORIGINS`.
