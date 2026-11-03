\set ON_ERROR_STOP on
begin;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000091';

create or replace function finance_private.current_actor_can_read_scope(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path=pg_catalog as $$select p_operation_id in('listAuditEvents','listIntegrationErrors')$$;

do $test$
declare
  actor constant uuid:='00000000-0000-4000-8000-000000000091';
  hq constant uuid:='1b000000-0000-4000-8000-000000000001';
  dealer constant uuid:='2b000000-0000-4000-8000-000000000001';
  branch constant uuid:='3b000000-0000-4000-8000-000000000001';
  account constant uuid:='4b000000-0000-4000-8000-000000000001';
  corr constant uuid:='9b000000-0000-4000-8000-000000000001';
  started timestamptz;
  elapsed_ms numeric;
  result jsonb;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OTOTR-HQ-PERF-DEMO','Sentetik Performans Merkezi','ACTIVE',actor,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
  values(dealer,hq,'PERF-D1','Sentetik Performans Bayisi','ACTIVE',actor,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
  values(branch,hq,dealer,'PERF-B1','ACTIVE',actor,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
  values(account,hq,dealer,'PERF-A1','TRY','ACTIVE',actor,corr);

  insert into finance.audit_events(
    id,legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,
    decision,safe_context,created_at_utc,correlation_id
  )
  select gen_random_uuid(),hq,actor,'SYSTEM','PERF_EVENT','SYNTHETIC_PERFORMANCE',gen_random_uuid(),
    'ALLOW',jsonb_build_object('dealerAccountId',account,'branchId',branch,'sequence',g),
    now()-(g||' milliseconds')::interval,corr
  from generate_series(1,2000) g;

  analyze finance.audit_events;
  started:=clock_timestamp();
  result:=finance_api.list_audit_events(hq,account,branch,null,null,null,200);
  elapsed_ms:=extract(epoch from(clock_timestamp()-started))*1000;
  if jsonb_array_length(result->'items')<>200 or result->>'hasMore'<>'true' then
    raise exception 'audit performance fixture pagination failed: %',result;
  end if;
  if elapsed_ms>1500 then
    raise exception 'local audit list threshold exceeded: % ms',round(elapsed_ms,2);
  end if;
  if not exists(
    select 1 from pg_indexes
    where schemaname='finance' and indexname='audit_events_scope_page_idx'
  ) then raise exception 'audit operational index missing';end if;
  if not exists(
    select 1 from pg_indexes
    where schemaname='finance' and indexname='integration_errors_queue_page_idx'
  ) then raise exception 'integration queue operational index missing';end if;
  if not exists(
    select 1 from pg_indexes
    where schemaname='finance' and indexname='outbox_messages_delivery_queue_idx'
  ) then raise exception 'outbox delivery operational index missing';end if;

  raise notice 'FINANCE OPERATIONAL PERFORMANCE E2E PASSED: 2000 scoped audit rows, 200-row page in % ms',round(elapsed_ms,2);
end $test$;
rollback;
