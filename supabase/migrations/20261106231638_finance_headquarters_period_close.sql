-- Headquarters period close gate for accounting export.
-- A headquarters period can be locked only after every child branch period is
-- locked and two distinct active headquarters actors approve the same snapshot.

create or replace function finance_private.current_actor_can_manage_headquarters_period(
  p_actor_id uuid,p_period_id uuid
) returns boolean
language sql stable security definer
set search_path to 'pg_catalog','public','finance'
as $$
  select exists(
    select 1
    from public.app_users u
    join finance.finance_periods p on p.id=p_period_id
    where u.auth_user_id=p_actor_id
      and u.is_active
      and u.role in('CEO','GENERAL_MANAGER','FINANCE')
      and p.scope_type='HEADQUARTERS'
      and p.mode='LIVE'
      and p.status='OPEN'
  )
$$;

create or replace function finance_api.authorize_headquarters_period_close_request(
  p_period_id uuid,p_permission text
) returns jsonb
language sql stable security definer
set search_path to 'pg_catalog','auth','finance','finance_private'
as $$
  select case
    when p_permission='finance.headquarters-periods.close.request'
      and auth.uid() is not null
      and finance_private.current_actor_can_manage_headquarters_period(auth.uid(),p.id)
    then jsonb_build_object('allowed',true,'legalEntityId',p.legal_entity_id,'periodId',p.id,'status',p.status,'version',p.version)
    else jsonb_build_object('allowed',false)
  end
  from finance.finance_periods p where p.id=p_period_id
$$;

create or replace function finance_api.authorize_headquarters_period_close_approval(
  p_request_id uuid,p_permission text
) returns jsonb
language sql stable security definer
set search_path to 'pg_catalog','auth','finance','finance_private'
as $$
  select case
    when p_permission='finance.headquarters-periods.close.approve'
      and auth.uid() is not null
      and a.status='PENDING'
      and a.prepared_by<>auth.uid()
      and finance_private.current_actor_can_manage_headquarters_period(auth.uid(),p.id)
    then jsonb_build_object('allowed',true,'legalEntityId',p.legal_entity_id,'periodId',p.id,'requestId',a.id,'status',a.status,'version',a.version)
    else jsonb_build_object('allowed',false)
  end
  from finance.approval_requests a
  join finance.finance_periods p on p.id=a.subject_id
  where a.id=p_request_id and a.subject_type='HEADQUARTERS_FINANCE_PERIOD_CLOSE'
$$;

