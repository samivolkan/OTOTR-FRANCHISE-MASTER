-- Governed dispute SLA policy lifecycle. Commercial durations are supplied by an authorized maker
-- and become effective only after an independent GENERAL_MANAGER/CEO checker publishes the draft.

create or replace function finance_private.current_dispute_sla_policy_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$
 select coalesce(pg_catalog.current_setting('request.jwt.claim.role',true),'')='service_role'
$$;

create or replace function finance_private.current_actor_can_manage_dispute_sla_policy(
 p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_permission text
)returns boolean language plpgsql stable security definer set search_path=pg_catalog,public,finance_private as $$
declare u public.app_users%rowtype;
begin
 if p_permission not in('finance.dispute-sla.draft','finance.dispute-sla.publish')then return false;end if;
 select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
 if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE')then return false;end if;
 if p_permission='finance.dispute-sla.publish'and u.role not in('CEO','GENERAL_MANAGER')then return false;end if;
 return finance_private.current_actor_can_read_scope(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDispute');
end$$;

create or replace function finance_api.authorize_dispute_sla_policy_action(
 p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_permission text
)returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance_private as $$
begin
 if auth.uid()is null or not finance_private.current_actor_can_manage_dispute_sla_policy(auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id,p_permission)then return pg_catalog.jsonb_build_object('allowed',false);end if;
 return pg_catalog.jsonb_build_object('allowed',true,'legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id);
end$$;

create or replace function finance_api.commit_dispute_sla_policy_draft(
 p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_response_minutes integer,p_resolution_minutes integer,p_owner_role text,p_effective_from date,p_effective_to date,p_reason_code text,p_note_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
)returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private,extensions as $$
declare v_id uuid;v_no integer;v_previous text;v_audit text;v_existing jsonb;
begin
 if not finance_private.current_dispute_sla_policy_committer_is_trusted()or not finance_private.current_actor_can_manage_dispute_sla_policy(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id,'finance.dispute-sla.draft')then raise exception using errcode='42501',message='trusted SLA policy maker required';end if;
 if p_response_minutes not between 1 and 43200 or p_resolution_minutes not between p_response_minutes and 129600 or p_owner_role not in('FINANCE','GENERAL_MANAGER')or p_effective_from is null or(p_effective_to is not null and p_effective_from>=p_effective_to)or p_reason_code!~'^[A-Z][A-Z0-9_]{2,63}$'or p_note_hash!~'^[a-f0-9]{64}$'or p_intent_hash!~'^[a-f0-9]{64}$'or pg_catalog.length(p_idempotency_key)not between 8 and 200 then raise exception using errcode='22023',message='invalid dispute SLA policy draft';end if;
 select safe_context into v_existing from finance.audit_events where legal_entity_id=p_legal_entity_id and action_code='DISPUTE_SLA_POLICY_DRAFTED'and safe_context->>'idempotencyKey'=p_idempotency_key order by created_at_utc desc,id desc limit 1;
 if found then return pg_catalog.jsonb_build_object('outcome',case when v_existing->>'intentHash'=p_intent_hash then'REPLAY'else'CONFLICT'end,'policyId',v_existing->>'policyId','versionNo',(v_existing->>'versionNo')::integer,'status','DRAFT','version',1);end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('dispute-sla:'||p_legal_entity_id::text,0));
 select coalesce(pg_catalog.max(version_no),0)+1 into v_no from finance.dispute_sla_policies where legal_entity_id=p_legal_entity_id and policy_code='DISPUTE_REVIEW';
 insert into finance.dispute_sla_policies(legal_entity_id,policy_code,version_no,clock_type,response_minutes,resolution_minutes,owner_role,effective_from,effective_to,status,created_by,correlation_id)values(p_legal_entity_id,'DISPUTE_REVIEW',v_no,'CALENDAR_MINUTES',p_response_minutes,p_resolution_minutes,p_owner_role,p_effective_from,p_effective_to,'DRAFT',p_actor_id,p_correlation_id)returning id into v_id;
 select integrity_hash into v_previous from finance.audit_events where legal_entity_id=p_legal_entity_id order by created_at_utc desc,id desc limit 1;
 v_audit:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous,'GENESIS')||':'||v_id::text||':DISPUTE_SLA_POLICY_DRAFTED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
 insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)values(p_legal_entity_id,p_actor_id,'USER','DISPUTE_SLA_POLICY_DRAFTED','dispute_sla_policy',v_id,'ALLOW',p_reason_code,p_intent_hash,v_previous,v_audit,pg_catalog.jsonb_build_object('policyId',v_id,'versionNo',v_no,'responseMinutes',p_response_minutes,'resolutionMinutes',p_resolution_minutes,'ownerRole',p_owner_role,'effectiveFrom',p_effective_from,'effectiveTo',p_effective_to,'noteHash',p_note_hash,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash),p_correlation_id);
 return pg_catalog.jsonb_build_object('outcome','CREATED','policyId',v_id,'versionNo',v_no,'status','DRAFT','version',1);
end$$;

