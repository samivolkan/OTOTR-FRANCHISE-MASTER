-- ERP identity and service-role bridge for the contract version maker-checker lifecycle.

create or replace function finance_private.resolve_contract_version_lifecycle_scope(
  p_actor_id uuid,p_contract_version_id uuid,p_action text
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;r record;v_account uuid;v_branch uuid;v_allowed boolean:=false;
begin
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE') then return null;end if;
  select cv.status,cv.prepared_by,cv.approved_by,fc.legal_entity_id,fc.dealer_legal_entity_id,fc.status contract_status
    into r from finance.contract_versions cv join finance.franchise_contracts fc on fc.id=cv.contract_id
   where cv.id=p_contract_version_id;
  if not found or r.contract_status in('TERMINATED','DISCARDED') then return null;end if;
  v_allowed:=case p_action when 'SUBMIT' then r.status='DRAFT' when 'APPROVE' then r.status='PENDING_APPROVAL' and r.prepared_by is distinct from p_actor_id when 'PUBLISH' then r.status='APPROVED' and r.prepared_by is distinct from p_actor_id else false end;
  if not v_allowed then return null;end if;
  select da.id,b.id into v_account,v_branch from finance.dealer_accounts da
    join finance.branches b on b.legal_entity_id=da.legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id
   where da.legal_entity_id=r.legal_entity_id and da.dealer_legal_entity_id=r.dealer_legal_entity_id
     and da.status in('SHADOW','ACTIVE') and b.status='ACTIVE'
   order by da.account_code,da.id,b.branch_code,b.id limit 1;
  if v_account is null or v_branch is null or not finance_private.current_actor_can_read_scope(p_actor_id,r.legal_entity_id,v_account,v_branch,'getContractFeeRule') then return null;end if;
  return pg_catalog.jsonb_build_object('allowed',true,'legalEntityId',r.legal_entity_id,'dealerLegalEntityId',r.dealer_legal_entity_id,'dealerAccountId',v_account,'branchId',v_branch,'status',r.status,'preparedBy',r.prepared_by,'approvedBy',r.approved_by);
end$$;

create or replace function finance_private.resolve_contract_version_submit_scope(p_actor_id uuid,p_contract_version_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance_private as $$select case when p_permission='finance.contract-versions.submit' then finance_private.resolve_contract_version_lifecycle_scope(p_actor_id,p_contract_version_id,'SUBMIT') else null end$$;
create or replace function finance_private.resolve_contract_version_approve_scope(p_actor_id uuid,p_contract_version_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance_private as $$select case when p_permission='finance.contract-versions.approve' then finance_private.resolve_contract_version_lifecycle_scope(p_actor_id,p_contract_version_id,'APPROVE') else null end$$;
create or replace function finance_private.current_actor_can_activate_contract_version(p_actor_id uuid,p_contract_version_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance_private as $$select finance_private.resolve_contract_version_lifecycle_scope(p_actor_id,p_contract_version_id,'PUBLISH') is not null$$;
create or replace function finance_api.authorize_contract_version_publish_scope(p_contract_version_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,auth,finance_private as $$select case when auth.uid() is not null and p_permission='finance.contract-versions.activate' then finance_private.resolve_contract_version_lifecycle_scope(auth.uid(),p_contract_version_id,'PUBLISH') else null end$$;

create or replace function finance_private.current_contract_version_submit_committer_is_trusted() returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(pg_catalog.current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_contract_version_approve_committer_is_trusted() returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(pg_catalog.current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_rule_activation_worker_is_trusted() returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(pg_catalog.current_setting('request.jwt.claim.role',true),'')='service_role'$$;

revoke all on function finance_private.resolve_contract_version_lifecycle_scope(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_private.resolve_contract_version_submit_scope(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_private.resolve_contract_version_approve_scope(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_activate_contract_version(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.current_contract_version_submit_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_private.current_contract_version_approve_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_private.current_rule_activation_worker_is_trusted() from public,anon,authenticated;
revoke all on function finance_api.authorize_contract_version_publish_scope(uuid,text) from public,anon;
grant execute on function finance_api.authorize_contract_version_publish_scope(uuid,text) to authenticated;
grant execute on function finance_api.commit_contract_version_submit(uuid,uuid,uuid,uuid,uuid,uuid,bigint,text,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_contract_version_approve(uuid,uuid,uuid,uuid,uuid,uuid,bigint,text,text,text,text,uuid) to service_role;
grant execute on function finance_api.publish_fee_rule_version(uuid,uuid,bigint,text,uuid,text,text) to service_role;
