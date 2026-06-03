-- OTOTR local smoke seed template.
-- Local development only. Do not run against staging or production.
-- This template needs local Supabase Auth user UUIDs before execution.
--
-- Usage with psql variables example:
-- psql "<LOCAL_DATABASE_URL>" `
--   -v ceo_auth_user_id="'00000000-0000-0000-0000-000000000001'" `
--   -v manager_auth_user_id="'00000000-0000-0000-0000-000000000002'" `
--   -v technician_auth_user_id="'00000000-0000-0000-0000-000000000003'" `
--   -f supabase/seeds/local_smoke_seed.template.sql
--
-- No delete/truncate/drop statements are allowed in this seed.

insert into public.branches (code, name, city, district, region, is_active)
values ('LOCAL-IST-001', 'OTOTR Local Istanbul', 'Istanbul', 'Kadikoy', 'Marmara', true)
on conflict (code) do update set
  name = excluded.name,
  city = excluded.city,
  district = excluded.district,
  region = excluded.region,
  is_active = excluded.is_active;

insert into public.app_users (auth_user_id, branch_id, full_name, email, role, is_active)
select :'ceo_auth_user_id'::uuid, null, 'Local CEO', 'local.ceo@ototr.test', 'CEO', true
on conflict (email) do update set
  auth_user_id = excluded.auth_user_id,
  role = excluded.role,
  is_active = excluded.is_active;

insert into public.app_users (auth_user_id, branch_id, full_name, email, role, is_active)
select :'manager_auth_user_id'::uuid, b.id, 'Local Branch Manager', 'local.manager@ototr.test', 'BRANCH_MANAGER', true
from public.branches b
where b.code = 'LOCAL-IST-001'
on conflict (email) do update set
  auth_user_id = excluded.auth_user_id,
  branch_id = excluded.branch_id,
  role = excluded.role,
  is_active = excluded.is_active;

insert into public.app_users (auth_user_id, branch_id, full_name, email, role, is_active)
select :'technician_auth_user_id'::uuid, b.id, 'Local Technician', 'local.technician@ototr.test', 'INSPECTION_TECHNICIAN', true
from public.branches b
where b.code = 'LOCAL-IST-001'
on conflict (email) do update set
  auth_user_id = excluded.auth_user_id,
  branch_id = excluded.branch_id,
  role = excluded.role,
  is_active = excluded.is_active;

insert into public.customers (full_name, phone, email, customer_role, kvkk_consent, service_consent)
values ('Local Smoke Customer', '+900000000000', 'local.customer@ototr.test', 'Musteri', true, true)
on conflict do nothing;

insert into public.vehicles (customer_id, plate, vin, vin_normalized, brand, model, model_year, fuel_type, transmission, mileage_km)
select c.id, '34LOCAL01', 'LOCALVIN000000001', 'LOCALVIN000000001', 'OTOTR', 'Smoke', 2026, 'Benzin', 'Otomatik', 1000
from public.customers c
where c.email = 'local.customer@ototr.test'
  and not exists (select 1 from public.vehicles v where v.plate = '34LOCAL01');

insert into public.report_templates (id, name, version, source_report_id, is_active)
values ('local_template_v1', 'Local Smoke Template', 'v1', 'local-smoke', true)
on conflict (id) do update set
  name = excluded.name,
  version = excluded.version,
  is_active = excluded.is_active;

insert into public.report_template_groups (id, template_id, title, code, sort_order, assigned_role)
values ('local_template_v1_group_body', 'local_template_v1', 'Kaporta Boya', 'BODY', 10, 'BODY_PAINT')
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order,
  assigned_role = excluded.assigned_role;

insert into public.report_template_items (id, template_id, group_id, nokta_id, title, sort_order, item_type, has_options, has_inputs, has_description, has_images, max_images)
values ('local_template_v1_item_1', 'local_template_v1', 'local_template_v1_group_body', 1, 'On kaput', 10, 'choice', true, true, true, true, 3)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order,
  has_options = excluded.has_options,
  has_inputs = excluded.has_inputs,
  has_description = excluded.has_description,
  has_images = excluded.has_images,
  max_images = excluded.max_images;

insert into public.report_template_item_options (id, template_id, item_id, secenek_id, label, sort_order, color_type, score_type)
values
  ('local_template_v1_item_1_opt_ok', 'local_template_v1', 'local_template_v1_item_1', 1, 'Orijinal', 10, 'green', 'positive'),
  ('local_template_v1_item_1_opt_paint', 'local_template_v1', 'local_template_v1_item_1', 2, 'Boyalı', 20, 'orange', 'warning')
on conflict (id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  color_type = excluded.color_type,
  score_type = excluded.score_type;

insert into public.report_template_item_inputs (id, template_id, item_id, type, name, label, sort_order)
values ('local_template_v1_item_1_input_micron', 'local_template_v1', 'local_template_v1_item_1', 'number', 'micron', 'Mikron', 10)
on conflict (id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

-- Create one smoke work order through the reviewed RPC after an authenticated local session exists.
-- Direct RPC execution from SQL cannot emulate auth.uid() unless the session/JWT context is available.

