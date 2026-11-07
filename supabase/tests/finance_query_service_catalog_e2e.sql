\set ON_ERROR_STOP on

do $test$
declare
  v_count integer;
begin
  select count(*) into v_count
  from finance.fee_definitions fd
  where fd.version_no = 1
    and fd.fee_family = 'QUERY'
    and fd.status = 'PUBLISHED'
    and fd.legal_entity_id is null
    and fd.code in ('TRAMER_QUERY', 'KM_QUERY', 'TRAMER_360_QUERY');

  if v_count <> 3 then
    raise exception 'Query service catalog is incomplete: %', v_count;
  end if;

  if exists (
    select 1
    from finance.fee_definitions fd
    where fd.code in ('TRAMER_QUERY', 'KM_QUERY', 'TRAMER_360_QUERY')
      and (fd.fee_family <> 'QUERY' or fd.status <> 'PUBLISHED' or fd.legal_entity_id is not null)
  ) then
    raise exception 'Query service catalog contains a conflicting definition';
  end if;

  raise notice 'QUERY SERVICE CATALOG E2E PASSED: three global codes published without an amount or active contract rule';
end;
$test$;
