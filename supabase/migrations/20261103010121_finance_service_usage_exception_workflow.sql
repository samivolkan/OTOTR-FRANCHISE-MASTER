-- Maker-checker workflow for a single service usage exception.
-- Exceptions are source-reference and branch scoped; charged usages must use the dispute/correction flow.

create or replace function finance_api.authorize_service_usage_exception(
 p_source_event_id uuid,p_fee_rule_id uuid,p_permission text
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare u public.app_users%rowtype;r record;
begin
 if auth.uid() is null or p_permission not in('finance.service-usage-exceptions.request','finance.service-usage-exceptions.approve')then return null;end if;
 select * into u from public.app_users where auth_user_id=auth.uid() and is_active limit 1;
 if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE')then return null;end if;
 select se.legal_entity_id,da.id dealer_account_id,se.branch_id,se.dealer_legal_entity_id
 into r from finance.source_events se
 join finance.dealer_accounts da on da.legal_entity_id=se.legal_entity_id and da.dealer_legal_entity_id=se.dealer_legal_entity_id and da.status in('SHADOW','ACTIVE')
 join finance.contract_fee_rules cfr on cfr.id=p_fee_rule_id and cfr.status='ACTIVE'
 join finance.contract_versions cv on cv.id=cfr.contract_version_id and cv.status='ACTIVE'
 join finance.franchise_contracts fc on fc.id=cv.contract_id and fc.legal_entity_id=se.legal_entity_id and fc.dealer_legal_entity_id=se.dealer_legal_entity_id and fc.status='ACTIVE'
 where se.id=p_source_event_id and se.event_type in('query.completed','external-service.delivered');
 if not found or not finance_private.current_actor_can_read_scope(auth.uid(),r.legal_entity_id,r.dealer_account_id,r.branch_id,'listServiceUsages')then return null;end if;
 return pg_catalog.jsonb_build_object('allowed',true,'legalEntityId',r.legal_entity_id,'dealerLegalEntityId',r.dealer_legal_entity_id,'dealerAccountId',r.dealer_account_id,'branchId',r.branch_id);
end$$;

create or replace function finance_private.current_service_usage_exception_committer_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$
 select coalesce(pg_catalog.current_setting('request.jwt.claim.role',true),'')='service_role'
$$;

create or replace function finance_api.commit_service_usage_exception_request(
 p_actor_id uuid,p_legal_entity_id uuid,p_dealer_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
 p_source_event_id uuid,p_fee_rule_id uuid,p_override jsonb,p_reason_code text,p_note_hash text,p_evidence_hash text,
 p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare se finance.source_events%rowtype;v_exception uuid;v_request uuid;v_snapshot jsonb;v_snapshot_hash text;v_payload jsonb;v_existing jsonb;v_previous text;v_audit text;v_code text;
begin
 if not finance_private.current_service_usage_exception_committer_is_trusted()then raise exception using errcode='42501',message='trusted service usage exception committer required';end if;
 if p_reason_code!~'^[A-Z][A-Z0-9_]{2,63}$'or p_note_hash!~'^[a-f0-9]{64}$'or p_evidence_hash!~'^[a-f0-9]{64}$'or p_intent_hash!~'^[a-f0-9]{64}$'or pg_catalog.length(pg_catalog.btrim(coalesce(p_idempotency_key,'')))not between 8 and 200 then raise exception using errcode='22023',message='invalid service usage exception request';end if;
 if pg_catalog.jsonb_typeof(p_override)<>'object'or p_override->>'type' not in('EXEMPT','FIXED_AMOUNT_OVERRIDE','RATE_OVERRIDE')then raise exception using errcode='22023',message='invalid service usage exception override';end if;
 if p_override->>'type'='FIXED_AMOUNT_OVERRIDE'and coalesce(p_override->>'amount','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$'then raise exception using errcode='22023',message='invalid fixed amount override';end if;
 if p_override->>'type'='RATE_OVERRIDE'and coalesce(p_override->>'rate','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$'then raise exception using errcode='22023',message='invalid rate override';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('service-usage-exception:'||p_source_event_id::text||':'||p_idempotency_key,0));
 select payload into v_existing from finance.outbox_messages where legal_entity_id=p_legal_entity_id and event_type='SERVICE_USAGE_EXCEPTION_REQUESTED'and aggregate_id=p_source_event_id and payload->>'idempotencyKey'=p_idempotency_key order by created_at_utc desc,id desc limit 1;
 if found then if v_existing->>'intentHash'=p_intent_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','exceptionId',v_existing->>'exceptionId','approvalRequestId',v_existing->>'approvalRequestId','status','PENDING_APPROVAL');end if;return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
 select * into se from finance.source_events where id=p_source_event_id and legal_entity_id=p_legal_entity_id and dealer_legal_entity_id=p_dealer_legal_entity_id and branch_id=p_branch_id and event_type in('query.completed','external-service.delivered')for update;
 if not found or not exists(select 1 from finance.dealer_accounts where id=p_dealer_account_id and legal_entity_id=p_legal_entity_id and dealer_legal_entity_id=p_dealer_legal_entity_id)then raise exception using errcode='42501',message='service usage exception scope denied';end if;
 if exists(select 1 from finance.calculation_runs cr join finance.accruals a on a.calculation_run_id=cr.id and a.status='POSTED'where cr.source_event_id=se.id)then raise exception using errcode='23514',message='charged service usage requires dispute correction flow';end if;
 if not exists(select 1 from finance.contract_fee_rules cfr join finance.contract_versions cv on cv.id=cfr.contract_version_id join finance.franchise_contracts fc on fc.id=cv.contract_id where cfr.id=p_fee_rule_id and cfr.status='ACTIVE'and cv.status='ACTIVE'and fc.status='ACTIVE'and fc.legal_entity_id=p_legal_entity_id and fc.dealer_legal_entity_id=p_dealer_legal_entity_id)then raise exception using errcode='23514',message='active service fee rule required';end if;
 if coalesce(se.payload->>'externalReference','')=''then raise exception using errcode='23514',message='service usage external reference required';end if;
 v_code:='USAGE_'||pg_catalog.replace(se.id::text,'-','');
 insert into finance.rule_exceptions(contract_fee_rule_id,exception_code,scope_definition,condition_definition,override_definition,priority,effective_from,effective_to,status,prepared_by,created_by,correlation_id)
 values(p_fee_rule_id,v_code,pg_catalog.jsonb_build_object('type','BRANCH','branchId',p_branch_id),pg_catalog.jsonb_build_object('type','SOURCE_ATTRIBUTE','field','externalReference','equals',se.payload->>'externalReference'),p_override,100000,se.business_date,se.business_date+1,'PENDING_APPROVAL',p_actor_id,p_actor_id,p_correlation_id)returning id into v_exception;
 v_snapshot:=pg_catalog.jsonb_build_object('exceptionId',v_exception,'sourceEventId',se.id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'sourcePayloadHash',se.payload_hash,'feeRuleId',p_fee_rule_id,'externalReferenceHash',pg_catalog.encode(extensions.digest(pg_catalog.convert_to(se.payload->>'externalReference','UTF8'),'sha256'),'hex'),'override',p_override,'reasonCode',p_reason_code,'noteHash',p_note_hash,'evidenceHash',p_evidence_hash);
 v_snapshot_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_snapshot::text,'UTF8'),'sha256'),'hex');
 insert into finance.approval_requests(legal_entity_id,subject_type,subject_id,approval_policy_version,prepared_by,subject_snapshot,subject_snapshot_hash,status,version,created_by,correlation_id)values(p_legal_entity_id,'SERVICE_USAGE_EXCEPTION',v_exception,'SERVICE_USAGE_EXCEPTION_V1',p_actor_id,v_snapshot,v_snapshot_hash,'PENDING',1,p_actor_id,p_correlation_id)returning id into v_request;
 insert into finance.approval_steps(approval_request_id,step_no,required_role,created_by,correlation_id)values(v_request,1,'finance-service-usage-exception-approver',p_actor_id,p_correlation_id);
 v_payload:=pg_catalog.jsonb_build_object('exceptionId',v_exception,'approvalRequestId',v_request,'sourceEventId',se.id,'snapshotHash',v_snapshot_hash,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash);
 insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)values(p_legal_entity_id,'finance.service-usage','SERVICE_USAGE_EXCEPTION_REQUESTED','SERVICE_USAGE',se.id,1,v_payload,v_snapshot_hash,'PENDING',p_correlation_id);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));select integrity_hash into v_previous from finance.audit_events where legal_entity_id=p_legal_entity_id order by created_at_utc desc,id desc limit 1;v_audit:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous,'GENESIS')||':'||v_exception::text||':SERVICE_USAGE_EXCEPTION_REQUESTED:'||v_snapshot_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
 insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)values(p_legal_entity_id,p_actor_id,'USER','SERVICE_USAGE_EXCEPTION_REQUESTED','RULE_EXCEPTION',v_exception,'ALLOW',p_reason_code,v_snapshot_hash,v_previous,v_audit,pg_catalog.jsonb_build_object('approvalRequestId',v_request,'sourceEventId',se.id,'feeRuleId',p_fee_rule_id,'branchId',p_branch_id,'noteHash',p_note_hash,'evidenceHash',p_evidence_hash),p_correlation_id);
 return pg_catalog.jsonb_build_object('outcome','SUBMITTED','exceptionId',v_exception,'approvalRequestId',v_request,'status','PENDING_APPROVAL','snapshotHash',v_snapshot_hash);
