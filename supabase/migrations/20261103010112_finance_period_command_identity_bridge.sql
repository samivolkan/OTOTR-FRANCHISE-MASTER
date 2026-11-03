-- ERP identity bridge for finance-period close/reopen governance commands.
-- Browser JWT only authorizes scope; service_role performs every mutation.

create or replace function finance_private.current_period_closing_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_period_reopen_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_private.current_actor_can_manage_period(
  p_actor_id uuid,p_period_id uuid,p_action text
) returns boolean language sql stable security definer
set search_path=pg_catalog,public,finance,finance_private as $$
 select exists(
  select 1 from public.app_users u join finance.finance_periods p on p.id=p_period_id
  where u.auth_user_id=p_actor_id and u.is_active and u.role in('CEO','GENERAL_MANAGER','FINANCE')
    and p.scope_type='BRANCH' and p.parent_period_id is not null
    and finance_private.current_actor_can_read_scope(p_actor_id,p.legal_entity_id,p.dealer_account_id,p.branch_id,'getCurrentFinancePeriod')
    and case p_action
      when 'CLOSE_REQUEST' then p.mode='LIVE' and p.status='APPROVED'
      when 'CLOSE_APPROVE' then p.mode='LIVE' and p.status='APPROVED'
      when 'CLOSE_LOCK' then p.mode='LIVE' and p.status='APPROVED'
      when 'REOPEN_REQUEST' then p.mode='LIVE' and p.status='LOCKED'
      when 'REOPEN_APPROVE' then p.mode='LIVE' and p.status='REOPEN_PENDING'
      else false end
 )
$$;

