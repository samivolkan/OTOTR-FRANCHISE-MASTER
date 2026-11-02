-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-finance-period-read-rpc.sql
-- Source SHA256: 6B0F0004B0264522AE284985E4FD20BC79F576CDD799DCB14DD52AB045A93565
-- Local replay required before any staging promotion.
-- OTOTR FINANCE PERIOD READ RPC CANDIDATE. DO NOT APPLY.
create or replace function finance_api.get_finance_period(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_period_id uuid) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare p finance.finance_periods%rowtype;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getFinancePeriod') then raise exception using errcode='42501',message='finance scope denied';end if;
 select * into p from finance.finance_periods fp where fp.id=p_period_id and fp.legal_entity_id=p_legal_entity_id and fp.scope_type='BRANCH' and fp.dealer_account_id=p_dealer_account_id and fp.branch_id=p_branch_id;
 if not found then return null;end if;
 return pg_catalog.jsonb_build_object('periodId',p.id,'parentPeriodId',p.parent_period_id,'dealerAccountId',p.dealer_account_id,'branchId',p.branch_id,'periodStart',p.period_start,'periodEnd',p.period_end,'currencyCode',p.currency_code,'status',p.status,'sourceSnapshotHash',p.source_snapshot_hash,'checkSnapshotHash',p.check_snapshot_hash,'lockedAtUtc',p.locked_at_utc,'version',p.version);
end$$;
revoke all on function finance_api.get_finance_period(uuid,uuid,uuid,uuid) from public,anon;
