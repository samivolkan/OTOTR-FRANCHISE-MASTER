-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-payment-allocation-rpc.sql
-- Source SHA256: E9771AB1B104EB2D462970C08879467331BAEF9867C9707B6D69C62C53419C33
-- Local replay required before any staging promotion.
-- OTOTR FINANCE PAYMENT ALLOCATION RPC CANDIDATE (TX-05)

create or replace function finance_private.current_payment_allocation_worker_is_trusted()
returns boolean language sql stable security definer set search_path = '' as $$ select false $$;
revoke all on function finance_private.current_payment_allocation_worker_is_trusted() from public, anon, authenticated;

create or replace function finance_private.current_actor_can_allocate_payment(p_actor_id uuid,p_payment_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$ select false $$;
revoke all on function finance_private.current_actor_can_allocate_payment(uuid,uuid) from public, anon, authenticated;

create or replace function finance_api.authorize_payment_allocation(p_payment_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when p_permission='finance.payment-allocations.create' and auth.uid() is not null
    and finance_private.current_actor_can_allocate_payment(auth.uid(),p_payment_id)
    then pg_catalog.jsonb_build_object('allowed',true,'legalEntityId',p.legal_entity_id,'dealerAccountId',p.dealer_account_id,'branchId',p.branch_id)
    else pg_catalog.jsonb_build_object('allowed',false) end
  from finance.payments p where p.id=p_payment_id
$$;

create or replace function finance_api.commit_payment_allocation(
  p_actor_id uuid,p_payment_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_allocation_method text,p_items jsonb,p_expected_payment_version bigint,
  p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_payment finance.payments%rowtype;v_item record;v_open finance.open_items%rowtype;
  v_total numeric(24,8):=0;v_new_payment_version bigint;v_sequence integer;
  v_existing_hash text;v_existing_payload jsonb;v_allocations jsonb:='[]'::jsonb;
  v_allocation_id uuid;v_payload jsonb;v_payload_hash text;v_previous_hash text;v_audit_hash text;
begin
  if not finance_private.current_payment_allocation_worker_is_trusted() then raise exception using errcode='42501',message='payment allocation worker denied'; end if;
  if p_actor_id is null or p_payment_id is null or p_legal_entity_id is null or p_dealer_account_id is null or p_branch_id is null
     or p_allocation_method not in ('MANUAL','FIFO','REFERENCE_MATCH','APPROVED_RULE')
     or pg_catalog.jsonb_typeof(p_items)<>'array' or pg_catalog.jsonb_array_length(p_items)<1
     or p_expected_payment_version is null or p_expected_payment_version<1
     or coalesce(pg_catalog.btrim(p_idempotency_key),'')='' or pg_catalog.length(p_idempotency_key)>200
     or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null
  then raise exception using errcode='22023',message='required allocation fields missing'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('payment-allocation:'||p_payment_id::text,0));
  select om.payload,om.payload->>'intentHash' into v_existing_payload,v_existing_hash
    from finance.outbox_messages om
   where om.aggregate_type='payment' and om.aggregate_id=p_payment_id and om.event_type='PAYMENT_ALLOCATED'
     and om.payload->>'idempotencyKey'=p_idempotency_key
   order by om.created_at_utc desc,om.id desc limit 1;
  if found then
    if v_existing_hash=p_intent_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','paymentId',p_payment_id,'paymentVersion',(v_existing_payload->>'paymentVersion')::bigint,'unallocatedAmount',v_existing_payload->>'unallocatedAmount','allocations',coalesce(v_existing_payload->'allocations','[]'::jsonb)); end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','paymentId',p_payment_id);
  end if;

  select * into v_payment from finance.payments where id=p_payment_id for update;
  if not found then raise exception using errcode='P0002',message='payment not found'; end if;
  if v_payment.legal_entity_id<>p_legal_entity_id or v_payment.dealer_account_id<>p_dealer_account_id or v_payment.branch_id<>p_branch_id then raise exception using errcode='42501',message='payment scope mismatch'; end if;
  if v_payment.status not in ('VERIFIED','PARTIALLY_ALLOCATED') then raise exception using errcode='23514',message='verified payment required'; end if;
  if v_payment.version<>p_expected_payment_version then return pg_catalog.jsonb_build_object('outcome','CONFLICT','paymentId',v_payment.id,'paymentVersion',v_payment.version); end if;
  if exists(select 1 from pg_catalog.jsonb_array_elements(p_items) x where pg_catalog.jsonb_typeof(x)<>'object' or (x-'openItemId'-'amount'-'expectedOpenItemVersion')<>'{}'::jsonb) then raise exception using errcode='22023',message='invalid allocation item shape'; end if;
  if (select count(*)<>count(distinct (x->>'openItemId')) from pg_catalog.jsonb_array_elements(p_items) x) then raise exception using errcode='22023',message='duplicate open item'; end if;

  for v_item in
    select (x->>'openItemId')::uuid open_item_id,(x->'amount'->>'amount')::numeric amount,
           x->'amount'->>'currency' currency,(x->>'expectedOpenItemVersion')::bigint expected_version
      from pg_catalog.jsonb_array_elements(p_items) x order by (x->>'openItemId')::uuid
  loop
    if v_item.amount<=0 or v_item.expected_version<1 or v_item.currency!~'^[A-Z]{3}$' then raise exception using errcode='22023',message='invalid allocation item value'; end if;
    select * into v_open from finance.open_items where id=v_item.open_item_id for update;
    if not found then raise exception using errcode='P0002',message='open item not found'; end if;
    if v_open.legal_entity_id<>p_legal_entity_id or v_open.dealer_account_id<>p_dealer_account_id or v_open.branch_id<>p_branch_id then raise exception using errcode='42501',message='open item scope mismatch'; end if;
    if v_open.item_type<>'DEBIT' or v_open.status not in ('OPEN','PARTIALLY_ALLOCATED') then raise exception using errcode='23514',message='allocatable debit open item required'; end if;
    if v_open.version<>v_item.expected_version then return pg_catalog.jsonb_build_object('outcome','CONFLICT','paymentId',v_payment.id,'openItemId',v_open.id); end if;
    if v_open.currency_code<>v_payment.currency_code or v_item.currency<>v_payment.currency_code then raise exception using errcode='23514',message='allocation currency mismatch'; end if;
    if v_item.amount>v_open.open_amount then raise exception using errcode='23514',message='allocation exceeds open item remainder'; end if;
    v_total:=v_total+v_item.amount;
  end loop;
  if v_total>(v_payment.verified_amount-v_payment.allocated_amount) then raise exception using errcode='23514',message='allocation exceeds payment remainder'; end if;

  for v_item in
    select (x->>'openItemId')::uuid open_item_id,(x->'amount'->>'amount')::numeric amount,
           x->'amount'->>'currency' currency from pg_catalog.jsonb_array_elements(p_items) x order by (x->>'openItemId')::uuid
  loop
    select coalesce(max(pa.allocation_sequence),0)+1 into v_sequence from finance.payment_allocations pa where pa.payment_id=p_payment_id and pa.open_item_id=v_item.open_item_id;
    insert into finance.payment_allocations(payment_id,open_item_id,allocation_sequence,currency_code,amount,status,created_by,correlation_id)
    values(p_payment_id,v_item.open_item_id,v_sequence,v_item.currency,v_item.amount,'ACTIVE',p_actor_id,p_correlation_id) returning id into v_allocation_id;
    update finance.open_items set allocated_amount=allocated_amount+v_item.amount,open_amount=open_amount-v_item.amount,
      status=case when open_amount-v_item.amount=0 then 'CLOSED' else 'PARTIALLY_ALLOCATED' end,version=version+1,correlation_id=p_correlation_id
      where id=v_item.open_item_id;
    if exists(select 1 from finance.open_items oi where oi.id=v_item.open_item_id and oi.original_amount<>oi.allocated_amount+oi.open_amount) then raise exception using errcode='23514',message='open item equation violated'; end if;
    v_allocations:=v_allocations||pg_catalog.jsonb_build_array(pg_catalog.jsonb_build_object('id',v_allocation_id,'openItemId',v_item.open_item_id,'amount',v_item.amount::text,'currency',v_item.currency,'status','ACTIVE'));
  end loop;

  update finance.payments set allocated_amount=allocated_amount+v_total,
    status=case when allocated_amount+v_total=verified_amount then 'ALLOCATED' else 'PARTIALLY_ALLOCATED' end,
    version=version+1,correlation_id=p_correlation_id where id=v_payment.id and version=p_expected_payment_version returning version into v_new_payment_version;
  if not found then return pg_catalog.jsonb_build_object('outcome','CONFLICT','paymentId',v_payment.id); end if;

  v_payload:=pg_catalog.jsonb_build_object('paymentId',v_payment.id,'legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'allocationMethod',p_allocation_method,'allocatedAmount',v_total::text,'currency',v_payment.currency_code,'unallocatedAmount',(v_payment.verified_amount-v_payment.allocated_amount-v_total)::text,'paymentVersion',v_new_payment_version,'allocations',v_allocations,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash);
  v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)
  values(p_legal_entity_id,'finance.payment','PAYMENT_ALLOCATED','payment',v_payment.id,v_new_payment_version,v_payload,v_payload_hash,'PENDING',p_correlation_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));
  select ae.integrity_hash into v_previous_hash from finance.audit_events ae where ae.legal_entity_id=p_legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;
  v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_hash,'GENESIS')||':'||v_payment.id::text||':PAYMENT_ALLOCATED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)
  values(p_legal_entity_id,p_actor_id,'USER','PAYMENT_ALLOCATED','payment',v_payment.id,'ALLOW',p_intent_hash,v_previous_hash,v_audit_hash,pg_catalog.jsonb_build_object('branchId',p_branch_id,'dealerAccountId',p_dealer_account_id,'allocationMethod',p_allocation_method,'itemCount',pg_catalog.jsonb_array_length(p_items),'amount',v_total::text),p_correlation_id);
  return pg_catalog.jsonb_build_object('outcome','CREATED','paymentId',v_payment.id,'paymentVersion',v_new_payment_version,'unallocatedAmount',(v_payment.verified_amount-v_payment.allocated_amount-v_total)::text,'allocations',v_allocations);
end $$;

revoke all on function finance_api.commit_payment_allocation(uuid,uuid,uuid,uuid,uuid,text,jsonb,bigint,text,text,uuid) from public, anon, authenticated;
revoke all on function finance_api.authorize_payment_allocation(uuid,text) from public, anon;
grant execute on function finance_api.authorize_payment_allocation(uuid,text) to authenticated;
-- Commit execute grant intentionally absent until reviewed server-only worker identity exists.