exception when unique_violation then return pg_catalog.jsonb_build_object('outcome','CONFLICT');
end$$;

create or replace function finance_api.commit_service_usage_exception_approval(
 p_actor_id uuid,p_legal_entity_id uuid,p_dealer_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_request_id uuid,p_expected_version bigint,p_reason_code text,p_note_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare ar finance.approval_requests%rowtype;re finance.rule_exceptions%rowtype;v_source uuid;v_payload jsonb;v_existing jsonb;v_previous text;v_audit text;
begin
 if not finance_private.current_service_usage_exception_committer_is_trusted()then raise exception using errcode='42501',message='trusted service usage exception committer required';end if;
 if p_expected_version<1 or p_reason_code!~'^[A-Z][A-Z0-9_]{2,63}$'or p_note_hash!~'^[a-f0-9]{64}$'or p_intent_hash!~'^[a-f0-9]{64}$'or pg_catalog.length(pg_catalog.btrim(coalesce(p_idempotency_key,'')))not between 8 and 200 then raise exception using errcode='22023',message='invalid service usage exception approval';end if;
 select payload into v_existing from finance.outbox_messages where legal_entity_id=p_legal_entity_id and event_type='SERVICE_USAGE_EXCEPTION_APPROVED'and payload->>'approvalRequestId'=p_request_id::text and payload->>'idempotencyKey'=p_idempotency_key order by created_at_utc desc,id desc limit 1;
 if found then if v_existing->>'intentHash'=p_intent_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','exceptionId',v_existing->>'exceptionId','approvalRequestId',p_request_id,'status','ACTIVE');end if;return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
 select * into ar from finance.approval_requests where id=p_request_id and legal_entity_id=p_legal_entity_id and subject_type='SERVICE_USAGE_EXCEPTION'for update;if not found then raise exception using errcode='P0002',message='service usage exception approval not found';end if;
 select * into re from finance.rule_exceptions where id=ar.subject_id for update;if ar.status<>'PENDING'or ar.version<>p_expected_version or re.status<>'PENDING_APPROVAL'or ar.prepared_by=p_actor_id then return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
 v_source:=(ar.subject_snapshot->>'sourceEventId')::uuid;
 if not exists(select 1 from finance.source_events se join finance.dealer_accounts da on da.id=p_dealer_account_id and da.legal_entity_id=se.legal_entity_id and da.dealer_legal_entity_id=se.dealer_legal_entity_id where se.id=v_source and se.legal_entity_id=p_legal_entity_id and se.dealer_legal_entity_id=p_dealer_legal_entity_id and se.branch_id=p_branch_id)then raise exception using errcode='42501',message='service usage exception approval scope denied';end if;
 update finance.rule_exceptions set status='ACTIVE',approved_by=p_actor_id,approved_at_utc=pg_catalog.now(),version=version+1,correlation_id=p_correlation_id where id=re.id;
 update finance.approval_requests set status='APPROVED',version=version+1,correlation_id=p_correlation_id where id=ar.id;
 update finance.approval_steps set decision='APPROVE',decided_by=p_actor_id,decided_at_utc=pg_catalog.now(),evidence_ref='reason:'||p_reason_code||':note-sha256:'||p_note_hash where approval_request_id=ar.id and step_no=1;
 v_payload:=pg_catalog.jsonb_build_object('exceptionId',re.id,'approvalRequestId',ar.id,'sourceEventId',v_source,'status','ACTIVE','version',re.version+1,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash);
 insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)values(p_legal_entity_id,'finance.service-usage','SERVICE_USAGE_EXCEPTION_APPROVED','RULE_EXCEPTION',re.id,re.version+1,v_payload,p_intent_hash,'PENDING',p_correlation_id);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));select integrity_hash into v_previous from finance.audit_events where legal_entity_id=p_legal_entity_id order by created_at_utc desc,id desc limit 1;v_audit:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous,'GENESIS')||':'||re.id::text||':SERVICE_USAGE_EXCEPTION_APPROVED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
 insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)values(p_legal_entity_id,p_actor_id,'USER','SERVICE_USAGE_EXCEPTION_APPROVED','RULE_EXCEPTION',re.id,'ALLOW',p_reason_code,ar.subject_snapshot_hash,p_intent_hash,v_previous,v_audit,pg_catalog.jsonb_build_object('approvalRequestId',ar.id,'sourceEventId',v_source,'branchId',p_branch_id,'noteHash',p_note_hash,'makerId',ar.prepared_by),p_correlation_id);
 return pg_catalog.jsonb_build_object('outcome','APPROVED','exceptionId',re.id,'approvalRequestId',ar.id,'status','ACTIVE','version',re.version+1);
