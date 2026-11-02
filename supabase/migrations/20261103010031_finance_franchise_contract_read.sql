-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-franchise-contract-read-rpc.sql
-- Source SHA256: 21C166BADC55B44A652D0FF90678DD73270EF65A2FE3EC4C78EF5BD7D9C47AC1
-- Local replay required before any staging promotion.
-- OTOTR FRANCHISE CONTRACT READ RPC CANDIDATE
create or replace function finance_api.get_franchise_contract(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_contract_id uuid) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare c finance.franchise_contracts%rowtype;v_draft uuid;v_active uuid;v_draft_count integer;v_active_count integer;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getFranchiseContract') then raise exception using errcode='42501',message='finance scope denied';end if;
 select fc.* into c from finance.franchise_contracts fc join finance.dealer_accounts da on da.legal_entity_id=fc.legal_entity_id and da.dealer_legal_entity_id=fc.dealer_legal_entity_id join finance.branches b on b.legal_entity_id=fc.legal_entity_id and b.dealer_legal_entity_id=fc.dealer_legal_entity_id where fc.id=p_contract_id and fc.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and b.id=p_branch_id;
 if not found then return null;end if;
 select pg_catalog.count(*),(pg_catalog.array_agg(cv.id order by cv.version_no desc,cv.id desc))[1] into v_draft_count,v_draft from finance.contract_versions cv where cv.contract_id=c.id and cv.status='DRAFT';
 select pg_catalog.count(*),(pg_catalog.array_agg(cv.id order by cv.version_no desc,cv.id desc))[1] into v_active_count,v_active from finance.contract_versions cv where cv.contract_id=c.id and cv.status='ACTIVE';
 if v_draft_count>1 or v_active_count>1 then raise exception using errcode='23514',message='contract current version projection is ambiguous';end if;
 return pg_catalog.jsonb_build_object('contractId',c.id,'dealerLegalEntityId',c.dealer_legal_entity_id,'contractCode',c.contract_code,'status',c.status,'draftVersionId',v_draft,'activeVersionId',v_active,'version',c.version);
end$$;
revoke all on function finance_api.get_franchise_contract(uuid,uuid,uuid,uuid) from public,anon;
