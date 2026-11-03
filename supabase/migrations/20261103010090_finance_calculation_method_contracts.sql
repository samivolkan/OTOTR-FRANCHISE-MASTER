-- Complete the read-only contract impact calculator with explicit parameter contracts.
-- All amounts are non-negative. Invalid/ambiguous configurations fail closed.

create or replace function finance_private.round_contract_amount(p_value numeric,p_scale integer,p_mode text)
returns numeric language plpgsql immutable security definer set search_path=pg_catalog as $$
declare v_factor numeric:=power(10::numeric,p_scale);v_scaled numeric;v_floor numeric;v_fraction numeric;
begin
  if p_value<0 or p_scale not between 0 and 8 or p_mode not in('HALF_UP','HALF_EVEN','DOWN','UP') then return null;end if;
  if p_mode='HALF_UP' then return round(p_value,p_scale);end if;
  if p_mode='DOWN' then return trunc(p_value,p_scale);end if;
  if p_mode='UP' then return case when p_value=trunc(p_value,p_scale) then p_value else ceil(p_value*v_factor)/v_factor end;end if;
  v_scaled:=p_value*v_factor;v_floor:=floor(v_scaled);v_fraction:=v_scaled-v_floor;
  return (case when v_fraction<0.5 then v_floor when v_fraction>0.5 then v_floor+1 when mod(v_floor,2)=0 then v_floor else v_floor+1 end)/v_factor;
end$$;
revoke all on function finance_private.round_contract_amount(numeric,integer,text) from public,anon,authenticated;