end$$;

revoke all on function finance_api.authorize_service_usage_exception(uuid,uuid,text) from public,anon;
grant execute on function finance_api.authorize_service_usage_exception(uuid,uuid,text) to authenticated;
revoke all on function finance_private.current_service_usage_exception_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_api.commit_service_usage_exception_request(uuid,uuid,uuid,uuid,uuid,uuid,uuid,jsonb,text,text,text,text,text,uuid) from public,anon,authenticated;
revoke all on function finance_api.commit_service_usage_exception_approval(uuid,uuid,uuid,uuid,uuid,uuid,bigint,text,text,text,text,uuid) from public,anon,authenticated;
grant execute on function finance_api.commit_service_usage_exception_request(uuid,uuid,uuid,uuid,uuid,uuid,uuid,jsonb,text,text,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_service_usage_exception_approval(uuid,uuid,uuid,uuid,uuid,uuid,bigint,text,text,text,text,uuid) to service_role;

create or replace function finance_private.approval_work_item_projection(a finance.approval_requests)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private as $$
declare v_amount numeric;v_currency text;v_evidence integer:=0;v_risk text;v_screen text;v_operation text;
begin
 if a.subject_type='PASS_THROUGH_EXPENSE'then select e.distributable_amount,e.currency_code into v_amount,v_currency from finance.pass_through_expenses e where e.id=a.subject_id and e.legal_entity_id=a.legal_entity_id;v_screen:='SCR-10';v_operation:='approveExpense';
 elsif a.subject_type='DISPUTE_DECISION'then select d.disputed_amount,o.currency_code into v_amount,v_currency from finance.disputes d left join finance.open_items o on o.id=d.open_item_id where d.id=a.subject_id and d.legal_entity_id=a.legal_entity_id;v_screen:='SCR-11';v_operation:='decideDispute';
 elsif a.subject_type='CONTRACT_VERSION'then v_screen:='SCR-03';v_operation:='approveContractVersion';
 elsif a.subject_type in('FINANCE_PERIOD_REOPEN','FINANCE_PERIOD_CLOSE')then v_screen:='SCR-12';v_operation:=case when a.subject_type='FINANCE_PERIOD_REOPEN'then'approveFinancePeriodReopen'else'approveFinancePeriodClose'end;
 elsif a.subject_type='SERVICE_USAGE_EXCEPTION'then v_screen:='SCR-09';v_operation:='approveServiceUsageException';
 end if;
 select count(*)into v_evidence from finance.document_links dl where dl.legal_entity_id=a.legal_entity_id and((dl.subject_type=a.subject_type and dl.subject_id=a.subject_id)or(dl.subject_type=a.subject_type and dl.subject_id=a.id));
 v_risk:=case when a.subject_type in('FINANCE_PERIOD_REOPEN','FINANCE_PERIOD_CLOSE')then'CRITICAL'when a.subject_type in('CONTRACT_VERSION','SERVICE_USAGE_EXCEPTION')then'HIGH'when coalesce(v_amount,0)>=100000 then'HIGH'when coalesce(v_amount,0)>=25000 then'MEDIUM'else'LOW'end;
 return pg_catalog.jsonb_build_object('requestId',a.id,'sourceEventId',case when a.subject_type='SERVICE_USAGE_EXCEPTION'then a.subject_snapshot->>'sourceEventId'end,'feeRuleId',case when a.subject_type='SERVICE_USAGE_EXCEPTION'then a.subject_snapshot->>'feeRuleId'end,'subjectType',a.subject_type,'subjectId',a.subject_id,'policyVersion',a.approval_policy_version,'status',a.status,'preparedBy',a.prepared_by,'createdAtUtc',a.created_at_utc,'correlationId',a.correlation_id,'version',a.version,'riskLevel',v_risk,'amount',case when v_amount is null then null else v_amount::text end,'currency',v_currency,'evidenceCount',v_evidence,'action',pg_catalog.jsonb_build_object('screenId',v_screen,'operationId',v_operation,'available',a.status='PENDING'and v_screen is not null and v_operation is not null),'rawSnapshotExposed',false,'rawEvidenceReferenceExposed',false);
end$$;
revoke all on function finance_private.approval_work_item_projection(finance.approval_requests) from public,anon,authenticated;
