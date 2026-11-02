-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-royalty-refund-read-rpc.sql
-- Source SHA256: A75E612E661C638B2611A593E5A9D3B794857222BF565A4DF57C450499A37704
-- Local replay required before any staging promotion.
-- OTOTR ROYALTY REFUND TRACE READ RPC CANDIDATE
-- Replace the hook only in a reviewed migration after ERP roles, grants and RLS are proven in test.

create or replace function finance_private.current_actor_can_read_refund_trace(
  p_actor_id uuid, p_legal_entity_id uuid, p_dealer_account_id uuid, p_branch_id uuid
) returns boolean language sql stable security definer set search_path = ''
as $$ select false $$;

revoke all on function finance_private.current_actor_can_read_refund_trace(uuid,uuid,uuid,uuid) from public, anon, authenticated;

create or replace function finance_api.authorize_refund_trace_scope(
  p_legal_entity_id uuid, p_dealer_account_id uuid, p_branch_id uuid, p_permission text
) returns boolean language sql stable security definer set search_path = ''
as $$
  select p_permission = 'finance.accruals.read'
    and auth.uid() is not null
    and finance_private.current_actor_can_read_refund_trace(auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id)
    and exists (
      select 1
      from finance.dealer_accounts da
      join finance.branches b on b.dealer_legal_entity_id=da.dealer_legal_entity_id
      where da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id
        and b.id=p_branch_id and b.legal_entity_id=p_legal_entity_id
        and da.status in ('SHADOW','ACTIVE') and b.status='ACTIVE'
    )
$$;

create or replace function finance_api.get_royalty_refund_trace(
  p_legal_entity_id uuid, p_dealer_account_id uuid, p_branch_id uuid, p_refund_id uuid
) returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare v record;
begin
  if not finance_api.authorize_refund_trace_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'finance.accruals.read') then
    raise exception using errcode='42501',message='finance scope denied';
  end if;

  select count(*) over () candidate_count,
         re.id refund_source_event_id,re.payload refund_payload,re.business_date refund_business_date,
         original_event.payload original_payload,
         original_accrual.id original_accrual_id,original_accrual.gross_amount original_gross,original_accrual.currency_code original_currency,
         reversal_accrual.id reversal_accrual_id,reversal_accrual.gross_amount reversal_gross,reversal_accrual.currency_code reversal_currency,reversal_accrual.status reversal_status,
         credit_item.id credit_item_id,credit_item.item_type,credit_item.original_amount,credit_item.open_amount,credit_item.currency_code credit_currency,
         original_run.finance_period_id original_period_id,reversal_run.finance_period_id posting_period_id,
         original_snapshot.rule_version_snapshot,original_snapshot.tax_version_snapshot
    into v
    from finance.source_events re
    join finance.calculation_runs reversal_run on reversal_run.source_event_id=re.id and reversal_run.status='POSTED'
    join finance.accruals reversal_accrual on reversal_accrual.calculation_run_id=reversal_run.id and reversal_accrual.reversal_of_id is not null
    join finance.accruals original_accrual on original_accrual.id=reversal_accrual.reversal_of_id
      and original_accrual.legal_entity_id=p_legal_entity_id and original_accrual.dealer_account_id=p_dealer_account_id and original_accrual.branch_id=p_branch_id
    join finance.calculation_runs original_run on original_run.id=original_accrual.calculation_run_id
    join finance.source_events original_event on original_event.id=original_run.source_event_id
      and original_event.payload->>'collectionId'=re.payload->>'originalCollectionId'
    join finance.calculation_snapshots original_snapshot on original_snapshot.calculation_run_id=original_run.id
    join finance.open_items credit_item on credit_item.accrual_id=reversal_accrual.id and credit_item.item_type='CREDIT'
      and credit_item.legal_entity_id=p_legal_entity_id and credit_item.dealer_account_id=p_dealer_account_id and credit_item.branch_id=p_branch_id
   where re.legal_entity_id=p_legal_entity_id and re.branch_id=p_branch_id
     and re.event_type='customer-payment.refunded' and re.payload->>'refundId'=p_refund_id::text
     and re.payload->>'refundStatus'='SETTLED'
   order by reversal_accrual.created_at_utc desc
   limit 1;

  if not found then return null; end if;
  if v.candidate_count <> 1 then
    raise exception using errcode='21000',message='ambiguous royalty refund trace';
  end if;
  if v.original_currency<>v.reversal_currency or v.original_currency<>v.credit_currency
     or v.original_currency<>v.refund_payload->>'currency' or v.original_currency<>v.original_payload->>'currency' then
    raise exception using errcode='23514',message='royalty refund trace currency mismatch';
  end if;

  return pg_catalog.jsonb_build_object(
    'scope',pg_catalog.jsonb_build_object('legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id),
    'refundEvent',pg_catalog.jsonb_build_object('refundId',p_refund_id,'sourceEventId',v.refund_source_event_id::text,'refundedGrossAmount',v.refund_payload->>'refundedGrossAmount','currency',v.refund_payload->>'currency','refundedAtUtc',v.refund_payload->>'refundedAtUtc'),
    'originalCollection',pg_catalog.jsonb_build_object('collectionId',(v.original_payload->>'collectionId')::uuid,'collectedGrossAmount',v.original_payload->>'collectedGrossAmount','currency',v.original_payload->>'currency'),
    'originalRoyaltyAccrual',pg_catalog.jsonb_build_object('accrualId',v.original_accrual_id,'grossAmount',v.original_gross::text,'currency',v.original_currency),
    'reversalAccrual',pg_catalog.jsonb_build_object('accrualId',v.reversal_accrual_id,'grossAmount',v.reversal_gross::text,'currency',v.reversal_currency,'status',v.reversal_status),
    'creditOpenItem',pg_catalog.jsonb_build_object('openItemId',v.credit_item_id,'itemType',v.item_type,'originalAmount',v.original_amount::text,'openAmount',v.open_amount::text,'currency',v.credit_currency),
    'periodProvenance',pg_catalog.jsonb_build_object('originalPeriodId',v.original_period_id,'postingPeriodId',v.posting_period_id,'refundBusinessDate',v.refund_business_date),
    'ruleSnapshot',pg_catalog.jsonb_build_object('feeRuleId',(v.rule_version_snapshot->>'feeRuleId')::uuid,'version',(v.rule_version_snapshot->>'version')::integer),
    'taxSnapshot',pg_catalog.jsonb_build_object('taxVersionId',coalesce(v.tax_version_snapshot->>'taxVersionId',v.tax_version_snapshot->>'id')::uuid,'rate',v.tax_version_snapshot->>'rate')
  );
end $$;

revoke all on function finance_api.authorize_refund_trace_scope(uuid,uuid,uuid,text) from public, anon;
revoke all on function finance_api.get_royalty_refund_trace(uuid,uuid,uuid,uuid) from public, anon;
grant execute on function finance_api.authorize_refund_trace_scope(uuid,uuid,uuid,text) to authenticated;
grant execute on function finance_api.get_royalty_refund_trace(uuid,uuid,uuid,uuid) to authenticated;
