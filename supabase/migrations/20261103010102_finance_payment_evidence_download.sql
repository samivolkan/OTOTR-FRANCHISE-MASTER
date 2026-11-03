-- Authorized private evidence locator for short-lived Storage signed URLs.

create or replace function finance_api.get_payment(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_payment_id uuid
) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare v_result jsonb;v_allocations jsonb;v_open_items jsonb;v_documents jsonb;
begin
  v_result:=finance_api.get_payment_base(p_legal_entity_id,p_dealer_account_id,p_branch_id,p_payment_id);if v_result is null then return null;end if;
  select coalesce(jsonb_agg(item||jsonb_build_object('allocationVersion',pa.version,'openItemVersion',oi.version) order by item->>'allocationId'),'[]'::jsonb) into v_allocations from jsonb_array_elements(v_result->'allocations') item join finance.payment_allocations pa on pa.id=(item->>'allocationId')::uuid join finance.open_items oi on oi.id=pa.open_item_id;
  select coalesce(jsonb_agg(jsonb_build_object('openItemId',oi.id,'version',oi.version,'dueDate',oi.due_date,'status',oi.status,'feeCode',fd.code,'feeName',fd.name,'originalAmount',jsonb_build_object('amount',oi.original_amount::text,'currency',oi.currency_code),'openAmount',jsonb_build_object('amount',oi.open_amount::text,'currency',oi.currency_code)) order by oi.due_date,oi.id),'[]'::jsonb) into v_open_items from finance.open_items oi left join finance.accruals a on a.id=oi.accrual_id left join finance.fee_definitions fd on fd.id=a.fee_definition_id where oi.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id and oi.branch_id=p_branch_id and oi.item_type='DEBIT' and oi.status in('OPEN','PARTIALLY_ALLOCATED') and oi.open_amount>0 and oi.currency_code=v_result#>>'{payment,amount,currency}';
  select coalesce(jsonb_agg(jsonb_build_object('documentId',dr.external_document_id,'documentType',dr.document_type,'contentHash',dr.content_hash,'purposeCode',dl.purpose_code) order by dr.external_document_id),'[]'::jsonb) into v_documents from finance.document_links dl join finance.document_references dr on dr.id=dl.document_reference_id where dl.legal_entity_id=p_legal_entity_id and dl.subject_type='PAYMENT' and dl.subject_id=p_payment_id and dl.purpose_code in('PAYMENT_EVIDENCE','PAYMENT_VERIFICATION_EVIDENCE') and dr.legal_entity_id=p_legal_entity_id and dr.status='ACTIVE';
  return jsonb_set(v_result||jsonb_build_object('allocations',v_allocations,'allocatableOpenItems',v_open_items),'{payment,documents}',v_documents,true);
end$$;

create or replace function finance_api.get_payment_evidence_locator(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_payment_id uuid,p_external_document_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare r record;v_key text;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getPayment') then raise exception using errcode='42501',message='finance scope denied';end if;
  select dr.object_key,dr.document_type,dr.content_hash into r
  from finance.payments p
  join finance.document_links dl on dl.legal_entity_id=p.legal_entity_id and dl.subject_type='PAYMENT' and dl.subject_id=p.id
  join finance.document_references dr on dr.id=dl.document_reference_id and dr.legal_entity_id=p.legal_entity_id and dr.status='ACTIVE'
  where p.id=p_payment_id and p.legal_entity_id=p_legal_entity_id and p.dealer_account_id=p_dealer_account_id and p.branch_id=p_branch_id
    and dr.external_document_id=p_external_document_id and dr.storage_provider='SUPABASE_STORAGE';
  if not found then return null;end if;
  if position('ototr-evidence/' in r.object_key)<>1 then raise exception using errcode='23514',message='invalid evidence storage reference';end if;
  v_key:=substr(r.object_key,length('ototr-evidence/')+1);
  if position('finance-payments/'||p_legal_entity_id::text||'/'||p_dealer_account_id::text||'/'||p_branch_id::text||'/' in v_key)<>1 then raise exception using errcode='42501',message='evidence object scope mismatch';end if;
  return jsonb_build_object('bucketId','ototr-evidence','objectKey',v_key,'documentType',r.document_type,'contentHash',r.content_hash,'expiresIn',120);
end$$;

revoke all on function finance_api.get_payment_evidence_locator(uuid,uuid,uuid,uuid,uuid) from public,anon;
grant execute on function finance_api.get_payment_evidence_locator(uuid,uuid,uuid,uuid,uuid) to authenticated;
