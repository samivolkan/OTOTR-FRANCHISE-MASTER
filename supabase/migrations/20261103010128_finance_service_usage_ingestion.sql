-- Server-only branch-scoped query and external-service usage ingestion.
create or replace function finance_private.current_service_usage_ingest_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
revoke all on function finance_private.current_service_usage_ingest_worker_is_trusted() from public,anon,authenticated;

create or replace function finance_api.commit_service_usage_source_event(
 p_actor_id uuid,p_legal_entity_id uuid,p_dealer_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
 p_source_system text,p_event_id uuid,p_event_type text,p_business_date date,p_occurred_at_utc timestamptz,
 p_payload jsonb,p_payload_hash text,p_correlation_id uuid
)returns jsonb language plpgsql volatile security definer set search_path=pg_catalog,public,finance,finance_private as $$
declare existing record;source_id uuid;external_ref text;event_status text:='RECEIVED';
begin
 if not finance_private.current_service_usage_ingest_worker_is_trusted() then raise exception using errcode='42501',message='trusted service usage worker required';end if;
 if p_actor_id is null or p_event_id is null or p_correlation_id is null or p_event_type not in('query.completed','external-service.delivered')or p_source_system!~'^[A-Z0-9][A-Z0-9_.:-]{1,63}$'or p_payload_hash!~'^[a-f0-9]{64}$'or pg_catalog.jsonb_typeof(p_payload)<>'object' then raise exception using errcode='22023',message='invalid service usage event';end if;
 if (p_payload-array['serviceCode','providerCode','externalReference','providerCostAmount','currency','freeEntitlementApplied','technicalRepeat'])<>'{}'::jsonb or p_payload->>'serviceCode'!~'^[A-Z][A-Z0-9_]{1,63}$'or p_payload->>'providerCode'!~'^[A-Z0-9][A-Z0-9_.:-]{1,63}$'or pg_catalog.length(pg_catalog.btrim(coalesce(p_payload->>'externalReference','')))not between 1 and 200 or p_payload->>'providerCostAmount'!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$'or p_payload->>'currency'!~'^[A-Z]{3}$'or pg_catalog.jsonb_typeof(p_payload->'freeEntitlementApplied')<>'boolean'or pg_catalog.jsonb_typeof(p_payload->'technicalRepeat')<>'boolean'or finance_private.source_payload_contains_calculated_result(p_payload) then raise exception using errcode='22023',message='invalid service usage payload';end if;
 if not finance_private.current_actor_can_read_scope(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id,'listServiceUsages')or not exists(select 1 from finance.dealer_accounts da join finance.branches b on b.id=p_branch_id and b.legal_entity_id=da.legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id where da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and da.dealer_legal_entity_id=p_dealer_legal_entity_id and da.status='ACTIVE'and b.status='ACTIVE')then raise exception using errcode='42501',message='service usage scope denied';end if;
 if exists(select 1 from finance.finance_periods fp where fp.legal_entity_id=p_legal_entity_id and fp.scope_type='BRANCH'and fp.branch_id=p_branch_id and p_business_date between fp.period_start and fp.period_end and fp.status not in('OPEN','REOPENED'))then raise exception using errcode='23514',message='service usage belongs to frozen period';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_source_system||':'||p_event_id::text,0));select se.id,se.payload_hash into existing from finance.source_events se where se.source_system=p_source_system and se.event_id=p_event_id;
 if found then return pg_catalog.jsonb_build_object('outcome',case when existing.payload_hash=p_payload_hash then 'REPLAY'else'CONFLICT'end,'sourceEventId',existing.id,'payloadHash',existing.payload_hash);end if;
 external_ref:=p_payload->>'externalReference';
 insert into finance.inbox_messages(legal_entity_id,source_system,message_id,payload_hash,schema_version,payload,status,correlation_id)values(p_legal_entity_id,p_source_system,p_event_id::text,p_payload_hash,1,p_payload,'RECEIVED',p_correlation_id);
 insert into finance.source_events(legal_entity_id,dealer_legal_entity_id,branch_id,source_system,event_id,event_type,schema_version,business_date,occurred_at_utc,received_at_utc,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,created_by,correlation_id)values(p_legal_entity_id,p_dealer_legal_entity_id,p_branch_id,p_source_system,p_event_id,p_event_type,1,p_business_date,p_occurred_at_utc,pg_catalog.now(),'SERVICE_USAGE',external_ref,1,p_payload,p_payload_hash,event_status,p_actor_id,p_correlation_id)returning id into source_id;
 return pg_catalog.jsonb_build_object('outcome','ACCEPTED','sourceEventId',source_id,'status',event_status,'payloadHash',p_payload_hash);
end$$;
revoke all on function finance_api.commit_service_usage_source_event(uuid,uuid,uuid,uuid,uuid,text,uuid,text,date,timestamptz,jsonb,text,uuid)from public,anon,authenticated;
grant execute on function finance_api.commit_service_usage_source_event(uuid,uuid,uuid,uuid,uuid,text,uuid,text,date,timestamptz,jsonb,text,uuid)to service_role;
