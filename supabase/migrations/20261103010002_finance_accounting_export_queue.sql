-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-accounting-export-queue-rpc.sql
-- Source SHA256: 35BF4AAAF4EC2817123F5B4AE30B21D2C1E16FB589A42E2043CAB01EB5B66F2C
-- Local replay required before any staging promotion.
-- OTOTR FINANCE ACCOUNTING EXPORT QUEUE RPC CANDIDATE (TX-14)
create or replace function finance_private.current_accounting_export_queue_worker_is_trusted() returns boolean language sql stable security definer set search_path='' as $$select false$$;
create or replace function finance_private.current_actor_can_queue_accounting_export(p_actor_id uuid,p_batch_id uuid) returns boolean language sql stable security definer set search_path='' as $$select false$$;
revoke all on function finance_private.current_accounting_export_queue_worker_is_trusted() from public,anon,authenticated;revoke all on function finance_private.current_actor_can_queue_accounting_export(uuid,uuid) from public,anon,authenticated;
create or replace function finance_api.authorize_accounting_export_queue(p_batch_id uuid,p_permission text) returns boolean language sql stable security definer set search_path='' as $$select p_permission='finance.accounting-batches.export' and auth.uid() is not null and finance_private.current_actor_can_queue_accounting_export(auth.uid(),p_batch_id)$$;
create or replace function finance_api.queue_accounting_export(p_actor_id uuid,p_batch_id uuid,p_target_adapter_code text,p_mapping_version text,p_expected_version bigint,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare v_batch finance.accounting_batches%rowtype;v_job_id uuid;v_payload jsonb;v_payload_hash text;v_previous_hash text;v_audit_hash text;v_new_version bigint;
begin
 if not finance_private.current_accounting_export_queue_worker_is_trusted() then raise exception using errcode='42501',message='accounting export queue worker denied';end if;
 if p_actor_id is null or p_batch_id is null or coalesce(pg_catalog.btrim(p_target_adapter_code),'')='' or pg_catalog.length(p_target_adapter_code)>100 or coalesce(pg_catalog.btrim(p_mapping_version),'')='' or pg_catalog.length(p_mapping_version)>100 or p_expected_version<1 or coalesce(pg_catalog.btrim(p_idempotency_key),'')='' or pg_catalog.length(p_idempotency_key)>200 or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null then raise exception using errcode='22023',message='required accounting export queue fields missing';end if;
 select * into v_batch from finance.accounting_batches b where b.id=p_batch_id for update;
 if not found then raise exception using errcode='P0002',message='accounting batch not found';end if;
 if v_batch.export_idempotency_key is not null then
  if v_batch.export_idempotency_key=p_idempotency_key and v_batch.export_intent_hash=p_intent_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','jobId',v_batch.export_job_id,'batchId',v_batch.id,'status','QUEUED','version',v_batch.version);end if;
  return pg_catalog.jsonb_build_object('outcome','CONFLICT');
 end if;
 if v_batch.status<>'READY' or v_batch.version<>p_expected_version or v_batch.mapping_version<>p_mapping_version then return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
 v_job_id:=gen_random_uuid();v_new_version:=v_batch.version+1;
 v_payload:=pg_catalog.jsonb_build_object('jobId',v_job_id,'batchId',v_batch.id,'legalEntityId',v_batch.legal_entity_id,'targetAdapterCode',p_target_adapter_code,'mappingVersion',p_mapping_version,'contentHash',v_batch.content_hash,'batchVersion',v_new_version,'intentHash',p_intent_hash);
 v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
 update finance.accounting_batches set export_idempotency_key=p_idempotency_key,export_intent_hash=p_intent_hash,target_adapter_code=p_target_adapter_code,export_job_id=v_job_id,export_queued_at_utc=pg_catalog.now(),export_queued_by=p_actor_id,status='EXPORT_QUEUED',version=v_new_version,correlation_id=p_correlation_id where id=v_batch.id and version=p_expected_version and status='READY';
 if not found then return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
 update finance.accounting_batch_packages set status='EXPORT_QUEUED',correlation_id=p_correlation_id where accounting_batch_id=v_batch.id and status='READY';
 if not found then raise exception using errcode='23514',message='ready accounting package required';end if;
 insert into finance.outbox_messages(id,legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id) values(v_job_id,v_batch.legal_entity_id,'finance.accounting','ACCOUNTING_EXPORT_QUEUED','accounting_batch',v_batch.id,v_new_version,v_payload,v_payload_hash,'PENDING',p_correlation_id);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||v_batch.legal_entity_id::text,0));select ae.integrity_hash into v_previous_hash from finance.audit_events ae where ae.legal_entity_id=v_batch.legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_hash,'GENESIS')||':'||v_batch.id::text||':ACCOUNTING_EXPORT_QUEUED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
 insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id) values(v_batch.legal_entity_id,p_actor_id,'USER','ACCOUNTING_EXPORT_QUEUED','accounting_batch',v_batch.id,'ALLOW',v_batch.content_hash,v_payload_hash,v_previous_hash,v_audit_hash,pg_catalog.jsonb_build_object('jobId',v_job_id,'targetAdapterCode',p_target_adapter_code,'mappingVersion',p_mapping_version,'batchVersion',v_new_version),p_correlation_id);
 return pg_catalog.jsonb_build_object('outcome','QUEUED','jobId',v_job_id,'batchId',v_batch.id,'status','QUEUED','version',v_new_version);
end $$;
revoke all on function finance_api.queue_accounting_export(uuid,uuid,text,text,bigint,text,text,uuid) from public,anon,authenticated;revoke all on function finance_api.authorize_accounting_export_queue(uuid,text) from public,anon;grant execute on function finance_api.authorize_accounting_export_queue(uuid,text) to authenticated;
-- Commit grant intentionally absent until reviewed identity hooks and a server-only worker exist.
