-- OTOTR Finance internal review migration.
-- Multi-dealer headquarters summary from immutable branch snapshots plus posted accruals.

create or replace function finance_api.get_headquarters_finance_summary(
  p_legal_entity_id uuid,p_as_of date,p_currency_code text
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api as $$
declare v_result jsonb;
begin
  if not finance_api.authorize_headquarters_scope(p_legal_entity_id,'getHeadquartersFinanceSummary') then raise exception using errcode='42501',message='headquarters finance scope denied';end if;
  if p_as_of is null or p_currency_code !~ '^[A-Z]{3}$' then raise exception using errcode='22023',message='valid asOf and currency required';end if;
  with latest as (
    select distinct on(s.dealer_account_id,s.branch_id)
      s.*,da.dealer_legal_entity_id,dle.dealer_code,dle.legal_name,b.branch_code
    from finance.dealer_finance_summary_snapshots s
    join finance.dealer_accounts da on da.id=s.dealer_account_id and da.legal_entity_id=p_legal_entity_id
    join finance.dealer_legal_entities dle on dle.id=da.dealer_legal_entity_id and dle.legal_entity_id=p_legal_entity_id
    join finance.branches b on b.id=s.branch_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id and b.legal_entity_id=p_legal_entity_id
    where s.legal_entity_id=p_legal_entity_id and s.as_of_date=p_as_of and s.currency_code=p_currency_code
      and da.status in('SHADOW','ACTIVE') and dle.status='ACTIVE' and b.status='ACTIVE'
    order by s.dealer_account_id,s.branch_id,s.calculated_at_utc desc,s.id desc
  ), totals as (
    select count(distinct dealer_legal_entity_id) dealer_count,count(distinct branch_id) branch_count,
      coalesce(sum(accrued_net),0) accrued_net,coalesce(sum(accrued_tax),0) accrued_tax,coalesce(sum(accrued_gross),0) accrued_gross,
      coalesce(sum(invoiced_net),0) invoiced_net,coalesce(sum(invoiced_tax),0) invoiced_tax,coalesce(sum(invoiced_gross),0) invoiced_gross,
      coalesce(sum(collected_net),0) collected_net,coalesce(sum(collected_tax),0) collected_tax,coalesce(sum(collected_gross),0) collected_gross,
      coalesce(sum(open_net),0) open_net,coalesce(sum(open_tax),0) open_tax,coalesce(sum(open_gross),0) open_gross,
      coalesce(sum(overdue_net),0) overdue_net,coalesce(sum(overdue_tax),0) overdue_tax,coalesce(sum(overdue_gross),0) overdue_gross,
      coalesce(sum(refunded_net),0) refunded_net,coalesce(sum(refunded_tax),0) refunded_tax,coalesce(sum(refunded_gross),0) refunded_gross,
      coalesce(sum(disputed_net),0) disputed_net,coalesce(sum(disputed_tax),0) disputed_tax,coalesce(sum(disputed_gross),0) disputed_gross,
      coalesce(sum(unallocated_cash_amount),0) unallocated
    from latest
  ), ranking as (
    select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'dealerLegalEntityId',dealer_legal_entity_id,'dealerCode',dealer_code,'dealerName',legal_name,
      'dealerAccountId',dealer_account_id,'branchId',branch_id,'branchCode',branch_code,
      'accruedGrossAmount',accrued_gross::text,'collectedGrossAmount',collected_gross::text,
      'openGrossAmount',open_gross::text,'overdueGrossAmount',overdue_gross::text,'currency',currency_code
    ) order by open_gross desc,overdue_gross desc,dealer_code,branch_code) items from (select * from latest order by open_gross desc,overdue_gross desc limit 20) r
  ), families as (
    select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'feeFamily',fee_family,'netAmount',net_amount::text,'taxAmount',tax_amount::text,'grossAmount',gross_amount::text,'currency',p_currency_code
    ) order by fee_family) items from (
      select fd.fee_family,coalesce(sum(a.net_amount),0) net_amount,coalesce(sum(a.tax_amount),0) tax_amount,coalesce(sum(a.gross_amount),0) gross_amount
      from finance.accruals a join finance.fee_definitions fd on fd.id=a.fee_definition_id
      join finance.journal_entries je on je.id=a.journal_entry_id and je.status='POSTED' and je.business_date<=p_as_of
      where a.legal_entity_id=p_legal_entity_id and a.currency_code=p_currency_code and a.status='POSTED'
      group by fd.fee_family
    ) f
  )
  select case when t.branch_count=0 then null else pg_catalog.jsonb_build_object(
    'legalEntityId',p_legal_entity_id,'asOf',p_as_of,'currency',p_currency_code,'dealerCount',t.dealer_count,'branchCount',t.branch_count,
    'accrued',pg_catalog.jsonb_build_object('netAmount',t.accrued_net::text,'taxAmount',t.accrued_tax::text,'grossAmount',t.accrued_gross::text,'currency',p_currency_code),
    'invoiced',pg_catalog.jsonb_build_object('netAmount',t.invoiced_net::text,'taxAmount',t.invoiced_tax::text,'grossAmount',t.invoiced_gross::text,'currency',p_currency_code),
    'collected',pg_catalog.jsonb_build_object('netAmount',t.collected_net::text,'taxAmount',t.collected_tax::text,'grossAmount',t.collected_gross::text,'currency',p_currency_code),
    'open',pg_catalog.jsonb_build_object('netAmount',t.open_net::text,'taxAmount',t.open_tax::text,'grossAmount',t.open_gross::text,'currency',p_currency_code),
    'overdue',pg_catalog.jsonb_build_object('netAmount',t.overdue_net::text,'taxAmount',t.overdue_tax::text,'grossAmount',t.overdue_gross::text,'currency',p_currency_code),
    'refunded',pg_catalog.jsonb_build_object('netAmount',t.refunded_net::text,'taxAmount',t.refunded_tax::text,'grossAmount',t.refunded_gross::text,'currency',p_currency_code),
    'disputed',pg_catalog.jsonb_build_object('netAmount',t.disputed_net::text,'taxAmount',t.disputed_tax::text,'grossAmount',t.disputed_gross::text,'currency',p_currency_code),
    'unallocated',pg_catalog.jsonb_build_object('amount',t.unallocated::text,'currency',p_currency_code),
    'feeFamilies',coalesce(f.items,'[]'::jsonb),'dealerRanking',coalesce(r.items,'[]'::jsonb)
  ) end into v_result from totals t cross join ranking r cross join families f;
  return v_result;
end$$;

revoke all on function finance_api.get_headquarters_finance_summary(uuid,date,text) from public,anon;
grant execute on function finance_api.get_headquarters_finance_summary(uuid,date,text) to authenticated;
