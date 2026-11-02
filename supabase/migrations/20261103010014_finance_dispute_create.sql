-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-dispute-create-rpc.sql
-- Source SHA256: 0FB99AADA6EC0E5F5717D66C959F8EE1F37732C2C55D5C35432ADB6AB6A0E698
-- Local replay required before any staging promotion.
-- OTOTR DISPUTE CREATE RPC CANDIDATE

create or replace function finance_private.resolve_dispute_create_scope(
  p_actor_id uuid,p_dealer_account_id uuid,p_target_record_type text,p_target_record_id uuid,p_permission text
) returns jsonb language sql stable security definer set search_path=''
as $$ select null::jsonb $$;

create or replace function finance_private.current_dispute_create_committer_is_trusted()
returns boolean language sql stable security definer set search_path=''
as $$ select false $$;

create or replace function finance_api.authorize_dispute_create(
  p_dealer_account_id uuid,p_target_record_type text,p_target_record_id uuid,p_permission text
) returns jsonb language sql stable security definer set search_path=''
as $$
  select case when auth.uid() is null or p_permission<>'finance.disputes.create' then null::jsonb
              else finance_private.resolve_dispute_create_scope(auth.uid(),p_dealer_account_id,p_target_record_type,p_target_record_id,p_permission) end
$$;

