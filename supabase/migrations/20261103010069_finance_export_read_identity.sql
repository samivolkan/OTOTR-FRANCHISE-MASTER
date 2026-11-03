-- OTOTR Finance internal review migration.
-- Billing and accounting export package visibility is headquarters-only.

create or replace function finance_private.current_actor_can_read_headquarters(
  p_actor_id uuid,p_legal_entity_id uuid,p_operation_id text
) returns boolean language plpgsql stable security definer
set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;
begin
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found or p_operation_id not in('getHeadquartersFinanceSummary','listPassThroughExpenses','getPassThroughExpense','listFinanceExportPackages','getFinanceExportPackage') then return false;end if;
  if u.role not in('CEO','GENERAL_MANAGER','FINANCE') then return false;end if;
  return exists(select 1 from finance.legal_entities le where le.id=p_legal_entity_id and le.status='ACTIVE');
end$$;

revoke all on function finance_private.current_actor_can_read_headquarters(uuid,uuid,text) from public,anon,authenticated;
