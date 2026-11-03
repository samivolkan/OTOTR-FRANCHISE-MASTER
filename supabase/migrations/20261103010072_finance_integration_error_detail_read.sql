-- OTOTR Finance internal review migration.
-- Masked integration error detail and correlation trace; raw payloads are never returned.

create or replace function finance_api.list_integration_errors(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_status text,p_source_system text,p_cursor text,p_limit integer)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare v_limit integer:=coalesce(p_limit,50);v_cursor_time timestamptz;v_cursor_id uuid;v_items jsonb;v_has_more boolean;v_next_cursor text;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listIntegrationErrors') then raise exception using errcode='42501',message='finance scope denied';end if;
 if v_limit not between 1 and 200 or(p_status is not null and p_status not in('RETRYABLE','ACTION_REQUIRED','RESOLVED','IGNORED'))then raise exception using errcode='22023',message='invalid integration error filter';end if;
 if p_cursor is not null then begin v_cursor_id:=p_cursor::uuid;select created_at_utc into v_cursor_time from finance.integration_errors where id=v_cursor_id;if not found then raise exception using errcode='22023',message='unknown cursor';end if;exception when others then raise exception using errcode='22023',message='invalid cursor';end;end if;
 with scoped as(select ie.*,case ie.status when 'RETRY_SCHEDULED' then 'RETRYABLE' when 'IGNORED_WITH_APPROVAL' then 'IGNORED' when 'OPEN' then case when ie.redacted_detail->>'retryable'='true' then 'RETRYABLE' else 'ACTION_REQUIRED' end else ie.status end effective_status from finance.integration_errors ie where ie.legal_entity_id=p_legal_entity_id and finance_private.integration_error_is_in_scope(ie.id,p_legal_entity_id,p_dealer_account_id,p_branch_id)and(p_source_system is null or coalesce(ie.redacted_detail->>'sourceSystem',ie.source_type)=p_source_system)and(v_cursor_time is null or(ie.created_at_utc,ie.id)<(v_cursor_time,v_cursor_id))),filtered as(select * from scoped where p_status is null or effective_status=p_status order by created_at_utc desc,id desc limit v_limit+1),page as(select * from filtered order by created_at_utc desc,id desc limit v_limit)
 select coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('errorId',p.id,'sourceSystem',coalesce(p.redacted_detail->>'sourceSystem',p.source_type),'errorClass',p.source_type,'safeErrorCode',p.error_code,'status',p.effective_status,'ownerUserId',null,'retryCount',p.occurrence_no-1,'occurredAtUtc',p.created_at_utc,'correlationId',p.correlation_id::text,'version',p.version)order by p.created_at_utc desc,p.id desc)from page p),'[]'::jsonb),(select count(*) from filtered)>v_limit,case when(select count(*) from filtered)>v_limit then(select id::text from page order by created_at_utc,id limit 1)else null end into v_items,v_has_more,v_next_cursor;
 return pg_catalog.jsonb_build_object('items',v_items,'nextCursor',v_next_cursor,'hasMore',v_has_more);
end$$;

create or replace function finance_api.get_integration_error(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_error_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare e finance.integration_errors%rowtype;v_trace jsonb;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getIntegrationError') then raise exception using errcode='42501',message='finance scope denied';end if;
  if not finance_private.integration_error_is_in_scope(p_error_id,p_legal_entity_id,p_dealer_account_id,p_branch_id) then return null;end if;
  select * into e from finance.integration_errors where id=p_error_id and legal_entity_id=p_legal_entity_id;if not found then return null;end if;
  select coalesce(pg_catalog.jsonb_agg(x.item order by x.occurred_at),'[]'::jsonb) into v_trace from(
    select i.created_at_utc occurred_at,pg_catalog.jsonb_build_object('direction','INBOX','messageId',i.id,'system',i.source_system,'eventType','MESSAGE','status',i.status,'schemaVersion',i.schema_version,'occurredAtUtc',i.created_at_utc) item from finance.inbox_messages i where i.correlation_id=e.correlation_id and(i.legal_entity_id=e.legal_entity_id or i.legal_entity_id is null)
    union all
    select o.created_at_utc,pg_catalog.jsonb_build_object('direction','OUTBOX','messageId',o.id,'system',o.topic,'eventType',o.event_type,'status',o.status,'attemptCount',o.attempt_count,'safeErrorCode',o.last_error_code,'occurredAtUtc',o.created_at_utc) from finance.outbox_messages o where o.correlation_id=e.correlation_id and(o.legal_entity_id=e.legal_entity_id or o.legal_entity_id is null)
  )x;
  return pg_catalog.jsonb_build_object('errorId',e.id,'sourceSystem',coalesce(e.redacted_detail->>'sourceSystem',e.source_type),'errorClass',e.source_type,'safeErrorCode',e.error_code,'status',case e.status when 'RETRY_SCHEDULED' then 'RETRYABLE' when 'IGNORED_WITH_APPROVAL' then 'IGNORED' when 'OPEN' then case when e.redacted_detail->>'retryable'='true' then 'RETRYABLE' else 'ACTION_REQUIRED' end else e.status end,'retryable',coalesce((e.redacted_detail->>'retryable')::boolean,false),'retryCount',e.occurrence_no-1,'safeDetail',e.redacted_detail-'dealerAccountId'-'branchId','occurredAtUtc',e.created_at_utc,'correlationId',e.correlation_id,'trace',v_trace,'version',e.version);
end$$;

revoke all on function finance_api.get_integration_error(uuid,uuid,uuid,uuid) from public,anon;
grant execute on function finance_api.get_integration_error(uuid,uuid,uuid,uuid) to authenticated;
