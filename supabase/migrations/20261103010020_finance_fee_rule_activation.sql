-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-fee-rule-activation-rpc.sql
-- Source SHA256: CCCF4A32BA29C1F1724649D37E13115889F2E7DF3CC6470380E05DF62C8F02AD
-- Local replay required before any staging promotion.
-- OTOTR FINANCE CONTRACT FEE RULE ACTIVATION RPC CANDIDATE (TX-07)

create or replace function finance_private.current_rule_activation_worker_is_trusted()
returns boolean language sql stable security definer set search_path = ''
as $$ select false $$;
revoke all on function finance_private.current_rule_activation_worker_is_trusted() from public, anon, authenticated;

create or replace function finance_private.current_actor_can_activate_contract_version(p_actor_id uuid,p_contract_version_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select false $$;
revoke all on function finance_private.current_actor_can_activate_contract_version(uuid,uuid) from public, anon, authenticated;

create or replace function finance_api.authorize_contract_version_activation(p_contract_version_id uuid,p_permission text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select p_permission='finance.contract-versions.activate' and auth.uid() is not null
    and exists (select 1 from finance.contract_versions cv join finance.franchise_contracts fc on fc.id=cv.contract_id
      where cv.id=p_contract_version_id and fc.status='ACTIVE')
    and finance_private.current_actor_can_activate_contract_version(auth.uid(),p_contract_version_id)
$$;

create or replace function finance_api.publish_fee_rule_version(
  p_actor_id uuid,p_contract_version_id uuid,p_expected_version bigint,
  p_idempotency_key text,p_correlation_id uuid,p_reason_code text,p_note text
) returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  v record;v_rule_count integer;v_outbox record;v_outbox_id uuid;v_payload jsonb;v_payload_hash text;
  v_previous_hash text;v_audit_hash text;v_new_version bigint;v_note_hash text;
begin
  if not finance_private.current_rule_activation_worker_is_trusted() then
    raise exception using errcode='42501',message='rule activation worker denied';
  end if;
  if p_actor_id is null or p_contract_version_id is null or p_expected_version is null or p_expected_version<1
     or p_correlation_id is null or coalesce(pg_catalog.btrim(p_idempotency_key),'')=''
     or pg_catalog.length(p_idempotency_key)>200 or coalesce(pg_catalog.btrim(p_reason_code),'')=''
     or pg_catalog.length(p_reason_code)>100 or pg_catalog.length(coalesce(p_note,''))>2000 then
    raise exception using errcode='22023',message='required activation fields missing';
  end if;
  select cv.id,cv.contract_id,cv.version_no,cv.effective_from,cv.effective_to,cv.content_hash,
         cv.status,cv.prepared_by,cv.approved_by,cv.approved_at_utc,cv.version,
         fc.legal_entity_id,fc.dealer_legal_entity_id,fc.status contract_status
    into v from finance.contract_versions cv
    join finance.franchise_contracts fc on fc.id=cv.contract_id
   where cv.id=p_contract_version_id;
  if not found then raise exception using errcode='P0002',message='contract version not found'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('contract:'||v.contract_id::text,0));
  select cv.id,cv.contract_id,cv.version_no,cv.effective_from,cv.effective_to,cv.content_hash,
         cv.status,cv.prepared_by,cv.approved_by,cv.approved_at_utc,cv.version,
         fc.legal_entity_id,fc.dealer_legal_entity_id,fc.status contract_status
    into v from finance.contract_versions cv
    join finance.franchise_contracts fc on fc.id=cv.contract_id
   where cv.id=p_contract_version_id for update of cv,fc;
  if v.status='ACTIVE' then
    select om.id,om.aggregate_version,om.payload into v_outbox from finance.outbox_messages om
     where om.topic='finance.contract' and om.event_type='CONTRACT_VERSION_ACTIVATED'
       and om.aggregate_type='contract_version' and om.aggregate_id=v.id and om.aggregate_version=v.version limit 1;
    if found and v_outbox.payload->>'idempotencyKey'=p_idempotency_key then
      return pg_catalog.jsonb_build_object('outcome','REPLAY','contractVersionId',v.id,'version',v.version,'outboxMessageId',v_outbox.id);
    end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','contractVersionId',v.id,'version',v.version);
  end if;
  if v.version<>p_expected_version then return pg_catalog.jsonb_build_object('outcome','CONFLICT','contractVersionId',v.id,'version',v.version); end if;
  if v.status<>'APPROVED' or v.contract_status<>'ACTIVE' or v.approved_by is null or v.approved_at_utc is null then
    raise exception using errcode='23514',message='contract version is not approved for activation';
  end if;
  if v.prepared_by=p_actor_id or v.approved_by=v.prepared_by then
    raise exception using errcode='42501',message='maker checker violation';
  end if;
  if not exists (
    select 1 from finance.approval_requests ar
    where ar.subject_type='CONTRACT_VERSION' and ar.subject_id=v.id and ar.status='APPROVED'
      and ar.prepared_by=v.prepared_by
      and not exists (select 1 from finance.approval_steps ast where ast.approval_request_id=ar.id
        and (ast.decision is distinct from 'APPROVE' or ast.decided_by is null or ast.decided_by=ar.prepared_by or ast.evidence_ref is null))
  ) then raise exception using errcode='23514',message='complete independent approval evidence required'; end if;
  select count(*) into v_rule_count from finance.contract_fee_rules cfr where cfr.contract_version_id=v.id;
  if v_rule_count=0 then raise exception using errcode='23514',message='contract version has no fee rules'; end if;
  if exists (select 1 from finance.contract_fee_rules cfr where cfr.contract_version_id=v.id and (
      cfr.status<>'APPROVED' or cfr.configuration_status<>'CONFIGURED' or cfr.approved_by is null or cfr.approved_at_utc is null or cfr.trigger_event_type is null or cfr.trigger_conditions is null or pg_catalog.jsonb_typeof(cfr.trigger_conditions)<>'array' or cfr.basis_definition is null
      or cfr.calculation_method is null or cfr.price_includes_tax is null or cfr.tax_code_version_id is null
      or cfr.due_rule is null or cfr.currency_code is null or cfr.decimal_scale is null or cfr.rounding_mode is null
      or (cfr.minimum_amount is not null and cfr.maximum_amount is not null and cfr.minimum_amount>cfr.maximum_amount)
  )) then raise exception using errcode='23514',message='contract version contains incomplete or unapproved fee rule'; end if;
  if exists (select 1 from finance.rule_exceptions re join finance.contract_fee_rules cfr on cfr.id=re.contract_fee_rule_id
      where cfr.contract_version_id=v.id and re.status in ('APPROVED','ACTIVE')) then
    raise exception using errcode='0A000',message='rule exception precedence policy pending';
  end if;
  if exists (select 1 from finance.contract_versions other where other.contract_id=v.contract_id and other.id<>v.id
      and other.status='ACTIVE' and v.effective_from<coalesce(other.effective_to,'infinity'::date)
      and other.effective_from<coalesce(v.effective_to,'infinity'::date)) then
    raise exception using errcode='23P01',message='overlapping active contract version';
  end if;
  update finance.contract_fee_rules set status='ACTIVE',version=version+1,correlation_id=p_correlation_id where contract_version_id=v.id and status='APPROVED' and configuration_status='CONFIGURED';
  update finance.contract_versions set status='ACTIVE',version=version+1,correlation_id=p_correlation_id where id=v.id and version=p_expected_version returning version into v_new_version;
  if not found then return pg_catalog.jsonb_build_object('outcome','CONFLICT','contractVersionId',v.id); end if;
  v_note_hash:=case when p_note is null then null else pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_note,'UTF8'),'sha256'),'hex') end;
  v_payload:=pg_catalog.jsonb_build_object('contractVersionId',v.id,'contractId',v.contract_id,'dealerLegalEntityId',v.dealer_legal_entity_id,'effectiveFrom',v.effective_from,'effectiveTo',v.effective_to,'contentHash',v.content_hash,'idempotencyKey',p_idempotency_key,'reasonCode',p_reason_code,'noteHash',v_note_hash);
  v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)
  values(v.legal_entity_id,'finance.contract','CONTRACT_VERSION_ACTIVATED','contract_version',v.id,v_new_version,v_payload,v_payload_hash,'PENDING',p_correlation_id)
  returning id into v_outbox_id;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||v.legal_entity_id::text,0));
  select ae.integrity_hash into v_previous_hash from finance.audit_events ae where ae.legal_entity_id=v.legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;
  v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_hash,'GENESIS')||':'||v.id::text||':CONTRACT_VERSION_ACTIVATED:'||v.content_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)
  values(v.legal_entity_id,p_actor_id,'USER','CONTRACT_VERSION_ACTIVATED','contract_version',v.id,'ALLOW',p_reason_code,v.content_hash,v.content_hash,v_previous_hash,v_audit_hash,pg_catalog.jsonb_build_object('contractId',v.contract_id,'versionNo',v.version_no,'effectiveFrom',v.effective_from,'effectiveTo',v.effective_to,'noteHash',v_note_hash),p_correlation_id);
  return pg_catalog.jsonb_build_object('outcome','CREATED','contractVersionId',v.id,'version',v_new_version,'outboxMessageId',v_outbox_id,'contentHash',v.content_hash);
end $$;

revoke all on function finance_api.publish_fee_rule_version(uuid,uuid,bigint,text,uuid,text,text) from public, anon, authenticated;
revoke all on function finance_api.authorize_contract_version_activation(uuid,text) from public, anon;
grant execute on function finance_api.authorize_contract_version_activation(uuid,text) to authenticated;
-- Execute grant intentionally absent until the reviewed server-only role and permission adapter exist.
