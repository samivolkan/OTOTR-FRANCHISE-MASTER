begin;

do $$
declare
  v_definition text;
  v_acl text;
begin
  select pg_get_functiondef('finance_private.current_refund_worker_is_trusted()'::regprocedure)
    into v_definition;
  if v_definition not like '%service_role%' then
    raise exception 'refund worker trust gate is not service-role bound';
  end if;

  select coalesce(array_to_string(p.proacl,','),'') into v_acl
    from pg_proc p where p.oid='finance_api.commit_royalty_refund_reversal(uuid,jsonb,jsonb,jsonb,jsonb,jsonb,text,text)'::regprocedure;
  if v_acl not like '%service_role=X%' or v_acl like '%authenticated=X%' or v_acl like '%anon=X%' then
    raise exception 'refund commit ACL is not service-role only: %',v_acl;
  end if;

  select coalesce(array_to_string(p.proacl,','),'') into v_acl
    from pg_proc p where p.oid='finance_api.authorize_royalty_refund_processing_scope(uuid,uuid,uuid,uuid,uuid,text)'::regprocedure;
  if v_acl not like '%authenticated=X%' or v_acl like '%anon=X%' then
    raise exception 'refund authorization ACL is invalid: %',v_acl;
  end if;

  select coalesce(array_to_string(p.proacl,','),'') into v_acl
    from pg_proc p where p.oid='finance_api.process_royalty_refund_reversal(uuid,uuid,uuid,uuid,uuid,uuid,uuid,text,uuid)'::regprocedure;
  if v_acl like '%service_role=X%' or v_acl like '%authenticated=X%' or v_acl like '%anon=X%' then
    raise exception 'legacy refund processor remains externally executable: %',v_acl;
  end if;

  select coalesce(array_to_string(p.proacl,','),'') into v_acl
    from pg_proc p where p.oid='finance_api.process_royalty_refund_reversal_v2(uuid,uuid,uuid,uuid,uuid,uuid,uuid,text,uuid)'::regprocedure;
  if v_acl not like '%service_role=X%' or v_acl like '%authenticated=X%' or v_acl like '%anon=X%' then
    raise exception 'refund processor v2 ACL is not service-role only: %',v_acl;
  end if;
end$$;

select 'ROYALTY REFUND IDENTITY BRIDGE E2E PASSED' as result;

rollback;
