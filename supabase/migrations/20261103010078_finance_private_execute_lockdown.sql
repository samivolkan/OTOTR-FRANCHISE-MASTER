-- Finance private helpers are internal implementation details and must never be
-- callable by browser roles, including through PostgreSQL's default PUBLIC grant.

alter default privileges in schema finance_private revoke execute on functions from public;

do $lockdown$
declare
  v_function record;
begin
  for v_function in
    select p.oid::pg_catalog.regprocedure as signature
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid=p.pronamespace
    where n.nspname='finance_private'
  loop
    execute pg_catalog.format(
      'revoke all privileges on function %s from public, anon, authenticated',
      v_function.signature
    );
  end loop;
end $lockdown$;
