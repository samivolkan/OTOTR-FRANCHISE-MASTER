-- ERP identity bridge and approved mapping resolver for accounting package/export commands.
-- Browser JWT performs authorization; only service_role can execute mutations.

create or replace function finance_private.current_accounting_batch_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_accounting_export_queue_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_private.current_actor_can_create_accounting_batch(p_actor_id uuid,p_legal_entity_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public as $$
 select exists(select 1 from public.app_users u where u.auth_user_id=p_actor_id and u.is_active and u.role in('CEO','GENERAL_MANAGER','FINANCE'))
$$;
create or replace function finance_private.current_actor_can_queue_accounting_export(p_actor_id uuid,p_batch_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public,finance as $$
 select exists(select 1 from public.app_users u where u.auth_user_id=p_actor_id and u.is_active and u.role in('CEO','GENERAL_MANAGER','FINANCE'))
   and exists(select 1 from finance.accounting_batches b where b.id=p_batch_id)
$$;

create or replace function finance_private.accounting_export_mapping_is_valid(p_legal_entity_id uuid,p_mapping_version text,p_journal_entry_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance as $$
 select exists(
   select 1 from finance.accounting_mappings m
   where m.legal_entity_id=p_legal_entity_id and m.status in('APPROVED','ACTIVE')
     and m.erp_mapping_payload->>'mappingVersion'=p_mapping_version
 ) and not exists(
   select 1 from finance.journal_lines jl
   where jl.journal_entry_id=p_journal_entry_id and not exists(
     select 1 from finance.accounting_mappings m
     where m.legal_entity_id=p_legal_entity_id and m.status in('APPROVED','ACTIVE')
       and m.erp_mapping_payload->>'mappingVersion'=p_mapping_version
       and jl.account_code in(m.receivable_account_code,m.revenue_account_code,m.tax_account_code,m.reversal_account_code)
   )
 )
$$;

create or replace function finance_api.authorize_accounting_batch_creation_scope(
 p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_permission text
) returns jsonb language sql stable security definer set search_path=pg_catalog,finance_private as $$
 select case when p_permission='finance.accounting-batches.create' and auth.uid() is not null
   and finance_private.current_actor_can_create_accounting_batch(auth.uid(),p_legal_entity_id)
   and finance_private.current_actor_can_read_scope(auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDealerFinanceSummary')
  then jsonb_build_object('allowed',true,'legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id)
  else jsonb_build_object('allowed',false) end
$$;
create or replace function finance_api.authorize_accounting_export_scope(
 p_batch_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_permission text
) returns jsonb language sql stable security definer set search_path=pg_catalog,finance,finance_private as $$
 select case when p_permission='finance.accounting-batches.export' and auth.uid() is not null
   and finance_private.current_actor_can_queue_accounting_export(auth.uid(),p_batch_id)
   and finance_private.current_actor_can_read_scope(auth.uid(),b.legal_entity_id,p_dealer_account_id,p_branch_id,'getDealerFinanceSummary')
   and b.status='READY'
  then jsonb_build_object('allowed',true,'legalEntityId',b.legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'status',b.status,'version',b.version)
  else jsonb_build_object('allowed',false) end from finance.accounting_batches b where b.id=p_batch_id
$$;

revoke all on function finance_private.current_accounting_batch_worker_is_trusted() from public,anon,authenticated;
revoke all on function finance_private.current_accounting_export_queue_worker_is_trusted() from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_create_accounting_batch(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_queue_accounting_export(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.accounting_export_mapping_is_valid(uuid,text,uuid) from public,anon,authenticated;
revoke all on function finance_api.authorize_accounting_batch_creation_scope(uuid,uuid,uuid,text) from public,anon;
revoke all on function finance_api.authorize_accounting_export_scope(uuid,uuid,uuid,text) from public,anon;
grant execute on function finance_api.authorize_accounting_batch_creation_scope(uuid,uuid,uuid,text) to authenticated;
grant execute on function finance_api.authorize_accounting_export_scope(uuid,uuid,uuid,text) to authenticated;
grant execute on function finance_api.commit_accounting_batch_creation(uuid,uuid,date,date,text,uuid[],text,text,uuid) to service_role;
grant execute on function finance_api.queue_accounting_export(uuid,uuid,text,text,bigint,text,text,uuid) to service_role;
