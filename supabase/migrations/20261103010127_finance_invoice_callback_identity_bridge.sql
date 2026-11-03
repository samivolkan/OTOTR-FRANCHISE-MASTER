-- Service-role identity bridge for external invoice callbacks.
-- Provider input is validated and the transition is derived by the server-only worker.

create or replace function finance_private.current_callback_caller_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

revoke all on function finance_private.current_callback_caller_is_trusted() from public,anon,authenticated;
revoke all on function finance_api.find_invoice_callback_context(text,text,text) from public,anon,authenticated;
revoke all on function finance_api.commit_invoice_callback(text,text,text,bigint,jsonb,jsonb,uuid) from public,anon,authenticated;
grant execute on function finance_api.find_invoice_callback_context(text,text,text) to service_role;
grant execute on function finance_api.commit_invoice_callback(text,text,text,bigint,jsonb,jsonb,uuid) to service_role;
