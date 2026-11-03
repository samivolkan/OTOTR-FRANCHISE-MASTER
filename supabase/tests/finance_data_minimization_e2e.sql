\set ON_ERROR_STOP on
begin;

do $test$
declare
  raw_grants integer;
  unsafe_export_grants integer;
  sensitive_projection_grants integer;
begin
  select count(*) into raw_grants
  from information_schema.role_table_grants
  where table_schema='finance'
    and grantee in('anon','authenticated')
    and privilege_type in('SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER');
  if raw_grants<>0 then raise exception 'raw finance table grants detected: %',raw_grants;end if;

  select count(*) into unsafe_export_grants
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid=p.pronamespace
  where n.nspname='finance_api'
    and (p.proname like 'commit%export%' or p.proname like '%callback%' or p.proname like 'commit_accounting_batch%')
    and (has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('authenticated',p.oid,'EXECUTE'));
  if unsafe_export_grants<>0 then raise exception 'client export mutation grants detected: %',unsafe_export_grants;end if;

  if has_function_privilege('anon','finance_api.list_finance_export_packages(uuid,text,text,text,integer)','EXECUTE')
     or has_function_privilege('anon','finance_api.get_finance_export_package(uuid,text,uuid)','EXECUTE') then
    raise exception 'anonymous export read grant detected';
  end if;
  if not has_function_privilege('authenticated','finance_api.list_finance_export_packages(uuid,text,text,text,integer)','EXECUTE')
     or not has_function_privilege('authenticated','finance_api.get_finance_export_package(uuid,text,uuid)','EXECUTE') then
    raise exception 'approved authenticated export projections are unavailable';
  end if;

  select count(*) into sensitive_projection_grants
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid=p.pronamespace
  where n.nspname='finance_private'
    and (has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('authenticated',p.oid,'EXECUTE'));
  if sensitive_projection_grants<>0 then raise exception 'private finance function grants detected: %',sensitive_projection_grants;end if;

  raise notice 'FINANCE DATA MINIMIZATION E2E PASSED: raw tables, export mutations, anonymous projections and private functions are client-inaccessible';
end $test$;

rollback;