create or replace function finance_api.commit_dispute_sla_policy_publish(
 p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_policy_id uuid,p_expected_version bigint,p_reason_code text,p_note_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
)returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private,extensions as $$
declare p finance.dispute_sla_policies%rowtype;v_previous text;v_audit text;v_existing jsonb;
begin
 if not finance_private.current_dispute_sla_policy_committer_is_trusted()or not finance_private.current_actor_can_manage_dispute_sla_policy(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id,'finance.dispute-sla.publish')then raise exception using errcode='42501',message='trusted independent SLA policy checker required';end if;
 if p_reason_code!~'^[A-Z][A-Z0-9_]{2,63}$'or p_note_hash!~'^[a-f0-9]{64}$'or p_intent_hash!~'^[a-f0-9]{64}$'or pg_catalog.length(p_idempotency_key)not between 8 and 200 then raise exception using errcode='22023',message='invalid dispute SLA policy publication';end if;
 select safe_context into v_existing from finance.audit_events where legal_entity_id=p_legal_entity_id and subject_id=p_policy_id and action_code='DISPUTE_SLA_POLICY_PUBLISHED'and safe_context->>'idempotencyKey'=p_idempotency_key order by created_at_utc desc,id desc limit 1;
 if found then return pg_catalog.jsonb_build_object('outcome',case when v_existing->>'intentHash'=p_intent_hash then'REPLAY'else'CONFLICT'end,'policyId',p_policy_id,'versionNo',(v_existing->>'versionNo')::integer,'status','PUBLISHED','version',(v_existing->>'version')::bigint);end if;
 select * into p from finance.dispute_sla_policies where id=p_policy_id and legal_entity_id=p_legal_entity_id for update;
 if not found then raise exception using errcode='P0002',message='SLA policy not found';end if;
 if p.created_by=p_actor_id then raise exception using errcode='42501',message='SLA policy maker cannot publish own draft';end if;
 if p.status<>'DRAFT'or p.version<>p_expected_version then return pg_catalog.jsonb_build_object('outcome','CONFLICT','policyId',p.id,'status',p.status,'version',p.version);end if;
 update finance.dispute_sla_policies set status='SUPERSEDED',effective_to=case when effective_to is null or effective_to>p.effective_from then p.effective_from else effective_to end,version=version+1,correlation_id=p_correlation_id where legal_entity_id=p_legal_entity_id and policy_code='DISPUTE_REVIEW'and status='PUBLISHED';
 update finance.dispute_sla_policies set status='PUBLISHED',approved_by=p_actor_id,approved_at_utc=pg_catalog.clock_timestamp(),version=version+1,correlation_id=p_correlation_id where id=p.id returning * into p;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));select integrity_hash into v_previous from finance.audit_events where legal_entity_id=p_legal_entity_id order by created_at_utc desc,id desc limit 1;
 v_audit:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous,'GENESIS')||':'||p.id::text||':DISPUTE_SLA_POLICY_PUBLISHED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
 insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)values(p_legal_entity_id,p_actor_id,'USER','DISPUTE_SLA_POLICY_PUBLISHED','dispute_sla_policy',p.id,'ALLOW',p_reason_code,p_note_hash,p_intent_hash,v_previous,v_audit,pg_catalog.jsonb_build_object('policyId',p.id,'versionNo',p.version_no,'responseMinutes',p.response_minutes,'resolutionMinutes',p.resolution_minutes,'ownerRole',p.owner_role,'effectiveFrom',p.effective_from,'effectiveTo',p.effective_to,'makerId',p.created_by,'checkerId',p_actor_id,'noteHash',p_note_hash,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash,'version',p.version),p_correlation_id);
 return pg_catalog.jsonb_build_object('outcome','PUBLISHED','policyId',p.id,'versionNo',p.version_no,'status',p.status,'version',p.version,'makerId',p.created_by,'checkerId',p_actor_id);
end$$;

create or replace function finance_api.get_dispute_sla_policy_state(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private as $$
declare p finance.dispute_sla_policies%rowtype;
begin
 if auth.uid()is null or not finance_private.current_actor_can_manage_dispute_sla_policy(auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id,'finance.dispute-sla.draft')then raise exception using errcode='42501',message='SLA policy scope denied';end if;
 select * into p from finance.dispute_sla_policies where legal_entity_id=p_legal_entity_id and policy_code='DISPUTE_REVIEW'order by case status when'PUBLISHED'then 0 when'DRAFT'then 1 else 2 end,version_no desc limit 1;
 if not found then return pg_catalog.jsonb_build_object('configured',false,'policyCode','DISPUTE_REVIEW');end if;
 return pg_catalog.jsonb_build_object('configured',true,'policyId',p.id,'policyCode',p.policy_code,'versionNo',p.version_no,'clockType',p.clock_type,'responseMinutes',p.response_minutes,'resolutionMinutes',p.resolution_minutes,'ownerRole',p.owner_role,'effectiveFrom',p.effective_from,'effectiveTo',p.effective_to,'status',p.status,'makerId',p.created_by,'checkerId',p.approved_by,'approvedAtUtc',p.approved_at_utc,'version',p.version,'rawRecordsExposed',false);
end$$;

revoke all on function finance_private.current_dispute_sla_policy_committer_is_trusted()from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_manage_dispute_sla_policy(uuid,uuid,uuid,uuid,text)from public,anon,authenticated;
revoke all on function finance_api.authorize_dispute_sla_policy_action(uuid,uuid,uuid,text)from public,anon;
revoke all on function finance_api.commit_dispute_sla_policy_draft(uuid,uuid,uuid,uuid,integer,integer,text,date,date,text,text,text,text,uuid)from public,anon,authenticated;
revoke all on function finance_api.commit_dispute_sla_policy_publish(uuid,uuid,uuid,uuid,uuid,bigint,text,text,text,text,uuid)from public,anon,authenticated;
revoke all on function finance_api.get_dispute_sla_policy_state(uuid,uuid,uuid)from public,anon;
grant execute on function finance_api.authorize_dispute_sla_policy_action(uuid,uuid,uuid,text),finance_api.get_dispute_sla_policy_state(uuid,uuid,uuid)to authenticated;
grant execute on function finance_api.commit_dispute_sla_policy_draft(uuid,uuid,uuid,uuid,integer,integer,text,date,date,text,text,text,text,uuid),finance_api.commit_dispute_sla_policy_publish(uuid,uuid,uuid,uuid,uuid,bigint,text,text,text,text,uuid)to service_role;
