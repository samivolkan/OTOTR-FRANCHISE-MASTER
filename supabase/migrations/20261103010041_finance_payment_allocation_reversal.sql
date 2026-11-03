-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-payment-allocation-reversal-rpc.sql
-- Source SHA256: A5A15A09519EC7F413B7702260E8C2C9FC31CAE7E35ED129E391EA791DA8354C
-- Local replay required before any staging promotion.
-- OTOTR FINANCE PAYMENT ALLOCATION REVERSAL RPC CANDIDATE (TX-06)

create or replace function finance_private.current_allocation_reversal_worker_is_trusted()
returns boolean language sql stable security definer set search_path = '' as $$ select false $$;
revoke all on function finance_private.current_allocation_reversal_worker_is_trusted() from public, anon, authenticated;

create or replace function finance_private.current_actor_can_reverse_allocation(p_actor_id uuid,p_allocation_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$ select false $$;
revoke all on function finance_private.current_actor_can_reverse_allocation(uuid,uuid) from public, anon, authenticated;

create or replace function finance_api.authorize_payment_allocation_reversal(p_allocation_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when p_permission='finance.payment-allocations.reverse' and auth.uid() is not null
    and finance_private.current_actor_can_reverse_allocation(auth.uid(),p_allocation_id)
    then pg_catalog.jsonb_build_object('allowed',true,'legalEntityId',p.legal_entity_id,'dealerAccountId',p.dealer_account_id,'branchId',p.branch_id)
    else pg_catalog.jsonb_build_object('allowed',false) end
  from finance.payment_allocations pa join finance.payments p on p.id=pa.payment_id where pa.id=p_allocation_id
$$;

create or replace function finance_api.commit_payment_allocation_reversal(
  p_actor_id uuid,p_allocation_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_reason_code text,p_expected_allocation_version bigint,p_expected_payment_version bigint,p_expected_open_item_version bigint,
  p_document_ids uuid[],p_note text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_probe finance.payment_allocations%rowtype;v_original finance.payment_allocations%rowtype;
  v_payment finance.payments%rowtype;v_open finance.open_items%rowtype;v_reversal_id uuid;
  v_document_count integer;v_note_hash text;v_payload jsonb;v_payload_hash text;v_previous_hash text;v_audit_hash text;
  v_existing_hash text;v_existing_payload jsonb;v_new_allocation_version bigint;v_new_payment_version bigint;v_new_open_version bigint;v_sequence integer;
begin
  if not finance_private.current_allocation_reversal_worker_is_trusted() then raise exception using errcode='42501',message='allocation reversal worker denied'; end if;
  if p_actor_id is null or p_allocation_id is null or p_legal_entity_id is null or p_dealer_account_id is null or p_branch_id is null
    or coalesce(pg_catalog.btrim(p_reason_code),'')='' or pg_catalog.length(p_reason_code)>100
    or p_expected_allocation_version<1 or p_expected_payment_version<1 or p_expected_open_item_version<1
    or pg_catalog.length(coalesce(p_note,''))>2000 or coalesce(pg_catalog.btrim(p_idempotency_key),'')='' or pg_catalog.length(p_idempotency_key)>200
    or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null
  then raise exception using errcode='22023',message='required allocation reversal fields missing'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('payment-allocation-reversal:'||p_allocation_id::text,0));
  select om.payload,om.payload->>'intentHash' into v_existing_payload,v_existing_hash from finance.outbox_messages om
   where om.aggregate_type='payment_allocation' and om.aggregate_id=p_allocation_id and om.event_type='PAYMENT_ALLOCATION_REVERSED'
     and om.payload->>'idempotencyKey'=p_idempotency_key order by om.created_at_utc desc,om.id desc limit 1;
  if found then
    if v_existing_hash=p_intent_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','originalAllocationId',p_allocation_id,'reversalAllocationId',v_existing_payload->>'reversalAllocationId','status','REVERSED','allocationVersion',(v_existing_payload->>'allocationVersion')::bigint); end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','originalAllocationId',p_allocation_id);
  end if;

  select * into v_probe from finance.payment_allocations where id=p_allocation_id;
  if not found then raise exception using errcode='P0002',message='allocation not found'; end if;
  select * into v_payment from finance.payments where id=v_probe.payment_id for update;
  select * into v_open from finance.open_items where id=v_probe.open_item_id for update;
  select * into v_original from finance.payment_allocations where id=p_allocation_id for update;
  if v_original.payment_id<>v_payment.id or v_original.open_item_id<>v_open.id then raise exception using errcode='40001',message='allocation linkage changed'; end if;
  if v_payment.legal_entity_id<>p_legal_entity_id or v_payment.dealer_account_id<>p_dealer_account_id or v_payment.branch_id<>p_branch_id
    or v_open.legal_entity_id<>p_legal_entity_id or v_open.dealer_account_id<>p_dealer_account_id or v_open.branch_id<>p_branch_id
  then raise exception using errcode='42501',message='allocation reversal scope mismatch'; end if;
  if v_original.status<>'ACTIVE' or v_original.reversal_of_id is not null then raise exception using errcode='23514',message='active original allocation required'; end if;
  if v_original.version<>p_expected_allocation_version or v_payment.version<>p_expected_payment_version or v_open.version<>p_expected_open_item_version
  then return pg_catalog.jsonb_build_object('outcome','CONFLICT','originalAllocationId',v_original.id); end if;
  if v_original.currency_code<>v_payment.currency_code or v_original.currency_code<>v_open.currency_code then raise exception using errcode='23514',message='allocation reversal currency mismatch'; end if;
  if v_payment.allocated_amount<v_original.amount or v_open.allocated_amount<v_original.amount then raise exception using errcode='23514',message='allocation reversal balance underflow'; end if;
  if exists(select 1 from finance.payment_allocations pa where pa.reversal_of_id=v_original.id) then raise exception using errcode='23505',message='allocation reversal already exists'; end if;

  select count(distinct dr.external_document_id) into v_document_count from finance.document_references dr
   where dr.legal_entity_id=p_legal_entity_id and dr.status='ACTIVE' and dr.external_document_id=any(coalesce(p_document_ids,array[]::uuid[]));
  if v_document_count<>coalesce(pg_catalog.cardinality(p_document_ids),0) then raise exception using errcode='23514',message='active reversal document evidence required'; end if;
  select coalesce(max(pa.allocation_sequence),0)+1 into v_sequence from finance.payment_allocations pa where pa.payment_id=v_original.payment_id and pa.open_item_id=v_original.open_item_id;
  insert into finance.payment_allocations(payment_id,open_item_id,allocation_sequence,currency_code,amount,status,reversal_of_id,version,created_by,correlation_id)
  values(v_original.payment_id,v_original.open_item_id,v_sequence,v_original.currency_code,v_original.amount,'REVERSED',v_original.id,1,p_actor_id,p_correlation_id) returning id into v_reversal_id;
  update finance.payment_allocations set status='REVERSED',version=version+1,correlation_id=p_correlation_id
   where id=v_original.id and version=p_expected_allocation_version returning version into v_new_allocation_version;
  if not found then return pg_catalog.jsonb_build_object('outcome','CONFLICT','originalAllocationId',v_original.id); end if;
  update finance.payments set allocated_amount=allocated_amount-v_original.amount,
    status=case when allocated_amount-v_original.amount=0 then 'VERIFIED' else 'PARTIALLY_ALLOCATED' end,
    version=version+1,correlation_id=p_correlation_id where id=v_payment.id and version=p_expected_payment_version returning version into v_new_payment_version;
  if not found then return pg_catalog.jsonb_build_object('outcome','CONFLICT','originalAllocationId',v_original.id); end if;
  update finance.open_items set allocated_amount=allocated_amount-v_original.amount,open_amount=open_amount+v_original.amount,
    status=case when allocated_amount-v_original.amount=0 then 'OPEN' else 'PARTIALLY_ALLOCATED' end,
    version=version+1,correlation_id=p_correlation_id where id=v_open.id and version=p_expected_open_item_version returning version into v_new_open_version;
  if not found then return pg_catalog.jsonb_build_object('outcome','CONFLICT','originalAllocationId',v_original.id); end if;
  if exists(select 1 from finance.open_items oi where oi.id=v_open.id and oi.original_amount<>oi.allocated_amount+oi.open_amount) then raise exception using errcode='23514',message='open item equation violated after reversal'; end if;

  insert into finance.document_links(legal_entity_id,document_reference_id,subject_type,subject_id,purpose_code,created_by,correlation_id)
  select p_legal_entity_id,dr.id,'PAYMENT_ALLOCATION_REVERSAL',v_reversal_id,'ALLOCATION_REVERSAL_EVIDENCE',p_actor_id,p_correlation_id
    from finance.document_references dr where dr.legal_entity_id=p_legal_entity_id and dr.status='ACTIVE' and dr.external_document_id=any(coalesce(p_document_ids,array[]::uuid[]));
  v_note_hash:=case when p_note is null then null else pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_note,'UTF8'),'sha256'),'hex') end;
  v_payload:=pg_catalog.jsonb_build_object('originalAllocationId',v_original.id,'reversalAllocationId',v_reversal_id,'paymentId',v_payment.id,'openItemId',v_open.id,'legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'amount',v_original.amount::text,'currency',v_original.currency_code,'reasonCode',p_reason_code,'allocationVersion',v_new_allocation_version,'paymentVersion',v_new_payment_version,'openItemVersion',v_new_open_version,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash,'noteHash',v_note_hash);
  v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)
  values(p_legal_entity_id,'finance.payment-allocation','PAYMENT_ALLOCATION_REVERSED','payment_allocation',v_original.id,v_new_allocation_version,v_payload,v_payload_hash,'PENDING',p_correlation_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));select ae.integrity_hash into v_previous_hash from finance.audit_events ae where ae.legal_entity_id=p_legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;
  v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_hash,'GENESIS')||':'||v_original.id::text||':PAYMENT_ALLOCATION_REVERSED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)
  values(p_legal_entity_id,p_actor_id,'USER','PAYMENT_ALLOCATION_REVERSED','payment_allocation',v_original.id,'ALLOW',v_original.id::text,p_intent_hash,v_previous_hash,v_audit_hash,pg_catalog.jsonb_build_object('reversalAllocationId',v_reversal_id,'paymentId',v_payment.id,'openItemId',v_open.id,'branchId',p_branch_id,'reasonCode',p_reason_code,'documentCount',v_document_count,'noteHash',v_note_hash),p_correlation_id);
  return pg_catalog.jsonb_build_object('outcome','CREATED','originalAllocationId',v_original.id,'reversalAllocationId',v_reversal_id,'status','REVERSED','allocationVersion',v_new_allocation_version,'paymentVersion',v_new_payment_version,'openItemVersion',v_new_open_version);
end $$;

revoke all on function finance_api.commit_payment_allocation_reversal(uuid,uuid,uuid,uuid,uuid,text,bigint,bigint,bigint,uuid[],text,text,text,uuid) from public, anon, authenticated;
revoke all on function finance_api.authorize_payment_allocation_reversal(uuid,text) from public, anon;
grant execute on function finance_api.authorize_payment_allocation_reversal(uuid,text) to authenticated;
-- Commit execute grant intentionally absent until reviewed server-only worker identity exists.
