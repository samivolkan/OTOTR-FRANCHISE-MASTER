-- ERP identity bridge for billing package creation and export queueing.
-- Browser JWT authorizes an exact branch scope; only service_role can mutate finance state.

create or replace function finance_private.current_billing_batch_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_private.current_actor_can_manage_billing_batch(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_permission text
) returns boolean language sql stable security definer set search_path=pg_catalog,public,finance_private as $$
  select p_permission in('finance.billing-batches.create','finance.billing-batches.export')
    and exists(select 1 from public.app_users u where u.auth_user_id=p_actor_id and u.is_active and u.role in('CEO','GENERAL_MANAGER','FINANCE'))
    and finance_private.current_actor_can_read_scope(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDealerFinanceSummary')
$$;

revoke all on function finance_private.current_billing_batch_worker_is_trusted() from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_manage_billing_batch(uuid,uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function finance_api.commit_billing_batch_creation(uuid,uuid,uuid,uuid,uuid,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_billing_batch_export(uuid,uuid,uuid,uuid,uuid,text,text,bigint,text,text,uuid) to service_role;
