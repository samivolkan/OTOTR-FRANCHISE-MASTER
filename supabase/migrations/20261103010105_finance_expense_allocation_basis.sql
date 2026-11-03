-- Authorized target-basis input and write-free preview for expense allocation.

create or replace function finance_private.resolve_approved_expense_allocation_context(p_expense_id uuid,p_distribution_method text,p_distribution_rule_reference text)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance as $$
  select jsonb_build_object('allowed',true,'distributionMethod',p_distribution_method,'distributionRuleReference',p_distribution_rule_reference,'policyVersion','ERP_TARGET_BASIS_V1','targets',
    (select jsonb_agg(jsonb_build_object('dealerAccountId',s->>'dealerAccountId','branchId',s->>'branchId','basisValue',case when p_distribution_method='EQUAL' then '1.00000000' else s->>'basisValue' end) order by s->>'dealerAccountId',s->>'branchId') from jsonb_array_elements(e.allocation_policy->'targetScopes') s))
  from finance.pass_through_expenses e where e.id=p_expense_id and e.status in('DRAFT','CALCULATED')
$$;

create or replace function finance_api.preview_expense_share_calculation(p_expense_id uuid,p_distribution_method text,p_distribution_rule_reference text,p_target_basis jsonb)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private as $$
declare e finance.pass_through_expenses%rowtype;v_count integer;v_total numeric;v_items jsonb;
begin
  if auth.uid() is null or not finance_private.current_actor_can_manage_expense(auth.uid(),p_expense_id,'CALCULATE') then raise exception using errcode='42501',message='expense calculation scope denied';end if;
  select * into e from finance.pass_through_expenses where id=p_expense_id;if not found then return null;end if;
  if p_distribution_method not in('EQUAL','FIXED','QUANTITY') or length(btrim(coalesce(p_distribution_rule_reference,''))) not between 1 and 200 or jsonb_typeof(p_target_basis)<>'array' then raise exception using errcode='22023',message='invalid expense allocation preview';end if;
  if jsonb_array_length(p_target_basis)<>jsonb_array_length(e.allocation_policy->'targetScopes') or exists(select 1 from jsonb_array_elements(p_target_basis)t where (select array_agg(k order by k)from jsonb_object_keys(t)k)is distinct from array['basisValue','branchId','dealerAccountId']::text[] or coalesce(t->>'basisValue','')!~'^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$' or not exists(select 1 from jsonb_array_elements(e.allocation_policy->'targetScopes')s where s->>'dealerAccountId'=t->>'dealerAccountId' and s->>'branchId'=t->>'branchId')) then raise exception using errcode='22023',message='invalid expense allocation targets';end if;
  select count(*),sum(case when p_distribution_method='EQUAL' then 1 else (t->>'basisValue')::numeric end) into v_count,v_total from jsonb_array_elements(p_target_basis)t;
  if v_count<>(select count(*)from(select distinct t->>'dealerAccountId',t->>'branchId' from jsonb_array_elements(p_target_basis)t)q) or v_total<=0 or (p_distribution_method='FIXED' and (select sum((t->>'basisValue')::numeric)from jsonb_array_elements(p_target_basis)t)<>e.distributable_amount) or (p_distribution_method='QUANTITY' and exists(select 1 from jsonb_array_elements(p_target_basis)t where (t->>'basisValue')::numeric<=0)) then raise exception using errcode='23514',message='expense allocation basis control failed';end if;
  with targets as(select t->>'dealerAccountId' dealer_id,t->>'branchId' branch_id,(t->>'basisValue')::numeric basis_value,case when p_distribution_method='EQUAL'then 1 else(t->>'basisValue')::numeric end weight from jsonb_array_elements(p_target_basis)t),weighted as(select *,sum(weight)over()total_weight from targets)
  select jsonb_agg(jsonb_build_object('dealerAccountId',dealer_id,'branchId',branch_id,'basisValue',basis_value::text,'allocationRate',round(weight/total_weight,8)::text,'netAmount',round(e.distributable_net_amount*weight/total_weight,8)::text,'taxAmount',round(e.distributable_tax_amount*weight/total_weight,8)::text,'grossAmount',round(e.distributable_amount*weight/total_weight,8)::text)order by dealer_id,branch_id) into v_items from weighted;
  return jsonb_build_object('expenseId',e.id,'method',p_distribution_method,'ruleReference',p_distribution_rule_reference,'currency',e.currency_code,'controlGross',e.distributable_amount::text,'targetCount',v_count,'items',v_items,'writePerformed',false);
end$$;

create or replace function finance_api.commit_expense_share_calculation_with_basis(p_actor_id uuid,p_expense_id uuid,p_distribution_method text,p_distribution_rule_reference text,p_target_basis jsonb,p_expected_version bigint,p_idempotency_key text,p_input_hash text,p_correlation_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_api,finance_private as $$
declare e finance.pass_through_expenses%rowtype;v_preview jsonb;
begin
  if not finance_private.current_expense_share_calculator_is_trusted() then raise exception using errcode='42501',message='trusted expense share calculator required';end if;
  select * into e from finance.pass_through_expenses where id=p_expense_id for update;if not found then raise exception using errcode='P0002',message='expense not found';end if;
  if e.version<>p_expected_version or e.prepared_by<>p_actor_id then return jsonb_build_object('outcome','CONFLICT');end if;
  perform set_config('request.jwt.claim.sub',p_actor_id::text,true);v_preview:=finance_api.preview_expense_share_calculation(p_expense_id,p_distribution_method,p_distribution_rule_reference,p_target_basis);
  update finance.pass_through_expenses set allocation_policy=jsonb_set(allocation_policy,'{targetScopes}',p_target_basis,true) where id=p_expense_id and version=p_expected_version;
  return finance_api.commit_expense_share_calculation(p_actor_id,p_expense_id,p_distribution_method,p_distribution_rule_reference,p_expected_version,p_idempotency_key,p_input_hash,p_correlation_id)||jsonb_build_object('previewControlGross',v_preview->>'controlGross');
end$$;

revoke all on function finance_private.resolve_approved_expense_allocation_context(uuid,text,text) from public,anon,authenticated;
revoke all on function finance_api.preview_expense_share_calculation(uuid,text,text,jsonb) from public,anon;grant execute on function finance_api.preview_expense_share_calculation(uuid,text,text,jsonb) to authenticated;
revoke all on function finance_api.commit_expense_share_calculation_with_basis(uuid,uuid,text,text,jsonb,bigint,text,text,uuid) from public,anon,authenticated;grant execute on function finance_api.commit_expense_share_calculation_with_basis(uuid,uuid,text,text,jsonb,bigint,text,text,uuid) to service_role;