create or replace function finance_api.commit_dispute_create(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_target_record_type text,p_target_record_id uuid,p_disputed_amount numeric,p_currency_code text,
  p_reason_code text,p_statement_hash text,p_document_ids uuid[],
  p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb language plpgsql security definer
set search_path=pg_catalog,finance,finance_private
as $$
declare
  v_open finance.open_items%rowtype;
  v_accrual finance.accruals%rowtype;
  v_existing record;
  v_dispute_id uuid:=gen_random_uuid();
  v_case_no text;
  v_document_count integer;
  v_active_disputed numeric(24,8);
  v_evidence jsonb;
  v_payload jsonb;
  v_previous_hash text;
  v_audit_hash text;
begin
  if not finance_private.current_dispute_create_committer_is_trusted() then
    raise exception using errcode='42501',message='trusted dispute create committer required';
  end if;
  if p_target_record_type not in ('OPEN_ITEM','ACCRUAL','EXTERNAL_INVOICE_LINE')
     or p_disputed_amount<=0 or p_currency_code!~'^[A-Z]{3}$'
     or pg_catalog.length(pg_catalog.btrim(coalesce(p_reason_code,''))) not between 1 and 100
     or (p_statement_hash is not null and p_statement_hash!~'^[a-fA-F0-9]{64}$')
     or pg_catalog.length(pg_catalog.btrim(coalesce(p_idempotency_key,''))) not between 8 and 200
     or p_intent_hash!~'^[a-fA-F0-9]{64}$' then
    raise exception using errcode='22023',message='invalid dispute create command';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('dispute-create:'||p_legal_entity_id::text||':'||p_idempotency_key,0));
  select om.aggregate_id,om.payload into v_existing
    from finance.outbox_messages om
   where om.legal_entity_id=p_legal_entity_id and om.topic='finance.dispute'
     and om.event_type='DISPUTE_DRAFT_CREATED' and om.payload->>'idempotencyKey'=p_idempotency_key
   order by om.created_at_utc desc,om.id desc limit 1;
  if found then
    if v_existing.payload->>'intentHash'=p_intent_hash then
      return pg_catalog.jsonb_build_object('outcome','REPLAY','disputeId',v_existing.aggregate_id,'status','DRAFT','version',1);
    end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT');
  end if;

  select oi.* into v_open
    from finance.open_items oi
    join finance.accruals a on a.id=oi.accrual_id
    left join finance.billing_batch_items bbi on bbi.accrual_id=a.id and bbi.status='ACTIVE'
    left join finance.external_invoice_lines eil on eil.billing_batch_item_id=bbi.id
   where oi.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id and oi.branch_id=p_branch_id
     and ((p_target_record_type='OPEN_ITEM' and oi.id=p_target_record_id)
       or (p_target_record_type='ACCRUAL' and a.id=p_target_record_id)
       or (p_target_record_type='EXTERNAL_INVOICE_LINE' and eil.id=p_target_record_id))
   for update of oi;
  if not found then raise exception using errcode='42501',message='dispute target scope denied'; end if;
  select * into v_accrual from finance.accruals where id=v_open.accrual_id;
  if v_open.currency_code<>p_currency_code or v_accrual.currency_code<>p_currency_code
     or v_open.status in ('REVERSED','CLOSED') then
    raise exception using errcode='23514',message='dispute target is not eligible';
  end if;
  select coalesce(pg_catalog.sum(
           case when d.status in ('DRAFT','SUBMITTED','UNDER_REVIEW') then d.disputed_amount
                when d.status in ('ACCEPTED','PARTIALLY_ACCEPTED','CLOSED') then coalesce(d.accepted_amount,0)
                else 0 end),0) into v_active_disputed
    from finance.disputes d where d.open_item_id=v_open.id and d.status<>'REJECTED';
  if p_disputed_amount>v_open.open_amount-v_active_disputed then
    raise exception using errcode='23514',message='disputed amount exceeds available open amount';
  end if;

  select pg_catalog.count(distinct dr.external_document_id) into v_document_count
    from finance.document_references dr
   where dr.legal_entity_id=p_legal_entity_id and dr.status='ACTIVE'
     and dr.external_document_id=any(coalesce(p_document_ids,array[]::uuid[]));
  if v_document_count<>coalesce(pg_catalog.cardinality(p_document_ids),0) then
    raise exception using errcode='23514',message='active dispute evidence required';
  end if;

  v_case_no:='DSP-'||pg_catalog.upper(pg_catalog.replace(v_dispute_id::text,'-',''));
  v_evidence:=pg_catalog.jsonb_build_object(
    'targetRecordType',p_target_record_type,'targetRecordId',p_target_record_id,
    'currencyCode',p_currency_code,'statementHash',p_statement_hash,
    'documentIds',pg_catalog.to_jsonb(coalesce(p_document_ids,array[]::uuid[]))
  );
  insert into finance.disputes(
    id,legal_entity_id,case_no,open_item_id,disputed_amount,reason_code,evidence_refs,
    status,version,created_by,correlation_id
  ) values(
    v_dispute_id,p_legal_entity_id,v_case_no,v_open.id,p_disputed_amount,p_reason_code,v_evidence,
    'DRAFT',1,p_actor_id,p_correlation_id
  );
  insert into finance.document_links(
    legal_entity_id,document_reference_id,subject_type,subject_id,purpose_code,created_by,correlation_id
  ) select p_legal_entity_id,dr.id,'DISPUTE',v_dispute_id,'DISPUTE_EVIDENCE',p_actor_id,p_correlation_id
      from finance.document_references dr
     where dr.legal_entity_id=p_legal_entity_id and dr.status='ACTIVE'
       and dr.external_document_id=any(coalesce(p_document_ids,array[]::uuid[]));

  v_payload:=pg_catalog.jsonb_build_object(
    'disputeId',v_dispute_id,'caseNo',v_case_no,'openItemId',v_open.id,'accrualId',v_accrual.id,
    'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,
    'targetRecordType',p_target_record_type,'targetRecordId',p_target_record_id,
    'disputedAmount',p_disputed_amount::text,'currencyCode',p_currency_code,
    'reasonCode',p_reason_code,'statementHash',p_statement_hash,'documentCount',v_document_count,
    'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash
  );
  insert into finance.outbox_messages(
    legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id
  ) values(
    p_legal_entity_id,'finance.dispute','DISPUTE_DRAFT_CREATED','DISPUTE',v_dispute_id,1,
    v_payload,p_intent_hash,'PENDING',p_correlation_id
  );
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));
  select ae.integrity_hash into v_previous_hash from finance.audit_events ae
   where ae.legal_entity_id=p_legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;
  v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(
    coalesce(v_previous_hash,'GENESIS')||':'||v_dispute_id::text||':DISPUTE_DRAFT_CREATED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(
    legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,
    after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id
  ) values(
    p_legal_entity_id,p_actor_id,'USER','DISPUTE_DRAFT_CREATED','DISPUTE',v_dispute_id,'ALLOW',p_reason_code,
    p_intent_hash,v_previous_hash,v_audit_hash,
    pg_catalog.jsonb_build_object('openItemId',v_open.id,'branchId',p_branch_id,'statementHash',p_statement_hash,'documentCount',v_document_count),p_correlation_id
  );
  return pg_catalog.jsonb_build_object('outcome','CREATED','disputeId',v_dispute_id,'status','DRAFT','version',1);
end $$;

revoke all on function finance_private.resolve_dispute_create_scope(uuid,uuid,text,uuid,text) from public,anon,authenticated;
revoke all on function finance_private.current_dispute_create_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_api.authorize_dispute_create(uuid,text,uuid,text) from public,anon;
grant execute on function finance_api.authorize_dispute_create(uuid,text,uuid,text) to authenticated;
revoke all on function finance_api.commit_dispute_create(uuid,uuid,uuid,uuid,text,uuid,numeric,text,text,text,uuid[],text,text,uuid) from public,anon,authenticated;
