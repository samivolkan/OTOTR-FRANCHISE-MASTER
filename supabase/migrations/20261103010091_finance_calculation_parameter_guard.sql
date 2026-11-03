-- Reject invalid calculation parameter contracts at the database write boundary.
-- Simulation remains fail-closed, while configured rules can no longer persist invalid shapes.

create or replace function finance_private.jsonb_key_count(p_value jsonb)
returns integer language sql immutable security definer set search_path=pg_catalog as $$select count(*)::integer from jsonb_object_keys(p_value)$$;
revoke all on function finance_private.jsonb_key_count(jsonb) from public,anon,authenticated;

create or replace function finance_private.calculation_parameters_are_valid(p_method text,p_parameters jsonb,p_depth integer default 0)
returns boolean language plpgsql immutable security definer set search_path=pg_catalog as $$
declare v_tier jsonb;v_previous numeric:=0;v_limit numeric;v_last jsonb;v_branch jsonb;
begin
  if p_depth>1 or jsonb_typeof(p_parameters)<>'object' then return false;end if;
  case p_method
    when 'PERCENTAGE' then return coalesce(p_parameters->>'rate','')~'^(0|0?\.[0-9]{1,8}|1(\.0{1,8})?)$' and finance_private.jsonb_key_count(p_parameters)=1;
    when 'FIXED' then return coalesce(p_parameters->>'amount','')~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' and finance_private.jsonb_key_count(p_parameters)=1;
    when 'PER_UNIT' then return coalesce(p_parameters->>'unitAmount','')~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' and finance_private.jsonb_key_count(p_parameters)=1;
    when 'FIXED_PLUS_VARIABLE' then return coalesce(p_parameters->>'fixedAmount','')~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' and coalesce(p_parameters->>'rate','')~'^(0|0?\.[0-9]{1,8}|1(\.0{1,8})?)$' and finance_private.jsonb_key_count(p_parameters)=2;
    when 'COST_PLUS' then return coalesce(p_parameters->>'markupRate','')~'^(0|[1-9][0-9]*|0?\.[0-9]{1,8}|[1-9][0-9]*\.[0-9]{1,8})$' and coalesce(p_parameters->>'markupAmount','0')~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' and finance_private.jsonb_key_count(p_parameters) between 1 and 2;
    when 'TIERED' then
      if jsonb_typeof(p_parameters->'tiers')<>'array' or jsonb_array_length(p_parameters->'tiers')<1 or jsonb_array_length(p_parameters->'tiers')>50 or finance_private.jsonb_key_count(p_parameters)<>1 then return false;end if;
      for v_tier in select value from jsonb_array_elements(p_parameters->'tiers') loop
        if jsonb_typeof(v_tier)<>'object' or finance_private.jsonb_key_count(v_tier)<>2 or not(v_tier?'upTo') or coalesce(v_tier->>'rate','')!~'^(0|0?\.[0-9]{1,8}|1(\.0{1,8})?)$' then return false;end if;
        if jsonb_typeof(v_tier->'upTo')='null' then v_limit:=null;else
          if coalesce(v_tier->>'upTo','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then return false;end if;v_limit:=(v_tier->>'upTo')::numeric;
          if v_limit<=v_previous then return false;end if;v_previous:=v_limit;
        end if;v_last:=v_tier;
      end loop;
      return jsonb_typeof(v_last->'upTo')='null';
    when 'CONDITIONAL' then
      if finance_private.jsonb_key_count(p_parameters)<>4 or coalesce(p_parameters->>'operator','') not in('GTE','GT','LTE','LT','EQ') or coalesce(p_parameters->>'threshold','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then return false;end if;
      foreach v_branch in array array[p_parameters->'whenMatched',p_parameters->'whenNotMatched'] loop
        if jsonb_typeof(v_branch)<>'object' or finance_private.jsonb_key_count(v_branch)<>2 or coalesce(v_branch->>'method','') not in('PERCENTAGE','FIXED','PER_UNIT','TIERED','COST_PLUS','FIXED_PLUS_VARIABLE') or not finance_private.calculation_parameters_are_valid(v_branch->>'method',v_branch->'parameters',p_depth+1) then return false;end if;
      end loop;return true;
    else return false;
  end case;
exception when invalid_text_representation or numeric_value_out_of_range then return false;
end$$;
revoke all on function finance_private.calculation_parameters_are_valid(text,jsonb,integer) from public,anon,authenticated;

create or replace function finance_private.guard_contract_fee_rule_parameters()
returns trigger language plpgsql security definer set search_path=pg_catalog,finance_private as $$
begin
  if new.configuration_status='CONFIGURED' and not finance_private.calculation_parameters_are_valid(new.calculation_method,new.calculation_parameters,0) then
    raise exception using errcode='23514',message='invalid calculation parameter contract';
  end if;
  return new;
end$$;
revoke all on function finance_private.guard_contract_fee_rule_parameters() from public,anon,authenticated;

drop trigger if exists trg_contract_fee_rule_parameter_guard on finance.contract_fee_rules;
create trigger trg_contract_fee_rule_parameter_guard before insert or update of configuration_status,calculation_method,calculation_parameters on finance.contract_fee_rules for each row execute function finance_private.guard_contract_fee_rule_parameters();

do $$begin
  if exists(select 1 from finance.contract_fee_rules where configuration_status='CONFIGURED' and not finance_private.calculation_parameters_are_valid(calculation_method,calculation_parameters,0)) then
    raise exception using errcode='23514',message='existing configured fee rule violates calculation parameter contract';
  end if;
end$$;
