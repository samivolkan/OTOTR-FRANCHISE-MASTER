-- Governed integration error assignment and resolution commands.
-- Policy: INTEGRATION_ERROR_ACTION_V1.

create or replace function finance_api.authorize_integration_error_action_scope(p_error_id uuid,p_permission text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_scope jsonb;v_legal uuid;v_account uuid;v_branch uuid;
begin
 if p_permission not in('finance.integration-errors.assign','finance.integration-errors.resolve') or auth.uid() is null or p_error_id is null then return pg_catalog.jsonb_build_object('allowed',false);end if;
 v_scope:=finance_private.resolve_integration_retry_scope(p_error_id);if v_scope is null then return pg_catalog.jsonb_build_object('allowed',false);end if;
 begin v_legal:=(v_scope->>'legalEntityId')::uuid;v_account:=(v_scope->>'dealerAccountId')::uuid;v_branch:=(v_scope->>'branchId')::uuid;exception when others then return pg_catalog.jsonb_build_object('allowed',false);end;
 if not finance_private.current_actor_can_retry_integration_error(auth.uid(),v_legal,v_account,v_branch) or not finance_private.integration_retry_error_is_in_scope(p_error_id,v_legal,v_account,v_branch) then return pg_catalog.jsonb_build_object('allowed',false);end if;
 return pg_catalog.jsonb_build_object('allowed',true,'legalEntityId',v_legal,'dealerAccountId',v_account,'branchId',v_branch);
end$$;

create or replace function finance_api.commit_integration_error_assignment(
 p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_error_id uuid,p_owner_role text,p_reason_code text,p_note_hash text,p_expected_version bigint,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
)returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private as $$
declare e finance.integration_errors%rowtype;v_new bigint;v_previous text;v_audit text;v_existing jsonb;
begin
 if not finance_private.current_integration_retry_committer_is_trusted()then raise exception using errcode='42501',message='trusted integration action committer required';end if;
 if p_owner_role not in('FINANCE_OPERATIONS','ERP_INTEGRATION','BRANCH_OPERATIONS')or p_reason_code!~'^[A-Z][A-Z0-9_]{2,63}$'or p_note_hash!~'^[a-f0-9]{64}$'or p_intent_hash!~'^[a-f0-9]{64}$'or pg_catalog.length(p_idempotency_key)not between 8 and 200 then raise exception using errcode='22023',message='invalid integration assignment command';end if;
 select safe_context into v_existing from finance.audit_events where legal_entity_id=p_legal_entity_id and subject_type='integration_error'and subject_id=p_error_id and action_code='INTEGRATION_ERROR_ASSIGNED'and safe_context->>'idempotencyKey'=p_idempotency_key order by created_at_utc desc limit 1;
 if found then return pg_catalog.jsonb_build_object('outcome',case when v_existing->>'intentHash'=p_intent_hash then'REPLAY'else'CONFLICT'end,'errorId',p_error_id,'status',v_existing->>'status','version',(v_existing->>'version')::bigint,'ownerRole',v_existing->>'ownerRole');end if;
 select * into e from finance.integration_errors where id=p_error_id and legal_entity_id=p_legal_entity_id for update;
 if not found or not finance_private.integration_retry_error_is_in_scope(p_error_id,p_legal_entity_id,p_dealer_account_id,p_branch_id)then raise exception using errcode='42501',message='integration error scope denied';end if;
 if e.version<>p_expected_version or e.status not in('OPEN','RETRY_SCHEDULED')then return pg_catalog.jsonb_build_object('outcome','CONFLICT','errorId',p_error_id);end if;
 update finance.integration_errors set redacted_detail=redacted_detail||pg_catalog.jsonb_build_object('ownerRole',p_owner_role,'actionPolicyVersion','INTEGRATION_ERROR_ACTION_V1'),version=version+1,correlation_id=p_correlation_id where id=e.id returning version into v_new;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));select integrity_hash into v_previous from finance.audit_events where legal_entity_id=p_legal_entity_id order by created_at_utc desc,id desc limit 1;
 v_audit:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous,'GENESIS')||':'||e.id::text||':INTEGRATION_ERROR_ASSIGNED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
 insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)values(p_legal_entity_id,p_actor_id,'USER','INTEGRATION_ERROR_ASSIGNED','integration_error',e.id,'ALLOW',p_reason_code,e.error_fingerprint,p_intent_hash,v_previous,v_audit,pg_catalog.jsonb_build_object('dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'ownerRole',p_owner_role,'noteHash',p_note_hash,'policyVersion','INTEGRATION_ERROR_ACTION_V1','idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash,'status',e.status,'version',v_new),p_correlation_id);
 return pg_catalog.jsonb_build_object('outcome','ASSIGNED','errorId',e.id,'status',e.status,'version',v_new,'ownerRole',p_owner_role,'policyVersion','INTEGRATION_ERROR_ACTION_V1');
