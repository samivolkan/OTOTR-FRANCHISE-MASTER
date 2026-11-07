create or replace function finance_api.assert_erp_branch_operation_access(
  p_erp_branch_id uuid,
  p_capability text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor public.app_users%rowtype;
  v_mapping_count integer;
  v_legal_entity_id uuid;
  v_dealer_account_id uuid;
  v_finance_branch_id uuid;
  v_blocking_invoice_count integer;
  v_blocking_open_amount numeric(24,8);
  v_currency_code text;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'ERP session is required';
  end if;

  if p_erp_branch_id is null or p_capability !~ '^[A-Z][A-Z0-9_]{1,63}$' then
    raise exception using errcode = '22023', message = 'ERP branch access request is invalid';
  end if;

  select * into v_actor
  from public.app_users u
  where u.auth_user_id = auth.uid() and u.is_active
  limit 1;

  if not found then
    raise exception using errcode = '42501', message = 'Active ERP user was not found';
  end if;

  if v_actor.role in ('CEO', 'GENERAL_MANAGER', 'QUALITY_AUDITOR') then
    return pg_catalog.jsonb_build_object(
      'allowed', true,
      'capability', p_capability,
      'accessState', 'CENTRAL_ROLE_BYPASS',
      'rawPaymentDataExposed', false
    );
  end if;

  if v_actor.branch_id is distinct from p_erp_branch_id then
    raise exception using errcode = '42501', message = 'ERP branch scope denied';
  end if;

  select pg_catalog.count(*),
         pg_catalog.min(m.legal_entity_id::text)::uuid,
         pg_catalog.min(m.dealer_account_id::text)::uuid,
         pg_catalog.min(m.finance_branch_id::text)::uuid
    into v_mapping_count, v_legal_entity_id, v_dealer_account_id, v_finance_branch_id
  from finance_private.erp_branch_scope_mappings m
  join finance.dealer_accounts a
    on a.id = m.dealer_account_id
   and a.legal_entity_id = m.legal_entity_id
   and a.status in ('SHADOW', 'ACTIVE')
  join finance.branches b
    on b.id = m.finance_branch_id
   and b.legal_entity_id = m.legal_entity_id
   and b.dealer_legal_entity_id = a.dealer_legal_entity_id
   and b.status = 'ACTIVE'
  where m.erp_branch_id = p_erp_branch_id
    and m.status = 'ACTIVE'
    and m.effective_from <= current_date
    and (m.effective_to is null or current_date < m.effective_to);

  if v_mapping_count <> 1 then
    raise exception using errcode = '42501', message = 'ERP finance scope is not configured';
  end if;

  select pg_catalog.count(distinct ei.id),
         pg_catalog.coalesce(pg_catalog.sum(oi.open_amount), 0),
         pg_catalog.min(oi.currency_code)
    into v_blocking_invoice_count, v_blocking_open_amount, v_currency_code
  from finance.open_items oi
  join finance.accruals a on a.id = oi.accrual_id
  join finance.fee_definitions fd
    on fd.id = a.fee_definition_id and fd.fee_family = 'ROYALTY'
  join finance.billing_batch_items bi
    on bi.accrual_id = a.id and bi.status = 'ACTIVE'
  join finance.external_invoice_lines eil
    on eil.billing_batch_item_id = bi.id
  join finance.external_invoices ei
    on ei.id = eil.external_invoice_id and ei.status = 'ISSUED'
  where oi.legal_entity_id = v_legal_entity_id
    and oi.dealer_account_id = v_dealer_account_id
    and oi.branch_id = v_finance_branch_id
    and oi.item_type = 'DEBIT'
    and oi.status in ('OPEN', 'PARTIALLY_ALLOCATED')
    and oi.open_amount > 0
    and oi.due_date < current_date;

  if v_blocking_invoice_count > 0
     and p_capability not in ('PAYMENT', 'INVOICE_READ', 'STATEMENT_READ', 'SUPPORT', 'LOGOUT') then
    raise exception using
      errcode = '42501',
      message = 'BRANCH_FINANCE_LOCKED',
      detail = 'Royalty invoice payment is overdue';
  end if;

  return pg_catalog.jsonb_build_object(
    'allowed', true,
    'capability', p_capability,
    'accessState', case when v_blocking_invoice_count > 0 then 'LOCKED_OVERDUE' else 'OPEN' end,
    'blockingInvoiceCount', v_blocking_invoice_count,
    'blockingOpenAmount', v_blocking_open_amount::text,
    'currency', v_currency_code,
    'rawPaymentDataExposed', false
  );
end;
$function$;

revoke all on function finance_api.assert_erp_branch_operation_access(uuid, text)
  from public, anon, authenticated;

alter function app_private.create_branch_work_order(
  text, text, text, text, text, text, text, text, text, integer,
  text, text, integer, text, text, text, text
) rename to create_branch_work_order_without_finance_gate;

revoke all on function app_private.create_branch_work_order_without_finance_gate(
  text, text, text, text, text, text, text, text, text, integer,
  text, text, integer, text, text, text, text
) from public, anon, authenticated;

create function app_private.create_branch_work_order(
  customer_full_name text,
  customer_phone text,
  customer_email text,
  customer_identity_number text,
  customer_role text,
  vehicle_plate text,
  vehicle_vin text,
  vehicle_brand text,
  vehicle_model text,
  vehicle_year integer,
  vehicle_fuel_type text,
  vehicle_transmission text,
  vehicle_kilometers integer,
  vehicle_seller_type text,
  vehicle_arrival_note text,
  package_type text,
  work_order_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_erp_branch_id uuid;
begin
  select u.branch_id into v_erp_branch_id
  from public.app_users u
  where u.auth_user_id = auth.uid() and u.is_active
  limit 1;

  perform finance_api.assert_erp_branch_operation_access(
    v_erp_branch_id,
    'WORK_ORDER_CREATE'
  );

  return app_private.create_branch_work_order_without_finance_gate(
    customer_full_name, customer_phone, customer_email, customer_identity_number,
    customer_role, vehicle_plate, vehicle_vin, vehicle_brand, vehicle_model,
    vehicle_year, vehicle_fuel_type, vehicle_transmission, vehicle_kilometers,
    vehicle_seller_type, vehicle_arrival_note, package_type, work_order_notes
  );
end;
$function$;

revoke all on function app_private.create_branch_work_order(
  text, text, text, text, text, text, text, text, text, integer,
  text, text, integer, text, text, text, text
) from public, anon;

grant execute on function app_private.create_branch_work_order(
  text, text, text, text, text, text, text, text, text, integer,
  text, text, integer, text, text, text, text
) to authenticated;
