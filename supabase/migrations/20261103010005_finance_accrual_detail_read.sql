-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-accrual-detail-read-rpc.sql
-- Source SHA256: 4066C8D0B6767BBFF55C7973435F2D5DEFC426333A7C8ED2D62CAE90412EDC84
-- Local replay required before any staging promotion.
-- OTOTR ACCRUAL DETAIL READ RPC CANDIDATE

create or replace function finance_api.get_accrual_detail(
  p_legal_entity_id uuid,
  p_dealer_account_id uuid,
  p_branch_id uuid,
  p_accrual_id uuid
) returns jsonb
language plpgsql stable security definer
set search_path = pg_catalog,finance,finance_api
as $$
declare
  v record;
  v_lines jsonb;
  v_dispute_ids jsonb;
  v_external_invoice_id uuid;
  v_reversal_entry_id uuid;
  v_reversal_count integer;
begin
  if not finance_api.authorize_scope(
    p_legal_entity_id,p_dealer_account_id,p_branch_id,'getAccrualDetail'
  ) then
    raise exception using errcode='42501',message='finance scope denied';
  end if;

  select a.*,cr.source_event_id,cr.contract_fee_rule_id,cr.finance_period_id,
         cr.business_date,cs.contract_version_id,cs.result_snapshot,
         se.source_system,se.event_type,se.event_id,se.aggregate_version,
         da.dealer_legal_entity_id,fd.code fee_definition_code,
         je.id journal_id,je.idempotency_key,je.entry_type,je.posting_date,
         je.status journal_status,je.reversal_of_id journal_reversal_of_id,
         je.posted_at_utc,je.posted_by,je.created_at_utc journal_created_at_utc,
         je.created_by journal_created_by,je.correlation_id journal_correlation_id,
         oi.id open_item_id
    into v
    from finance.accruals a
    join finance.calculation_runs cr on cr.id=a.calculation_run_id
    join finance.calculation_snapshots cs on cs.calculation_run_id=cr.id
    join finance.source_events se on se.id=cr.source_event_id
    join finance.dealer_accounts da on da.id=a.dealer_account_id
    join finance.fee_definitions fd on fd.id=a.fee_definition_id
    join finance.journal_entries je on je.id=a.journal_entry_id
    left join finance.open_items oi on oi.accrual_id=a.id
   where a.id=p_accrual_id
     and a.legal_entity_id=p_legal_entity_id
     and a.dealer_account_id=p_dealer_account_id
     and a.branch_id=p_branch_id
     and cr.legal_entity_id=p_legal_entity_id
     and cr.branch_id=p_branch_id
     and se.legal_entity_id=p_legal_entity_id
     and se.dealer_legal_entity_id=da.dealer_legal_entity_id
     and se.branch_id=p_branch_id;

  if not found then return null; end if;
  if pg_catalog.jsonb_typeof(v.result_snapshot)<>'object' then
    raise exception using errcode='23514',message='accrual calculation snapshot invalid';
  end if;

  select pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
             'lineId',jl.id,
             'lineNumber',jl.line_no,
             'accountCode',jl.account_code,
             'direction',case when jl.debit_amount>0 then 'DEBIT' else 'CREDIT' end,
             'amount',case when jl.debit_amount>0 then jl.debit_amount::text else jl.credit_amount::text end,
             'dealerAccountId',jl.dealer_account_id,
             'openItemId',case when jl.dealer_account_id=p_dealer_account_id then v.open_item_id else null end,
             'feeDefinitionCode',v.fee_definition_code,
             'description',coalesce(nullif(jl.dimensions->>'description',''),jl.account_code)
           ) order by jl.line_no
         )
    into v_lines
    from finance.journal_lines jl
   where jl.journal_entry_id=v.journal_id
     and jl.branch_id=p_branch_id
     and jl.currency_code=v.currency_code;

  if pg_catalog.jsonb_array_length(coalesce(v_lines,'[]'::jsonb))<2 then
    raise exception using errcode='23514',message='accrual journal projection incomplete';
  end if;

  select coalesce(pg_catalog.jsonb_agg(d.id order by d.created_at_utc,d.id),'[]'::jsonb)
    into v_dispute_ids
    from finance.disputes d
   where d.legal_entity_id=p_legal_entity_id and d.open_item_id=v.open_item_id;

  select ei.id
    into v_external_invoice_id
    from finance.billing_batch_items bbi
    join finance.external_invoices ei on ei.billing_batch_id=bbi.billing_batch_id
   where bbi.accrual_id=v.id and bbi.status='ACTIVE'
   order by ei.created_at_utc desc,ei.id desc limit 1;

  select pg_catalog.count(*),(pg_catalog.array_agg(child.journal_entry_id order by child.created_at_utc,child.id))[1]
    into v_reversal_count,v_reversal_entry_id
    from finance.accruals child
   where child.reversal_of_id=v.id and child.legal_entity_id=p_legal_entity_id
     and child.dealer_account_id=p_dealer_account_id and child.branch_id=p_branch_id;
  if v_reversal_count<>1 then v_reversal_entry_id:=null; end if;

  return pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
    'accrualId',v.id,
    'sourceEventId',v.source_event_id::text,
    'contractVersionId',v.contract_version_id,
    'feeRuleId',v.contract_fee_rule_id,
    'calculation',v.result_snapshot,
    'journalEntry',pg_catalog.jsonb_build_object(
      'journalEntryId',v.journal_id,
      'entryNumber','JE-'||v.journal_id::text,
      'entryType',case when v.journal_reversal_of_id is not null then 'REVERSAL' else 'ACCRUAL' end,
      'status',v.journal_status,
      'postingDate',v.posting_date,
      'currency',v.currency_code,
      'scope',pg_catalog.jsonb_build_object(
        'headquartersLegalEntityId',p_legal_entity_id,
        'dealerLegalEntityId',v.dealer_legal_entity_id,
        'branchId',p_branch_id
      ),
      'source',pg_catalog.jsonb_build_object(
        'sourceSystem',v.source_system,
        'sourceType',v.event_type,
        'sourceId',v.event_id::text,
        'sourceVersion',v.aggregate_version
      ),
      'trace',pg_catalog.jsonb_build_object('correlationId',v.journal_correlation_id::text),
      'originalEntryId',v.journal_reversal_of_id,
      'calculationId',v.calculation_run_id,
      'lines',v_lines,
      'preparedBy',pg_catalog.jsonb_build_object('actorType','USER','actorId',v.journal_created_by::text),
      'preparedAtUtc',v.journal_created_at_utc,
      'approvedBy',case when v.posted_by is null then null else pg_catalog.jsonb_build_object('actorType','USER','actorId',v.posted_by::text) end,
      'approvedAtUtc',v.posted_at_utc,
      'postedAtUtc',v.posted_at_utc
    ),
    'openItemId',v.open_item_id,
    'externalInvoiceId',v_external_invoice_id,
    'disputeIds',v_dispute_ids,
    'reversalEntryId',v_reversal_entry_id,
    'status',v.status
  ));
end $$;

revoke all on function finance_api.get_accrual_detail(uuid,uuid,uuid,uuid) from public, anon;
