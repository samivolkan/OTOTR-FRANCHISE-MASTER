-- Headquarters-only operational health projection for GM Finance monitoring.

create or replace function finance_private.current_actor_can_read_headquarters(
  p_actor_id uuid,p_legal_entity_id uuid,p_operation_id text
) returns boolean language plpgsql stable security definer
set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;
begin
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found or p_operation_id not in(
    'getHeadquartersFinanceSummary','listPassThroughExpenses','getPassThroughExpense',
    'listFinanceExportPackages','getFinanceExportPackage','getFinanceOperationalHealth'
  ) then return false;end if;
  if u.role not in('CEO','GENERAL_MANAGER','FINANCE') then return false;end if;
  return exists(select 1 from finance.legal_entities le where le.id=p_legal_entity_id and le.status='ACTIVE');
end$$;

create or replace function finance_api.get_finance_operational_health(p_legal_entity_id uuid)
returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare
  v_pending bigint;v_failed bigint;v_dead bigint;v_oldest_seconds bigint;
  v_open bigint;v_retry bigint;v_integrity jsonb;v_status text;
begin
  if not finance_api.authorize_headquarters_scope(p_legal_entity_id,'getFinanceOperationalHealth') then
    raise exception using errcode='42501',message='finance headquarters scope denied';
  end if;
  select
    count(*) filter(where status='PENDING'),
    count(*) filter(where status='FAILED'),
    count(*) filter(where status='DEAD_LETTER'),
    coalesce(floor(extract(epoch from(pg_catalog.clock_timestamp()-min(created_at_utc)filter(where status='PENDING'))))::bigint,0)
  into v_pending,v_failed,v_dead,v_oldest_seconds
  from finance.outbox_messages where legal_entity_id=p_legal_entity_id;
  select count(*)filter(where status='OPEN'),count(*)filter(where status='RETRY_SCHEDULED')
  into v_open,v_retry from finance.integration_errors where legal_entity_id=p_legal_entity_id;
  v_integrity:=finance_private.verify_audit_integrity_v2(p_legal_entity_id);
  v_status:=case
    when coalesce((v_integrity->>'valid')::boolean,false)=false or v_dead>0 then 'CRITICAL'
    when v_failed>0 or v_open>0 or v_oldest_seconds>=300 then 'DEGRADED'
    else 'HEALTHY'
  end;
  return pg_catalog.jsonb_build_object(
    'status',v_status,'generatedAtUtc',pg_catalog.clock_timestamp(),
    'outbox',pg_catalog.jsonb_build_object('pending',v_pending,'failed',v_failed,'deadLetter',v_dead,'oldestPendingAgeSeconds',v_oldest_seconds),
    'integrationErrors',pg_catalog.jsonb_build_object('open',v_open,'retryScheduled',v_retry),
    'auditIntegrity',pg_catalog.jsonb_build_object(
      'valid',coalesce((v_integrity->>'valid')::boolean,false),
      'checkedEventCount',coalesce((v_integrity->>'checkedEventCount')::integer,0),
      'invalidEventCount',coalesce((v_integrity->>'invalidEventCount')::integer,0),
      'version',v_integrity->>'version'
    ),
    'rawPayloadExposed',false
  );
end$$;

revoke all on function finance_private.current_actor_can_read_headquarters(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_api.get_finance_operational_health(uuid) from public,anon;
grant execute on function finance_api.get_finance_operational_health(uuid) to authenticated;
