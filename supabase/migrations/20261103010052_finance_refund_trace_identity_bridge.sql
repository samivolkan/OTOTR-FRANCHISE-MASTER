-- OTOTR Finance forward-only security correction.
-- The refund trace read RPC originally used a fail-closed candidate hook that was
-- not connected to the reviewed ERP identity bridge. Delegate to the canonical
-- scope authorizer and keep the helper itself unavailable to browser roles.

create or replace function finance_api.authorize_refund_trace_scope(
  p_legal_entity_id uuid,
  p_dealer_account_id uuid,
  p_branch_id uuid,
  p_permission text
) returns boolean
language sql stable security definer
set search_path=pg_catalog,finance_api
as $$
  select p_permission='finance.accruals.read'
     and finance_api.authorize_scope(
       p_legal_entity_id,
       p_dealer_account_id,
       p_branch_id,
       'getRoyaltyRefundTrace'
     )
$$;

revoke all on function finance_api.authorize_refund_trace_scope(uuid,uuid,uuid,text)
  from public,anon,authenticated;
grant execute on function finance_api.get_royalty_refund_trace(uuid,uuid,uuid,uuid)
  to authenticated;
