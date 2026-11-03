-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-integration-error-retry-rpc.sql
-- Source SHA256: 9F0302712BE5F8E799252E20FDB93D5992704F699C3E0764B1048106C8723C78
-- Local replay required before any staging promotion.
-- OTOTR INTEGRATION ERROR RETRY RPC CANDIDATE

create or replace function finance_private.current_actor_can_retry_integration_error(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid
) returns boolean language sql stable security definer set search_path=''
as $$ select false $$;

create or replace function finance_private.integration_retry_error_is_in_scope(
  p_error_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid
) returns boolean language sql stable security definer set search_path=''
as $$ select false $$;

create or replace function finance_private.resolve_integration_retry_scope(p_error_id uuid)
returns jsonb language sql stable security definer set search_path=''
as $$ select null::jsonb $$;

create or replace function finance_private.current_integration_retry_committer_is_trusted()
returns boolean language sql stable security definer set search_path=''
as $$ select false $$;

create or replace function finance_api.authorize_integration_error_retry_scope(
  p_error_id uuid,p_permission text
) returns jsonb language plpgsql stable security definer set search_path=''
as $$
declare v_scope jsonb;v_legal_entity_id uuid;v_dealer_account_id uuid;v_branch_id uuid;
begin
  if p_permission<>'finance.integration-errors.retry' or auth.uid() is null or p_error_id is null then
    return pg_catalog.jsonb_build_object('allowed',false);
  end if;
  v_scope:=finance_private.resolve_integration_retry_scope(p_error_id);
  if v_scope is null then return pg_catalog.jsonb_build_object('allowed',false);end if;
  begin
    v_legal_entity_id:=(v_scope->>'legalEntityId')::uuid;
    v_dealer_account_id:=(v_scope->>'dealerAccountId')::uuid;
    v_branch_id:=(v_scope->>'branchId')::uuid;
  exception when others then return pg_catalog.jsonb_build_object('allowed',false);end;
  if not finance_private.current_actor_can_retry_integration_error(auth.uid(),v_legal_entity_id,v_dealer_account_id,v_branch_id)
     or not finance_private.integration_retry_error_is_in_scope(p_error_id,v_legal_entity_id,v_dealer_account_id,v_branch_id) then
    return pg_catalog.jsonb_build_object('allowed',false);
  end if;
  return pg_catalog.jsonb_build_object('allowed',true,'legalEntityId',v_legal_entity_id,'dealerAccountId',v_dealer_account_id,'branchId',v_branch_id);
end $$;

create or replace function finance_api.commit_integration_error_retry(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_error_id uuid,p_reason_code text,p_resolution_note_hash text,p_expected_version bigint,
  p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb language plpgsql security definer
set search_path=pg_catalog,finance,finance_private
as $$
declare
  v_error finance.integration_errors%rowtype;
  v_existing record;
  v_job_id uuid:=gen_random_uuid();
  v_new_version bigint;
  v_payload jsonb;
  v_payload_hash text;
  v_previous_hash text;
  v_audit_hash text;
begin
  if not finance_private.current_integration_retry_committer_is_trusted() then
    raise exception using errcode='42501',message='trusted integration retry committer required';
  end if;
  if p_actor_id is null or p_error_id is null or p_correlation_id is null
     or p_expected_version<1
     or pg_catalog.btrim(coalesce(p_reason_code,''))=''
     or pg_catalog.length(p_reason_code)>100
     or p_resolution_note_hash !~ '^[a-fA-F0-9]{64}$'
     or pg_catalog.length(pg_catalog.btrim(coalesce(p_idempotency_key,''))) not between 8 and 200
     or p_intent_hash !~ '^[a-fA-F0-9]{64}$' then
    raise exception using errcode='22023',message='invalid integration retry command';
  end if;

  select om.id,om.payload
    into v_existing
    from finance.outbox_messages om
   where om.topic='finance.integration-retry'
     and om.aggregate_type='integration_error'
     and om.aggregate_id=p_error_id
     and om.payload->>'idempotencyKey'=p_idempotency_key
   order by om.created_at_utc desc,om.id desc limit 1;
  if found then
    if v_existing.payload->>'intentHash'=p_intent_hash then
      return pg_catalog.jsonb_build_object(
        'outcome','REPLAY','jobId',v_existing.id,'errorId',p_error_id,
        'status','QUEUED','version',(v_existing.payload->>'errorVersion')::bigint
      );
    end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','errorId',p_error_id);
  end if;

  select * into v_error from finance.integration_errors
   where id=p_error_id and legal_entity_id=p_legal_entity_id for update;
  if not found
     or not finance_private.integration_retry_error_is_in_scope(p_error_id,p_legal_entity_id,p_dealer_account_id,p_branch_id) then
    raise exception using errcode='42501',message='integration error scope denied';
  end if;
  if v_error.version<>p_expected_version or v_error.status<>'OPEN'
     or v_error.redacted_detail->>'retryable'<>'true' then
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','errorId',p_error_id);
  end if;

  update finance.integration_errors
     set status='RETRY_SCHEDULED',version=version+1,correlation_id=p_correlation_id
   where id=v_error.id and version=p_expected_version and status='OPEN'
   returning version into v_new_version;
  if not found then return pg_catalog.jsonb_build_object('outcome','CONFLICT','errorId',p_error_id); end if;

  v_payload:=pg_catalog.jsonb_build_object(
    'errorId',v_error.id,'sourceType',v_error.source_type,'sourceId',v_error.source_id,
    'reasonCode',p_reason_code,'resolutionNoteHash',p_resolution_note_hash,
    'errorVersion',v_new_version,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash,
    'legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id
  );
  v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  insert into finance.outbox_messages(
    id,legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,
    payload,payload_hash,status,correlation_id
  ) values(
    v_job_id,p_legal_entity_id,'finance.integration-retry','INTEGRATION_RETRY_REQUESTED',
    'integration_error',v_error.id,v_new_version,v_payload,v_payload_hash,'PENDING',p_correlation_id
  );

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));
  select ae.integrity_hash into v_previous_hash from finance.audit_events ae
   where ae.legal_entity_id=p_legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;
  v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(
    coalesce(v_previous_hash,'GENESIS')||':'||v_error.id::text||':INTEGRATION_RETRY_REQUESTED:'||p_intent_hash||':'||p_correlation_id::text,
    'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(
    legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,
    before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id
  ) values(
    p_legal_entity_id,p_actor_id,'USER','INTEGRATION_RETRY_REQUESTED','integration_error',v_error.id,'ALLOW',
    v_error.error_fingerprint,p_intent_hash,v_previous_hash,v_audit_hash,
    pg_catalog.jsonb_build_object('dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'reasonCode',p_reason_code,'resolutionNoteHash',p_resolution_note_hash,'jobId',v_job_id),
    p_correlation_id
  );
  return pg_catalog.jsonb_build_object(
    'outcome','QUEUED','jobId',v_job_id,'errorId',v_error.id,'status','QUEUED','version',v_new_version
  );
end $$;

revoke all on function finance_private.current_actor_can_retry_integration_error(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.integration_retry_error_is_in_scope(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.resolve_integration_retry_scope(uuid) from public,anon,authenticated;
revoke all on function finance_private.current_integration_retry_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_api.authorize_integration_error_retry_scope(uuid,text) from public,anon;
grant execute on function finance_api.authorize_integration_error_retry_scope(uuid,text) to authenticated;
revoke all on function finance_api.commit_integration_error_retry(uuid,uuid,uuid,uuid,uuid,text,text,bigint,text,text,uuid) from public,anon,authenticated;
