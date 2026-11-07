do $migration$
declare
  v_actor uuid := gen_random_uuid();
  v_correlation_id uuid := gen_random_uuid();
begin
  insert into finance.fee_definitions(
    legal_entity_id,
    code,
    version_no,
    fee_family,
    name,
    status,
    created_by,
    correlation_id
  )
  values
    (null, 'TRAMER_QUERY', 1, 'QUERY', 'TRAMER Sorgusu', 'PUBLISHED', v_actor, v_correlation_id),
    (null, 'KM_QUERY', 1, 'QUERY', 'Kilometre Sorgusu', 'PUBLISHED', v_actor, v_correlation_id),
    (null, 'TRAMER_360_QUERY', 1, 'QUERY', 'TRAMER 360 Sorgusu', 'PUBLISHED', v_actor, v_correlation_id)
  on conflict (code, version_no) do nothing;

  if (
    select count(*)
    from finance.fee_definitions fd
    where fd.version_no = 1
      and fd.status = 'PUBLISHED'
      and fd.fee_family = 'QUERY'
      and fd.legal_entity_id is null
      and fd.code in ('TRAMER_QUERY', 'KM_QUERY', 'TRAMER_360_QUERY')
  ) <> 3 then
    raise exception using errcode = '23514', message = 'query service catalog conflicts with an existing definition';
  end if;
end;
$migration$;
