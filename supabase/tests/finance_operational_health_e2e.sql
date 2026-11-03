\set ON_ERROR_STOP on
begin;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000091';
create or replace function finance_private.current_actor_can_read_headquarters(p_actor_id uuid,p_legal_entity_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path=pg_catalog as $$select p_legal_entity_id='1c000000-0000-4000-8000-000000000001'::uuid and p_operation_id='getFinanceOperationalHealth'$$;

do $test$
declare
 actor constant uuid:='00000000-0000-4000-8000-000000000091';hq constant uuid:='1c000000-0000-4000-8000-000000000001';corr constant uuid:='9c000000-0000-4000-8000-000000000001';subject constant uuid:='6c000000-0000-4000-8000-000000000001';result jsonb;denied boolean:=false;
begin
 insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)values(hq,'OTOTR-HQ-HEALTH-DEMO','Sentetik Sağlık Merkezi','ACTIVE',actor,corr);
 insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,attempt_count,last_error_code,created_at_utc,correlation_id)
 values(hq,'finance.erp','ERP_SYNC','branch',subject,1,'{}',repeat('a',64),'PENDING',0,null,now()-interval '6 minutes',corr),
       (hq,'finance.erp','ERP_SYNC_FAILED','branch',subject,2,'{}',repeat('b',64),'DEAD_LETTER',3,'ERP_TIMEOUT',now(),corr);
 insert into finance.integration_errors(legal_entity_id,source_type,source_id,error_fingerprint,occurrence_no,error_code,redacted_detail,status,created_by,correlation_id)
 select hq,'OUTBOX',id,repeat('c',64),1,'ERP_TIMEOUT',jsonb_build_object('retryable',true),'OPEN',actor,corr from finance.outbox_messages where legal_entity_id=hq and status='DEAD_LETTER';
 insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,safe_context,correlation_id)
 values(hq,actor,'SYSTEM','HEALTH_FIXTURE','SYNTHETIC_HEALTH',subject,'ALLOW','{}',corr);
 result:=finance_api.get_finance_operational_health(hq);
 if result->>'status'<>'CRITICAL' or result#>>'{outbox,pending}'<>'1' or result#>>'{outbox,deadLetter}'<>'1' or (result#>>'{outbox,oldestPendingAgeSeconds}')::integer<300 or result#>>'{integrationErrors,open}'<>'1' or result#>>'{auditIntegrity,valid}'<>'true' or result#>>'{auditIntegrity,checkedEventCount}'<>'1' or result#>>'{rawPayloadExposed}'<>'false' then raise exception 'operational health projection mismatch: %',result;end if;
 begin perform finance_api.get_finance_operational_health('1c000000-0000-4000-8000-000000000002');exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'cross-entity operational health was not denied';end if;
 if result::text like '%ERP_TIMEOUT%' or result::text like '%payload%' then raise exception 'operational health leaked raw detail: %',result;end if;
 raise notice 'FINANCE OPERATIONAL HEALTH E2E PASSED: queue age/counts, integration errors, audit integrity and cross-entity denial verified';
end $test$;
rollback;
