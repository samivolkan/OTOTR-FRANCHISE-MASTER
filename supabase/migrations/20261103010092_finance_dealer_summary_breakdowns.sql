-- Enrich the branch-scoped dealer summary with fee-family and authorized branch breakdowns.
-- Customer revenue is deliberately not inferred until its ERP adapter is connected.

create or replace function finance_api.get_dealer_finance_summary(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_as_of date)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare v finance.dealer_finance_summary_snapshots%rowtype;v_families jsonb;v_branches jsonb;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDealerFinanceSummary') then raise exception using errcode='42501',message='finance scope denied';end if;
  select * into v from finance.dealer_finance_summary_snapshots where legal_entity_id=p_legal_entity_id and dealer_account_id=p_dealer_account_id and branch_id=p_branch_id and as_of_date=coalesce(p_as_of,current_date) order by calculated_at_utc desc,id desc limit 1;
  if not found then return null;end if;
  select coalesce(jsonb_agg(jsonb_build_object('feeFamily',x.fee_family,'netAmount',x.net_amount::text,'taxAmount',x.tax_amount::text,'grossAmount',x.gross_amount::text,'currency',v.currency_code) order by x.fee_family),'[]'::jsonb) into v_families from (
    select fd.fee_family,coalesce(sum(a.net_amount),0) net_amount,coalesce(sum(a.tax_amount),0) tax_amount,coalesce(sum(a.gross_amount),0) gross_amount
    from finance.accruals a join finance.fee_definitions fd on fd.id=a.fee_definition_id join finance.journal_entries je on je.id=a.journal_entry_id and je.status='POSTED'
    where a.legal_entity_id=p_legal_entity_id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id and a.currency_code=v.currency_code and a.status='POSTED' and je.business_date<=v.as_of_date group by fd.fee_family
  ) x;
  select coalesce(jsonb_agg(jsonb_build_object('branchId',x.branch_id,'branchCode',x.branch_code,'accruedGrossAmount',x.accrued_gross::text,'collectedGrossAmount',x.collected_gross::text,'openGrossAmount',x.open_gross::text,'overdueGrossAmount',x.overdue_gross::text,'currency',x.currency_code) order by x.branch_code),'[]'::jsonb) into v_branches from (
    select distinct on(s.branch_id) s.branch_id,b.branch_code,s.accrued_gross,s.collected_gross,s.open_gross,s.overdue_gross,s.currency_code
    from finance.dealer_finance_summary_snapshots s join finance.branches b on b.id=s.branch_id and b.legal_entity_id=p_legal_entity_id
    where s.legal_entity_id=p_legal_entity_id and s.dealer_account_id=p_dealer_account_id and s.as_of_date=v.as_of_date and s.currency_code=v.currency_code and b.status='ACTIVE' and finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,s.branch_id,'getDealerFinanceSummary')
    order by s.branch_id,s.calculated_at_utc desc,s.id desc
  ) x;
  return jsonb_build_object('legalEntityId',v.legal_entity_id,'dealerAccountId',v.dealer_account_id,'branchId',v.branch_id,'asOf',v.as_of_date,'currencyCode',v.currency_code,
    'accrued',jsonb_build_object('netAmount',v.accrued_net::text,'taxAmount',v.accrued_tax::text,'grossAmount',v.accrued_gross::text,'currency',v.currency_code),
    'invoiced',jsonb_build_object('netAmount',v.invoiced_net::text,'taxAmount',v.invoiced_tax::text,'grossAmount',v.invoiced_gross::text,'currency',v.currency_code),
    'collected',jsonb_build_object('netAmount',v.collected_net::text,'taxAmount',v.collected_tax::text,'grossAmount',v.collected_gross::text,'currency',v.currency_code),
    'open',jsonb_build_object('netAmount',v.open_net::text,'taxAmount',v.open_tax::text,'grossAmount',v.open_gross::text,'currency',v.currency_code),
    'overdue',jsonb_build_object('netAmount',v.overdue_net::text,'taxAmount',v.overdue_tax::text,'grossAmount',v.overdue_gross::text,'currency',v.currency_code),
    'unallocated',jsonb_build_object('amount',v.unallocated_cash_amount::text,'currency',v.currency_code),
    'deducted',jsonb_build_object('netAmount',v.deducted_net::text,'taxAmount',v.deducted_tax::text,'grossAmount',v.deducted_gross::text,'currency',v.currency_code),
    'refunded',jsonb_build_object('netAmount',v.refunded_net::text,'taxAmount',v.refunded_tax::text,'grossAmount',v.refunded_gross::text,'currency',v.currency_code),
    'disputed',jsonb_build_object('netAmount',v.disputed_net::text,'taxAmount',v.disputed_tax::text,'grossAmount',v.disputed_gross::text,'currency',v.currency_code),
    'feeFamilies',v_families,'branchBreakdown',v_branches,
    'operationalContribution',jsonb_build_object('status','SOURCE_NOT_CONNECTED','reasonCode','CUSTOMER_REVENUE_ADAPTER_REQUIRED','amount',null,'currency',v.currency_code),
    'calculatedAtUtc',v.calculated_at_utc,'readModelVersion',v.read_model_version);
end$$;
revoke all on function finance_api.get_dealer_finance_summary(uuid,uuid,uuid,date) from public,anon;
grant execute on function finance_api.get_dealer_finance_summary(uuid,uuid,uuid,date) to authenticated;
