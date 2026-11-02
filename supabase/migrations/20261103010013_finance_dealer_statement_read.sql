-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-dealer-statement-read-rpc.sql
-- Source SHA256: F811346A4D6F7C0DFDDE2A838CF684B05489D321B63015BF6136586029451624
-- Local replay required before any staging promotion.
-- OTOTR DEALER STATEMENT READ RPC CANDIDATE

create or replace function finance_api.get_dealer_statement(
  p_legal_entity_id uuid,
  p_dealer_account_id uuid,
  p_branch_id uuid,
  p_from date,
  p_to date,
  p_status text,
  p_cursor text,
  p_limit integer
) returns jsonb
language plpgsql stable security definer
set search_path = pg_catalog,finance,finance_api
as $$
declare
  v_limit integer:=least(greatest(coalesce(p_limit,50),1),200);
  v_cursor_text text;
  v_cursor_date date;
  v_cursor_id uuid;
  v_items jsonb;
  v_has_more boolean:=false;
  v_next_cursor text;
begin
  if not finance_api.authorize_scope(
    p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDealerStatement'
  ) then
    raise exception using errcode='42501',message='finance scope denied';
  end if;
  if p_from is not null and p_to is not null and p_from>p_to then
    raise exception using errcode='22023',message='invalid statement date range';
  end if;
  if p_status is not null and p_status not in ('OPEN','PARTIALLY_ALLOCATED','CLOSED','DISPUTED','REVERSED') then
    raise exception using errcode='22023',message='invalid open item status';
  end if;

  if p_cursor is not null then
    begin
      v_cursor_text:=pg_catalog.convert_from(pg_catalog.decode(p_cursor,'base64'),'UTF8');
      if v_cursor_text !~ '^\d{4}-\d{2}-\d{2}\|[0-9a-fA-F-]{36}$' then
        raise exception using errcode='22023',message='invalid statement cursor';
      end if;
      v_cursor_date:=pg_catalog.split_part(v_cursor_text,'|',1)::date;
      v_cursor_id:=pg_catalog.split_part(v_cursor_text,'|',2)::uuid;
    exception when others then
      raise exception using errcode='22023',message='invalid statement cursor';
    end;
  end if;

  with scoped as (
    select a.id,
           case when a.reversal_of_id is not null then 'REVERSAL'
                when a.pass_through_expense_id is not null then 'PASS_THROUGH_EXPENSE'
                else 'ACCRUAL' end record_type,
           coalesce(cr.business_date,pe.expense_date) business_date,
           oi.due_date,fd.code fee_code,
           coalesce(se.event_id::text,pe.supplier_reference) source_reference,
           cs.contract_version_id,
           pg_catalog.abs(a.net_amount) net_amount,
           pg_catalog.abs(a.tax_amount) tax_amount,
           pg_catalog.abs(a.gross_amount) gross_amount,
           oi.allocated_amount,oi.open_amount,a.currency_code,
           payment_links.payment_ids,payment_links.payment_allocation_ids,
           ei.id external_invoice_id,ei.invoice_number external_invoice_number,
           oi.status,a.reversal_of_id
      from finance.accruals a
      join finance.open_items oi on oi.accrual_id=a.id
      join finance.fee_definitions fd on fd.id=a.fee_definition_id
      left join finance.calculation_runs cr on cr.id=a.calculation_run_id
      left join finance.calculation_snapshots cs on cs.calculation_run_id=cr.id
      left join finance.source_events se on se.id=cr.source_event_id
      left join finance.pass_through_expenses pe on pe.id=a.pass_through_expense_id
      left join finance.billing_batch_items bbi on bbi.accrual_id=a.id and bbi.status='ACTIVE'
      left join finance.external_invoices ei on ei.billing_batch_id=bbi.billing_batch_id
      left join lateral (
        select coalesce(pg_catalog.jsonb_agg(distinct pa.payment_id order by pa.payment_id),'[]'::jsonb) payment_ids,
               coalesce(pg_catalog.jsonb_agg(pa.id order by pa.created_at_utc,pa.id),'[]'::jsonb) payment_allocation_ids
          from finance.payment_allocations pa
          join finance.payments p on p.id=pa.payment_id
         where pa.open_item_id=oi.id
           and p.legal_entity_id=p_legal_entity_id
           and p.dealer_account_id=p_dealer_account_id
           and p.branch_id=p_branch_id
      ) payment_links on true
     where a.legal_entity_id=p_legal_entity_id
       and a.dealer_account_id=p_dealer_account_id
       and a.branch_id=p_branch_id
       and oi.legal_entity_id=p_legal_entity_id
       and oi.dealer_account_id=p_dealer_account_id
       and oi.branch_id=p_branch_id
       and (p_from is null or coalesce(cr.business_date,pe.expense_date)>=p_from)
       and (p_to is null or coalesce(cr.business_date,pe.expense_date)<=p_to)
       and (p_status is null or oi.status=p_status)
       and (v_cursor_date is null or (coalesce(cr.business_date,pe.expense_date),a.id)<(v_cursor_date,v_cursor_id))
  ), page as (
    select * from scoped order by business_date desc,id desc limit v_limit+1
  ), visible as (
    select * from page order by business_date desc,id desc limit v_limit
  ), projected as (
    select id,business_date,
           pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
             'recordId',id,
             'recordType',record_type,
             'businessDate',business_date,
             'dueDate',due_date,
             'feeCode',fee_code,
             'sourceReference',source_reference,
             'contractVersionId',contract_version_id,
             'totals',pg_catalog.jsonb_build_object(
               'netAmount',net_amount::text,'taxAmount',tax_amount::text,
               'grossAmount',gross_amount::text,'currency',currency_code
             ),
             'allocatedAmount',allocated_amount::text,
             'openAmount',open_amount::text,
             'currencyCode',currency_code,
             'paymentIds',payment_ids,
             'paymentAllocationIds',payment_allocation_ids,
             'externalInvoiceId',external_invoice_id,
             'externalInvoiceNumber',external_invoice_number,
             'status',status,
             'reversalReferenceId',reversal_of_id
           )) item
      from visible
  )
  select coalesce(pg_catalog.jsonb_agg(item order by business_date desc,id desc),'[]'::jsonb),
         (select pg_catalog.count(*)>v_limit from page),
         case when (select pg_catalog.count(*)>v_limit from page)
              then (select pg_catalog.encode(pg_catalog.convert_to(business_date::text||'|'||id::text,'UTF8'),'base64') from visible order by business_date,id limit 1)
              else null end
    into v_items,v_has_more,v_next_cursor
    from projected;

  return pg_catalog.jsonb_build_object('items',v_items,'nextCursor',v_next_cursor,'hasMore',v_has_more);
end $$;

revoke all on function finance_api.get_dealer_statement(uuid,uuid,uuid,date,date,text,text,integer) from public, anon;

