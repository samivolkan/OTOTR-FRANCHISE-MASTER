-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-accrual-calculation-rpc.sql
-- Source SHA256: B278718FD0E3A131863CD7789096755C716D037D70AA406346E249F9975469B9
-- Local replay required before any staging promotion.
-- OTOTR FINANCE ACCRUAL CALCULATION RPC CANDIDATE
-- The calculation engine and approved basis resolver run server-side; ERP/browser supplied totals are never authoritative.
-- Real migration must explicitly provision pgcrypto in the reviewed extensions schema.

create or replace function finance_private.current_actor_can_calculate_accrual(
  p_actor_id uuid, p_legal_entity_id uuid, p_dealer_legal_entity_id uuid, p_branch_id uuid
) returns boolean language sql stable security definer set search_path = ''
as $$ select false $$;
revoke all on function finance_private.current_actor_can_calculate_accrual(uuid,uuid,uuid,uuid) from public, anon, authenticated;

create or replace function finance_private.current_accrual_worker_is_trusted()
returns boolean language sql stable security definer set search_path = ''
as $$ select false $$;
revoke all on function finance_private.current_accrual_worker_is_trusted() from public, anon, authenticated;

create or replace function finance_api.authorize_accrual_calculation_scope(
  p_legal_entity_id uuid, p_dealer_legal_entity_id uuid, p_branch_id uuid, p_permission text
) returns boolean language sql stable security definer set search_path = ''
as $$
  select p_permission = 'finance.accruals.calculate'
    and auth.uid() is not null
    and finance_private.current_actor_can_calculate_accrual(auth.uid(),p_legal_entity_id,p_dealer_legal_entity_id,p_branch_id)
    and exists (
      select 1 from finance.branches b
      where b.id=p_branch_id and b.legal_entity_id=p_legal_entity_id
        and b.dealer_legal_entity_id=p_dealer_legal_entity_id and b.status='ACTIVE'
    )
$$;

