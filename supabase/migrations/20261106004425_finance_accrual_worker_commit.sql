create or replace function finance_private.current_accrual_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$
  select coalesce(auth.role() = 'service_role', false)
$$;

revoke all on function finance_private.current_accrual_worker_is_trusted() from public, anon, authenticated;
revoke all on function finance_api.commit_accrual_calculation(uuid,jsonb,jsonb,jsonb,jsonb,date,text,text,jsonb) from public, anon, authenticated;
grant execute on function finance_api.commit_accrual_calculation(uuid,jsonb,jsonb,jsonb,jsonb,date,text,text,jsonb) to service_role;