create or replace function finance_private.calculate_contract_charge(p_method text,p_parameters jsonb,p_basis numeric,p_quantity numeric,p_depth integer default 0)
returns jsonb language plpgsql immutable security definer set search_path=pg_catalog as $$
declare v_charge numeric:=0;v_rate numeric;v_fixed numeric;v_tier jsonb;v_previous numeric:=0;v_limit numeric;v_slice numeric;v_matched boolean;v_branch jsonb;v_nested jsonb;
begin
  if p_depth>2 or p_basis<0 or p_quantity<0 or jsonb_typeof(p_parameters)<>'object' then return jsonb_build_object('supported',false,'reasonCode','CALCULATION_PARAMETERS_INVALID');end if;
  case p_method
    when 'PERCENTAGE' then
      if coalesce(p_parameters->>'rate','')!~'^(0|0?\.[0-9]{1,8}|1(\.0{1,8})?)$' then return jsonb_build_object('supported',false,'reasonCode','PERCENTAGE_RATE_INVALID');end if;
      v_charge:=p_basis*(p_parameters->>'rate')::numeric;
    when 'FIXED' then
      if coalesce(p_parameters->>'amount','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then return jsonb_build_object('supported',false,'reasonCode','FIXED_AMOUNT_INVALID');end if;
      v_charge:=(p_parameters->>'amount')::numeric;
    when 'PER_UNIT' then
      if coalesce(p_parameters->>'unitAmount','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then return jsonb_build_object('supported',false,'reasonCode','UNIT_AMOUNT_INVALID');end if;
      v_charge:=(p_parameters->>'unitAmount')::numeric*p_quantity;
    when 'FIXED_PLUS_VARIABLE' then
      if coalesce(p_parameters->>'fixedAmount','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' or coalesce(p_parameters->>'rate','')!~'^(0|0?\.[0-9]{1,8}|1(\.0{1,8})?)$' then return jsonb_build_object('supported',false,'reasonCode','COMPOSITE_PARAMETERS_INVALID');end if;
      v_charge:=(p_parameters->>'fixedAmount')::numeric+p_basis*(p_parameters->>'rate')::numeric;
    when 'COST_PLUS' then
      if coalesce(p_parameters->>'markupRate','')!~'^(0|[1-9][0-9]*|0?\.[0-9]{1,8}|[1-9][0-9]*\.[0-9]{1,8})$' or coalesce(p_parameters->>'markupAmount','0')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then return jsonb_build_object('supported',false,'reasonCode','COST_PLUS_PARAMETERS_INVALID');end if;
      v_charge:=p_basis*(1+(p_parameters->>'markupRate')::numeric)+(coalesce(p_parameters->>'markupAmount','0'))::numeric;
    when 'TIERED' then
      if jsonb_typeof(p_parameters->'tiers')<>'array' or jsonb_array_length(p_parameters->'tiers')<1 or jsonb_array_length(p_parameters->'tiers')>50 then return jsonb_build_object('supported',false,'reasonCode','TIERED_PARAMETERS_INVALID');end if;
      for v_tier in select value from jsonb_array_elements(p_parameters->'tiers') loop
        if jsonb_typeof(v_tier)<>'object' or coalesce(v_tier->>'rate','')!~'^(0|0?\.[0-9]{1,8}|1(\.0{1,8})?)$' or (v_tier ? 'upTo' and jsonb_typeof(v_tier->'upTo')<>'null' and coalesce(v_tier->>'upTo','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$') then return jsonb_build_object('supported',false,'reasonCode','TIERED_PARAMETERS_INVALID');end if;
        v_limit:=case when not(v_tier?'upTo') or jsonb_typeof(v_tier->'upTo')='null' then null else (v_tier->>'upTo')::numeric end;
        if v_limit is not null and v_limit<=v_previous then return jsonb_build_object('supported',false,'reasonCode','TIERED_LIMITS_INVALID');end if;
        v_slice:=greatest(least(p_basis,coalesce(v_limit,p_basis))-v_previous,0);v_charge:=v_charge+v_slice*(v_tier->>'rate')::numeric;v_previous:=coalesce(v_limit,p_basis);
        exit when v_limit is null or v_previous>=p_basis;
      end loop;
      if v_previous<p_basis then return jsonb_build_object('supported',false,'reasonCode','TIERED_COVERAGE_INCOMPLETE');end if;
    when 'CONDITIONAL' then
      if coalesce(p_parameters->>'operator','') not in('GTE','GT','LTE','LT','EQ') or coalesce(p_parameters->>'threshold','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' or jsonb_typeof(p_parameters->'whenMatched')<>'object' or jsonb_typeof(p_parameters->'whenNotMatched')<>'object' then return jsonb_build_object('supported',false,'reasonCode','CONDITIONAL_PARAMETERS_INVALID');end if;
      v_matched:=case p_parameters->>'operator' when 'GTE' then p_basis>=(p_parameters->>'threshold')::numeric when 'GT' then p_basis>(p_parameters->>'threshold')::numeric when 'LTE' then p_basis<=(p_parameters->>'threshold')::numeric when 'LT' then p_basis<(p_parameters->>'threshold')::numeric else p_basis=(p_parameters->>'threshold')::numeric end;
      v_branch:=case when v_matched then p_parameters->'whenMatched' else p_parameters->'whenNotMatched' end;
      if coalesce(v_branch->>'method','')='CONDITIONAL' or jsonb_typeof(v_branch->'parameters')<>'object' then return jsonb_build_object('supported',false,'reasonCode','CONDITIONAL_BRANCH_INVALID');end if;
      v_nested:=finance_private.calculate_contract_charge(v_branch->>'method',v_branch->'parameters',p_basis,p_quantity,p_depth+1);
      if not coalesce((v_nested->>'supported')::boolean,false) then return v_nested;end if;v_charge:=(v_nested->>'chargeAmount')::numeric;
    else return jsonb_build_object('supported',false,'reasonCode','CALCULATION_METHOD_UNSUPPORTED');
  end case;
  return jsonb_build_object('supported',true,'chargeAmount',v_charge::text);
exception when invalid_text_representation or numeric_value_out_of_range then return jsonb_build_object('supported',false,'reasonCode','NUMERIC_PARAMETER_INVALID');
end$$;
revoke all on function finance_private.calculate_contract_charge(text,jsonb,numeric,numeric,integer) from public,anon,authenticated;

create or replace function finance_private.simulate_rule_gross(
  p_method text,p_parameters jsonb,p_tax_rate numeric,p_price_includes_tax boolean,
  p_basis numeric,p_quantity numeric,p_minimum numeric,p_maximum numeric,p_scale integer,p_rounding text
) returns jsonb language plpgsql immutable security definer set search_path=pg_catalog as $$
declare v_result jsonb;v_charge numeric;v_gross numeric;v_amount numeric;
begin
  if p_basis<0 or p_quantity<0 then return jsonb_build_object('supported',false,'reasonCode','NEGATIVE_INPUT_INVALID');end if;
  v_result:=finance_private.calculate_contract_charge(p_method,p_parameters,p_basis,p_quantity,0);
  if not coalesce((v_result->>'supported')::boolean,false) then return v_result;end if;v_charge:=(v_result->>'chargeAmount')::numeric;
  if p_minimum is not null then v_charge:=greatest(v_charge,p_minimum);end if;if p_maximum is not null then v_charge:=least(v_charge,p_maximum);end if;
  v_gross:=case when p_price_includes_tax then v_charge else v_charge*(1+coalesce(p_tax_rate,0)) end;
  v_amount:=finance_private.round_contract_amount(v_gross,p_scale,p_rounding);
  if v_amount is null then return jsonb_build_object('supported',false,'reasonCode','ROUNDING_MODE_INVALID');end if;
  return jsonb_build_object('supported',true,'grossAmount',v_amount::text);
exception when invalid_text_representation or numeric_value_out_of_range then return jsonb_build_object('supported',false,'reasonCode','NUMERIC_PARAMETER_INVALID');
end$$;
revoke all on function finance_private.simulate_rule_gross(text,jsonb,numeric,boolean,numeric,numeric,numeric,numeric,integer,text) from public,anon,authenticated;
