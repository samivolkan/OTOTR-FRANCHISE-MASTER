-- OTOTR Finance internal review migration.
-- Current franchise contract discovery and contract fee-rule list projections.
-- Local replay required before any staging promotion.

create or replace function finance_api.get_current_franchise_contract(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_as_of date
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api as $$
declare v_contract record;v_contract_count integer;v_active record;v_active_count integer;v_draft record;
begin
  if p_as_of is null then raise exception using errcode='22023',message='contract as-of date required';end if;
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getCurrentFranchiseContract') then raise exception using errcode='42501',message='finance scope denied';end if;
  select pg_catalog.count(*) into v_contract_count
    from finance.franchise_contracts fc
    join finance.dealer_accounts da on da.legal_entity_id=fc.legal_entity_id and da.dealer_legal_entity_id=fc.dealer_legal_entity_id
    join finance.branches b on b.legal_entity_id=fc.legal_entity_id and b.dealer_legal_entity_id=fc.dealer_legal_entity_id
   where fc.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and b.id=p_branch_id
     and fc.status in('DRAFT','ACTIVE','SUSPENDED');
  if v_contract_count=0 then return null;end if;
  if v_contract_count>1 then raise exception using errcode='23514',message='current franchise contract projection is ambiguous';end if;
  select fc.* into v_contract
    from finance.franchise_contracts fc
    join finance.dealer_accounts da on da.legal_entity_id=fc.legal_entity_id and da.dealer_legal_entity_id=fc.dealer_legal_entity_id
    join finance.branches b on b.legal_entity_id=fc.legal_entity_id and b.dealer_legal_entity_id=fc.dealer_legal_entity_id
   where fc.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and b.id=p_branch_id
     and fc.status in('DRAFT','ACTIVE','SUSPENDED');
  select pg_catalog.count(*) into v_active_count from finance.contract_versions cv
   where cv.contract_id=v_contract.id and cv.status='ACTIVE' and cv.effective_from<=p_as_of and (cv.effective_to is null or p_as_of<cv.effective_to);
  if v_active_count>1 then raise exception using errcode='23514',message='current contract version projection is ambiguous';end if;
  select cv.* into v_active from finance.contract_versions cv
   where cv.contract_id=v_contract.id and cv.status='ACTIVE' and cv.effective_from<=p_as_of and (cv.effective_to is null or p_as_of<cv.effective_to)
   order by cv.version_no desc,cv.id desc limit 1;
  select cv.* into v_draft from finance.contract_versions cv
   where cv.contract_id=v_contract.id and cv.status in('DRAFT','PENDING_APPROVAL','APPROVED')
   order by cv.version_no desc,cv.id desc limit 1;
  return pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
    'contractId',v_contract.id,'contractCode',v_contract.contract_code,'status',v_contract.status,'version',v_contract.version,
    'activeVersion',case when v_active.id is null then null else pg_catalog.jsonb_build_object('versionId',v_active.id,'versionNo',v_active.version_no,'status',v_active.status,'validFrom',v_active.effective_from,'validTo',v_active.effective_to,'currencyCode',v_active.currency_code,'contentHash',v_active.content_hash,'version',v_active.version) end,
    'pendingVersion',case when v_draft.id is null then null else pg_catalog.jsonb_build_object('versionId',v_draft.id,'versionNo',v_draft.version_no,'status',v_draft.status,'validFrom',v_draft.effective_from,'validTo',v_draft.effective_to,'currencyCode',v_draft.currency_code,'contentHash',v_draft.content_hash,'version',v_draft.version) end
  ));
end$$;

create or replace function finance_api.list_contract_fee_rules(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_contract_version_id uuid,
  p_status text,p_cursor uuid default null,p_limit integer default 50
) returns jsonb language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api as $$
declare v_limit integer:=coalesce(p_limit,50);v_cursor_priority integer;v_cursor_code text;v_items jsonb;v_count integer;v_next uuid;
begin
  if v_limit<1 or v_limit>200 then raise exception using errcode='22023',message='page size out of range';end if;
  if p_status is not null and p_status not in('DRAFT','PENDING_APPROVAL','APPROVED','ACTIVE','SUPERSEDED','DISABLED') then raise exception using errcode='22023',message='fee rule status invalid';end if;
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listContractFeeRules') then raise exception using errcode='42501',message='finance scope denied';end if;
  if not exists(
    select 1 from finance.contract_versions cv join finance.franchise_contracts fc on fc.id=cv.contract_id
    join finance.dealer_accounts da on da.legal_entity_id=fc.legal_entity_id and da.dealer_legal_entity_id=fc.dealer_legal_entity_id
    join finance.branches b on b.legal_entity_id=fc.legal_entity_id and b.dealer_legal_entity_id=fc.dealer_legal_entity_id
    where cv.id=p_contract_version_id and fc.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and b.id=p_branch_id
  ) then return null;end if;
  if p_cursor is not null then
    select r.priority,r.rule_code into v_cursor_priority,v_cursor_code from finance.contract_fee_rules r where r.id=p_cursor and r.contract_version_id=p_contract_version_id;
    if not found then raise exception using errcode='22023',message='fee rule cursor invalid';end if;
  end if;
  with page as (
    select r.*,fd.code fee_code,fd.name fee_name,fd.fee_family
      from finance.contract_fee_rules r join finance.fee_definitions fd on fd.id=r.fee_definition_id
     where r.contract_version_id=p_contract_version_id and (p_status is null or r.status=p_status)
       and (p_cursor is null or (r.priority,r.rule_code,r.id)<(v_cursor_priority,v_cursor_code,p_cursor))
     order by r.priority desc,r.rule_code desc,r.id desc limit v_limit+1
  ), projected as (
    select pg_catalog.row_number() over(order by priority desc,rule_code desc,id desc) rn,id,
      pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
        'feeRuleId',id,'feeDefinitionId',fee_definition_id,'feeCode',fee_code,'name',fee_name,'category',fee_family,
        'ruleCode',rule_code,'priority',priority,'status',status,'configurationStatus',configuration_status,
        'triggerEventType',trigger_event_type,'basis',basis_definition,
        'calculation',case when calculation_method is null then null else coalesce(calculation_parameters,'{}'::jsonb)||pg_catalog.jsonb_build_object('method',calculation_method,'currency',currency_code,'priceIncludesTax',price_includes_tax,'minimumAmount',minimum_amount,'maximumAmount',maximum_amount,'decimalScale',decimal_scale,'roundingMode',rounding_mode) end,
        'version',version
      )) item from page
  )
  select coalesce(pg_catalog.jsonb_agg(item order by rn) filter(where rn<=v_limit),'[]'::jsonb),pg_catalog.count(*),(pg_catalog.array_agg(id order by rn) filter(where rn=v_limit))[1]
    into v_items,v_count,v_next from projected;
  if v_count<=v_limit then v_next:=null;end if;
  return pg_catalog.jsonb_build_object('items',v_items,'nextCursor',v_next,'hasMore',v_count>v_limit);
end$$;

revoke all on function finance_api.get_current_franchise_contract(uuid,uuid,uuid,date) from public,anon;
revoke all on function finance_api.list_contract_fee_rules(uuid,uuid,uuid,uuid,text,uuid,integer) from public,anon;
grant execute on function finance_api.get_current_franchise_contract(uuid,uuid,uuid,date) to authenticated;
grant execute on function finance_api.list_contract_fee_rules(uuid,uuid,uuid,uuid,text,uuid,integer) to authenticated;
