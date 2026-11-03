-- Persistent, branch-scoped evidence requests for finance disputes.

create table finance.dispute_evidence_requests(
  id uuid primary key default gen_random_uuid(),legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dispute_id uuid not null references finance.disputes(id) on delete restrict,request_no text not null,request_type text not null check(request_type in('INVOICE','CONTRACT','PAYMENT_PROOF','SERVICE_PROOF','OTHER')),
  message_hash text not null check(message_hash~'^[a-fA-F0-9]{64}$'),status text not null check(status in('OPEN','FULFILLED','CANCELLED')),
  requested_by uuid not null,fulfilled_at_utc timestamptz null,idempotency_key text not null,intent_hash text not null check(intent_hash~'^[a-fA-F0-9]{64}$'),
  version bigint not null default 1 check(version>0),created_at_utc timestamptz not null default now(),created_by uuid not null,correlation_id uuid not null,
  unique(legal_entity_id,request_no),unique(legal_entity_id,idempotency_key),check((status='FULFILLED')=(fulfilled_at_utc is not null))
);
create index dispute_evidence_requests_dispute_idx on finance.dispute_evidence_requests(dispute_id,created_at_utc desc,id desc);
alter table finance.dispute_evidence_requests enable row level security;alter table finance.dispute_evidence_requests force row level security;
revoke all on table finance.dispute_evidence_requests from public,anon,authenticated;

create or replace function finance_private.current_dispute_evidence_request_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_private.resolve_dispute_evidence_request_scope(p_actor_id uuid,p_dispute_id uuid,p_permission text)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;r record;
begin
  if p_permission<>'finance.disputes.evidence-request' then return null;end if;
  select * into u from public.app_users where auth_user_id=p_actor_id and is_active limit 1;if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE') then return null;end if;
  select d.legal_entity_id,o.dealer_account_id,o.branch_id,d.status,d.version into r from finance.disputes d join finance.open_items o on o.id=d.open_item_id where d.id=p_dispute_id;
  if not found or r.status not in('DRAFT','SUBMITTED','UNDER_REVIEW') or not finance_private.current_actor_can_read_scope(p_actor_id,r.legal_entity_id,r.dealer_account_id,r.branch_id,'getDispute') then return null;end if;
  return jsonb_build_object('allowed',true,'legalEntityId',r.legal_entity_id,'dealerAccountId',r.dealer_account_id,'branchId',r.branch_id,'status',r.status,'version',r.version);
end$$;

