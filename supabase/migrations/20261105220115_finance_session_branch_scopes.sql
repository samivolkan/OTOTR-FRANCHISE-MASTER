-- Discover only the finance scopes the current ERP session can read.
create function finance_api.list_session_branch_scopes()
returns table (
  legal_entity_id uuid,
  dealer_account_id uuid,
  branch_id uuid,
  branch_code text
)
language sql stable security definer
set search_path = ''
as $$
  select b.legal_entity_id, a.id, b.id, b.branch_code::text
  from finance.branches b
  join finance.dealer_accounts a
    on a.legal_entity_id = b.legal_entity_id
   and a.dealer_legal_entity_id = b.dealer_legal_entity_id
  where auth.uid() is not null
    and b.status = 'ACTIVE'
    and a.status in ('SHADOW', 'ACTIVE')
    and finance_api.authorize_scope(
      b.legal_entity_id, a.id, b.id, 'getDealerFinanceSummary'
    )
  order by b.branch_code, b.id, a.id;
$$;

revoke all on function finance_api.list_session_branch_scopes() from public, anon;
grant execute on function finance_api.list_session_branch_scopes() to authenticated;
