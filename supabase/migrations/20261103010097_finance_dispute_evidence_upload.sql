-- Authenticated private storage upload and server-verified evidence finalization.

create or replace function finance_private.current_actor_can_upload_dispute_evidence(p_actor_id uuid,p_request_id uuid)
returns boolean language plpgsql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;r record;
begin
  select * into u from public.app_users where auth_user_id=p_actor_id and is_active limit 1;if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE','BRANCH_MANAGER') then return false;end if;
  select er.status,d.legal_entity_id,o.dealer_account_id,o.branch_id into r from finance.dispute_evidence_requests er join finance.disputes d on d.id=er.dispute_id join finance.open_items o on o.id=d.open_item_id where er.id=p_request_id;
  return found and r.status in('OPEN','FULFILLED') and finance_private.current_actor_can_read_scope(p_actor_id,r.legal_entity_id,r.dealer_account_id,r.branch_id,'getDispute');
end$$;

drop policy if exists finance_dispute_evidence_object_insert on storage.objects;
create policy finance_dispute_evidence_object_insert on storage.objects for insert to authenticated with check(
  bucket_id='ototr-evidence' and (storage.foldername(name))[1]='finance-disputes' and array_length(storage.foldername(name),1)=5
  and (storage.foldername(name))[5]~'^[0-9a-fA-F-]{36}$'
  and finance_private.current_actor_can_upload_dispute_evidence(auth.uid(),((storage.foldername(name))[5])::uuid)
  and exists(select 1 from finance.dispute_evidence_requests r where r.id=((storage.foldername(name))[5])::uuid and r.status='OPEN')
);

drop policy if exists finance_dispute_evidence_object_select on storage.objects;
create policy finance_dispute_evidence_object_select on storage.objects for select to authenticated using(
  bucket_id='ototr-evidence' and (storage.foldername(name))[1]='finance-disputes' and array_length(storage.foldername(name),1)=5
  and (storage.foldername(name))[5]~'^[0-9a-fA-F-]{36}$'
  and finance_private.current_actor_can_upload_dispute_evidence(auth.uid(),((storage.foldername(name))[5])::uuid)
);

create or replace function finance_private.current_dispute_evidence_finalize_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_api.authorize_dispute_evidence_finalize(p_request_id uuid,p_permission text)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private as $$
declare r record;
begin
  if auth.uid() is null or p_permission<>'finance.disputes.evidence-finalize' or not finance_private.current_actor_can_upload_dispute_evidence(auth.uid(),p_request_id) then return null;end if;
  select er.dispute_id,d.legal_entity_id,o.dealer_account_id,o.branch_id,er.status,er.version into r from finance.dispute_evidence_requests er join finance.disputes d on d.id=er.dispute_id join finance.open_items o on o.id=d.open_item_id where er.id=p_request_id;
  return jsonb_build_object('allowed',true,'legalEntityId',r.legal_entity_id,'dealerAccountId',r.dealer_account_id,'branchId',r.branch_id,'disputeId',r.dispute_id,'status',r.status,'version',r.version);
end$$;

