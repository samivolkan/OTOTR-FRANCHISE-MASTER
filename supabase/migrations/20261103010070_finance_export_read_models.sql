-- OTOTR Finance internal review migration.
-- Unified headquarters billing and accounting export package projections.

create or replace function finance_api.list_finance_export_packages(
  p_legal_entity_id uuid,p_package_type text,p_status text,p_cursor text,p_limit integer
) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare v_limit integer:=least(greatest(coalesce(p_limit,50),1),200);v_cursor_text text;v_cursor_at timestamptz;v_cursor_id uuid;v_items jsonb;v_has_more boolean;v_next text;
begin
  if not finance_api.authorize_headquarters_scope(p_legal_entity_id,'listFinanceExportPackages') then raise exception using errcode='42501',message='headquarters finance scope denied';end if;
  if p_package_type is not null and p_package_type not in('BILLING','ACCOUNTING') then raise exception using errcode='22023',message='invalid export package type';end if;
  if p_status is not null and p_status not in('DRAFT','READY','EXPORT_QUEUED','EXPORTED','INVOICED','PARTIALLY_ACCEPTED','ACCEPTED','REJECTED') then raise exception using errcode='22023',message='invalid export package status';end if;
  if p_cursor is not null then begin v_cursor_text:=pg_catalog.convert_from(pg_catalog.decode(p_cursor,'base64'),'UTF8');v_cursor_at:=pg_catalog.split_part(v_cursor_text,'|',1)::timestamptz;v_cursor_id:=pg_catalog.split_part(v_cursor_text,'|',2)::uuid;exception when others then raise exception using errcode='22023',message='invalid export package cursor';end;end if;
  with unified as(
    select b.id,b.created_at_utc,'BILLING'::text package_type,b.batch_no,b.status,b.finance_period_id,b.dealer_account_id,b.branch_id,b.currency_code,b.control_net net_total,b.control_tax tax_total,b.control_gross gross_total,b.content_hash,b.mapping_version,b.target_adapter_code,(select count(*) from finance.billing_batch_items i where i.billing_batch_id=b.id and i.status='ACTIVE') item_count,(select ei.status from finance.external_invoices ei where ei.billing_batch_id=b.id) external_status
    from finance.billing_batches b where b.legal_entity_id=p_legal_entity_id
    union all
    select a.id,a.created_at_utc,'ACCOUNTING',a.batch_no,a.status,a.finance_period_id,null::uuid,null::uuid,a.currency_code,a.debit_total,0,a.credit_total,a.content_hash,a.mapping_version,a.target_adapter_code,(select count(*) from finance.accounting_batch_entries e where e.accounting_batch_id=a.id and e.status='ACTIVE'),a.external_batch_id
    from finance.accounting_batches a where a.legal_entity_id=p_legal_entity_id
  ),scoped as(select * from unified where(p_package_type is null or package_type=p_package_type)and(p_status is null or status=p_status)and(v_cursor_at is null or(created_at_utc,id)<(v_cursor_at,v_cursor_id))),page as(select * from scoped order by created_at_utc desc,id desc limit v_limit+1),visible as(select * from page order by created_at_utc desc,id desc limit v_limit),projected as(
    select id,created_at_utc,pg_catalog.jsonb_build_object('packageId',id,'packageType',package_type,'batchNo',batch_no,'status',status,'financePeriodId',finance_period_id,'dealerAccountId',dealer_account_id,'branchId',branch_id,'netTotal',net_total::text,'taxTotal',tax_total::text,'grossTotal',gross_total::text,'currency',currency_code,'contentHash',content_hash,'mappingVersion',mapping_version,'targetAdapterCode',target_adapter_code,'itemCount',item_count,'externalStatus',external_status,'createdAtUtc',created_at_utc) item from visible
  ) select coalesce(pg_catalog.jsonb_agg(item order by created_at_utc desc,id desc),'[]'::jsonb),(select count(*)>v_limit from page),case when(select count(*)>v_limit from page)then(select pg_catalog.encode(pg_catalog.convert_to(created_at_utc::text||'|'||id::text,'UTF8'),'base64')from visible order by created_at_utc,id limit 1)else null end into v_items,v_has_more,v_next from projected;
  return pg_catalog.jsonb_build_object('items',v_items,'nextCursor',v_next,'hasMore',v_has_more);
