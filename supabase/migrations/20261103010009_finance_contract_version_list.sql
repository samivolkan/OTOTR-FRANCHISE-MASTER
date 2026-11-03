-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-contract-version-list-rpc.sql
-- Source SHA256: 248C1806AC6BAD50F335C9A39C44F9B94E69A34E8CA1C6AB68045E81481E2F15
-- Local replay required before any staging promotion.
-- OTOTR CONTRACT VERSION LIST RPC CANDIDATE
create or replace function finance_api.list_contract_versions(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_contract_id uuid,p_cursor uuid default null,p_limit integer default 50) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare c finance.franchise_contracts%rowtype;v_cursor_no integer;v_limit integer:=coalesce(p_limit,50);v_rows jsonb;v_count integer;v_next uuid;
begin
 if v_limit<1 or v_limit>200 then raise exception using errcode='22023',message='page size out of range';end if;
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listContractVersions') then raise exception using errcode='42501',message='finance scope denied';end if;
 select fc.* into c from finance.franchise_contracts fc join finance.dealer_accounts da on da.legal_entity_id=fc.legal_entity_id and da.dealer_legal_entity_id=fc.dealer_legal_entity_id join finance.branches b on b.legal_entity_id=fc.legal_entity_id and b.dealer_legal_entity_id=fc.dealer_legal_entity_id where fc.id=p_contract_id and fc.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and b.id=p_branch_id;
 if not found then return null;end if;
 if p_cursor is not null then select cv.version_no into v_cursor_no from finance.contract_versions cv where cv.id=p_cursor and cv.contract_id=c.id;if not found then raise exception using errcode='22023',message='contract version cursor invalid';end if;end if;
 with page as (select cv.* from finance.contract_versions cv where cv.contract_id=c.id and (p_cursor is null or (cv.version_no,cv.id)<(v_cursor_no,p_cursor)) order by cv.version_no desc,cv.id desc limit v_limit+1), projected as (select pg_catalog.row_number() over(order by version_no desc,id desc) rn,id,pg_catalog.jsonb_build_object('versionId',id,'contractId',contract_id,'versionNo',version_no,'status',status,'validFrom',effective_from,'validTo',effective_to,'currencyCode',currency_code,'version',version) item from page)
 select coalesce(pg_catalog.jsonb_agg(item order by rn) filter(where rn<=v_limit),'[]'::jsonb),pg_catalog.count(*),(pg_catalog.array_agg(id order by rn) filter(where rn=v_limit))[1] into v_rows,v_count,v_next from projected;
 if v_count<=v_limit then v_next:=null;end if;
 return pg_catalog.jsonb_build_object('items',v_rows,'nextCursor',v_next);
end$$;
revoke all on function finance_api.list_contract_versions(uuid,uuid,uuid,uuid,uuid,integer) from public,anon;
