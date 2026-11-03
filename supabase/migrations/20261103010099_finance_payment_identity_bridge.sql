-- ERP identity bridge for payment creation, verification, allocation and reversal.
-- Browser JWT authorizes scope; only service_role can execute financial mutations.

create or replace function finance_private.current_payment_create_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_payment_verification_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_payment_allocation_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_allocation_reversal_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_private.current_actor_can_create_payment(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public,finance_private as $$
  select exists(select 1 from public.app_users u where u.auth_user_id=p_actor_id and u.is_active and u.role in('CEO','GENERAL_MANAGER','FINANCE'))
    and finance_private.current_actor_can_read_scope(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id,'listPayments')
$$;
create or replace function finance_private.resolve_payment_create_legal_entity(p_dealer_account_id uuid,p_branch_id uuid)
returns uuid language sql stable security definer set search_path=pg_catalog,finance as $$
  select da.legal_entity_id from finance.dealer_accounts da join finance.branches b on b.id=p_branch_id and b.legal_entity_id=da.legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id
  where da.id=p_dealer_account_id and da.status='ACTIVE' and b.status='ACTIVE'
$$;
create or replace function finance_private.current_actor_can_verify_payment(p_actor_id uuid,p_payment_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
  select exists(select 1 from public.app_users u where u.auth_user_id=p_actor_id and u.is_active and u.role in('CEO','GENERAL_MANAGER','FINANCE'))
    and exists(select 1 from finance.payments p where p.id=p_payment_id and p.prepared_by<>p_actor_id
      and finance_private.current_actor_can_read_scope(p_actor_id,p.legal_entity_id,p.dealer_account_id,p.branch_id,'listPayments'))
$$;
create or replace function finance_private.current_actor_can_allocate_payment(p_actor_id uuid,p_payment_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
  select exists(select 1 from public.app_users u where u.auth_user_id=p_actor_id and u.is_active and u.role in('CEO','GENERAL_MANAGER','FINANCE'))
    and exists(select 1 from finance.payments p where p.id=p_payment_id
      and finance_private.current_actor_can_read_scope(p_actor_id,p.legal_entity_id,p.dealer_account_id,p.branch_id,'listPayments'))
$$;
create or replace function finance_private.current_actor_can_reverse_allocation(p_actor_id uuid,p_allocation_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
  select exists(select 1 from public.app_users u where u.auth_user_id=p_actor_id and u.is_active and u.role in('CEO','GENERAL_MANAGER','FINANCE'))
    and exists(select 1 from finance.payment_allocations pa join finance.payments p on p.id=pa.payment_id where pa.id=p_allocation_id
      and finance_private.current_actor_can_read_scope(p_actor_id,p.legal_entity_id,p.dealer_account_id,p.branch_id,'listPayments'))
$$;

create or replace function finance_api.authorize_payment_verification_scope(p_payment_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance,finance_private as $$
  select case when p_permission='finance.payments.verify' and auth.uid() is not null
    and finance_private.current_actor_can_verify_payment(auth.uid(),p_payment_id) and p.status='PENDING_VERIFICATION'
    then jsonb_build_object('allowed',true,'legalEntityId',p.legal_entity_id,'dealerAccountId',p.dealer_account_id,'branchId',p.branch_id,'status',p.status,'version',p.version)
    else jsonb_build_object('allowed',false) end from finance.payments p where p.id=p_payment_id
$$;
create or replace function finance_api.authorize_payment_allocation_scope(p_payment_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance,finance_private as $$
  select case when p_permission='finance.payments.allocate' and auth.uid() is not null
    and finance_private.current_actor_can_allocate_payment(auth.uid(),p_payment_id) and p.status in('VERIFIED','PARTIALLY_ALLOCATED')
    then jsonb_build_object('allowed',true,'legalEntityId',p.legal_entity_id,'dealerAccountId',p.dealer_account_id,'branchId',p.branch_id,'status',p.status,'version',p.version,'currencyCode',p.currency_code,'unallocatedAmount',(p.verified_amount-p.allocated_amount)::text)
    else jsonb_build_object('allowed',false) end from finance.payments p where p.id=p_payment_id
$$;
create or replace function finance_api.authorize_payment_allocation_reversal_scope(p_allocation_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance,finance_private as $$
  select case when p_permission='finance.payment-allocations.reverse' and auth.uid() is not null
    and finance_private.current_actor_can_reverse_allocation(auth.uid(),p_allocation_id) and pa.status='ACTIVE' and pa.reversal_of_id is null
    then jsonb_build_object('allowed',true,'legalEntityId',p.legal_entity_id,'dealerAccountId',p.dealer_account_id,'branchId',p.branch_id,
      'paymentId',p.id,'paymentVersion',p.version,'allocationVersion',pa.version,'openItemId',oi.id,'openItemVersion',oi.version,'currencyCode',pa.currency_code,'amount',pa.amount::text)
    else jsonb_build_object('allowed',false) end
  from finance.payment_allocations pa join finance.payments p on p.id=pa.payment_id join finance.open_items oi on oi.id=pa.open_item_id where pa.id=p_allocation_id
$$;

revoke all on function finance_private.current_actor_can_create_payment(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.resolve_payment_create_legal_entity(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_verify_payment(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_allocate_payment(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_reverse_allocation(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_api.authorize_payment_verification_scope(uuid,text) from public,anon;
revoke all on function finance_api.authorize_payment_allocation_scope(uuid,text) from public,anon;
revoke all on function finance_api.authorize_payment_allocation_reversal_scope(uuid,text) from public,anon;
grant execute on function finance_api.authorize_payment_verification_scope(uuid,text) to authenticated;
grant execute on function finance_api.authorize_payment_allocation_scope(uuid,text) to authenticated;
grant execute on function finance_api.authorize_payment_allocation_reversal_scope(uuid,text) to authenticated;
grant execute on function finance_api.commit_payment_creation(uuid,uuid,uuid,uuid,date,date,numeric,text,text,text,text,text,uuid[],text,text,uuid) to service_role;
grant execute on function finance_api.commit_payment_verification(uuid,uuid,bigint,text,uuid[],text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_payment_allocation(uuid,uuid,uuid,uuid,uuid,text,jsonb,bigint,text,text,uuid) to service_role;
grant execute on function finance_api.commit_payment_allocation_reversal(uuid,uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,uuid[],text,text,text,uuid) to service_role;
