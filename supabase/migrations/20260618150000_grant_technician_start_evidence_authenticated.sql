-- OTOTR local/live portal intake grant.
-- Allows authenticated branch users to create/update start evidence through RLS.

grant select, insert, update on table public.technician_start_evidence to authenticated;
grant update on table public.expertise_cases to authenticated;
grant update on table public.inspection_tasks to authenticated;
