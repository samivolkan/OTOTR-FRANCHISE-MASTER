\set ON_ERROR_STOP on

begin;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000082';

create or replace function finance_private.current_summary_projection_worker_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_actor_can_read_scope(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text
) returns boolean language sql stable security definer set search_path=pg_catalog as $$
  select p_operation_id in ('getDealerFinanceSummary','getDealerStatement','getDealerStatementControl','exportDealerStatement','listAccruals','exportAccruals','listPayments')
    and p_branch_id='38000000-0000-4000-8000-000000000001'::uuid
$$;
create or replace function finance_private.current_actor_can_read_headquarters(
  p_actor_id uuid,p_legal_entity_id uuid,p_operation_id text
) returns boolean language sql stable security definer set search_path=pg_catalog as $$
  select p_operation_id in ('getHeadquartersFinanceSummary','exportHeadquartersFinanceSummary')
$$;

do $test$
declare
  actor constant uuid := '00000000-0000-4000-8000-000000000081';
  reader constant uuid := '00000000-0000-4000-8000-000000000082';
  hq constant uuid := '18000000-0000-4000-8000-000000000001';
  dealer_a constant uuid := '28000000-0000-4000-8000-000000000001';
  dealer_b constant uuid := '28000000-0000-4000-8000-000000000002';
  branch_a constant uuid := '38000000-0000-4000-8000-000000000001';
  branch_b constant uuid := '38000000-0000-4000-8000-000000000002';
  account_a constant uuid := '48000000-0000-4000-8000-000000000001';
  account_b constant uuid := '48000000-0000-4000-8000-000000000002';
  fee constant uuid := '58000000-0000-4000-8000-000000000001';
  period_id constant uuid := '78000000-0000-4000-8000-000000000001';
  expense_1 constant uuid := '68000000-0000-4000-8000-000000000001';
  expense_2 constant uuid := '68000000-0000-4000-8000-000000000002';
  journal_1 constant uuid := '88000000-0000-4000-8000-000000000001';
  journal_2 constant uuid := '88000000-0000-4000-8000-000000000002';
  accrual_1 constant uuid := '88000000-0000-4000-8000-000000000003';
  accrual_2 constant uuid := '88000000-0000-4000-8000-000000000004';
  open_1 constant uuid := '88000000-0000-4000-8000-000000000005';
  open_2 constant uuid := '88000000-0000-4000-8000-000000000006';
  payment_id constant uuid := '88000000-0000-4000-8000-000000000007';
  allocation_id constant uuid := '88000000-0000-4000-8000-000000000008';
  payment_id_2 constant uuid := '88000000-0000-4000-8000-000000000009';
  corr constant uuid := '98000000-0000-4000-8000-000000000001';
  totals jsonb; result jsonb; replay jsonb; page_1 jsonb; page_2 jsonb; filtered jsonb; hq_result jsonb; hq_export jsonb; control_result jsonb; export_result jsonb; accrual_result jsonb;
  cursor_value text; denied boolean:=false;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OTOTR-HQ-READ-DEMO','OTOTR Sentetik Okuma Merkezi','ACTIVE',actor,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
  values
    (dealer_a,hq,'READ-DEALER-A','Sentetik Okuma Bayisi A','ACTIVE',actor,corr),
    (dealer_b,hq,'READ-DEALER-B','Sentetik Okuma Bayisi B','ACTIVE',actor,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
  values
    (branch_a,hq,dealer_a,'READ-BRANCH-A','ACTIVE',actor,corr),
    (branch_b,hq,dealer_b,'READ-BRANCH-B','ACTIVE',actor,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
  values
    (account_a,hq,dealer_a,'READ-ACCOUNT-A','TRY','ACTIVE',actor,corr),
    (account_b,hq,dealer_b,'READ-ACCOUNT-B','TRY','ACTIVE',actor,corr);
  insert into finance.fee_definitions(id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id)
  values(fee,hq,'SYNTHETIC-READ-FEE',1,'EXTERNAL_SERVICE','Sentetik Okuma Bedeli','PUBLISHED',actor,corr);
  insert into finance.finance_periods(id,legal_entity_id,scope_type,period_start,period_end,currency_code,mode,status,created_by,correlation_id)
  values(period_id,hq,'HEADQUARTERS',date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',actor,corr);

  insert into finance.pass_through_expenses(
    id,legal_entity_id,fee_definition_id,supplier_reference,supplier_reference_normalized,contractual_basis_reference,
    expense_date,currency_code,source_net_amount,source_tax_amount,source_amount,distributable_net_amount,
    distributable_tax_amount,distributable_amount,allocation_policy,evidence_object_key,evidence_hash,
    idempotency_key,input_hash,status,prepared_by,approved_by,created_by,correlation_id
  ) values
    (expense_1,hq,fee,'READ-SOURCE-1','READ-SOURCE-1','SYNTHETIC-BASIS',date '2026-11-10','TRY',100,20,120,100,20,120,
      '{"method":"SYNTHETIC"}'::jsonb,'synthetic/read/1.json',repeat('a',64),'read-source-1',repeat('b',64),'APPROVED',actor,reader,actor,corr),
    (expense_2,hq,fee,'READ-SOURCE-2','READ-SOURCE-2','SYNTHETIC-BASIS',date '2026-11-05','TRY',150,30,180,150,30,180,
      '{"method":"SYNTHETIC"}'::jsonb,'synthetic/read/2.json',repeat('c',64),'read-source-2',repeat('d',64),'APPROVED',actor,reader,actor,corr);
  insert into finance.journal_entries(
    id,legal_entity_id,finance_period_id,idempotency_key,intent_hash,entry_type,business_date,posting_date,
    status,posted_at_utc,posted_by,created_by,correlation_id
  ) values
    (journal_1,hq,period_id,'read-journal-1',repeat('e',64),'ACCRUAL',date '2026-11-10',date '2026-11-10','POSTED',now(),reader,actor,corr),
    (journal_2,hq,period_id,'read-journal-2',repeat('f',64),'ACCRUAL',date '2026-11-05',date '2026-11-05','POSTED',now(),reader,actor,corr);
  insert into finance.journal_lines(
    journal_entry_id,line_no,dealer_account_id,account_code,branch_id,currency_code,debit_amount,credit_amount,created_by,correlation_id
  ) values
    (journal_1,1,account_a,'120.BAYI',branch_a,'TRY',120,0,actor,corr),
    (journal_1,2,account_a,'600.HIZMET',branch_a,'TRY',0,100,actor,corr),
    (journal_1,3,account_a,'391.KDV',branch_a,'TRY',0,20,actor,corr),
    (journal_2,1,account_a,'120.BAYI',branch_a,'TRY',180,0,actor,corr),
    (journal_2,2,account_a,'600.HIZMET',branch_a,'TRY',0,150,actor,corr),
    (journal_2,3,account_a,'391.KDV',branch_a,'TRY',0,30,actor,corr);
  insert into finance.accruals(
    id,legal_entity_id,pass_through_expense_id,dealer_account_id,branch_id,journal_entry_id,sequence_no,
    fee_definition_id,currency_code,net_amount,tax_amount,gross_amount,status,created_by,correlation_id
  ) values
    (accrual_1,hq,expense_1,account_a,branch_a,journal_1,1,fee,'TRY',100,20,120,'POSTED',actor,corr),
    (accrual_2,hq,expense_2,account_a,branch_a,journal_2,1,fee,'TRY',150,30,180,'POSTED',actor,corr);
  insert into finance.open_items(
    id,legal_entity_id,accrual_id,dealer_account_id,branch_id,due_date,currency_code,item_type,
    original_amount,allocated_amount,open_amount,status,created_by,correlation_id
  ) values
    (open_1,hq,accrual_1,account_a,branch_a,date '2026-11-20','TRY','DEBIT',120,40,80,'PARTIALLY_ALLOCATED',actor,corr),
    (open_2,hq,accrual_2,account_a,branch_a,date '2026-11-15','TRY','DEBIT',180,0,180,'OPEN',actor,corr);
  insert into finance.payments(
    id,legal_entity_id,dealer_account_id,branch_id,idempotency_key,intent_hash,external_reference,payment_date,
    value_date,payment_method_code,currency_code,received_amount,verified_amount,allocated_amount,status,
    prepared_by,verified_by,verified_at_utc,created_by,correlation_id
  ) values
    (payment_id,hq,account_a,branch_a,'read-payment',repeat('1',64),'READ-PAYMENT-001',date '2026-11-11',
      date '2026-11-11','BANK_TRANSFER','TRY',100,100,40,'PARTIALLY_ALLOCATED',actor,reader,now(),actor,corr),
    (payment_id_2,hq,account_a,branch_a,'read-payment-2',repeat('3',64),'READ-PAYMENT-002',date '2026-11-09',
      date '2026-11-09','BANK_TRANSFER','TRY',50,50,0,'VERIFIED',actor,reader,now(),actor,corr);
  insert into finance.payment_allocations(
    id,payment_id,open_item_id,allocation_sequence,currency_code,amount,status,created_by,correlation_id
  ) values(allocation_id,payment_id,open_1,1,'TRY',40,'ACTIVE',reader,corr);

  totals:=jsonb_build_object(
    'accrued',jsonb_build_object('netAmount','250.00000000','taxAmount','50.00000000','grossAmount','300.00000000'),
    'invoiced',jsonb_build_object('netAmount','0','taxAmount','0','grossAmount','0'),
    'collected',jsonb_build_object('netAmount','33.33333333','taxAmount','6.66666667','grossAmount','40.00000000'),
    'open',jsonb_build_object('netAmount','216.66666667','taxAmount','43.33333333','grossAmount','260.00000000'),
    'overdue',jsonb_build_object('netAmount','0','taxAmount','0','grossAmount','0'),
    'deducted',jsonb_build_object('netAmount','0','taxAmount','0','grossAmount','0'),
    'refunded',jsonb_build_object('netAmount','0','taxAmount','0','grossAmount','0'),
    'disputed',jsonb_build_object('netAmount','0','taxAmount','0','grossAmount','0'),
    'unallocated',jsonb_build_object('amount','60.00000000')
  );
  result:=finance_api.commit_dealer_finance_summary_snapshot(
    actor,hq,account_a,branch_a,date '2026-11-30','TRY','LOCAL-E2E-V1',totals,
    jsonb_build_object('lastAccrualId',accrual_2,'lastPaymentId',payment_id),repeat('2',64),corr
  );
  if result->>'outcome'<>'CREATED' then raise exception 'summary snapshot creation failed: %',result; end if;
  replay:=finance_api.commit_dealer_finance_summary_snapshot(
    actor,hq,account_a,branch_a,date '2026-11-30','TRY','LOCAL-E2E-V1',totals,
    jsonb_build_object('lastAccrualId',accrual_2,'lastPaymentId',payment_id),repeat('2',64),corr
  );
  if replay->>'outcome'<>'REPLAY' then raise exception 'summary snapshot replay failed: %',replay; end if;

  result:=finance_api.get_dealer_finance_summary(hq,account_a,branch_a,date '2026-11-30');
  if result#>>'{accrued,grossAmount}'<>'300.00000000' or result#>>'{collected,grossAmount}'<>'40.00000000'
     or result#>>'{open,grossAmount}'<>'260.00000000' or result#>>'{unallocated,amount}'<>'60.00000000'
     or jsonb_array_length(result->'feeFamilies')<>1 or result#>>'{feeFamilies,0,feeFamily}'<>'EXTERNAL_SERVICE'
     or jsonb_array_length(result->'branchBreakdown')<>1 or result#>>'{branchBreakdown,0,branchCode}'<>'READ-BRANCH-A'
     or result#>>'{operationalContribution,status}'<>'SOURCE_NOT_CONNECTED' then
    raise exception 'dealer finance summary totals mismatch: %',result;
  end if;
  export_result:=finance_api.export_dealer_finance_summary(hq,account_a,branch_a,date '2026-11-30');
  if export_result->>'documentType'<>'OTOTR_FINANCE_DEALER_SUMMARY_EXPORT'
     or export_result->>'hasData'<>'true'
     or export_result->>'rawRecordsExposed'<>'false'
     or export_result#>>'{summary,accrued,grossAmount}'<>'300.00000000'
     or export_result#>>'{summary,branchBreakdown,0,branchCode}'<>'READ-BRANCH-A'
     or export_result ? 'rawRecords' then
    raise exception 'dealer summary export mismatch: %',export_result;
  end if;

  totals:=jsonb_build_object(
    'accrued',jsonb_build_object('netAmount','150.00000000','taxAmount','30.00000000','grossAmount','180.00000000'),
    'invoiced',jsonb_build_object('netAmount','0','taxAmount','0','grossAmount','0'),
    'collected',jsonb_build_object('netAmount','0','taxAmount','0','grossAmount','0'),
    'open',jsonb_build_object('netAmount','150.00000000','taxAmount','30.00000000','grossAmount','180.00000000'),
    'overdue',jsonb_build_object('netAmount','50.00000000','taxAmount','10.00000000','grossAmount','60.00000000'),
    'deducted',jsonb_build_object('netAmount','0','taxAmount','0','grossAmount','0'),
    'refunded',jsonb_build_object('netAmount','0','taxAmount','0','grossAmount','0'),
    'disputed',jsonb_build_object('netAmount','0','taxAmount','0','grossAmount','0'),
    'unallocated',jsonb_build_object('amount','0')
  );
  result:=finance_api.commit_dealer_finance_summary_snapshot(
    actor,hq,account_b,branch_b,date '2026-11-30','TRY','LOCAL-E2E-V1',totals,
    jsonb_build_object('syntheticDealer','B'),repeat('4',64),corr
  );
  if result->>'outcome'<>'CREATED' then raise exception 'second dealer summary creation failed: %',result;end if;
  hq_result:=finance_api.get_headquarters_finance_summary(hq,date '2026-11-30','TRY');
  if hq_result->>'dealerCount'<>'2' or hq_result->>'branchCount'<>'2'
     or hq_result#>>'{accrued,grossAmount}'<>'480.00000000'
     or hq_result#>>'{open,grossAmount}'<>'440.00000000'
     or hq_result#>>'{dealerRanking,0,dealerCode}'<>'READ-DEALER-A'
     or hq_result#>>'{feeFamilies,0,feeFamily}'<>'EXTERNAL_SERVICE'
     or hq_result#>>'{feeFamilies,0,grossAmount}'<>'300.00000000' then
    raise exception 'headquarters finance aggregation mismatch: %',hq_result;
  end if;
  hq_export:=finance_api.export_headquarters_finance_summary(hq,date '2026-11-30','TRY');
  if hq_export->>'documentType'<>'OTOTR_FINANCE_HEADQUARTERS_SUMMARY_EXPORT'
     or hq_export->>'hasData'<>'true' or hq_export->>'rawRecordsExposed'<>'false'
     or hq_export#>>'{summary,accrued,grossAmount}'<>'480.00000000'
     or hq_export#>>'{summary,dealerRanking,0,dealerCode}'<>'READ-DEALER-A'
     or hq_export ? 'rawRecords' then
    raise exception 'headquarters finance export mismatch: %',hq_export;
  end if;

  page_1:=finance_api.get_dealer_statement(hq,account_a,branch_a,date '2026-11-01',date '2026-11-30',null,null,1);
  if (page_1->>'hasMore')::boolean is distinct from true or jsonb_array_length(page_1->'items')<>1
     or page_1#>>'{items,0,sourceReference}'<>'READ-SOURCE-1'
     or page_1#>>'{items,0,allocatedAmount}'<>'40.00000000' then
    raise exception 'statement first page mismatch: %',page_1;
  end if;
  cursor_value:=page_1->>'nextCursor';
  page_2:=finance_api.get_dealer_statement(hq,account_a,branch_a,date '2026-11-01',date '2026-11-30',null,cursor_value,1);
  if (page_2->>'hasMore')::boolean is distinct from false or jsonb_array_length(page_2->'items')<>1
     or page_2#>>'{items,0,sourceReference}'<>'READ-SOURCE-2' then
    raise exception 'statement second page mismatch: %',page_2;
  end if;
  filtered:=finance_api.get_dealer_statement(hq,account_a,branch_a,null,null,'OPEN',null,50);
  if jsonb_array_length(filtered->'items')<>1 or filtered#>>'{items,0,openAmount}'<>'180.00000000' then
    raise exception 'statement status filter mismatch: %',filtered;
  end if;
  control_result:=finance_api.get_dealer_statement_control(hq,account_a,branch_a,date '2026-11-01',date '2026-11-30','TRY');
  if control_result->>'historicalReconstruction'<>'true' or control_result->>'rawRecordsExposed'<>'false' or control_result->>'closingBalance'<>'260.00000000' then
    raise exception 'statement control mismatch: %',control_result;
  end if;
  export_result:=finance_api.export_dealer_statement(hq,account_a,branch_a,date '2026-11-01',date '2026-11-30','TRY',null,10000);
  if export_result->>'documentType'<>'OTOTR_FINANCE_DEALER_STATEMENT_EXPORT' or export_result->>'rowCount'<>'2' or export_result->>'truncated'<>'false' or export_result->>'rawRecordsExposed'<>'false' then
    raise exception 'statement export mismatch: %',export_result;
  end if;
  accrual_result:=finance_api.list_accruals(hq,account_a,branch_a,date '2026-11-01',date '2026-11-30','POSTED','EXTERNAL_SERVICE','OPEN',null,50);
  if jsonb_array_length(accrual_result->'items')<>2 or accrual_result#>>'{items,0,feeFamily}'<>'EXTERNAL_SERVICE' or accrual_result#>>'{items,0,financePeriod,status}'<>'OPEN' then
    raise exception 'accrual list filter mismatch: %',accrual_result;
  end if;
  accrual_result:=finance_api.list_accruals(hq,account_a,branch_a,null,null,null,'ROYALTY',null,null,50);
  if jsonb_array_length(accrual_result->'items')<>0 then raise exception 'accrual fee-family filter leaked rows: %',accrual_result;end if;
  export_result:=finance_api.export_accruals(hq,account_a,branch_a,date '2026-11-01',date '2026-11-30','TRY','POSTED','EXTERNAL_SERVICE','OPEN',10000);
  if export_result->>'exportKind'<>'ACCRUALS' or export_result->>'rowCount'<>'2' or export_result#>>'{filters,feeFamily}'<>'EXTERNAL_SERVICE' or export_result#>>'{filters,periodStatus}'<>'OPEN' then raise exception 'accrual export mismatch: %',export_result;end if;

  page_1:=finance_api.list_payments(hq,account_a,branch_a,date '2026-11-01',date '2026-11-30',null,null,1);
  if (page_1->>'hasMore')::boolean is distinct from true or jsonb_array_length(page_1->'items')<>1
     or page_1#>>'{items,0,paymentId}'<>payment_id::text
     or page_1#>>'{items,0,unallocatedAmount,amount}'<>'60.00000000'
     or page_1#>>'{items,0,allocationCount}'<>'1' then
    raise exception 'payment list first page mismatch: %',page_1;
  end if;
  cursor_value:=page_1->>'nextCursor';
  page_2:=finance_api.list_payments(hq,account_a,branch_a,null,null,null,cursor_value,1);
  if (page_2->>'hasMore')::boolean is distinct from false or jsonb_array_length(page_2->'items')<>1
     or page_2#>>'{items,0,paymentId}'<>payment_id_2::text then
    raise exception 'payment list second page mismatch: %',page_2;
  end if;
  filtered:=finance_api.list_payments(hq,account_a,branch_a,null,null,'VERIFIED',null,50);
  if jsonb_array_length(filtered->'items')<>1 or filtered#>>'{items,0,externalReference}'<>'READ-PAYMENT-002' then
    raise exception 'payment status filter mismatch: %',filtered;
  end if;

  begin
    perform finance_api.get_dealer_statement(hq,account_a,branch_b,null,null,null,null,50);
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'cross-dealer branch read was not denied'; end if;

  denied:=false;
  begin
    perform finance_api.export_dealer_statement(hq,account_a,branch_b,date '2026-11-01',date '2026-11-30','TRY',null,10000);
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'cross-dealer statement export was not denied'; end if;

  denied:=false;
  begin
    perform finance_api.list_payments(hq,account_a,branch_b,null,null,null,null,50);
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'cross-dealer payment list was not denied'; end if;

  raise notice 'DEALER READ MODELS E2E PASSED: headquarters aggregation, summary, statement and payment-list pagination/filter/scope isolation verified';
end
$test$;

rollback;
