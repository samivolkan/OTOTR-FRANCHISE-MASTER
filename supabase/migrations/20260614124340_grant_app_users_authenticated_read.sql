-- Expose mobile session lookup and work-order reads through the Supabase Data API.
-- Row visibility is still controlled by each table's RLS policies.
grant select on table public.app_users to authenticated;
grant select on table public.customers to authenticated;
grant select on table public.vehicles to authenticated;
grant select on table public.package_plans to authenticated;
grant select on table public.expertise_cases to authenticated;
grant select on table public.inspection_tasks to authenticated;
