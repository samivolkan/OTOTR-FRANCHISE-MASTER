-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-payment-verification-rpc.sql
-- Source SHA256: 2EB80A89852E775A00551F76911D93B261E5FC81FBC9914F9121493FA3056D84
-- Local replay required before any staging promotion.
-- OTOTR FINANCE PAYMENT VERIFICATION RPC CANDIDATE (TX-04)

create or replace function finance_private.current_payment_verification_worker_is_trusted()
returns boolean language sql stable security definer set search_path = '' as $$ select false $$;
revoke all on function finance_private.current_payment_verification_worker_is_trusted() from public, anon, authenticated;

create or replace function finance_private.current_actor_can_verify_payment(p_actor_id uuid,p_payment_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$ select false $$;
revoke all on function finance_private.current_actor_can_verify_payment(uuid,uuid) from public, anon, authenticated;

create or replace function finance_api.authorize_payment_verification(p_payment_id uuid,p_permission text)
returns boolean language sql stable security definer set search_path = '' as $$
  select p_permission='finance.payments.verify' and auth.uid() is not null
    and finance_private.current_actor_can_verify_payment(auth.uid(),p_payment_id)
$$;

create or replace function finance_api.commit_payment_verification(
  p_actor_id uuid,p_payment_id uuid,p_expected_version bigint,p_verification_source text,
  p_document_ids uuid[],p_idempotency_key text,p_intent_hash text,p_note text,p_correlation_id uuid
) returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  v finance.payments%rowtype;v_period_id uuid;v_map finance.payment_account_mappings%rowtype;
  v_clearing finance.operational_accounts%rowtype;v_receivable finance.operational_accounts%rowtype;
  v_journal_id uuid;v_document_count integer;v_new_version bigint;v_note_hash text;v_payload jsonb;v_payload_hash text;v_previous_hash text;v_audit_hash text;
begin
  if not finance_private.current_payment_verification_worker_is_trusted() then raise exception using errcode='42501',message='payment verification worker denied'; end if;
  if p_actor_id is null or p_payment_id is null or p_expected_version is null or p_expected_version<1
     or coalesce(pg_catalog.btrim(p_verification_source),'')='' or pg_catalog.length(p_verification_source)>100
     or coalesce(pg_catalog.btrim(p_idempotency_key),'')='' or pg_catalog.length(p_idempotency_key)>200
     or p_intent_hash!~'^[a-fA-F0-9]{64}$' or pg_catalog.length(coalesce(p_note,''))>2000 or p_correlation_id is null
  then raise exception using errcode='22023',message='required verification fields missing'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('payment-verification:'||p_payment_id::text,0));
  select * into v from finance.payments where id=p_payment_id for update;
  if not found then raise exception using errcode='P0002',message='payment not found'; end if;
  if v.status='VERIFIED' then
    select je.id into v_journal_id from finance.journal_entries je where je.id=v.journal_entry_id and je.idempotency_key=p_idempotency_key and je.intent_hash=p_intent_hash;
    if found then return pg_catalog.jsonb_build_object('outcome','REPLAY','paymentId',v.id,'status',v.status,'version',v.version,'journalEntryId',v_journal_id); end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','paymentId',v.id,'status',v.status,'version',v.version);
  end if;
  if v.status<>'PENDING_VERIFICATION' then raise exception using errcode='23514',message='payment is not pending verification'; end if;
  if v.version<>p_expected_version then return pg_catalog.jsonb_build_object('outcome','CONFLICT','paymentId',v.id,'version',v.version); end if;
  if v.prepared_by=p_actor_id then raise exception using errcode='42501',message='maker checker violation'; end if;
  select fp.id into v_period_id from finance.finance_periods fp where fp.legal_entity_id=v.legal_entity_id and fp.scope_type='BRANCH' and fp.dealer_account_id=v.dealer_account_id and fp.branch_id=v.branch_id and fp.mode='LIVE' and fp.status='OPEN' and v.payment_date between fp.period_start and fp.period_end;
  if not found then raise exception using errcode='23514',message='open live finance period required'; end if;
  if exists(select 1 from finance.finance_periods fp where fp.legal_entity_id=v.legal_entity_id and fp.scope_type='BRANCH' and fp.dealer_account_id=v.dealer_account_id and fp.branch_id=v.branch_id and fp.mode='LIVE' and fp.status='OPEN' and fp.id<>v_period_id and v.payment_date between fp.period_start and fp.period_end) then raise exception using errcode='23514',message='multiple open live finance periods'; end if;
  select * into v_map from finance.payment_account_mappings pam where pam.legal_entity_id=v.legal_entity_id and pam.payment_method_code=v.payment_method_code and pam.currency_code=v.currency_code and pam.status='ACTIVE' and v.payment_date>=pam.effective_from and (pam.effective_to is null or v.payment_date<pam.effective_to);
  if not found then raise exception using errcode='23514',message='active payment account mapping required'; end if;
  if exists(select 1 from finance.payment_account_mappings pam where pam.legal_entity_id=v.legal_entity_id and pam.payment_method_code=v.payment_method_code and pam.currency_code=v.currency_code and pam.status='ACTIVE' and pam.id<>v_map.id and v.payment_date>=pam.effective_from and (pam.effective_to is null or v.payment_date<pam.effective_to)) then raise exception using errcode='23514',message='ambiguous payment account mapping'; end if;
  select * into v_clearing from finance.operational_accounts oa where oa.id=v_map.clearing_account_id and oa.legal_entity_id=v.legal_entity_id and oa.status='ACTIVE' and oa.account_type in ('ASSET','CLEARING') and (oa.currency_policy='ANY' or oa.currency_code=v.currency_code);
  if not found then raise exception using errcode='23514',message='active clearing account required'; end if;
  select * into v_receivable from finance.operational_accounts oa where oa.id=v_map.receivable_account_id and oa.legal_entity_id=v.legal_entity_id and oa.status='ACTIVE' and oa.account_type='ASSET' and (oa.currency_policy='ANY' or oa.currency_code=v.currency_code);
  if not found or v_clearing.id=v_receivable.id then raise exception using errcode='23514',message='active receivable account required'; end if;
  select count(distinct dr.external_document_id) into v_document_count from finance.document_references dr where dr.legal_entity_id=v.legal_entity_id and dr.status='ACTIVE' and dr.external_document_id=any(coalesce(p_document_ids,array[]::uuid[]));
  if v_document_count<>coalesce(pg_catalog.cardinality(p_document_ids),0) then raise exception using errcode='23514',message='active verification document evidence required'; end if;
  insert into finance.journal_entries(legal_entity_id,finance_period_id,idempotency_key,intent_hash,entry_type,business_date,posting_date,status,posted_at_utc,posted_by,created_by,correlation_id)
  values(v.legal_entity_id,v_period_id,p_idempotency_key,p_intent_hash,'PAYMENT_VERIFICATION',v.payment_date,v.payment_date,'POSTED',pg_catalog.now(),p_actor_id,p_actor_id,p_correlation_id) returning id into v_journal_id;
  insert into finance.journal_lines(journal_entry_id,line_no,dealer_account_id,account_code,branch_id,currency_code,debit_amount,credit_amount,dimensions,created_by,correlation_id)
  values(v_journal_id,1,null,v_clearing.account_code,v.branch_id,v.currency_code,v.received_amount,0,pg_catalog.jsonb_build_object('operationalAccountId',v_clearing.id,'erpAccountCode',v_clearing.erp_account_code,'paymentId',v.id),p_actor_id,p_correlation_id),
        (v_journal_id,2,v.dealer_account_id,v_receivable.account_code,v.branch_id,v.currency_code,0,v.received_amount,pg_catalog.jsonb_build_object('operationalAccountId',v_receivable.id,'erpAccountCode',v_receivable.erp_account_code,'paymentId',v.id),p_actor_id,p_correlation_id);
  if (select coalesce(sum(debit_amount),0)<>coalesce(sum(credit_amount),0) from finance.journal_lines where journal_entry_id=v_journal_id) then raise exception using errcode='23514',message='payment verification journal is not balanced'; end if;
  update finance.payments set journal_entry_id=v_journal_id,verified_amount=received_amount,status='VERIFIED',verified_by=p_actor_id,verified_at_utc=pg_catalog.now(),version=version+1,correlation_id=p_correlation_id where id=v.id and version=p_expected_version returning version into v_new_version;
  if not found then return pg_catalog.jsonb_build_object('outcome','CONFLICT','paymentId',v.id); end if;
  insert into finance.document_links(legal_entity_id,document_reference_id,subject_type,subject_id,purpose_code,created_by,correlation_id)
  select v.legal_entity_id,dr.id,'PAYMENT',v.id,'PAYMENT_VERIFICATION_EVIDENCE',p_actor_id,p_correlation_id from finance.document_references dr where dr.legal_entity_id=v.legal_entity_id and dr.status='ACTIVE' and dr.external_document_id=any(coalesce(p_document_ids,array[]::uuid[]));
  v_note_hash:=case when p_note is null then null else pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_note,'UTF8'),'sha256'),'hex') end;
  v_payload:=pg_catalog.jsonb_build_object('paymentId',v.id,'branchId',v.branch_id,'dealerAccountId',v.dealer_account_id,'status','VERIFIED','verifiedAmount',v.received_amount::text,'currency',v.currency_code,'journalEntryId',v_journal_id,'intentHash',p_intent_hash,'verificationSource',p_verification_source,'noteHash',v_note_hash);
  v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id) values(v.legal_entity_id,'finance.payment','PAYMENT_VERIFIED','payment',v.id,v_new_version,v_payload,v_payload_hash,'PENDING',p_correlation_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||v.legal_entity_id::text,0));select ae.integrity_hash into v_previous_hash from finance.audit_events ae where ae.legal_entity_id=v.legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;
  v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_hash,'GENESIS')||':'||v.id::text||':PAYMENT_VERIFIED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id) values(v.legal_entity_id,p_actor_id,'USER','PAYMENT_VERIFIED','payment',v.id,'ALLOW',p_intent_hash,v_previous_hash,v_audit_hash,pg_catalog.jsonb_build_object('branchId',v.branch_id,'journalEntryId',v_journal_id,'mappingId',v_map.id,'documentCount',v_document_count,'noteHash',v_note_hash),p_correlation_id);
  return pg_catalog.jsonb_build_object('outcome','CREATED','paymentId',v.id,'status','VERIFIED','version',v_new_version,'journalEntryId',v_journal_id);
end $$;

revoke all on function finance_api.commit_payment_verification(uuid,uuid,bigint,text,uuid[],text,text,text,uuid) from public, anon, authenticated;
revoke all on function finance_api.authorize_payment_verification(uuid,text) from public, anon;
grant execute on function finance_api.authorize_payment_verification(uuid,text) to authenticated;
-- Commit execute grant intentionally absent until reviewed server-only worker identity exists.
