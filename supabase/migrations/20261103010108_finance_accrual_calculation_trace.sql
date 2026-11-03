-- Safe calculation trace for ERP users. Raw source payload and accounting
-- mappings remain private; only reproducible rule, basis and amount metadata is projected.

create or replace function finance_api.get_accrual_calculation_trace(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_accrual_id uuid
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api as $$
declare v record;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getAccrualDetail') then
    raise exception using errcode='42501',message='finance scope denied';
  end if;
  select a.id,fd.code fee_code,fd.name fee_name,fd.fee_family,
         cr.id calculation_run_id,cr.run_type,cr.status calculation_status,
         cr.business_date,cr.input_hash,cr.result_hash,cr.finance_period_id,
         fp.status period_status,cs.snapshot_hash,cs.rule_version_snapshot,
         cs.tax_version_snapshot,cs.result_snapshot,cfr.basis_definition,
         cfr.calculation_method,cfr.calculation_parameters,cfr.minimum_amount,
         cfr.maximum_amount,cfr.price_includes_tax,cfr.rounding_mode,cfr.decimal_scale,
         oi.open_amount dispute_open_amount,oi.currency_code dispute_currency,oi.status open_item_status
    into v from finance.accruals a
    join finance.calculation_runs cr on cr.id=a.calculation_run_id
    join finance.calculation_snapshots cs on cs.calculation_run_id=cr.id
    join finance.contract_fee_rules cfr on cfr.id=cr.contract_fee_rule_id
    join finance.fee_definitions fd on fd.id=a.fee_definition_id
    join finance.finance_periods fp on fp.id=cr.finance_period_id
    left join finance.open_items oi on oi.accrual_id=a.id and oi.item_type in('DEBIT','CREDIT')
   where a.id=p_accrual_id and a.legal_entity_id=p_legal_entity_id
     and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id
     and cr.legal_entity_id=p_legal_entity_id and cr.branch_id=p_branch_id
     and fp.legal_entity_id=p_legal_entity_id and fp.dealer_account_id=p_dealer_account_id
     and fp.branch_id=p_branch_id;
  if not found then return null;end if;
  return jsonb_build_object(
    'fee',jsonb_build_object('code',v.fee_code,'name',v.fee_name,'family',v.fee_family),
    'basis',jsonb_build_object(
      'definition',coalesce(v.rule_version_snapshot->'basis',v.basis_definition,'{}'::jsonb),
      'amount',v.result_snapshot->>'basisAmount',
      'currency',v.result_snapshot#>>'{amounts,currency}'
    ),
    'calculation',jsonb_build_object(
      'method',coalesce(v.rule_version_snapshot#>>'{calculation,method}',v.calculation_method),
      'parameters',coalesce(v.rule_version_snapshot#>'{calculation,parameters}',v.calculation_parameters,'{}'::jsonb),
      'minimumAmount',coalesce(v.rule_version_snapshot#>>'{calculation,minimumAmount}',v.minimum_amount::text),
      'maximumAmount',coalesce(v.rule_version_snapshot#>>'{calculation,maximumAmount}',v.maximum_amount::text)
    ),
    'tax',jsonb_build_object(
      'rate',v.tax_version_snapshot->>'rate',
      'priceIncludesTax',coalesce((v.rule_version_snapshot#>>'{tax,priceIncludesTax}')::boolean,v.price_includes_tax,false),
      'versionId',coalesce(v.tax_version_snapshot->>'taxVersionId',v.tax_version_snapshot->>'id')
    ),
    'rounding',jsonb_build_object(
      'mode',coalesce(v.rule_version_snapshot#>>'{calculation,roundingMode}',v.rounding_mode),
      'decimalScale',coalesce((v.rule_version_snapshot#>>'{calculation,decimalScale}')::integer,v.decimal_scale),
      'currency',v.result_snapshot#>>'{amounts,currency}'
    ),
    'amounts',v.result_snapshot->'amounts',
    'period',jsonb_build_object('periodId',v.finance_period_id,'status',v.period_status,'businessDate',v.business_date),
    'provenance',jsonb_build_object(
      'calculationRunId',v.calculation_run_id,'runType',v.run_type,
      'calculationStatus',v.calculation_status,'inputHash',v.input_hash,
      'resultHash',v.result_hash,'snapshotHash',v.snapshot_hash
    ),
    'dispute',jsonb_build_object(
      'eligible',coalesce(v.dispute_open_amount>0 and v.open_item_status in('OPEN','PARTIALLY_ALLOCATED','DISPUTED'),false),
      'maximumAmount',v.dispute_open_amount::text,'currency',v.dispute_currency,'openItemStatus',v.open_item_status
    ),
    'rawInputExposed',false
  );
end$$;

revoke all on function finance_api.get_accrual_calculation_trace(uuid,uuid,uuid,uuid) from public,anon;
grant execute on function finance_api.get_accrual_calculation_trace(uuid,uuid,uuid,uuid) to authenticated;
