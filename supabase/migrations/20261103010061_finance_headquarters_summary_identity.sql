-- OTOTR Finance internal review migration.
-- Headquarters aggregation authorization is intentionally separate from branch scope.

create or replace function finance_private.current_actor_can_read_headquarters(
  p_actor_id uuid,p_legal_entity_id uuid,p_operation_id text
) returns boolean language plpgsql stable security definer
set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;
begin
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found or p_operation_id<>'getHeadquartersFinanceSummary' then return false;end if;
  if u.role not in('CEO','GENERAL_MANAGER','FINANCE') then return false;end if;
  return exists(select 1 from finance.legal_entities le where le.id=p_legal_entity_id and le.status='ACTIVE');
end$$;

create or replace function finance_api.authorize_headquarters_scope(
  p_legal_entity_id uuid,p_operation_id text
) returns boolean language sql stable security definer set search_path='' as $$
  select auth.uid() is not null
    and finance_private.current_actor_can_read_headquarters(auth.uid(),p_legal_entity_id,p_operation_id)
$$;

revoke all on function finance_private.current_actor_can_read_headquarters(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_api.authorize_headquarters_scope(uuid,text) from public,anon;
grant execute on function finance_api.authorize_headquarters_scope(uuid,text) to authenticated;
