\set ON_ERROR_STOP on

begin;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000031';

create or replace function finance_private.current_dispute_create_committer_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_dispute_submit_committer_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_dispute_decision_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select true$$;
create or replace function finance_private.current_dispute_evidence_request_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select true$$;
create or replace function finance_private.current_actor_can_read_scope(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path=pg_catalog as $$select p_operation_id in('listDisputes','getDispute','getAccrualDetail')$$;

do $test$
declare
  maker constant uuid := '00000000-0000-4000-8000-000000000031';
  checker constant uuid := '00000000-0000-4000-8000-000000000032';
  hq constant uuid := '13000000-0000-4000-8000-000000000001';
  dealer constant uuid := '23000000-0000-4000-8000-000000000001';
  branch constant uuid := '33000000-0000-4000-8000-000000000001';
  account constant uuid := '43000000-0000-4000-8000-000000000001';
  fee constant uuid := '53000000-0000-4000-8000-000000000001';
  period_id constant uuid := '73000000-0000-4000-8000-000000000001';
  expense_id constant uuid := '63000000-0000-4000-8000-000000000001';
  original_journal constant uuid := '83000000-0000-4000-8000-000000000001';
  original_accrual constant uuid := '83000000-0000-4000-8000-000000000002';
  original_open constant uuid := '83000000-0000-4000-8000-000000000003';
  document_id constant uuid := '83000000-0000-4000-8000-000000000004';
  external_document_id constant uuid := '83000000-0000-4000-8000-000000000005';
  corr constant uuid := '93000000-0000-4000-8000-000000000001';
  result jsonb; replay jsonb; dispute_id uuid; version_no bigint; correction_journal uuid; dispute_list jsonb; dispute_detail jsonb;evidence_requests jsonb;
  credit_count integer; credit_total numeric(24,8); correction_accrual uuid;
begin
  insert into public.app_users(id,auth_user_id,branch_id,full_name,role,is_active) values
    (maker,maker,null,'Sentetik Finans Maker','FINANCE',true),
    (checker,checker,null,'Sentetik Finans Checker','FINANCE',true);
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OTOTR-HQ-DISPUTE-DEMO','OTOTR Sentetik Düzeltme Merkezi','ACTIVE',maker,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
  values(dealer,hq,'DISPUTE-DEALER','Sentetik Düzeltme Bayisi','ACTIVE',maker,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
  values(branch,hq,dealer,'DISPUTE-BRANCH','ACTIVE',maker,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
  values(account,hq,dealer,'DISPUTE-ACCOUNT','TRY','ACTIVE',maker,corr);
  insert into finance.fee_definitions(id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id)
  values(fee,hq,'SYNTHETIC-ADJUSTMENT',1,'ADJUSTMENT','Sentetik Düzeltme','PUBLISHED',maker,corr);
  insert into finance.finance_periods(id,legal_entity_id,scope_type,period_start,period_end,currency_code,mode,status,created_by,correlation_id)
  values(period_id,hq,'HEADQUARTERS',date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',maker,corr);
  insert into finance.pass_through_expenses(
    id,legal_entity_id,fee_definition_id,supplier_reference,supplier_reference_normalized,
    contractual_basis_reference,expense_date,currency_code,source_net_amount,source_tax_amount,source_amount,
    distributable_net_amount,distributable_tax_amount,distributable_amount,allocation_policy,
    evidence_object_key,evidence_hash,idempotency_key,input_hash,status,prepared_by,approved_by,
    created_by,correlation_id
  ) values(
    expense_id,hq,fee,'SYNTHETIC-ORIGINAL','SYNTHETIC-ORIGINAL','SYNTHETIC-BASIS',date '2026-11-02','TRY',
    120,20,140,120,20,140,'{"method":"SYNTHETIC"}'::jsonb,'synthetic/original.json',repeat('a',64),
    'synthetic-original',repeat('b',64),'APPROVED',maker,checker,maker,corr
  );
  insert into finance.journal_entries(
    id,legal_entity_id,finance_period_id,idempotency_key,intent_hash,entry_type,business_date,posting_date,
    status,posted_at_utc,posted_by,created_by,correlation_id
  ) values(
    original_journal,hq,period_id,'synthetic-original-journal',repeat('c',64),'ACCRUAL',date '2026-11-02',
    date '2026-11-02','POSTED',now(),checker,maker,corr
  );
  insert into finance.journal_lines(
    journal_entry_id,line_no,dealer_account_id,account_code,branch_id,currency_code,debit_amount,credit_amount,
    created_by,correlation_id
  ) values
    (original_journal,1,account,'120.BAYI',branch,'TRY',140,0,maker,corr),
    (original_journal,2,account,'600.GELIR',branch,'TRY',0,120,maker,corr),
    (original_journal,3,account,'391.KDV',branch,'TRY',0,20,maker,corr);
  insert into finance.accruals(
    id,legal_entity_id,pass_through_expense_id,dealer_account_id,branch_id,journal_entry_id,sequence_no,
    fee_definition_id,currency_code,net_amount,tax_amount,gross_amount,status,created_by,correlation_id
  ) values(original_accrual,hq,expense_id,account,branch,original_journal,1,fee,'TRY',120,20,140,'POSTED',maker,corr);
  insert into finance.open_items(
    id,legal_entity_id,accrual_id,dealer_account_id,branch_id,due_date,currency_code,item_type,
    original_amount,allocated_amount,open_amount,status,created_by,correlation_id
  ) values(original_open,hq,original_accrual,account,branch,date '2026-11-15','TRY','DEBIT',140,0,140,'OPEN',maker,corr);
  result:=finance_api.authorize_dispute_create(account,'OPEN_ITEM',original_open,'finance.disputes.create');
  if not coalesce((result->>'allowed')::boolean,false) or (result->>'legalEntityId')::uuid<>hq or (result->>'dealerAccountId')::uuid<>account or (result->>'branchId')::uuid<>branch then raise exception 'dispute identity scope authorization failed: %',result;end if;
  insert into finance.document_references(
    id,legal_entity_id,external_document_id,document_type,storage_provider,object_key,content_hash,status,created_by,correlation_id
  ) values(document_id,hq,external_document_id,'DISPUTE_EVIDENCE','LOCAL_TEST','synthetic/dispute/evidence.pdf',repeat('d',64),'ACTIVE',maker,corr);

  result:=finance_api.commit_dispute_create(
    maker,hq,account,branch,'OPEN_ITEM',original_open,100,'TRY','SERVICE_QUALITY',repeat('e',64),
    array[external_document_id],'dispute-create-demo',repeat('f',64),corr
  );
  if result->>'outcome'<>'CREATED' then raise exception 'dispute create failed: %',result; end if;
  dispute_id:=(result->>'disputeId')::uuid; version_no:=(result->>'version')::bigint;

  result:=finance_api.commit_dispute_submit(
    maker,dispute_id,version_no,'READY_FOR_REVIEW',repeat('1',64),'dispute-submit-demo',repeat('2',64),corr
  );
  if result->>'outcome'<>'SUBMITTED' then raise exception 'dispute submit failed: %',result; end if;
  version_no:=(result->>'version')::bigint;

  result:=finance_api.commit_dispute_evidence_request(maker,dispute_id,'SERVICE_PROOF',repeat('6',64),'dispute-evidence-request-demo',repeat('7',64),corr);
  if result->>'outcome'<>'CREATED' or result->>'status'<>'OPEN' then raise exception 'evidence request failed: %',result;end if;
  evidence_requests:=finance_api.list_dispute_evidence_requests(hq,account,branch,dispute_id);
  if jsonb_array_length(evidence_requests->'items')<>1 or evidence_requests#>>'{items,0,requestType}'<>'SERVICE_PROOF' or evidence_requests#>>'{items,0,status}'<>'OPEN' then raise exception 'evidence request read mismatch: %',evidence_requests;end if;
  replay:=finance_api.commit_dispute_evidence_request(maker,dispute_id,'SERVICE_PROOF',repeat('6',64),'dispute-evidence-request-demo',repeat('7',64),corr);
  if replay->>'outcome'<>'REPLAY' then raise exception 'evidence request replay failed: %',replay;end if;

  result:=finance_api.commit_dispute_review_decision(
    checker,dispute_id,'PARTIALLY_ACCEPTED',70,date '2026-11-06',version_no,'PARTIAL_SUPPORT',repeat('4',64),
    'dispute-decision-demo',repeat('5',64),corr
  );
  if result->>'outcome'<>'COMMITTED' or result->>'status'<>'PARTIALLY_ACCEPTED' then
    raise exception 'dispute decision failed: %',result;
  end if;
  correction_journal:=(result#>>'{correctionResourceIds,0}')::uuid;
  correction_accrual:=(result#>>'{correctionResourceIds,1}')::uuid;

  select count(*),sum(original_amount) into credit_count,credit_total
    from finance.open_items where accrual_id=correction_accrual and item_type='CREDIT';
  if credit_count<>1 or credit_total<>70 then raise exception 'credit correction mismatch'; end if;
  if not exists(
    select 1 from finance.accruals where id=correction_accrual and reversal_of_id=original_accrual
      and net_amount=-60 and tax_amount=-10 and gross_amount=-70
  ) then raise exception 'correction accrual provenance or breakdown mismatch'; end if;
  if (select sum(debit_amount) from finance.journal_lines where journal_entry_id=correction_journal)<>
     (select sum(credit_amount) from finance.journal_lines where journal_entry_id=correction_journal) then
    raise exception 'correction journal is not balanced';
  end if;
  if (select prepared_by from finance.approval_requests where subject_id=dispute_id)=checker then
    raise exception 'maker-checker invariant failed';
  end if;

  replay:=finance_api.commit_dispute_review_decision(
    checker,dispute_id,'PARTIALLY_ACCEPTED',70,date '2026-11-06',version_no,'PARTIAL_SUPPORT',repeat('4',64),
    'dispute-decision-demo',repeat('5',64),corr
  );
  if replay->>'outcome'<>'REPLAY' then raise exception 'dispute decision replay failed: %',replay; end if;
  if (select count(*) from finance.accruals where reversal_of_id=original_accrual)<>1 then
    raise exception 'replay created duplicate correction';
  end if;

  dispute_list:=finance_api.list_disputes(hq,account,branch,'PARTIALLY_ACCEPTED',null,25);
  if pg_catalog.jsonb_array_length(dispute_list->'items')<>1
     or dispute_list#>>'{items,0,disputeId}'<>dispute_id::text
     or dispute_list#>>'{items,0,acceptedAmount}'<>'70.00000000'
     or dispute_list#>>'{items,0,documentCount}'<>'1' then
    raise exception 'dispute list projection mismatch: %',dispute_list;
  end if;
  dispute_detail:=finance_api.get_dispute(hq,account,branch,dispute_id);
  if dispute_detail->>'caseNo' not like 'DSP-%'
     or dispute_detail#>>'{amounts,disputedAmount}'<>'100.00000000'
     or dispute_detail#>>'{amounts,acceptedAmount}'<>'70.00000000'
     or pg_catalog.jsonb_array_length(dispute_detail->'documents')<>1
     or dispute_detail#>>'{approval,status}'<>'APPROVED'
     or dispute_detail#>>'{correctionJournal,journalEntryId}'<>correction_journal::text then
    raise exception 'dispute detail projection mismatch: %',dispute_detail;
  end if;

  raise notice 'DISPUTE CREDIT ADJUSTMENT E2E PASSED: scoped list/detail; 100 TRY disputed -> 70 TRY partially accepted -> 70 TRY credit';
end
$test$;

rollback;
