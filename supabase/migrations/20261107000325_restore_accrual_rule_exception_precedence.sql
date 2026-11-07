-- Restore deterministic exception precedence after the accrual provenance projection
-- replaced the resolver-backed implementation. Preserve the newer rule audit fields.

create or replace function finance_api.load_accrual_calculation_context(
  p_legal_entity_id uuid, p_dealer_legal_entity_id uuid, p_dealer_account_id uuid,
  p_branch_id uuid, p_source_event_id uuid, p_fee_definition_id uuid, p_run_type text
) returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  v record;
  v_exception jsonb;
  v_method text;
  v_parameters jsonb;
  v_min numeric;
  v_max numeric;
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
         cfr.trigger_conditions,cfr.cancellation_policy,cfr.created_by,cfr.created_at_utc,
         cfr.approved_by,cfr.approved_at_utc,
         (select dl.document_reference_id from finance.document_links dl
          join finance.document_references dr on dr.id=dl.document_reference_id
          where dl.legal_entity_id=p_legal_entity_id and dr.legal_entity_id=p_legal_entity_id
            and dl.subject_type='CONTRACT_FEE_RULE' and dl.subject_id=cfr.id
            and dl.purpose_code='EVIDENCE_V1' and dr.status='ACTIVE'
          order by dl.created_at_utc desc,dl.id desc limit 1) evidence_document_id,
         fc.id contract_id,cv.id contract_version_id,cv.effective_from contract_valid_from,cv.effective_to contract_valid_to,
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
  if v.candidate_count <> 1 then raise exception using errcode='21000',message='ambiguous accrual calculation context'; end if;

  v_exception:=finance_private.resolve_rule_exception(
    v.fee_rule_id,p_legal_entity_id,p_dealer_legal_entity_id,p_dealer_account_id,p_branch_id,
    v.contract_id,v.contract_version_id,v.contract_valid_from,v.business_date,v.payload
  );
  v_method:=v.calculation_method;
  v_parameters:=v.calculation_parameters;
  v_min:=v.minimum_amount;
  v_max:=v.maximum_amount;
  if v_exception is not null then
    case v_exception#>>'{override,type}'
      when 'RATE_OVERRIDE' then
        if coalesce(v_exception#>>'{override,rate}','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then raise exception using errcode='22023',message='invalid rate override'; end if;
        v_method:='PERCENTAGE'; v_parameters:=pg_catalog.jsonb_build_object('rate',v_exception#>>'{override,rate}');
      when 'FIXED_AMOUNT_OVERRIDE' then
        if coalesce(v_exception#>>'{override,amount}','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then raise exception using errcode='22023',message='invalid fixed amount override'; end if;
        v_method:='FIXED'; v_parameters:=pg_catalog.jsonb_build_object('amount',v_exception#>>'{override,amount}');
      when 'EXEMPT' then v_method:='FIXED'; v_parameters:='{"amount":"0"}'::jsonb; v_min:=0; v_max:=0;
      when 'LIMIT_OVERRIDE' then
        v_min:=case when v_exception#>'{override,minimumAmount}' is null then v_min else (v_exception#>>'{override,minimumAmount}')::numeric end;
        v_max:=case when v_exception#>'{override,maximumAmount}' is null then v_max else (v_exception#>>'{override,maximumAmount}')::numeric end;
        if v_min is not null and v_max is not null and v_min>v_max then raise exception using errcode='22023',message='invalid limit override'; end if;
    end case;
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
      'trigger',pg_catalog.jsonb_build_object('eventType',v.trigger_event_type,'conditions',coalesce(v.trigger_conditions,'[]'::jsonb)),
      'basis',v.basis_definition,
      'calculation',pg_catalog.jsonb_build_object('method',v_method,'parameters',v_parameters,'minimumAmount',v_min::text,'maximumAmount',v_max::text,'currency',v.currency_code,'decimalScale',v.decimal_scale,'roundingMode',v.rounding_mode),
      'tax',pg_catalog.jsonb_build_object('priceIncludesTax',v.price_includes_tax,'rateVersionId',v.tax_version_id,'taxCodeVersionId',v.tax_version_id),
      'due',v.due_rule,'cancellationPolicy',v.cancellation_policy,
      'createdBy',pg_catalog.jsonb_build_object('actorType','USER','actorId',v.created_by),'createdAtUtc',v.created_at_utc,
      'approvedBy',pg_catalog.jsonb_build_object('actorType','USER','actorId',v.approved_by),'approvedAtUtc',v.approved_at_utc,
      'evidenceDocumentId',v.evidence_document_id,
      'validity',pg_catalog.jsonb_build_object('contractVersionId',v.contract_version_id,'validFrom',v.contract_valid_from,'validTo',v.contract_valid_to),
      'appliedException',case when v_exception is null then null else v_exception-'override' end
    ))
  );
end $$;

revoke all on function finance_api.load_accrual_calculation_context(uuid,uuid,uuid,uuid,uuid,uuid,text) from public,anon;
grant execute on function finance_api.load_accrual_calculation_context(uuid,uuid,uuid,uuid,uuid,uuid,text) to authenticated;
