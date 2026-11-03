-- OTOTR Finance governance read identity and fail-closed scope resolution.

create or replace function finance_private.approval_request_is_in_scope(p_request_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance as $$
 select exists(
  select 1 from finance.approval_requests a
  where a.id=p_request_id and a.legal_entity_id=p_legal_entity_id and(
   (a.subject_snapshot->>'dealerAccountId')::text=p_dealer_account_id::text and (a.subject_snapshot->>'branchId')::text=p_branch_id::text
   or exists(select 1 from pg_catalog.jsonb_array_elements(coalesce(a.subject_snapshot->'shares','[]'::jsonb)) s where s->>'dealerAccountId'=p_dealer_account_id::text and s->>'branchId'=p_branch_id::text)
   or a.subject_type='CONTRACT_VERSION' and exists(select 1 from finance.contract_versions v join finance.franchise_contracts c on c.id=v.contract_id join finance.dealer_accounts da on da.legal_entity_id=c.legal_entity_id and da.dealer_legal_entity_id=c.dealer_legal_entity_id join finance.audit_events ae on ae.subject_type='CONTRACT_VERSION' and ae.subject_id=v.id where v.id=a.subject_id and c.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and ae.safe_context->>'branchId'=p_branch_id::text)
   or a.subject_type in('FINANCE_PERIOD_CLOSE','FINANCE_PERIOD_REOPEN') and exists(select 1 from finance.finance_periods f where f.id=a.subject_id and f.legal_entity_id=p_legal_entity_id and f.dealer_account_id=p_dealer_account_id and f.branch_id=p_branch_id)
   or a.subject_type='PASS_THROUGH_EXPENSE' and exists(select 1 from finance.expense_shares s where s.pass_through_expense_id=a.subject_id and s.dealer_account_id=p_dealer_account_id and s.branch_id=p_branch_id)
  )
 )
$$;

create or replace function finance_private.audit_event_is_in_scope(p_event_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance as $$
 select exists(select 1 from finance.audit_events a where a.id=p_event_id and a.legal_entity_id=p_legal_entity_id and a.safe_context->>'branchId'=p_branch_id::text and (not(a.safe_context?'dealerAccountId') or a.safe_context->>'dealerAccountId'=p_dealer_account_id::text))
$$;

create or replace function finance_private.current_actor_can_read_scope(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text)
returns boolean language plpgsql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;v_scope_valid boolean;v_allowed boolean;
begin
 select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;if not found then return false;end if;
 select exists(select 1 from finance.dealer_accounts da join finance.branches b on b.id=p_branch_id and b.legal_entity_id=p_legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id and b.status='ACTIVE' where da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and da.status in('SHADOW','ACTIVE')) into v_scope_valid;if not v_scope_valid then return false;end if;
 v_allowed:=p_operation_id=any(array['listIntegrationErrors','getIntegrationError','listApprovalWorkItems','getApprovalWorkItem','listAuditEvents','getAuditCorrelationTrace']);
 if v_allowed then
  if u.role in('CEO','GENERAL_MANAGER','FINANCE') then return true;end if;
  if u.role='BRANCH_MANAGER' then return exists(select 1 from finance_private.erp_branch_scope_mappings m where m.erp_branch_id=u.branch_id and m.legal_entity_id=p_legal_entity_id and m.dealer_account_id=p_dealer_account_id and m.finance_branch_id=p_branch_id and m.status='ACTIVE' and m.effective_from<=current_date and(m.effective_to is null or current_date<m.effective_to));end if;
  if u.role in('QUALITY_AUDITOR','LEGAL') then return exists(select 1 from finance_private.actor_scope_grants g where g.app_user_id=u.id and g.legal_entity_id=p_legal_entity_id and g.dealer_account_id=p_dealer_account_id and g.finance_branch_id=p_branch_id and g.status='ACTIVE' and g.effective_from<=current_date and(g.effective_to is null or current_date<g.effective_to));end if;
  return false;
 end if;
 return case
  when u.role in('CEO','GENERAL_MANAGER') then p_operation_id=any(array['getSourceEventStatus','getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','listRoyaltyRefunds','listServiceUsages','listDisputes','getDispute','getFinancePeriod','listPayments','getCurrentFranchiseContract','getFranchiseContract','listContractVersions','listContractFeeRules','getContractFeeRule'])
  when u.role='FINANCE' then p_operation_id=any(array['getSourceEventStatus','getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','listRoyaltyRefunds','listServiceUsages','listDisputes','getDispute','getPayment','listPayments','getCurrentFranchiseContract','getFranchiseContract','listContractVersions','listContractFeeRules','getContractFeeRule','getFinancePeriod'])
  when u.role='BRANCH_MANAGER' then p_operation_id=any(array['getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','listRoyaltyRefunds','listServiceUsages','listDisputes','getDispute','getPayment','listPayments','getCurrentFranchiseContract','getFranchiseContract','listContractVersions','listContractFeeRules','getContractFeeRule','getFinancePeriod']) and exists(select 1 from finance_private.erp_branch_scope_mappings m where m.erp_branch_id=u.branch_id and m.legal_entity_id=p_legal_entity_id and m.dealer_account_id=p_dealer_account_id and m.finance_branch_id=p_branch_id and m.status='ACTIVE' and m.effective_from<=current_date and(m.effective_to is null or current_date<m.effective_to))
  when u.role in('QUALITY_AUDITOR','LEGAL') then p_operation_id=any(array['getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','listRoyaltyRefunds','listServiceUsages','listDisputes','getDispute','getPayment','listPayments','getCurrentFranchiseContract','getFranchiseContract','listContractVersions','listContractFeeRules','getContractFeeRule','getFinancePeriod']) and exists(select 1 from finance_private.actor_scope_grants g where g.app_user_id=u.id and g.legal_entity_id=p_legal_entity_id and g.dealer_account_id=p_dealer_account_id and g.finance_branch_id=p_branch_id and g.status='ACTIVE' and g.effective_from<=current_date and(g.effective_to is null or current_date<g.effective_to))
  else false end;
end$$;

revoke all on function finance_private.approval_request_is_in_scope(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.audit_event_is_in_scope(uuid,uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_read_scope(uuid,uuid,uuid,uuid,text) from public,anon,authenticated;
