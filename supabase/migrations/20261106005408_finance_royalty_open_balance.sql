-- Current royalty position scoped to one dealer account and branch.
create function finance_api.get_royalty_open_balance(
  p_legal_entity_id uuid, p_dealer_account_id uuid, p_branch_id uuid
) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_currency text;
  v_debit numeric;
  v_credit numeric;
begin
  if not finance_api.authorize_scope(
    p_legal_entity_id, p_dealer_account_id, p_branch_id, 'getDealerFinanceSummary'
  ) then
    raise exception using errcode = '42501', message = 'finance scope denied';
  end if;

  select currency_code into strict v_currency
  from finance.dealer_accounts where id = p_dealer_account_id;

  select coalesce(sum(oi.open_amount) filter (where oi.item_type = 'DEBIT'), 0),
         coalesce(sum(oi.open_amount) filter (where oi.item_type = 'CREDIT'), 0)
    into v_debit, v_credit
  from finance.open_items oi
  join finance.accruals a on a.id = oi.accrual_id and a.status = 'POSTED'
  join finance.fee_definitions fd on fd.id = a.fee_definition_id and fd.fee_family = 'ROYALTY'
  where oi.legal_entity_id = p_legal_entity_id
    and oi.dealer_account_id = p_dealer_account_id
    and oi.branch_id = p_branch_id
    and oi.currency_code = v_currency
    and oi.status in ('OPEN', 'PARTIALLY_ALLOCATED');

  return pg_catalog.jsonb_build_object(
    'currency', v_currency, 'openDebitGrossAmount', v_debit::text,
    'availableCreditGrossAmount', v_credit::text, 'netGrossAmount', (v_debit - v_credit)::text
  );
end
$$;

revoke all on function finance_api.get_royalty_open_balance(uuid,uuid,uuid) from public, anon;
grant execute on function finance_api.get_royalty_open_balance(uuid,uuid,uuid) to authenticated;
