-- Server-only accounting export delivery projection and feedback identity bridge.
create or replace function finance_private.current_accounting_feedback_caller_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_api.get_accounting_export_delivery(p_batch_id uuid,p_provider_id text)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private as $$
declare b finance.accounting_batches%rowtype;packages jsonb;
begin
 if not finance_private.current_accounting_feedback_caller_is_trusted()then raise exception using errcode='42501',message='trusted accounting delivery caller required';end if;
 select * into b from finance.accounting_batches where id=p_batch_id and status='EXPORT_QUEUED'and target_adapter_code=p_provider_id;
 if not found then return null;end if;
 select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('packageId',p.id,'dealerAccountId',p.dealer_account_id,'branchId',p.branch_id,'packageOrder',p.package_order,'debitTotal',p.debit_total::text,'creditTotal',p.credit_total::text,'contentHash',p.content_hash,'entries',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('journalEntryId',je.id,'postingDate',je.posting_date,'snapshotHash',e.snapshot_hash,'lines',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('lineNo',jl.line_no,'accountCode',jl.account_code,'currency',jl.currency_code,'debit',jl.debit_amount::text,'credit',jl.credit_amount::text)order by jl.line_no)from finance.journal_lines jl where jl.journal_entry_id=je.id),'[]'::jsonb))order by e.entry_order)from finance.accounting_batch_entries e join finance.journal_entries je on je.id=e.journal_entry_id where e.accounting_batch_package_id=p.id and e.status='ACTIVE'),'[]'::jsonb))order by p.package_order),'[]'::jsonb)into packages from finance.accounting_batch_packages p where p.accounting_batch_id=b.id and p.status='EXPORT_QUEUED';
 if pg_catalog.jsonb_array_length(packages)<1 then raise exception using errcode='23514',message='accounting delivery package required';end if;
 return pg_catalog.jsonb_build_object('schemaVersion',1,'providerId',p_provider_id,'batchId',b.id,'batchNo',b.batch_no,'mappingVersion',b.mapping_version,'currency',b.currency_code,'debitTotal',b.debit_total::text,'creditTotal',b.credit_total::text,'contentHash',b.content_hash,'exportJobId',b.export_job_id,'packages',packages,'rawCustomerDataExposed',false);
end$$;

revoke all on function finance_private.current_accounting_feedback_caller_is_trusted()from public,anon,authenticated;
revoke all on function finance_api.get_accounting_export_delivery(uuid,text)from public,anon,authenticated;
revoke all on function finance_api.record_accounting_export_feedback(text,text,uuid,text,text,text,jsonb,uuid)from public,anon,authenticated;
grant execute on function finance_api.get_accounting_export_delivery(uuid,text)to service_role;
grant execute on function finance_api.record_accounting_export_feedback(text,text,uuid,text,text,text,jsonb,uuid)to service_role;
