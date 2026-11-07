\set ON_ERROR_STOP on

do $test$
declare
  v_wrapper_definition text;
begin
  if pg_catalog.has_function_privilege(
    'authenticated',
    'finance_api.assert_erp_branch_operation_access(uuid,text)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated client can call the internal ERP finance gate directly';
  end if;

  if pg_catalog.has_function_privilege(
    'authenticated',
    'app_private.create_branch_work_order_without_finance_gate(text,text,text,text,text,text,text,text,text,integer,text,text,integer,text,text,text,text)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated client can bypass the ERP finance gate';
  end if;

  if not pg_catalog.has_function_privilege(
    'authenticated',
    'app_private.create_branch_work_order(text,text,text,text,text,text,text,text,text,integer,text,text,integer,text,text,text,text)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated ERP caller cannot reach the guarded work-order function';
  end if;

  select pg_catalog.pg_get_functiondef(p.oid)
    into v_wrapper_definition
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'app_private'
    and p.proname = 'create_branch_work_order'
    and pg_catalog.pg_get_function_identity_arguments(p.oid) =
      'customer_full_name text, customer_phone text, customer_email text, customer_identity_number text, customer_role text, vehicle_plate text, vehicle_vin text, vehicle_brand text, vehicle_model text, vehicle_year integer, vehicle_fuel_type text, vehicle_transmission text, vehicle_kilometers integer, vehicle_seller_type text, vehicle_arrival_note text, package_type text, work_order_notes text';

  if v_wrapper_definition is null
     or pg_catalog.strpos(v_wrapper_definition, 'finance_api.assert_erp_branch_operation_access') = 0
     or pg_catalog.strpos(v_wrapper_definition, 'WORK_ORDER_CREATE') = 0
     or pg_catalog.strpos(v_wrapper_definition, 'create_branch_work_order_without_finance_gate') = 0 then
    raise exception 'Guarded work-order wrapper is incomplete';
  end if;

  raise notice 'ERP WORK ORDER ACCESS GATE E2E PASSED: guarded entry point present; direct gate and bypass denied';
end;
$test$;
