\set ON_ERROR_STOP on
begin;
set local request.jwt.claim.role='service_role';
do $test$
declare
  hq constant uuid:='71000000-0000-4000-8000-000000000001';
  actor constant uuid:='71000000-0000-4000-8000-000000000002';
  corr constant uuid:='71000000-0000-4000-8000-000000000003';
  aggregate_a constant uuid:='71000000-0000-4000-8000-000000000004';
  aggregate_b constant uuid:='71000000-0000-4000-8000-000000000005';
  lease_a constant uuid:='71000000-0000-4000-8000-000000000006';
  lease_b constant uuid:='71000000-0000-4000-8000-000000000007';
  now_utc constant timestamptz:='2026-11-07T02:15:00Z';
  claimed jsonb;message_id uuid;result jsonb;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OUTBOX-WORKER-HQ','Sentetik Outbox Merkezi','ACTIVE',actor,corr);
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,available_at_utc,correlation_id)
  values(hq,'finance.accrual','ACCRUAL_POSTED','accrual',aggregate_a,1,'{}',repeat('a',64),'PENDING',now_utc,corr),
        (hq,'finance.invoice','INVOICE_ACCEPTED','invoice',aggregate_b,1,'{}',repeat('b',64),'PENDING',now_utc,corr);
  claimed:=finance_api.claim_outbox_messages_v2('worker-a',lease_a,10,60,now_utc,array['finance.accrual']);
  if jsonb_array_length(claimed)<>1 or claimed->0->>'topic'<>'finance.accrual' or claimed->0->>'attempt_count'<>'1' then raise exception 'topic-scoped claim failed: %',claimed;end if;
  message_id:=(claimed->0->>'id')::uuid;
  result:=finance_api.acknowledge_outbox_message('worker-a',lease_a,message_id,'external-1',now_utc+interval '1 second');
  if result->>'outcome'<>'PUBLISHED' or (select status from finance.outbox_messages where id=message_id)<>'PUBLISHED' then raise exception 'ack failed: %',result;end if;
  claimed:=finance_api.claim_outbox_messages_v2('worker-b',lease_b,10,60,now_utc,array['finance.invoice']);
  message_id:=(claimed->0->>'id')::uuid;
  result:=finance_api.fail_outbox_message('worker-b',lease_b,message_id,'TEMPORARY_UNAVAILABLE',true,3,now_utc+interval '30 seconds',now_utc+interval '1 second');
  if result->>'outcome'<>'RETRYING' or (select status from finance.outbox_messages where id=message_id)<>'RETRYING' then raise exception 'retry failed: %',result;end if;
  if (select count(*) from finance.integration_errors where source_type='OUTBOX' and source_id=message_id and status='RETRY_SCHEDULED')<>1 then raise exception 'retry integration error missing';end if;
  raise notice 'FINANCE OUTBOX WORKER E2E PASSED: topic-scoped lease, ACK and retry state transitions verified';
end$test$;
rollback;
