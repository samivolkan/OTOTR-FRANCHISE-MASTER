-- Explicit commercial decision: branch royalty credits are carry-forward only.

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
    'cashPayoutDecision','CASH_PAYOUT_DISABLED',
    'rawAccountingDataExposed',false
  )
  from finance.open_items oi
  where oi.id=p_credit_open_item_id and oi.item_type='CREDIT'
$$;

revoke all on function finance_private.get_royalty_credit_carry_forward_projection(uuid)
  from public,anon,authenticated;
