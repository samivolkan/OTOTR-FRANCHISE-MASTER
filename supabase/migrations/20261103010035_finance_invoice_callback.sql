-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-invoice-callback-rpc.sql
-- Source SHA256: F9868FBFC35A09D55F7A34944F11F2BCA891F996B9D20890B782F831A1FAFD44
-- Local replay required before any staging promotion.
-- OTOTR FINANCE INVOICE CALLBACK RPC CANDIDATE
-- Real migration must explicitly provision pgcrypto in the reviewed extensions schema.

create or replace function finance_private.current_callback_caller_is_trusted()
returns boolean language sql stable security definer set search_path = ''
as $$ select false $$;
revoke all on function finance_private.current_callback_caller_is_trusted() from public, anon, authenticated;

create or replace function finance_api.find_invoice_callback_context(
  p_provider_id text, p_external_invoice_id text, p_external_event_id text
) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare v_invoice record; v_duplicate boolean;
begin
  if not finance_private.current_callback_caller_is_trusted() then raise exception using errcode='42501',message='callback caller denied'; end if;
  select exists(select 1 from finance.inbox_messages im where im.source_system=p_provider_id and im.message_id=p_external_event_id) into v_duplicate;
  select ei.external_system,ei.external_invoice_id,ei.branch_id,ei.status,ei.version,ei.invoice_number,ei.invoice_date into v_invoice
  from finance.external_invoices ei where ei.external_system=p_provider_id and ei.external_invoice_id=p_external_invoice_id;
  if not found then return null; end if;
  return pg_catalog.jsonb_build_object('providerId',v_invoice.external_system,'duplicate',v_duplicate,
    'invoice',pg_catalog.jsonb_build_object('externalInvoiceId',v_invoice.external_invoice_id,'branchId',v_invoice.branch_id,'status',v_invoice.status,'version',v_invoice.version,
      'invoiceNumber',v_invoice.invoice_number,'invoiceDate',v_invoice.invoice_date),
    'processedExternalEventIds',case when v_duplicate then pg_catalog.jsonb_build_array(p_external_event_id) else '[]'::jsonb end);
end $$;

