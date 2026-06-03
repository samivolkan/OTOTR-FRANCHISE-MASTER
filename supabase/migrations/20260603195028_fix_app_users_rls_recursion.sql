-- OTOTR reviewed RLS fix.
-- Prevent app_users SELECT policy from recursively querying app_users.
-- Role override is resolved through the existing security-definer helper.

drop policy if exists app_users_self_or_hq on public.app_users;

create policy app_users_self_or_hq
on public.app_users
for select
to authenticated
using (
  auth_user_id = auth.uid()
  or public.current_app_user_role() in ('CEO', 'GENERAL_MANAGER', 'QUALITY_AUDITOR')
);
