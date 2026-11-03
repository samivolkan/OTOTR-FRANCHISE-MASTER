-- Safe, branch-scoped contract version timeline for ERP governance review.
create or replace function finance_api.list_contract_versions(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_contract_id uuid,p_cursor uuid default null,p_limit integer default 50) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare c finance.franchise_contracts%rowtype;v_cursor_no integer;v_limit integer:=coalesce(p_limit,50);v_rows jsonb;v_count integer;v_next uuid;
begin
 if v_limit<1 or v_limit>200 then raise exception using errcode='22023',message='page size out of range';end if;
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listContractVersions') then raise exception using errcode='42501',message='finance scope denied';end if;
 select fc.* into c from finance.franchise_contracts fc join finance.dealer_accounts da on da.legal_entity_id=fc.legal_entity_id and da.dealer_legal_entity_id=fc.dealer_legal_entity_id join finance.branches b on b.legal_entity_id=fc.legal_entity_id and b.dealer_legal_entity_id=fc.dealer_legal_entity_id where fc.id=p_contract_id and fc.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and b.id=p_branch_id;
 if not found then return null;end if;
 if p_cursor is not null then select cv.version_no into v_cursor_no from finance.contract_versions cv where cv.id=p_cursor and cv.contract_id=c.id;if not found then raise exception using errcode='22023',message='contract version cursor invalid';end if;end if;
 with page as(select cv.* from finance.contract_versions cv where cv.contract_id=c.id and (p_cursor is null or (cv.version_no,cv.id)<(v_cursor_no,p_cursor)) order by cv.version_no desc,cv.id desc limit v_limit+1),projected as(
  select row_number()over(order by cv.version_no desc,cv.id desc)rn,cv.id,jsonb_build_object('versionId',cv.id,'contractId',cv.contract_id,'versionNo',cv.version_no,'status',cv.status,'validFrom',cv.effective_from,'validTo',cv.effective_to,'currencyCode',cv.currency_code,'contentHash',cv.content_hash,'preparedBy',cv.prepared_by,'approvedBy',cv.approved_by,'approvedAtUtc',cv.approved_at_utc,'createdAtUtc',cv.created_at_utc,'version',cv.version,'ruleCount',(select count(*) from finance.contract_fee_rules r where r.contract_version_id=cv.id),'configuredRuleCount',(select count(*) from finance.contract_fee_rules r where r.contract_version_id=cv.id and r.configuration_status='CONFIGURED'),'exceptionCount',(select count(*) from finance.rule_exceptions e join finance.contract_fee_rules r on r.id=e.contract_fee_rule_id where r.contract_version_id=cv.id),'rawEvidenceExposed',false)item from page cv)
 select coalesce(jsonb_agg(item order by rn)filter(where rn<=v_limit),'[]'::jsonb),count(*),(array_agg(id order by rn)filter(where rn=v_limit))[1] into v_rows,v_count,v_next from projected;
 if v_count<=v_limit then v_next:=null;end if;
 return jsonb_build_object('contractId',c.id,'items',v_rows,'nextCursor',v_next,'hasMore',v_count>v_limit,'rawDefinitionsExposed',false);
end$$;
revoke all on function finance_api.list_contract_versions(uuid,uuid,uuid,uuid,uuid,integer) from public,anon;
grant execute on function finance_api.list_contract_versions(uuid,uuid,uuid,uuid,uuid,integer) to authenticated;