create or replace function finance_api.load_accrual_calculation_context(
  p_legal_entity_id uuid, p_dealer_legal_entity_id uuid, p_dealer_account_id uuid,
  p_branch_id uuid, p_source_event_id uuid, p_fee_definition_id uuid, p_run_type text
) returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare v record;
begin
  if p_run_type not in ('LIVE','SHADOW') then raise exception using errcode='22023',message='invalid calculation run type'; end if;
  if not finance_api.authorize_accrual_calculation_scope(p_legal_entity_id,p_dealer_legal_entity_id,p_branch_id,'finance.accruals.calculate') then
    raise exception using errcode='42501',message='finance scope denied';
  end if;
  select count(*) over () candidate_count,
         se.id source_event_id,se.status source_event_status,se.event_type,se.business_date,se.payload_hash,se.payload,
         fp.id finance_period_id,fp.status finance_period_status,
         cfr.id fee_rule_id,cfr.version rule_version,cfr.rule_code,cfr.priority,cfr.trigger_event_type,cfr.basis_definition,
         cfr.calculation_method,cfr.calculation_parameters,cfr.due_rule,cfr.currency_code,cfr.decimal_scale,cfr.rounding_mode,
         cfr.minimum_amount,cfr.maximum_amount,cfr.price_includes_tax,
         cv.id contract_version_id,cv.effective_from contract_valid_from,cv.effective_to contract_valid_to,
         fd.fee_family,tcv.id tax_version_id,tcv.rate tax_rate,tcv.status tax_status,
         am.id accounting_mapping_id,am.receivable_account_code,am.revenue_account_code,am.tax_account_code,am.reversal_account_code
    into v
    from finance.source_events se
    join finance.dealer_accounts da on da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id
      and da.dealer_legal_entity_id=p_dealer_legal_entity_id and da.status in ('SHADOW','ACTIVE')
    join finance.finance_periods fp on fp.legal_entity_id=p_legal_entity_id and fp.scope_type='BRANCH'
      and fp.dealer_account_id=p_dealer_account_id and fp.branch_id=p_branch_id and fp.status in ('OPEN','SOURCE_FROZEN')
      and se.business_date between fp.period_start and fp.period_end and fp.mode=p_run_type
    join finance.franchise_contracts fc on fc.legal_entity_id=p_legal_entity_id
      and fc.dealer_legal_entity_id=p_dealer_legal_entity_id and fc.status='ACTIVE'
    join finance.contract_versions cv on cv.contract_id=fc.id and cv.status='ACTIVE'
      and se.business_date>=cv.effective_from and (cv.effective_to is null or se.business_date<cv.effective_to)
    join finance.contract_fee_rules cfr on cfr.contract_version_id=cv.id
      and cfr.fee_definition_id=p_fee_definition_id and cfr.status='ACTIVE' and cfr.configuration_status='CONFIGURED'
      and cfr.trigger_event_type=se.event_type
    join finance.fee_definitions fd on fd.id=cfr.fee_definition_id and fd.status='PUBLISHED'
    join finance.tax_code_versions tcv on tcv.id=cfr.tax_code_version_id and tcv.status in ('APPROVED','ACTIVE')
      and se.business_date>=tcv.effective_from and (tcv.effective_to is null or se.business_date<tcv.effective_to)
    join finance.accounting_mappings am on am.legal_entity_id=p_legal_entity_id and am.fee_definition_id=p_fee_definition_id
      and am.status in ('APPROVED','ACTIVE') and se.business_date>=am.effective_from
      and (am.effective_to is null or se.business_date<am.effective_to)
   where se.id=p_source_event_id and se.legal_entity_id=p_legal_entity_id
     and se.dealer_legal_entity_id=p_dealer_legal_entity_id and se.branch_id=p_branch_id
     and se.status in ('RECEIVED','PROCESSING')
   order by cfr.priority desc,cfr.id,am.version_no desc limit 1;
  if not found then return null; end if;
  if v.candidate_count <> 1 then
    raise exception using errcode='21000',message='ambiguous accrual calculation context';
  end if;
  if exists (select 1 from finance.rule_exceptions re where re.contract_fee_rule_id=v.fee_rule_id
      and re.status='ACTIVE' and v.business_date>=re.effective_from and (re.effective_to is null or v.business_date<re.effective_to)) then
    raise exception using errcode='0A000',message='rule exception resolution policy pending';
  end if;
  return pg_catalog.jsonb_build_object(
    'scope',pg_catalog.jsonb_build_object('legalEntityId',p_legal_entity_id,'dealerLegalEntityId',p_dealer_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id),
    'sourceEvent',pg_catalog.jsonb_build_object('id',v.source_event_id,'branchId',p_branch_id,'status',v.source_event_status,'eventType',v.event_type,'businessDate',v.business_date,'payloadHash',v.payload_hash),
    'sourcePayload',v.payload,
    'financePeriod',pg_catalog.jsonb_build_object('id',v.finance_period_id,'status',v.finance_period_status),
    'taxVersion',pg_catalog.jsonb_build_object('id',v.tax_version_id,'rate',v.tax_rate::text,'status',v.tax_status),
    'accountingMapping',pg_catalog.jsonb_build_object('id',v.accounting_mapping_id,'receivableAccountCode',v.receivable_account_code,'revenueAccountCode',v.revenue_account_code,'taxAccountCode',v.tax_account_code,'reversalAccountCode',v.reversal_account_code),
    'basisDefinition',v.basis_definition,
    'rules',pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object(
      'feeRuleId',v.fee_rule_id,'feeDefinitionId',p_fee_definition_id,'version',v.rule_version,'code',v.rule_code,'priority',v.priority,
      'status','ACTIVE','configurationStatus','CONFIGURED','category',pg_catalog.lower(v.fee_family),
      'scope',pg_catalog.jsonb_build_object('headquartersLegalEntityId',p_legal_entity_id,'dealerLegalEntityId',p_dealer_legal_entity_id,'branchIds',pg_catalog.jsonb_build_array(),'packageIds',pg_catalog.jsonb_build_array(),'serviceIds',pg_catalog.jsonb_build_array()),
      'trigger',pg_catalog.jsonb_build_object('eventType',v.trigger_event_type,'conditions',pg_catalog.jsonb_build_array()),
      'basis',v.basis_definition,
      'calculation',pg_catalog.jsonb_build_object('method',v.calculation_method,'parameters',v.calculation_parameters,'minimumAmount',v.minimum_amount::text,'maximumAmount',v.maximum_amount::text,'currency',v.currency_code,'decimalScale',v.decimal_scale,'roundingMode',v.rounding_mode),
      'tax',pg_catalog.jsonb_build_object('priceIncludesTax',v.price_includes_tax,'rateVersionId',v.tax_version_id),
      'due',v.due_rule,'validity',pg_catalog.jsonb_build_object('contractVersionId',v.contract_version_id,'validFrom',v.contract_valid_from,'validTo',v.contract_valid_to)
    ))
  );
