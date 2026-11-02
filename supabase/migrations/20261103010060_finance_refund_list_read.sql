-- OTOTR Finance internal review migration.
-- Branch-scoped royalty refund reversal list with immutable period provenance.

create or replace function finance_api.list_royalty_refunds(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_from date,p_to date,p_cursor text,p_limit integer
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api as $$
declare v_limit integer:=least(greatest(coalesce(p_limit,50),1),200);v_cursor_text text;v_cursor_date date;v_cursor_id uuid;v_items jsonb;v_has_more boolean;v_next text;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listRoyaltyRefunds') then raise exception using errcode='42501',message='finance scope denied';end if;
  if p_from is not null and p_to is not null and p_from>p_to then raise exception using errcode='22023',message='invalid refund date range';end if;
  if p_cursor is not null then
    begin
      v_cursor_text:=pg_catalog.convert_from(pg_catalog.decode(p_cursor,'base64'),'UTF8');
      if v_cursor_text !~ '^\d{4}-\d{2}-\d{2}\|[0-9a-fA-F-]{36}$' then raise exception using errcode='22023',message='invalid refund cursor';end if;
      v_cursor_date:=pg_catalog.split_part(v_cursor_text,'|',1)::date;v_cursor_id:=pg_catalog.split_part(v_cursor_text,'|',2)::uuid;
    exception when others then raise exception using errcode='22023',message='invalid refund cursor';end;
  end if;
  with scoped as (
    select reversal.id reversal_accrual_id,(se.payload->>'refundId')::uuid refund_id,se.business_date refund_business_date,
           se.payload->>'originalCollectionId' original_collection_id,se.payload->>'refundedGrossAmount' refunded_gross_amount,
           pg_catalog.abs(reversal.gross_amount)::text royalty_reversal_amount,pg_catalog.abs(original.gross_amount)::text original_royalty_amount,
           reversal.currency_code,reversal.status,original.id original_accrual_id,original_je.finance_period_id original_period_id,reversal_je.finance_period_id posting_period_id
      from finance.accruals reversal
      join finance.calculation_runs cr on cr.id=reversal.calculation_run_id and cr.status='POSTED'
      join finance.source_events se on se.id=cr.source_event_id and se.event_type='customer-payment.refunded'
        and coalesce(se.payload->>'refundStatus',se.payload->>'settlementStatus')='SETTLED'
      join finance.accruals original on original.id=reversal.reversal_of_id
      join finance.journal_entries original_je on original_je.id=original.journal_entry_id
      join finance.journal_entries reversal_je on reversal_je.id=reversal.journal_entry_id and reversal_je.reversal_of_id=original_je.id
     where reversal.legal_entity_id=p_legal_entity_id and reversal.dealer_account_id=p_dealer_account_id and reversal.branch_id=p_branch_id
       and se.legal_entity_id=p_legal_entity_id and se.branch_id=p_branch_id
       and (p_from is null or se.business_date>=p_from) and (p_to is null or se.business_date<=p_to)
       and (v_cursor_date is null or (se.business_date,reversal.id)<(v_cursor_date,v_cursor_id))
  ), page as (select * from scoped order by refund_business_date desc,reversal_accrual_id desc limit v_limit+1),
  visible as (select * from page order by refund_business_date desc,reversal_accrual_id desc limit v_limit),
  projected as (
    select reversal_accrual_id,refund_business_date,pg_catalog.jsonb_build_object(
      'reversalAccrualId',reversal_accrual_id,'refundId',refund_id,'refundBusinessDate',refund_business_date,
      'originalCollectionId',original_collection_id,'refundedGrossAmount',refunded_gross_amount,
      'originalRoyaltyAccrualId',original_accrual_id,'originalRoyaltyAmount',original_royalty_amount,
      'royaltyReversalAmount',royalty_reversal_amount,'currency',currency_code,'status',status,
      'originalPeriodId',original_period_id,'postingPeriodId',posting_period_id
    ) item from visible
  )
  select coalesce(pg_catalog.jsonb_agg(item order by refund_business_date desc,reversal_accrual_id desc),'[]'::jsonb),
         (select pg_catalog.count(*)>v_limit from page),
         case when (select pg_catalog.count(*)>v_limit from page) then (select pg_catalog.encode(pg_catalog.convert_to(refund_business_date::text||'|'||reversal_accrual_id::text,'UTF8'),'base64') from visible order by refund_business_date,reversal_accrual_id limit 1) else null end
    into v_items,v_has_more,v_next from projected;
  return pg_catalog.jsonb_build_object('items',v_items,'nextCursor',v_next,'hasMore',v_has_more);
end$$;

revoke all on function finance_api.list_royalty_refunds(uuid,uuid,uuid,date,date,text,integer) from public,anon;
grant execute on function finance_api.list_royalty_refunds(uuid,uuid,uuid,date,date,text,integer) to authenticated;
