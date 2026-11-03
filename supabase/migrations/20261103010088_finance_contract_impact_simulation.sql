-- Read-only monetary impact simulation for active versus candidate contract versions.
-- No accrual, journal, open item or audit mutation is performed.

create or replace function finance_private.simulate_rule_gross(
  p_method text,p_parameters jsonb,p_tax_rate numeric,p_price_includes_tax boolean,
  p_basis numeric,p_quantity numeric,p_minimum numeric,p_maximum numeric,p_scale integer,p_rounding text
) returns jsonb language plpgsql immutable security definer set search_path=pg_catalog as $$
declare v_charge numeric;v_gross numeric;v_rate numeric;v_amount numeric;
begin
  if p_rounding<>'HALF_UP' then return jsonb_build_object('supported',false,'reasonCode','ROUNDING_MODE_UNSUPPORTED');end if;
  case p_method
    when 'PERCENTAGE' then
      if coalesce(p_parameters->>'rate','')!~'^(0|0?\.[0-9]{1,8}|1(\.0{1,8})?)$' then return jsonb_build_object('supported',false,'reasonCode','PERCENTAGE_RATE_INVALID');end if;
      v_rate:=(p_parameters->>'rate')::numeric;v_charge:=p_basis*v_rate;
    when 'FIXED' then
      if coalesce(p_parameters->>'amount','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then return jsonb_build_object('supported',false,'reasonCode','FIXED_AMOUNT_INVALID');end if;
      v_charge:=(p_parameters->>'amount')::numeric;
    when 'PER_UNIT' then
      if coalesce(p_parameters->>'unitAmount','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then return jsonb_build_object('supported',false,'reasonCode','UNIT_AMOUNT_INVALID');end if;
      v_charge:=(p_parameters->>'unitAmount')::numeric*p_quantity;
    when 'FIXED_PLUS_VARIABLE' then
      if coalesce(p_parameters->>'fixedAmount','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' or coalesce(p_parameters->>'rate','')!~'^(0|0?\.[0-9]{1,8}|1(\.0{1,8})?)$' then return jsonb_build_object('supported',false,'reasonCode','COMPOSITE_PARAMETERS_INVALID');end if;
      v_charge:=(p_parameters->>'fixedAmount')::numeric+p_basis*(p_parameters->>'rate')::numeric;
    else return jsonb_build_object('supported',false,'reasonCode','CALCULATION_METHOD_UNSUPPORTED');
  end case;
  if p_minimum is not null then v_charge:=greatest(v_charge,p_minimum);end if;if p_maximum is not null then v_charge:=least(v_charge,p_maximum);end if;
  v_gross:=case when p_price_includes_tax then v_charge else v_charge*(1+coalesce(p_tax_rate,0)) end;
  v_amount:=round(v_gross,p_scale);
  return jsonb_build_object('supported',true,'grossAmount',v_amount::text);
exception when invalid_text_representation or numeric_value_out_of_range then return jsonb_build_object('supported',false,'reasonCode','NUMERIC_PARAMETER_INVALID');
end$$;
revoke all on function finance_private.simulate_rule_gross(text,jsonb,numeric,boolean,numeric,numeric,numeric,numeric,integer,text) from public,anon,authenticated;

create or replace function finance_api.simulate_contract_version_impact(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_active_version_id uuid,p_candidate_version_id uuid,p_scenario jsonb
) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api,extensions as $$
declare v_contract uuid;v_active_no integer;v_candidate_no integer;v_currency text;v_input jsonb;v_fee uuid;v_basis numeric;v_quantity numeric;v_fee_code text;v_fee_name text;v_active jsonb;v_candidate jsonb;v_items jsonb:='[]'::jsonb;v_active_total numeric:=0;v_candidate_total numeric:=0;v_complete boolean:=true;v_count integer:=0;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getCurrentFranchiseContract') then raise exception using errcode='42501',message='finance scope denied';end if;
  if jsonb_typeof(p_scenario)<>'object' or jsonb_typeof(p_scenario->'items')<>'array' or jsonb_array_length(p_scenario->'items')<1 or jsonb_array_length(p_scenario->'items')>100 then raise exception using errcode='22023',message='impact scenario items required';end if;
  select a.contract_id,a.version_no,c.version_no,a.currency_code into v_contract,v_active_no,v_candidate_no,v_currency
  from finance.contract_versions a join finance.contract_versions c on c.contract_id=a.contract_id join finance.franchise_contracts fc on fc.id=a.contract_id
  join finance.dealer_accounts da on da.legal_entity_id=fc.legal_entity_id and da.dealer_legal_entity_id=fc.dealer_legal_entity_id join finance.branches b on b.legal_entity_id=fc.legal_entity_id and b.dealer_legal_entity_id=fc.dealer_legal_entity_id
  where a.id=p_active_version_id and c.id=p_candidate_version_id and a.status='ACTIVE' and c.status in('DRAFT','PENDING_APPROVAL','APPROVED') and a.currency_code=c.currency_code and fc.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and b.id=p_branch_id;
  if not found then return null;end if;
  for v_input in select value from jsonb_array_elements(p_scenario->'items') loop
    if jsonb_typeof(v_input)<>'object' or coalesce(v_input->>'feeDefinitionId','')!~'^[0-9a-fA-F-]{36}$' or coalesce(v_input->>'basisAmount','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' or coalesce(v_input->>'quantity','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then raise exception using errcode='22023',message='invalid impact scenario item';end if;
    v_fee:=(v_input->>'feeDefinitionId')::uuid;v_basis:=(v_input->>'basisAmount')::numeric;v_quantity:=(v_input->>'quantity')::numeric;
    select fd.code,fd.name into v_fee_code,v_fee_name from finance.fee_definitions fd where fd.id=v_fee and fd.legal_entity_id=p_legal_entity_id and fd.status='PUBLISHED';if not found then raise exception using errcode='P0002',message='scenario fee definition not found';end if;
    select finance_private.simulate_rule_gross(r.calculation_method,r.calculation_parameters,t.rate,r.price_includes_tax,v_basis,v_quantity,r.minimum_amount,r.maximum_amount,r.decimal_scale,r.rounding_mode) into v_active from finance.contract_fee_rules r join finance.tax_code_versions t on t.id=r.tax_code_version_id where r.contract_version_id=p_active_version_id and r.fee_definition_id=v_fee and r.status='ACTIVE' and r.configuration_status='CONFIGURED';
    select finance_private.simulate_rule_gross(r.calculation_method,r.calculation_parameters,t.rate,r.price_includes_tax,v_basis,v_quantity,r.minimum_amount,r.maximum_amount,r.decimal_scale,r.rounding_mode) into v_candidate from finance.contract_fee_rules r join finance.tax_code_versions t on t.id=r.tax_code_version_id where r.contract_version_id=p_candidate_version_id and r.fee_definition_id=v_fee and r.status in('DRAFT','PENDING_APPROVAL','APPROVED') and r.configuration_status='CONFIGURED';
    v_active:=coalesce(v_active,jsonb_build_object('supported',true,'grossAmount','0','reasonCode','RULE_NOT_PRESENT'));v_candidate:=coalesce(v_candidate,jsonb_build_object('supported',true,'grossAmount','0','reasonCode','RULE_NOT_PRESENT'));
    if not coalesce((v_active->>'supported')::boolean,false) or not coalesce((v_candidate->>'supported')::boolean,false) then v_complete:=false;else v_active_total:=v_active_total+(v_active->>'grossAmount')::numeric;v_candidate_total:=v_candidate_total+(v_candidate->>'grossAmount')::numeric;end if;
    v_items:=v_items||jsonb_build_array(jsonb_build_object('feeDefinitionId',v_fee,'feeCode',v_fee_code,'feeName',v_fee_name,'basisAmount',v_basis::text,'quantity',v_quantity::text,'currency',v_currency,'active',v_active,'candidate',v_candidate,'deltaGrossAmount',case when (v_active->>'supported')::boolean and (v_candidate->>'supported')::boolean then ((v_candidate->>'grossAmount')::numeric-(v_active->>'grossAmount')::numeric)::text else null end));v_count:=v_count+1;
  end loop;
  return jsonb_build_object('contractId',v_contract,'activeVersionId',p_active_version_id,'activeVersionNo',v_active_no,'candidateVersionId',p_candidate_version_id,'candidateVersionNo',v_candidate_no,'currency',v_currency,'scenarioItemCount',v_count,'complete',v_complete,'totals',case when v_complete then jsonb_build_object('activeGrossAmount',v_active_total::text,'candidateGrossAmount',v_candidate_total::text,'deltaGrossAmount',(v_candidate_total-v_active_total)::text) else null end,'items',v_items,'scenarioHash',encode(digest(convert_to(p_scenario::text,'UTF8'),'sha256'),'hex'),'writesPerformed',false,'rawDefinitionsExposed',false);
end$$;
revoke all on function finance_api.simulate_contract_version_impact(uuid,uuid,uuid,uuid,uuid,jsonb) from public,anon;
grant execute on function finance_api.simulate_contract_version_impact(uuid,uuid,uuid,uuid,uuid,jsonb) to authenticated;
