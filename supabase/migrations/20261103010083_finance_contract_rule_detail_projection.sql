-- OTOTR Finance internal review migration.
-- Dedicated branch-scoped rule detail projection; raw exception definitions stay private.

create or replace function finance_api.get_contract_fee_rule_projection(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_contract_version_id uuid,p_fee_rule_id uuid
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api as $$
declare r record;v_exceptions jsonb;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getContractFeeRule') then raise exception using errcode='42501',message='finance scope denied';end if;
  select cfr.*,fd.version_no fee_definition_version,fd.code fee_definition_code,fd.name fee_definition_name,fd.fee_family,
         cv.effective_from,cv.effective_to,fc.legal_entity_id,fc.dealer_legal_entity_id
    into r from finance.contract_fee_rules cfr
    join finance.fee_definitions fd on fd.id=cfr.fee_definition_id
    join finance.contract_versions cv on cv.id=cfr.contract_version_id
    join finance.franchise_contracts fc on fc.id=cv.contract_id
    join finance.dealer_accounts da on da.legal_entity_id=fc.legal_entity_id and da.dealer_legal_entity_id=fc.dealer_legal_entity_id
    join finance.branches b on b.legal_entity_id=fc.legal_entity_id and b.dealer_legal_entity_id=fc.dealer_legal_entity_id
   where cfr.id=p_fee_rule_id and cfr.contract_version_id=p_contract_version_id and fc.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and b.id=p_branch_id;
  if not found then return null;end if;
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
    'exceptionId',e.id,'exceptionCode',e.exception_code,
    'scopeType',case when e.scope_definition->>'type' in('BRANCH','DEALER','LEGAL_ENTITY','CONTRACT','GLOBAL') then e.scope_definition->>'type' when e.scope_definition ? 'type' then 'OTHER' else 'UNSPECIFIED' end,
    'conditionType',case when e.condition_definition->>'type' in('CONTRACT_AGE','DATE_RANGE','USAGE_VOLUME','SOURCE_ATTRIBUTE') then e.condition_definition->>'type' when e.condition_definition ? 'type' then 'OTHER' else 'UNSPECIFIED' end,
    'overrideType',case when e.override_definition->>'type' in('RATE_OVERRIDE','FIXED_AMOUNT_OVERRIDE','EXEMPT','LIMIT_OVERRIDE') then e.override_definition->>'type' when e.override_definition ? 'type' then 'OTHER' else 'UNSPECIFIED' end,
    'priority',e.priority,'effectiveFrom',e.effective_from,'effectiveTo',e.effective_to,'status',e.status,'version',e.version
  )) order by e.priority desc,e.exception_code,e.id),'[]'::jsonb) into v_exceptions from finance.rule_exceptions e where e.contract_fee_rule_id=r.id;
  return pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
    'feeRuleId',r.id,'feeDefinitionId',r.fee_definition_id,'feeDefinitionCode',r.fee_definition_code,'feeDefinitionVersion',r.fee_definition_version,
    'contractVersionId',r.contract_version_id,'version',r.version,'code',r.rule_code,'name',r.fee_definition_name,'category',r.fee_family,
    'status',r.status,'configurationStatus',r.configuration_status,'priority',r.priority,
    'validity',pg_catalog.jsonb_build_object('validFrom',r.effective_from,'validTo',r.effective_to),
    'trigger',case when r.trigger_event_type is null then null else pg_catalog.jsonb_build_object('eventType',r.trigger_event_type,'conditions',r.trigger_conditions) end,
    'basis',r.basis_definition,
    'calculation',case when r.calculation_method is null then null else coalesce(r.calculation_parameters,'{}'::jsonb)||pg_catalog.jsonb_build_object('method',r.calculation_method,'currency',r.currency_code,'decimalScale',r.decimal_scale,'roundingMode',r.rounding_mode,'minimumAmount',r.minimum_amount,'maximumAmount',r.maximum_amount) end,
    'tax',case when r.tax_code_version_id is null then null else pg_catalog.jsonb_build_object('taxCodeVersionId',r.tax_code_version_id,'priceIncludesTax',r.price_includes_tax) end,
    'due',r.due_rule,'cancellationPolicy',r.cancellation_policy,'exceptions',v_exceptions,'exceptionCount',pg_catalog.jsonb_array_length(v_exceptions),
    'approvedBy',r.approved_by,'approvedAtUtc',r.approved_at_utc,'createdAtUtc',r.created_at_utc
  ));
end$$;

revoke all on function finance_api.get_contract_fee_rule_projection(uuid,uuid,uuid,uuid,uuid) from public,anon;
grant execute on function finance_api.get_contract_fee_rule_projection(uuid,uuid,uuid,uuid,uuid) to authenticated;
