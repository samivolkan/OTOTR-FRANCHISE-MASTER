-- OTOTR RLS verification checklist
-- Local/staging verification only. Do not run against production without explicit approval.
-- These queries inspect metadata and should not modify data.

-- 1. Public tables without RLS enabled.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and rowsecurity = false
order by tablename;

-- 2. Policy inventory.
select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- 3. SECURITY DEFINER functions in exposed schemas.
select n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as args,
       p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.prosecdef = true
  and n.nspname in ('public', 'storage', 'graphql_public')
order by n.nspname, p.proname;

-- 4. Function search_path settings.
select n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as args,
       p.proconfig
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.prosecdef = true
order by n.nspname, p.proname;

-- 5. Views and security invoker setting.
select schemaname, viewname, definition
from pg_views
where schemaname = 'public'
order by viewname;

-- 6. Grants on functions that are callable by anon/authenticated.
select n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as args,
       has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'app_private')
order by n.nspname, p.proname;

-- 7. Storage object policies.
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;

-- 8. Report media bucket inventory and public flag.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'report-media'
order by id;

-- 9. Report media object policy coverage.
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and (
    qual::text ilike '%report-media%'
    or with_check::text ilike '%report-media%'
  )
order by policyname;

-- 10. app_users auth linkage columns and constraints.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'app_users'
  and column_name in ('id', 'auth_user_id', 'branch_id', 'role', 'is_active')
order by ordinal_position;

-- 11. app_users auth_user_id uniqueness/index coverage.
select i.relname as index_name,
       ix.indisunique as is_unique,
       pg_get_indexdef(ix.indexrelid) as index_definition
from pg_index ix
join pg_class i on i.oid = ix.indexrelid
join pg_class t on t.oid = ix.indrelid
join pg_namespace n on n.oid = t.relnamespace
where n.nspname = 'public'
  and t.relname = 'app_users'
  and pg_get_indexdef(ix.indexrelid) ilike '%auth_user_id%'
order by i.relname;

-- 12. Region assignment table shape.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'user_region_assignments'
order by ordinal_position;

-- 13. Operational scope foreign key columns.
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'branches',
    'customers',
    'vehicles',
    'expertise_cases',
    'inspection_tasks',
    'inspection_evidence_assets',
    'final_reports'
  )
  and column_name in (
    'id',
    'branch_id',
    'region',
    'expertise_case_id',
    'task_id',
    'assigned_user_id',
    'owner_user_id',
    'status',
    'public_token',
    'verify_code'
  )
order by table_name, ordinal_position;

-- 14. Public report verification policies/functions.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and (
    tablename ilike '%report%'
    or policyname ilike '%public%'
    or policyname ilike '%verification%'
  )
order by tablename, policyname;

select n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as args,
       has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    p.proname ilike '%report%'
    or p.proname ilike '%verify%'
    or p.proname ilike '%public%'
  )
order by p.proname;