create or replace function finance_api.commit_headquarters_period_close_request(
  p_actor_id uuid,p_period_id uuid,p_expected_version bigint,p_reason_code text,
  p_note_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare p finance.finance_periods%rowtype;r finance.approval_requests%rowtype;v_child_hash text;v_snapshot jsonb;v_snapshot_hash text;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'')<>'service_role' then raise exception using errcode='42501',message='headquarters period worker denied';end if;
  if p_actor_id is null or p_period_id is null or p_expected_version<1 or coalesce(btrim(p_reason_code),'')='' or p_note_hash!~'^[a-fA-F0-9]{64}$' or coalesce(btrim(p_idempotency_key),'')='' or length(p_idempotency_key)>200 or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null then raise exception using errcode='22023',message='required headquarters close request fields missing';end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('headquarters-period-close:'||p_period_id::text,0));
  select * into p from finance.finance_periods where id=p_period_id for update;
  if not found then raise exception using errcode='P0002',message='headquarters finance period not found';end if;
  if not finance_private.current_actor_can_manage_headquarters_period(p_actor_id,p.id) then raise exception using errcode='42501',message='headquarters period scope denied';end if;
  select * into r from finance.approval_requests a where a.subject_type='HEADQUARTERS_FINANCE_PERIOD_CLOSE' and a.subject_id=p.id and a.status='PENDING' order by a.created_at_utc desc limit 1;
  if found then
    if r.subject_snapshot->>'idempotencyKey'=p_idempotency_key and r.subject_snapshot->>'intentHash'=p_intent_hash then return jsonb_build_object('outcome','REPLAY','requestId',r.id,'periodId',p.id,'status',r.status,'version',r.version);end if;
    return jsonb_build_object('outcome','CONFLICT','periodId',p.id);
  end if;
  if p.version<>p_expected_version then return jsonb_build_object('outcome','CONFLICT','periodId',p.id,'version',p.version);end if;
  if not exists(select 1 from finance.finance_periods c where c.parent_period_id=p.id) or exists(select 1 from finance.finance_periods c where c.parent_period_id=p.id and (c.status<>'LOCKED' or c.legal_entity_id<>p.legal_entity_id or c.period_start<>p.period_start or c.period_end<>p.period_end or c.currency_code<>p.currency_code)) then raise exception using errcode='23514',message='all child branch periods must be locked';end if;
  select encode(extensions.digest(convert_to(string_agg(c.id::text||':'||c.version::text||':'||coalesce(c.source_snapshot_hash,'')||':'||coalesce(c.check_snapshot_hash,'')||':'||c.status,'|' order by c.id),'UTF8'),'sha256'),'hex') into v_child_hash from finance.finance_periods c where c.parent_period_id=p.id;
  v_snapshot:=jsonb_build_object('periodId',p.id,'periodVersion',p.version,'childSnapshotHash',v_child_hash,'reasonCode',p_reason_code,'noteHash',lower(p_note_hash),'idempotencyKey',p_idempotency_key,'intentHash',lower(p_intent_hash));
  v_snapshot_hash:=encode(extensions.digest(convert_to(v_snapshot::text,'UTF8'),'sha256'),'hex');
  insert into finance.approval_requests(legal_entity_id,subject_type,subject_id,approval_policy_version,prepared_by,subject_snapshot,subject_snapshot_hash,status,created_by,correlation_id)
  values(p.legal_entity_id,'HEADQUARTERS_FINANCE_PERIOD_CLOSE',p.id,'headquarters-period-close-v1:'||p.version,p_actor_id,v_snapshot,v_snapshot_hash,'PENDING',p_actor_id,p_correlation_id) returning * into r;
  insert into finance.approval_steps(approval_request_id,step_no,required_role,created_by,correlation_id) values(r.id,1,'headquarters-finance-period-close-approver',p_actor_id,p_correlation_id);
  return jsonb_build_object('outcome','CREATED','requestId',r.id,'periodId',p.id,'status',r.status,'version',r.version,'childSnapshotHash',v_child_hash);
end$$;

