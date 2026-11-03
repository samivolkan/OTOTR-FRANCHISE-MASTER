\set ON_ERROR_STOP on

begin;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000092';

create or replace function finance_private.current_actor_can_read_scope(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text
) returns boolean language sql stable security definer set search_path=pg_catalog as $$
  select p_operation_id='listContractFeeRules'
$$;
create or replace function finance_api.authorize_scope(
  p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text
) returns boolean language sql stable security definer set search_path=pg_catalog as $$
  select p_operation_id='listContractFeeRules'
$$;

do $test$
declare
  actor constant uuid := '00000000-0000-4000-8000-000000000091';
  reader constant uuid := '00000000-0000-4000-8000-000000000092';
  hq constant uuid := '19000000-0000-4000-8000-000000000001';
  dealer constant uuid := '29000000-0000-4000-8000-000000000001';
  branch constant uuid := '39000000-0000-4000-8000-000000000001';
  account constant uuid := '49000000-0000-4000-8000-000000000001';
  fee constant uuid := '59000000-0000-4000-8000-000000000001';
  contract_id constant uuid := '69000000-0000-4000-8000-000000000001';
  contract_version constant uuid := '79000000-0000-4000-8000-000000000001';
  rule_id constant uuid := '89000000-0000-4000-8000-000000000001';
  exception_id constant uuid := '99000000-0000-4000-8000-000000000001';
  corr constant uuid := '99000000-0000-4000-8000-000000000002';
  result jsonb; denied_result jsonb;
begin
  if auth.uid() is distinct from reader then raise exception 'synthetic auth context mismatch: %',auth.uid();end if;
  if not finance_private.current_actor_can_read_scope(reader,hq,account,branch,'listContractFeeRules') then raise exception 'synthetic scope hook mismatch';end if;
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OTOTR-HQ-RULE-EXCEPTION-DEMO','OTOTR Sentetik Kural Merkezi','ACTIVE',actor,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
  values(dealer,hq,'RULE-DEALER-A','Sentetik Kural Bayisi','ACTIVE',actor,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
  values(branch,hq,dealer,'RULE-BRANCH-A','ACTIVE',actor,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
  values(account,hq,dealer,'RULE-ACCOUNT-A','TRY','ACTIVE',actor,corr);
  insert into finance.fee_definitions(id,legal_entity_id,code,version_no,fee_family,name,status,created_by,correlation_id)
  values(fee,hq,'ROYALTY-RULE-EXCEPTION',1,'ROYALTY','Sentetik Royalty Kuralı','PUBLISHED',actor,corr);
  insert into finance.franchise_contracts(id,legal_entity_id,dealer_legal_entity_id,contract_code,status,created_by,correlation_id)
  values(contract_id,hq,dealer,'RULE-EXCEPTION-CONTRACT','DRAFT',actor,corr);
  insert into finance.contract_versions(id,contract_id,version_no,currency_code,effective_from,content_hash,evidence_object_key,status,prepared_by,created_by,correlation_id)
  values(contract_version,contract_id,1,'TRY',date '2026-11-01',repeat('a',64),'synthetic/rules/contract.json','DRAFT',actor,actor,corr);
  insert into finance.contract_fee_rules(id,contract_version_id,fee_definition_id,rule_code,priority,status,configuration_status,prepared_by,created_by,correlation_id)
  values(rule_id,contract_version,fee,'ROYALTY-BASE',100,'DRAFT','UNCONFIGURED',actor,actor,corr);
  insert into finance.rule_exceptions(id,contract_fee_rule_id,exception_code,scope_definition,condition_definition,override_definition,priority,effective_from,status,prepared_by,created_by,correlation_id)
  values(exception_id,rule_id,'FIRST_MONTH_EXEMPTION','{"type":"BRANCH","branchSecret":"must-not-leak"}'::jsonb,'{"type":"CONTRACT_AGE","days":30,"privateNote":"must-not-leak"}'::jsonb,'{"type":"RATE_OVERRIDE","rate":0,"secret":"must-not-leak"}'::jsonb,200,date '2026-11-01','DRAFT',actor,actor,corr);

  result:=finance_api.list_contract_fee_rules(hq,account,branch,contract_version,null,null,25);
  if result#>>'{items,0,exceptionCount}'<>'1'
     or result#>>'{items,0,exceptions,0,exceptionCode}'<>'FIRST_MONTH_EXEMPTION'
     or result#>>'{items,0,exceptions,0,scopeType}'<>'BRANCH'
     or result#>>'{items,0,exceptions,0,conditionType}'<>'CONTRACT_AGE'
     or result#>>'{items,0,exceptions,0,overrideType}'<>'RATE_OVERRIDE' then
    raise exception 'safe exception projection mismatch: %',result;
  end if;
  if result::text like '%must-not-leak%' or result::text like '%branchSecret%' or result::text like '%privateNote%' or result::text like '%"rate"%' then
    raise exception 'raw exception definition leaked: %',result;
  end if;
  denied_result:=finance_api.list_contract_fee_rules(hq,'49000000-0000-4000-8000-000000000099'::uuid,branch,contract_version,null,null,25);
  if denied_result is not null then raise exception 'cross-account contract projection was not isolated: %',denied_result;end if;
end $test$;

rollback;
select 'CONTRACT RULE EXCEPTION PROJECTION E2E PASSED' as result;
