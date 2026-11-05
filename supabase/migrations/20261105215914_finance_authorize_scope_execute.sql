-- The authenticated finance Edge reader checks the caller scope through this RPC.
grant execute on function finance_api.authorize_scope(uuid, uuid, uuid, text) to authenticated;
