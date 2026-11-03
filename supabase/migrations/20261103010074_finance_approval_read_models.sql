-- Safe, read-only approval work list. Raw snapshots and evidence references are excluded.
create or replace function finance_api.list_approval_work_items(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_status text,p_subject_type text,p_cursor text,p_limit integer)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare v_limit integer:=coalesce(p_limit,50);v_time timestamptz;v_id uuid;v_items jsonb;v_more boolean;v_next text;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listApprovalWorkItems') then raise exception using errcode='42501',message='finance scope denied';end if;
 if v_limit not between 1 and 200 or(p_status is not null and p_status not in('PENDING','APPROVED','REJECTED','CANCELLED'))then raise exception using errcode='22023',message='invalid approval filter';end if;
 if p_cursor is not null then begin v_id:=p_cursor::uuid;select created_at_utc into v_time from finance.approval_requests where id=v_id;if not found then raise exception 'unknown cursor';end if;exception when others then raise exception using errcode='22023',message='invalid cursor';end;end if;
 with q as(select a.* from finance.approval_requests a where a.legal_entity_id=p_legal_entity_id and finance_private.approval_request_is_in_scope(a.id,p_legal_entity_id,p_dealer_account_id,p_branch_id)and(p_status is null or a.status=p_status)and(p_subject_type is null or a.subject_type=p_subject_type)and(v_time is null or(a.created_at_utc,a.id)<(v_time,v_id))order by a.created_at_utc desc,a.id desc limit v_limit+1),p as(select * from q limit v_limit)
 select coalesce((select jsonb_agg(jsonb_build_object('requestId',id,'subjectType',subject_type,'subjectId',subject_id,'policyVersion',approval_policy_version,'status',status,'preparedBy',prepared_by,'createdAtUtc',created_at_utc,'correlationId',correlation_id,'version',version)order by created_at_utc desc,id desc)from p),'[]'::jsonb),(select count(*) from q)>v_limit,case when(select count(*) from q)>v_limit then(select id::text from p order by created_at_utc,id limit 1)end into v_items,v_more,v_next;
 return jsonb_build_object('items',v_items,'hasMore',v_more,'nextCursor',v_next);
end$$;

create or replace function finance_api.get_approval_work_item(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_request_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare a finance.approval_requests%rowtype;v_steps jsonb;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getApprovalWorkItem') then raise exception using errcode='42501',message='finance scope denied';end if;
 if not finance_private.approval_request_is_in_scope(p_request_id,p_legal_entity_id,p_dealer_account_id,p_branch_id) then return null;end if;
 select * into a from finance.approval_requests where id=p_request_id;
 select coalesce(jsonb_agg(jsonb_build_object('stepNo',step_no,'requiredRole',required_role,'decision',decision,'decidedBy',decided_by,'decidedAtUtc',decided_at_utc)order by step_no),'[]'::jsonb)into v_steps from finance.approval_steps where approval_request_id=a.id;
 return jsonb_build_object('requestId',a.id,'subjectType',a.subject_type,'subjectId',a.subject_id,'policyVersion',a.approval_policy_version,'status',a.status,'preparedBy',a.prepared_by,'createdAtUtc',a.created_at_utc,'correlationId',a.correlation_id,'version',a.version,'steps',v_steps,'snapshotHash',a.subject_snapshot_hash);
end$$;
revoke all on function finance_api.list_approval_work_items(uuid,uuid,uuid,text,text,text,integer) from public,anon;grant execute on function finance_api.list_approval_work_items(uuid,uuid,uuid,text,text,text,integer) to authenticated;
revoke all on function finance_api.get_approval_work_item(uuid,uuid,uuid,uuid) from public,anon;grant execute on function finance_api.get_approval_work_item(uuid,uuid,uuid,uuid) to authenticated;