end$$;

create or replace function finance_api.commit_integration_error_resolution(
 p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_error_id uuid,p_resolution_code text,p_note_hash text,p_expected_version bigint,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
)returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private as $$
declare e finance.integration_errors%rowtype;v_new bigint;v_previous text;v_audit text;v_existing jsonb;v_dead boolean;
begin
 if not finance_private.current_integration_retry_committer_is_trusted()then raise exception using errcode='42501',message='trusted integration action committer required';end if;
 if p_resolution_code not in('FIXED_EXTERNALLY','DATA_CORRECTED','SUPERSEDED','FALSE_POSITIVE')or p_note_hash!~'^[a-f0-9]{64}$'or p_intent_hash!~'^[a-f0-9]{64}$'or pg_catalog.length(p_idempotency_key)not between 8 and 200 then raise exception using errcode='22023',message='invalid integration resolution command';end if;
 select safe_context into v_existing from finance.audit_events where legal_entity_id=p_legal_entity_id and subject_type='integration_error'and subject_id=p_error_id and action_code='INTEGRATION_ERROR_RESOLVED'and safe_context->>'idempotencyKey'=p_idempotency_key order by created_at_utc desc limit 1;
 if found then return pg_catalog.jsonb_build_object('outcome',case when v_existing->>'intentHash'=p_intent_hash then'REPLAY'else'CONFLICT'end,'errorId',p_error_id,'status','RESOLVED','version',(v_existing->>'version')::bigint);end if;
 select * into e from finance.integration_errors where id=p_error_id and legal_entity_id=p_legal_entity_id for update;
 if not found or not finance_private.integration_retry_error_is_in_scope(p_error_id,p_legal_entity_id,p_dealer_account_id,p_branch_id)then raise exception using errcode='42501',message='integration error scope denied';end if;
 if e.version<>p_expected_version or e.status not in('OPEN','RETRY_SCHEDULED')then return pg_catalog.jsonb_build_object('outcome','CONFLICT','errorId',p_error_id);end if;
 select exists(select 1 from finance.outbox_messages o where e.source_type='OUTBOX'and o.id=e.source_id and o.status='DEAD_LETTER')into v_dead;
 if v_dead and p_resolution_code not in('FIXED_EXTERNALLY','DATA_CORRECTED')then raise exception using errcode='23514',message='dead-letter resolution policy denied';end if;
 update finance.integration_errors set status='RESOLVED',redacted_detail=redacted_detail||pg_catalog.jsonb_build_object('resolutionCode',p_resolution_code,'actionPolicyVersion','INTEGRATION_ERROR_ACTION_V1'),version=version+1,correlation_id=p_correlation_id where id=e.id returning version into v_new;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));select integrity_hash into v_previous from finance.audit_events where legal_entity_id=p_legal_entity_id order by created_at_utc desc,id desc limit 1;
 v_audit:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous,'GENESIS')||':'||e.id::text||':INTEGRATION_ERROR_RESOLVED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
 insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)values(p_legal_entity_id,p_actor_id,'USER','INTEGRATION_ERROR_RESOLVED','integration_error',e.id,'ALLOW',p_resolution_code,e.error_fingerprint,p_intent_hash,v_previous,v_audit,pg_catalog.jsonb_build_object('dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'noteHash',p_note_hash,'policyVersion','INTEGRATION_ERROR_ACTION_V1','idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash,'previousStatus',e.status,'version',v_new,'deadLetter',v_dead),p_correlation_id);
 return pg_catalog.jsonb_build_object('outcome','RESOLVED','errorId',e.id,'status','RESOLVED','version',v_new,'resolutionCode',p_resolution_code,'policyVersion','INTEGRATION_ERROR_ACTION_V1');
end$$;

revoke all on function finance_api.authorize_integration_error_action_scope(uuid,text)from public,anon;
grant execute on function finance_api.authorize_integration_error_action_scope(uuid,text)to authenticated;
revoke all on function finance_api.commit_integration_error_assignment(uuid,uuid,uuid,uuid,uuid,text,text,text,bigint,text,text,uuid)from public,anon,authenticated;
revoke all on function finance_api.commit_integration_error_resolution(uuid,uuid,uuid,uuid,uuid,text,text,bigint,text,text,uuid)from public,anon,authenticated;
grant execute on function finance_api.commit_integration_error_assignment(uuid,uuid,uuid,uuid,uuid,text,text,text,bigint,text,text,uuid)to service_role;
grant execute on function finance_api.commit_integration_error_resolution(uuid,uuid,uuid,uuid,uuid,text,text,bigint,text,text,uuid)to service_role;
