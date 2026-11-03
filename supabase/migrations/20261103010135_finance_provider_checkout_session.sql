-- Provider-neutral checkout context and token-hash-only session audit.

create or replace function finance_api.prepare_provider_card_checkout(
  p_actor_id uuid,p_external_invoice_id uuid,p_correlation_id uuid
)returns jsonb language plpgsql stable security definer set search_path='' as $$
declare inv record;v_open numeric(24,8);
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'')<>'service_role'then raise exception using errcode='42501',message='provider checkout worker denied';end if;
  if p_actor_id is null or p_external_invoice_id is null or p_correlation_id is null then raise exception using errcode='22023',message='invalid provider checkout context request';end if;
  select ei.id,ei.legal_entity_id,bb.dealer_account_id,ei.branch_id,ei.currency_code,ei.status
    into inv from finance.external_invoices ei join finance.billing_batches bb on bb.id=ei.billing_batch_id
   where ei.id=p_external_invoice_id;
  if not found then raise exception using errcode='P0002',message='external invoice not found';end if;
  if inv.status<>'ISSUED'then raise exception using errcode='23514',message='issued invoice required';end if;
  if not finance_private.current_actor_can_read_scope(p_actor_id,inv.legal_entity_id,inv.dealer_account_id,inv.branch_id,'listPayments')then raise exception using errcode='42501',message='provider checkout scope denied';end if;
  select coalesce(pg_catalog.sum(oi.open_amount),0)into v_open
    from finance.external_invoice_lines eil join finance.billing_batch_items bbi on bbi.id=eil.billing_batch_item_id and bbi.status='ACTIVE'
    join finance.open_items oi on oi.accrual_id=bbi.accrual_id and oi.item_type='DEBIT'and oi.status in('OPEN','PARTIALLY_ALLOCATED')and oi.open_amount>0
   where eil.external_invoice_id=p_external_invoice_id and oi.legal_entity_id=inv.legal_entity_id and oi.dealer_account_id=inv.dealer_account_id and oi.branch_id=inv.branch_id;
  if v_open<=0 then raise exception using errcode='23514',message='invoice has no open debit';end if;
  return pg_catalog.jsonb_build_object('externalInvoiceId',inv.id,'legalEntityId',inv.legal_entity_id,'dealerAccountId',inv.dealer_account_id,'branchId',inv.branch_id,'openAmount',v_open::text,'currencyCode',inv.currency_code,'invoiceStatus',inv.status,'paymentMethod','CREDIT_CARD','correlationId',p_correlation_id);
end$$;

create or replace function finance_api.record_provider_card_checkout(
  p_actor_id uuid,p_external_invoice_id uuid,p_provider_code text,p_provider_payment_token_hash text,
  p_amount numeric,p_currency_code text,p_expires_at_utc timestamptz,p_correlation_id uuid
)returns jsonb language plpgsql security definer set search_path='' as $$
declare c jsonb;v_existing finance.outbox_messages%rowtype;v_session_id uuid:=extensions.gen_random_uuid();v_payload jsonb;v_hash text;v_previous text;v_audit text;
begin
  if coalesce(current_setting('request.jwt.claim.role',true),'')<>'service_role'then raise exception using errcode='42501',message='provider checkout worker denied';end if;
  if p_provider_code!~'^[A-Z][A-Z0-9_]{1,63}$'or p_provider_payment_token_hash!~'^[a-fA-F0-9]{64}$'or p_amount<=0 or p_currency_code!~'^[A-Z]{3}$'or p_expires_at_utc<=pg_catalog.now()or p_correlation_id is null then raise exception using errcode='22023',message='invalid provider checkout session';end if;
  c:=finance_api.prepare_provider_card_checkout(p_actor_id,p_external_invoice_id,p_correlation_id);
  if(c->>'openAmount')::numeric<>p_amount or c->>'currencyCode'<>p_currency_code then raise exception using errcode='23514',message='provider checkout amount or currency mismatch';end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('provider-checkout:'||p_provider_code||':'||p_provider_payment_token_hash,0));
  select * into v_existing from finance.outbox_messages where topic='finance.payment-checkout'and event_type='PROVIDER_CARD_CHECKOUT_CREATED'and payload->>'providerCode'=p_provider_code and payload->>'providerPaymentTokenHash'=pg_catalog.lower(p_provider_payment_token_hash)order by created_at_utc desc limit 1;
  if found then
    if v_existing.payload->>'externalInvoiceId'=p_external_invoice_id::text and v_existing.payload->>'amount'=p_amount::text and v_existing.payload->>'currencyCode'=p_currency_code then return pg_catalog.jsonb_build_object('outcome','REPLAY','checkoutSessionId',v_existing.aggregate_id,'rawCardDataStored',false,'providerTokenStored',false);end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','checkoutSessionId',v_existing.aggregate_id);
  end if;
  v_payload:=pg_catalog.jsonb_build_object('checkoutSessionId',v_session_id,'externalInvoiceId',p_external_invoice_id,'dealerAccountId',c->>'dealerAccountId','branchId',c->>'branchId','providerCode',p_provider_code,'providerPaymentTokenHash',pg_catalog.lower(p_provider_payment_token_hash),'amount',p_amount::text,'currencyCode',p_currency_code,'expiresAtUtc',p_expires_at_utc,'actorId',p_actor_id,'rawCardDataStored',false,'providerTokenStored',false);
  v_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)values((c->>'legalEntityId')::uuid,'finance.payment-checkout','PROVIDER_CARD_CHECKOUT_CREATED','provider_card_checkout',v_session_id,1,v_payload,v_hash,'PENDING',p_correlation_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||(c->>'legalEntityId'),0));select integrity_hash into v_previous from finance.audit_events where legal_entity_id=(c->>'legalEntityId')::uuid order by created_at_utc desc,id desc limit 1;
  v_audit:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous,'GENESIS')||':'||v_session_id::text||':PROVIDER_CARD_CHECKOUT_CREATED:'||v_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)values((c->>'legalEntityId')::uuid,p_actor_id,'USER','PROVIDER_CARD_CHECKOUT_CREATED','provider_card_checkout',v_session_id,'ALLOW',v_hash,v_previous,v_audit,pg_catalog.jsonb_build_object('externalInvoiceId',p_external_invoice_id,'dealerAccountId',c->>'dealerAccountId','branchId',c->>'branchId','providerCode',p_provider_code,'amount',p_amount::text,'currencyCode',p_currency_code,'expiresAtUtc',p_expires_at_utc,'providerPaymentTokenHash',pg_catalog.lower(p_provider_payment_token_hash),'rawCardDataStored',false,'providerTokenStored',false),p_correlation_id);
  return pg_catalog.jsonb_build_object('outcome','CREATED','checkoutSessionId',v_session_id,'rawCardDataStored',false,'providerTokenStored',false);
end$$;

revoke all on function finance_api.prepare_provider_card_checkout(uuid,uuid,uuid)from public,anon,authenticated;
revoke all on function finance_api.record_provider_card_checkout(uuid,uuid,text,text,numeric,text,timestamptz,uuid)from public,anon,authenticated;
grant execute on function finance_api.prepare_provider_card_checkout(uuid,uuid,uuid)to service_role;
grant execute on function finance_api.record_provider_card_checkout(uuid,uuid,text,text,numeric,text,timestamptz,uuid)to service_role;
