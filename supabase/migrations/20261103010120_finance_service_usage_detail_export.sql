-- Safe service-usage detail, technical-repeat provenance and bounded export projections.

create or replace function finance_api.get_service_usage_detail(
 p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_source_event_id uuid
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v jsonb;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listServiceUsages') then raise exception using errcode='42501',message='finance scope denied';end if;
 select pg_catalog.jsonb_build_object(
  'sourceEventId',se.id,'usageId',se.event_id,'businessDate',se.business_date,'occurredAtUtc',se.occurred_at_utc,'receivedAtUtc',se.received_at_utc,
  'sourceSystem',se.source_system,'eventType',se.event_type,'sourceStatus',se.status,'schemaVersion',se.schema_version,'aggregateType',se.aggregate_type,'aggregateVersion',se.aggregate_version,
  'feeFamily',case when se.event_type='query.completed'then'QUERY'else'EXTERNAL_SERVICE'end,'serviceCode',se.payload->>'serviceCode','providerCode',se.payload->>'providerCode','externalReference',se.payload->>'externalReference',
  'freeEntitlement',pg_catalog.jsonb_build_object('applied',case when se.payload->>'freeEntitlementApplied'in('true','false')then(se.payload->>'freeEntitlementApplied')::boolean else false end,'policyCode',se.payload->>'freeEntitlementPolicyCode','sequence',case when se.payload->>'freeEntitlementSequence'~'^[0-9]+$'then(se.payload->>'freeEntitlementSequence')::integer else null end),
  'technicalRepeatEvidence',pg_catalog.jsonb_build_object('isTechnicalRepeat',case when se.payload->>'technicalRepeat'in('true','false')then(se.payload->>'technicalRepeat')::boolean else false end,'repeatOfUsageId',case when coalesce(se.payload->>'technicalRepeatOfUsageId','')~'^[0-9a-fA-F-]{36}$'then se.payload->>'technicalRepeatOfUsageId'else null end,'reasonCode',se.payload->>'technicalRepeatReasonCode','evidenceHash',case when coalesce(se.payload->>'technicalRepeatEvidenceHash','')~'^[a-fA-F0-9]{64}$'then pg_catalog.lower(se.payload->>'technicalRepeatEvidenceHash')else null end),
  'providerCost',case when se.payload->>'providerCostAmount'~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$'then pg_catalog.jsonb_build_object('amount',se.payload->>'providerCostAmount','currency',se.payload->>'currency')else null end,
  'charge',pg_catalog.jsonb_build_object('status',case when se.status='REJECTED'or cr.status='FAILED'then'FAILED'when a.id is not null then'CHARGED'else'NOT_CHARGED'end,'dealerPriceAmount',case when a.id is null then null else pg_catalog.abs(a.gross_amount)::text end,'currency',coalesce(a.currency_code,se.payload->>'currency'),'accrualId',a.id),
  'calculation',case when cr.id is null then null else pg_catalog.jsonb_build_object('calculationRunId',cr.id,'status',cr.status,'feeRuleId',cr.contract_fee_rule_id,'feeDefinitionId',cr.fee_definition_id,'financePeriodId',cr.finance_period_id,'inputHash',cr.input_hash,'resultHash',cr.result_hash,'version',cr.version)end,
  'sourcePayloadHash',se.payload_hash,'correlationId',se.correlation_id,'rawPayloadExposed',false
 ) into v
 from finance.source_events se join finance.dealer_accounts da on da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and da.dealer_legal_entity_id=se.dealer_legal_entity_id
 left join lateral(select x.* from finance.calculation_runs x where x.source_event_id=se.id and x.run_type='LIVE'order by x.created_at_utc desc,x.id desc limit 1)cr on true
 left join finance.accruals a on a.calculation_run_id=cr.id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id and a.status='POSTED'
 where se.id=p_source_event_id and se.legal_entity_id=p_legal_entity_id and se.branch_id=p_branch_id and se.event_type in('query.completed','external-service.delivered');
 if v is null then raise exception using errcode='P0002',message='service usage not found';end if;return v;
exception when invalid_text_representation then raise exception using errcode='22023',message='invalid service usage evidence';
end$$;

create or replace function finance_api.export_service_usages(
 p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_from date,p_to date,p_family text,p_charge_status text,p_limit integer
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_limit integer:=least(greatest(coalesce(p_limit,10000),1),10000);v_items jsonb;v_total bigint;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listServiceUsages') then raise exception using errcode='42501',message='finance scope denied';end if;
 if p_from is not null and p_to is not null and p_from>p_to then raise exception using errcode='22023',message='invalid usage date range';end if;
 if p_family is not null and p_family not in('QUERY','EXTERNAL_SERVICE')then raise exception using errcode='22023',message='invalid service family';end if;
 if p_charge_status is not null and p_charge_status not in('CHARGED','NOT_CHARGED','FAILED')then raise exception using errcode='22023',message='invalid charge status';end if;
 with scoped as(
  select se.id source_event_id,se.event_id usage_id,se.business_date,se.occurred_at_utc,se.source_system,se.event_type,se.payload_hash,se.payload,
   case when se.event_type='query.completed'then'QUERY'else'EXTERNAL_SERVICE'end fee_family,a.id accrual_id,pg_catalog.abs(a.gross_amount)dealer_price,a.currency_code,
   case when se.status='REJECTED'or cr.status='FAILED'then'FAILED'when a.id is not null then'CHARGED'else'NOT_CHARGED'end charge_status
  from finance.source_events se join finance.dealer_accounts da on da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and da.dealer_legal_entity_id=se.dealer_legal_entity_id
  left join lateral(select x.* from finance.calculation_runs x where x.source_event_id=se.id and x.run_type='LIVE'order by x.created_at_utc desc,x.id desc limit 1)cr on true
  left join finance.accruals a on a.calculation_run_id=cr.id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id and a.status='POSTED'
  where se.legal_entity_id=p_legal_entity_id and se.branch_id=p_branch_id and se.event_type in('query.completed','external-service.delivered')and(p_from is null or se.business_date>=p_from)and(p_to is null or se.business_date<=p_to)
 ),filtered as(select * from scoped where(p_family is null or fee_family=p_family)and(p_charge_status is null or charge_status=p_charge_status)),page as(select *,pg_catalog.count(*)over()total_count from filtered order by business_date desc,source_event_id desc limit v_limit)
 select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('sourceEventId',source_event_id,'usageId',usage_id,'businessDate',business_date,'occurredAtUtc',occurred_at_utc,'sourceSystem',source_system,'feeFamily',fee_family,'serviceCode',payload->>'serviceCode','providerCode',payload->>'providerCode','externalReference',payload->>'externalReference','chargeStatus',charge_status,'freeEntitlementApplied',case when payload->>'freeEntitlementApplied'in('true','false')then(payload->>'freeEntitlementApplied')::boolean else false end,'technicalRepeat',case when payload->>'technicalRepeat'in('true','false')then(payload->>'technicalRepeat')::boolean else false end,'technicalRepeatEvidenceHash',case when coalesce(payload->>'technicalRepeatEvidenceHash','')~'^[a-fA-F0-9]{64}$'then pg_catalog.lower(payload->>'technicalRepeatEvidenceHash')else null end,'providerCostAmount',case when payload->>'providerCostAmount'~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$'then payload->>'providerCostAmount'else null end,'dealerPriceAmount',dealer_price::text,'currency',coalesce(currency_code,payload->>'currency'),'accrualId',accrual_id,'sourcePayloadHash',payload_hash)order by business_date desc,source_event_id desc),'[]'::jsonb),coalesce(pg_catalog.max(total_count),0)into v_items,v_total from page;
 return pg_catalog.jsonb_build_object('schemaVersion',1,'documentType','OTOTR_FINANCE_SERVICE_USAGE_EXPORT','generatedAtUtc',pg_catalog.now(),'scope',pg_catalog.jsonb_build_object('legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id),'filters',pg_catalog.jsonb_build_object('from',p_from,'to',p_to,'family',p_family,'chargeStatus',p_charge_status),'rowCount',pg_catalog.jsonb_array_length(v_items),'totalMatchingCount',v_total,'truncated',v_total>v_limit,'rawPayloadExposed',false,'items',v_items);
end$$;

revoke all on function finance_api.get_service_usage_detail(uuid,uuid,uuid,uuid) from public,anon;
revoke all on function finance_api.export_service_usages(uuid,uuid,uuid,date,date,text,text,integer) from public,anon;
grant execute on function finance_api.get_service_usage_detail(uuid,uuid,uuid,uuid) to authenticated;
grant execute on function finance_api.export_service_usages(uuid,uuid,uuid,date,date,text,text,integer) to authenticated;
