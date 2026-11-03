\set ON_ERROR_STOP on

begin;

create or replace function finance_api.authorize_scope(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path='' as $$select true$$;

-- Test-only authorization ports. Overrides and data are rolled back together.
create or replace function finance_api.authorize_accrual_calculation_scope(
  p_legal_entity_id uuid,p_dealer_legal_entity_id uuid,p_branch_id uuid,p_permission text
) returns boolean language sql stable security definer set search_path=''
as $$select p_permission='finance.accruals.calculate'$$;

create or replace function finance_private.current_accrual_worker_is_trusted()
returns boolean language sql stable security definer set search_path=''
as $$select true$$;

create or replace function finance_private.current_service_usage_exception_committer_is_trusted()
returns boolean language sql stable security definer set search_path=''
as $$select true$$;

do $test$
declare
  maker constant uuid := '00000000-0000-4000-8000-000000000021';
  checker constant uuid := '00000000-0000-4000-8000-000000000022';
  hq constant uuid := '12000000-0000-4000-8000-000000000001';
  dealer constant uuid := '22000000-0000-4000-8000-000000000001';
  branch constant uuid := '32000000-0000-4000-8000-000000000001';
  account constant uuid := '42000000-0000-4000-8000-000000000001';
  contract_id constant uuid := '52000000-0000-4000-8000-000000000001';
  contract_version constant uuid := '62000000-0000-4000-8000-000000000001';
  hq_period constant uuid := '72000000-0000-4000-8000-000000000001';
  branch_period constant uuid := '72000000-0000-4000-8000-000000000002';
  tax_code constant uuid := '82000000-0000-4000-8000-000000000001';
  tax_version constant uuid := '82000000-0000-4000-8000-000000000002';
  corr constant uuid := '92000000-0000-4000-8000-000000000001';
  families text[] := array['ENTRY_FRANCHISE','QUERY','EXTERNAL_SERVICE','OPTIONAL_PRODUCT_SERVICE'];
  events text[] := array['franchise.entry.activated','query.completed','external-service.delivered','optional-service.activated'];
  nets numeric[] := array[1000.00,100.00,250.00,300.00];
  fee_id uuid; rule_id uuid; mapping_id uuid; source_id uuid; event_id uuid; usage_exception_source uuid; usage_exception_rule uuid; usage_exception_request uuid;
  context jsonb; rule jsonb; command jsonb; calculation jsonb; result jsonb; replay jsonb; contract_projection jsonb; rule_page jsonb; usage_page jsonb;
  rule_cursor uuid;
  i integer; journal_count integer; accrual_count integer; open_count integer; test_accrual uuid;
  gross numeric(24,8); expected_total numeric(24,8):=1980.00000000;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OTOTR-HQ-FAMILY-DEMO','OTOTR Sentetik Bedel Aileleri','ACTIVE',maker,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
  values(dealer,hq,'FAMILY-DEALER','Sentetik Bedel Bayisi','ACTIVE',maker,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
  values(branch,hq,dealer,'FAMILY-BRANCH','ACTIVE',maker,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
  values(account,hq,dealer,'FAMILY-ACCOUNT','TRY','ACTIVE',maker,corr);

  insert into finance.franchise_contracts(id,legal_entity_id,dealer_legal_entity_id,contract_code,status,created_by,correlation_id)
  values(contract_id,hq,dealer,'SYNTHETIC-FAMILY-CONTRACT','ACTIVE',maker,corr);
  insert into finance.contract_versions(
    id,contract_id,version_no,currency_code,effective_from,content_hash,evidence_object_key,status,
    prepared_by,approved_by,approved_at_utc,created_by,correlation_id
  ) values(
    contract_version,contract_id,1,'TRY',date '2026-11-01',repeat('a',64),'synthetic/contracts/family.json','ACTIVE',
    maker,checker,now(),maker,corr
  );

  insert into finance.finance_periods(
    id,legal_entity_id,scope_type,period_start,period_end,currency_code,mode,status,created_by,correlation_id
  ) values(hq_period,hq,'HEADQUARTERS',date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',maker,corr);
  insert into finance.finance_periods(
    id,legal_entity_id,parent_period_id,scope_type,dealer_account_id,branch_id,period_start,period_end,
    currency_code,mode,status,created_by,correlation_id
  ) values(branch_period,hq,hq_period,'BRANCH',account,branch,date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',maker,corr);

  insert into finance.tax_codes(id,legal_entity_id,country_code,code,description,status,created_by,correlation_id)
  values(tax_code,hq,'TR','SYNTHETIC-KDV20','Yalnızca sentetik test vergi kodu','ACTIVE',maker,corr);
  insert into finance.tax_code_versions(
    id,tax_code_id,version_no,effective_from,calculation_method,rate,evidence_object_key,status,
    prepared_by,approved_by,approved_at_utc,created_by,correlation_id
  ) values(
    tax_version,tax_code,1,date '2026-11-01','PERCENTAGE',0.20000000,'synthetic/tax/kdv20.json','ACTIVE',
    maker,checker,now(),maker,corr
  );

  for i in 1..array_length(families,1) loop
    fee_id:=gen_random_uuid(); rule_id:=gen_random_uuid(); mapping_id:=gen_random_uuid();
    source_id:=gen_random_uuid(); event_id:=gen_random_uuid(); gross:=nets[i]*1.20;

    insert into finance.fee_definitions(id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id)
    values(fee_id,hq,'SYNTHETIC-'||families[i],1,families[i],'Sentetik '||families[i],'PUBLISHED',maker,corr);
    insert into finance.accounting_mappings(
      id,legal_entity_id,fee_definition_id,version_no,effective_from,receivable_account_code,
      revenue_account_code,tax_account_code,reversal_account_code,status,prepared_by,approved_by,
      approved_at_utc,created_by,correlation_id
    ) values(
      mapping_id,hq,fee_id,1,date '2026-11-01','120.BAYI','600.'||i,'391.KDV','610.'||i,
      'ACTIVE',maker,checker,now(),maker,corr
    );
    insert into finance.contract_fee_rules(
      id,contract_version_id,fee_definition_id,rule_code,trigger_event_type,trigger_conditions,priority,
      status,configuration_status,basis_definition,calculation_method,calculation_parameters,
      tax_code_version_id,due_rule,cancellation_policy,price_includes_tax,currency_code,decimal_scale,
      rounding_mode,prepared_by,approved_by,approved_at_utc,created_by,correlation_id
    ) values(
      rule_id,contract_version,fee_id,'SYNTHETIC-RULE-'||i,events[i],'[]'::jsonb,100,
      'ACTIVE','CONFIGURED','{"kind":"RULE_OWNED","field":"amount"}'::jsonb,'FIXED',
      jsonb_build_object('amount',nets[i]::text),tax_version,'{"kind":"DAYS_AFTER_EVENT","days":7}'::jsonb,
      '{"mode":"REVERSAL_REQUIRED"}'::jsonb,false,'TRY',2,'HALF_UP',maker,checker,now(),maker,corr
    );
    insert into finance.source_events(
      id,legal_entity_id,dealer_legal_entity_id,branch_id,source_system,event_id,event_type,schema_version,
      business_date,occurred_at_utc,received_at_utc,aggregate_type,aggregate_id,aggregate_version,payload,
      payload_hash,status,created_by,correlation_id
    ) values(
      source_id,hq,dealer,branch,'SYNTHETIC_ERP',event_id,events[i],1,date '2026-11-03',now(),now(),
      'charge-family','family-'||i,1,jsonb_build_object('amount',nets[i]::text)||case when i=2 then jsonb_build_object('serviceCode','TRAMER_QUERY','providerCode','PROVIDER-A','externalReference','QUERY-001','providerCostAmount','50.00000000','currency','TRY','freeEntitlementApplied',false,'technicalRepeat',false) when i=3 then jsonb_build_object('serviceCode','VALUATION_SERVICE','providerCode','PROVIDER-B','externalReference','SERVICE-001','providerCostAmount','200.00000000','currency','TRY','freeEntitlementApplied',false,'technicalRepeat',false) else '{}'::jsonb end,repeat(i::text,64),
      'RECEIVED',maker,corr
    );

    if i=1 then
      insert into finance.rule_exceptions(contract_fee_rule_id,exception_code,scope_definition,condition_definition,override_definition,priority,effective_from,status,prepared_by,approved_by,approved_at_utc,created_by,correlation_id)
      values
        (rule_id,'GLOBAL_RATE','{"type":"GLOBAL"}'::jsonb,'{"type":"DATE_RANGE"}'::jsonb,'{"type":"RATE_OVERRIDE","rate":"0.15"}'::jsonb,200,date '2026-11-01','ACTIVE',maker,checker,now(),maker,corr),
        (rule_id,'BRANCH_RATE',jsonb_build_object('type','BRANCH','branchId',branch),'{"type":"DATE_RANGE"}'::jsonb,'{"type":"RATE_OVERRIDE","rate":"0.20"}'::jsonb,200,date '2026-11-01','ACTIVE',maker,checker,now(),maker,corr);
    end if;

    context:=finance_api.load_accrual_calculation_context(hq,dealer,account,branch,source_id,fee_id,'LIVE');
    if context is null then raise exception 'context missing for family %',families[i]; end if;
    rule:=context#>'{rules,0}';
    if rule->>'category'<>lower(families[i]) then
      raise exception 'family category mismatch for %: %',families[i],rule->>'category';
    end if;
    if i=1 and (rule#>>'{calculation,method}'<>'PERCENTAGE' or rule#>>'{calculation,parameters,rate}'<>'0.20' or rule#>>'{appliedException,exceptionCode}'<>'BRANCH_RATE' or rule#>'{appliedException,override}' is not null) then
      raise exception 'deterministic branch exception was not safely applied: %',rule;
    end if;
    command:=jsonb_build_object(
      'legalEntityId',hq,'dealerLegalEntityId',dealer,'dealerAccountId',account,'branchId',branch,
      'sourceEventId',source_id,'feeDefinitionId',fee_id,'runType','LIVE','correlationId',corr,
      'idempotencyKey','family-accrual-'||i
    );
    calculation:=jsonb_build_object(
      'status','CALCULATED','amounts',jsonb_build_object(
        'netAmount',nets[i]::text,'taxAmount',(gross-nets[i])::text,'grossAmount',gross::text,'currency','TRY'
      )
    );
    result:=finance_api.commit_accrual_calculation(
      checker,command,context,rule,calculation,date '2026-11-10',repeat(i::text,64),repeat(chr(96+i),64),null
    );
    if result->>'outcome'<>'CREATED' or result->>'status'<>'POSTED' then
      raise exception 'accrual failed for family %: %',families[i],result;
    end if;
    replay:=finance_api.commit_accrual_calculation(
      checker,command,context,rule,calculation,date '2026-11-10',repeat(i::text,64),repeat(chr(96+i),64),null
    );
    if replay->>'outcome'<>'REPLAY' then raise exception 'idempotent replay failed for family %',families[i]; end if;
  end loop;

  insert into finance.rule_exceptions(contract_fee_rule_id,exception_code,scope_definition,condition_definition,override_definition,priority,effective_from,status,prepared_by,approved_by,approved_at_utc,created_by,correlation_id)
  values
    (rule_id,'AMBIGUOUS_A',jsonb_build_object('type','BRANCH','branchId',branch),'{"type":"DATE_RANGE"}'::jsonb,'{"type":"EXEMPT"}'::jsonb,900,date '2026-11-01','ACTIVE',maker,checker,now(),maker,corr),
    (rule_id,'AMBIGUOUS_B',jsonb_build_object('type','BRANCH','branchId',branch),'{"type":"DATE_RANGE"}'::jsonb,'{"type":"EXEMPT"}'::jsonb,900,date '2026-11-01','ACTIVE',maker,checker,now(),maker,corr);
  begin
    perform finance_private.resolve_rule_exception(rule_id,hq,dealer,account,branch,contract_id,contract_version,date '2026-11-01',date '2026-11-03','{}'::jsonb);
    raise exception 'ambiguous exception precedence was accepted';
  exception when cardinality_violation then null;end;
  update finance.rule_exceptions set status='DISABLED' where contract_fee_rule_id=rule_id and exception_code in('AMBIGUOUS_A','AMBIGUOUS_B');
  insert into finance.rule_exceptions(contract_fee_rule_id,exception_code,scope_definition,condition_definition,override_definition,priority,effective_from,status,prepared_by,approved_by,approved_at_utc,created_by,correlation_id)
  values(rule_id,'UNSUPPORTED_VOLUME',jsonb_build_object('type','BRANCH','branchId',branch),'{"type":"USAGE_VOLUME"}'::jsonb,'{"type":"EXEMPT"}'::jsonb,901,date '2026-11-01','ACTIVE',maker,checker,now(),maker,corr);
  begin
    perform finance_private.resolve_rule_exception(rule_id,hq,dealer,account,branch,contract_id,contract_version,date '2026-11-01',date '2026-11-03','{}'::jsonb);
    raise exception 'unsupported exception condition was accepted';
  exception when feature_not_supported then null;end;
  update finance.rule_exceptions set status='DISABLED' where contract_fee_rule_id=rule_id and exception_code='UNSUPPORTED_VOLUME';

  select count(*),sum(gross_amount) into accrual_count,gross
    from finance.accruals where legal_entity_id=hq;
  select count(*) into open_count from finance.open_items where legal_entity_id=hq and item_type='DEBIT' and status='OPEN';
  select count(*) into journal_count from finance.journal_entries where legal_entity_id=hq and entry_type='ACCRUAL';
  if accrual_count<>4 or open_count<>4 or journal_count<>4 or gross<>expected_total then
    raise exception 'family totals mismatch accruals %, open %, journals %, gross %',accrual_count,open_count,journal_count,gross;
  end if;
  if exists(
    select 1 from finance.journal_entries je where je.legal_entity_id=hq and
      (select sum(debit_amount) from finance.journal_lines where journal_entry_id=je.id)<>
      (select sum(credit_amount) from finance.journal_lines where journal_entry_id=je.id)
  ) then raise exception 'a charge-family journal is not balanced'; end if;
  if (select count(*) from finance.calculation_runs where legal_entity_id=hq)<>4 then
    raise exception 'replay created duplicate calculation runs';
  end if;
  insert into finance.source_events(
    legal_entity_id,dealer_legal_entity_id,branch_id,source_system,event_id,event_type,schema_version,business_date,
    occurred_at_utc,received_at_utc,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,created_by,correlation_id
  ) values(hq,dealer,branch,'SYNTHETIC_ERP',gen_random_uuid(),'query.completed',1,date '2026-11-04',now(),now(),
    'service-usage','free-query-1',1,jsonb_build_object('serviceCode','TRAMER_QUERY','providerCode','PROVIDER-A','externalReference','QUERY-FREE-001','providerCostAmount','50.00000000','currency','TRY','freeEntitlementApplied',true,'technicalRepeat',false),repeat('5',64),'PROCESSED',maker,corr);
  insert into finance.source_events(legal_entity_id,dealer_legal_entity_id,branch_id,source_system,event_id,event_type,schema_version,business_date,occurred_at_utc,received_at_utc,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,created_by,correlation_id)
  values(hq,dealer,branch,'SYNTHETIC_ERP',gen_random_uuid(),'query.completed',1,date '2026-11-04',now(),now(),'service-usage','technical-repeat-query-1',1,jsonb_build_object('serviceCode','TRAMER_QUERY','providerCode','PROVIDER-A','externalReference','QUERY-REPEAT-001','providerCostAmount','0.00000000','currency','TRY','freeEntitlementApplied',false,'technicalRepeat',true),repeat('6',64),'PROCESSED',maker,corr),
        (hq,dealer,branch,'SYNTHETIC_ERP',gen_random_uuid(),'external-service.delivered',1,date '2026-11-04',now(),now(),'service-usage','failed-service-1',1,jsonb_build_object('serviceCode','VALUATION_SERVICE','providerCode','PROVIDER-B','externalReference','SERVICE-FAILED-001','providerCostAmount','0.00000000','currency','TRY','freeEntitlementApplied',false,'technicalRepeat',false),repeat('7',64),'REJECTED',maker,corr);
  select id into usage_exception_source from finance.source_events where legal_entity_id=hq and aggregate_id='technical-repeat-query-1';
  select cfr.id into usage_exception_rule from finance.contract_fee_rules cfr join finance.fee_definitions fd on fd.id=cfr.fee_definition_id where cfr.contract_version_id=contract_version and fd.fee_family='QUERY';
  result:=finance_api.commit_service_usage_exception_request(maker,hq,dealer,account,branch,usage_exception_source,usage_exception_rule,'{"type":"EXEMPT"}'::jsonb,'TECHNICAL_REPEAT',repeat('8',64),repeat('9',64),'service-exception-request-001',repeat('a',64),corr);
  if result->>'outcome'<>'SUBMITTED'or result->>'status'<>'PENDING_APPROVAL'then raise exception 'service usage exception request mismatch: %',result;end if;
  usage_exception_request:=(result->>'approvalRequestId')::uuid;
  result:=finance_api.commit_service_usage_exception_approval(checker,hq,dealer,account,branch,usage_exception_request,1,'EVIDENCE_APPROVED',repeat('b',64),'service-exception-approve-001',repeat('c',64),corr);
  if result->>'outcome'<>'APPROVED'or result->>'status'<>'ACTIVE'or not exists(select 1 from finance.rule_exceptions where id=(result->>'exceptionId')::uuid and status='ACTIVE'and prepared_by=maker and approved_by=checker)then raise exception 'service usage exception approval mismatch: %',result;end if;
  select finance_private.approval_work_item_projection(a) into usage_page from finance.approval_requests a where a.id=usage_exception_request;
  if usage_page#>>'{action,screenId}'<>'SCR-09'or usage_page#>>'{action,operationId}'<>'approveServiceUsageException'or usage_page->>'sourceEventId'<>usage_exception_source::text or usage_page->>'feeRuleId'<>usage_exception_rule::text then raise exception 'service usage approval routing mismatch: %',usage_page;end if;
  if finance_private.resolve_rule_exception(usage_exception_rule,hq,dealer,account,branch,contract_id,contract_version,date '2026-11-01',date '2026-11-04',jsonb_build_object('externalReference','QUERY-REPEAT-001'))#>>'{override,type}'<>'EXEMPT'then raise exception 'approved service usage exception did not resolve';end if;
  usage_page:=finance_api.list_service_usages(hq,account,branch,date '2026-11-01',date '2026-11-30','QUERY','NOT_CHARGED',null,50);
  if jsonb_array_length(usage_page->'items')<>2
     or not exists(select 1 from jsonb_array_elements(usage_page->'items') x where x->>'externalReference'='QUERY-FREE-001' and (x->>'freeEntitlementApplied')::boolean and x->>'dealerPriceAmount' is null and x->>'accrualId' is null)
     or not exists(select 1 from jsonb_array_elements(usage_page->'items') x where x->>'externalReference'='QUERY-REPEAT-001' and (x->>'technicalRepeat')::boolean and x->>'dealerPriceAmount' is null and x->>'accrualId' is null) then
    raise exception 'free service usage projection mismatch: %',usage_page;
  end if;
  usage_page:=finance_api.list_service_usages(hq,account,branch,null,null,'QUERY','CHARGED',null,50);
  if jsonb_array_length(usage_page->'items')<>1
     or usage_page#>>'{items,0,externalReference}'<>'QUERY-001'
     or usage_page#>>'{items,0,providerCostAmount}'<>'50.00000000'
     or usage_page#>>'{items,0,dealerPriceAmount}'<>'120.00000000'
     or usage_page#>>'{items,0,marginAmount}'<>'70.00000000'
     or usage_page#>>'{items,0,accrualId}' is null then
    raise exception 'charged service usage projection mismatch: %',usage_page;
  end if;
  usage_page:=finance_api.get_service_usage_detail(hq,account,branch,(usage_page#>>'{items,0,sourceEventId}')::uuid);
  if usage_page->>'externalReference'<>'QUERY-001'
     or usage_page#>>'{charge,status}'<>'CHARGED'
     or usage_page#>>'{charge,dealerPriceAmount}'<>'120.00000000'
     or usage_page->>'sourcePayloadHash'<>repeat('2',64)
     or (usage_page->>'rawPayloadExposed')::boolean then
    raise exception 'service usage detail projection mismatch: %',usage_page;
  end if;
  usage_page:=finance_api.export_service_usages(hq,account,branch,date '2026-11-01',date '2026-11-30','QUERY','CHARGED',10000);
  if usage_page->>'documentType'<>'OTOTR_FINANCE_SERVICE_USAGE_EXPORT'
     or (usage_page->>'rowCount')::integer<>1
     or usage_page#>>'{items,0,externalReference}'<>'QUERY-001'
     or usage_page#>>'{items,0,sourcePayloadHash}'<>repeat('2',64)
     or (usage_page->>'rawPayloadExposed')::boolean then
    raise exception 'service usage export projection mismatch: %',usage_page;
  end if;
  usage_page:=finance_api.list_service_usages(hq,account,branch,null,null,'EXTERNAL_SERVICE','CHARGED',null,50);
  if jsonb_array_length(usage_page->'items')<>1 or usage_page#>>'{items,0,externalReference}'<>'SERVICE-001' or usage_page#>>'{items,0,providerCostAmount}'<>'200.00000000' or usage_page#>>'{items,0,dealerPriceAmount}'<>'300.00000000' or usage_page#>>'{items,0,marginAmount}'<>'100.00000000' then raise exception 'external service margin mismatch: %',usage_page;end if;
  usage_page:=finance_api.list_service_usages(hq,account,branch,null,null,'EXTERNAL_SERVICE','FAILED',null,50);
  if jsonb_array_length(usage_page->'items')<>1 or usage_page#>>'{items,0,externalReference}'<>'SERVICE-FAILED-001' or usage_page#>>'{items,0,accrualId}' is not null then raise exception 'failed external service mismatch: %',usage_page;end if;
  contract_projection:=finance_api.get_current_franchise_contract(hq,account,branch,date '2026-11-03');
  if contract_projection->>'contractId'<>contract_id::text
     or contract_projection#>>'{activeVersion,versionId}'<>contract_version::text
     or contract_projection#>>'{activeVersion,currencyCode}'<>'TRY' then
    raise exception 'current contract projection mismatch: %',contract_projection;
  end if;
  rule_page:=finance_api.list_contract_fee_rules(hq,account,branch,contract_version,'ACTIVE',null,2);
  if (rule_page->>'hasMore')::boolean is distinct from true or jsonb_array_length(rule_page->'items')<>2
     or rule_page#>>'{items,0,configurationStatus}'<>'CONFIGURED'
     or rule_page#>>'{items,0,calculation,method}'<>'FIXED' then
    raise exception 'fee rule first page mismatch: %',rule_page;
  end if;
  rule_cursor:=(rule_page->>'nextCursor')::uuid;
  rule_page:=finance_api.list_contract_fee_rules(hq,account,branch,contract_version,'ACTIVE',rule_cursor,2);
  if (rule_page->>'hasMore')::boolean is distinct from false or jsonb_array_length(rule_page->'items')<>2 then
    raise exception 'fee rule second page mismatch: %',rule_page;
  end if;
  select id into test_accrual from finance.accruals where legal_entity_id=hq order by id limit 1;
  result:=finance_api.get_accrual_detail(hq,account,branch,test_accrual);
  if result->>'accrualId'<>test_accrual::text
     or jsonb_array_length(result#>'{journalEntry,lines}')<2
     or result#>>'{calculation,status}'<>'CALCULATED'
     or result->>'openItemId' is null then
    raise exception 'accrual read projection mismatch: %',result;
  end if;

  raise notice 'CHARGE FAMILY ACCRUAL E2E PASSED: four fee families plus current-contract and fee-rule pagination verified';
end
$test$;

rollback;
