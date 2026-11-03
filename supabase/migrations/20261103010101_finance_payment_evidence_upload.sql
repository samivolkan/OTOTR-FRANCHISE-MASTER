-- Private payment evidence upload with server-side storage metadata verification.

create or replace function finance_private.current_actor_can_upload_payment_evidence(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance_private as $$
  select finance_private.current_actor_can_create_payment(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id)
$$;

drop policy if exists finance_payment_evidence_object_insert on storage.objects;
create policy finance_payment_evidence_object_insert on storage.objects for insert to authenticated with check(
  bucket_id='ototr-evidence' and (storage.foldername(name))[1]='finance-payments' and array_length(storage.foldername(name),1)=4
  and (storage.foldername(name))[2]~'^[0-9a-fA-F-]{36}$' and (storage.foldername(name))[3]~'^[0-9a-fA-F-]{36}$' and (storage.foldername(name))[4]~'^[0-9a-fA-F-]{36}$'
  and finance_private.current_actor_can_upload_payment_evidence(auth.uid(),((storage.foldername(name))[2])::uuid,((storage.foldername(name))[3])::uuid,((storage.foldername(name))[4])::uuid)
);
drop policy if exists finance_payment_evidence_object_select on storage.objects;
create policy finance_payment_evidence_object_select on storage.objects for select to authenticated using(
  bucket_id='ototr-evidence' and (storage.foldername(name))[1]='finance-payments' and array_length(storage.foldername(name),1)=4
  and (storage.foldername(name))[2]~'^[0-9a-fA-F-]{36}$' and (storage.foldername(name))[3]~'^[0-9a-fA-F-]{36}$' and (storage.foldername(name))[4]~'^[0-9a-fA-F-]{36}$'
  and finance_private.current_actor_can_upload_payment_evidence(auth.uid(),((storage.foldername(name))[2])::uuid,((storage.foldername(name))[3])::uuid,((storage.foldername(name))[4])::uuid)
);

create or replace function finance_private.current_payment_evidence_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_api.authorize_payment_evidence_scope(p_dealer_account_id uuid,p_branch_id uuid,p_permission text)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance_private as $$
declare v_legal uuid;
begin
  if auth.uid() is null or p_permission<>'finance.payments.evidence-register' then return jsonb_build_object('allowed',false);end if;
  v_legal:=finance_private.resolve_payment_create_legal_entity(p_dealer_account_id,p_branch_id);
  if v_legal is null or not finance_private.current_actor_can_upload_payment_evidence(auth.uid(),v_legal,p_dealer_account_id,p_branch_id) then return jsonb_build_object('allowed',false);end if;
  return jsonb_build_object('allowed',true,'legalEntityId',v_legal,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id);
end$$;

create or replace function finance_api.commit_payment_evidence_registration(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_external_document_id uuid,p_document_type text,p_object_key text,p_content_type text,p_size_bytes bigint,p_content_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private,storage as $$
declare so storage.objects%rowtype;dr finance.document_references%rowtype;v_prefix text;v_previous text;v_audit text;
begin
  if not finance_private.current_payment_evidence_committer_is_trusted() or not finance_private.current_actor_can_upload_payment_evidence(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id) then raise exception using errcode='42501',message='trusted payment evidence authorization required';end if;
  if p_document_type not in('PAYMENT_EVIDENCE','PAYMENT_VERIFICATION_EVIDENCE') or p_content_type not in('image/jpeg','image/png','image/webp','application/pdf') or p_size_bytes<1 or p_size_bytes>10485760 or p_content_hash!~'^[a-fA-F0-9]{64}$' or length(btrim(coalesce(p_idempotency_key,''))) not between 8 and 200 or p_intent_hash!~'^[a-fA-F0-9]{64}$' then raise exception using errcode='22023',message='invalid payment evidence command';end if;
  select * into dr from finance.document_references where legal_entity_id=p_legal_entity_id and external_document_id=p_external_document_id;
  if found then
    if dr.content_hash=p_content_hash and dr.object_key='ototr-evidence/'||p_object_key and dr.document_type=p_document_type then return jsonb_build_object('outcome','REPLAY','documentId',dr.id,'externalDocumentId',dr.external_document_id);end if;
    return jsonb_build_object('outcome','CONFLICT','documentId',dr.id);
  end if;
  v_prefix:='finance-payments/'||p_legal_entity_id::text||'/'||p_dealer_account_id::text||'/'||p_branch_id::text||'/';
  if p_object_key!~'^[a-zA-Z0-9/_\.-]+$' or position(v_prefix in p_object_key)<>1 then raise exception using errcode='42501',message='payment evidence object scope mismatch';end if;
  select * into so from storage.objects where bucket_id='ototr-evidence' and name=p_object_key;if not found then raise exception using errcode='23514',message='uploaded payment evidence object required';end if;
  if coalesce((so.metadata->>'size')::bigint,0)<>p_size_bytes or coalesce(so.metadata->>'mimetype','')<>p_content_type then raise exception using errcode='23514',message='uploaded payment evidence metadata mismatch';end if;
  insert into finance.document_references(legal_entity_id,external_document_id,document_type,storage_provider,object_key,content_hash,status,created_by,correlation_id) values(p_legal_entity_id,p_external_document_id,p_document_type,'SUPABASE_STORAGE','ototr-evidence/'||p_object_key,p_content_hash,'ACTIVE',p_actor_id,p_correlation_id) returning * into dr;
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id) values(p_legal_entity_id,'finance.payment','PAYMENT_EVIDENCE_REGISTERED','document_reference',dr.id,1,jsonb_build_object('documentId',dr.id,'externalDocumentId',p_external_document_id,'documentType',p_document_type,'contentHash',p_content_hash,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash),p_intent_hash,'PENDING',p_correlation_id);
  perform pg_advisory_xact_lock(hashtextextended('audit:'||p_legal_entity_id::text,0));select integrity_hash into v_previous from finance.audit_events where legal_entity_id=p_legal_entity_id order by created_at_utc desc,id desc limit 1;v_audit:=encode(extensions.digest(convert_to(coalesce(v_previous,'GENESIS')||':'||dr.id::text||':PAYMENT_EVIDENCE_REGISTERED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id) values(p_legal_entity_id,p_actor_id,'USER','PAYMENT_EVIDENCE_REGISTERED','DOCUMENT_REFERENCE',dr.id,'ALLOW',p_document_type,p_content_hash,v_previous,v_audit,jsonb_build_object('branchId',p_branch_id,'dealerAccountId',p_dealer_account_id,'contentType',p_content_type,'sizeBytes',p_size_bytes),p_correlation_id);
  return jsonb_build_object('outcome','CREATED','documentId',dr.id,'externalDocumentId',p_external_document_id,'documentType',p_document_type);
end$$;

revoke all on function finance_private.current_actor_can_upload_payment_evidence(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.current_payment_evidence_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_api.authorize_payment_evidence_scope(uuid,uuid,text) from public,anon;grant execute on function finance_api.authorize_payment_evidence_scope(uuid,uuid,text) to authenticated;
revoke all on function finance_api.commit_payment_evidence_registration(uuid,uuid,uuid,uuid,uuid,text,text,text,bigint,text,text,text,uuid) from public,anon,authenticated;grant execute on function finance_api.commit_payment_evidence_registration(uuid,uuid,uuid,uuid,uuid,text,text,text,bigint,text,text,text,uuid) to service_role;
