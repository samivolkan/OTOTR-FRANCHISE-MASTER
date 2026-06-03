-- OTOTR reviewed security hardening.
-- Keep audit_report_child_mutation as a trigger-only function.
-- It should not be directly callable through exposed API roles.

revoke all on function public.audit_report_child_mutation() from public;
revoke all on function public.audit_report_child_mutation() from anon;
revoke all on function public.audit_report_child_mutation() from authenticated;