create or replace function finance_api.commit_invoice_callback(
  p_provider_id text, p_external_event_id text, p_external_invoice_id text, p_expected_version bigint,
  p_callback jsonb, p_transition jsonb, p_correlation_id uuid
) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_invoice record; v_action text:=p_transition->>'action'; v_next_status text:=p_transition#>>'{invoice,status}';
  v_next_version bigint:=(p_transition#>>'{invoice,version}')::bigint; v_payload_hash text; v_audit_hash text; v_previous_audit_hash text; v_before_hash text; v_after_hash text;
begin
  if not finance_private.current_callback_caller_is_trusted() then raise exception using errcode='42501',message='callback caller denied'; end if;
  if coalesce(p_provider_id,'')='' or coalesce(p_external_event_id,'')='' or coalesce(p_external_invoice_id,'')='' or p_expected_version<1 or p_correlation_id is null then
    raise exception using errcode='22023',message='required callback fields missing';
  end if;
  if p_callback->>'externalEventId'<>p_external_event_id or p_callback->>'externalInvoiceId'<>p_external_invoice_id or (p_callback->>'expectedVersion')::bigint<>p_expected_version then
    raise exception using errcode='22023',message='callback identity mismatch';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_provider_id||':'||p_external_event_id,0));
  if exists(select 1 from finance.inbox_messages im where im.source_system=p_provider_id and im.message_id=p_external_event_id) then
    return pg_catalog.jsonb_build_object('status','DUPLICATE');
  end if;
  select ei.id,ei.legal_entity_id,ei.billing_batch_id,ei.branch_id,ei.status,ei.version,ei.invoice_number,ei.invoice_date into v_invoice
  from finance.external_invoices ei where ei.external_system=p_provider_id and ei.external_invoice_id=p_external_invoice_id for update;
  if not found then raise exception using errcode='P0002',message='external invoice not found'; end if;
  if v_invoice.version<>p_expected_version then return pg_catalog.jsonb_build_object('status','VERSION_CONFLICT'); end if;
  if v_action not in ('APPLY','STATE_NOOP') then raise exception using errcode='22023',message='unsupported callback action'; end if;
  if p_callback->>'status'<>v_next_status then raise exception using errcode='23514',message='callback transition status mismatch'; end if;
  if v_next_status='ISSUED' and (coalesce(p_callback->>'invoiceNumber','')='' or coalesce(p_callback->>'invoiceDate','') !~ '^\d{4}-\d{2}-\d{2}$') then
    raise exception using errcode='22023',message='issued invoice document fields missing';
  end if;
  if v_action='STATE_NOOP' and v_next_status='ISSUED' and
     (p_callback->>'invoiceNumber' is distinct from v_invoice.invoice_number or (p_callback->>'invoiceDate')::date is distinct from v_invoice.invoice_date) then
    raise exception using errcode='23514',message='issued invoice document conflict';
  end if;
  if v_action='APPLY' then
    if v_next_version<>v_invoice.version+1 or not (
      (v_invoice.status='PENDING' and v_next_status in ('ISSUED','REJECTED','CANCELLED')) or
      (v_invoice.status='ISSUED' and v_next_status in ('CANCELLED','CREDITED'))
    ) then raise exception using errcode='23514',message='illegal callback transition'; end if;
  else
    if v_next_status<>v_invoice.status or v_next_version<>v_invoice.version then raise exception using errcode='23514',message='invalid callback noop'; end if;
  end if;
  v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_callback::text,'UTF8'),'sha256'),'hex');
  insert into finance.inbox_messages(legal_entity_id,source_system,message_id,payload_hash,schema_version,payload,status,result_reference,processed_at_utc,correlation_id)
  values(v_invoice.legal_entity_id,p_provider_id,p_external_event_id,v_payload_hash,1,p_callback,'PROCESSED',v_invoice.id::text,pg_catalog.now(),p_correlation_id);
  if v_action='APPLY' then
    update finance.external_invoices set status=v_next_status,version=v_next_version,
      invoice_number=case when v_next_status='ISSUED' then p_callback->>'invoiceNumber' else invoice_number end,
      invoice_date=case when v_next_status='ISSUED' then (p_callback->>'invoiceDate')::date else invoice_date end,
      correlation_id=p_correlation_id where id=v_invoice.id and version=p_expected_version;
    if not found then raise exception using errcode='40001',message='invoice version conflict'; end if;
    if v_next_status='ISSUED' then update finance.billing_batches set status='INVOICED',version=version+1,correlation_id=p_correlation_id where id=v_invoice.billing_batch_id and status='EXPORTED'; end if;
    if v_next_status='REJECTED' then update finance.billing_batches set status='REJECTED',version=version+1,correlation_id=p_correlation_id where id=v_invoice.billing_batch_id and status='EXPORTED'; end if;
    insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)
    values(v_invoice.legal_entity_id,'finance.invoice','INVOICE_STATUS_CHANGED','external_invoice',v_invoice.id,v_next_version,p_transition->'outbox',v_payload_hash,'PENDING',p_correlation_id);
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||v_invoice.legal_entity_id::text,0));
  select ae.integrity_hash into v_previous_audit_hash from finance.audit_events ae where ae.legal_entity_id=v_invoice.legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;
  v_before_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_invoice.status||':'||v_invoice.version::text,'UTF8'),'sha256'),'hex');
  v_after_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_next_status||':'||v_next_version::text,'UTF8'),'sha256'),'hex');
  v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_audit_hash,'GENESIS')||':'||v_invoice.id::text||':INVOICE_CALLBACK:'||v_before_hash||':'||v_after_hash||':'||p_external_event_id||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)
  values(v_invoice.legal_entity_id,null,'EXTERNAL_PROVIDER','INVOICE_CALLBACK','external_invoice',v_invoice.id,'ALLOW',v_before_hash,v_after_hash,v_previous_audit_hash,v_audit_hash,
    pg_catalog.jsonb_build_object('provider',p_provider_id,'externalEventId',p_external_event_id,'action',v_action,'evidenceRef',p_callback->>'evidenceRef'),p_correlation_id);
  return pg_catalog.jsonb_build_object('status','COMMITTED');
end $$;

revoke all on function finance_api.find_invoice_callback_context(text,text,text) from public, anon, authenticated;
revoke all on function finance_api.commit_invoice_callback(text,text,text,bigint,jsonb,jsonb,uuid) from public, anon, authenticated;
-- Execute grants are intentionally absent until a reviewed server-only database role is provisioned.
