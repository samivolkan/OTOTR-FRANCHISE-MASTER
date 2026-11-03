-- Safe branch-scoped carry-forward projection appended to the existing refund trace.

create or replace function finance_private.get_royalty_credit_carry_forward_projection(
  p_credit_open_item_id uuid
) returns jsonb
language sql stable security definer set search_path='' as $$
  select pg_catalog.jsonb_build_object(
    'creditOpenItemId',oi.id,
    'status',oi.status,
    'currency',oi.currency_code,
    'originalCreditAmount',oi.original_amount::text,
    'appliedAmount',(oi.original_amount-oi.open_amount)::text,
    'remainingCreditAmount',oi.open_amount::text,
    'applications',coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'applicationId',a.id,
        'debitOpenItemId',a.debit_open_item_id,
        'debitAccrualId',a.debit_accrual_id,
        'billingBatchId',a.billing_batch_id,
        'appliedAmount',a.applied_amount::text,
        'appliedAtUtc',a.created_at_utc
      ) order by a.application_order)
      from finance.royalty_credit_applications a
      where a.credit_open_item_id=oi.id
    ),'[]'::jsonb),
    'cashPayoutConfigured',false,
    'rawAccountingDataExposed',false
  )
  from finance.open_items oi
  where oi.id=p_credit_open_item_id and oi.item_type='CREDIT'
$$;

revoke all on function finance_private.get_royalty_credit_carry_forward_projection(uuid)
  from public,anon,authenticated;

create or replace function finance_api.get_royalty_refund_trace_by_accrual(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_reversal_accrual_id uuid
) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare v_refund_id uuid;v_trace jsonb;v_credit_id uuid;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getRoyaltyRefundTrace') then
    raise exception using errcode='42501',message='finance scope denied';
  end if;
  select (se.payload->>'refundId')::uuid into v_refund_id
    from finance.accruals reversal_accrual
    join finance.calculation_runs reversal_run on reversal_run.id=reversal_accrual.calculation_run_id
    join finance.source_events se on se.id=reversal_run.source_event_id
   where reversal_accrual.id=p_reversal_accrual_id and reversal_accrual.legal_entity_id=p_legal_entity_id
     and reversal_accrual.dealer_account_id=p_dealer_account_id and reversal_accrual.branch_id=p_branch_id
     and reversal_accrual.reversal_of_id is not null and se.legal_entity_id=p_legal_entity_id
     and se.branch_id=p_branch_id and se.event_type='customer-payment.refunded'
     and se.payload->>'refundStatus'='SETTLED';
  if not found then return null;end if;
  v_trace:=finance_api.get_royalty_refund_trace(p_legal_entity_id,p_dealer_account_id,p_branch_id,v_refund_id);
  if v_trace is null then return null;end if;
  v_credit_id:=(v_trace#>>'{creditOpenItem,openItemId}')::uuid;
  return v_trace||pg_catalog.jsonb_build_object(
    'creditCarryForward',finance_private.get_royalty_credit_carry_forward_projection(v_credit_id));
end $$;

revoke all on function finance_api.get_royalty_refund_trace_by_accrual(uuid,uuid,uuid,uuid)
  from public,anon;
grant execute on function finance_api.get_royalty_refund_trace_by_accrual(uuid,uuid,uuid,uuid)
  to authenticated;
