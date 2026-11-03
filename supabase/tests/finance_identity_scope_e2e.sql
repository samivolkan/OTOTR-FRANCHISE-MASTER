\set ON_ERROR_STOP on
begin;
do $test$
declare
 hq constant uuid:='1b000000-0000-4000-8000-000000000001';d1 constant uuid:='2b000000-0000-4000-8000-000000000001';d2 constant uuid:='2b000000-0000-4000-8000-000000000002';b1 constant uuid:='3b000000-0000-4000-8000-000000000001';b2 constant uuid:='3b000000-0000-4000-8000-000000000002';a1 constant uuid:='4b000000-0000-4000-8000-000000000001';a2 constant uuid:='4b000000-0000-4000-8000-000000000002';erp1 constant uuid:='5b000000-0000-4000-8000-000000000001';erp2 constant uuid:='5b000000-0000-4000-8000-000000000002';ceo constant uuid:='6b000000-0000-4000-8000-000000000001';finance_user constant uuid:='6b000000-0000-4000-8000-000000000002';manager constant uuid:='6b000000-0000-4000-8000-000000000003';auditor constant uuid:='6b000000-0000-4000-8000-000000000004';regional constant uuid:='6b000000-0000-4000-8000-000000000005';inactive constant uuid:='6b000000-0000-4000-8000-000000000006';ceo_auth constant uuid:='7b000000-0000-4000-8000-000000000001';finance_auth constant uuid:='7b000000-0000-4000-8000-000000000002';manager_auth constant uuid:='7b000000-0000-4000-8000-000000000003';auditor_auth constant uuid:='7b000000-0000-4000-8000-000000000004';regional_auth constant uuid:='7b000000-0000-4000-8000-000000000005';inactive_auth constant uuid:='7b000000-0000-4000-8000-000000000006';corr constant uuid:='8b000000-0000-4000-8000-000000000001';op text;
begin
 insert into public.branches(id,code,name,city)values(erp1,'FIN-SCOPE-ERP-1','Sentetik ERP Şube 1','Bursa'),(erp2,'FIN-SCOPE-ERP-2','Sentetik ERP Şube 2','İstanbul');
 insert into public.app_users(id,auth_user_id,branch_id,full_name,role,is_active)values(ceo,ceo_auth,null,'Sentetik CEO','CEO',true),(finance_user,finance_auth,null,'Sentetik Finans','FINANCE',true),(manager,manager_auth,erp1,'Sentetik Şube Müdürü','BRANCH_MANAGER',true),(auditor,auditor_auth,null,'Sentetik Denetçi','QUALITY_AUDITOR',true),(regional,regional_auth,null,'Sentetik Bölge','REGIONAL_MANAGER',true),(inactive,inactive_auth,erp1,'Sentetik Pasif','BRANCH_MANAGER',false);
 insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)values(hq,'OTOTR-HQ-SCOPE-DEMO','Sentetik Scope Merkezi','ACTIVE',ceo,corr);
 insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)values(d1,hq,'SCOPE-D1','Sentetik Bayi 1','ACTIVE',ceo,corr),(d2,hq,'SCOPE-D2','Sentetik Bayi 2','ACTIVE',ceo,corr);
 insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)values(b1,hq,d1,'SCOPE-B1','ACTIVE',ceo,corr),(b2,hq,d2,'SCOPE-B2','ACTIVE',ceo,corr);
 insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)values(a1,hq,d1,'SCOPE-A1','TRY','ACTIVE',ceo,corr),(a2,hq,d2,'SCOPE-A2','TRY','ACTIVE',ceo,corr);
 insert into finance_private.erp_branch_scope_mappings(erp_branch_id,legal_entity_id,dealer_account_id,finance_branch_id,effective_from,status,created_by,correlation_id)values(erp1,hq,a1,b1,current_date-1,'ACTIVE',ceo,corr);
 insert into finance_private.actor_scope_grants(app_user_id,legal_entity_id,dealer_account_id,finance_branch_id,effective_from,status,granted_by,correlation_id)values(auditor,hq,a1,b1,current_date-1,'ACTIVE',ceo,corr);
 foreach op in array array['getDealerFinanceSummary','listPayments','listApprovalWorkItems','getApprovalWorkItem','listAuditEvents','getAuditCorrelationTrace','listIntegrationErrors','getIntegrationError'] loop
  if not finance_private.current_actor_can_read_scope(ceo_auth,hq,a1,b1,op) then raise exception 'CEO denied %',op;end if;
  if not finance_private.current_actor_can_read_scope(finance_auth,hq,a1,b1,op) then raise exception 'FINANCE denied %',op;end if;
  if not finance_private.current_actor_can_read_scope(manager_auth,hq,a1,b1,op) then raise exception 'BRANCH_MANAGER own scope denied %',op;end if;
  if finance_private.current_actor_can_read_scope(manager_auth,hq,a2,b2,op) then raise exception 'BRANCH_MANAGER cross scope allowed %',op;end if;
  if not finance_private.current_actor_can_read_scope(auditor_auth,hq,a1,b1,op) then raise exception 'AUDITOR grant denied %',op;end if;
  if finance_private.current_actor_can_read_scope(auditor_auth,hq,a2,b2,op) then raise exception 'AUDITOR ungranted scope allowed %',op;end if;
  if finance_private.current_actor_can_read_scope(regional_auth,hq,a1,b1,op) or finance_private.current_actor_can_read_scope(inactive_auth,hq,a1,b1,op) then raise exception 'unauthorized role allowed %',op;end if;
 end loop;
 if not finance_private.current_actor_can_create_payment(ceo_auth,hq,a1,b1) or not finance_private.current_actor_can_create_payment(finance_auth,hq,a1,b1) then raise exception 'HQ payment creator role denied';end if;
 if finance_private.current_actor_can_create_payment(manager_auth,hq,a1,b1) or finance_private.current_actor_can_create_payment(finance_auth,hq,a2,b1) then raise exception 'payment create role or scope boundary violated';end if;
 if finance_private.current_actor_can_read_scope(manager_auth,hq,a1,b2,'getDealerFinanceSummary') then raise exception 'mismatched dealer and branch accepted';end if;
 raise notice 'IDENTITY SCOPE E2E PASSED: real ERP roles, mappings, grants and cross-scope denial verified';
end $test$;
rollback;
