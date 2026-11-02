-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-source-event-rpc.sql
-- Source SHA256: 8DC07BD6D727263E341AE376859EA0C538D2A1C2CB56691A313199918F0BB223
-- Local replay required before any staging promotion.
-- OTOTR FINANCE SOURCE EVENT RPC CANDIDATE

create or replace function finance_private.source_payload_contains_calculated_result(p_value jsonb)
returns boolean language plpgsql immutable set search_path = ''
as $$
declare v_key text; v_child jsonb;
begin
  if p_value is null then return false; end if;
  if pg_catalog.jsonb_typeof(p_value)='object' then
    for v_key,v_child in select key,value from pg_catalog.jsonb_each(p_value) loop
      if v_key=any(array['royaltyAmount','calculatedFee','calculatedFeeAmount','accrualAmount','journalEntries','openItemAmount','financeResult']) then return true; end if;
      if finance_private.source_payload_contains_calculated_result(v_child) then return true; end if;
    end loop;
  elsif pg_catalog.jsonb_typeof(p_value)='array' then
    for v_child in select value from pg_catalog.jsonb_array_elements(p_value) loop
      if finance_private.source_payload_contains_calculated_result(v_child) then return true; end if;
    end loop;
  end if;
  return false;
end $$;
revoke all on function finance_private.source_payload_contains_calculated_result(jsonb) from public, anon, authenticated;

create or replace function finance_private.current_actor_can_ingest_source_event(
  p_actor_id uuid,
  p_headquarters_legal_entity_id uuid,
  p_dealer_legal_entity_id uuid,
  p_branch_id uuid
) returns boolean
language sql stable security definer set search_path = ''
as $$ select false $$;

revoke all on function finance_private.current_actor_can_ingest_source_event(uuid,uuid,uuid,uuid) from public, anon, authenticated;

create or replace function finance_api.authorize_source_event_scope(
  p_headquarters_legal_entity_id uuid,
  p_dealer_legal_entity_id uuid,
  p_branch_id uuid,
  p_permission text
) returns boolean
language sql stable security definer set search_path = ''
as $$
  select p_permission = 'finance.source-events.ingest'
    and auth.uid() is not null
    and finance_private.current_actor_can_ingest_source_event(auth.uid(), p_headquarters_legal_entity_id, p_dealer_legal_entity_id, p_branch_id)
    and exists (
      select 1 from finance.branches b
      where b.id = p_branch_id
        and b.legal_entity_id = p_headquarters_legal_entity_id
        and b.dealer_legal_entity_id = p_dealer_legal_entity_id
        and b.status = 'ACTIVE'
    )
$$;

create or replace function finance_api.find_source_event_fingerprint(
  p_source_system text,
  p_event_id uuid,
  p_headquarters_legal_entity_id uuid,
  p_dealer_legal_entity_id uuid,
  p_branch_id uuid
) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare v_row record;
begin
  if not finance_api.authorize_source_event_scope(p_headquarters_legal_entity_id, p_dealer_legal_entity_id, p_branch_id, 'finance.source-events.ingest') then
    raise exception using errcode = '42501', message = 'finance scope denied';
  end if;
  select se.id, se.payload_hash into v_row
  from finance.source_events se
  where se.source_system = p_source_system and se.event_id = p_event_id and se.legal_entity_id = p_headquarters_legal_entity_id;
  if not found then return null; end if;
  return pg_catalog.jsonb_build_object('sourceEventId', v_row.id, 'payloadHash', v_row.payload_hash);
end $$;

