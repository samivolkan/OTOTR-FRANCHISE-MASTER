\set ON_ERROR_STOP on
begin;
set local request.jwt.claim.role='service_role';
do $test$
declare
 manager constant uuid:='ad000000-0000-4000-8000-000000000001';manager_auth constant uuid:='ad000000-0000-4000-8000-000000000002';
 inactive constant uuid:='ad000000-0000-4000-8000-000000000003';inactive_auth constant uuid:='ad000000-0000-4000-8000-000000000004';
 erp_branch constant uuid:='ad000000-0000-4000-8000-000000000005';actor constant uuid:='ad000000-0000-4000-8000-000000000006';
 hq constant uuid:='ad000000-0000-4000-8000-000000000007';dealer constant uuid:='ad000000-0000-4000-8000-000000000008';
 branch constant uuid:='ad000000-0000-4000-8000-000000000009';account constant uuid:='ad000000-0000-4000-8000-000000000010';corr constant uuid:='ad000000-0000-4000-8000-000000000011';v jsonb;
begin
 insert into public.branches(id,name,code,city)values(erp_branch,'Sentetik ERP Oturum Şubesi','ERP-SESSION-SCOPE','Bursa');
 insert into public.app_users(id,auth_user_id,branch_id,full_name,role,is_active)values(manager,manager_auth,erp_branch,'Sentetik Şube Müdürü','BRANCH_MANAGER',true),(inactive,inactive_auth,erp_branch,'Pasif Şube Müdürü','BRANCH_MANAGER',false);
 insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)values(hq,'ERP-SESSION-HQ','Sentetik Merkez','ACTIVE',actor,corr);
 insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)values(dealer,hq,'ERP-SESSION-D','Sentetik Bayi','ACTIVE',actor,corr);
 insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)values(branch,hq,dealer,'ERP-SESSION-B','ACTIVE',actor,corr);
 insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)values(account,hq,dealer,'ERP-SESSION-A','TRY','ACTIVE',actor,corr);
 insert into finance_private.erp_branch_scope_mappings(erp_branch_id,legal_entity_id,dealer_account_id,finance_branch_id,effective_from,status,created_by,correlation_id)values(erp_branch,hq,account,branch,current_date-1,'ACTIVE',manager,corr);
 v:=finance_api.resolve_erp_session_branch_finance_scope(manager_auth);
 if v->>'actorId'<>manager_auth::text or v->>'legalEntityId'<>hq::text or v->>'dealerAccountId'<>account::text or v->>'branchId'<>branch::text or v->>'scopeSource'<>'VERIFIED_ERP_SESSION_MAPPING'then raise exception'session scope mismatch: %',v;end if;
 if finance_api.resolve_erp_session_branch_finance_scope(inactive_auth)is not null or finance_api.resolve_erp_session_branch_finance_scope(gen_random_uuid())is not null then raise exception'invalid ERP session resolved';end if;
 set local request.jwt.claim.role='authenticated';
 begin perform finance_api.resolve_erp_session_branch_finance_scope(manager_auth);raise exception'authenticated caller reached service resolver';exception when insufficient_privilege then null;end;
 raise notice'ERP SESSION SCOPE RESOLVER E2E PASSED: active branch mapping resolved; inactive, unknown and client callers denied';
end$test$;
rollback;
