-- PostgREST roles need schema usage in addition to explicit RPC grants.
-- Remove inherited PUBLIC execute before exposing the API schema.
revoke execute on all functions in schema finance_api from public, anon;
revoke all on schema finance_api from public, anon;
grant usage on schema finance_api to authenticated, service_role;
