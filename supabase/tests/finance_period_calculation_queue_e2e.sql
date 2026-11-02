\set ON_ERROR_STOP on

begin;

create or replace function finance_private.current_period_calculation_worker_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;

do $test$
declare
  actor constant uuid := '00000000-0000-4000-8000-000000000071';
  approver constant uuid := '00000000-0000-4000-8000-000000000072';
  hq constant uuid := '17000000-0000-4000-8000-000000000001';
  dealer constant uuid := '27000000-0000-4000-8000-000000000001';
  branch constant uuid := '37000000-0000-4000-8000-000000000001';
  account constant uuid := '47000000-0000-4000-8000-000000000001';
  fee constant uuid := '57000000-0000-4000-8000-000000000001';
  tax_code constant uuid := '67000000-0000-4000-8000-000000000001';
  tax_version constant uuid := '67000000-0000-4000-8000-000000000002';
  contract_id constant uuid := '67000000-0000-4000-8000-000000000003';
  contract_version constant uuid := '67000000-0000-4000-8000-000000000004';
  fee_rule constant uuid := '67000000-0000-4000-8000-000000000005';
  hq_period constant uuid := '77000000-0000-4000-8000-000000000001';
  branch_period constant uuid := '77000000-0000-4000-8000-000000000002';
  source_id constant uuid := '87000000-0000-4000-8000-000000000001';
  source_event_id constant uuid := '87000000-0000-4000-8000-000000000002';
  calculation_run constant uuid := '87000000-0000-4000-8000-000000000003';
  corr constant uuid := '97000000-0000-4000-8000-000000000001';
  source_hash text; result jsonb; replay jsonb; job_id uuid;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OTOTR-HQ-CALC-DEMO','OTOTR Sentetik Hesaplama Merkezi','ACTIVE',actor,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
  values(dealer,hq,'CALC-DEALER','Sentetik Hesaplama Bayisi','ACTIVE',actor,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
  values(branch,hq,dealer,'CALC-BRANCH','ACTIVE',actor,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
  values(account,hq,dealer,'CALC-ACCOUNT','TRY','ACTIVE',actor,corr);
  insert into finance.fee_definitions(id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id)
  values(fee,hq,'SYNTHETIC-CALC-FEE',1,'QUERY','Sentetik Hesaplama Bedeli','PUBLISHED',actor,corr);

  insert into finance.tax_codes(id,legal_entity_id,country_code,code,description,status,created_by,correlation_id)
  values(tax_code,hq,'TR','SYNTHETIC-CALC-TAX','Sentetik hesaplama vergi kodu','ACTIVE',actor,corr);
  insert into finance.tax_code_versions(
    id,tax_code_id,version_no,effective_from,calculation_method,rate,evidence_object_key,status,
    prepared_by,approved_by,approved_at_utc,created_by,correlation_id
  ) values(tax_version,tax_code,1,date '2026-11-01','PERCENTAGE',0.20,'synthetic/tax/calc.json','ACTIVE',
    actor,approver,now(),actor,corr);
  insert into finance.franchise_contracts(id,legal_entity_id,dealer_legal_entity_id,contract_code,status,created_by,correlation_id)
  values(contract_id,hq,dealer,'SYNTHETIC-CALC-CONTRACT','ACTIVE',actor,corr);
  insert into finance.contract_versions(
    id,contract_id,version_no,currency_code,effective_from,content_hash,evidence_object_key,status,
    prepared_by,approved_by,approved_at_utc,created_by,correlation_id
  ) values(contract_version,contract_id,1,'TRY',date '2026-11-01',repeat('a',64),
    'synthetic/contracts/calc.json','ACTIVE',actor,approver,now(),actor,corr);
  insert into finance.contract_fee_rules(
    id,contract_version_id,fee_definition_id,rule_code,trigger_event_type,trigger_conditions,priority,
    status,configuration_status,basis_definition,calculation_method,calculation_parameters,
    tax_code_version_id,due_rule,cancellation_policy,price_includes_tax,currency_code,decimal_scale,
    rounding_mode,prepared_by,approved_by,approved_at_utc,created_by,correlation_id
  ) values(fee_rule,contract_version,fee,'SYNTHETIC-CALC-RULE','query.completed','[]'::jsonb,100,
    'ACTIVE','CONFIGURED','{"kind":"RULE_OWNED","field":"amount"}'::jsonb,'FIXED',
    '{"amount":"100.00"}'::jsonb,tax_version,'{"kind":"DAYS_AFTER_EVENT","days":7}'::jsonb,
    '{"mode":"REVERSAL_REQUIRED"}'::jsonb,false,'TRY',2,'HALF_UP',actor,approver,now(),actor,corr);

  insert into finance.finance_periods(
    id,legal_entity_id,scope_type,period_start,period_end,currency_code,mode,status,created_by,correlation_id
  ) values(hq_period,hq,'HEADQUARTERS',date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',actor,corr);
  insert into finance.finance_periods(
    id,legal_entity_id,parent_period_id,scope_type,dealer_account_id,branch_id,period_start,period_end,
    currency_code,mode,status,created_by,correlation_id
  ) values(branch_period,hq,hq_period,'BRANCH',account,branch,date '2026-11-01',date '2026-11-30',
    'TRY','LIVE','OPEN',actor,corr);

  insert into finance.source_events(
    id,legal_entity_id,dealer_legal_entity_id,branch_id,source_system,event_id,event_type,schema_version,
    business_date,occurred_at_utc,received_at_utc,aggregate_type,aggregate_id,aggregate_version,payload,
    payload_hash,status,created_by,correlation_id
  ) values(source_id,hq,dealer,branch,'SYNTHETIC_ERP',source_event_id,'query.completed',1,date '2026-11-03',
    now(),now(),'query','synthetic-query-001',1,'{"amount":"100.00"}'::jsonb,repeat('b',64),'RECEIVED',actor,corr);

  select encode(extensions.digest(convert_to(string_agg(
    se.id::text||':'||se.event_id::text||':'||se.source_system||':'||se.event_type||':'||
    se.business_date::text||':'||se.payload_hash,'|' order by se.business_date,se.id
  ),'UTF8'),'sha256'),'hex') into source_hash
  from finance.source_events se
  join finance.dealer_accounts da on da.id=account and da.dealer_legal_entity_id=se.dealer_legal_entity_id
  where se.legal_entity_id=hq and se.branch_id=branch
    and se.business_date between date '2026-11-01' and date '2026-11-30';

  result:=finance_api.queue_finance_period_calculation(
    actor,branch_period,hq,account,branch,source_hash,1,'period-calc-queue-demo',repeat('c',64),corr
  );
  if result->>'outcome'<>'QUEUED' or result->>'version'<>'2' or result->>'sourceSnapshotHash'<>source_hash then
    raise exception 'period calculation queue failed: %',result;
  end if;
  job_id:=(result->>'jobId')::uuid;
  if not exists(select 1 from finance.finance_periods where id=branch_period and status='SOURCE_FROZEN' and source_snapshot_hash=source_hash) then
    raise exception 'period source set was not frozen';
  end if;

  result:=finance_api.finalize_finance_period_calculation(actor,branch_period,job_id,corr);
  if result->>'outcome'<>'WAITING' or result->>'status'<>'SOURCE_FROZEN' then
    raise exception 'period finalization should wait for processed source and posted run: %',result;
  end if;

  update finance.source_events set status='PROCESSED',version=version+1 where id=source_id;
  insert into finance.calculation_runs(
    id,legal_entity_id,source_event_id,contract_fee_rule_id,fee_definition_id,finance_period_id,branch_id,
    run_type,status,business_date,input_hash,result_hash,created_by,correlation_id
  ) values(calculation_run,hq,source_id,fee_rule,fee,branch_period,branch,'LIVE','POSTED',date '2026-11-03',
    repeat('d',64),repeat('e',64),actor,corr);

  result:=finance_api.finalize_finance_period_calculation(actor,branch_period,job_id,corr);
  if result->>'outcome'<>'CALCULATED' or result->>'status'<>'CALCULATED' or result->>'version'<>'3' then
    raise exception 'period finalization failed: %',result;
  end if;
  if not exists(select 1 from finance.finance_periods where id=branch_period and status='CALCULATED' and source_snapshot_hash=source_hash) then
    raise exception 'calculated period state mismatch';
  end if;

  replay:=finance_api.finalize_finance_period_calculation(actor,branch_period,job_id,corr);
  if replay->>'outcome'<>'REPLAY' then raise exception 'period finalization replay failed: %',replay; end if;
  replay:=finance_api.queue_finance_period_calculation(
    actor,branch_period,hq,account,branch,source_hash,1,'period-calc-queue-demo',repeat('c',64),corr
  );
  if replay->>'outcome'<>'REPLAY' then raise exception 'period queue replay failed: %',replay; end if;

  raise notice 'PERIOD CALCULATION E2E PASSED: OPEN -> SOURCE_FROZEN -> WAITING -> CALCULATED';
end
$test$;

rollback;
