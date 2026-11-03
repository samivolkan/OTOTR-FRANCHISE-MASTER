-- Safe headquarters summary export; raw financial tables remain inaccessible.

create or replace function finance_private.current_actor_can_read_headquarters(
 p_actor_id uuid,p_legal_entity_id uuid,p_operation_id text
) returns boolean language plpgsql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;
begin
 select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
 if not found or p_operation_id not in(
   'getHeadquartersFinanceSummary','exportHeadquartersFinanceSummary',
   'listPassThroughExpenses','getPassThroughExpense',
   'listFinanceExportPackages','getFinanceExportPackage','getFinanceOperationalHealth'
 )then return false;end if;
 if u.role not in('CEO','GENERAL_MANAGER','FINANCE')then return false;end if;
 return exists(select 1 from finance.legal_entities le where le.id=p_legal_entity_id and le.status='ACTIVE');
end$$;

create or replace function finance_api.export_headquarters_finance_summary(
 p_legal_entity_id uuid,p_as_of date,p_currency_code text
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_summary jsonb;
begin
 if not finance_api.authorize_headquarters_scope(p_legal_entity_id,'exportHeadquartersFinanceSummary')then raise exception using errcode='42501',message='headquarters finance export scope denied';end if;
 if p_as_of is null or p_currency_code!~'^[A-Z]{3}$'then raise exception using errcode='22023',message='valid asOf and currency required';end if;
 v_summary:=finance_api.get_headquarters_finance_summary(p_legal_entity_id,p_as_of,p_currency_code);
 return pg_catalog.jsonb_build_object('schemaVersion',1,'documentType','OTOTR_FINANCE_HEADQUARTERS_SUMMARY_EXPORT','generatedAtUtc',pg_catalog.now(),'legalEntityId',p_legal_entity_id,'asOf',p_as_of,'currency',p_currency_code,'hasData',v_summary is not null,'summary',v_summary,'rawRecordsExposed',false);
end$$;

revoke all on function finance_private.current_actor_can_read_headquarters(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_api.export_headquarters_finance_summary(uuid,date,text) from public,anon;
grant execute on function finance_api.export_headquarters_finance_summary(uuid,date,text) to authenticated;