create or replace function finance_private.current_actor_can_close_period(p_actor_id uuid,p_period_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance_private as
$$select finance_private.current_actor_can_manage_period(p_actor_id,p_period_id,'CLOSE_LOCK')$$;
create or replace function finance_private.current_actor_can_request_period_reopen(p_actor_id uuid,p_period_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance_private as
$$select finance_private.current_actor_can_manage_period(p_actor_id,p_period_id,'REOPEN_REQUEST')$$;
create or replace function finance_private.current_actor_can_approve_period_reopen(p_actor_id uuid,p_request_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance,finance_private as $$
 select exists(select 1 from finance.approval_requests a where a.id=p_request_id and a.subject_type='FINANCE_PERIOD_REOPEN'
  and a.status='PENDING' and a.prepared_by<>p_actor_id
  and finance_private.current_actor_can_manage_period(p_actor_id,a.subject_id,'REOPEN_APPROVE'))
$$;

create or replace function finance_api.authorize_period_close_request(p_period_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,auth,finance,finance_private as $$
 select case when auth.uid() is not null and p_permission='finance.periods.close.request'
  and finance_private.current_actor_can_manage_period(auth.uid(),p.id,'CLOSE_REQUEST')
  then jsonb_build_object('allowed',true,'legalEntityId',p.legal_entity_id,'dealerAccountId',p.dealer_account_id,'branchId',p.branch_id,'status',p.status,'version',p.version)
  else jsonb_build_object('allowed',false) end from finance.finance_periods p where p.id=p_period_id
$$;
create or replace function finance_api.authorize_period_close_approval(p_request_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,auth,finance,finance_private as $$
 select case when auth.uid() is not null and p_permission='finance.periods.close.approve' and a.status='PENDING'
  and a.prepared_by<>auth.uid() and finance_private.current_actor_can_manage_period(auth.uid(),p.id,'CLOSE_APPROVE')
  then jsonb_build_object('allowed',true,'legalEntityId',p.legal_entity_id,'dealerAccountId',p.dealer_account_id,'branchId',p.branch_id,'periodId',p.id,'status',a.status,'version',a.version)
  else jsonb_build_object('allowed',false) end
 from finance.approval_requests a join finance.finance_periods p on p.id=a.subject_id
 where a.id=p_request_id and a.subject_type='FINANCE_PERIOD_CLOSE'
$$;

create or replace function finance_api.commit_period_close_request(
 p_actor_id uuid,p_period_id uuid,p_expected_version bigint,p_reason_code text,p_note_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare p finance.finance_periods%rowtype;r uuid;v_snapshot jsonb;v_hash text;
begin
 if not finance_private.current_period_closing_worker_is_trusted() then raise exception using errcode='42501',message='period closing worker denied';end if;
 if p_actor_id is null or p_period_id is null or p_expected_version<1 or pg_catalog.coalesce(pg_catalog.btrim(p_reason_code),'')='' or p_note_hash!~'^[a-fA-F0-9]{64}$' or pg_catalog.coalesce(pg_catalog.btrim(p_idempotency_key),'')='' or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null then raise exception using errcode='22023',message='required close request fields missing';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('period-close-request:'||p_period_id::text,0));
 select * into p from finance.finance_periods where id=p_period_id for update;
 if not found then raise exception using errcode='P0002',message='finance period not found';end if;
 if p.version<>p_expected_version or p.status<>'APPROVED' or p.prepared_by<>p_actor_id then return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
 select a.id into r from finance.approval_requests a where a.subject_type='FINANCE_PERIOD_CLOSE' and a.subject_id=p.id and a.status='PENDING' order by a.created_at_utc desc limit 1;
 if found then return pg_catalog.jsonb_build_object('outcome','REPLAY','requestId',r,'periodId',p.id,'status','PENDING','version',1);end if;
 v_snapshot:=pg_catalog.jsonb_build_object('periodId',p.id,'periodVersion',p.version,'sourceSnapshotHash',p.source_snapshot_hash,'reasonCode',p_reason_code,'noteHash',p_note_hash,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash);
 v_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_snapshot::text,'UTF8'),'sha256'),'hex');
 insert into finance.approval_requests(legal_entity_id,subject_type,subject_id,approval_policy_version,prepared_by,subject_snapshot,subject_snapshot_hash,status,created_by,correlation_id)
 values(p.legal_entity_id,'FINANCE_PERIOD_CLOSE',p.id,'period-close-v1:'||p.version,p_actor_id,v_snapshot,v_hash,'PENDING',p_actor_id,p_correlation_id) returning id into r;
 insert into finance.approval_steps(approval_request_id,step_no,required_role,created_by,correlation_id) values(r,1,'finance-period-close-approver',p_actor_id,p_correlation_id);
 return pg_catalog.jsonb_build_object('outcome','CREATED','requestId',r,'periodId',p.id,'status','PENDING','version',1);
end$$;

create or replace function finance_api.commit_period_close_approval(
 p_actor_id uuid,p_request_id uuid,p_expected_version bigint,p_reason_code text,p_note_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare a finance.approval_requests%rowtype;p finance.finance_periods%rowtype;
begin
 if not finance_private.current_period_closing_worker_is_trusted() then raise exception using errcode='42501',message='period closing worker denied';end if;
 if p_actor_id is null or p_request_id is null or p_expected_version<1 or pg_catalog.coalesce(pg_catalog.btrim(p_reason_code),'')='' or p_note_hash!~'^[a-fA-F0-9]{64}$' or pg_catalog.coalesce(pg_catalog.btrim(p_idempotency_key),'')='' or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null then raise exception using errcode='22023',message='required close approval fields missing';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('period-close-approval:'||p_request_id::text,0));
 select * into a from finance.approval_requests where id=p_request_id for update;select * into p from finance.finance_periods where id=a.subject_id for update;
 if a.subject_type<>'FINANCE_PERIOD_CLOSE' or a.status<>'PENDING' or a.version<>p_expected_version or a.prepared_by=p_actor_id or p.status<>'APPROVED' then return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
 update finance.approval_steps set decision='APPROVE',decided_by=p_actor_id,decided_at_utc=pg_catalog.now(),evidence_ref=p_note_hash,correlation_id=p_correlation_id where approval_request_id=a.id and step_no=1 and decision is null;
 if not found then return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
 update finance.approval_requests set status='APPROVED',version=version+1,correlation_id=p_correlation_id where id=a.id;
 return pg_catalog.jsonb_build_object('outcome','APPROVED','requestId',a.id,'periodId',p.id,'status','APPROVED','version',a.version+1);
end$$;

revoke all on function finance_private.current_actor_can_manage_period(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_api.authorize_period_close_request(uuid,text) from public,anon;
revoke all on function finance_api.authorize_period_close_approval(uuid,text) from public,anon;
grant execute on function finance_api.authorize_period_close_request(uuid,text) to authenticated;
grant execute on function finance_api.authorize_period_close_approval(uuid,text) to authenticated;
grant execute on function finance_api.commit_period_close_request(uuid,uuid,bigint,text,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_period_close_approval(uuid,uuid,bigint,text,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_period_closing(uuid,uuid,uuid,uuid,uuid,text,uuid,bigint,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_period_reopen_request(uuid,uuid,uuid,uuid,uuid,text,text,uuid[],bigint,text,text,uuid) to service_role;
grant execute on function finance_api.commit_period_reopen_approval(uuid,uuid,uuid,uuid,uuid,text,text,bigint,text,text,uuid) to service_role;
