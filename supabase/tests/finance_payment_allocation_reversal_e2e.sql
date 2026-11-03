\set ON_ERROR_STOP on

begin;

create or replace function finance_private.current_payment_create_worker_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_payment_verification_worker_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_payment_allocation_worker_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_allocation_reversal_worker_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_api.authorize_scope(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path='' as $$select true$$;

do $test$
declare
  maker constant uuid := '00000000-0000-4000-8000-000000000041';
  checker constant uuid := '00000000-0000-4000-8000-000000000042';
  hq constant uuid := '14000000-0000-4000-8000-000000000001';
  dealer constant uuid := '24000000-0000-4000-8000-000000000001';
  branch constant uuid := '34000000-0000-4000-8000-000000000001';
  account constant uuid := '44000000-0000-4000-8000-000000000001';
  fee constant uuid := '54000000-0000-4000-8000-000000000001';
  hq_period constant uuid := '74000000-0000-4000-8000-000000000001';
  branch_period constant uuid := '74000000-0000-4000-8000-000000000002';
  clearing constant uuid := '64000000-0000-4000-8000-000000000001';
  receivable constant uuid := '64000000-0000-4000-8000-000000000002';
  payment_map constant uuid := '64000000-0000-4000-8000-000000000003';
  expense_id constant uuid := '64000000-0000-4000-8000-000000000004';
  original_journal constant uuid := '84000000-0000-4000-8000-000000000001';
  original_accrual constant uuid := '84000000-0000-4000-8000-000000000002';
  original_open constant uuid := '84000000-0000-4000-8000-000000000003';
  document_id constant uuid := '84000000-0000-4000-8000-000000000004';
  external_document_id constant uuid := '84000000-0000-4000-8000-000000000005';
  corr constant uuid := '94000000-0000-4000-8000-000000000001';
  result jsonb; replay jsonb; payment_id uuid; payment_version bigint; allocation_id uuid;
  verification_journal uuid; maker_checker_blocked boolean:=false;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OTOTR-HQ-PAYMENT-DEMO','OTOTR Sentetik Tahsilat Merkezi','ACTIVE',maker,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
  values(dealer,hq,'PAYMENT-DEALER','Sentetik Tahsilat Bayisi','ACTIVE',maker,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
  values(branch,hq,dealer,'PAYMENT-BRANCH','ACTIVE',maker,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
  values(account,hq,dealer,'PAYMENT-ACCOUNT','TRY','ACTIVE',maker,corr);
  insert into finance.fee_definitions(id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id)
  values(fee,hq,'SYNTHETIC-PAYMENT-TARGET',1,'QUERY','Sentetik Tahsilat Hedefi','PUBLISHED',maker,corr);

  insert into finance.finance_periods(id,legal_entity_id,scope_type,period_start,period_end,currency_code,mode,status,created_by,correlation_id)
  values(hq_period,hq,'HEADQUARTERS',date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',maker,corr);
  insert into finance.finance_periods(
    id,legal_entity_id,parent_period_id,scope_type,dealer_account_id,branch_id,period_start,period_end,
    currency_code,mode,status,created_by,correlation_id
  ) values(branch_period,hq,hq_period,'BRANCH',account,branch,date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',maker,corr);

  insert into finance.operational_accounts(
    id,legal_entity_id,account_code,account_name,account_type,currency_policy,currency_code,erp_account_code,
    status,prepared_by,approved_by,approved_at_utc,created_by,correlation_id
  ) values
    (clearing,hq,'102.BANKA','Sentetik Banka','ASSET','FIXED','TRY','102.01','ACTIVE',maker,checker,now(),maker,corr),
    (receivable,hq,'120.BAYI','Sentetik Bayi Alacağı','ASSET','FIXED','TRY','120.01','ACTIVE',maker,checker,now(),maker,corr);
  insert into finance.payment_account_mappings(
    id,legal_entity_id,payment_method_code,currency_code,version_no,effective_from,clearing_account_id,
    receivable_account_id,status,prepared_by,approved_by,approved_at_utc,created_by,correlation_id
  ) values(payment_map,hq,'BANK_TRANSFER','TRY',1,date '2026-11-01',clearing,receivable,
    'ACTIVE',maker,checker,now(),maker,corr);

  insert into finance.pass_through_expenses(
    id,legal_entity_id,fee_definition_id,supplier_reference,supplier_reference_normalized,
    contractual_basis_reference,expense_date,currency_code,source_net_amount,source_tax_amount,source_amount,
    distributable_net_amount,distributable_tax_amount,distributable_amount,allocation_policy,
    evidence_object_key,evidence_hash,idempotency_key,input_hash,status,prepared_by,approved_by,created_by,correlation_id
  ) values(expense_id,hq,fee,'SYNTHETIC-PAYMENT-TARGET','SYNTHETIC-PAYMENT-TARGET','SYNTHETIC-BASIS',
    date '2026-11-02','TRY',120,20,140,120,20,140,'{"method":"SYNTHETIC"}'::jsonb,
    'synthetic/payment-target.json',repeat('a',64),'payment-target',repeat('b',64),'APPROVED',maker,checker,maker,corr);
  insert into finance.journal_entries(
    id,legal_entity_id,finance_period_id,idempotency_key,intent_hash,entry_type,business_date,posting_date,
    status,posted_at_utc,posted_by,created_by,correlation_id
  ) values(original_journal,hq,branch_period,'payment-target-journal',repeat('c',64),'ACCRUAL',date '2026-11-02',
    date '2026-11-02','POSTED',now(),checker,maker,corr);
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
  insert into finance.document_references(
    id,legal_entity_id,external_document_id,document_type,storage_provider,object_key,content_hash,status,created_by,correlation_id
  ) values(document_id,hq,external_document_id,'PAYMENT_EVIDENCE','LOCAL_TEST','synthetic/payment/receipt.pdf',repeat('d',64),'ACTIVE',maker,corr);

  result:=finance_api.commit_payment_creation(
    maker,hq,account,branch,date '2026-11-03',date '2026-11-03',100,'TRY','BANK_TRANSFER',
    'SYNTHETIC-BANK-TXN-001','BANK-REF-001','Sentetik tahsilat',array[external_document_id],
    'payment-create-demo',repeat('e',64),corr
  );
  if result->>'outcome'<>'CREATED' then raise exception 'payment creation failed: %',result; end if;
  payment_id:=(result->>'paymentId')::uuid; payment_version:=(result->>'version')::bigint;

  begin
    perform finance_api.commit_payment_verification(
      maker,payment_id,payment_version,'BANK_STATEMENT',array[external_document_id],
      'payment-verify-maker',repeat('f',64),'maker must be blocked',corr
    );
  exception when insufficient_privilege then maker_checker_blocked:=true;
  end;
  if not maker_checker_blocked then raise exception 'payment maker-checker violation was not blocked'; end if;

  result:=finance_api.commit_payment_verification(
    checker,payment_id,payment_version,'BANK_STATEMENT',array[external_document_id],
    'payment-verify-demo',repeat('1',64),'Sentetik banka ekstresi doğrulaması',corr
  );
  if result->>'outcome'<>'CREATED' or result->>'status'<>'VERIFIED' then
    raise exception 'payment verification failed: %',result;
  end if;
  payment_version:=(result->>'version')::bigint; verification_journal:=(result->>'journalEntryId')::uuid;
  if (select sum(debit_amount) from finance.journal_lines where journal_entry_id=verification_journal)<>
     (select sum(credit_amount) from finance.journal_lines where journal_entry_id=verification_journal) then
    raise exception 'payment verification journal is not balanced';
  end if;

  result:=finance_api.commit_payment_allocation(
    checker,payment_id,hq,account,branch,'MANUAL',
    jsonb_build_array(jsonb_build_object(
      'openItemId',original_open,'amount',jsonb_build_object('amount','80.00000000','currency','TRY'),
      'expectedOpenItemVersion',1
    )),payment_version,'payment-allocate-demo',repeat('2',64),corr
  );
  if result->>'outcome'<>'CREATED' or result->>'unallocatedAmount'<>'20.00000000' then
    raise exception 'payment allocation failed: %',result;
  end if;
  payment_version:=(result->>'paymentVersion')::bigint;
  allocation_id:=(result#>>'{allocations,0,id}')::uuid;
  if not exists(select 1 from finance.open_items where id=original_open and allocated_amount=80 and open_amount=60 and status='PARTIALLY_ALLOCATED') then
    raise exception 'open item was not partially allocated';
  end if;
  if not exists(select 1 from finance.payments where id=payment_id and allocated_amount=80 and status='PARTIALLY_ALLOCATED') then
    raise exception 'payment partial allocation totals mismatch';
  end if;

  result:=finance_api.commit_payment_allocation_reversal(
    checker,allocation_id,hq,account,branch,'WRONG_TARGET',1,payment_version,2,
    array[external_document_id],'Sentetik mahsup iptali','payment-reverse-demo',repeat('3',64),corr
  );
  if result->>'outcome'<>'CREATED' or result->>'status'<>'REVERSED' then
    raise exception 'allocation reversal failed: %',result;
  end if;
  if not exists(select 1 from finance.open_items where id=original_open and allocated_amount=0 and open_amount=140 and status='OPEN') then
    raise exception 'open item was not restored after reversal';
  end if;
  if not exists(select 1 from finance.payments where id=payment_id and verified_amount=100 and allocated_amount=0 and status='VERIFIED') then
    raise exception 'payment remainder was not restored after reversal';
  end if;
  if (select count(*) from finance.payment_allocations where reversal_of_id=allocation_id)<>1 then
    raise exception 'allocation reversal provenance missing';
  end if;

  replay:=finance_api.commit_payment_allocation_reversal(
    checker,allocation_id,hq,account,branch,'WRONG_TARGET',1,payment_version,2,
    array[external_document_id],'Sentetik mahsup iptali','payment-reverse-demo',repeat('3',64),corr
  );
  if replay->>'outcome'<>'REPLAY' then raise exception 'allocation reversal replay failed: %',replay; end if;
  if (select count(*) from finance.payment_allocations where reversal_of_id=allocation_id)<>1 then
    raise exception 'replay created duplicate reversal';
  end if;

  result:=finance_api.get_payment(hq,account,branch,payment_id);
  if result#>>'{payment,status}'<>'VERIFIED'
     or result#>>'{unallocatedAmount,amount}'<>'100.00000000'
     or jsonb_array_length(result->'allocations')<>2
     or exists(select 1 from jsonb_array_elements(result->'allocations') x where (x->>'allocationVersion')::bigint<1 or (x->>'openItemVersion')::bigint<1)
     or jsonb_array_length(result->'allocatableOpenItems')<>1
     or result#>>'{allocatableOpenItems,0,version}'<>'3'
     or jsonb_array_length(result#>'{payment,documents}')<>1 then
    raise exception 'payment read projection mismatch: %',result;
  end if;

  raise notice 'PAYMENT E2E PASSED: 100 TRY verified -> 80 TRY allocated -> allocation reversed -> 100 TRY unallocated';
end
$test$;

rollback;
