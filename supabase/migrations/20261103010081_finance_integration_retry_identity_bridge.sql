-- Real ERP identity and scope bridge for integration retry commands.
-- Browser roles may authorize their own scope, but only the server-side
-- service-role command adapter may invoke the commit RPC.

create or replace function finance_private.current_actor_can_retry_integration_error(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid
) returns boolean language plpgsql stable security definer
set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;
begin
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found then return false;end if;
  if not finance_private.current_actor_can_read_scope(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id,'getIntegrationError') then return false;end if;
  return u.role in('CEO','GENERAL_MANAGER','FINANCE','BRANCH_MANAGER');
end$$;

create or replace function finance_private.integration_retry_error_is_in_scope(
  p_error_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid
) returns boolean language sql stable security definer set search_path=pg_catalog,finance,finance_private as $$
  select finance_private.integration_error_is_in_scope(p_error_id,p_legal_entity_id,p_dealer_account_id,p_branch_id)
$$;

create or replace function finance_private.resolve_integration_retry_scope(p_error_id uuid)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance as $$
  select pg_catalog.jsonb_build_object(
    'legalEntityId',e.legal_entity_id,
    'dealerAccountId',e.redacted_detail->>'dealerAccountId',
    'branchId',e.redacted_detail->>'branchId'
  )
  from finance.integration_errors e
  where e.id=p_error_id
    and e.redacted_detail->>'dealerAccountId' is not null
    and e.redacted_detail->>'branchId' is not null
$$;

create or replace function finance_private.current_integration_retry_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$
  select coalesce(pg_catalog.current_setting('request.jwt.claim.role',true),'')='service_role'
$$;

revoke all on function finance_private.current_actor_can_retry_integration_error(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.integration_retry_error_is_in_scope(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.resolve_integration_retry_scope(uuid) from public,anon,authenticated;
revoke all on function finance_private.current_integration_retry_committer_is_trusted() from public,anon,authenticated;
grant execute on function finance_api.commit_integration_error_retry(uuid,uuid,uuid,uuid,uuid,text,text,bigint,text,text,uuid) to service_role;
