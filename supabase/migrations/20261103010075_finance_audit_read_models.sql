-- Branch-scoped audit projection and integrity-chain trace without raw context.
create or replace function finance_api.list_audit_events(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_action_code text,p_subject_type text,p_cursor text,p_limit integer)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare v_limit integer:=coalesce(p_limit,50);v_time timestamptz;v_id uuid;v_items jsonb;v_more boolean;v_next text;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listAuditEvents') then raise exception using errcode='42501',message='finance scope denied';end if;if v_limit not between 1 and 200 then raise exception using errcode='22023',message='invalid audit filter';end if;
 if p_cursor is not null then begin v_id:=p_cursor::uuid;select created_at_utc into v_time from finance.audit_events where id=v_id;if not found then raise exception 'unknown cursor';end if;exception when others then raise exception using errcode='22023',message='invalid cursor';end;end if;
 with q as(select a.* from finance.audit_events a where a.legal_entity_id=p_legal_entity_id and finance_private.audit_event_is_in_scope(a.id,p_legal_entity_id,p_dealer_account_id,p_branch_id)and(p_action_code is null or a.action_code=p_action_code)and(p_subject_type is null or a.subject_type=p_subject_type)and(v_time is null or(a.created_at_utc,a.id)<(v_time,v_id))order by a.created_at_utc desc,a.id desc limit v_limit+1),p as(select * from q limit v_limit)
 select coalesce((select jsonb_agg(jsonb_build_object('eventId',id,'actorId',actor_id,'actorType',actor_type,'actionCode',action_code,'subjectType',subject_type,'subjectId',subject_id,'decision',decision,'reasonCode',reason_code,'createdAtUtc',created_at_utc,'correlationId',correlation_id,'integrityHash',integrity_hash,'previousIntegrityHash',previous_integrity_hash)order by created_at_utc desc,id desc)from p),'[]'::jsonb),(select count(*) from q)>v_limit,case when(select count(*) from q)>v_limit then(select id::text from p order by created_at_utc,id limit 1)end into v_items,v_more,v_next;
 return jsonb_build_object('items',v_items,'hasMore',v_more,'nextCursor',v_next);
end$$;
create or replace function finance_api.get_audit_correlation_trace(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_correlation_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare v_items jsonb;v_count integer;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getAuditCorrelationTrace') then raise exception using errcode='42501',message='finance scope denied';end if;
 select coalesce(jsonb_agg(jsonb_build_object('eventId',id,'actorId',actor_id,'actorType',actor_type,'actionCode',action_code,'subjectType',subject_type,'subjectId',subject_id,'decision',decision,'reasonCode',reason_code,'createdAtUtc',created_at_utc,'integrityHash',integrity_hash,'previousIntegrityHash',previous_integrity_hash)order by created_at_utc,id),'[]'::jsonb),count(*) into v_items,v_count from finance.audit_events a where a.legal_entity_id=p_legal_entity_id and a.correlation_id=p_correlation_id and finance_private.audit_event_is_in_scope(a.id,p_legal_entity_id,p_dealer_account_id,p_branch_id);
 return jsonb_build_object('correlationId',p_correlation_id,'items',v_items,'eventCount',v_count,'chainProjection','HASH_REFERENCES_ONLY','rawContextExposed',false);
end$$;
revoke all on function finance_api.list_audit_events(uuid,uuid,uuid,text,text,text,integer) from public,anon;grant execute on function finance_api.list_audit_events(uuid,uuid,uuid,text,text,text,integer) to authenticated;
revoke all on function finance_api.get_audit_correlation_trace(uuid,uuid,uuid,uuid) from public,anon;grant execute on function finance_api.get_audit_correlation_trace(uuid,uuid,uuid,uuid) to authenticated;
