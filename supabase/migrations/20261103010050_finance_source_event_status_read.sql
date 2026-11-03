-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-source-event-status-read-rpc.sql
-- Source SHA256: 4FDC5B20733DC919219734E72CCF940A578720D2C2922ADB29C3139ADBF746DF
-- Local replay required before any staging promotion.
create or replace function finance_private.current_actor_can_read_scope(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text) returns boolean language sql stable security definer set search_path=pg_catalog as $$select false$$;
create or replace function finance_api.authorize_scope(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text) returns boolean language sql stable security definer set search_path=pg_catalog,finance,finance_private,auth as $$
 select auth.uid() is not null and finance_private.current_actor_can_read_scope(auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id,p_operation_id)
 and exists(select 1 from finance.dealer_accounts da join finance.branches b on b.dealer_legal_entity_id=da.dealer_legal_entity_id where da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and b.id=p_branch_id and b.legal_entity_id=p_legal_entity_id and da.status in('SHADOW','ACTIVE') and b.status='ACTIVE')
$$;
create or replace function finance_api.get_source_event_status(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_event_id uuid) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare e finance.source_events%rowtype;v_result_ids jsonb;v_processed timestamptz;v_error text;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getSourceEventStatus') then raise exception using errcode='42501',message='finance scope denied';end if;
 select se.* into e from finance.source_events se join finance.dealer_accounts da on da.id=p_dealer_account_id and da.dealer_legal_entity_id=se.dealer_legal_entity_id where se.legal_entity_id=p_legal_entity_id and se.branch_id=p_branch_id and se.event_id=p_event_id;
 if not found then return null;end if;
 select coalesce(pg_catalog.jsonb_agg(x.id order by x.id),'[]'::jsonb),pg_catalog.max(x.created_at_utc) filter(where x.status='POSTED') into v_result_ids,v_processed from (select cr.id,cr.created_at_utc,cr.status from finance.calculation_runs cr where cr.source_event_id=e.id union all select a.id,a.created_at_utc,a.status from finance.calculation_runs cr join finance.accruals a on a.calculation_run_id=cr.id where cr.source_event_id=e.id)x;
 select ie.error_code into v_error from finance.integration_errors ie where ie.source_type='SOURCE_EVENT' and ie.source_id=e.id and ie.status in('OPEN','RETRY_SCHEDULED') order by ie.created_at_utc desc limit 1;
 return pg_catalog.jsonb_build_object('eventId',e.event_id::text,'status',case e.status when 'PROCESSING' then 'QUEUED' when 'REJECTED' then 'FAILED' else e.status end,'receivedAtUtc',e.received_at_utc,'processedAtUtc',v_processed,'resultResourceIds',v_result_ids,'safeErrorCode',v_error,'correlationId',e.correlation_id::text);
end$$;
revoke all on function finance_private.current_actor_can_read_scope(uuid,uuid,uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_api.authorize_scope(uuid,uuid,uuid,text) from public,anon;
revoke all on function finance_api.get_source_event_status(uuid,uuid,uuid,uuid) from public,anon;
