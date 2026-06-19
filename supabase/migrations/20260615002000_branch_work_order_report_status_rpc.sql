-- Branch work-order report status RPC.
-- Lets branch secretary/manager surfaces see mobile final report state without direct table writes.

create or replace function public.list_branch_work_orders_with_report_status(
  limit_count int default 50
)
returns table (
  expertise_case_id uuid,
  work_order_no text,
  report_no text,
  case_status text,
  branch_name text,
  customer_name text,
  customer_phone text,
  vehicle_plate text,
  vehicle_brand text,
  vehicle_model text,
  vehicle_year int,
  vehicle_mileage_km int,
  package_name text,
  final_report_id uuid,
  final_report_status text,
  final_report_locked_at timestamptz,
  final_report_summary jsonb,
  can_submit boolean,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ec.id as expertise_case_id,
    ec.work_order_no,
    ec.report_no,
    ec.status as case_status,
    b.name as branch_name,
    c.full_name as customer_name,
    c.phone as customer_phone,
    v.plate as vehicle_plate,
    v.brand as vehicle_brand,
    v.model as vehicle_model,
    v.model_year as vehicle_year,
    v.mileage_km as vehicle_mileage_km,
    pp.name as package_name,
    latest_report.id as final_report_id,
    latest_report.status as final_report_status,
    latest_report.locked_at as final_report_locked_at,
    latest_report.payload->'summary' as final_report_summary,
    coalesce((latest_report.payload->'summary'->>'canSubmit')::boolean, false) as can_submit,
    ec.updated_at
  from public.expertise_cases ec
  join public.branches b on b.id = ec.branch_id
  join public.customers c on c.id = ec.customer_id
  join public.vehicles v on v.id = ec.vehicle_id
  left join public.package_plans pp on pp.id = ec.package_plan_id
  left join lateral (
    select fr.*
    from public.final_reports fr
    where fr.expertise_case_id = ec.id
    order by
      case when fr.status = 'LOCKED' then 0 else 1 end,
      fr.locked_at desc nulls last,
      fr.created_at desc
    limit 1
  ) latest_report on true
  where public.current_user_can_access_branch(ec.branch_id)
  order by ec.updated_at desc, ec.created_at desc
  limit least(greatest(coalesce(limit_count, 50), 1), 200);
$$;

revoke all on function public.list_branch_work_orders_with_report_status(int) from public, anon;
grant execute on function public.list_branch_work_orders_with_report_status(int) to authenticated;
