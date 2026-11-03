-- Safe branch-scoped reconciliation projection for the finance-period decision screen.

create or replace function finance_api.get_finance_period_reconciliations(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_period_id uuid
) returns jsonb language plpgsql stable security definer
set search_path='' as $$
declare p finance.finance_periods%rowtype;v_items jsonb;v_hash text;v_total integer;v_blocking integer;
begin
 if auth.uid() is null or not finance_private.current_actor_can_read_scope(auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id,'getFinancePeriodReconciliations') then raise exception using errcode='42501',message='finance scope denied';end if;
 select * into p from finance.finance_periods where id=p_period_id and legal_entity_id=p_legal_entity_id and dealer_account_id=p_dealer_account_id and branch_id=p_branch_id and scope_type='BRANCH';
 if not found then raise exception using errcode='P0002',message='finance period not found';end if;
 select pg_catalog.count(*),pg_catalog.count(*) filter(where r.status not in('MATCHED','APPROVED_DIFFERENCE','LOCKED')),
  coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
   'reconciliationId',r.id,'type',r.reconciliation_type,'runNo',r.run_no,'currency',r.currency_code,
   'sourceTotal',r.source_total::text,'ledgerTotal',r.ledger_total::text,'differenceAmount',r.difference_amount::text,
   'status',r.status,'snapshotHash',r.snapshot_hash,'createdAtUtc',r.created_at_utc,'correlationId',r.correlation_id
  ) order by r.reconciliation_type,r.run_no),'[]'::jsonb)
 into v_total,v_blocking,v_items from finance.reconciliations r where r.finance_period_id=p.id;
 if v_total>0 then
  select pg_catalog.encode(extensions.digest(pg_catalog.convert_to(pg_catalog.string_agg(r.reconciliation_type||':'||r.run_no::text||':'||r.currency_code||':'||r.source_total::text||':'||r.ledger_total::text||':'||r.snapshot_hash||':'||r.status,'|' order by r.reconciliation_type,r.run_no),'UTF8'),'sha256'),'hex') into v_hash from finance.reconciliations r where r.finance_period_id=p.id;
 end if;
 return pg_catalog.jsonb_build_object('periodId',p.id,'periodStatus',p.status,'version',p.version,'items',v_items,'totalCount',v_total,'blockingCount',v_blocking,'checkSnapshotHash',v_hash,'closeReady',v_total>0 and v_blocking=0,'rawRecordsExposed',false);
end$$;

revoke all on function finance_api.get_finance_period_reconciliations(uuid,uuid,uuid,uuid) from public,anon;
grant execute on function finance_api.get_finance_period_reconciliations(uuid,uuid,uuid,uuid) to authenticated;