end$$;

create or replace function finance_api.get_finance_export_package(p_legal_entity_id uuid,p_package_type text,p_package_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare v_result jsonb;
begin
  if not finance_api.authorize_headquarters_scope(p_legal_entity_id,'getFinanceExportPackage') then raise exception using errcode='42501',message='headquarters finance scope denied';end if;
  if p_package_type='BILLING' then
    select pg_catalog.jsonb_build_object('packageId',b.id,'packageType','BILLING','batchNo',b.batch_no,'status',b.status,'financePeriodId',b.finance_period_id,'dealerAccountId',b.dealer_account_id,'branchId',b.branch_id,'groupingProfileCode',b.grouping_profile_code,'currency',b.currency_code,'totals',pg_catalog.jsonb_build_object('netAmount',b.control_net::text,'taxAmount',b.control_tax::text,'grossAmount',b.control_gross::text),'contentHash',b.content_hash,'mappingVersion',b.mapping_version,'targetAdapterCode',b.target_adapter_code,'exportJobId',b.export_job_id,'exportQueuedAtUtc',b.export_queued_at_utc,'items',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('itemId',i.id,'accrualId',i.accrual_id,'netAmount',i.net_amount::text,'taxAmount',i.tax_amount::text,'grossAmount',i.gross_amount::text,'status',i.status)order by i.id)from finance.billing_batch_items i where i.billing_batch_id=b.id),'[]'::jsonb),'externalInvoice',(select pg_catalog.jsonb_build_object('invoiceId',ei.id,'externalSystem',ei.external_system,'externalInvoiceId',ei.external_invoice_id,'invoiceNumber',ei.invoice_number,'invoiceDate',ei.invoice_date,'status',ei.status,'netAmount',ei.net_amount::text,'taxAmount',ei.tax_amount::text,'grossAmount',ei.gross_amount::text,'currency',ei.currency_code)from finance.external_invoices ei where ei.billing_batch_id=b.id),'version',b.version,'createdAtUtc',b.created_at_utc,'correlationId',b.correlation_id) into v_result from finance.billing_batches b where b.id=p_package_id and b.legal_entity_id=p_legal_entity_id;
  elsif p_package_type='ACCOUNTING' then
    select pg_catalog.jsonb_build_object('packageId',a.id,'packageType','ACCOUNTING','batchNo',a.batch_no,'status',a.status,'financePeriodId',a.finance_period_id,'currency',a.currency_code,'totals',pg_catalog.jsonb_build_object('debitAmount',a.debit_total::text,'creditAmount',a.credit_total::text),'contentHash',a.content_hash,'mappingVersion',a.mapping_version,'targetAdapterCode',a.target_adapter_code,'exportJobId',a.export_job_id,'exportQueuedAtUtc',a.export_queued_at_utc,'externalBatchId',a.external_batch_id,'packages',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('packageId',p.id,'dealerAccountId',p.dealer_account_id,'branchId',p.branch_id,'packageOrder',p.package_order,'debitAmount',p.debit_total::text,'creditAmount',p.credit_total::text,'contentHash',p.content_hash,'externalPackageId',p.external_package_id,'status',p.status,'safeErrorCode',p.safe_error_code,'entryCount',(select count(*) from finance.accounting_batch_entries e where e.accounting_batch_package_id=p.id and e.status='ACTIVE'))order by p.package_order)from finance.accounting_batch_packages p where p.accounting_batch_id=a.id),'[]'::jsonb),'version',a.version,'createdAtUtc',a.created_at_utc,'correlationId',a.correlation_id) into v_result from finance.accounting_batches a where a.id=p_package_id and a.legal_entity_id=p_legal_entity_id;
  else raise exception using errcode='22023',message='invalid export package type';end if;
  return v_result;
end$$;

revoke all on function finance_api.list_finance_export_packages(uuid,text,text,text,integer) from public,anon;
revoke all on function finance_api.get_finance_export_package(uuid,text,uuid) from public,anon;
grant execute on function finance_api.list_finance_export_packages(uuid,text,text,text,integer) to authenticated;
grant execute on function finance_api.get_finance_export_package(uuid,text,uuid) to authenticated;
