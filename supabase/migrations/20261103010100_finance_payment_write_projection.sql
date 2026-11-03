-- Safe write metadata for the payment UI. Optimistic-lock versions are projections,
-- not client authority; every mutation is re-authorized and revalidated server-side.

alter function finance_api.get_payment(uuid,uuid,uuid,uuid) rename to get_payment_base;
revoke all on function finance_api.get_payment_base(uuid,uuid,uuid,uuid) from public,anon,authenticated;

create function finance_api.get_payment(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_payment_id uuid
) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare v_result jsonb;v_allocations jsonb;v_open_items jsonb;
begin
  v_result:=finance_api.get_payment_base(p_legal_entity_id,p_dealer_account_id,p_branch_id,p_payment_id);
  if v_result is null then return null;end if;
  select coalesce(jsonb_agg(item||jsonb_build_object(
    'allocationVersion',pa.version,'openItemVersion',oi.version
  ) order by item->>'allocationId'),'[]'::jsonb) into v_allocations
  from jsonb_array_elements(v_result->'allocations') item
  join finance.payment_allocations pa on pa.id=(item->>'allocationId')::uuid
  join finance.open_items oi on oi.id=pa.open_item_id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'openItemId',oi.id,'version',oi.version,'dueDate',oi.due_date,'status',oi.status,
    'feeCode',fd.code,'feeName',fd.name,
    'originalAmount',jsonb_build_object('amount',oi.original_amount::text,'currency',oi.currency_code),
    'openAmount',jsonb_build_object('amount',oi.open_amount::text,'currency',oi.currency_code)
  ) order by oi.due_date,oi.id),'[]'::jsonb) into v_open_items
  from finance.open_items oi
  left join finance.accruals a on a.id=oi.accrual_id
  left join finance.fee_definitions fd on fd.id=a.fee_definition_id
  where oi.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id and oi.branch_id=p_branch_id
    and oi.item_type='DEBIT' and oi.status in('OPEN','PARTIALLY_ALLOCATED') and oi.open_amount>0
    and oi.currency_code=v_result#>>'{payment,amount,currency}';
  return v_result||jsonb_build_object('allocations',v_allocations,'allocatableOpenItems',v_open_items);
end$$;

revoke all on function finance_api.get_payment(uuid,uuid,uuid,uuid) from public,anon;
grant execute on function finance_api.get_payment(uuid,uuid,uuid,uuid) to authenticated;
