-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-payment-create-rpc.sql
-- Source SHA256: 3B37A5276BF4EC50F14A81C01EDDE51AACE9AB762E825311FF06B5B12B4B3FBE
-- Local replay required before any staging promotion.
-- OTOTR FINANCE PAYMENT CREATION RPC CANDIDATE

create or replace function finance_private.current_payment_create_worker_is_trusted()
returns boolean language sql stable security definer set search_path = ''
as $$ select false $$;
revoke all on function finance_private.current_payment_create_worker_is_trusted() from public, anon, authenticated;

create or replace function finance_private.current_actor_can_create_payment(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$ select false $$;
revoke all on function finance_private.current_actor_can_create_payment(uuid,uuid,uuid,uuid) from public, anon, authenticated;

create or replace function finance_private.resolve_payment_create_legal_entity(p_dealer_account_id uuid,p_branch_id uuid)
returns uuid language sql stable security definer set search_path = '' as $$ select null::uuid $$;
revoke all on function finance_private.resolve_payment_create_legal_entity(uuid,uuid) from public, anon, authenticated;

create or replace function finance_api.authorize_payment_create_scope(p_dealer_account_id uuid,p_branch_id uuid,p_permission text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_legal_entity_id uuid;
begin
  if p_permission<>'finance.payments.create' or auth.uid() is null or p_dealer_account_id is null or p_branch_id is null then
    return pg_catalog.jsonb_build_object('allowed',false);
  end if;
  v_legal_entity_id:=finance_private.resolve_payment_create_legal_entity(p_dealer_account_id,p_branch_id);
  if v_legal_entity_id is null or not finance_private.current_actor_can_create_payment(auth.uid(),v_legal_entity_id,p_dealer_account_id,p_branch_id) then
    return pg_catalog.jsonb_build_object('allowed',false);
  end if;
  return pg_catalog.jsonb_build_object('allowed',true,'legalEntityId',v_legal_entity_id);
end $$;

create or replace function finance_api.commit_payment_creation(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_payment_date date,p_value_date date,p_amount numeric,p_currency_code text,
  p_payment_method_code text,p_external_reference text,p_bank_transaction_reference text,p_description text,
  p_document_ids uuid[],p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_existing finance.payments%rowtype;v_payment_id uuid;v_version bigint;v_document_count integer;
  v_dealer_legal_entity_id uuid;v_payload jsonb;v_payload_hash text;v_previous_hash text;v_audit_hash text;v_description_hash text;
begin
  if not finance_private.current_payment_create_worker_is_trusted() then raise exception using errcode='42501',message='payment create worker denied'; end if;
  if p_actor_id is null or p_legal_entity_id is null or p_dealer_account_id is null or p_branch_id is null
     or p_payment_date is null or p_value_date is null or p_amount is null or p_amount<=0
     or p_currency_code!~'^[A-Z]{3}$' or coalesce(pg_catalog.btrim(p_payment_method_code),'')=''
     or coalesce(pg_catalog.btrim(p_external_reference),'')='' or coalesce(pg_catalog.btrim(p_idempotency_key),'')=''
     or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null
     or pg_catalog.length(p_payment_method_code)>100 or pg_catalog.length(p_external_reference)>200
     or pg_catalog.length(coalesce(p_bank_transaction_reference,''))>200 or pg_catalog.length(coalesce(p_description,''))>1000
     or pg_catalog.length(p_idempotency_key)>200 then raise exception using errcode='22023',message='required payment fields missing'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('payment-idempotency:'||p_legal_entity_id::text||':'||p_idempotency_key,0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('payment-reference:'||p_legal_entity_id::text||':'||p_external_reference,0));
  select * into v_existing from finance.payments where legal_entity_id=p_legal_entity_id and idempotency_key=p_idempotency_key;
  if found then
    if v_existing.intent_hash=p_intent_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','paymentId',v_existing.id,'status',v_existing.status,'version',v_existing.version); end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','paymentId',v_existing.id,'version',v_existing.version);
  end if;
  if exists(select 1 from finance.payments where legal_entity_id=p_legal_entity_id and external_reference=p_external_reference) then
    return pg_catalog.jsonb_build_object('outcome','CONFLICT');
  end if;
  select da.dealer_legal_entity_id into v_dealer_legal_entity_id from finance.dealer_accounts da
   where da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and da.currency_code=p_currency_code and da.status='ACTIVE';
  if not found then raise exception using errcode='42501',message='dealer account scope denied'; end if;
  if not exists(select 1 from finance.branches b where b.id=p_branch_id and b.legal_entity_id=p_legal_entity_id and b.dealer_legal_entity_id=v_dealer_legal_entity_id and b.status='ACTIVE') then
    raise exception using errcode='42501',message='branch scope denied';
  end if;
  select count(distinct dr.external_document_id) into v_document_count from finance.document_references dr
   where dr.legal_entity_id=p_legal_entity_id and dr.status='ACTIVE' and dr.external_document_id=any(coalesce(p_document_ids,array[]::uuid[]));
  if v_document_count<>coalesce(pg_catalog.cardinality(p_document_ids),0) then raise exception using errcode='23514',message='active document evidence required'; end if;
  insert into finance.payments(legal_entity_id,dealer_account_id,branch_id,idempotency_key,intent_hash,external_reference,payment_date,value_date,payment_method_code,bank_transaction_reference,description,currency_code,received_amount,verified_amount,allocated_amount,status,prepared_by,version,created_by,correlation_id)
  values(p_legal_entity_id,p_dealer_account_id,p_branch_id,p_idempotency_key,p_intent_hash,p_external_reference,p_payment_date,p_value_date,p_payment_method_code,p_bank_transaction_reference,p_description,p_currency_code,p_amount,0,0,'PENDING_VERIFICATION',p_actor_id,1,p_actor_id,p_correlation_id)
  returning id,version into v_payment_id,v_version;
  insert into finance.document_links(legal_entity_id,document_reference_id,subject_type,subject_id,purpose_code,created_by,correlation_id)
  select p_legal_entity_id,dr.id,'PAYMENT',v_payment_id,'PAYMENT_EVIDENCE',p_actor_id,p_correlation_id from finance.document_references dr
   where dr.legal_entity_id=p_legal_entity_id and dr.status='ACTIVE' and dr.external_document_id=any(coalesce(p_document_ids,array[]::uuid[]));
  v_description_hash:=case when p_description is null then null else pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_description,'UTF8'),'sha256'),'hex') end;
  v_payload:=pg_catalog.jsonb_build_object('paymentId',v_payment_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'paymentDate',p_payment_date,'valueDate',p_value_date,'amount',p_amount::text,'currency',p_currency_code,'paymentMethodCode',p_payment_method_code,'externalReference',p_external_reference,'intentHash',p_intent_hash,'descriptionHash',v_description_hash);
  v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)
  values(p_legal_entity_id,'finance.payment','PAYMENT_RECORDED','payment',v_payment_id,v_version,v_payload,v_payload_hash,'PENDING',p_correlation_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));
  select ae.integrity_hash into v_previous_hash from finance.audit_events ae where ae.legal_entity_id=p_legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;
  v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_hash,'GENESIS')||':'||v_payment_id::text||':PAYMENT_RECORDED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)
  values(p_legal_entity_id,p_actor_id,'USER','PAYMENT_RECORDED','payment',v_payment_id,'ALLOW',p_intent_hash,v_previous_hash,v_audit_hash,pg_catalog.jsonb_build_object('branchId',p_branch_id,'dealerAccountId',p_dealer_account_id,'documentCount',v_document_count,'descriptionHash',v_description_hash),p_correlation_id);
  return pg_catalog.jsonb_build_object('outcome','CREATED','paymentId',v_payment_id,'status','PENDING_VERIFICATION','version',v_version);
end $$;

revoke all on function finance_api.commit_payment_creation(uuid,uuid,uuid,uuid,date,date,numeric,text,text,text,text,text,uuid[],text,text,uuid) from public, anon, authenticated;
revoke all on function finance_api.authorize_payment_create_scope(uuid,uuid,text) from public, anon;
grant execute on function finance_api.authorize_payment_create_scope(uuid,uuid,text) to authenticated;
-- Execute grant intentionally absent until reviewed server-only worker identity exists.
