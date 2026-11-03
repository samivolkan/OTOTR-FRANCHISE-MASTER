-- ERP identity bridge for automatic royalty refund reversals.
-- User JWTs may authorize a branch-scoped retry; only service_role can load
-- sensitive calculation context or commit accounting records.

create or replace function finance_private.current_refund_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_private.current_actor_can_process_royalty_refund(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid
) returns boolean language sql stable security definer set search_path=pg_catalog,public,finance_private as $$
  select exists(
    select 1 from public.app_users u
     where u.auth_user_id=p_actor_id and u.is_active
       and u.role in('CEO','GENERAL_MANAGER','FINANCE')
  ) and finance_private.current_actor_can_read_scope(
    p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id,'listRoyaltyRefunds'
  )
$$;

create or replace function finance_api.authorize_royalty_refund_processing_scope(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_source_event_id uuid,p_refund_id uuid,p_permission text
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,auth,finance,finance_private as $$
declare v record;
begin
  if p_permission<>'finance.royalty-refunds.process' or auth.uid() is null
     or not finance_private.current_actor_can_process_royalty_refund(
       auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id
     ) then return jsonb_build_object('allowed',false);end if;
  select se.dealer_legal_entity_id,se.business_date,se.status,se.version
    into v from finance.source_events se
   where se.id=p_source_event_id and se.event_id=p_refund_id
     and se.legal_entity_id=p_legal_entity_id and se.branch_id=p_branch_id
     and se.event_type='customer-payment.refunded'
     and se.status in('RECEIVED','PROCESSING')
     and se.payload->>'refundId'=p_refund_id::text
     and se.payload->>'branchId'=p_branch_id::text
     and se.payload->>'settlementStatus'='SETTLED'
     and se.payload->>'refundStatus'='SETTLED'
     and exists(
       select 1 from finance.dealer_accounts da
        where da.id=p_dealer_account_id
          and da.legal_entity_id=p_legal_entity_id
          and da.dealer_legal_entity_id=se.dealer_legal_entity_id
          and da.status in('SHADOW','ACTIVE')
     ) limit 1;
  if not found then return jsonb_build_object('allowed',false);end if;
  return jsonb_build_object(
    'allowed',true,'legalEntityId',p_legal_entity_id,
    'dealerLegalEntityId',v.dealer_legal_entity_id,
    'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,
    'sourceEventId',p_source_event_id,'refundId',p_refund_id,
    'businessDate',v.business_date,'status',v.status,'version',v.version
  );
end$$;

revoke all on function finance_private.current_refund_worker_is_trusted() from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_process_royalty_refund(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_api.authorize_royalty_refund_processing_scope(uuid,uuid,uuid,uuid,uuid,text) from public,anon;
grant execute on function finance_api.authorize_royalty_refund_processing_scope(uuid,uuid,uuid,uuid,uuid,text) to authenticated;

revoke all on function finance_api.load_royalty_refund_context(uuid,uuid,uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_api.find_royalty_refund_intent(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_api.commit_royalty_refund_reversal(uuid,jsonb,jsonb,jsonb,jsonb,jsonb,text,text) from public,anon,authenticated;
grant execute on function finance_api.load_royalty_refund_context(uuid,uuid,uuid,uuid,uuid,uuid) to service_role;
grant execute on function finance_api.find_royalty_refund_intent(uuid,uuid) to service_role;
grant execute on function finance_api.commit_royalty_refund_reversal(uuid,jsonb,jsonb,jsonb,jsonb,jsonb,text,text) to service_role;
