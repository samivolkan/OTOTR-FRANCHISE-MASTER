-- Resolve a branch manager's finance scope from the verified ERP auth identity.
-- Browser supplied legal/dealer/branch identifiers are intentionally excluded.

create or replace function finance_api.resolve_erp_session_branch_finance_scope(
  p_auth_user_id uuid
) returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_user public.app_users%rowtype;
  v_count integer;
  v_legal_entity_id uuid;
  v_dealer_account_id uuid;
  v_branch_id uuid;
begin
  if coalesce(pg_catalog.current_setting('request.jwt.claim.role',true),'') <> 'service_role' then
    raise exception using errcode='42501',message='ERP session finance scope resolver denied';
  end if;
  if p_auth_user_id is null then
    raise exception using errcode='22023',message='ERP auth user id is required';
  end if;

  select * into v_user
  from public.app_users u
  where u.auth_user_id=p_auth_user_id and u.is_active
  limit 1;
  if not found or v_user.role<>'BRANCH_MANAGER' or v_user.branch_id is null then return null;end if;

  select pg_catalog.count(*),pg_catalog.min(m.legal_entity_id::text)::uuid,
         pg_catalog.min(m.dealer_account_id::text)::uuid,pg_catalog.min(m.finance_branch_id::text)::uuid
    into v_count,v_legal_entity_id,v_dealer_account_id,v_branch_id
  from finance_private.erp_branch_scope_mappings m
  join finance.dealer_accounts a on a.id=m.dealer_account_id and a.legal_entity_id=m.legal_entity_id
    and a.status in('SHADOW','ACTIVE')
  join finance.branches b on b.id=m.finance_branch_id and b.legal_entity_id=m.legal_entity_id
    and b.dealer_legal_entity_id=a.dealer_legal_entity_id and b.status='ACTIVE'
  where m.erp_branch_id=v_user.branch_id and m.status='ACTIVE'
    and m.effective_from<=current_date
    and(m.effective_to is null or current_date<m.effective_to);
  if v_count<>1 then return null;end if;

  return pg_catalog.jsonb_build_object(
    'actorId',p_auth_user_id,'legalEntityId',v_legal_entity_id,
    'dealerAccountId',v_dealer_account_id,'branchId',v_branch_id,
    'scopeSource','VERIFIED_ERP_SESSION_MAPPING'
  );
end$$;

revoke all on function finance_api.resolve_erp_session_branch_finance_scope(uuid) from public,anon,authenticated;
grant execute on function finance_api.resolve_erp_session_branch_finance_scope(uuid) to service_role;
