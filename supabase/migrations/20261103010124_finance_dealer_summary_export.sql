-- Safe dealer finance summary export reusing the existing branch-scope authorization.

create or replace function finance_api.export_dealer_finance_summary(
 p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_as_of date
)returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_summary jsonb;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDealerFinanceSummary')then raise exception using errcode='42501',message='dealer finance export scope denied';end if;
 if p_as_of is null then raise exception using errcode='22023',message='valid asOf required';end if;
 v_summary:=finance_api.get_dealer_finance_summary(p_legal_entity_id,p_dealer_account_id,p_branch_id,p_as_of);
 return pg_catalog.jsonb_build_object(
  'schemaVersion',1,'documentType','OTOTR_FINANCE_DEALER_SUMMARY_EXPORT','generatedAtUtc',pg_catalog.now(),
  'legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,
  'asOf',p_as_of,'currency',coalesce(v_summary->>'currencyCode','TRY'),'hasData',v_summary is not null,
  'summary',v_summary,'rawRecordsExposed',false
 );
end$$;

revoke all on function finance_api.export_dealer_finance_summary(uuid,uuid,uuid,date)from public,anon;
grant execute on function finance_api.export_dealer_finance_summary(uuid,uuid,uuid,date)to authenticated;
