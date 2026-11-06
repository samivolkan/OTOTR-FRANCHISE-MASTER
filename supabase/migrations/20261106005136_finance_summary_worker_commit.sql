create or replace function finance_private.current_summary_projection_worker_is_trusted()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(auth.role() = 'service_role', false)
$$;

revoke all on function finance_private.current_summary_projection_worker_is_trusted() from public, anon, authenticated;
revoke all on function finance_api.commit_dealer_finance_summary_snapshot(uuid,uuid,uuid,uuid,date,text,text,jsonb,jsonb,text,uuid) from public, anon, authenticated;
grant execute on function finance_api.commit_dealer_finance_summary_snapshot(uuid,uuid,uuid,uuid,date,text,text,jsonb,jsonb,text,uuid) to service_role;
