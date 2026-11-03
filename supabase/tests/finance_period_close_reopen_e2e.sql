\set ON_ERROR_STOP on

begin;

create or replace function finance_private.current_period_closing_worker_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.period_has_unresolved_blocking_exception(p_period_id uuid)
returns boolean language sql stable security definer set search_path='' as $$select false$$;
create or replace function finance_private.current_period_reopen_worker_is_trusted()
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_api.authorize_scope(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path='' as $$select true$$;
create or replace function finance_private.current_actor_can_read_scope(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text)
returns boolean language sql stable security definer set search_path='' as $$select true$$;
select pg_catalog.set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000061',true);
select pg_catalog.set_config('request.jwt.claim.role','authenticated',true);

do $test$
declare
  maker constant uuid := '00000000-0000-4000-8000-000000000061';
  checker constant uuid := '00000000-0000-4000-8000-000000000062';
  hq constant uuid := '16000000-0000-4000-8000-000000000001';
  dealer constant uuid := '26000000-0000-4000-8000-000000000001';
  branch constant uuid := '36000000-0000-4000-8000-000000000001';
  account constant uuid := '46000000-0000-4000-8000-000000000001';
  hq_period constant uuid := '76000000-0000-4000-8000-000000000001';
  branch_period constant uuid := '76000000-0000-4000-8000-000000000002';
  close_approval constant uuid := '66000000-0000-4000-8000-000000000001';
  close_step constant uuid := '66000000-0000-4000-8000-000000000002';
  reconciliation_id constant uuid := '86000000-0000-4000-8000-000000000001';
  document_id constant uuid := '86000000-0000-4000-8000-000000000002';
  external_document_id constant uuid := '86000000-0000-4000-8000-000000000003';
  corr constant uuid := '96000000-0000-4000-8000-000000000001';
  result jsonb; replay jsonb; check_hash text; reopen_request uuid; maker_blocked boolean:=false;
begin
  insert into finance.legal_entities(id,entity_code,legal_name,status,created_by,correlation_id)
  values(hq,'OTOTR-HQ-PERIOD-DEMO','OTOTR Sentetik Dönem Merkezi','ACTIVE',maker,corr);
  insert into finance.dealer_legal_entities(id,legal_entity_id,dealer_code,legal_name,status,created_by,correlation_id)
  values(dealer,hq,'PERIOD-DEALER','Sentetik Dönem Bayisi','ACTIVE',maker,corr);
  insert into finance.branches(id,legal_entity_id,dealer_legal_entity_id,branch_code,status,created_by,correlation_id)
  values(branch,hq,dealer,'PERIOD-BRANCH','ACTIVE',maker,corr);
  insert into finance.dealer_accounts(id,legal_entity_id,dealer_legal_entity_id,account_code,currency_code,status,created_by,correlation_id)
  values(account,hq,dealer,'PERIOD-ACCOUNT','TRY','ACTIVE',maker,corr);

  insert into finance.finance_periods(
    id,legal_entity_id,scope_type,period_start,period_end,currency_code,mode,status,created_by,correlation_id
  ) values(hq_period,hq,'HEADQUARTERS',date '2026-11-01',date '2026-11-30','TRY','LIVE','OPEN',maker,corr);
  insert into finance.finance_periods(
    id,legal_entity_id,parent_period_id,scope_type,dealer_account_id,branch_id,period_start,period_end,
    currency_code,mode,status,source_snapshot_hash,prepared_by,created_by,correlation_id
  ) values(branch_period,hq,hq_period,'BRANCH',account,branch,date '2026-11-01',date '2026-11-30','TRY','LIVE',
    'APPROVED',repeat('a',64),maker,maker,corr);

  insert into finance.reconciliations(
    id,finance_period_id,reconciliation_type,run_no,currency_code,source_total,ledger_total,
    snapshot_hash,status,created_by,correlation_id
  ) values(reconciliation_id,branch_period,'ACCRUAL_TO_LEDGER',1,'TRY',140,140,repeat('b',64),'MATCHED',maker,corr);
  select encode(extensions.digest(convert_to(string_agg(
    r.reconciliation_type||':'||r.run_no::text||':'||r.currency_code||':'||r.source_total::text||':'||
    r.ledger_total::text||':'||r.snapshot_hash||':'||r.status,'|' order by r.reconciliation_type,r.run_no
  ),'UTF8'),'sha256'),'hex') into check_hash
  from finance.reconciliations r where r.finance_period_id=branch_period;
  result:=finance_api.get_finance_period_reconciliations(hq,account,branch,branch_period);
  if result->>'periodId'<>branch_period::text or result->>'totalCount'<>'1' or result->>'blockingCount'<>'0'
     or result->>'closeReady'<>'true' or result->>'checkSnapshotHash'<>check_hash
     or result->>'rawRecordsExposed'<>'false' or result#>>'{items,0,status}'<>'MATCHED' then
    raise exception 'safe reconciliation projection mismatch: %',result;
  end if;

  insert into finance.approval_requests(
    id,legal_entity_id,subject_type,subject_id,approval_policy_version,prepared_by,subject_snapshot,
    subject_snapshot_hash,status,created_by,correlation_id
  ) values(close_approval,hq,'FINANCE_PERIOD_CLOSE',branch_period,'SYNTHETIC-CLOSE-V1',maker,
    jsonb_build_object('periodId',branch_period,'checkSnapshotHash',check_hash),repeat('c',64),'APPROVED',maker,corr);
  insert into finance.approval_steps(
    id,approval_request_id,step_no,required_role,decision,decided_by,decided_at_utc,evidence_ref,created_by,correlation_id
  ) values(close_step,close_approval,1,'FINANCE_PERIOD_CHECKER','APPROVE',checker,now(),
    'synthetic://period-close/approval',maker,corr);

  begin
    perform finance_api.commit_period_closing(
      maker,branch_period,hq,account,branch,check_hash,null,1,'maker close attempt',
      'period-close-maker',repeat('d',64),corr
    );
  exception when insufficient_privilege then maker_blocked:=true;
  end;
  if not maker_blocked then raise exception 'period close maker-checker violation was not blocked'; end if;

  result:=finance_api.commit_period_closing(
    checker,branch_period,hq,account,branch,check_hash,null,1,'Sentetik dönem kapanışı',
    'period-close-demo',repeat('e',64),corr
  );
  if result->>'outcome'<>'LOCKED' or result->>'status'<>'LOCKED' or result->>'version'<>'2' then
    raise exception 'period closing failed: %',result;
  end if;
  if not exists(
    select 1 from finance.finance_periods where id=branch_period and status='LOCKED'
      and check_snapshot_hash=check_hash and approved_by=checker and locked_at_utc is not null
  ) then raise exception 'locked period state mismatch'; end if;
  if (select status from finance.reconciliations where id=reconciliation_id)<>'LOCKED' then
    raise exception 'reconciliation was not locked with the period';
  end if;

  insert into finance.document_references(
    id,legal_entity_id,external_document_id,document_type,storage_provider,object_key,content_hash,status,created_by,correlation_id
  ) values(document_id,hq,external_document_id,'PERIOD_REOPEN_EVIDENCE','LOCAL_TEST',
    'synthetic/period/reopen-evidence.pdf',repeat('f',64),'ACTIVE',maker,corr);

  result:=finance_api.commit_period_reopen_request(
    maker,branch_period,hq,account,branch,'LATE_APPROVED_DOCUMENT','Geç gelen onaylı belge için sınırlı yeniden açma',
    array[external_document_id],2,'period-reopen-request-demo',repeat('1',64),corr
  );
  if result->>'outcome'<>'CREATED' or result->>'status'<>'PENDING' then
    raise exception 'period reopen request failed: %',result;
  end if;
  reopen_request:=(result->>'requestId')::uuid;
  if (select status from finance.finance_periods where id=branch_period)<>'REOPEN_PENDING' then
    raise exception 'period did not enter REOPEN_PENDING';
  end if;

  result:=finance_api.commit_period_reopen_approval(
    checker,reopen_request,hq,account,branch,'APPROVED_LATE_DOCUMENT',repeat('2',64),1,
    'period-reopen-approve-demo',repeat('3',64),corr
  );
  if result->>'outcome'<>'REOPENED' or result->>'status'<>'REOPENED' or result->>'version'<>'4' then
    raise exception 'period reopen approval failed: %',result;
  end if;
  if not exists(
    select 1 from finance.finance_periods where id=branch_period and status='REOPENED'
      and reopened_by=checker and reopen_reason_code='APPROVED_LATE_DOCUMENT'
      and source_snapshot_hash=repeat('a',64) and check_snapshot_hash=check_hash
  ) then raise exception 'reopened period provenance mismatch'; end if;
  if not exists(
    select 1 from finance.approval_requests ar join finance.approval_steps s on s.approval_request_id=ar.id
    where ar.id=reopen_request and ar.prepared_by=maker and ar.status='APPROVED'
      and s.decision='APPROVE' and s.decided_by=checker
  ) then raise exception 'reopen maker-checker approval evidence missing'; end if;

  replay:=finance_api.commit_period_reopen_approval(
    checker,reopen_request,hq,account,branch,'APPROVED_LATE_DOCUMENT',repeat('2',64),1,
    'period-reopen-approve-demo',repeat('3',64),corr
  );
  if replay->>'outcome'<>'REPLAY' then raise exception 'reopen approval replay failed: %',replay; end if;

  result:=finance_api.get_current_finance_period(hq,account,branch,date '2026-11-15');
  if result->>'periodId'<>branch_period::text or result->>'status'<>'REOPENED'
     or result->>'sourceSnapshotHash'<>repeat('a',64) or result->>'checkSnapshotHash'<>check_hash then
    raise exception 'current finance period projection mismatch: %',result;
  end if;

  raise notice 'PERIOD GOVERNANCE E2E PASSED: APPROVED -> LOCKED -> REOPEN_PENDING -> REOPENED';
end
$test$;

rollback;
