\set ON_ERROR_STOP on
begin;
do $test$
declare
 hq constant uuid:='1d000000-0000-4000-8000-000000000001';d1 constant uuid:='2d000000-0000-4000-8000-000000000001';d2 constant uuid:='2d000000-0000-4000-8000-000000000002';b1 constant uuid:='3d000000-0000-4000-8000-000000000001';b2 constant uuid:='3d000000-0000-4000-8000-000000000002';a1 constant uuid:='4d000000-0000-4000-8000-000000000001';a2 constant uuid:='4d000000-0000-4000-8000-000000000002';erp1 constant uuid:='5d000000-0000-4000-8000-000000000001';ceo constant uuid:='6d000000-0000-4000-8000-000000000001';manager constant uuid:='6d000000-0000-4000-8000-000000000002';auditor constant uuid:='6d000000-0000-4000-8000-000000000003';ceo_auth constant uuid:='7d000000-0000-4000-8000-000000000001';manager_auth constant uuid:='7d000000-0000-4000-8000-000000000002';auditor_auth constant uuid:='7d000000-0000-4000-8000-000000000003';outbox_id constant uuid:='8d000000-0000-4000-8000-000000000001';error_id constant uuid:='8d000000-0000-4000-8000-000000000002';corr constant uuid:='9d000000-0000-4000-8000-000000000001';corr2 constant uuid:='9d000000-0000-4000-8000-000000000002';scope jsonb;result jsonb;denied boolean:=false;
