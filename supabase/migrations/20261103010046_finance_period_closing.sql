-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-period-closing-rpc.sql
-- Source SHA256: 797DA67478661A8CBE68C7C00F78D5DA3EC0FE343B6236E75601C102819E2649
-- Local replay required before any staging promotion.
-- OTOTR FINANCE PERIOD CLOSING RPC CANDIDATE (TX-08)

create or replace function finance_private.current_period_closing_worker_is_trusted()
returns boolean language sql stable security definer set search_path = '' as $$ select false $$;
create or replace function finance_private.current_actor_can_close_period(p_actor_id uuid,p_period_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$ select false $$;
-- Must be replaced by a reviewed adapter that resolves period-scoped integration failures, blocking disputes and pending mandatory approvals.
create or replace function finance_private.period_has_unresolved_blocking_exception(p_period_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$ select true $$;
revoke all on function finance_private.current_period_closing_worker_is_trusted() from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_close_period(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.period_has_unresolved_blocking_exception(uuid) from public,anon,authenticated;

create or replace function finance_api.authorize_period_closing(p_period_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path = '' as $$
 select case when p_permission='finance.periods.close' and auth.uid() is not null and finance_private.current_actor_can_close_period(auth.uid(),p_period_id)
 then pg_catalog.jsonb_build_object('allowed',true,'legalEntityId',fp.legal_entity_id,'dealerAccountId',fp.dealer_account_id,'branchId',fp.branch_id,'parentPeriodId',fp.parent_period_id) else pg_catalog.jsonb_build_object('allowed',false) end
 from finance.finance_periods fp where fp.id=p_period_id and fp.scope_type='BRANCH'
$$;

create or replace function finance_api.commit_period_closing(p_actor_id uuid,p_period_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_check_snapshot_hash text,p_dealer_response_id uuid,p_expected_version bigint,p_note text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v finance.finance_periods%rowtype;v_approval finance.approval_requests%rowtype;v_computed_hash text;v_new_version bigint;v_note_hash text;v_payload jsonb;v_payload_hash text;v_previous_hash text;v_audit_hash text;v_existing jsonb;v_existing_hash text;
begin
 if not finance_private.current_period_closing_worker_is_trusted() then raise exception using errcode='42501',message='period closing worker denied';end if;
 if p_actor_id is null or p_period_id is null or p_legal_entity_id is null or p_dealer_account_id is null or p_branch_id is null or p_check_snapshot_hash!~'^[a-fA-F0-9]{64}$' or p_expected_version<1 or pg_catalog.length(coalesce(p_note,''))>2000 or coalesce(pg_catalog.btrim(p_idempotency_key),'')='' or pg_catalog.length(p_idempotency_key)>200 or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null then raise exception using errcode='22023',message='required period closing fields missing';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('period-closing:'||p_period_id::text,0));
 select om.payload,om.payload->>'intentHash' into v_existing,v_existing_hash from finance.outbox_messages om where om.aggregate_type='finance_period' and om.aggregate_id=p_period_id and om.event_type='FINANCE_PERIOD_LOCKED' and om.payload->>'idempotencyKey'=p_idempotency_key order by om.created_at_utc desc,om.id desc limit 1;
 if found then if v_existing_hash=p_intent_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','periodId',p_period_id,'parentPeriodId',v_existing->>'parentPeriodId','dealerAccountId',v_existing->>'dealerAccountId','branchId',v_existing->>'branchId','currencyCode',v_existing->>'currencyCode','periodStart',v_existing->>'periodStart','periodEnd',v_existing->>'periodEnd','status','LOCKED','version',(v_existing->>'version')::bigint,'sourceSnapshotHash',v_existing->>'sourceSnapshotHash','checkSnapshotHash',v_existing->>'checkSnapshotHash');end if;return pg_catalog.jsonb_build_object('outcome','CONFLICT','periodId',p_period_id);end if;
 select * into v from finance.finance_periods where id=p_period_id for update;
 if not found then raise exception using errcode='P0002',message='finance period not found';end if;
 if v.scope_type<>'BRANCH' or v.parent_period_id is null or v.legal_entity_id<>p_legal_entity_id or v.dealer_account_id<>p_dealer_account_id or v.branch_id<>p_branch_id then raise exception using errcode='42501',message='branch finance period scope mismatch';end if;
 if v.version<>p_expected_version then return pg_catalog.jsonb_build_object('outcome','CONFLICT','periodId',v.id,'version',v.version);end if;
 if v.mode<>'LIVE' or v.status<>'APPROVED' then raise exception using errcode='23514',message='approved live finance period required';end if;
 if v.source_snapshot_hash is null or v.source_snapshot_hash!~'^[a-fA-F0-9]{64}$' then raise exception using errcode='23514',message='source snapshot hash required';end if;
 if v.prepared_by is null or v.prepared_by=p_actor_id then raise exception using errcode='42501',message='maker checker violation';end if;
 select * into v_approval from finance.approval_requests ar where ar.legal_entity_id=v.legal_entity_id and ar.subject_type='FINANCE_PERIOD_CLOSE' and ar.subject_id=v.id and ar.status='APPROVED' order by ar.version desc limit 1;
 if not found or v_approval.prepared_by=p_actor_id then raise exception using errcode='42501',message='approved close request with maker checker required';end if;
 if exists(select 1 from finance.approval_steps s where s.approval_request_id=v_approval.id and (s.decision is null or s.decision<>'APPROVE' or s.decided_by=v_approval.prepared_by)) then raise exception using errcode='23514',message='all mandatory approval steps required';end if;
 if not exists(select 1 from finance.reconciliations r where r.finance_period_id=v.id) or exists(select 1 from finance.reconciliations r where r.finance_period_id=v.id and r.status not in ('MATCHED','APPROVED_DIFFERENCE','LOCKED')) then raise exception using errcode='23514',message='resolved reconciliations required';end if;
 select pg_catalog.encode(extensions.digest(pg_catalog.convert_to(pg_catalog.string_agg(r.reconciliation_type||':'||r.run_no::text||':'||r.currency_code||':'||r.source_total::text||':'||r.ledger_total::text||':'||r.snapshot_hash||':'||r.status,'|' order by r.reconciliation_type,r.run_no),'UTF8'),'sha256'),'hex') into v_computed_hash from finance.reconciliations r where r.finance_period_id=v.id;
 if v_computed_hash<>pg_catalog.lower(p_check_snapshot_hash) then raise exception using errcode='23514',message='reconciliation check snapshot mismatch';end if;
 if finance_private.period_has_unresolved_blocking_exception(v.id) then raise exception using errcode='23514',message='unresolved blocking exception exists';end if;
 update finance.reconciliations set status='LOCKED',correlation_id=p_correlation_id where finance_period_id=v.id and status in ('MATCHED','APPROVED_DIFFERENCE');
 update finance.finance_periods set status='LOCKED',check_snapshot_hash=v_computed_hash,approved_by=p_actor_id,locked_at_utc=pg_catalog.now(),version=version+1,correlation_id=p_correlation_id where id=v.id and version=p_expected_version returning version into v_new_version;
 if not found then return pg_catalog.jsonb_build_object('outcome','CONFLICT','periodId',v.id);end if;
 v_note_hash:=case when p_note is null then null else pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_note,'UTF8'),'sha256'),'hex') end;
 v_payload:=pg_catalog.jsonb_build_object('periodId',v.id,'parentPeriodId',v.parent_period_id,'legalEntityId',v.legal_entity_id,'dealerAccountId',v.dealer_account_id,'branchId',v.branch_id,'currencyCode',v.currency_code,'status','LOCKED','version',v_new_version,'periodStart',v.period_start,'periodEnd',v.period_end,'sourceSnapshotHash',v.source_snapshot_hash,'checkSnapshotHash',v_computed_hash,'dealerResponseId',p_dealer_response_id,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash,'noteHash',v_note_hash);
 v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_payload::text,'UTF8'),'sha256'),'hex');insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id) values(v.legal_entity_id,'finance.period','FINANCE_PERIOD_LOCKED','finance_period',v.id,v_new_version,v_payload,v_payload_hash,'PENDING',p_correlation_id);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||v.legal_entity_id::text,0));select ae.integrity_hash into v_previous_hash from finance.audit_events ae where ae.legal_entity_id=v.legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_hash,'GENESIS')||':'||v.id::text||':FINANCE_PERIOD_LOCKED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id) values(v.legal_entity_id,p_actor_id,'USER','FINANCE_PERIOD_LOCKED','finance_period',v.id,'ALLOW',p_intent_hash,v_previous_hash,v_audit_hash,pg_catalog.jsonb_build_object('approvalRequestId',v_approval.id,'sourceSnapshotHash',v.source_snapshot_hash,'checkSnapshotHash',v_computed_hash,'dealerResponseId',p_dealer_response_id,'noteHash',v_note_hash),p_correlation_id);
 return pg_catalog.jsonb_build_object('outcome','LOCKED','periodId',v.id,'parentPeriodId',v.parent_period_id,'dealerAccountId',v.dealer_account_id,'branchId',v.branch_id,'currencyCode',v.currency_code,'periodStart',v.period_start,'periodEnd',v.period_end,'status','LOCKED','version',v_new_version,'sourceSnapshotHash',v.source_snapshot_hash,'checkSnapshotHash',v_computed_hash,'lockedAtUtc',pg_catalog.now());
end $$;
revoke all on function finance_api.commit_period_closing(uuid,uuid,uuid,uuid,uuid,text,uuid,bigint,text,text,text,uuid) from public,anon,authenticated;
revoke all on function finance_api.authorize_period_closing(uuid,text) from public,anon;grant execute on function finance_api.authorize_period_closing(uuid,text) to authenticated;
-- Commit grant intentionally absent until period-scoped blocking adapter and trusted worker are reviewed.
