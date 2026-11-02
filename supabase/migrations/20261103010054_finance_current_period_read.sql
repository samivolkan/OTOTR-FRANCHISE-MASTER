-- Resolve the branch finance period by business date for ERP screens.

create or replace function finance_api.get_current_finance_period(
  p_legal_entity_id uuid,
  p_dealer_account_id uuid,
  p_branch_id uuid,
  p_as_of date
) returns jsonb
language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api
as $$
declare
  v_period_id uuid;
begin
  if p_as_of is null then
    raise exception using errcode='22023',message='as-of date is required';
  end if;
  if not finance_api.authorize_scope(
    p_legal_entity_id,p_dealer_account_id,p_branch_id,'getFinancePeriod'
  ) then
    raise exception using errcode='42501',message='finance scope denied';
  end if;

  select fp.id into v_period_id
    from finance.finance_periods fp
   where fp.legal_entity_id=p_legal_entity_id
     and fp.scope_type='BRANCH'
     and fp.dealer_account_id=p_dealer_account_id
     and fp.branch_id=p_branch_id
     and p_as_of between fp.period_start and fp.period_end
   order by fp.period_start desc,fp.id desc
   limit 1;
  if not found then return null; end if;
  return finance_api.get_finance_period(
    p_legal_entity_id,p_dealer_account_id,p_branch_id,v_period_id
  );
end $$;

revoke all on function finance_api.get_current_finance_period(uuid,uuid,uuid,date)
  from public,anon;
grant execute on function finance_api.get_current_finance_period(uuid,uuid,uuid,date)
  to authenticated;
