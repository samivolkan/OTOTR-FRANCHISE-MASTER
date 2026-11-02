-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-invoice-dispatch-rpc.sql
-- Source SHA256: AA206A92F535E2B7A984E649A037DC9EE0CC4079E262F9A54DCAA09BE1CA81CC
-- Local replay required before any staging promotion.
-- OTOTR FINANCE INVOICE DISPATCH RPC CANDIDATE
-- Real migration must explicitly provision pgcrypto in the reviewed extensions schema.

create or replace function finance_private.current_actor_can_dispatch_invoice(
  p_actor_id uuid, p_legal_entity_id uuid, p_branch_id uuid
) returns boolean
language sql stable security definer set search_path = ''
as $$ select false $$;

revoke all on function finance_private.current_actor_can_dispatch_invoice(uuid,uuid,uuid) from public, anon, authenticated;

create or replace function finance_api.authorize_invoice_dispatch_scope(
  p_legal_entity_id uuid, p_branch_id uuid, p_permission text
) returns boolean
language sql stable security definer set search_path = ''
as $$
  select p_permission = 'finance.invoices.dispatch'
    and auth.uid() is not null
    and finance_private.current_actor_can_dispatch_invoice(auth.uid(), p_legal_entity_id, p_branch_id)
    and exists (
      select 1 from finance.branches b
      where b.id = p_branch_id and b.legal_entity_id = p_legal_entity_id and b.status = 'ACTIVE'
    )
$$;

create or replace function finance_api.find_invoice_intent(
  p_legal_entity_id uuid, p_branch_id uuid, p_idempotency_key text
) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare v_row record;
begin
  if not finance_api.authorize_invoice_dispatch_scope(p_legal_entity_id, p_branch_id, 'finance.invoices.dispatch') then
    raise exception using errcode = '42501', message = 'finance scope denied';
  end if;
  select ei.external_invoice_id, ei.status, ei.intent_hash into v_row
  from finance.external_invoices ei
  where ei.legal_entity_id = p_legal_entity_id and ei.idempotency_key = p_idempotency_key and ei.branch_id = p_branch_id;
  if not found then return null; end if;
  return pg_catalog.jsonb_build_object('externalInvoiceId',v_row.external_invoice_id,'status',v_row.status,'intentHash',v_row.intent_hash);
end $$;

