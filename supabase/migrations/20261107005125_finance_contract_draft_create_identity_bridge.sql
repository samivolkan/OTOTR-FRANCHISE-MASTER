-- Real ERP identity bridge for contract-version and fee-rule draft creation.
-- Browser users authorize against app_users and exact finance scope. Only the
-- service-role Edge Function may commit the mutation.

create or replace function finance_private.resolve_contract_version_create_scope(
  p_actor_id uuid,p_contract_id uuid,p_permission text
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;c finance.franchise_contracts%rowtype;v_account uuid;v_branch uuid;
begin
  if p_permission<>'finance.contract-versions.create' then return null;end if;
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE') then return null;end if;
  select * into c from finance.franchise_contracts x where x.id=p_contract_id and x.status in('DRAFT','ACTIVE','SUSPENDED');
  if not found or exists(select 1 from finance.contract_versions cv where cv.contract_id=c.id and cv.status='DRAFT') then return null;end if;
  select da.id,b.id into v_account,v_branch from finance.dealer_accounts da join finance.branches b on b.legal_entity_id=da.legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id where da.legal_entity_id=c.legal_entity_id and da.dealer_legal_entity_id=c.dealer_legal_entity_id and da.status in('SHADOW','ACTIVE') and b.status='ACTIVE' order by da.account_code,da.id,b.branch_code,b.id limit 1;
  if v_account is null or v_branch is null or not finance_private.current_actor_can_read_scope(p_actor_id,c.legal_entity_id,v_account,v_branch,'getCurrentFranchiseContract') then return null;end if;
  return jsonb_build_object('allowed',true,'legalEntityId',c.legal_entity_id,'dealerLegalEntityId',c.dealer_legal_entity_id,'dealerAccountId',v_account,'branchId',v_branch);
end$$;

create or replace function finance_private.resolve_fee_rule_create_scope(
  p_actor_id uuid,p_contract_version_id uuid,p_permission text
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;r record;v_account uuid;v_branch uuid;
begin
  if p_permission<>'finance.fee-rules.create' then return null;end if;
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE') then return null;end if;
  select fc.legal_entity_id,fc.dealer_legal_entity_id into r from finance.contract_versions cv join finance.franchise_contracts fc on fc.id=cv.contract_id where cv.id=p_contract_version_id and cv.status='DRAFT' and fc.status not in('TERMINATED','DISCARDED');
  if not found then return null;end if;
  select da.id,b.id into v_account,v_branch from finance.dealer_accounts da join finance.branches b on b.legal_entity_id=da.legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id where da.legal_entity_id=r.legal_entity_id and da.dealer_legal_entity_id=r.dealer_legal_entity_id and da.status in('SHADOW','ACTIVE') and b.status='ACTIVE' order by da.account_code,da.id,b.branch_code,b.id limit 1;
  if v_account is null or v_branch is null or not finance_private.current_actor_can_read_scope(p_actor_id,r.legal_entity_id,v_account,v_branch,'getCurrentFranchiseContract') then return null;end if;
  return jsonb_build_object('allowed',true,'legalEntityId',r.legal_entity_id,'dealerLegalEntityId',r.dealer_legal_entity_id,'dealerAccountId',v_account,'branchId',v_branch);
end$$;

create or replace function finance_private.current_contract_version_create_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_fee_rule_create_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

revoke all on function finance_private.resolve_contract_version_create_scope(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_private.resolve_fee_rule_create_scope(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_private.current_contract_version_create_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_private.current_fee_rule_create_committer_is_trusted() from public,anon,authenticated;
grant execute on function finance_api.commit_contract_version_create(uuid,uuid,uuid,uuid,uuid,uuid,date,date,text,uuid[],text,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_fee_rule_create(uuid,uuid,uuid,uuid,uuid,uuid,jsonb,text,text,uuid) to service_role;
