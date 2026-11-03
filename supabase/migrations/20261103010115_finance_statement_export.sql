-- Authorized, branch-scoped dealer statement export projection.
create or replace function finance_api.export_dealer_statement(
 p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
 p_from date,p_to date,p_currency text,p_status text,p_limit integer
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_limit integer:=coalesce(p_limit,10000);v_items jsonb;v_count integer;v_total integer;v_generated timestamptz:=clock_timestamp();
begin
 if auth.uid() is null or not finance_private.current_actor_can_read_scope(auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id,'exportDealerStatement') then raise exception using errcode='42501',message='finance scope denied';end if;
 if p_from is null or p_to is null or p_from>p_to or p_currency!~'^[A-Z]{3}$' or v_limit not between 1 and 10000 then raise exception using errcode='22023',message='invalid statement export filter';end if;
 if p_status is not null and p_status not in('OPEN','PARTIALLY_ALLOCATED','CLOSED','DISPUTED','REVERSED') then raise exception using errcode='22023',message='invalid open item status';end if;
 with scoped as(
  select a.id,case when a.reversal_of_id is not null then 'REVERSAL' when a.pass_through_expense_id is not null then 'PASS_THROUGH_EXPENSE' else 'ACCRUAL' end record_type,
   coalesce(cr.business_date,pe.expense_date,a.created_at_utc::date) business_date,oi.due_date,fd.code fee_code,
   coalesce(se.event_id::text,pe.supplier_reference) source_reference,pg_catalog.abs(a.net_amount) net_amount,pg_catalog.abs(a.tax_amount) tax_amount,pg_catalog.abs(a.gross_amount) gross_amount,
   oi.allocated_amount,oi.open_amount,a.currency_code,oi.status,ei.invoice_number external_invoice_number,a.reversal_of_id
  from finance.accruals a join finance.open_items oi on oi.accrual_id=a.id join finance.fee_definitions fd on fd.id=a.fee_definition_id
  left join finance.calculation_runs cr on cr.id=a.calculation_run_id left join finance.source_events se on se.id=cr.source_event_id
  left join finance.pass_through_expenses pe on pe.id=a.pass_through_expense_id left join finance.billing_batch_items bbi on bbi.accrual_id=a.id and bbi.status='ACTIVE'
  left join finance.external_invoices ei on ei.billing_batch_id=bbi.billing_batch_id
  where a.legal_entity_id=p_legal_entity_id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id
   and oi.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id and oi.branch_id=p_branch_id
   and a.currency_code=p_currency and coalesce(cr.business_date,pe.expense_date,a.created_at_utc::date) between p_from and p_to and(p_status is null or oi.status=p_status)
 ),limited as(select * from scoped order by business_date,id limit v_limit)
 select coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
  'recordId',id,'recordType',record_type,'businessDate',business_date,'dueDate',due_date,'feeCode',fee_code,'sourceReference',source_reference,
  'netAmount',net_amount::text,'taxAmount',tax_amount::text,'grossAmount',gross_amount::text,'allocatedAmount',allocated_amount::text,'openAmount',open_amount::text,
  'currency',currency_code,'status',status,'externalInvoiceNumber',external_invoice_number,'reversalReferenceId',reversal_of_id
 )) order by business_date,id)from limited),'[]'::jsonb),(select count(*) from limited),(select count(*) from scoped) into v_items,v_count,v_total;
 return pg_catalog.jsonb_build_object('schemaVersion',1,'documentType','OTOTR_FINANCE_DEALER_STATEMENT_EXPORT','generatedAtUtc',v_generated,
  'scope',pg_catalog.jsonb_build_object('legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id),
  'filters',pg_catalog.jsonb_build_object('from',p_from,'to',p_to,'currency',p_currency,'status',p_status),'rowCount',v_count,'totalMatchingCount',v_total,
  'truncated',v_total>v_count,'rawRecordsExposed',false,'items',v_items);
end$$;
revoke all on function finance_api.export_dealer_statement(uuid,uuid,uuid,date,date,text,text,integer) from public,anon;
grant execute on function finance_api.export_dealer_statement(uuid,uuid,uuid,date,date,text,text,integer) to authenticated;
