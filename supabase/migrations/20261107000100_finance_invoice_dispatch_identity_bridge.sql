-- Bind invoice dispatch to the existing ERP application identity.
-- Only active headquarters finance roles may accept an invoice provider result.

create or replace function finance_private.current_actor_can_dispatch_invoice(
  p_actor_id uuid,p_legal_entity_id uuid,p_branch_id uuid
) returns boolean
language sql stable security definer
set search_path to 'pg_catalog','public','finance'
as $$
  select exists(
    select 1
    from public.app_users u
    join finance.branches b
      on b.id=p_branch_id
     and b.legal_entity_id=p_legal_entity_id
     and b.status='ACTIVE'
    where u.auth_user_id=p_actor_id
      and u.is_active
      and u.role in('CEO','GENERAL_MANAGER','FINANCE')
  )
$$;

revoke all on function finance_private.current_actor_can_dispatch_invoice(uuid,uuid,uuid)
  from public,anon,authenticated;