create or replace function finance_api.ingest_source_event(
  p_event jsonb,
  p_payload_hash text,
  p_idempotency_key text,
  p_correlation_id uuid
) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_hq uuid := (p_event #>> '{scope,headquartersLegalEntityId}')::uuid;
  v_dealer uuid := (p_event #>> '{scope,dealerLegalEntityId}')::uuid;
  v_branch uuid := (p_event #>> '{scope,branchId}')::uuid;
  v_source text := p_event ->> 'sourceSystem';
  v_event_id uuid := (p_event ->> 'eventId')::uuid;
  v_existing record;
  v_source_event_id uuid;
begin
  if auth.uid() is null or coalesce(p_payload_hash, '') = '' or coalesce(p_idempotency_key, '') = '' then
    raise exception using errcode = '22023', message = 'required finance event fields missing';
  end if;
  if pg_catalog.jsonb_typeof(p_event)<>'object' or pg_catalog.jsonb_typeof(p_event->'payload')<>'object' or
     (p_event-array['eventId','eventType','schemaVersion','businessDate','occurredAtUtc','receivedAtUtc','sourceSystem','aggregateType','aggregateId','aggregateVersion','scope','trace','actor','payload','metadata'])<>'{}'::jsonb then
    raise exception using errcode='22023',message='invalid source event envelope';
  end if;
  if finance_private.source_payload_contains_calculated_result(p_event->'payload') then
    raise exception using errcode='22023',message='calculated finance result forbidden';
  end if;
  if p_event->>'eventType'='customer-payment.settled' then
    if (p_event#>>'{payload,collectionStatus}')<>'SETTLED' or (p_event#>>'{payload,transactionType}')<>'COLLECTION'
       or (p_event#>>'{payload,collectionCompleteness}') not in ('PARTIAL','FULL')
       or (p_event#>>'{payload,branchId}')::uuid<>v_branch
       or p_event->>'aggregateType'<>'CUSTOMER_PAYMENT'
       or p_event->>'aggregateId'<>p_event#>>'{payload,collectionId}'
       or not ((p_event#>>'{payload,collectedGrossAmount}') ~ '^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$')
       or (p_event#>>'{payload,collectedGrossAmount}')::numeric<=0
       or not ((p_event#>>'{payload,currency}') ~ '^[A-Z]{3}$')
       or (p_event#>>'{payload,settledAtUtc}')::timestamptz is null then
      raise exception using errcode='22023',message='invalid settled customer collection payload';
    end if;
    if ((p_event->'payload')-array['collectionId','branchId','collectionStatus','transactionType','collectionCompleteness','collectedGrossAmount','currency','settledAtUtc','workOrderId','customerInvoiceRef','paymentChannel','sourceEvidenceRef'])<>'{}'::jsonb then
      raise exception using errcode='22023',message='unknown settled customer collection field';
    end if;
  end if;
  if not finance_api.authorize_source_event_scope(v_hq, v_dealer, v_branch, 'finance.source-events.ingest') then
    raise exception using errcode = '42501', message = 'finance scope denied';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_source || ':' || v_event_id::text, 0));
  select se.id, se.payload_hash into v_existing from finance.source_events se
  where se.source_system = v_source and se.event_id = v_event_id;
  if found then
    if v_existing.payload_hash = p_payload_hash then
      return pg_catalog.jsonb_build_object('status','DUPLICATE','sourceEventId',v_existing.id,'payloadHash',v_existing.payload_hash);
    end if;
    return pg_catalog.jsonb_build_object('status','CONFLICT','sourceEventId',v_existing.id,'payloadHash',v_existing.payload_hash);
  end if;
  if exists(select 1 from finance.finance_periods fp where fp.legal_entity_id=v_hq and fp.scope_type='BRANCH' and fp.branch_id=v_branch and (p_event->>'businessDate')::date between fp.period_start and fp.period_end and fp.status not in ('OPEN','REOPENED')) then
    raise exception using errcode='23514',message='source event belongs to a frozen finance period';
  end if;
  insert into finance.inbox_messages(legal_entity_id,source_system,message_id,payload_hash,schema_version,payload,status,correlation_id)
  values(v_hq,v_source,v_event_id::text,p_payload_hash,(p_event->>'schemaVersion')::integer,p_event,'RECEIVED',p_correlation_id);
  insert into finance.source_events(legal_entity_id,dealer_legal_entity_id,branch_id,source_system,event_id,event_type,schema_version,business_date,occurred_at_utc,received_at_utc,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,created_by,correlation_id)
  values(v_hq,v_dealer,v_branch,v_source,v_event_id,p_event->>'eventType',(p_event->>'schemaVersion')::integer,(p_event->>'businessDate')::date,(p_event->>'occurredAtUtc')::timestamptz,(p_event->>'receivedAtUtc')::timestamptz,p_event->>'aggregateType',p_event->>'aggregateId',(p_event->>'aggregateVersion')::bigint,p_event->'payload',p_payload_hash,'RECEIVED',auth.uid(),p_correlation_id)
  returning id into v_source_event_id;
  return pg_catalog.jsonb_build_object('status','ACCEPTED','sourceEventId',v_source_event_id,'payloadHash',p_payload_hash);
end $$;

revoke all on function finance_api.authorize_source_event_scope(uuid,uuid,uuid,text) from public, anon;
revoke all on function finance_api.find_source_event_fingerprint(text,uuid,uuid,uuid,uuid) from public, anon;
revoke all on function finance_api.ingest_source_event(jsonb,text,text,uuid) from public, anon;
grant execute on function finance_api.authorize_source_event_scope(uuid,uuid,uuid,text) to authenticated;
grant execute on function finance_api.find_source_event_fingerprint(text,uuid,uuid,uuid,uuid) to authenticated;
grant execute on function finance_api.ingest_source_event(jsonb,text,text,uuid) to authenticated;
