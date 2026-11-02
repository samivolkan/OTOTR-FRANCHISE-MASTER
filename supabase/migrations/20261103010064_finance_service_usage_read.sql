-- OTOTR Finance internal review migration.
-- Source-event-first projection keeps free entitlements and technical repeats visible.

create or replace function finance_api.list_service_usages(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_from date,p_to date,p_family text,p_charge_status text,p_cursor text,p_limit integer
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api as $$
declare v_limit integer:=least(greatest(coalesce(p_limit,50),1),200);v_cursor_text text;v_cursor_date date;v_cursor_id uuid;v_items jsonb;v_has_more boolean;v_next text;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listServiceUsages') then raise exception using errcode='42501',message='finance scope denied';end if;
  if p_from is not null and p_to is not null and p_from>p_to then raise exception using errcode='22023',message='invalid usage date range';end if;
  if p_family is not null and p_family not in('QUERY','EXTERNAL_SERVICE') then raise exception using errcode='22023',message='invalid service family';end if;
  if p_charge_status is not null and p_charge_status not in('CHARGED','NOT_CHARGED','FAILED') then raise exception using errcode='22023',message='invalid charge status';end if;
  if p_cursor is not null then begin v_cursor_text:=pg_catalog.convert_from(pg_catalog.decode(p_cursor,'base64'),'UTF8');if v_cursor_text!~'^\d{4}-\d{2}-\d{2}\|[0-9a-fA-F-]{36}$' then raise exception using errcode='22023',message='invalid usage cursor';end if;v_cursor_date:=pg_catalog.split_part(v_cursor_text,'|',1)::date;v_cursor_id:=pg_catalog.split_part(v_cursor_text,'|',2)::uuid;exception when others then raise exception using errcode='22023',message='invalid usage cursor';end;end if;
  with scoped as (
    select se.id source_event_id,se.event_id usage_id,se.business_date,se.occurred_at_utc,se.source_system,se.event_type,se.status source_status,se.payload,
      case when se.event_type='query.completed' then 'QUERY' else 'EXTERNAL_SERVICE' end fee_family,
      a.id accrual_id,a.gross_amount dealer_price,a.currency_code accrual_currency,cr.status calculation_status,
      case when se.status='REJECTED' or cr.status='FAILED' then 'FAILED' when a.id is not null then 'CHARGED' else 'NOT_CHARGED' end charge_status
    from finance.source_events se
    join finance.dealer_accounts da on da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and da.dealer_legal_entity_id=se.dealer_legal_entity_id
    left join lateral(select x.* from finance.calculation_runs x join finance.fee_definitions fd on fd.id=x.fee_definition_id and fd.fee_family=case when se.event_type='query.completed' then 'QUERY' else 'EXTERNAL_SERVICE' end where x.source_event_id=se.id and x.run_type='LIVE' order by x.created_at_utc desc,x.id desc limit 1) cr on true
    left join finance.accruals a on a.calculation_run_id=cr.id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id and a.status='POSTED'
    where se.legal_entity_id=p_legal_entity_id and se.branch_id=p_branch_id and se.event_type in('query.completed','external-service.delivered')
      and (p_from is null or se.business_date>=p_from) and (p_to is null or se.business_date<=p_to)
      and (p_family is null or (case when se.event_type='query.completed' then 'QUERY' else 'EXTERNAL_SERVICE' end)=p_family)
      and (v_cursor_date is null or (se.business_date,se.id)<(v_cursor_date,v_cursor_id))
  ), filtered as(select * from scoped where p_charge_status is null or charge_status=p_charge_status),
  page as(select * from filtered order by business_date desc,source_event_id desc limit v_limit+1),visible as(select * from page order by business_date desc,source_event_id desc limit v_limit),
  projected as(select source_event_id,business_date,pg_catalog.jsonb_build_object(
    'sourceEventId',source_event_id,'usageId',usage_id,'businessDate',business_date,'occurredAtUtc',occurred_at_utc,
    'sourceSystem',source_system,'eventType',event_type,'feeFamily',fee_family,'serviceCode',payload->>'serviceCode',
    'providerCode',payload->>'providerCode','externalReference',payload->>'externalReference','chargeStatus',charge_status,
    'freeEntitlementApplied',case when payload->>'freeEntitlementApplied' in('true','false') then (payload->>'freeEntitlementApplied')::boolean else false end,
    'technicalRepeat',case when payload->>'technicalRepeat' in('true','false') then (payload->>'technicalRepeat')::boolean else false end,
    'providerCostAmount',case when payload->>'providerCostAmount'~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then payload->>'providerCostAmount' else null end,
    'dealerPriceAmount',case when dealer_price is null then null else pg_catalog.abs(dealer_price)::text end,
    'marginAmount',case when dealer_price is not null and payload->>'providerCostAmount'~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' then (pg_catalog.abs(dealer_price)-(payload->>'providerCostAmount')::numeric)::text else null end,
    'currency',coalesce(accrual_currency,payload->>'currency'),'accrualId',accrual_id,'calculationStatus',calculation_status
  ) item from visible)
  select coalesce(pg_catalog.jsonb_agg(item order by business_date desc,source_event_id desc),'[]'::jsonb),(select pg_catalog.count(*)>v_limit from page),case when(select pg_catalog.count(*)>v_limit from page) then(select pg_catalog.encode(pg_catalog.convert_to(business_date::text||'|'||source_event_id::text,'UTF8'),'base64') from visible order by business_date,source_event_id limit 1) else null end into v_items,v_has_more,v_next from projected;
  return pg_catalog.jsonb_build_object('items',v_items,'nextCursor',v_next,'hasMore',v_has_more);
end$$;

revoke all on function finance_api.list_service_usages(uuid,uuid,uuid,date,date,text,text,text,integer) from public,anon;
grant execute on function finance_api.list_service_usages(uuid,uuid,uuid,date,date,text,text,text,integer) to authenticated;
