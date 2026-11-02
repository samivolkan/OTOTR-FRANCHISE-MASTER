-- OTOTR Finance internal review migration.
-- Branch-scoped dispute queue and evidence/provenance detail.

create or replace function finance_api.list_disputes(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_status text,p_cursor text,p_limit integer
) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare v_limit integer:=least(greatest(coalesce(p_limit,50),1),200);v_cursor_text text;v_cursor_at timestamptz;v_cursor_id uuid;v_items jsonb;v_has_more boolean;v_next text;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listDisputes') then raise exception using errcode='42501',message='finance scope denied';end if;
  if p_status is not null and p_status not in('DRAFT','SUBMITTED','UNDER_REVIEW','ACCEPTED','PARTIALLY_ACCEPTED','REJECTED','CLOSED') then raise exception using errcode='22023',message='invalid dispute status';end if;
  if p_cursor is not null then begin v_cursor_text:=pg_catalog.convert_from(pg_catalog.decode(p_cursor,'base64'),'UTF8');v_cursor_at:=pg_catalog.split_part(v_cursor_text,'|',1)::timestamptz;v_cursor_id:=pg_catalog.split_part(v_cursor_text,'|',2)::uuid;exception when others then raise exception using errcode='22023',message='invalid dispute cursor';end;end if;
  with scoped as(
    select d.*,oi.accrual_id,oi.currency_code,oi.original_amount,oi.open_amount,a.fee_definition_id,fd.code fee_code,fd.name fee_name,
      (select count(*) from finance.document_links dl where dl.legal_entity_id=d.legal_entity_id and dl.subject_type='DISPUTE' and dl.subject_id=d.id) document_count
    from finance.disputes d join finance.open_items oi on oi.id=d.open_item_id join finance.accruals a on a.id=oi.accrual_id join finance.fee_definitions fd on fd.id=a.fee_definition_id
    where d.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id and oi.branch_id=p_branch_id and(p_status is null or d.status=p_status)and(v_cursor_at is null or(d.created_at_utc,d.id)<(v_cursor_at,v_cursor_id))
  ),page as(select * from scoped order by created_at_utc desc,id desc limit v_limit+1),visible as(select * from page order by created_at_utc desc,id desc limit v_limit),projected as(
    select id,created_at_utc,pg_catalog.jsonb_build_object('disputeId',id,'caseNo',case_no,'openItemId',open_item_id,'accrualId',accrual_id,'feeCode',fee_code,'feeName',fee_name,'reasonCode',reason_code,'disputedAmount',disputed_amount::text,'acceptedAmount',accepted_amount::text,'currency',currency_code,'status',status,'documentCount',document_count,'createdAtUtc',created_at_utc,'decidedAtUtc',decided_at_utc,'version',version) item from visible
  ) select coalesce(pg_catalog.jsonb_agg(item order by created_at_utc desc,id desc),'[]'::jsonb),(select count(*)>v_limit from page),case when(select count(*)>v_limit from page)then(select pg_catalog.encode(pg_catalog.convert_to(created_at_utc::text||'|'||id::text,'UTF8'),'base64')from visible order by created_at_utc,id limit 1)else null end into v_items,v_has_more,v_next from projected;
  return pg_catalog.jsonb_build_object('items',v_items,'nextCursor',v_next,'hasMore',v_has_more);
end$$;

create or replace function finance_api.get_dispute(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_dispute_id uuid
) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare d finance.disputes%rowtype;v_open finance.open_items%rowtype;v_accrual finance.accruals%rowtype;v_documents jsonb;v_approval jsonb;v_correction jsonb;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDispute') then raise exception using errcode='42501',message='finance scope denied';end if;
  select x.* into d from finance.disputes x join finance.open_items oi on oi.id=x.open_item_id where x.id=p_dispute_id and x.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id and oi.branch_id=p_branch_id;if not found then return null;end if;
  select * into v_open from finance.open_items where id=d.open_item_id;select * into v_accrual from finance.accruals where id=v_open.accrual_id;
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('documentId',dr.id,'externalDocumentId',dr.external_document_id,'documentType',dr.document_type,'objectKey',dr.object_key,'contentHash',dr.content_hash)order by dr.created_at_utc),'[]'::jsonb) into v_documents from finance.document_links dl join finance.document_references dr on dr.id=dl.document_reference_id where dl.legal_entity_id=d.legal_entity_id and dl.subject_type='DISPUTE' and dl.subject_id=d.id and dr.status='ACTIVE';
  select pg_catalog.jsonb_build_object('requestId',ar.id,'status',ar.status,'policyVersion',ar.approval_policy_version,'preparedBy',ar.prepared_by,'steps',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('stepNo',s.step_no,'requiredRole',s.required_role,'decision',s.decision,'decidedBy',s.decided_by,'decidedAtUtc',s.decided_at_utc,'evidenceRef',s.evidence_ref)order by s.step_no)from finance.approval_steps s where s.approval_request_id=ar.id),'[]'::jsonb)) into v_approval from finance.approval_requests ar where ar.legal_entity_id=d.legal_entity_id and ar.subject_type='DISPUTE_DECISION' and ar.subject_id=d.id order by ar.created_at_utc desc,ar.id desc limit 1;
  select pg_catalog.jsonb_build_object('journalEntryId',je.id,'entryType',je.entry_type,'postingDate',je.posting_date,'financePeriodId',je.finance_period_id,'status',je.status) into v_correction from finance.journal_entries je where je.id=d.decision_journal_entry_id;
  return pg_catalog.jsonb_build_object('disputeId',d.id,'caseNo',d.case_no,'status',d.status,'reasonCode',d.reason_code,'amounts',pg_catalog.jsonb_build_object('disputedAmount',d.disputed_amount::text,'acceptedAmount',d.accepted_amount::text,'currency',v_open.currency_code),'target',pg_catalog.jsonb_build_object('openItemId',v_open.id,'accrualId',v_accrual.id,'feeDefinitionId',v_accrual.fee_definition_id,'originalAmount',v_open.original_amount::text,'openAmount',v_open.open_amount::text),'evidence',d.evidence_refs,'documents',v_documents,'approval',v_approval,'decision',pg_catalog.jsonb_build_object('reasonCode',d.decision_reason_code,'noteHash',d.decision_note_hash,'decidedBy',d.decided_by,'decidedAtUtc',d.decided_at_utc),'correctionJournal',v_correction,'createdAtUtc',d.created_at_utc,'createdBy',d.created_by,'correlationId',d.correlation_id,'version',d.version);
end$$;

revoke all on function finance_api.list_disputes(uuid,uuid,uuid,text,text,integer) from public,anon;
revoke all on function finance_api.get_dispute(uuid,uuid,uuid,uuid) from public,anon;
grant execute on function finance_api.list_disputes(uuid,uuid,uuid,text,text,integer) to authenticated;
grant execute on function finance_api.get_dispute(uuid,uuid,uuid,uuid) to authenticated;
