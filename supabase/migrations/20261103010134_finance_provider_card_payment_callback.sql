-- Provider-neutral, atomic full invoice card settlement and branch unlock evaluation.

create or replace function finance_api.commit_provider_card_payment_callback(
  p_prepared_actor_id uuid,p_verified_actor_id uuid,p_external_invoice_id uuid,
  p_provider_code text,p_provider_event_id text,p_provider_payment_id text,
  p_settled_at_utc timestamptz,p_amount numeric,p_currency_code text,
  p_intent_hash text,p_correlation_id uuid
)returns jsonb language plpgsql security definer set search_path='' as $$
declare inv record;v_existing finance.payments%rowtype;v_payment jsonb;v_verified jsonb;v_allocated jsonb;v_access jsonb;
  v_items jsonb;v_open_total numeric(24,8);v_payment_id uuid;v_payment_version bigint;
  v_create_hash text;v_verify_hash text;v_allocate_hash text;v_idem text;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'')<>'service_role'then raise exception using errcode='42501',message='provider callback worker denied';end if;
  if p_prepared_actor_id is null or p_verified_actor_id is null or p_prepared_actor_id=p_verified_actor_id or p_external_invoice_id is null
    or p_provider_code!~'^[A-Z][A-Z0-9_]{1,63}$' or pg_catalog.length(pg_catalog.btrim(coalesce(p_provider_event_id,'')))not between 8 and 120
    or pg_catalog.length(pg_catalog.btrim(coalesce(p_provider_payment_id,'')))not between 3 and 120 or p_settled_at_utc is null
    or p_amount<=0 or p_currency_code!~'^[A-Z]{3}$' or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null
  then raise exception using errcode='22023',message='invalid provider payment callback';end if;
  v_idem:='card-callback:'||p_provider_code||':'||p_provider_event_id;
  v_create_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_intent_hash||':create','UTF8'),'sha256'),'hex');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_idem,0));
  select p.* into v_existing from finance.payments p where p.idempotency_key=v_idem;
  if found then
    if v_existing.intent_hash<>v_create_hash then return pg_catalog.jsonb_build_object('outcome','CONFLICT','paymentId',v_existing.id);end if;
    v_access:=finance_api.evaluate_branch_operation_access(p_verified_actor_id,v_existing.legal_entity_id,v_existing.dealer_account_id,v_existing.branch_id,(p_settled_at_utc at time zone 'Europe/Istanbul')::date,p_correlation_id);
    return pg_catalog.jsonb_build_object('outcome','REPLAY','paymentId',v_existing.id,'paymentStatus',v_existing.status,'paymentVersion',v_existing.version,'accessState',v_access->>'accessState','rawCardDataStored',false);
  end if;
  select ei.id,ei.legal_entity_id,bb.dealer_account_id,ei.branch_id,ei.currency_code,ei.status
    into inv from finance.external_invoices ei join finance.billing_batches bb on bb.id=ei.billing_batch_id
   where ei.id=p_external_invoice_id for update of ei;
  if not found then raise exception using errcode='P0002',message='external invoice not found';end if;
  if inv.status<>'ISSUED'then raise exception using errcode='23514',message='issued invoice required';end if;
  if inv.currency_code<>p_currency_code then raise exception using errcode='23514',message='provider payment currency mismatch';end if;
  select coalesce(pg_catalog.sum(oi.open_amount),0),coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'openItemId',oi.id,'amount',pg_catalog.jsonb_build_object('amount',oi.open_amount::text,'currency',oi.currency_code),'expectedOpenItemVersion',oi.version
  )order by oi.due_date,oi.id),'[]'::jsonb) into v_open_total,v_items
  from finance.external_invoice_lines eil join finance.billing_batch_items bbi on bbi.id=eil.billing_batch_item_id and bbi.status='ACTIVE'
  join finance.open_items oi on oi.accrual_id=bbi.accrual_id and oi.item_type='DEBIT' and oi.status in('OPEN','PARTIALLY_ALLOCATED')and oi.open_amount>0
  where eil.external_invoice_id=p_external_invoice_id and oi.legal_entity_id=inv.legal_entity_id and oi.dealer_account_id=inv.dealer_account_id and oi.branch_id=inv.branch_id;
  if v_open_total<=0 then raise exception using errcode='23514',message='invoice has no open debit';end if;
  if p_amount<>v_open_total then raise exception using errcode='23514',message='provider payment must equal current invoice open amount';end if;
  v_payment:=finance_api.commit_payment_creation(p_prepared_actor_id,inv.legal_entity_id,inv.dealer_account_id,inv.branch_id,(p_settled_at_utc at time zone 'Europe/Istanbul')::date,(p_settled_at_utc at time zone 'Europe/Istanbul')::date,p_amount,p_currency_code,'CREDIT_CARD',p_provider_code||':'||p_provider_payment_id,p_provider_payment_id,null,array[]::uuid[],v_idem,v_create_hash,p_correlation_id);
  if v_payment->>'outcome'<>'CREATED'then raise exception using errcode='23514',message='provider payment creation failed';end if;
  v_payment_id:=(v_payment->>'paymentId')::uuid;v_payment_version:=(v_payment->>'version')::bigint;
  v_verify_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_intent_hash||':verify','UTF8'),'sha256'),'hex');
  v_verified:=finance_api.commit_payment_verification(p_verified_actor_id,v_payment_id,v_payment_version,'PAYMENT_PROVIDER_VERIFIED_CALLBACK',array[]::uuid[],v_idem||':verify',v_verify_hash,null,p_correlation_id);
  if v_verified->>'outcome'<>'CREATED'then raise exception using errcode='23514',message='provider payment verification failed';end if;
  v_payment_version:=(v_verified->>'version')::bigint;
  v_allocate_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_intent_hash||':allocate','UTF8'),'sha256'),'hex');
  v_allocated:=finance_api.commit_payment_allocation(p_verified_actor_id,v_payment_id,inv.legal_entity_id,inv.dealer_account_id,inv.branch_id,'REFERENCE_MATCH',v_items,v_payment_version,v_idem||':allocate',v_allocate_hash,p_correlation_id);
  if v_allocated->>'outcome'<>'CREATED'then raise exception using errcode='23514',message='provider payment allocation failed';end if;
  v_access:=finance_api.evaluate_branch_operation_access(p_verified_actor_id,inv.legal_entity_id,inv.dealer_account_id,inv.branch_id,(p_settled_at_utc at time zone 'Europe/Istanbul')::date,p_correlation_id);
  return pg_catalog.jsonb_build_object('outcome','SETTLED','paymentId',v_payment_id,'paymentStatus','ALLOCATED','paymentVersion',v_allocated->>'paymentVersion','allocatedAmount',p_amount::text,'currency',p_currency_code,'externalInvoiceId',p_external_invoice_id,'accessState',v_access->>'accessState','rawCardDataStored',false);
end$$;

revoke all on function finance_api.commit_provider_card_payment_callback(uuid,uuid,uuid,text,text,text,timestamptz,numeric,text,text,uuid)from public,anon,authenticated;
grant execute on function finance_api.commit_provider_card_payment_callback(uuid,uuid,uuid,text,text,text,timestamptz,numeric,text,text,uuid)to service_role;
