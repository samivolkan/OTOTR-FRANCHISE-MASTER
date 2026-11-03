-- Safe active-versus-pending contract rule comparison for maker-checker review.
-- Raw calculation, condition and exception definitions remain server-side.

create or replace function finance_api.get_contract_version_comparison(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_active_version_id uuid,p_candidate_version_id uuid
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api as $$
declare v_contract uuid;v_active_no integer;v_candidate_no integer;v_items jsonb;v_added integer;v_removed integer;v_changed integer;v_unchanged integer;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getCurrentFranchiseContract') then raise exception using errcode='42501',message='finance scope denied';end if;
  select a.contract_id,a.version_no,c.version_no into v_contract,v_active_no,v_candidate_no
    from finance.contract_versions a join finance.contract_versions c on c.contract_id=a.contract_id
    join finance.franchise_contracts fc on fc.id=a.contract_id
    join finance.dealer_accounts da on da.legal_entity_id=fc.legal_entity_id and da.dealer_legal_entity_id=fc.dealer_legal_entity_id
    join finance.branches b on b.legal_entity_id=fc.legal_entity_id and b.dealer_legal_entity_id=fc.dealer_legal_entity_id
   where a.id=p_active_version_id and c.id=p_candidate_version_id and a.status='ACTIVE' and c.status in('DRAFT','PENDING_APPROVAL','APPROVED')
     and fc.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and b.id=p_branch_id;
  if not found then return null;end if;
  with active_rules as (select * from finance.contract_fee_rules where contract_version_id=p_active_version_id),candidate_rules as (select * from finance.contract_fee_rules where contract_version_id=p_candidate_version_id),paired as (
    select coalesce(a.fee_definition_id,c.fee_definition_id) fee_definition_id,
      a.id active_rule_id,c.id candidate_rule_id,coalesce(c.rule_code,a.rule_code) rule_code,
      fd.code fee_code,fd.name fee_name,fd.fee_family,
      case when a.id is null then 'ADDED' when c.id is null then 'REMOVED'
        when pg_catalog.jsonb_build_array(a.rule_code,a.trigger_event_type,a.configuration_status,a.basis_definition,a.calculation_method,a.calculation_parameters,a.tax_code_version_id,a.due_rule,a.cancellation_policy,a.price_includes_tax,a.minimum_amount,a.maximum_amount,a.currency_code,a.decimal_scale,a.rounding_mode,a.priority)
          is distinct from pg_catalog.jsonb_build_array(c.rule_code,c.trigger_event_type,c.configuration_status,c.basis_definition,c.calculation_method,c.calculation_parameters,c.tax_code_version_id,c.due_rule,c.cancellation_policy,c.price_includes_tax,c.minimum_amount,c.maximum_amount,c.currency_code,c.decimal_scale,c.rounding_mode,c.priority) then 'CHANGED' else 'UNCHANGED' end change_type,
      a.calculation_method active_method,c.calculation_method candidate_method,a.price_includes_tax active_tax_included,c.price_includes_tax candidate_tax_included,
      a.currency_code active_currency,c.currency_code candidate_currency,a.status active_status,c.status candidate_status,
      (select pg_catalog.count(*) from finance.rule_exceptions e where e.contract_fee_rule_id=a.id and e.status not in('DISABLED','SUPERSEDED')) active_exception_count,
      (select pg_catalog.count(*) from finance.rule_exceptions e where e.contract_fee_rule_id=c.id and e.status not in('DISABLED','SUPERSEDED')) candidate_exception_count
    from active_rules a full join candidate_rules c on c.fee_definition_id=a.fee_definition_id
    join finance.fee_definitions fd on fd.id=coalesce(a.fee_definition_id,c.fee_definition_id)
  )
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('feeDefinitionId',fee_definition_id,'feeCode',fee_code,'feeName',fee_name,'feeFamily',fee_family,'ruleCode',rule_code,'changeType',change_type,'activeRuleId',active_rule_id,'candidateRuleId',candidate_rule_id,'activeMethod',active_method,'candidateMethod',candidate_method,'activePriceIncludesTax',active_tax_included,'candidatePriceIncludesTax',candidate_tax_included,'activeCurrency',active_currency,'candidateCurrency',candidate_currency,'activeStatus',active_status,'candidateStatus',candidate_status,'activeExceptionCount',active_exception_count,'candidateExceptionCount',candidate_exception_count) order by fee_family,fee_code,fee_definition_id),'[]'::jsonb),
    count(*) filter(where change_type='ADDED'),count(*) filter(where change_type='REMOVED'),count(*) filter(where change_type='CHANGED'),count(*) filter(where change_type='UNCHANGED')
    into v_items,v_added,v_removed,v_changed,v_unchanged from paired;
  return pg_catalog.jsonb_build_object('contractId',v_contract,'activeVersionId',p_active_version_id,'activeVersionNo',v_active_no,'candidateVersionId',p_candidate_version_id,'candidateVersionNo',v_candidate_no,'summary',pg_catalog.jsonb_build_object('added',v_added,'removed',v_removed,'changed',v_changed,'unchanged',v_unchanged,'requiresReview',(v_added+v_removed+v_changed)>0),'items',v_items,'rawDefinitionsExposed',false);
end$$;

revoke all on function finance_api.get_contract_version_comparison(uuid,uuid,uuid,uuid,uuid) from public,anon;
grant execute on function finance_api.get_contract_version_comparison(uuid,uuid,uuid,uuid,uuid) to authenticated;