end $$;

create or replace function finance_api.find_accrual_calculation_intent(
  p_source_event_id uuid,p_contract_fee_rule_id uuid,p_fee_definition_id uuid,p_run_type text
) returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare v record;
begin
  select cr.id,cr.input_hash,cr.result_hash,cr.status,se.legal_entity_id,se.dealer_legal_entity_id,se.branch_id into v
  from finance.calculation_runs cr join finance.source_events se on se.id=cr.source_event_id
  where cr.source_event_id=p_source_event_id and cr.contract_fee_rule_id=p_contract_fee_rule_id
    and cr.fee_definition_id=p_fee_definition_id and cr.run_type=p_run_type
    and cr.status in ('STARTED','CALCULATED','POSTED') order by cr.created_at_utc desc limit 1;
  if not found then return null; end if;
  if not finance_api.authorize_accrual_calculation_scope(v.legal_entity_id,v.dealer_legal_entity_id,v.branch_id,'finance.accruals.calculate') then
    raise exception using errcode='42501',message='finance scope denied';
  end if;
  return pg_catalog.jsonb_build_object('calculationRunId',v.id,'inputHash',v.input_hash,'resultHash',v.result_hash,'status',v.status);
end $$;

create or replace function finance_api.commit_accrual_calculation(
  p_actor_id uuid,p_command jsonb,p_context jsonb,p_rule jsonb,p_calculation jsonb,p_due_date date,
  p_input_hash text,p_result_hash text,p_intent jsonb
) returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_hq uuid:=(p_command->>'legalEntityId')::uuid; v_dealer uuid:=(p_command->>'dealerLegalEntityId')::uuid;
  v_account uuid:=(p_command->>'dealerAccountId')::uuid; v_branch uuid:=(p_command->>'branchId')::uuid;
  v_source uuid:=(p_command->>'sourceEventId')::uuid; v_fee uuid:=(p_command->>'feeDefinitionId')::uuid;
  v_rule uuid:=(p_rule->>'feeRuleId')::uuid; v_run_type text:=p_command->>'runType'; v_corr uuid:=(p_command->>'correlationId')::uuid;
  v_idem text:=p_command->>'idempotencyKey'; v_net numeric(24,8);v_tax numeric(24,8);v_gross numeric(24,8);v_currency text;
  v record;v_existing record;v_run uuid;v_journal uuid;v_accrual uuid;v_audit_hash text;v_previous_hash text;v_payload_hash text;
