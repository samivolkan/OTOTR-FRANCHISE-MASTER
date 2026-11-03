-- Authorized, branch-scoped audit export projection. Raw safe_context never leaves the database.
create or replace function finance_api.export_audit_events(
  p_legal_entity_id uuid,
  p_dealer_account_id uuid,
  p_branch_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_action_code text,
  p_subject_type text,
  p_limit integer
)
returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare
  v_limit integer:=coalesce(p_limit,10000);
  v_items jsonb;
  v_count integer;
  v_total integer;
  v_generated timestamptz:=clock_timestamp();
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'exportAuditEvents') then
    raise exception using errcode='42501',message='finance scope denied';
  end if;
  if v_limit not between 1 and 10000 or (p_from is not null and p_to is not null and p_from>p_to) then
    raise exception using errcode='22023',message='invalid audit export filter';
  end if;
  if p_action_code is not null and p_action_code!~'^[A-Z][A-Z0-9_]{1,63}$' then raise exception using errcode='22023',message='invalid action code';end if;
  if p_subject_type is not null and p_subject_type!~'^[A-Z][A-Z0-9_]{1,63}$' then raise exception using errcode='22023',message='invalid subject type';end if;

  with scoped as(
    select a.* from finance.audit_events a
    where a.legal_entity_id=p_legal_entity_id
      and finance_private.audit_event_is_in_scope(a.id,p_legal_entity_id,p_dealer_account_id,p_branch_id)
      and(p_from is null or a.created_at_utc>=p_from)
      and(p_to is null or a.created_at_utc<p_to)
      and(p_action_code is null or a.action_code=p_action_code)
      and(p_subject_type is null or a.subject_type=p_subject_type)
  ), limited as(
    select * from scoped order by created_at_utc,id limit v_limit
  )
  select
    coalesce((select jsonb_agg(jsonb_build_object(
      'eventId',id,'createdAtUtc',created_at_utc,'actorId',actor_id,'actorType',actor_type,
      'actionCode',action_code,'subjectType',subject_type,'subjectId',subject_id,
      'decision',decision,'reasonCode',reason_code,'correlationId',correlation_id,
      'integrityHash',integrity_hash,'previousIntegrityHash',previous_integrity_hash
    )order by created_at_utc,id)from limited),'[]'::jsonb),
    (select count(*) from limited),(select count(*) from scoped)
  into v_items,v_count,v_total;

  return jsonb_build_object(
    'schemaVersion',1,'documentType','OTOTR_FINANCE_AUDIT_EXPORT','generatedAtUtc',v_generated,
    'scope',jsonb_build_object('legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id),
    'filters',jsonb_build_object('fromUtc',p_from,'toExclusiveUtc',p_to,'actionCode',p_action_code,'subjectType',p_subject_type),
    'rowCount',v_count,'totalMatchingCount',v_total,'truncated',v_total>v_count,
    'hashAlgorithm','SHA-256','rawContextExposed',false,'items',v_items
  );
end$$;

revoke all on function finance_api.export_audit_events(uuid,uuid,uuid,timestamptz,timestamptz,text,text,integer) from public,anon;
grant execute on function finance_api.export_audit_events(uuid,uuid,uuid,timestamptz,timestamptz,text,text,integer) to authenticated;
