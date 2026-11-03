-- Real ERP identity bridge for contract fee-rule draft updates.
-- Browser users authorize with their ERP identity and exact three-dimensional
-- finance scope; only the server-side service role may execute the commit RPC.

create or replace function finance_private.resolve_fee_rule_update_scope(
  p_actor_id uuid,p_contract_version_id uuid,p_fee_rule_id uuid,p_permission text
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;r record;v_account uuid;v_branch uuid;
begin
  if p_permission<>'finance.fee-rules.update' then return null;end if;
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE') then return null;end if;
  select fc.legal_entity_id,fc.dealer_legal_entity_id into r
    from finance.contract_fee_rules cfr
    join finance.contract_versions cv on cv.id=cfr.contract_version_id
    join finance.franchise_contracts fc on fc.id=cv.contract_id
   where cfr.id=p_fee_rule_id and cfr.contract_version_id=p_contract_version_id
     and cfr.status='DRAFT' and cv.status='DRAFT' and fc.status not in('TERMINATED','DISCARDED');
  if not found then return null;end if;
  select da.id,b.id into v_account,v_branch
    from finance.dealer_accounts da
    join finance.branches b on b.legal_entity_id=da.legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id
   where da.legal_entity_id=r.legal_entity_id and da.dealer_legal_entity_id=r.dealer_legal_entity_id
     and da.status in('SHADOW','ACTIVE') and b.status='ACTIVE'
   order by da.account_code,da.id,b.branch_code,b.id limit 1;
  if v_account is null or v_branch is null then return null;end if;
  if not finance_private.current_actor_can_read_scope(p_actor_id,r.legal_entity_id,v_account,v_branch,'getContractFeeRule') then return null;end if;
  return pg_catalog.jsonb_build_object('allowed',true,'legalEntityId',r.legal_entity_id,'dealerLegalEntityId',r.dealer_legal_entity_id,'dealerAccountId',v_account,'branchId',v_branch);
end$$;

create or replace function finance_private.current_fee_rule_update_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$
  select coalesce(pg_catalog.current_setting('request.jwt.claim.role',true),'')='service_role'
$$;

revoke all on function finance_private.resolve_fee_rule_update_scope(uuid,uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_private.current_fee_rule_update_committer_is_trusted() from public,anon,authenticated;
grant execute on function finance_api.commit_fee_rule_update(uuid,uuid,uuid,uuid,uuid,uuid,uuid,bigint,jsonb,text,text,uuid) to service_role;
