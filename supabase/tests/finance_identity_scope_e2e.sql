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
 insert into finance.dealer_finance_summary_snapshots(
   legal_entity_id,dealer_account_id,branch_id,as_of_date,currency_code,
   accrued_net,accrued_tax,accrued_gross,invoiced_net,invoiced_tax,invoiced_gross,
   collected_net,collected_tax,collected_gross,open_net,open_tax,open_gross,
   overdue_net,overdue_tax,overdue_gross,deducted_net,deducted_tax,deducted_gross,
   refunded_net,refunded_tax,refunded_gross,disputed_net,disputed_tax,disputed_gross,
   unallocated_cash_amount,read_model_version,source_watermark,snapshot_hash,created_by,correlation_id
 ) values
   (hq,a1,b1,current_date,'TRY',100,20,120,0,0,0,0,0,0,100,20,120,0,0,0,0,0,0,0,0,0,0,0,0,0,'scope-test','{}',repeat('a',64),ceo,corr),
   (hq,a2,b2,current_date,'TRY',200,40,240,0,0,0,0,0,0,200,40,240,0,0,0,0,0,0,0,0,0,0,0,0,0,'scope-test','{}',repeat('b',64),ceo,corr);
 perform set_config('request.jwt.claim.role','authenticated',true);
 perform set_config('request.jwt.claim.sub',finance_auth::text,true);
 set local role authenticated;
 if finance_api.authorize_scope(hq,a1,b1,'getDealerFinanceSummary') is distinct from true
    or finance_api.authorize_scope(hq,a2,b2,'getDealerFinanceSummary') is distinct from true then
   raise exception 'FINANCE Edge authorization RPC did not allow both branches';
 end if;
 if (finance_api.get_dealer_finance_summary(hq,a1,b1,current_date)#>>'{accrued,grossAmount}')::numeric is distinct from 120
    or (finance_api.get_dealer_finance_summary(hq,a2,b2,current_date)#>>'{accrued,grossAmount}')::numeric is distinct from 240 then
   raise exception 'FINANCE RPC did not return both branch balances';
 end if;
 perform set_config('request.jwt.claim.sub',manager_auth::text,true);
 if finance_api.authorize_scope(hq,a1,b1,'getDealerFinanceSummary') is distinct from true
    or finance_api.authorize_scope(hq,a2,b2,'getDealerFinanceSummary') is distinct from false then
   raise exception 'BRANCH_MANAGER Edge authorization RPC did not isolate branch scope';
 end if;
 if (finance_api.get_dealer_finance_summary(hq,a1,b1,current_date)#>>'{accrued,grossAmount}')::numeric is distinct from 120 then
   raise exception 'BRANCH_MANAGER RPC did not return own balance';
 end if;
 begin
   perform finance_api.get_dealer_finance_summary(hq,a2,b2,current_date);
   raise exception 'BRANCH_MANAGER RPC exposed the other branch';
 exception when insufficient_privilege then
   if sqlerrm <> 'finance scope denied' then raise; end if;
 end;
 reset role;
 raise notice 'IDENTITY SCOPE E2E PASSED: ERP roles, branch mappings and authenticated RPC isolation verified';
end $test$;
rollback;
