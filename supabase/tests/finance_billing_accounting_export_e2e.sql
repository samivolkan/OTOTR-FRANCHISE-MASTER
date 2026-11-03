\set ON_ERROR_STOP on

begin;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000052';
set local request.jwt.claim.role = 'service_role';
create or replace function finance_private.current_actor_can_dispatch_invoice(
  p_actor_id uuid,p_legal_entity_id uuid,p_branch_id uuid
) returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_callback_caller_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_actor_can_read_headquarters(p_actor_id uuid,p_legal_entity_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path=pg_catalog as $$select p_operation_id in('listFinanceExportPackages','getFinanceExportPackage')$$;

do $test$
declare
  maker constant uuid := '00000000-0000-4000-8000-000000000051';
  checker constant uuid := '00000000-0000-4000-8000-000000000052';
  finance_app_user constant uuid := '00000000-0000-4000-8000-000000000053';
  hq constant uuid := '15000000-0000-4000-8000-000000000001';
  dealer constant uuid := '25000000-0000-4000-8000-000000000001';
  branch constant uuid := '35000000-0000-4000-8000-000000000001';
  account constant uuid := '45000000-0000-4000-8000-000000000001';
  fee constant uuid := '55000000-0000-4000-8000-000000000001';
  hq_period constant uuid := '75000000-0000-4000-8000-000000000001';
  branch_period constant uuid := '75000000-0000-4000-8000-000000000002';
  expense_id constant uuid := '65000000-0000-4000-8000-000000000001';
  accrual_journal constant uuid := '85000000-0000-4000-8000-000000000001';
  source_accrual_id constant uuid := '85000000-0000-4000-8000-000000000002';
  accounting_journal constant uuid := '85000000-0000-4000-8000-000000000003';
  corr constant uuid := '95000000-0000-4000-8000-000000000001';
  result jsonb; replay jsonb; batch_id uuid; batch_item_id uuid; external_invoice_row_id uuid;
  export_accounting_batch_id uuid; invoice jsonb; callback jsonb; transition jsonb; package_list jsonb; package_detail jsonb;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OTOTR-HQ-EXPORT-DEMO','OTOTR Sentetik Aktarım Merkezi','ACTIVE',maker,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
  values(dealer,hq,'EXPORT-DEALER','Sentetik Aktarım Bayisi','ACTIVE',maker,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
  values(branch,hq,dealer,'EXPORT-BRANCH','ACTIVE',maker,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
  values(account,hq,dealer,'EXPORT-ACCOUNT','TRY','ACTIVE',maker,corr);
  insert into public.app_users(id,auth_user_id,branch_id,full_name,role,is_active)
  values(finance_app_user,checker,null,'Sentetik Faturalama Yetkilisi','FINANCE',true);
  result:=finance_api.authorize_billing_batch_scope(account,branch,null,'finance.billing-batches.create');
  if coalesce((result->>'allowed')::boolean,false) is not true or result->>'dealerAccountId'<>account::text or result->>'branchId'<>branch::text then raise exception 'billing create identity scope denied: %',result;end if;
  result:=finance_api.authorize_accounting_batch_creation_scope(hq,account,branch,'finance.accounting-batches.create');
  if coalesce((result->>'allowed')::boolean,false) is not true then raise exception 'accounting create identity scope denied: %',result;end if;
  insert into finance.fee_definitions(id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id)
  values(fee,hq,'SYNTHETIC-BILLING',1,'EXTERNAL_SERVICE','Sentetik Faturalama','PUBLISHED',maker,corr);
  insert into finance.accounting_mappings(legal_entity_id,fee_definition_id,version_no,effective_from,receivable_account_code,revenue_account_code,tax_account_code,reversal_account_code,erp_mapping_payload,status,prepared_by,approved_by,approved_at_utc,created_by,correlation_id)
  values(hq,fee,1,date '2026-01-01','120.BAYI','600.HIZMET','391.KDV','600.HIZMET',jsonb_build_object('mappingVersion','SYNTHETIC-ERP-MAP-V1'),'ACTIVE',maker,checker,now(),maker,corr);

  insert into finance.finance_periods(
    id,legal_entity_id,scope_type,period_start,period_end,currency_code,mode,status,
    prepared_by,approved_by,locked_at_utc,created_by,correlation_id
  ) values(hq_period,hq,'HEADQUARTERS',date '2026-11-01',date '2026-11-30','TRY','LIVE','LOCKED',
    maker,checker,now(),maker,corr);
  insert into finance.finance_periods(
    id,legal_entity_id,parent_period_id,scope_type,dealer_account_id,branch_id,period_start,period_end,
    currency_code,mode,status,prepared_by,approved_by,locked_at_utc,created_by,correlation_id
  ) values(branch_period,hq,hq_period,'BRANCH',account,branch,date '2026-11-01',date '2026-11-30','TRY','LIVE','LOCKED',
    maker,checker,now(),maker,corr);

  insert into finance.pass_through_expenses(
    id,legal_entity_id,fee_definition_id,supplier_reference,supplier_reference_normalized,
    contractual_basis_reference,expense_date,currency_code,source_net_amount,source_tax_amount,source_amount,
    distributable_net_amount,distributable_tax_amount,distributable_amount,allocation_policy,
    evidence_object_key,evidence_hash,idempotency_key,input_hash,status,prepared_by,approved_by,created_by,correlation_id
  ) values(expense_id,hq,fee,'SYNTHETIC-BILLING-SOURCE','SYNTHETIC-BILLING-SOURCE','SYNTHETIC-BASIS',
    date '2026-11-03','TRY',120,20,140,120,20,140,'{"method":"SYNTHETIC"}'::jsonb,
    'synthetic/billing-source.json',repeat('a',64),'billing-source',repeat('b',64),'APPROVED',maker,checker,maker,corr);

  insert into finance.journal_entries(
    id,legal_entity_id,finance_period_id,idempotency_key,intent_hash,entry_type,business_date,posting_date,
    status,posted_at_utc,posted_by,created_by,correlation_id
  ) values
    (accrual_journal,hq,branch_period,'billing-accrual-journal',repeat('c',64),'ACCRUAL',date '2026-11-03',date '2026-11-03','POSTED',now(),checker,maker,corr),
    (accounting_journal,hq,hq_period,'accounting-export-journal',repeat('d',64),'ADJUSTMENT',date '2026-11-04',date '2026-11-04','POSTED',now(),checker,maker,corr);
  insert into finance.journal_lines(
    journal_entry_id,line_no,dealer_account_id,account_code,branch_id,currency_code,debit_amount,credit_amount,
    created_by,correlation_id
  ) values
    (accrual_journal,1,account,'120.BAYI',branch,'TRY',140,0,maker,corr),
    (accrual_journal,2,account,'600.HIZMET',branch,'TRY',0,120,maker,corr),
    (accrual_journal,3,account,'391.KDV',branch,'TRY',0,20,maker,corr),
    (accounting_journal,1,account,'120.BAYI',branch,'TRY',140,0,maker,corr),
    (accounting_journal,2,account,'600.HIZMET',branch,'TRY',0,120,maker,corr),
    (accounting_journal,3,account,'391.KDV',branch,'TRY',0,20,maker,corr);
  insert into finance.accruals(
    id,legal_entity_id,pass_through_expense_id,dealer_account_id,branch_id,journal_entry_id,sequence_no,
    fee_definition_id,currency_code,net_amount,tax_amount,gross_amount,status,created_by,correlation_id
  ) values(source_accrual_id,hq,expense_id,account,branch,accrual_journal,1,fee,'TRY',120,20,140,'POSTED',maker,corr);

  result:=finance_api.commit_billing_batch_creation(
    checker,hq,account,branch,branch_period,'BRANCH-MONTHLY','billing-batch-demo',repeat('e',64),corr
  );
  if result->>'outcome'<>'CREATED' or result#>>'{controlTotals,grossAmount}'<>'140.00000000' then
    raise exception 'billing batch creation failed: %',result;
  end if;
  batch_id:=(result->>'batchId')::uuid;
  select bi.id into batch_item_id from finance.billing_batch_items bi
    where bi.billing_batch_id=batch_id and bi.accrual_id=source_accrual_id;

  result:=finance_api.commit_billing_batch_export(
    checker,hq,account,branch,batch_id,'SYNTHETIC_EINVOICE','SYNTHETIC-INVOICE-MAP-V1',1,
    'billing-export-demo',repeat('f',64),corr
  );
  if result->>'outcome'<>'QUEUED' then raise exception 'billing export queue failed: %',result; end if;

  invoice:=jsonb_build_object(
    'legalEntityId',hq,'branchId',branch,'billingBatchId',batch_id,'idempotencyKey','invoice-dispatch-demo',
    'externalSystem','SYNTHETIC_EINVOICE','externalInvoiceId','SYNTHETIC-INV-001','status','PENDING',
    'currencyCode','TRY','money',jsonb_build_object('net','120.00000000','tax','20.00000000','gross','140.00000000'),
    'lines',jsonb_build_array(jsonb_build_object(
      'billingBatchItemId',batch_item_id,
      'money',jsonb_build_object('net','120.00000000','tax','20.00000000','gross','140.00000000')
    ))
  );
  result:=finance_api.commit_invoice_acceptance(invoice,repeat('1',64),corr);
  if result->>'outcome'<>'CREATED' or result->>'status'<>'PENDING' then
    raise exception 'invoice acceptance failed: %',result;
  end if;
  select id into external_invoice_row_id from finance.external_invoices
    where external_system='SYNTHETIC_EINVOICE' and external_invoice_id='SYNTHETIC-INV-001';

  callback:=jsonb_build_object(
    'externalEventId','SYNTHETIC-EVENT-001','externalInvoiceId','SYNTHETIC-INV-001','expectedVersion',1,
    'status','ISSUED','invoiceNumber','OTOTR-2026-000001','invoiceDate','2026-11-05',
    'evidenceRef','synthetic://einvoice/issued/001'
  );
  transition:=jsonb_build_object(
    'action','APPLY','invoice',jsonb_build_object('status','ISSUED','version',2),
    'outbox',jsonb_build_object('externalInvoiceId','SYNTHETIC-INV-001','status','ISSUED')
  );
  result:=finance_api.commit_invoice_callback(
    'SYNTHETIC_EINVOICE','SYNTHETIC-EVENT-001','SYNTHETIC-INV-001',1,callback,transition,corr
  );
  if result->>'status'<>'COMMITTED' then raise exception 'invoice callback failed: %',result; end if;
  if not exists(
    select 1 from finance.external_invoices where id=external_invoice_row_id and status='ISSUED'
      and invoice_number='OTOTR-2026-000001' and invoice_date=date '2026-11-05'
  ) then raise exception 'issued invoice state mismatch'; end if;
  if (select status from finance.billing_batches where id=batch_id)<>'INVOICED' then
    raise exception 'billing batch did not reach INVOICED';
  end if;
  replay:=finance_api.commit_invoice_callback(
    'SYNTHETIC_EINVOICE','SYNTHETIC-EVENT-001','SYNTHETIC-INV-001',1,callback,transition,corr
  );
  if replay->>'status'<>'DUPLICATE' then raise exception 'invoice callback duplicate was not detected'; end if;

  result:=finance_api.commit_accounting_batch_creation(
    checker,hq,date '2026-11-01',date '2026-11-30','SYNTHETIC-ERP-MAP-V1',array[accounting_journal],
    'accounting-batch-demo',repeat('2',64),corr
  );
  if result->>'outcome'<>'CREATED' or result->>'entryCount'<>'1' or result->>'debitTotal'<>'140.00000000'
     or result->>'creditTotal'<>'140.00000000' then
    raise exception 'accounting batch creation failed: %',result;
  end if;
  export_accounting_batch_id:=(result->>'batchId')::uuid;
  if (select count(*) from finance.accounting_batch_packages p where p.accounting_batch_id=export_accounting_batch_id)<>1 or
     (select count(*) from finance.accounting_batch_entries e where e.accounting_batch_id=export_accounting_batch_id)<>1 then
    raise exception 'accounting package coverage mismatch';
  end if;
  replay:=finance_api.commit_accounting_batch_creation(
    checker,hq,date '2026-11-01',date '2026-11-30','SYNTHETIC-ERP-MAP-V1',array[accounting_journal],
    'accounting-batch-demo',repeat('2',64),corr
  );
  if replay->>'outcome'<>'REPLAY' then raise exception 'accounting batch replay failed: %',replay; end if;
  result:=finance_api.authorize_accounting_export_scope(export_accounting_batch_id,account,branch,'finance.accounting-batches.export');
  if coalesce((result->>'allowed')::boolean,false) is not true then raise exception 'accounting export identity scope denied: %',result;end if;
  result:=finance_api.queue_accounting_export(checker,export_accounting_batch_id,'SYNTHETIC_ERP','SYNTHETIC-ERP-MAP-V1',1,'accounting-export-demo',repeat('3',64),corr);
  if result->>'outcome'<>'QUEUED' then raise exception 'accounting export queue failed: %',result;end if;
  replay:=finance_api.queue_accounting_export(checker,export_accounting_batch_id,'SYNTHETIC_ERP','SYNTHETIC-ERP-MAP-V1',1,'accounting-export-demo',repeat('3',64),corr);
  if replay->>'outcome'<>'REPLAY' then raise exception 'accounting export replay failed: %',replay;end if;

  package_list:=finance_api.list_finance_export_packages(hq,null,null,null,25);
  if pg_catalog.jsonb_array_length(package_list->'items')<>2
     or not exists(select 1 from pg_catalog.jsonb_array_elements(package_list->'items') x where x->>'packageType'='BILLING' and x->>'status'='INVOICED' and x->>'grossTotal'='140.00000000')
     or not exists(select 1 from pg_catalog.jsonb_array_elements(package_list->'items') x where x->>'packageType'='ACCOUNTING' and x->>'status'='EXPORT_QUEUED' and x->>'grossTotal'='140.00000000') then
    raise exception 'finance export package list mismatch: %',package_list;
  end if;
  package_detail:=finance_api.get_finance_export_package(hq,'BILLING',batch_id);
  if package_detail#>>'{externalInvoice,status}'<>'ISSUED'
     or package_detail#>>'{externalInvoice,invoiceNumber}'<>'OTOTR-2026-000001'
     or pg_catalog.jsonb_array_length(package_detail->'items')<>1 then
    raise exception 'billing export package detail mismatch: %',package_detail;
  end if;
  package_detail:=finance_api.get_finance_export_package(hq,'ACCOUNTING',export_accounting_batch_id);
  if package_detail#>>'{totals,debitAmount}'<>'140.00000000'
     or package_detail#>>'{totals,creditAmount}'<>'140.00000000'
     or pg_catalog.jsonb_array_length(package_detail->'packages')<>1
     or package_detail#>>'{packages,0,entryCount}'<>'1' then
    raise exception 'accounting export package detail mismatch: %',package_detail;
  end if;

  raise notice 'BILLING + ACCOUNTING E2E PASSED: 140 TRY billed -> invoice issued -> balanced accounting package -> idempotent export queue';
end
$test$;

rollback;