create or replace function finance_api.commit_headquarters_period_close_approval(
  p_actor_id uuid,p_request_id uuid,p_expected_request_version bigint,p_expected_period_version bigint,
  p_note_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare a finance.approval_requests%rowtype;p finance.finance_periods%rowtype;v_child_hash text;v_new_version bigint;v_payload jsonb;v_payload_hash text;v_previous text;v_audit text;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'')<>'service_role' then raise exception using errcode='42501',message='headquarters period worker denied';end if;
  if p_actor_id is null or p_request_id is null or p_expected_request_version<1 or p_expected_period_version<1 or p_note_hash!~'^[a-fA-F0-9]{64}$' or coalesce(btrim(p_idempotency_key),'')='' or length(p_idempotency_key)>200 or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null then raise exception using errcode='22023',message='required headquarters close approval fields missing';end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('headquarters-period-close-approval:'||p_request_id::text,0));
  select * into a from finance.approval_requests where id=p_request_id for update;
  if not found then raise exception using errcode='P0002',message='headquarters close request not found';end if;
  select * into p from finance.finance_periods where id=a.subject_id for update;
  if a.subject_type<>'HEADQUARTERS_FINANCE_PERIOD_CLOSE' or a.status<>'PENDING' or a.version<>p_expected_request_version or p.version<>p_expected_period_version then return jsonb_build_object('outcome','CONFLICT');end if;
  if a.prepared_by=p_actor_id or not finance_private.current_actor_can_manage_headquarters_period(p_actor_id,p.id) then raise exception using errcode='42501',message='headquarters maker checker violation';end if;
  if not exists(select 1 from finance.finance_periods c where c.parent_period_id=p.id) or exists(select 1 from finance.finance_periods c where c.parent_period_id=p.id and c.status<>'LOCKED') then raise exception using errcode='23514',message='all child branch periods must remain locked';end if;
  select encode(extensions.digest(convert_to(string_agg(c.id::text||':'||c.version::text||':'||coalesce(c.source_snapshot_hash,'')||':'||coalesce(c.check_snapshot_hash,'')||':'||c.status,'|' order by c.id),'UTF8'),'sha256'),'hex') into v_child_hash from finance.finance_periods c where c.parent_period_id=p.id;
  if v_child_hash<>a.subject_snapshot->>'childSnapshotHash' then raise exception using errcode='23514',message='child period snapshot changed';end if;
  update finance.approval_steps set decision='APPROVE',decided_by=p_actor_id,decided_at_utc=now(),evidence_ref=lower(p_note_hash),correlation_id=p_correlation_id where approval_request_id=a.id and step_no=1 and decision is null;
  if not found then return jsonb_build_object('outcome','CONFLICT');end if;
  update finance.approval_requests set status='APPROVED',version=version+1,correlation_id=p_correlation_id where id=a.id;
  update finance.finance_periods set status='LOCKED',source_snapshot_hash=v_child_hash,check_snapshot_hash=v_child_hash,prepared_by=a.prepared_by,approved_by=p_actor_id,locked_at_utc=now(),version=version+1,correlation_id=p_correlation_id where id=p.id and version=p_expected_period_version returning version into v_new_version;
  if not found then return jsonb_build_object('outcome','CONFLICT');end if;
  v_payload:=jsonb_build_object('periodId',p.id,'legalEntityId',p.legal_entity_id,'status','LOCKED','version',v_new_version,'periodStart',p.period_start,'periodEnd',p.period_end,'currencyCode',p.currency_code,'childSnapshotHash',v_child_hash,'requestId',a.id,'idempotencyKey',p_idempotency_key,'intentHash',lower(p_intent_hash));
  v_payload_hash:=encode(extensions.digest(convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id) values(p.legal_entity_id,'finance.period','HEADQUARTERS_FINANCE_PERIOD_LOCKED','finance_period',p.id,v_new_version,v_payload,v_payload_hash,'PENDING',p_correlation_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p.legal_entity_id::text,0));
  select e.integrity_hash into v_previous from finance.audit_events e where e.legal_entity_id=p.legal_entity_id order by e.created_at_utc desc,e.id desc limit 1;
  v_audit:=encode(extensions.digest(convert_to(coalesce(v_previous,'GENESIS')||':'||p.id::text||':HEADQUARTERS_FINANCE_PERIOD_LOCKED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id) values(p.legal_entity_id,p_actor_id,'USER','HEADQUARTERS_FINANCE_PERIOD_LOCKED','finance_period',p.id,'ALLOW',v_payload_hash,v_previous,v_audit,jsonb_build_object('requestId',a.id,'childSnapshotHash',v_child_hash,'noteHash',lower(p_note_hash)),p_correlation_id);
  return jsonb_build_object('outcome','LOCKED','requestId',a.id,'periodId',p.id,'status','LOCKED','version',v_new_version,'childSnapshotHash',v_child_hash);
end$$;

revoke all on function finance_private.current_actor_can_manage_headquarters_period(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_api.authorize_headquarters_period_close_request(uuid,text) from public,anon;
revoke all on function finance_api.authorize_headquarters_period_close_approval(uuid,text) from public,anon;
revoke all on function finance_api.commit_headquarters_period_close_request(uuid,uuid,bigint,text,text,text,text,uuid) from public,anon,authenticated;
revoke all on function finance_api.commit_headquarters_period_close_approval(uuid,uuid,bigint,bigint,text,text,text,uuid) from public,anon,authenticated;
grant execute on function finance_api.authorize_headquarters_period_close_request(uuid,text) to authenticated;
grant execute on function finance_api.authorize_headquarters_period_close_approval(uuid,text) to authenticated;
grant execute on function finance_api.commit_headquarters_period_close_request(uuid,uuid,bigint,text,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_headquarters_period_close_approval(uuid,uuid,bigint,bigint,text,text,text,uuid) to service_role;
