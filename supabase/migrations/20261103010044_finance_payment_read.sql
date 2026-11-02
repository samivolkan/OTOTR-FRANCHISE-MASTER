-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-payment-read-rpc.sql
-- Source SHA256: 9A465CD5D186F638507CBA548820C00089DEC2B50B50CEDF6984079B640F7170
-- Local replay required before any staging promotion.
-- OTOTR PAYMENT READ RPC CANDIDATE

create or replace function finance_api.get_payment(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_payment_id uuid
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api
as $$
declare
  v record;
  v_documents jsonb;
  v_allocations jsonb;
  v_allocation_gap integer;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getPayment') then
    raise exception using errcode='42501',message='finance scope denied';
  end if;

  select p.*,da.dealer_legal_entity_id
    into v
    from finance.payments p
    join finance.dealer_accounts da on da.id=p.dealer_account_id
   where p.id=p_payment_id and p.legal_entity_id=p_legal_entity_id
     and p.dealer_account_id=p_dealer_account_id and p.branch_id=p_branch_id
     and da.legal_entity_id=p_legal_entity_id;
  if not found then return null; end if;

  select coalesce(pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
             'documentId',dr.external_document_id,
             'documentType',dr.document_type,
             'contentHash',dr.content_hash
           ) order by dr.external_document_id
         ),'[]'::jsonb)
    into v_documents
    from finance.document_links dl
    join finance.document_references dr on dr.id=dl.document_reference_id
   where dl.legal_entity_id=p_legal_entity_id and dl.subject_type='PAYMENT'
     and dl.subject_id=v.id and dl.purpose_code='PAYMENT_EVIDENCE'
     and dr.legal_entity_id=p_legal_entity_id and dr.status='ACTIVE';

  with allocation_context as (
    select pa.*,
           child.reversal_allocation_id,child.reversal_count,
           creation.payload->>'allocationMethod' allocation_method,
           reversal.payload->>'reasonCode' reversal_reason_code,
           reversal_audit.actor_id reversed_by,
           reversal_audit.created_at_utc reversed_at_utc
      from finance.payment_allocations pa
      left join lateral (
        select (pg_catalog.array_agg(c.id order by c.created_at_utc,c.id))[1] reversal_allocation_id,
               pg_catalog.count(*) reversal_count
          from finance.payment_allocations c where c.reversal_of_id=pa.id
      ) child on true
      left join lateral (
        select om.payload
          from finance.outbox_messages om
         where om.legal_entity_id=p_legal_entity_id and om.aggregate_type='payment'
           and om.aggregate_id=v.id and om.event_type='PAYMENT_ALLOCATED'
           and exists(
             select 1 from pg_catalog.jsonb_array_elements(om.payload->'allocations') item
              where item->>'id'=coalesce(pa.reversal_of_id,pa.id)::text
           )
         order by om.created_at_utc desc,om.id desc limit 1
      ) creation on true
      left join lateral (
        select om.payload
          from finance.outbox_messages om
         where om.legal_entity_id=p_legal_entity_id and om.aggregate_type='payment_allocation'
           and om.aggregate_id=coalesce(pa.reversal_of_id,pa.id)
           and om.event_type='PAYMENT_ALLOCATION_REVERSED'
         order by om.created_at_utc desc,om.id desc limit 1
      ) reversal on pa.status='REVERSED'
      left join lateral (
        select ae.actor_id,ae.created_at_utc
          from finance.audit_events ae
         where ae.legal_entity_id=p_legal_entity_id and ae.subject_type='payment_allocation'
           and ae.subject_id=coalesce(pa.reversal_of_id,pa.id)
           and ae.action_code='PAYMENT_ALLOCATION_REVERSED' and ae.decision='ALLOW'
         order by ae.created_at_utc desc,ae.id desc limit 1
      ) reversal_audit on pa.status='REVERSED'
     where pa.payment_id=v.id
  )
  select coalesce(pg_catalog.jsonb_agg(
           pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
             'allocationId',id,
             'status',status,
             'paymentId',payment_id,
             'openItemId',open_item_id,
             'amount',pg_catalog.jsonb_build_object('amount',amount::text,'currency',currency_code),
             'allocationMethod',allocation_method,
             'allocatedBy',pg_catalog.jsonb_build_object('actorType','USER','actorId',created_by::text),
             'allocatedAtUtc',created_at_utc,
             'trace',pg_catalog.jsonb_build_object('correlationId',correlation_id::text),
             'reversalOfAllocationId',reversal_of_id,
             'reversalAllocationId',reversal_allocation_id,
             'reversalReasonCode',reversal_reason_code,
             'reversedBy',case when reversed_by is null then null else pg_catalog.jsonb_build_object('actorType','USER','actorId',reversed_by::text) end,
             'reversedAtUtc',reversed_at_utc
           )) order by allocation_sequence,id
         ),'[]'::jsonb),
         pg_catalog.count(*) filter(where allocation_method is null or reversal_count>1 or (status='REVERSED' and (reversal_reason_code is null or reversed_by is null or reversed_at_utc is null)))
    into v_allocations,v_allocation_gap
    from allocation_context;

  if v_allocation_gap<>0 then
    raise exception using errcode='23514',message='payment allocation provenance incomplete';
  end if;

  return pg_catalog.jsonb_build_object(
    'payment',pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
      'paymentId',v.id,
      'status',v.status,
      'scope',pg_catalog.jsonb_build_object(
        'headquartersLegalEntityId',p_legal_entity_id,
        'dealerLegalEntityId',v.dealer_legal_entity_id,
        'branchId',p_branch_id
      ),
      'dealerAccountId',v.dealer_account_id,
      'paymentDate',v.payment_date,
      'valueDate',v.value_date,
      'amount',pg_catalog.jsonb_build_object('amount',v.received_amount::text,'currency',v.currency_code),
      'paymentMethodCode',v.payment_method_code,
      'externalReference',v.external_reference,
      'trace',pg_catalog.jsonb_build_object('correlationId',v.correlation_id::text,'idempotencyKey',v.idempotency_key),
      'documents',v_documents,
      'createdBy',pg_catalog.jsonb_build_object('actorType','USER','actorId',v.created_by::text),
      'createdAtUtc',v.created_at_utc,
      'verifiedBy',case when v.verified_by is null then null else pg_catalog.jsonb_build_object('actorType','USER','actorId',v.verified_by::text) end,
      'verifiedAtUtc',v.verified_at_utc,
      'journalEntryId',v.journal_entry_id
    )),
    'allocations',v_allocations,
    'unallocatedAmount',pg_catalog.jsonb_build_object(
      'amount',(v.verified_amount-v.allocated_amount)::text,
      'currency',v.currency_code
    ),
    'version',v.version
  );
end $$;

revoke all on function finance_api.get_payment(uuid,uuid,uuid,uuid) from public, anon;

