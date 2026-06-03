-- OTOTR RLS role fixture template
-- Local/staging only. Do not run against production.
-- Replace all 00000000-0000-0000-0000-000000000000 placeholders with local
-- auth.users ids created in the target local/staging Supabase project.

begin;

-- Keep this template transactional by default. Remove the final rollback only
-- after reviewing the generated local/staging fixture values.

-- Branches for positive and negative scope checks.
insert into public.branches (id, name, code, region, city, status)
values
  ('10000000-0000-0000-0000-000000000001', 'RLS Test Branch A', 'RLS-A', 'Marmara', 'Bursa', 'ACTIVE'),
  ('10000000-0000-0000-0000-000000000002', 'RLS Test Branch B', 'RLS-B', 'Ic Anadolu', 'Ankara', 'ACTIVE')
on conflict (id) do update
set name = excluded.name,
    code = excluded.code,
    region = excluded.region,
    city = excluded.city,
    status = excluded.status;

-- App users. auth_user_id values must reference real auth.users rows.
insert into public.app_users (id, auth_user_id, branch_id, full_name, email, phone, role, is_active)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', null, 'RLS CEO', 'rls-ceo@example.test', '', 'CEO', true),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', null, 'RLS Region Manager', 'rls-region@example.test', '', 'REGIONAL_MANAGER', true),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'RLS Branch Manager A', 'rls-branch-a@example.test', '', 'BRANCH_MANAGER', true),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'RLS Branch Manager B', 'rls-branch-b@example.test', '', 'BRANCH_MANAGER', true),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'RLS Technician A', 'rls-tech-a@example.test', '', 'INSPECTION_TECHNICIAN', true),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', null, 'RLS Finance', 'rls-finance@example.test', '', 'FINANCE', true),
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', null, 'RLS Quality', 'rls-quality@example.test', '', 'QUALITY_AUDITOR', true)
on conflict (id) do update
set auth_user_id = excluded.auth_user_id,
    branch_id = excluded.branch_id,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    is_active = excluded.is_active;

-- Region assignment. Adjust column names if the reviewed schema changes.
insert into public.user_region_assignments (id, user_id, region, is_active)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Marmara', true)
on conflict (id) do update
set user_id = excluded.user_id,
    region = excluded.region,
    is_active = excluded.is_active;

-- Minimal customer/vehicle/package/case records for branch and technician checks.
insert into public.customers (id, branch_id, full_name, phone, email, customer_role)
values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'RLS Customer A', '', '', 'OWNER'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'RLS Customer B', '', '', 'OWNER')
on conflict (id) do update
set branch_id = excluded.branch_id,
    full_name = excluded.full_name,
    phone = excluded.phone,
    email = excluded.email,
    customer_role = excluded.customer_role;

insert into public.vehicles (id, branch_id, customer_id, plate, vin, brand, model)
values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'RLS001', 'RLSVIN00000000001', 'OTOTR', 'Scope A'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'RLS002', 'RLSVIN00000000002', 'OTOTR', 'Scope B')
on conflict (id) do update
set branch_id = excluded.branch_id,
    customer_id = excluded.customer_id,
    plate = excluded.plate,
    vin = excluded.vin,
    brand = excluded.brand,
    model = excluded.model;

insert into public.package_plans (id, code, name, duration_minutes, is_active)
values ('60000000-0000-0000-0000-000000000001', 'RLS', 'RLS Test Package', 60, true)
on conflict (id) do update
set code = excluded.code,
    name = excluded.name,
    duration_minutes = excluded.duration_minutes,
    is_active = excluded.is_active;

insert into public.expertise_cases (id, branch_id, customer_id, vehicle_id, package_plan_id, work_order_no, status)
values
  ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'RLS-WO-A', 'INSPECTION_IN_PROGRESS'),
  ('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 'RLS-WO-B', 'INSPECTION_IN_PROGRESS')
on conflict (id) do update
set branch_id = excluded.branch_id,
    customer_id = excluded.customer_id,
    vehicle_id = excluded.vehicle_id,
    package_plan_id = excluded.package_plan_id,
    work_order_no = excluded.work_order_no,
    status = excluded.status;

insert into public.inspection_tasks (id, expertise_case_id, task_key, title, assigned_role, assigned_user_id, status)
values
  ('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'rls_assigned_task', 'RLS Assigned Task', 'INSPECTION_TECHNICIAN', '20000000-0000-0000-0000-000000000005', 'ASSIGNED'),
  ('80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', 'rls_other_branch_task', 'RLS Other Branch Task', 'INSPECTION_TECHNICIAN', null, 'AVAILABLE')
on conflict (id) do update
set expertise_case_id = excluded.expertise_case_id,
    task_key = excluded.task_key,
    title = excluded.title,
    assigned_role = excluded.assigned_role,
    assigned_user_id = excluded.assigned_user_id,
    status = excluded.status;

-- Expected manual verification after replacing auth_user_id placeholders:
-- 1. CEO can read both expertise_cases.
-- 2. Region manager assigned to Marmara can read branch A and cannot read branch B.
-- 3. Branch manager A can read case A and cannot read case B.
-- 4. Technician A can read/mutate assigned task A and cannot mutate task B.
-- 5. Public/anon cannot read raw operational rows.

rollback;