create or replace function finance_api.commit_invoice_acceptance(
  p_invoice jsonb, p_intent_hash text, p_correlation_id uuid
) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_legal uuid := (p_invoice->>'legalEntityId')::uuid;
  v_branch uuid := (p_invoice->>'branchId')::uuid;
  v_batch uuid := (p_invoice->>'billingBatchId')::uuid;
  v_key text := p_invoice->>'idempotencyKey';
  v_system text := p_invoice->>'externalSystem';
  v_external_id text := p_invoice->>'externalInvoiceId';
  v_net numeric(24,8) := (p_invoice#>>'{money,net}')::numeric;
  v_tax numeric(24,8) := (p_invoice#>>'{money,tax}')::numeric;
  v_gross numeric(24,8) := (p_invoice#>>'{money,gross}')::numeric;
  v_currency text := p_invoice->>'currencyCode';
  v_existing record; v_batch_row record; v_invoice_id uuid; v_line jsonb; v_line_count integer := 0;
  v_audit_hash text; v_previous_audit_hash text; v_before_hash text; v_after_hash text;
begin
  if auth.uid() is null or coalesce(v_key,'') = '' or coalesce(p_intent_hash,'') = '' or coalesce(v_external_id,'') = '' or p_correlation_id is null then
    raise exception using errcode = '22023', message = 'required invoice fields missing';
  end if;
  if p_invoice->>'status' <> 'PENDING' then raise exception using errcode = '22023', message = 'accepted invoice must be pending'; end if;
  if not finance_api.authorize_invoice_dispatch_scope(v_legal, v_branch, 'finance.invoices.dispatch') then
    raise exception using errcode = '42501', message = 'finance scope denied';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_legal::text || ':' || v_key, 0));
  select ei.external_invoice_id,ei.status,ei.intent_hash into v_existing from finance.external_invoices ei
  where ei.legal_entity_id=v_legal and ei.idempotency_key=v_key;
  if found then
    if v_existing.intent_hash = p_intent_hash then
      return pg_catalog.jsonb_build_object('outcome','REPLAY','externalInvoiceId',v_existing.external_invoice_id,'status',v_existing.status,'intentHash',v_existing.intent_hash);
    end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','externalInvoiceId',v_existing.external_invoice_id,'status',v_existing.status,'intentHash',v_existing.intent_hash);
  end if;
  select bb.legal_entity_id,bb.branch_id,bb.currency_code,bb.control_net,bb.control_tax,bb.control_gross,bb.status into v_batch_row
  from finance.billing_batches bb where bb.id=v_batch for update;
  if not found or v_batch_row.legal_entity_id<>v_legal or v_batch_row.branch_id<>v_branch or v_batch_row.status not in ('READY','EXPORT_QUEUED') then
    raise exception using errcode='23514', message='billing batch unavailable';
  end if;
  if v_batch_row.currency_code<>v_currency or v_batch_row.control_net<>v_net or v_batch_row.control_tax<>v_tax or v_batch_row.control_gross<>v_gross or v_gross<>v_net+v_tax then
    raise exception using errcode='23514', message='invoice totals mismatch';
  end if;
  if pg_catalog.jsonb_typeof(p_invoice->'lines') is distinct from 'array' or pg_catalog.jsonb_array_length(p_invoice->'lines')=0 then
    raise exception using errcode='22023', message='invoice lines missing';
  end if;
  insert into finance.external_invoices(legal_entity_id,billing_batch_id,branch_id,idempotency_key,intent_hash,external_system,external_invoice_id,currency_code,net_amount,tax_amount,gross_amount,status,created_by,correlation_id)
  values(v_legal,v_batch,v_branch,v_key,p_intent_hash,v_system,v_external_id,v_currency,v_net,v_tax,v_gross,'PENDING',auth.uid(),p_correlation_id)
  returning id into v_invoice_id;
  for v_line in select value from pg_catalog.jsonb_array_elements(p_invoice->'lines') loop
    v_line_count := v_line_count + 1;
    if not exists (
      select 1 from finance.billing_batch_items bi where bi.id=(v_line->>'billingBatchItemId')::uuid and bi.billing_batch_id=v_batch and bi.status='ACTIVE'
        and bi.net_amount=(v_line#>>'{money,net}')::numeric and bi.tax_amount=(v_line#>>'{money,tax}')::numeric and bi.gross_amount=(v_line#>>'{money,gross}')::numeric
    ) then raise exception using errcode='23514', message='invoice line mismatch'; end if;
    insert into finance.external_invoice_lines(external_invoice_id,billing_batch_item_id,line_no,net_amount,tax_amount,gross_amount,created_by,correlation_id)
    values(v_invoice_id,(v_line->>'billingBatchItemId')::uuid,v_line_count,(v_line#>>'{money,net}')::numeric,(v_line#>>'{money,tax}')::numeric,(v_line#>>'{money,gross}')::numeric,auth.uid(),p_correlation_id);
  end loop;
  if v_line_count <> (select count(*) from finance.billing_batch_items bi where bi.billing_batch_id=v_batch and bi.status='ACTIVE') then
    raise exception using errcode='23514', message='invoice line coverage mismatch';
  end if;
  update finance.billing_batches set status='EXPORTED',version=version+1,correlation_id=p_correlation_id where id=v_batch;
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)
  values(v_legal,'finance.invoice','INVOICE_ACCEPTED','external_invoice',v_invoice_id,1,pg_catalog.jsonb_build_object('invoiceId',v_invoice_id,'branchId',v_branch,'status','PENDING'),p_intent_hash,'PENDING',p_correlation_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||v_legal::text,0));
  select ae.integrity_hash into v_previous_audit_hash from finance.audit_events ae where ae.legal_entity_id=v_legal order by ae.created_at_utc desc,ae.id desc limit 1;
  v_before_hash:=null; v_after_hash:=p_intent_hash;
  v_audit_hash := pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_audit_hash,'GENESIS')||':'||v_invoice_id::text||':INVOICE_ACCEPTED:'||coalesce(v_before_hash,'')||':'||v_after_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)
  values(v_legal,auth.uid(),'USER','INVOICE_ACCEPTED','external_invoice',v_invoice_id,'ALLOW',v_before_hash,v_after_hash,v_previous_audit_hash,v_audit_hash,pg_catalog.jsonb_build_object('branchId',v_branch,'provider',v_system),p_correlation_id);
  return pg_catalog.jsonb_build_object('outcome','CREATED','externalInvoiceId',v_external_id,'status','PENDING','intentHash',p_intent_hash);
end $$;

revoke all on function finance_api.authorize_invoice_dispatch_scope(uuid,uuid,text) from public, anon;
revoke all on function finance_api.find_invoice_intent(uuid,uuid,text) from public, anon;
revoke all on function finance_api.commit_invoice_acceptance(jsonb,text,uuid) from public, anon;
grant execute on function finance_api.authorize_invoice_dispatch_scope(uuid,uuid,text) to authenticated;
grant execute on function finance_api.find_invoice_intent(uuid,uuid,text) to authenticated;
grant execute on function finance_api.commit_invoice_acceptance(jsonb,text,uuid) to authenticated;
