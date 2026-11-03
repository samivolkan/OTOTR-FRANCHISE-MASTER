-- Safe approval prioritization and action routing. Raw snapshots and evidence references remain server-side.
create or replace function finance_private.approval_work_item_projection(a finance.approval_requests)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private as $$
declare v_amount numeric;v_currency text;v_evidence integer:=0;v_risk text;v_screen text;v_operation text;
begin
  if a.subject_type='PASS_THROUGH_EXPENSE' then
    select e.distributable_amount,e.currency_code into v_amount,v_currency from finance.pass_through_expenses e where e.id=a.subject_id and e.legal_entity_id=a.legal_entity_id;
    v_screen:='SCR-10';v_operation:='approveExpense';
  elsif a.subject_type='DISPUTE_DECISION' then
    select d.disputed_amount,o.currency_code into v_amount,v_currency from finance.disputes d left join finance.open_items o on o.id=d.open_item_id where d.id=a.subject_id and d.legal_entity_id=a.legal_entity_id;
    v_screen:='SCR-11';v_operation:='decideDispute';
  elsif a.subject_type='CONTRACT_VERSION' then v_screen:='SCR-03';v_operation:='approveContractVersion';
  elsif a.subject_type in('FINANCE_PERIOD_REOPEN','FINANCE_PERIOD_CLOSE') then v_screen:='SCR-12';v_operation:=case when a.subject_type='FINANCE_PERIOD_REOPEN' then 'approveFinancePeriodReopen' else 'approveFinancePeriodClose'end;
  end if;
  select count(*) into v_evidence from finance.document_links dl where dl.legal_entity_id=a.legal_entity_id and((dl.subject_type=a.subject_type and dl.subject_id=a.subject_id)or(dl.subject_type=a.subject_type and dl.subject_id=a.id));
  v_risk:=case when a.subject_type in('FINANCE_PERIOD_REOPEN','FINANCE_PERIOD_CLOSE') then 'CRITICAL' when a.subject_type='CONTRACT_VERSION' then 'HIGH' when coalesce(v_amount,0)>=100000 then 'HIGH' when coalesce(v_amount,0)>=25000 then 'MEDIUM' else 'LOW'end;
  return jsonb_build_object('requestId',a.id,'subjectType',a.subject_type,'subjectId',a.subject_id,'policyVersion',a.approval_policy_version,'status',a.status,'preparedBy',a.prepared_by,'createdAtUtc',a.created_at_utc,'correlationId',a.correlation_id,'version',a.version,'riskLevel',v_risk,'amount',case when v_amount is null then null else v_amount::text end,'currency',v_currency,'evidenceCount',v_evidence,'action',jsonb_build_object('screenId',v_screen,'operationId',v_operation,'available',a.status='PENDING' and v_screen is not null and v_operation is not null),'rawSnapshotExposed',false,'rawEvidenceReferenceExposed',false);
end$$;

create or replace function finance_api.list_approval_work_items(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_status text,p_subject_type text,p_cursor text,p_limit integer)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare v_limit integer:=coalesce(p_limit,50);v_id uuid;v_items jsonb;v_more boolean;v_next text;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listApprovalWorkItems') then raise exception using errcode='42501',message='finance scope denied';end if;
 if v_limit not between 1 and 200 or(p_status is not null and p_status not in('PENDING','APPROVED','REJECTED','CANCELLED'))then raise exception using errcode='22023',message='invalid approval filter';end if;
 if p_cursor is not null then begin v_id:=p_cursor::uuid;exception when others then raise exception using errcode='22023',message='invalid cursor';end;end if;
 if v_id is not null and not finance_private.approval_request_is_in_scope(v_id,p_legal_entity_id,p_dealer_account_id,p_branch_id)then raise exception using errcode='22023',message='invalid cursor';end if;
 with scoped as(select a.* from finance.approval_requests a where a.legal_entity_id=p_legal_entity_id and finance_private.approval_request_is_in_scope(a.id,p_legal_entity_id,p_dealer_account_id,p_branch_id)and(p_status is null or a.status=p_status)and(p_subject_type is null or a.subject_type=p_subject_type)),projected as(select s.*,finance_private.approval_work_item_projection(s) item from scoped s),ranked as(select p.*,row_number()over(order by case when p.status='PENDING' then 0 else 1 end,case p.item->>'riskLevel' when 'CRITICAL' then 0 when 'HIGH' then 1 when 'MEDIUM' then 2 else 3 end,p.created_at_utc,p.id)rn from projected p),anchor as(select coalesce((select rn from ranked where id=v_id),0)rn),q as(select r.* from ranked r,anchor c where r.rn>c.rn order by r.rn limit v_limit+1),p as(select * from q limit v_limit)
 select coalesce((select jsonb_agg(x.item order by x.rn)from p x),'[]'::jsonb),(select count(*) from q)>v_limit,case when(select count(*) from q)>v_limit then(select id::text from p order by rn desc limit 1)end into v_items,v_more,v_next;
 return jsonb_build_object('items',v_items,'hasMore',v_more,'nextCursor',v_next,'ordering','PENDING_RISK_THEN_AGE','rawSnapshotExposed',false,'rawEvidenceReferenceExposed',false);
end$$;

create or replace function finance_api.get_approval_work_item(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_request_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare a finance.approval_requests%rowtype;v_steps jsonb;v_base jsonb;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getApprovalWorkItem') then raise exception using errcode='42501',message='finance scope denied';end if;
 if not finance_private.approval_request_is_in_scope(p_request_id,p_legal_entity_id,p_dealer_account_id,p_branch_id) then return null;end if;
 select * into a from finance.approval_requests where id=p_request_id;
 select coalesce(jsonb_agg(jsonb_build_object('stepNo',step_no,'requiredRole',required_role,'decision',decision,'decidedBy',decided_by,'decidedAtUtc',decided_at_utc)order by step_no),'[]'::jsonb)into v_steps from finance.approval_steps where approval_request_id=a.id;
 v_base:=finance_private.approval_work_item_projection(a);
 return v_base||jsonb_build_object('steps',v_steps,'snapshotHash',a.subject_snapshot_hash);
end$$;

revoke all on function finance_private.approval_work_item_projection(finance.approval_requests) from public,anon,authenticated;
revoke all on function finance_api.list_approval_work_items(uuid,uuid,uuid,text,text,text,integer) from public,anon;grant execute on function finance_api.list_approval_work_items(uuid,uuid,uuid,text,text,text,integer) to authenticated;
revoke all on function finance_api.get_approval_work_item(uuid,uuid,uuid,uuid) from public,anon;grant execute on function finance_api.get_approval_work_item(uuid,uuid,uuid,uuid) to authenticated;