create or replace function finance_api.authorize_dispute_evidence_request(p_dispute_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance_private as $$select finance_private.resolve_dispute_evidence_request_scope(auth.uid(),p_dispute_id,p_permission)$$;

create or replace function finance_api.commit_dispute_evidence_request(p_actor_id uuid,p_dispute_id uuid,p_request_type text,p_message_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private as $$
declare d finance.disputes%rowtype;v_existing finance.dispute_evidence_requests%rowtype;v_id uuid;v_no text;v_previous text;v_audit text;
begin
  if not finance_private.current_dispute_evidence_request_committer_is_trusted() or finance_private.resolve_dispute_evidence_request_scope(p_actor_id,p_dispute_id,'finance.disputes.evidence-request') is null then raise exception using errcode='42501',message='trusted evidence request authorization required';end if;
  if p_request_type not in('INVOICE','CONTRACT','PAYMENT_PROOF','SERVICE_PROOF','OTHER') or p_message_hash!~'^[a-fA-F0-9]{64}$' or length(btrim(coalesce(p_idempotency_key,''))) not between 8 and 200 or p_intent_hash!~'^[a-fA-F0-9]{64}$' then raise exception using errcode='22023',message='invalid evidence request command';end if;
  select * into d from finance.disputes where id=p_dispute_id for update;if not found then raise exception using errcode='P0002',message='dispute not found';end if;
  select * into v_existing from finance.dispute_evidence_requests where legal_entity_id=d.legal_entity_id and idempotency_key=p_idempotency_key;
  if found then if v_existing.intent_hash=p_intent_hash then return jsonb_build_object('outcome','REPLAY','requestId',v_existing.id,'requestNo',v_existing.request_no,'status',v_existing.status,'version',v_existing.version);end if;return jsonb_build_object('outcome','CONFLICT');end if;
  v_id:=gen_random_uuid();v_no:='EVR-'||to_char(clock_timestamp(),'YYYYMMDD')||'-'||upper(substr(replace(v_id::text,'-',''),1,8));
  insert into finance.dispute_evidence_requests(id,legal_entity_id,dispute_id,request_no,request_type,message_hash,status,requested_by,idempotency_key,intent_hash,created_by,correlation_id) values(v_id,d.legal_entity_id,d.id,v_no,p_request_type,p_message_hash,'OPEN',p_actor_id,p_idempotency_key,p_intent_hash,p_actor_id,p_correlation_id);
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id) values(d.legal_entity_id,'finance.dispute','DISPUTE_EVIDENCE_REQUESTED','DISPUTE_EVIDENCE_REQUEST',v_id,1,jsonb_build_object('requestId',v_id,'requestNo',v_no,'disputeId',d.id,'requestType',p_request_type,'status','OPEN','messageHash',p_message_hash,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash),p_intent_hash,'PENDING',p_correlation_id);
  perform pg_advisory_xact_lock(hashtextextended('audit:'||d.legal_entity_id::text,0));select integrity_hash into v_previous from finance.audit_events where legal_entity_id=d.legal_entity_id order by created_at_utc desc,id desc limit 1;v_audit:=encode(extensions.digest(convert_to(coalesce(v_previous,'GENESIS')||':'||v_id::text||':DISPUTE_EVIDENCE_REQUESTED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id) values(d.legal_entity_id,p_actor_id,'USER','DISPUTE_EVIDENCE_REQUESTED','DISPUTE',d.id,'ALLOW',p_request_type,null,p_intent_hash,v_previous,v_audit,jsonb_build_object('requestId',v_id,'requestNo',v_no,'messageHash',p_message_hash),p_correlation_id);
  return jsonb_build_object('outcome','CREATED','requestId',v_id,'requestNo',v_no,'status','OPEN','version',1);
end$$;

create or replace function finance_api.list_dispute_evidence_requests(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_dispute_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare v_items jsonb;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDispute') then raise exception using errcode='42501',message='finance scope denied';end if;
  if not exists(select 1 from finance.disputes d join finance.open_items o on o.id=d.open_item_id where d.id=p_dispute_id and d.legal_entity_id=p_legal_entity_id and o.dealer_account_id=p_dealer_account_id and o.branch_id=p_branch_id) then return jsonb_build_object('items','[]'::jsonb);end if;
  select coalesce(jsonb_agg(jsonb_build_object('requestId',r.id,'requestNo',r.request_no,'requestType',r.request_type,'status',r.status,'requestedBy',r.requested_by,'createdAtUtc',r.created_at_utc,'fulfilledAtUtc',r.fulfilled_at_utc,'version',r.version) order by r.created_at_utc desc,r.id desc),'[]'::jsonb) into v_items from finance.dispute_evidence_requests r where r.dispute_id=p_dispute_id and r.legal_entity_id=p_legal_entity_id;
  return jsonb_build_object('items',v_items);
end$$;

revoke all on function finance_private.current_dispute_evidence_request_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_private.resolve_dispute_evidence_request_scope(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_api.authorize_dispute_evidence_request(uuid,text) from public,anon;grant execute on function finance_api.authorize_dispute_evidence_request(uuid,text) to authenticated;
revoke all on function finance_api.commit_dispute_evidence_request(uuid,uuid,text,text,text,text,uuid) from public,anon,authenticated;grant execute on function finance_api.commit_dispute_evidence_request(uuid,uuid,text,text,text,text,uuid) to service_role;
revoke all on function finance_api.list_dispute_evidence_requests(uuid,uuid,uuid,uuid) from public,anon;grant execute on function finance_api.list_dispute_evidence_requests(uuid,uuid,uuid,uuid) to authenticated;
