\set ON_ERROR_STOP on

begin;

-- Test-only server worker claims. Both replacements are rolled back with the
-- transaction and can never survive this script.
create or replace function finance_private.current_accrual_worker_is_trusted()
returns boolean language sql stable security definer set search_path=''
as $$ select true $$;

create or replace function finance_private.current_refund_worker_is_trusted()
returns boolean language sql stable security definer set search_path=''
as $$ select true $$;

create or replace function finance_api.authorize_scope(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path=''
as $$ select true $$;

do $test$
declare
  v_actor constant uuid := '00000000-0000-4000-8000-000000000001';
  v_approver constant uuid := '00000000-0000-4000-8000-000000000002';
  v_hq constant uuid := '10000000-0000-4000-8000-000000000001';
  v_dealer constant uuid := '20000000-0000-4000-8000-000000000001';
  v_branch constant uuid := '30000000-0000-4000-8000-000000000001';
  v_account constant uuid := '40000000-0000-4000-8000-000000000001';
  v_fee constant uuid := '50000000-0000-4000-8000-000000000001';
  v_tax_code constant uuid := '51000000-0000-4000-8000-000000000001';
  v_tax_version constant uuid := '52000000-0000-4000-8000-000000000001';
  v_mapping constant uuid := '53000000-0000-4000-8000-000000000001';
  v_contract constant uuid := '60000000-0000-4000-8000-000000000001';
  v_contract_version constant uuid := '61000000-0000-4000-8000-000000000001';
  v_rule constant uuid := '62000000-0000-4000-8000-000000000001';
  v_oct_hq_period constant uuid := '70000000-0000-4000-8000-000000000001';
  v_oct_branch_period constant uuid := '71000000-0000-4000-8000-000000000001';
  v_nov_hq_period constant uuid := '70000000-0000-4000-8000-000000000002';
  v_nov_branch_period constant uuid := '71000000-0000-4000-8000-000000000002';
  v_collection_event constant uuid := '80000000-0000-4000-8000-000000000001';
  v_collection_id constant uuid := '81000000-0000-4000-8000-000000000001';
  v_refund_event constant uuid := '80000000-0000-4000-8000-000000000002';
  v_collection_corr constant uuid := '90000000-0000-4000-8000-000000000001';
  v_refund_corr constant uuid := '90000000-0000-4000-8000-000000000002';
  v_context jsonb;
  v_command jsonb;
  v_rule_snapshot jsonb;
  v_result jsonb;
  v_refund_context jsonb;
  v_refund_result jsonb;
  v_trace jsonb;
  v_trace_by_accrual jsonb;
  v_calculation_trace jsonb;
  v_refund_list jsonb;
  v_replay jsonb;
  v_original_accrual uuid;
  v_original_journal uuid;
  v_reversal_accrual uuid;
  v_count integer;
  v_amount numeric(24,8);
begin
  insert into finance.legal_entities(
    id,entity_code,legal_name,status,created_by,correlation_id
  ) values (
    v_hq,'OTOTR-HQ-DEMO','OTOTR Genel Merkez Sentetik','ACTIVE',v_actor,v_collection_corr
  );

  insert into finance.dealer_legal_entities(
    id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id
  ) values (
    v_dealer,v_hq,'DEMO-DEALER','Sentetik Bayi A.Ş.','ACTIVE',v_actor,v_collection_corr
  );

  insert into finance.branches(
    id,legal_entity_id,dealer_legal_entity_id,branch_code,external_branch_id,status,created_by,correlation_id
  ) values (
    v_branch,v_hq,v_dealer,'DEMO-BRANCH','ERP-DEMO-BRANCH','ACTIVE',v_actor,v_collection_corr
  );

  insert into finance.dealer_accounts(
    id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id
  ) values (
    v_account,v_hq,v_dealer,'DEMO-TRY','TRY','ACTIVE',v_actor,v_collection_corr
  );

  insert into finance.fee_definitions(
    id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id
  ) values (
    v_fee,v_hq,'ROYALTY-COLLECTION',1,'ROYALTY','Tahsilat Bazlı Royalty','PUBLISHED',v_actor,v_collection_corr
  );

  insert into finance.tax_codes(
    id,legal_entity_id,country_code,code,description,status,created_by,correlation_id
  ) values (
    v_tax_code,v_hq,'TR','KDV20','KDV yüzde 20','ACTIVE',v_actor,v_collection_corr
  );

  insert into finance.tax_code_versions(
    id,tax_code_id,version_no,effective_from,calculation_method,rate,
    evidence_object_key,status,prepared_by,approved_by,approved_at_utc,
    created_by,correlation_id
  ) values (
    v_tax_version,v_tax_code,1,date '2026-01-01','INCLUDED_IN_GROSS',0.20000000,
    'synthetic/tax/kdv20','ACTIVE',v_actor,v_approver,statement_timestamp(),
    v_actor,v_collection_corr
  );

  insert into finance.accounting_mappings(
    id,legal_entity_id,fee_definition_id,version_no,effective_from,
    receivable_account_code,revenue_account_code,tax_account_code,reversal_account_code,
    status,prepared_by,approved_by,approved_at_utc,created_by,correlation_id
  ) values (
    v_mapping,v_hq,v_fee,1,date '2026-01-01',
    '120.ROYALTY','600.ROYALTY','391.KDV','610.ROYALTY.REV',
    'ACTIVE',v_actor,v_approver,statement_timestamp(),v_actor,v_collection_corr
  );

  insert into finance.franchise_contracts(
    id,legal_entity_id,dealer_legal_entity_id,contract_code,status,created_by,correlation_id
  ) values (
    v_contract,v_hq,v_dealer,'DEMO-FRANCHISE-2026','ACTIVE',v_actor,v_collection_corr
  );

  insert into finance.contract_versions(
    id,contract_id,version_no,currency_code,effective_from,content_hash,evidence_object_key,
    status,prepared_by,approved_by,approved_at_utc,created_by,correlation_id
  ) values (
    v_contract_version,v_contract,1,'TRY',date '2026-01-01',repeat('a',64),'synthetic/contracts/demo-v1',
    'ACTIVE',v_actor,v_approver,statement_timestamp(),v_actor,v_collection_corr
  );

  insert into finance.contract_fee_rules(
    id,contract_version_id,fee_definition_id,rule_code,trigger_event_type,trigger_conditions,
    priority,status,configuration_status,basis_definition,calculation_method,calculation_parameters,
    tax_code_version_id,due_rule,cancellation_policy,price_includes_tax,
    currency_code,decimal_scale,rounding_mode,prepared_by,approved_by,approved_at_utc,
    created_by,correlation_id
  ) values (
    v_rule,v_contract_version,v_fee,'ROYALTY-10-PCT','customer-payment.settled','[]'::jsonb,
    100,'ACTIVE','CONFIGURED',
    '{"type":"COLLECTED_GROSS","partialPolicy":"EACH_SETTLEMENT","priceIncludesTax":true}'::jsonb,
    'PERCENTAGE','{"rate":"0.10"}'::jsonb,v_tax_version,
    '{"days":7}'::jsonb,'{"refundMode":"PROPORTIONAL_AUTOMATIC"}'::jsonb,true,
    'TRY',8,'HALF_UP',v_actor,v_approver,statement_timestamp(),v_actor,v_collection_corr
  );

  insert into finance.finance_periods(
    id,legal_entity_id,scope_type,period_start,period_end,currency_code,mode,status,created_by,correlation_id
  ) values
    (v_oct_hq_period,v_hq,'HEADQUARTERS',date '2026-10-01',date '2026-10-31','TRY','LIVE','OPEN',v_actor,v_collection_corr),
    (v_nov_hq_period,v_hq,'HEADQUARTERS',date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',v_actor,v_refund_corr);

  insert into finance.finance_periods(
    id,legal_entity_id,parent_period_id,scope_type,dealer_account_id,branch_id,
    period_start,period_end,currency_code,mode,status,created_by,correlation_id
  ) values
    (v_oct_branch_period,v_hq,v_oct_hq_period,'BRANCH',v_account,v_branch,
     date '2026-10-01',date '2026-10-31','TRY','LIVE','OPEN',v_actor,v_collection_corr),
    (v_nov_branch_period,v_hq,v_nov_hq_period,'BRANCH',v_account,v_branch,
     date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',v_actor,v_refund_corr);

  insert into finance.source_events(
    id,legal_entity_id,dealer_legal_entity_id,branch_id,source_system,event_id,event_type,
    schema_version,business_date,occurred_at_utc,received_at_utc,aggregate_type,aggregate_id,
    aggregate_version,payload,payload_hash,status,created_by,correlation_id
  ) values (
    v_collection_event,v_hq,v_dealer,v_branch,'ERP',v_collection_event,'customer-payment.settled',
    1,date '2026-10-15',timestamptz '2026-10-15 10:00:00+03',timestamptz '2026-10-15 10:00:01+03',
    'CUSTOMER_COLLECTION',v_collection_id::text,1,
    jsonb_build_object(
      'collectionId',v_collection_id,'branchId',v_branch,'currency','TRY',
      'collectedGrossAmount','1180.00000000','settlementStatus','SETTLED','partial',true
    ),repeat('b',64),'RECEIVED',v_actor,v_collection_corr
  );

  v_context := jsonb_build_object(
    'financePeriod',jsonb_build_object('id',v_oct_branch_period,'status','OPEN'),
    'taxVersion',jsonb_build_object('id',v_tax_version,'rate','0.20000000','status','ACTIVE'),
    'accountingMapping',jsonb_build_object(
      'id',v_mapping,'receivableAccountCode','120.ROYALTY',
      'revenueAccountCode','600.ROYALTY','taxAccountCode','391.KDV',
      'reversalAccountCode','610.ROYALTY.REV'
    )
  );
  v_rule_snapshot := jsonb_build_object(
    'feeRuleId',v_rule,'feeDefinitionId',v_fee,'version',1,'code','ROYALTY-10-PCT',
    'basis',jsonb_build_object('type','COLLECTED_GROSS','partialPolicy','EACH_SETTLEMENT','priceIncludesTax',true),
    'calculation',jsonb_build_object('method','PERCENTAGE','parameters',jsonb_build_object('rate','0.10'))
  );
  v_command := jsonb_build_object(
    'legalEntityId',v_hq,'dealerLegalEntityId',v_dealer,'dealerAccountId',v_account,
    'branchId',v_branch,'sourceEventId',v_collection_event,'feeDefinitionId',v_fee,
    'runType','LIVE','correlationId',v_collection_corr,'idempotencyKey','demo:royalty:collection:1'
  );

  v_result := finance_api.commit_accrual_calculation(
    v_actor,v_command,v_context,v_rule_snapshot,
    '{"status":"CALCULATED","basisAmount":"1180.00000000","amounts":{"netAmount":"98.33333333","taxAmount":"19.66666667","grossAmount":"118.00000000","currency":"TRY"}}'::jsonb,
    date '2026-10-22',repeat('d',64),repeat('e',64),'{}'::jsonb
  );
  if v_result->>'outcome' <> 'CREATED' then
    raise exception 'original royalty accrual was not created: %',v_result;
  end if;

  select a.id,a.journal_entry_id into strict v_original_accrual,v_original_journal
    from finance.accruals a
   where a.calculation_run_id=(v_result->>'calculationRunId')::uuid;

  select a.gross_amount into v_amount from finance.accruals a where a.id=v_original_accrual;
  if v_amount <> 118.00000000 then raise exception 'royalty gross mismatch: %',v_amount; end if;

  v_calculation_trace:=finance_api.get_accrual_calculation_trace(v_hq,v_account,v_branch,v_original_accrual);
  if v_calculation_trace#>>'{basis,amount}'<>'1180.00000000'
     or v_calculation_trace#>>'{calculation,method}'<>'PERCENTAGE'
     or v_calculation_trace#>>'{calculation,parameters,rate}'<>'0.10'
     or v_calculation_trace#>>'{tax,rate}'<>'0.20000000'
     or (v_calculation_trace->>'rawInputExposed')::boolean then
    raise exception 'safe calculation trace mismatch: %',v_calculation_trace;
  end if;

  select oi.open_amount into v_amount from finance.open_items oi
   where oi.accrual_id=v_original_accrual and oi.item_type='DEBIT';
  if v_amount <> 118.00000000 then raise exception 'royalty debit open item mismatch: %',v_amount; end if;

  update finance.finance_periods
     set status='LOCKED',locked_at_utc=statement_timestamp(),version=version+1
   where id=v_oct_branch_period;

  insert into finance.source_events(
    id,legal_entity_id,dealer_legal_entity_id,branch_id,source_system,event_id,event_type,
    schema_version,business_date,occurred_at_utc,received_at_utc,aggregate_type,aggregate_id,
    aggregate_version,payload,payload_hash,status,created_by,correlation_id
  ) values (
    v_refund_event,v_hq,v_dealer,v_branch,'ERP',v_refund_event,'customer-payment.refunded',
    1,date '2026-11-03',timestamptz '2026-11-03 09:00:00+03',timestamptz '2026-11-03 09:00:01+03',
    'CUSTOMER_REFUND',v_refund_event::text,1,
    jsonb_build_object(
      'refundId',v_refund_event,'originalCollectionId',v_collection_id,
      'branchId',v_branch,'currency','TRY','refundedGrossAmount','590.00000000',
      'settlementStatus','SETTLED','refundStatus','SETTLED'
    ),repeat('c',64),'RECEIVED',v_actor,v_refund_corr
  );

  v_refund_context := finance_api.load_royalty_refund_context(
    v_hq,v_dealer,v_account,v_branch,v_refund_event,v_refund_event
  );
  if v_refund_context is null then raise exception 'refund context was not resolved'; end if;
  if v_refund_context#>>'{financePeriod,id}' <> v_oct_branch_period::text then
    raise exception 'original period reference was not preserved in context';
  end if;
  if v_refund_context#>>'{currentOpenFinancePeriod,id}' <> v_nov_branch_period::text then
    raise exception 'current open posting period was not selected';
  end if;

  v_refund_result := finance_api.process_royalty_refund_reversal(
    v_actor,v_hq,v_dealer,v_account,v_branch,v_refund_event,v_refund_event,
    'demo:royalty:refund:1',v_refund_corr
  );
  if v_refund_result->>'outcome' <> 'CREATED' then
    raise exception 'royalty refund reversal was not created: %',v_refund_result;
  end if;
  v_reversal_accrual := (v_refund_result->>'reversalAccrualId')::uuid;

  select a.gross_amount into v_amount from finance.accruals a
   where a.id=v_reversal_accrual and a.reversal_of_id=v_original_accrual;
  if v_amount <> -59.00000000 then raise exception 'reversal accrual mismatch: %',v_amount; end if;

  select oi.open_amount into v_amount from finance.open_items oi
   where oi.accrual_id=v_reversal_accrual and oi.item_type='CREDIT';
  if v_amount <> 59.00000000 then raise exception 'refund credit open item mismatch: %',v_amount; end if;

  select count(*) into v_count from finance.journal_entries je
   where je.reversal_of_id=v_original_journal and je.finance_period_id=v_nov_branch_period;
  if v_count <> 1 then raise exception 'reversal journal provenance mismatch'; end if;

  select count(*) into v_count
    from finance.journal_entries je
   where exists (
     select 1 from finance.journal_lines jl where jl.journal_entry_id=je.id
     group by jl.journal_entry_id
     having sum(jl.debit_amount)<>sum(jl.credit_amount)
   );
  if v_count <> 0 then raise exception 'unbalanced journal detected'; end if;

  select sum(a.gross_amount) into v_amount
    from finance.accruals a
   where a.id=v_original_accrual or a.reversal_of_id=v_original_accrual;
  if v_amount <> 59.00000000 then raise exception 'net royalty after refund mismatch: %',v_amount; end if;

  select count(*) into v_count from finance.audit_events ae
   where ae.action_code='ROYALTY_REFUND_REVERSED'
     and ae.safe_context->>'originalPeriodId'=v_oct_branch_period::text
     and ae.safe_context->>'postingPeriodId'=v_nov_branch_period::text;
  if v_count <> 1 then raise exception 'audit period provenance missing'; end if;

  v_replay := finance_api.process_royalty_refund_reversal(
    v_actor,v_hq,v_dealer,v_account,v_branch,v_refund_event,v_refund_event,
    'demo:royalty:refund:1',v_refund_corr
  );
  if v_replay->>'outcome' <> 'REPLAY' then raise exception 'refund replay was not idempotent: %',v_replay; end if;

  select count(*) into v_count from finance.accruals a where a.reversal_of_id=v_original_accrual;
  if v_count <> 1 then raise exception 'idempotent replay created duplicate reversal'; end if;

  v_trace:=finance_api.get_royalty_refund_trace(v_hq,v_account,v_branch,v_refund_event);
  if v_trace#>>'{refundEvent,refundedGrossAmount}' is distinct from '590.00000000'
     or v_trace#>>'{originalRoyaltyAccrual,grossAmount}' is distinct from '118.00000000'
     or v_trace#>>'{reversalAccrual,grossAmount}' is distinct from '-59.00000000'
     or v_trace#>>'{periodProvenance,originalPeriodId}' is distinct from v_oct_branch_period::text
     or v_trace#>>'{periodProvenance,postingPeriodId}' is distinct from v_nov_branch_period::text then
    raise exception 'royalty refund trace projection mismatch: %',v_trace;
  end if;
  v_trace_by_accrual:=finance_api.get_royalty_refund_trace_by_accrual(v_hq,v_account,v_branch,v_reversal_accrual);
  if v_trace_by_accrual is distinct from v_trace then
    raise exception 'refund trace by reversal accrual mismatch: %',v_trace_by_accrual;
  end if;

  v_refund_list:=finance_api.list_royalty_refunds(
    v_hq,v_account,v_branch,date '2026-11-01',date '2026-11-30',null,50
  );
  if pg_catalog.jsonb_array_length(v_refund_list->'items')<>1
     or v_refund_list#>>'{items,0,reversalAccrualId}'<>v_reversal_accrual::text
     or v_refund_list#>>'{items,0,refundId}'<>v_refund_event::text
     or v_refund_list#>>'{items,0,refundedGrossAmount}'<>'590.00000000'
     or v_refund_list#>>'{items,0,originalRoyaltyAmount}'<>'118.00000000'
     or v_refund_list#>>'{items,0,royaltyReversalAmount}'<>'59.00000000'
     or v_refund_list#>>'{items,0,originalPeriodId}'<>v_oct_branch_period::text
     or v_refund_list#>>'{items,0,postingPeriodId}'<>v_nov_branch_period::text
     or (v_refund_list->>'hasMore')::boolean then
    raise exception 'royalty refund list projection mismatch: %',v_refund_list;
  end if;

  raise notice 'ROYALTY E2E PASSED: collection=1180.00 royalty=118.00 refund=590.00 reversal=59.00 net=59.00';
end
$test$;

rollback;