create or replace function finance_api.commit_dispute_evidence_finalize(p_actor_id uuid,p_request_id uuid,p_external_document_id uuid,p_object_key text,p_content_type text,p_size_bytes bigint,p_content_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private,storage as $$
declare er finance.dispute_evidence_requests%rowtype;d finance.disputes%rowtype;o finance.open_items%rowtype;so storage.objects%rowtype;dr uuid;v_existing record;v_expected_prefix text;v_previous text;v_audit text;
begin
  if not finance_private.current_dispute_evidence_finalize_committer_is_trusted() or not finance_private.current_actor_can_upload_dispute_evidence(p_actor_id,p_request_id) then raise exception using errcode='42501',message='trusted evidence finalize authorization required';end if;
  if p_content_type not in('image/jpeg','image/png','image/webp','application/pdf') or p_size_bytes<1 or p_size_bytes>10485760 or p_content_hash!~'^[a-fA-F0-9]{64}$' or length(btrim(coalesce(p_idempotency_key,''))) not between 8 and 200 or p_intent_hash!~'^[a-fA-F0-9]{64}$' then raise exception using errcode='22023',message='invalid evidence finalize command';end if;
  select * into er from finance.dispute_evidence_requests where id=p_request_id for update;if not found then raise exception using errcode='P0002',message='evidence request not found';end if;
  select payload into v_existing from finance.outbox_messages where legal_entity_id=er.legal_entity_id and event_type='DISPUTE_EVIDENCE_FULFILLED' and aggregate_id=er.id and payload->>'idempotencyKey'=p_idempotency_key order by created_at_utc desc,id desc limit 1;
  if found then if v_existing.payload->>'intentHash'=p_intent_hash then return jsonb_build_object('outcome','REPLAY','requestId',er.id,'status','FULFILLED','documentId',v_existing.payload->>'documentId');end if;return jsonb_build_object('outcome','CONFLICT');end if;
  select * into d from finance.disputes where id=er.dispute_id;select * into o from finance.open_items where id=d.open_item_id;
  v_expected_prefix:='finance-disputes/'||d.legal_entity_id::text||'/'||o.branch_id::text||'/'||d.id::text||'/'||er.id::text||'/';
  if p_object_key!~'^[a-zA-Z0-9/_\.-]+$' or position(v_expected_prefix in p_object_key)<>1 then raise exception using errcode='42501',message='evidence object scope mismatch';end if;
  select * into so from storage.objects where bucket_id='ototr-evidence' and name=p_object_key;if not found then raise exception using errcode='23514',message='uploaded evidence object required';end if;
  if coalesce((so.metadata->>'size')::bigint,0)<>p_size_bytes or coalesce(so.metadata->>'mimetype','')<>p_content_type then raise exception using errcode='23514',message='uploaded evidence metadata mismatch';end if;
  insert into finance.document_references(legal_entity_id,external_document_id,document_type,storage_provider,object_key,content_hash,status,created_by,correlation_id) values(d.legal_entity_id,p_external_document_id,'DISPUTE_EVIDENCE','SUPABASE_STORAGE','ototr-evidence/'||p_object_key,p_content_hash,'ACTIVE',p_actor_id,p_correlation_id) returning id into dr;
  insert into finance.document_links(legal_entity_id,document_reference_id,subject_type,subject_id,purpose_code,created_by,correlation_id) values(d.legal_entity_id,dr,'DISPUTE',d.id,'EVIDENCE_REQUEST:'||er.id::text,p_actor_id,p_correlation_id);
  update finance.dispute_evidence_requests set status='FULFILLED',fulfilled_at_utc=clock_timestamp(),version=version+1,correlation_id=p_correlation_id where id=er.id;
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id) values(d.legal_entity_id,'finance.dispute','DISPUTE_EVIDENCE_FULFILLED','DISPUTE_EVIDENCE_REQUEST',er.id,er.version+1,jsonb_build_object('requestId',er.id,'disputeId',d.id,'documentId',dr,'externalDocumentId',p_external_document_id,'contentHash',p_content_hash,'status','FULFILLED','idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash),p_intent_hash,'PENDING',p_correlation_id);
  perform pg_advisory_xact_lock(hashtextextended('audit:'||d.legal_entity_id::text,0));select integrity_hash into v_previous from finance.audit_events where legal_entity_id=d.legal_entity_id order by created_at_utc desc,id desc limit 1;v_audit:=encode(extensions.digest(convert_to(coalesce(v_previous,'GENESIS')||':'||er.id::text||':DISPUTE_EVIDENCE_FULFILLED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id) values(d.legal_entity_id,p_actor_id,'USER','DISPUTE_EVIDENCE_FULFILLED','DISPUTE',d.id,'ALLOW',er.request_type,er.message_hash,p_content_hash,v_previous,v_audit,jsonb_build_object('requestId',er.id,'documentId',dr,'contentType',p_content_type,'sizeBytes',p_size_bytes),p_correlation_id);
  return jsonb_build_object('outcome','FULFILLED','requestId',er.id,'status','FULFILLED','version',er.version+1,'documentId',dr,'externalDocumentId',p_external_document_id);
end$$;

revoke all on function finance_private.current_actor_can_upload_dispute_evidence(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.current_dispute_evidence_finalize_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_api.authorize_dispute_evidence_finalize(uuid,text) from public,anon;grant execute on function finance_api.authorize_dispute_evidence_finalize(uuid,text) to authenticated;
revoke all on function finance_api.commit_dispute_evidence_finalize(uuid,uuid,uuid,text,text,bigint,text,text,text,uuid) from public,anon,authenticated;grant execute on function finance_api.commit_dispute_evidence_finalize(uuid,uuid,uuid,text,text,bigint,text,text,text,uuid) to service_role;
