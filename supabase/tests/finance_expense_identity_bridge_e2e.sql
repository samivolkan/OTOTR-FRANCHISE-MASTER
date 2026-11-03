\set ON_ERROR_STOP on
begin;
do $test$
declare
  maker constant uuid:='00000000-0000-4000-8000-0000000000a1'; checker constant uuid:='00000000-0000-4000-8000-0000000000a2'; outsider constant uuid:='00000000-0000-4000-8000-0000000000a3';
  hq constant uuid:='1a000000-0000-4000-8000-000000000001'; fee constant uuid:='5a000000-0000-4000-8000-000000000001'; corr constant uuid:='9a000000-0000-4000-8000-000000000001';
  draft_id constant uuid:='6a000000-0000-4000-8000-000000000001'; pending_id constant uuid:='6a000000-0000-4000-8000-000000000002'; approved_id constant uuid:='6a000000-0000-4000-8000-000000000003'; result jsonb;
begin
  insert into public.app_users(id,auth_user_id,branch_id,full_name,role,is_active) values
    (gen_random_uuid(),maker,null,'Sentetik Masraf Maker','FINANCE',true),(gen_random_uuid(),checker,null,'Sentetik Masraf Checker','GENERAL_MANAGER',true),(gen_random_uuid(),outsider,null,'Sentetik Yetkisiz Kullanıcı','QUALITY_AUDITOR',true);
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id) values(hq,'OTOTR-HQ-EXP-ID','Sentetik Masraf Kimlik Merkezi','ACTIVE',maker,corr);
  insert into finance.fee_definitions(id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id) values(fee,hq,'EXP-ID',1,'PASS_THROUGH_EXPENSE','Sentetik Masraf Kimlik', 'PUBLISHED',maker,corr);
  insert into finance.pass_through_expenses(id,legal_entity_id,fee_definition_id,supplier_reference,supplier_reference_normalized,contractual_basis_reference,expense_date,currency_code,source_net_amount,source_tax_amount,source_amount,distributable_net_amount,distributable_tax_amount,distributable_amount,allocation_policy,evidence_object_key,evidence_hash,idempotency_key,input_hash,status,prepared_by,approved_by,version,created_by,correlation_id) values
    (draft_id,hq,fee,'ID-DRAFT','ID-DRAFT','CONTRACT',date '2026-11-03','TRY',100,20,120,100,20,120,'{}','evidence/draft',repeat('a',64),'expense-id-draft',repeat('b',64),'DRAFT',maker,null,1,maker,corr),
    (pending_id,hq,fee,'ID-PENDING','ID-PENDING','CONTRACT',date '2026-11-03','TRY',100,20,120,100,20,120,'{}','evidence/pending',repeat('a',64),'expense-id-pending',repeat('b',64),'PENDING_APPROVAL',maker,null,3,maker,corr),
    (approved_id,hq,fee,'ID-APPROVED','ID-APPROVED','CONTRACT',date '2026-11-03','TRY',100,20,120,100,20,120,'{}','evidence/approved',repeat('a',64),'expense-id-approved',repeat('b',64),'APPROVED',maker,checker,4,maker,corr);

  perform set_config('request.jwt.claim.role','authenticated',true); perform set_config('request.jwt.claim.sub',maker::text,true);
  result:=finance_api.authorize_expense_action_scope(draft_id,'CALCULATE','finance.expenses.calculate'); if coalesce((result->>'allowed')::boolean,false) is not true then raise exception 'maker calculate denied: %',result;end if;
  result:=finance_api.authorize_expense_action_scope(pending_id,'APPROVE','finance.expenses.approve'); if coalesce((result->>'allowed')::boolean,false) then raise exception 'maker approved own expense';end if;
  perform set_config('request.jwt.claim.sub',checker::text,true);
  result:=finance_api.authorize_expense_action_scope(pending_id,'APPROVE','finance.expenses.approve'); if coalesce((result->>'allowed')::boolean,false) is not true then raise exception 'checker approval denied: %',result;end if;
  result:=finance_api.authorize_expense_action_scope(approved_id,'POST','finance.expenses.post'); if coalesce((result->>'allowed')::boolean,false) is not true then raise exception 'approved posting denied: %',result;end if;
  perform set_config('request.jwt.claim.sub',outsider::text,true);
  result:=finance_api.authorize_expense_action_scope(draft_id,'CALCULATE','finance.expenses.calculate'); if coalesce((result->>'allowed')::boolean,false) then raise exception 'unauthorized role gained expense access';end if;
  if finance_private.current_expense_share_calculator_is_trusted() then raise exception 'authenticated role trusted as worker';end if;
  perform set_config('request.jwt.claim.role','service_role',true);
  if not finance_private.current_pass_through_expense_create_committer_is_trusted() or not finance_private.current_expense_share_calculator_is_trusted() or not finance_private.current_expense_approval_committer_is_trusted() or not finance_private.current_expense_posting_worker_is_trusted() or not finance_private.current_expense_reversal_worker_is_trusted() then raise exception 'service role worker trust missing';end if;
  raise notice 'EXPENSE IDENTITY BRIDGE E2E PASSED';
end $test$;
rollback;
