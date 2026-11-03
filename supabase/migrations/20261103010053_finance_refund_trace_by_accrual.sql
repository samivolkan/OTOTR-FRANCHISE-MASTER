-- Resolve a royalty refund trace from the reversal accrual identifier exposed by
-- the dealer statement. Do not assume source event id and business refund id are equal.

create or replace function finance_api.get_royalty_refund_trace_by_accrual(
  p_legal_entity_id uuid,
  p_dealer_account_id uuid,
  p_branch_id uuid,
  p_reversal_accrual_id uuid
) returns jsonb
language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api
as $$
declare
  v_refund_id uuid;
begin
  if not finance_api.authorize_scope(
    p_legal_entity_id,p_dealer_account_id,p_branch_id,'getRoyaltyRefundTrace'
  ) then
    raise exception using errcode='42501',message='finance scope denied';
  end if;

  select (se.payload->>'refundId')::uuid
    into v_refund_id
    from finance.accruals reversal_accrual
    join finance.calculation_runs reversal_run
      on reversal_run.id=reversal_accrual.calculation_run_id
    join finance.source_events se
      on se.id=reversal_run.source_event_id
   where reversal_accrual.id=p_reversal_accrual_id
     and reversal_accrual.legal_entity_id=p_legal_entity_id
     and reversal_accrual.dealer_account_id=p_dealer_account_id
     and reversal_accrual.branch_id=p_branch_id
     and reversal_accrual.reversal_of_id is not null
     and se.legal_entity_id=p_legal_entity_id
     and se.branch_id=p_branch_id
     and se.event_type='customer-payment.refunded'
     and se.payload->>'refundStatus'='SETTLED';

  if not found then return null; end if;
  return finance_api.get_royalty_refund_trace(
    p_legal_entity_id,p_dealer_account_id,p_branch_id,v_refund_id
  );
end $$;

revoke all on function finance_api.get_royalty_refund_trace_by_accrual(uuid,uuid,uuid,uuid)
  from public,anon;
grant execute on function finance_api.get_royalty_refund_trace_by_accrual(uuid,uuid,uuid,uuid)
  to authenticated;
