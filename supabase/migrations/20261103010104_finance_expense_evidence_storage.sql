-- Private expense evidence upload and short-lived authorized download locator.

create or replace function finance_private.current_actor_can_upload_expense_evidence(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance,finance_private as $$
  select finance_private.current_actor_can_read_headquarters(p_actor_id,p_legal_entity_id,'getPassThroughExpense')
    and exists(select 1 from finance.dealer_accounts da join finance.branches b on b.legal_entity_id=da.legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id where da.id=p_dealer_account_id and b.id=p_branch_id and da.legal_entity_id=p_legal_entity_id and da.status='ACTIVE' and b.status='ACTIVE')
$$;

drop policy if exists finance_expense_evidence_object_insert on storage.objects;
create policy finance_expense_evidence_object_insert on storage.objects for insert to authenticated with check(
  bucket_id='ototr-evidence' and (storage.foldername(name))[1]='finance-expenses' and array_length(storage.foldername(name),1)=4
  and (storage.foldername(name))[2]~'^[0-9a-fA-F-]{36}$' and (storage.foldername(name))[3]~'^[0-9a-fA-F-]{36}$' and (storage.foldername(name))[4]~'^[0-9a-fA-F-]{36}$'
  and finance_private.current_actor_can_upload_expense_evidence(auth.uid(),((storage.foldername(name))[2])::uuid,((storage.foldername(name))[3])::uuid,((storage.foldername(name))[4])::uuid)
);
drop policy if exists finance_expense_evidence_object_select on storage.objects;
create policy finance_expense_evidence_object_select on storage.objects for select to authenticated using(
  bucket_id='ototr-evidence' and (storage.foldername(name))[1]='finance-expenses' and array_length(storage.foldername(name),1)=4
  and finance_private.current_actor_can_upload_expense_evidence(auth.uid(),((storage.foldername(name))[2])::uuid,((storage.foldername(name))[3])::uuid,((storage.foldername(name))[4])::uuid)
);

create or replace function finance_api.authorize_expense_evidence_scope(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance_private as $$
  select case when auth.uid() is not null and p_permission='finance.expenses.evidence-register'
    and finance_private.current_actor_can_upload_expense_evidence(auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id)
    then jsonb_build_object('allowed',true,'legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id)
    else jsonb_build_object('allowed',false) end
$$;

create or replace function finance_api.commit_expense_evidence_registration(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_external_document_id uuid,p_object_key text,p_content_type text,p_size_bytes bigint,p_content_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private,storage as $$
declare so storage.objects%rowtype;dr finance.document_references%rowtype;v_prefix text;v_previous text;v_audit text;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'')<>'service_role' or not finance_private.current_actor_can_upload_expense_evidence(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id) then raise exception using errcode='42501',message='trusted expense evidence authorization required';end if;
  if p_content_type not in('image/jpeg','image/png','image/webp','application/pdf') or p_size_bytes<1 or p_size_bytes>10485760 or p_content_hash!~'^[a-fA-F0-9]{64}$' or length(btrim(coalesce(p_idempotency_key,''))) not between 8 and 200 or p_intent_hash!~'^[a-fA-F0-9]{64}$' then raise exception using errcode='22023',message='invalid expense evidence command';end if;
  select * into dr from finance.document_references where legal_entity_id=p_legal_entity_id and external_document_id=p_external_document_id;
  if found then if dr.content_hash=p_content_hash and dr.object_key='ototr-evidence/'||p_object_key and dr.document_type='SUPPLIER_INVOICE' then return jsonb_build_object('outcome','REPLAY','documentId',dr.id,'externalDocumentId',dr.external_document_id);end if;return jsonb_build_object('outcome','CONFLICT','documentId',dr.id);end if;
  v_prefix:='finance-expenses/'||p_legal_entity_id::text||'/'||p_dealer_account_id::text||'/'||p_branch_id::text||'/';
  if p_object_key!~'^[a-zA-Z0-9/_\.-]+$' or position(v_prefix in p_object_key)<>1 then raise exception using errcode='42501',message='expense evidence object scope mismatch';end if;
  select * into so from storage.objects where bucket_id='ototr-evidence' and name=p_object_key;if not found then raise exception using errcode='23514',message='uploaded expense evidence object required';end if;
  if coalesce((so.metadata->>'size')::bigint,0)<>p_size_bytes or coalesce(so.metadata->>'mimetype','')<>p_content_type then raise exception using errcode='23514',message='uploaded expense evidence metadata mismatch';end if;
  insert into finance.document_references(legal_entity_id,external_document_id,document_type,storage_provider,object_key,content_hash,status,created_by,correlation_id) values(p_legal_entity_id,p_external_document_id,'SUPPLIER_INVOICE','SUPABASE_STORAGE','ototr-evidence/'||p_object_key,p_content_hash,'ACTIVE',p_actor_id,p_correlation_id) returning * into dr;
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id) values(p_legal_entity_id,'finance.expense','EXPENSE_EVIDENCE_REGISTERED','document_reference',dr.id,1,jsonb_build_object('documentId',dr.id,'externalDocumentId',p_external_document_id,'contentHash',p_content_hash,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash),p_intent_hash,'PENDING',p_correlation_id);
  perform pg_advisory_xact_lock(hashtextextended('audit:'||p_legal_entity_id::text,0));select integrity_hash into v_previous from finance.audit_events where legal_entity_id=p_legal_entity_id order by created_at_utc desc,id desc limit 1;v_audit:=encode(extensions.digest(convert_to(coalesce(v_previous,'GENESIS')||':'||dr.id::text||':EXPENSE_EVIDENCE_REGISTERED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id) values(p_legal_entity_id,p_actor_id,'USER','EXPENSE_EVIDENCE_REGISTERED','DOCUMENT_REFERENCE',dr.id,'ALLOW','SUPPLIER_INVOICE',p_content_hash,v_previous,v_audit,jsonb_build_object('branchId',p_branch_id,'dealerAccountId',p_dealer_account_id,'contentType',p_content_type,'sizeBytes',p_size_bytes),p_correlation_id);
  return jsonb_build_object('outcome','CREATED','documentId',dr.id,'externalDocumentId',p_external_document_id,'documentType','SUPPLIER_INVOICE');
end$$;

create or replace function finance_api.get_expense_evidence_locator(p_legal_entity_id uuid,p_expense_id uuid,p_external_document_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private as $$
declare r record;v_key text;
begin
  if auth.uid() is null or not finance_private.current_actor_can_read_headquarters(auth.uid(),p_legal_entity_id,'getPassThroughExpense') then raise exception using errcode='42501',message='headquarters finance scope denied';end if;
  select dr.object_key,dr.document_type,dr.content_hash into r from finance.pass_through_expenses e join finance.document_links dl on dl.legal_entity_id=e.legal_entity_id and dl.subject_type='PASS_THROUGH_EXPENSE' and dl.subject_id=e.id join finance.document_references dr on dr.id=dl.document_reference_id and dr.status='ACTIVE' where e.id=p_expense_id and e.legal_entity_id=p_legal_entity_id and dr.external_document_id=p_external_document_id and dr.storage_provider='SUPABASE_STORAGE';
  if not found then return null;end if;if position('ototr-evidence/' in r.object_key)<>1 then raise exception using errcode='23514',message='invalid expense evidence storage reference';end if;
  v_key:=substr(r.object_key,length('ototr-evidence/')+1);if position('finance-expenses/'||p_legal_entity_id::text||'/' in v_key)<>1 then raise exception using errcode='42501',message='expense evidence object scope mismatch';end if;
  return jsonb_build_object('bucketId','ototr-evidence','objectKey',v_key,'documentType',r.document_type,'contentHash',r.content_hash,'expiresIn',120);
end$$;

revoke all on function finance_private.current_actor_can_upload_expense_evidence(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_api.authorize_expense_evidence_scope(uuid,uuid,uuid,text) from public,anon;grant execute on function finance_api.authorize_expense_evidence_scope(uuid,uuid,uuid,text) to authenticated;
revoke all on function finance_api.commit_expense_evidence_registration(uuid,uuid,uuid,uuid,uuid,text,text,bigint,text,text,text,uuid) from public,anon,authenticated;grant execute on function finance_api.commit_expense_evidence_registration(uuid,uuid,uuid,uuid,uuid,text,text,bigint,text,text,text,uuid) to service_role;
revoke all on function finance_api.get_expense_evidence_locator(uuid,uuid,uuid) from public,anon;grant execute on function finance_api.get_expense_evidence_locator(uuid,uuid,uuid) to authenticated;
