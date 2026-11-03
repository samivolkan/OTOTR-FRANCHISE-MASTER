\set ON_ERROR_STOP on
begin;
set local request.jwt.claim.role='service_role';

do $test$
declare
  actor constant uuid:='00000000-0000-4000-8000-000000000131';
  hq constant uuid:='13000000-0000-4000-8000-000000000001';
  dealer constant uuid:='23000000-0000-4000-8000-000000000001';
  branch constant uuid:='33000000-0000-4000-8000-000000000001';
  account constant uuid:='43000000-0000-4000-8000-000000000001';
  fee constant uuid:='53000000-0000-4000-8000-000000000001';
  expense constant uuid:='63000000-0000-4000-8000-000000000001';
  old_hq_period constant uuid:='73000000-0000-4000-8000-000000000001';
  current_hq_period constant uuid:='73000000-0000-4000-8000-000000000004';
  old_period constant uuid:='73000000-0000-4000-8000-000000000002';
  current_period constant uuid:='73000000-0000-4000-8000-000000000003';
  old_journal constant uuid:='83000000-0000-4000-8000-000000000001';
  refund_journal constant uuid:='83000000-0000-4000-8000-000000000002';
  debit1_journal constant uuid:='83000000-0000-4000-8000-000000000003';
  debit2_journal constant uuid:='83000000-0000-4000-8000-000000000004';
  old_accrual constant uuid:='93000000-0000-4000-8000-000000000001';
  credit_accrual constant uuid:='93000000-0000-4000-8000-000000000002';
  debit1_accrual constant uuid:='93000000-0000-4000-8000-000000000003';
  debit2_accrual constant uuid:='93000000-0000-4000-8000-000000000004';
  credit_item constant uuid:='a3000000-0000-4000-8000-000000000001';
  debit1_item constant uuid:='a3000000-0000-4000-8000-000000000002';
  debit2_item constant uuid:='a3000000-0000-4000-8000-000000000003';
  corr constant uuid:='b3000000-0000-4000-8000-000000000001';
  result jsonb; replay jsonb; batch uuid;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
    values(hq,'OTOTR-HQ-CREDIT-DEMO','OTOTR Sentetik Royalty Kredi','ACTIVE',actor,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
    values(dealer,hq,'CREDIT-DEALER','Sentetik Kredi Bayisi','ACTIVE',actor,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
    values(branch,hq,dealer,'CREDIT-BRANCH','ACTIVE',actor,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
    values(account,hq,dealer,'CREDIT-ACCOUNT','TRY','ACTIVE',actor,corr);
  insert into finance.fee_definitions(id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id)
    values(fee,hq,'ROYALTY_SERVICE_FEE',1,'ROYALTY','Royalty Hizmet Bedeli','PUBLISHED',actor,corr);
  insert into finance.finance_periods(id,legal_entity_id,scope_type,period_start,period_end,currency_code,mode,status,prepared_by,approved_by,locked_at_utc,created_by,correlation_id)
    values
      (old_hq_period,hq,'HEADQUARTERS',date '2026-10-01',date '2026-10-31','TRY','LIVE','LOCKED',actor,gen_random_uuid(),now(),actor,corr),
      (current_hq_period,hq,'HEADQUARTERS',date '2026-11-01',date '2026-11-30','TRY','LIVE','LOCKED',actor,gen_random_uuid(),now(),actor,corr);
  insert into finance.finance_periods(id,legal_entity_id,parent_period_id,scope_type,dealer_account_id,branch_id,period_start,period_end,currency_code,mode,status,prepared_by,approved_by,locked_at_utc,created_by,correlation_id)
    values
      (old_period,hq,old_hq_period,'BRANCH',account,branch,date '2026-10-01',date '2026-10-31','TRY','LIVE','LOCKED',actor,gen_random_uuid(),now(),actor,corr),
      (current_period,hq,current_hq_period,'BRANCH',account,branch,date '2026-11-01',date '2026-11-30','TRY','LIVE','LOCKED',actor,gen_random_uuid(),now(),actor,corr);
  insert into finance.pass_through_expenses(id,legal_entity_id,fee_definition_id,supplier_reference,supplier_reference_normalized,contractual_basis_reference,expense_date,currency_code,source_net_amount,source_tax_amount,source_amount,distributable_net_amount,distributable_tax_amount,distributable_amount,allocation_policy,evidence_object_key,evidence_hash,idempotency_key,input_hash,status,prepared_by,approved_by,created_by,correlation_id)
    values(expense,hq,fee,'CREDIT-SOURCE','CREDIT-SOURCE','ROYALTY-REFUND',date '2026-11-01','TRY',330,66,396,330,66,396,'{"method":"SYNTHETIC"}'::jsonb,'synthetic/credit.json',repeat('a',64),'credit-source',repeat('b',64),'APPROVED',actor,gen_random_uuid(),actor,corr);
  insert into finance.journal_entries(id,legal_entity_id,finance_period_id,idempotency_key,intent_hash,entry_type,business_date,posting_date,status,posted_at_utc,posted_by,created_by,correlation_id)
    values
      (old_journal,hq,old_period,'credit-old',repeat('1',64),'ACCRUAL',date '2026-10-15',date '2026-10-15','POSTED',now(),actor,actor,corr),
      (refund_journal,hq,current_period,'credit-refund',repeat('2',64),'REFUND',date '2026-11-02',date '2026-11-02','POSTED',now(),actor,actor,corr),
      (debit1_journal,hq,current_period,'credit-debit-1',repeat('3',64),'ACCRUAL',date '2026-11-03',date '2026-11-03','POSTED',now(),actor,actor,corr),
      (debit2_journal,hq,current_period,'credit-debit-2',repeat('4',64),'ACCRUAL',date '2026-11-04',date '2026-11-04','POSTED',now(),actor,actor,corr);
  insert into finance.accruals(id,legal_entity_id,pass_through_expense_id,dealer_account_id,branch_id,journal_entry_id,sequence_no,fee_definition_id,currency_code,net_amount,tax_amount,gross_amount,status,reversal_of_id,created_by,correlation_id)
    values
      (old_accrual,hq,expense,account,branch,old_journal,1,fee,'TRY',150,30,180,'POSTED',null,actor,corr),
      (credit_accrual,hq,expense,account,branch,refund_journal,2,fee,'TRY',-150,-30,-180,'POSTED',old_accrual,actor,corr),
      (debit1_accrual,hq,expense,account,branch,debit1_journal,3,fee,'TRY',100,20,120,'POSTED',null,actor,corr);
  insert into finance.open_items(id,legal_entity_id,accrual_id,dealer_account_id,branch_id,due_date,currency_code,item_type,original_amount,allocated_amount,open_amount,status,created_by,correlation_id)
    values
      (credit_item,hq,credit_accrual,account,branch,date '2026-11-02','TRY','CREDIT',180,0,180,'OPEN',actor,corr),
      (debit1_item,hq,debit1_accrual,account,branch,date '2026-11-04','TRY','DEBIT',120,0,120,'OPEN',actor,corr);

  result:=finance_api.commit_billing_batch_creation(actor,hq,account,branch,current_period,'ROYALTY-SINGLE-LINE','credit-settlement-1',repeat('5',64),corr);
  if result->>'outcome'<>'SETTLED_BY_CREDIT' or result#>>'{royaltyCredit,appliedAmount}'<>'120.00000000'
     or result#>>'{controlTotals,grossAmount}'<>'0.00000000' then raise exception 'full credit settlement mismatch: %',result;end if;
  if (select open_amount from finance.open_items where id=credit_item)<>60 or (select status from finance.open_items where id=credit_item)<>'PARTIALLY_ALLOCATED'
     or (select status from finance.open_items where id=debit1_item)<>'CLOSED' then raise exception 'full settlement open item state mismatch';end if;
  replay:=finance_api.commit_billing_batch_creation(actor,hq,account,branch,current_period,'ROYALTY-SINGLE-LINE','credit-settlement-1',repeat('5',64),corr);
  if replay->>'outcome'<>'REPLAY' or replay->>'status'<>'SETTLED_BY_CREDIT' then raise exception 'settlement replay mismatch: %',replay;end if;

  insert into finance.accruals(id,legal_entity_id,pass_through_expense_id,dealer_account_id,branch_id,journal_entry_id,sequence_no,fee_definition_id,currency_code,net_amount,tax_amount,gross_amount,status,created_by,correlation_id)
    values(debit2_accrual,hq,expense,account,branch,debit2_journal,4,fee,'TRY',80,20,100,'POSTED',actor,corr);
  insert into finance.open_items(id,legal_entity_id,accrual_id,dealer_account_id,branch_id,due_date,currency_code,item_type,original_amount,allocated_amount,open_amount,status,created_by,correlation_id)
    values(debit2_item,hq,debit2_accrual,account,branch,date '2026-11-05','TRY','DEBIT',100,0,100,'OPEN',actor,corr);
  result:=finance_api.commit_billing_batch_creation(actor,hq,account,branch,current_period,'ROYALTY-SINGLE-LINE','credit-settlement-2',repeat('6',64),corr);
  if result->>'outcome'<>'CREATED' or result#>>'{royaltyCredit,appliedAmount}'<>'60.00000000'
     or result#>>'{controlTotals,netAmount}'<>'32.00000000' or result#>>'{controlTotals,taxAmount}'<>'8.00000000'
     or result#>>'{controlTotals,grossAmount}'<>'40.00000000' then raise exception 'carried credit billing mismatch: %',result;end if;
  batch:=(result->>'batchId')::uuid;
  if (select status from finance.open_items where id=credit_item)<>'CLOSED'
     or (select open_amount from finance.open_items where id=debit2_item)<>40
     or not exists(select 1 from finance.royalty_credit_applications where credit_open_item_id=credit_item and debit_open_item_id=debit2_item and applied_amount=60 and billing_batch_id=batch)
     or not exists(select 1 from finance.billing_batch_items where billing_batch_id=batch and accrual_id=debit2_accrual and net_amount=32 and tax_amount=8 and gross_amount=40)
  then raise exception 'carried credit trace or billing item mismatch';end if;
  result:=finance_private.get_royalty_credit_carry_forward_projection(credit_item);
  if result->>'originalCreditAmount'<>'180.00000000' or result->>'appliedAmount'<>'180.00000000'
     or result->>'remainingCreditAmount'<>'0.00000000' or result->>'status'<>'CLOSED'
     or pg_catalog.jsonb_array_length(result->'applications')<>2
     or result#>>'{applications,1,billingBatchId}'<>batch::text
     or result->>'rawAccountingDataExposed'<>'false' then raise exception 'credit carry-forward read projection mismatch: %',result;end if;
  if exists(select 1 from finance.royalty_credit_applications where branch_id<>branch or dealer_account_id<>account) then raise exception 'credit crossed branch scope';end if;
  raise notice 'ROYALTY CREDIT CARRY FORWARD E2E PASSED: 180 credit -> 120 settled -> 60 carried -> next invoice 40';
end
$test$;
rollback;
