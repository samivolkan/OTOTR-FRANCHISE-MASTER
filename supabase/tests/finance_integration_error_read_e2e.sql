\set ON_ERROR_STOP on
begin;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000091';
create or replace function finance_private.current_actor_can_read_scope(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path=pg_catalog as $$select p_operation_id in('listIntegrationErrors','getIntegrationError')$$;

create or replace function finance_private.current_actor_can_retry_integration_error(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog as $$select true$$;

create or replace function finance_private.integration_retry_error_is_in_scope(p_error_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance as $$
  select exists(
    select 1 from finance.integration_errors e
    where e.id=p_error_id and e.legal_entity_id=p_legal_entity_id
      and (e.redacted_detail->>'dealerAccountId')::uuid=p_dealer_account_id
      and (e.redacted_detail->>'branchId')::uuid=p_branch_id
  )
$$;

create or replace function finance_private.current_integration_retry_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select true$$;

create or replace function finance_private.resolve_integration_retry_scope(p_error_id uuid)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance as $$
  select pg_catalog.jsonb_build_object(
    'legalEntityId',e.legal_entity_id,
    'dealerAccountId',e.redacted_detail->>'dealerAccountId',
    'branchId',e.redacted_detail->>'branchId'
  )
  from finance.integration_errors e where e.id=p_error_id
$$;

do $test$
declare
  actor constant uuid:='00000000-0000-4000-8000-000000000091';hq constant uuid:='19000000-0000-4000-8000-000000000001';dealer constant uuid:='29000000-0000-4000-8000-000000000001';dealer2 constant uuid:='29000000-0000-4000-8000-000000000002';branch constant uuid:='39000000-0000-4000-8000-000000000001';branch2 constant uuid:='39000000-0000-4000-8000-000000000002';account constant uuid:='49000000-0000-4000-8000-000000000001';account2 constant uuid:='49000000-0000-4000-8000-000000000002';inbox_id constant uuid:='89000000-0000-4000-8000-000000000001';outbox_id constant uuid:='89000000-0000-4000-8000-000000000002';error_id constant uuid:='89000000-0000-4000-8000-000000000003';corr constant uuid:='99000000-0000-4000-8000-000000000001';result jsonb;detail jsonb;wrong jsonb;retry jsonb;replay jsonb;conflict jsonb;retry_job uuid;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)values(hq,'OTOTR-HQ-INTEGRATION-DEMO','OTOTR Sentetik Entegrasyon Merkezi','ACTIVE',actor,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)values(dealer,hq,'INTEGRATION-DEALER','Sentetik Entegrasyon Bayisi','ACTIVE',actor,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)values(dealer2,hq,'INTEGRATION-DEALER-2','Sentetik Entegrasyon Bayisi 2','ACTIVE',actor,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)values(branch,hq,dealer,'INTEGRATION-BRANCH','ACTIVE',actor,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)values(branch2,hq,dealer2,'INTEGRATION-BRANCH-2','ACTIVE',actor,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)values(account,hq,dealer,'INTEGRATION-ACCOUNT','TRY','ACTIVE',actor,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)values(account2,hq,dealer2,'INTEGRATION-ACCOUNT-2','TRY','ACTIVE',actor,corr);
  insert into finance.inbox_messages(id,legal_entity_id,source_system,message_id,payload_hash,schema_version,payload,status,created_at_utc,correlation_id)values(inbox_id,hq,'ERP','SYNTHETIC-MSG',repeat('a',64),2,'{"secret":"must-not-leak"}'::jsonb,'REJECTED',now()-interval '2 minutes',corr);
  insert into finance.outbox_messages(id,legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,attempt_count,last_error_code,created_at_utc,correlation_id)values(outbox_id,hq,'finance.erp','ERP_SYNC_FAILED','branch',branch,1,'{"secret":"must-not-leak"}'::jsonb,repeat('b',64),'DEAD_LETTER',3,'ERP_TIMEOUT',now()-interval '1 minute',corr);
  insert into finance.integration_errors(id,legal_entity_id,source_type,source_id,error_fingerprint,occurrence_no,error_code,redacted_detail,status,created_by,correlation_id)values(error_id,hq,'OUTBOX',outbox_id,repeat('c',64),3,'ERP_TIMEOUT',pg_catalog.jsonb_build_object('sourceSystem','ERP','retryable',true,'dealerAccountId',account,'branchId',branch,'safeMessage','ERP yanıt vermedi'),'OPEN',actor,corr);
  if not finance_private.integration_error_is_in_scope(error_id,hq,account,branch) then raise exception 'integration scope resolver mismatch: %',(select redacted_detail from finance.integration_errors where id=error_id);end if;
  result:=finance_api.list_integration_errors(hq,account,branch,'RETRYABLE','ERP',null,25);
  if pg_catalog.jsonb_array_length(result->'items')<>1 or result#>>'{items,0,errorId}'<>error_id::text or result#>>'{items,0,retryCount}'<>'2' then raise exception 'integration error list mismatch: %',result;end if;
  detail:=finance_api.get_integration_error(hq,account,branch,error_id);
  if detail#>>'{safeDetail,safeMessage}'<>'ERP yanıt vermedi' or detail#>>'{retryable}'<>'true' or pg_catalog.jsonb_array_length(detail->'trace')<>2 or detail::text like '%must-not-leak%' or detail::text like '%dealerAccountId%' or detail::text like '%branchId%' then raise exception 'integration error detail unsafe or incomplete: %',detail;end if;
  wrong:=finance_api.list_integration_errors(hq,account2,branch2,null,null,null,25);
  if pg_catalog.jsonb_array_length(wrong->'items')<>0 then raise exception 'cross-scope integration error leaked: %',wrong;end if;
  if (finance_api.authorize_integration_error_retry_scope(error_id,'finance.integration-errors.retry')->>'allowed')::boolean is not true then raise exception 'retry authorization denied';end if;
  retry:=finance_api.commit_integration_error_retry(actor,hq,account,branch,error_id,'TIMEOUT_RETRY',repeat('d',64),1,'retry-demo-0001',repeat('e',64),corr);
  retry_job:=(retry->>'jobId')::uuid;
  if retry->>'outcome'<>'QUEUED' or retry->>'version'<>'2' then raise exception 'retry was not queued: %',retry;end if;
  if (select status from finance.integration_errors where id=error_id)<>'RETRY_SCHEDULED' then raise exception 'retry state transition missing';end if;
  if not exists(select 1 from finance.outbox_messages where id=retry_job and status='PENDING' and topic='finance.integration-retry' and event_type='INTEGRATION_RETRY_REQUESTED' and aggregate_id=error_id) then raise exception 'retry outbox job missing';end if;
  if not exists(select 1 from finance.audit_events where subject_id=error_id and action_code='INTEGRATION_RETRY_REQUESTED' and decision='ALLOW') then raise exception 'retry audit evidence missing';end if;
  replay:=finance_api.commit_integration_error_retry(actor,hq,account,branch,error_id,'TIMEOUT_RETRY',repeat('d',64),1,'retry-demo-0001',repeat('e',64),corr);
  if replay->>'outcome'<>'REPLAY' or (select count(*) from finance.outbox_messages where topic='finance.integration-retry' and aggregate_id=error_id)<>1 then raise exception 'retry replay was not idempotent: %',replay;end if;
  conflict:=finance_api.commit_integration_error_retry(actor,hq,account,branch,error_id,'TIMEOUT_RETRY',repeat('d',64),2,'retry-demo-0001',repeat('f',64),corr);
  if conflict->>'outcome'<>'CONFLICT' then raise exception 'retry intent conflict was not rejected: %',conflict;end if;
  if not exists(select 1 from finance.outbox_messages where id=outbox_id and status='DEAD_LETTER' and attempt_count=3 and last_error_code='ERP_TIMEOUT') then raise exception 'dead-letter source evidence missing';end if;
  raise notice 'INTEGRATION ERROR READ E2E PASSED: masked detail, cross-scope isolation, dead-letter retry, queued job, replay and conflict verified';
end $test$;
rollback;
