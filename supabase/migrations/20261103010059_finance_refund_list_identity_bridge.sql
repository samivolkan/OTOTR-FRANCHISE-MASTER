-- OTOTR Finance internal review migration.
-- Extends canonical ERP identity authorization with branch-scoped royalty refund listing.

create or replace function finance_private.current_actor_can_read_scope(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text
) returns boolean
language plpgsql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;v_role_allowed boolean:=false;v_scope_valid boolean:=false;
begin
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found then return false;end if;
  select exists(select 1 from finance.dealer_accounts da join finance.branches b on b.id=p_branch_id and b.legal_entity_id=p_legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id and b.status='ACTIVE' where da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and da.status in('SHADOW','ACTIVE')) into v_scope_valid;
  if not v_scope_valid then return false;end if;
  v_role_allowed:=case
    when u.role in('CEO','GENERAL_MANAGER') then p_operation_id=any(array['getSourceEventStatus','getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','listRoyaltyRefunds','getFinancePeriod','listPayments','getCurrentFranchiseContract','getFranchiseContract','listContractVersions','listContractFeeRules','getContractFeeRule'])
    when u.role='FINANCE' then p_operation_id=any(array['getSourceEventStatus','getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','listRoyaltyRefunds','getPayment','listPayments','getCurrentFranchiseContract','getFranchiseContract','listContractVersions','listContractFeeRules','getContractFeeRule','getFinancePeriod'])
    when u.role='BRANCH_MANAGER' then p_operation_id=any(array['getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','listRoyaltyRefunds','getPayment','listPayments','getCurrentFranchiseContract','getFranchiseContract','listContractVersions','listContractFeeRules','getContractFeeRule','getFinancePeriod'])
    when u.role in('QUALITY_AUDITOR','LEGAL') then p_operation_id=any(array['getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','listRoyaltyRefunds','getPayment','listPayments','getCurrentFranchiseContract','getFranchiseContract','listContractVersions','listContractFeeRules','getContractFeeRule','getFinancePeriod','listIntegrationErrors'])
    else false end;
  if not v_role_allowed then return false;end if;
  if u.role in('CEO','GENERAL_MANAGER','FINANCE') then return true;end if;
  if u.role='BRANCH_MANAGER' then return exists(select 1 from finance_private.erp_branch_scope_mappings m where m.erp_branch_id=u.branch_id and m.legal_entity_id=p_legal_entity_id and m.dealer_account_id=p_dealer_account_id and m.finance_branch_id=p_branch_id and m.status='ACTIVE' and m.effective_from<=current_date and (m.effective_to is null or current_date<m.effective_to));end if;
  return exists(select 1 from finance_private.actor_scope_grants g where g.app_user_id=u.id and g.legal_entity_id=p_legal_entity_id and g.dealer_account_id=p_dealer_account_id and g.finance_branch_id=p_branch_id and g.status='ACTIVE' and g.effective_from<=current_date and (g.effective_to is null or current_date<g.effective_to));
end$$;

revoke all on function finance_private.current_actor_can_read_scope(uuid,uuid,uuid,uuid,text) from public,anon,authenticated;