begin
 insert into public.branches(id,code,name,city)values(erp1,'FIN-RETRY-ERP-1','Sentetik Retry ERP Şube','Bursa');
 insert into public.app_users(id,auth_user_id,branch_id,full_name,role,is_active)values(ceo,ceo_auth,null,'Sentetik Retry CEO','CEO',true),(manager,manager_auth,erp1,'Sentetik Retry Müdür','BRANCH_MANAGER',true),(auditor,auditor_auth,null,'Sentetik Retry Denetçi','QUALITY_AUDITOR',true);
 insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)values(hq,'OTOTR-HQ-RETRY-ID-DEMO','Sentetik Retry Merkezi','ACTIVE',ceo,corr);
 insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)values(d1,hq,'RETRY-D1','Sentetik Retry Bayi 1','ACTIVE',ceo,corr),(d2,hq,'RETRY-D2','Sentetik Retry Bayi 2','ACTIVE',ceo,corr);
 insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)values(b1,hq,d1,'RETRY-B1','ACTIVE',ceo,corr),(b2,hq,d2,'RETRY-B2','ACTIVE',ceo,corr);
 insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)values(a1,hq,d1,'RETRY-A1','TRY','ACTIVE',ceo,corr),(a2,hq,d2,'RETRY-A2','TRY','ACTIVE',ceo,corr);
 insert into finance_private.erp_branch_scope_mappings(erp_branch_id,legal_entity_id,dealer_account_id,finance_branch_id,effective_from,status,created_by,correlation_id)values(erp1,hq,a1,b1,current_date-1,'ACTIVE',ceo,corr);
 insert into finance.outbox_messages(id,legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,attempt_count,last_error_code,correlation_id)values(outbox_id,hq,'finance.erp','ERP_SYNC_FAILED','branch',b1,1,'{}',repeat('a',64),'DEAD_LETTER',3,'ERP_TIMEOUT',corr);
 insert into finance.integration_errors(id,legal_entity_id,source_type,source_id,error_fingerprint,occurrence_no,error_code,redacted_detail,status,created_by,correlation_id)values(error_id,hq,'OUTBOX',outbox_id,repeat('b',64),3,'ERP_TIMEOUT',jsonb_build_object('sourceSystem','ERP','retryable',true,'dealerAccountId',a1,'branchId',b1,'safeMessage','ERP yanıt vermedi'),'OPEN',ceo,corr);

 if not finance_private.current_actor_can_retry_integration_error(ceo_auth,hq,a1,b1) then raise exception 'CEO retry denied';end if;
 if not finance_private.current_actor_can_retry_integration_error(manager_auth,hq,a1,b1) then raise exception 'branch manager own-scope retry denied';end if;
 if finance_private.current_actor_can_retry_integration_error(manager_auth,hq,a2,b2) then raise exception 'branch manager cross-scope retry allowed';end if;
 if finance_private.current_actor_can_retry_integration_error(auditor_auth,hq,a1,b1) then raise exception 'read-only auditor retry allowed';end if;
 if not finance_private.integration_retry_error_is_in_scope(error_id,hq,a1,b1) or finance_private.integration_retry_error_is_in_scope(error_id,hq,a2,b2) then raise exception 'retry error scope mismatch';end if;
 scope:=finance_private.resolve_integration_retry_scope(error_id);
 if scope->>'legalEntityId'<>hq::text or scope->>'dealerAccountId'<>a1::text or scope->>'branchId'<>b1::text then raise exception 'retry scope resolution mismatch: %',scope;end if;
 perform pg_catalog.set_config('request.jwt.claim.role','authenticated',true);
 if finance_private.current_integration_retry_committer_is_trusted() then raise exception 'authenticated role trusted as retry committer';end if;
 perform pg_catalog.set_config('request.jwt.claim.role','service_role',true);
 if not finance_private.current_integration_retry_committer_is_trusted() then raise exception 'service role retry committer denied';end if;
 if not has_function_privilege('service_role','finance_api.commit_integration_error_retry(uuid,uuid,uuid,uuid,uuid,text,text,bigint,text,text,uuid)','EXECUTE') or has_function_privilege('authenticated','finance_api.commit_integration_error_retry(uuid,uuid,uuid,uuid,uuid,text,text,bigint,text,text,uuid)','EXECUTE') then raise exception 'retry commit execute grants are unsafe';end if;
 if not has_function_privilege('service_role','finance_api.commit_integration_error_assignment(uuid,uuid,uuid,uuid,uuid,text,text,text,bigint,text,text,uuid)','EXECUTE') or has_function_privilege('authenticated','finance_api.commit_integration_error_assignment(uuid,uuid,uuid,uuid,uuid,text,text,text,bigint,text,text,uuid)','EXECUTE') then raise exception 'assignment commit grants are unsafe';end if;
 result:=finance_api.commit_integration_error_assignment(ceo,hq,a1,b1,error_id,'ERP_INTEGRATION','OWNER_ASSIGNED',repeat('c',64),1,'integration:assign:001',repeat('d',64),corr2);
 if result->>'outcome'<>'ASSIGNED' or result->>'version'<>'2' or result->>'ownerRole'<>'ERP_INTEGRATION' then raise exception 'assignment failed: %',result;end if;
 result:=finance_api.commit_integration_error_assignment(ceo,hq,a1,b1,error_id,'ERP_INTEGRATION','OWNER_ASSIGNED',repeat('c',64),1,'integration:assign:001',repeat('d',64),corr2);
 if result->>'outcome'<>'REPLAY' then raise exception 'assignment replay failed: %',result;end if;
 begin perform finance_api.commit_integration_error_resolution(ceo,hq,a1,b1,error_id,'FALSE_POSITIVE',repeat('e',64),2,'integration:resolve:001',repeat('f',64),corr2);exception when check_violation then denied:=true;end;
 if not denied then raise exception 'dead-letter false-positive resolution was allowed';end if;
 result:=finance_api.commit_integration_error_resolution(ceo,hq,a1,b1,error_id,'FIXED_EXTERNALLY',repeat('e',64),2,'integration:resolve:002',repeat('1',64),corr2);
 if result->>'outcome'<>'RESOLVED' or result->>'version'<>'3' or result->>'policyVersion'<>'INTEGRATION_ERROR_ACTION_V1' then raise exception 'resolution failed: %',result;end if;
 if not exists(select 1 from finance.integration_errors e where e.id=error_id and e.status='RESOLVED' and e.redacted_detail->>'ownerRole'='ERP_INTEGRATION' and e.redacted_detail->>'resolutionCode'='FIXED_EXTERNALLY')then raise exception 'error action projection mismatch';end if;
 if(select count(*)from finance.audit_events a where a.subject_id=error_id and a.action_code in('INTEGRATION_ERROR_ASSIGNED','INTEGRATION_ERROR_RESOLVED'))<>2 then raise exception 'integration action audit events missing';end if;
 raise notice 'FINANCE INTEGRATION RETRY IDENTITY E2E PASSED: scope, assignment, dead-letter policy, resolution, audit and server-only commits verified';
end $test$;
rollback;
