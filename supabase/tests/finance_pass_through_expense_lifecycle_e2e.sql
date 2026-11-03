\set ON_ERROR_STOP on

begin;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000012';

-- Test-only ports. Every override and row is rolled back at the end.
create or replace function finance_private.current_pass_through_expense_create_committer_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_expense_share_calculator_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_expense_approval_committer_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_expense_posting_worker_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_expense_reversal_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select true$$;
create or replace function finance_private.current_actor_can_reverse_expense(p_actor_id uuid,p_expense_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog as $$select true$$;
create or replace function finance_private.current_actor_can_read_headquarters(p_actor_id uuid,p_legal_entity_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path=pg_catalog as $$select p_operation_id in('listPassThroughExpenses','getPassThroughExpense')$$;
create or replace function finance_private.current_actor_can_upload_expense_evidence(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog as $$select true$$;

create or replace function finance_private.resolve_approved_expense_allocation_context(
  p_expense_id uuid,p_distribution_method text,p_distribution_rule_reference text
) returns jsonb language sql stable security definer set search_path=pg_catalog,finance as $$
  select pg_catalog.jsonb_build_object(
    'allowed',true,'distributionMethod',p_distribution_method,
    'distributionRuleReference',p_distribution_rule_reference,'policyVersion','SYNTHETIC-EQUAL-V1',
    'targets',pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'basisValue','1.00000000','branchId',s->>'branchId','dealerAccountId',s->>'dealerAccountId'
      ) order by s->>'branchId'
    )
  )
  from finance.pass_through_expenses e,
       lateral pg_catalog.jsonb_array_elements(e.allocation_policy->'targetScopes') s
  where e.id=p_expense_id
$$;

create or replace function finance_private.resolve_expense_financial_snapshot_context(p_expense_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
  select '{"taxMappingVersion":"SYNTHETIC-TAX-V1","accountingMappingVersion":"SYNTHETIC-ACCOUNT-V1","dueRuleVersion":"SYNTHETIC-DUE-V1","dueData":{"days":7}}'::jsonb
$$;

create or replace function finance_private.resolve_expense_posting_context(p_expense_id uuid,p_posting_date date)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance as $$
  select pg_catalog.jsonb_build_object(
    'approvedShareSetHash',pg_catalog.encode(extensions.digest(pg_catalog.convert_to(
      pg_catalog.string_agg(s.id::text||':'||s.snapshot_hash||':'||s.net_amount::text||':'||s.tax_amount::text||':'||s.share_amount::text,'|' order by s.allocation_order,s.id),
      'UTF8'),'sha256'),'hex'),
    'financePeriodId',fp.id
  )
  from finance.pass_through_expenses e
  join finance.expense_shares s on s.pass_through_expense_id=e.id
  join finance.finance_periods fp on fp.legal_entity_id=e.legal_entity_id and fp.scope_type='HEADQUARTERS'
    and fp.mode='LIVE' and fp.status='OPEN' and p_posting_date between fp.period_start and fp.period_end
  where e.id=p_expense_id
  group by fp.id
$$;

create or replace function finance_private.resolve_expense_share_posting_context(
  p_expense_id uuid,p_expense_share_id uuid,p_posting_date date
) returns jsonb language sql stable security definer set search_path=pg_catalog,finance as $$
  select pg_catalog.jsonb_build_object(
    'feeDefinitionId',e.fee_definition_id,'receivableAccountCode','120.MASRAF',
    'netCreditAccountCode','649.MASRAF','taxCreditAccountCode','391.KDV',
    'dueDate',(p_posting_date+7)::text,'scopeValid',true
  )
  from finance.pass_through_expenses e
  join finance.expense_shares s on s.pass_through_expense_id=e.id
  where e.id=p_expense_id and s.id=p_expense_share_id
$$;

create or replace function finance_private.resolve_expense_reversal_context(p_expense_id uuid,p_reversal_date date)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance as $$
  select pg_catalog.jsonb_build_object('scopeValid',true,'financePeriodId',fp.id)
  from finance.pass_through_expenses e
  join finance.finance_periods fp on fp.legal_entity_id=e.legal_entity_id and fp.scope_type='HEADQUARTERS'
    and fp.mode='LIVE' and fp.status='OPEN' and p_reversal_date between fp.period_start and fp.period_end
  where e.id=p_expense_id
  limit 1
$$;

do $test$
declare
  maker constant uuid := '00000000-0000-4000-8000-000000000011';
  checker constant uuid := '00000000-0000-4000-8000-000000000012';
  hq constant uuid := '11000000-0000-4000-8000-000000000001';
  dealer_a constant uuid := '21000000-0000-4000-8000-000000000001';
  dealer_b constant uuid := '21000000-0000-4000-8000-000000000002';
  branch_a constant uuid := '31000000-0000-4000-8000-000000000001';
  branch_b constant uuid := '31000000-0000-4000-8000-000000000002';
  account_a constant uuid := '41000000-0000-4000-8000-000000000001';
  account_b constant uuid := '41000000-0000-4000-8000-000000000002';
  fee constant uuid := '51000000-0000-4000-8000-000000000011';
  period_id constant uuid := '71000000-0000-4000-8000-000000000011';
  document_id constant uuid := '81000000-0000-4000-8000-000000000011';
  external_document_id constant uuid := '82000000-0000-4000-8000-000000000011';
  uploaded_external_id constant uuid := '82000000-0000-4000-8000-000000000012';
  uploaded_object_key constant text := 'finance-expenses/11000000-0000-4000-8000-000000000001/41000000-0000-4000-8000-000000000001/31000000-0000-4000-8000-000000000001/82000000-0000-4000-8000-000000000012.pdf';
  corr constant uuid := '91000000-0000-4000-8000-000000000011';
  result jsonb; expense_id uuid; version_no bigint; original_journal uuid; reversal_journal uuid; expense_page jsonb; expense_detail jsonb;
  amount numeric(24,8); item_count integer;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OTOTR-HQ-EXPENSE-DEMO','OTOTR Sentetik Masraf Merkezi','ACTIVE',maker,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
  values(dealer_a,hq,'EXP-A','Sentetik Bayi A','ACTIVE',maker,corr),(dealer_b,hq,'EXP-B','Sentetik Bayi B','ACTIVE',maker,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
  values(branch_a,hq,dealer_a,'EXP-BR-A','ACTIVE',maker,corr),(branch_b,hq,dealer_b,'EXP-BR-B','ACTIVE',maker,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
  values(account_a,hq,dealer_a,'EXP-ACC-A','TRY','ACTIVE',maker,corr),(account_b,hq,dealer_b,'EXP-ACC-B','TRY','ACTIVE',maker,corr);
  insert into finance.fee_definitions(id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id)
  values(fee,hq,'PASS-THROUGH-DEMO',1,'PASS_THROUGH_EXPENSE','Sentetik Masraf Yansıtma','PUBLISHED',maker,corr);
  insert into finance.finance_periods(id,legal_entity_id,scope_type,period_start,period_end,currency_code,mode,status,created_by,correlation_id)
  values(period_id,hq,'HEADQUARTERS',date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',maker,corr);
  insert into finance.document_references(id,legal_entity_id,external_document_id,document_type,storage_provider,object_key,content_hash,status,created_by,correlation_id)
  values(document_id,hq,external_document_id,'SUPPLIER_INVOICE','LOCAL_TEST','synthetic/expense/invoice.pdf',repeat('a',64),'ACTIVE',maker,corr);
  insert into storage.objects(bucket_id,name,metadata) values('ototr-evidence',uploaded_object_key,jsonb_build_object('size',512,'mimetype','application/pdf'));
  perform pg_catalog.set_config('request.jwt.claim.role','service_role',true);
  result:=finance_api.commit_expense_evidence_registration(maker,hq,account_a,branch_a,uploaded_external_id,uploaded_object_key,'application/pdf',512,repeat('b',64),'expense-evidence-demo',repeat('c',64),corr);
  if result->>'outcome'<>'CREATED' then raise exception 'expense evidence registration failed: %',result;end if;

  result:=finance_api.commit_pass_through_expense_create(
    maker,hq,'TED-2026-001','TED-2026-001',fee,date '2026-11-03','TRY',
    1000.00000000,200.00000000,1200.00000000,'SYNTHETIC-CONTRACT-BASIS',array[external_document_id,uploaded_external_id],
    jsonb_build_array(
      jsonb_build_object('branchId',branch_a,'dealerAccountId',account_a),
      jsonb_build_object('branchId',branch_b,'dealerAccountId',account_b)
    ),repeat('b',64),'expense-create-demo',repeat('c',64),corr
  );
  if result->>'outcome'<>'CREATED' then raise exception 'expense create failed: %',result;end if;
  expense_id:=(result->>'expenseId')::uuid;version_no:=(result->>'version')::bigint;
  perform pg_catalog.set_config('request.jwt.claim.role','authenticated',true);
  result:=finance_api.get_expense_evidence_locator(hq,expense_id,uploaded_external_id);
  if result->>'bucketId'<>'ototr-evidence' or result->>'objectKey'<>uploaded_object_key or result->>'expiresIn'<>'120' then raise exception 'expense evidence locator mismatch: %',result;end if;
  perform pg_catalog.set_config('request.jwt.claim.role','service_role',true);

  result:=finance_api.commit_expense_share_calculation(
    maker,expense_id,'EQUAL','SYNTHETIC-EQUAL-V1',version_no,'expense-share-demo',repeat('d',64),corr
  );
  if result->>'outcome'<>'CALCULATED' then raise exception 'expense share calculation failed: %',result;end if;
  version_no:=(result->>'version')::bigint;
  select count(*),sum(share_amount) into item_count,amount from finance.expense_shares where pass_through_expense_id=expense_id;
  if item_count<>2 or amount<>1200.00000000 then raise exception 'expense share control mismatch';end if;
  if exists(select 1 from finance.expense_shares where pass_through_expense_id=expense_id and share_amount<>600.00000000) then
    raise exception 'equal allocation did not produce two 600 TRY shares';
  end if;

  result:=finance_api.commit_expense_submit_approval(
    maker,expense_id,version_no,'READY',repeat('e',64),'expense-submit-demo',repeat('f',64),corr
  );
  if result->>'outcome'<>'SUBMITTED' then raise exception 'expense submit failed: %',result;end if;
  version_no:=(result->>'version')::bigint;

  result:=finance_api.commit_expense_approve(
    checker,expense_id,version_no,'APPROVED',repeat('1',64),'expense-approve-demo',repeat('2',64),corr
  );
  if result->>'outcome'<>'APPROVED' then raise exception 'expense approval failed: %',result;end if;
  version_no:=(result->>'version')::bigint;
  if exists(select 1 from finance.pass_through_expenses where id=expense_id and prepared_by=approved_by) then
    raise exception 'maker checker invariant failed';
  end if;

  result:=finance_api.commit_pass_through_expense_posting(
    checker,expense_id,date '2026-11-04',version_no,'POST',repeat('3',64),'expense-post-demo',repeat('4',64),corr
  );
  if result->>'outcome'<>'POSTED' then raise exception 'expense posting failed: %',result;end if;
  version_no:=(result->>'version')::bigint;original_journal:=(result->>'journalEntryId')::uuid;
  select count(*),sum(open_amount) into item_count,amount from finance.open_items oi
  join finance.accruals a on a.id=oi.accrual_id where a.pass_through_expense_id=expense_id and oi.item_type='DEBIT';
  if item_count<>2 or amount<>1200.00000000 then raise exception 'posted expense open item mismatch';end if;

  result:=finance_api.commit_pass_through_expense_reversal(
    checker,expense_id,date '2026-11-05',version_no,'SUPPLIER_CREDIT',repeat('5',64),array[document_id],
    'expense-reverse-demo',repeat('6',64),corr
  );
  if result->>'outcome'<>'REVERSED' then raise exception 'expense reversal failed: %',result;end if;
  reversal_journal:=(result->>'journalEntryId')::uuid;
  select count(*),sum(open_amount) into item_count,amount from finance.open_items oi
  join finance.accruals a on a.id=oi.accrual_id where a.pass_through_expense_id=expense_id and oi.item_type='CREDIT';
  if item_count<>2 or amount<>1200.00000000 then raise exception 'reversed expense credit mismatch';end if;
  if not exists(select 1 from finance.journal_entries where id=reversal_journal and reversal_of_id=original_journal) then
    raise exception 'expense reversal journal provenance missing';
  end if;
  if exists(select 1 from finance.journal_entries je where je.id in(original_journal,reversal_journal) and
    (select sum(debit_amount) from finance.journal_lines where journal_entry_id=je.id)<>
    (select sum(credit_amount) from finance.journal_lines where journal_entry_id=je.id)) then
    raise exception 'expense journal is not balanced';
  end if;
  if (select status from finance.pass_through_expenses where id=expense_id)<>'REVERSED' then raise exception 'expense terminal status mismatch';end if;
  expense_page:=finance_api.list_pass_through_expenses(hq,date '2026-11-01',date '2026-11-30','REVERSED',null,50);
  if jsonb_array_length(expense_page->'items')<>1
     or expense_page#>>'{items,0,expenseId}'<>expense_id::text
     or expense_page#>>'{items,0,distributableAmount}'<>'1200.00000000'
     or expense_page#>>'{items,0,shareCount}'<>'2'
     or expense_page#>>'{items,0,documentCount}'<>'2' then raise exception 'expense list projection mismatch: %',expense_page;end if;
  expense_detail:=finance_api.get_pass_through_expense(hq,expense_id);
  if expense_detail->>'status'<>'REVERSED'
     or jsonb_array_length(expense_detail->'shares')<>2
     or expense_detail#>>'{shares,0,shareAmount}'<>'600.00000000'
     or expense_detail#>>'{approval,status}'<>'APPROVED'
     or expense_detail->>'journalEntryId'<>original_journal::text
     or expense_detail->>'reversalJournalEntryId'<>reversal_journal::text then raise exception 'expense detail projection mismatch: %',expense_detail;end if;
  raise notice 'PASS-THROUGH EXPENSE E2E PASSED: 1200 TRY -> 2 x 600 TRY -> approved -> posted -> reversed';
end
$test$;

rollback;
