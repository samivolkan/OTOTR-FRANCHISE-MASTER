-- Dedicated accrual list with server-side fee-family and finance-period filters.
create or replace function finance_api.list_accruals(
 p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_from date,p_to date,
 p_status text,p_fee_family text,p_period_status text,p_cursor text,p_limit integer
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_limit integer:=least(greatest(coalesce(p_limit,50),1),200);v_cursor_date date;v_cursor_id uuid;v_items jsonb;v_more boolean;v_next text;
begin
 if auth.uid() is null or not finance_private.current_actor_can_read_scope(auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id,'listAccruals') then raise exception using errcode='42501',message='finance scope denied';end if;
 if p_from is not null and p_to is not null and p_from>p_to then raise exception using errcode='22023',message='invalid date range';end if;
 if p_status is not null and p_status not in('POSTED','REVERSED','DISPUTED') then raise exception using errcode='22023',message='invalid accrual status';end if;
 if p_fee_family is not null and p_fee_family not in('ROYALTY','ENTRY_FRANCHISE','PERIODIC_FRANCHISE','QUERY','EXTERNAL_SERVICE','OPTIONAL_PRODUCT_SERVICE','PASS_THROUGH_EXPENSE','ADJUSTMENT') then raise exception using errcode='22023',message='invalid fee family';end if;
 if p_period_status is not null and p_period_status not in('OPEN','SOURCE_FROZEN','CALCULATED','INTERNAL_REVIEW','SENT_TO_DEALER','DISPUTED','RECONCILED','APPROVED','LOCKED','REOPEN_PENDING','REOPENED') then raise exception using errcode='22023',message='invalid period status';end if;
 if p_cursor is not null then begin v_cursor_date:=pg_catalog.split_part(pg_catalog.convert_from(pg_catalog.decode(p_cursor,'base64'),'UTF8'),'|',1)::date;v_cursor_id:=pg_catalog.split_part(pg_catalog.convert_from(pg_catalog.decode(p_cursor,'base64'),'UTF8'),'|',2)::uuid;exception when others then raise exception using errcode='22023',message='invalid cursor';end;end if;
 with scoped as(
  select a.id,case when a.reversal_of_id is not null then 'REVERSAL' when a.pass_through_expense_id is not null then 'PASS_THROUGH_EXPENSE' else 'ACCRUAL' end record_type,
   coalesce(cr.business_date,pe.expense_date,je.business_date) business_date,oi.due_date,fd.code fee_code,fd.fee_family,
   coalesce(se.event_id::text,pe.supplier_reference) source_reference,pg_catalog.abs(a.net_amount) net_amount,pg_catalog.abs(a.tax_amount) tax_amount,pg_catalog.abs(a.gross_amount) gross_amount,
   oi.allocated_amount,oi.open_amount,a.currency_code,a.status accrual_status,oi.status open_item_status,fp.id finance_period_id,fp.status period_status,fp.period_start,fp.period_end,a.reversal_of_id
  from finance.accruals a join finance.open_items oi on oi.accrual_id=a.id join finance.fee_definitions fd on fd.id=a.fee_definition_id join finance.journal_entries je on je.id=a.journal_entry_id
  join finance.finance_periods fp on fp.id=je.finance_period_id left join finance.calculation_runs cr on cr.id=a.calculation_run_id left join finance.source_events se on se.id=cr.source_event_id left join finance.pass_through_expenses pe on pe.id=a.pass_through_expense_id
  where a.legal_entity_id=p_legal_entity_id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id and oi.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id and oi.branch_id=p_branch_id
   and(p_from is null or coalesce(cr.business_date,pe.expense_date,je.business_date)>=p_from)and(p_to is null or coalesce(cr.business_date,pe.expense_date,je.business_date)<=p_to)
   and(p_status is null or a.status=p_status)and(p_fee_family is null or fd.fee_family=p_fee_family)and(p_period_status is null or fp.status=p_period_status)
   and(v_cursor_date is null or(coalesce(cr.business_date,pe.expense_date,je.business_date),a.id)<(v_cursor_date,v_cursor_id))
 ),page as(select * from scoped order by business_date desc,id desc limit v_limit+1),visible as(select * from page order by business_date desc,id desc limit v_limit)
 select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('recordId',id,'recordType',record_type,'businessDate',business_date,'dueDate',due_date,'feeCode',fee_code,'feeFamily',fee_family,'sourceReference',source_reference,
  'totals',pg_catalog.jsonb_build_object('netAmount',net_amount::text,'taxAmount',tax_amount::text,'grossAmount',gross_amount::text,'currency',currency_code),'allocatedAmount',allocated_amount::text,'openAmount',open_amount::text,'currencyCode',currency_code,
  'status',open_item_status,'accrualStatus',accrual_status,'financePeriod',pg_catalog.jsonb_build_object('periodId',finance_period_id,'status',period_status,'periodStart',period_start,'periodEnd',period_end),'reversalReferenceId',reversal_of_id)order by business_date desc,id desc),'[]'::jsonb),
  (select count(*)>v_limit from page),case when(select count(*)>v_limit from page)then(select pg_catalog.encode(pg_catalog.convert_to(business_date::text||'|'||id::text,'UTF8'),'base64')from visible order by business_date,id limit 1)else null end
 into v_items,v_more,v_next from visible;
 return pg_catalog.jsonb_build_object('items',v_items,'hasMore',v_more,'nextCursor',v_next,'filtersApplied',pg_catalog.jsonb_build_object('feeFamily',p_fee_family,'periodStatus',p_period_status,'status',p_status));
end$$;
revoke all on function finance_api.list_accruals(uuid,uuid,uuid,date,date,text,text,text,text,integer) from public,anon;
grant execute on function finance_api.list_accruals(uuid,uuid,uuid,date,date,text,text,text,text,integer) to authenticated;
