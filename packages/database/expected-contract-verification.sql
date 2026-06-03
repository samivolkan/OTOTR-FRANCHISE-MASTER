-- OTOTR expected database contract verification.
-- Metadata-only checks for local/staging validation.
-- Do not run against production without explicit approval.

-- 1. Expected public tables.
with expected(table_name) as (
  values
    ('branches'),
    ('app_users'),
    ('customers'),
    ('vehicles'),
    ('package_plans'),
    ('appointments'),
    ('expertise_cases'),
    ('technician_start_evidence'),
    ('inspection_tasks'),
    ('inspection_item_values'),
    ('inspection_evidence_assets'),
    ('external_query_results'),
    ('report_gate_issues'),
    ('report_revisions'),
    ('report_audit_logs'),
    ('report_delivery_events'),
    ('report_templates'),
    ('report_template_groups'),
    ('report_template_items'),
    ('report_template_item_options'),
    ('report_template_item_inputs'),
    ('report_template_item_media_fields'),
    ('work_order_report_answers'),
    ('work_order_report_files'),
    ('work_order_group_status'),
    ('final_reports')
)
select e.table_name,
       case when t.table_name is null then 'missing' else 'ok' end as status
from expected e
left join information_schema.tables t
  on t.table_schema = 'public'
 and t.table_name = e.table_name
order by e.table_name;

-- 2. Expected RPC/functions.
with expected(function_name) as (
  values
    ('current_user_can_access_branch'),
    ('current_app_user_id'),
    ('current_app_user_role'),
    ('claim_inspection_task'),
    ('release_inspection_task'),
    ('manager_assign_inspection_task'),
    ('manager_clear_inspection_task_owner'),
    ('submit_inspection_task'),
    ('manager_return_inspection_task'),
    ('create_branch_work_order'),
    ('update_branch_work_order_task_status'),
    ('save_work_order_report_answer'),
    ('lock_work_order_report_item'),
    ('unlock_work_order_report_item'),
    ('list_branch_technicians')
)
select e.function_name,
       count(p.oid) as matching_functions
from expected e
left join pg_proc p on p.proname = e.function_name
left join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
group by e.function_name
order by e.function_name;

-- 3. Public tables without RLS.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'branches',
    'app_users',
    'customers',
    'vehicles',
    'package_plans',
    'appointments',
    'expertise_cases',
    'technician_start_evidence',
    'inspection_tasks',
    'inspection_item_values',
    'inspection_evidence_assets',
    'external_query_results',
    'report_gate_issues',
    'report_revisions',
    'report_audit_logs',
    'report_delivery_events',
    'report_templates',
    'report_template_groups',
    'report_template_items',
    'report_template_item_options',
    'report_template_item_inputs',
    'report_template_item_media_fields',
    'work_order_report_answers',
    'work_order_report_files',
    'work_order_group_status',
    'final_reports'
  )
  and rowsecurity = false
order by tablename;

-- 4. Expected policies.
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- 5. Function execute exposure for app-required RPCs.
select n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as args,
       has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'app_private')
  and p.proname in (
    'claim_inspection_task',
    'release_inspection_task',
    'manager_assign_inspection_task',
    'manager_clear_inspection_task_owner',
    'submit_inspection_task',
    'manager_return_inspection_task',
    'create_branch_work_order',
    'update_branch_work_order_task_status',
    'save_work_order_report_answer',
    'lock_work_order_report_item',
    'unlock_work_order_report_item',
    'list_branch_technicians'
  )
order by schema_name, function_name, args;

-- 6. SECURITY DEFINER functions without visible search_path config.
select n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as args,
       p.proconfig
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.prosecdef = true
  and (p.proconfig is null or not exists (
    select 1 from unnest(p.proconfig) cfg where cfg like 'search_path=%'
  ))
order by schema_name, function_name;

-- 7. Report media storage bucket and policies.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'report-media';

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'report_media_%'
order by policyname;