begin
  if not finance_private.current_accrual_worker_is_trusted() then raise exception using errcode='42501',message='accrual worker denied'; end if;
  if p_actor_id is null or v_corr is null or coalesce(v_idem,'')='' or coalesce(p_input_hash,'')='' or coalesce(p_result_hash,'')='' or v_run_type not in ('LIVE','SHADOW') then
    raise exception using errcode='22023',message='required calculation fields missing';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_source::text||':'||v_rule::text||':'||v_run_type,0));
  select cr.id,cr.input_hash,cr.result_hash,cr.status into v_existing from finance.calculation_runs cr
   where cr.source_event_id=v_source and cr.contract_fee_rule_id=v_rule and cr.fee_definition_id=v_fee and cr.run_type=v_run_type
     and cr.status in ('STARTED','CALCULATED','POSTED') order by cr.created_at_utc desc limit 1;
  if found then
    if v_existing.input_hash=p_input_hash and v_existing.result_hash=p_result_hash then
      return pg_catalog.jsonb_build_object('outcome','REPLAY','calculationRunId',v_existing.id,'status',v_existing.status,'inputHash',v_existing.input_hash,'resultHash',v_existing.result_hash);
    end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','calculationRunId',v_existing.id);
  end if;
  select se.business_date,se.status source_status,fp.id period_id,cfr.contract_version_id,cfr.currency_code,
         am.receivable_account_code,am.revenue_account_code,am.tax_account_code
    into v from finance.source_events se
    join finance.finance_periods fp on fp.id=(p_context#>>'{financePeriod,id}')::uuid and fp.legal_entity_id=v_hq
      and fp.scope_type='BRANCH' and fp.dealer_account_id=v_account and fp.branch_id=v_branch and fp.status in ('OPEN','SOURCE_FROZEN')
      and se.business_date between fp.period_start and fp.period_end and fp.mode=v_run_type
    join finance.contract_fee_rules cfr on cfr.id=v_rule and cfr.fee_definition_id=v_fee and cfr.status='ACTIVE' and cfr.configuration_status='CONFIGURED'
    join finance.accounting_mappings am on am.id=(p_context#>>'{accountingMapping,id}')::uuid and am.legal_entity_id=v_hq
      and am.fee_definition_id=v_fee and am.status in ('APPROVED','ACTIVE')
    join finance.dealer_accounts da on da.id=v_account and da.legal_entity_id=v_hq and da.dealer_legal_entity_id=v_dealer and da.currency_code=cfr.currency_code
   where se.id=v_source and se.legal_entity_id=v_hq and se.dealer_legal_entity_id=v_dealer and se.branch_id=v_branch and se.status in ('RECEIVED','PROCESSING')
   for update of se,fp;
  if not found then raise exception using errcode='23514',message='calculation context changed or is no longer active'; end if;
  insert into finance.calculation_runs(legal_entity_id,source_event_id,contract_fee_rule_id,fee_definition_id,finance_period_id,branch_id,run_type,status,business_date,input_hash,result_hash,created_by,correlation_id)
  values(v_hq,v_source,v_rule,v_fee,v.period_id,v_branch,v_run_type,case when v_run_type='LIVE' then 'POSTED' else 'CALCULATED' end,v.business_date,p_input_hash,p_result_hash,p_actor_id,v_corr) returning id into v_run;
  insert into finance.calculation_snapshots(calculation_run_id,contract_version_id,rule_version_snapshot,tax_version_snapshot,input_snapshot,result_snapshot,snapshot_hash,created_by,correlation_id)
  values(v_run,v.contract_version_id,p_rule,p_context->'taxVersion',p_context,p_calculation,p_result_hash,p_actor_id,v_corr);
  if v_run_type='LIVE' then
    if p_calculation->>'status'<>'CALCULATED' then raise exception using errcode='23514',message='live result must be calculated'; end if;
    v_net:=(p_calculation#>>'{amounts,netAmount}')::numeric(24,8);v_tax:=(p_calculation#>>'{amounts,taxAmount}')::numeric(24,8);v_gross:=(p_calculation#>>'{amounts,grossAmount}')::numeric(24,8);v_currency:=p_calculation#>>'{amounts,currency}';
    if v_net<0 or v_tax<0 or v_gross<=0 or v_gross<>v_net+v_tax or v_currency<>v.currency_code then raise exception using errcode='23514',message='invalid calculated money'; end if;
    insert into finance.journal_entries(legal_entity_id,finance_period_id,idempotency_key,intent_hash,entry_type,business_date,posting_date,status,posted_at_utc,posted_by,created_by,correlation_id)
    values(v_hq,v.period_id,v_idem,p_result_hash,'ACCRUAL',v.business_date,v.business_date,'POSTED',pg_catalog.now(),p_actor_id,p_actor_id,v_corr) returning id into v_journal;
    insert into finance.journal_lines(journal_entry_id,line_no,dealer_account_id,account_code,branch_id,currency_code,debit_amount,credit_amount,dimensions,created_by,correlation_id)
    values(v_journal,1,v_account,v.receivable_account_code,v_branch,v_currency,v_gross,0,pg_catalog.jsonb_build_object('feeDefinitionId',v_fee),p_actor_id,v_corr),
          (v_journal,2,null,v.revenue_account_code,v_branch,v_currency,0,v_net,pg_catalog.jsonb_build_object('feeDefinitionId',v_fee),p_actor_id,v_corr);
    if v_tax>0 then insert into finance.journal_lines(journal_entry_id,line_no,dealer_account_id,account_code,branch_id,currency_code,debit_amount,credit_amount,dimensions,created_by,correlation_id)
      values(v_journal,3,null,v.tax_account_code,v_branch,v_currency,0,v_tax,pg_catalog.jsonb_build_object('feeDefinitionId',v_fee),p_actor_id,v_corr); end if;
    if (select coalesce(sum(debit_amount),0)<>coalesce(sum(credit_amount),0) from finance.journal_lines where journal_entry_id=v_journal) then raise exception using errcode='23514',message='journal is not balanced'; end if;
    insert into finance.accruals(legal_entity_id,calculation_run_id,dealer_account_id,branch_id,journal_entry_id,sequence_no,fee_definition_id,currency_code,net_amount,tax_amount,gross_amount,status,created_by,correlation_id)
    values(v_hq,v_run,v_account,v_branch,v_journal,1,v_fee,v_currency,v_net,v_tax,v_gross,'POSTED',p_actor_id,v_corr) returning id into v_accrual;
    insert into finance.open_items(legal_entity_id,accrual_id,dealer_account_id,branch_id,due_date,currency_code,item_type,original_amount,allocated_amount,open_amount,status,created_by,correlation_id)
    values(v_hq,v_accrual,v_account,v_branch,p_due_date,v_currency,'DEBIT',v_gross,0,v_gross,'OPEN',p_actor_id,v_corr);
    update finance.source_events set status='PROCESSING',version=version+1,correlation_id=v_corr where id=v_source and status='RECEIVED';
    v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_calculation::text,'UTF8'),'sha256'),'hex');
    insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)
    values(v_hq,'finance.accrual','ACCRUAL_POSTED','accrual',v_accrual,1,pg_catalog.jsonb_build_object('accrualId',v_accrual,'branchId',v_branch,'calculationRunId',v_run),v_payload_hash,'PENDING',v_corr);
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||v_hq::text,0));
    select ae.integrity_hash into v_previous_hash from finance.audit_events ae where ae.legal_entity_id=v_hq order by ae.created_at_utc desc,ae.id desc limit 1;
    v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_hash,'GENESIS')||':'||v_run::text||':ACCRUAL_POSTED:'||p_result_hash||':'||v_corr::text,'UTF8'),'sha256'),'hex');
    insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)
    values(v_hq,p_actor_id,'USER','ACCRUAL_POSTED','calculation_run',v_run,'ALLOW',p_result_hash,v_previous_hash,v_audit_hash,pg_catalog.jsonb_build_object('branchId',v_branch,'runType',v_run_type),v_corr);
  end if;
  return pg_catalog.jsonb_build_object('outcome','CREATED','calculationRunId',v_run,'status',case when v_run_type='LIVE' then 'POSTED' else 'CALCULATED' end,'inputHash',p_input_hash,'resultHash',p_result_hash);
end $$;

revoke all on function finance_api.authorize_accrual_calculation_scope(uuid,uuid,uuid,text) from public, anon;
revoke all on function finance_api.load_accrual_calculation_context(uuid,uuid,uuid,uuid,uuid,uuid,text) from public, anon;
revoke all on function finance_api.find_accrual_calculation_intent(uuid,uuid,uuid,text) from public, anon;
grant execute on function finance_api.authorize_accrual_calculation_scope(uuid,uuid,uuid,text) to authenticated;
grant execute on function finance_api.load_accrual_calculation_context(uuid,uuid,uuid,uuid,uuid,uuid,text) to authenticated;
grant execute on function finance_api.find_accrual_calculation_intent(uuid,uuid,uuid,text) to authenticated;
revoke all on function finance_api.commit_accrual_calculation(uuid,jsonb,jsonb,jsonb,jsonb,date,text,text,jsonb) from public, anon, authenticated;
-- Execute grant for commit is intentionally absent until a reviewed server-only database role is provisioned.
