-- Branch-scoped royalty refund credit carry-forward.
-- Credits settle the oldest open royalty debits before a billing batch is built.

create table finance.royalty_credit_applications (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  credit_open_item_id uuid not null references finance.open_items(id) on delete restrict,
  debit_open_item_id uuid not null references finance.open_items(id) on delete restrict,
  credit_accrual_id uuid not null references finance.accruals(id) on delete restrict,
  debit_accrual_id uuid not null references finance.accruals(id) on delete restrict,
  billing_batch_id uuid null references finance.billing_batches(id) on delete restrict,
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  applied_amount numeric(24,8) not null check (applied_amount > 0),
  application_order bigint generated always as identity,
  created_at_utc timestamptz not null default now(),
  created_by uuid not null,
  correlation_id uuid not null,
  check (credit_open_item_id <> debit_open_item_id),
  check (credit_accrual_id <> debit_accrual_id),
  unique (credit_open_item_id,debit_open_item_id,application_order)
);

create index royalty_credit_applications_credit_idx
  on finance.royalty_credit_applications(credit_open_item_id,application_order);
create index royalty_credit_applications_debit_idx
  on finance.royalty_credit_applications(debit_open_item_id,application_order);
create index royalty_credit_applications_batch_idx
  on finance.royalty_credit_applications(billing_batch_id)
  where billing_batch_id is not null;

alter table finance.royalty_credit_applications enable row level security;
alter table finance.royalty_credit_applications force row level security;
revoke all on finance.royalty_credit_applications from public,anon,authenticated;

create table finance.royalty_credit_settlement_runs (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  finance_period_id uuid not null references finance.finance_periods(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  idempotency_key text not null check (pg_catalog.btrim(idempotency_key)<>''),
  intent_hash text not null check (intent_hash ~ '^[a-fA-F0-9]{64}$'),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  application_count integer not null check (application_count > 0),
  applied_amount numeric(24,8) not null check (applied_amount > 0),
  status text not null check (status='SETTLED_BY_CREDIT'),
  created_at_utc timestamptz not null default now(),created_by uuid not null,correlation_id uuid not null,
  unique (legal_entity_id,idempotency_key)
);
alter table finance.royalty_credit_settlement_runs enable row level security;
alter table finance.royalty_credit_settlement_runs force row level security;
revoke all on finance.royalty_credit_settlement_runs from public,anon,authenticated;

create or replace function finance_private.apply_royalty_credit_carry_forward(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_currency_code text,p_correlation_id uuid
) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  c record; d record; v_apply numeric(24,8); v_total numeric(24,8):=0; v_count integer:=0;
begin
  if not finance_private.current_billing_batch_worker_is_trusted() then
    raise exception using errcode='42501',message='royalty credit carry-forward worker denied';
  end if;
  if p_actor_id is null or p_legal_entity_id is null or p_dealer_account_id is null
     or p_branch_id is null or p_currency_code !~ '^[A-Z]{3}$' or p_correlation_id is null then
    raise exception using errcode='22023',message='royalty credit carry-forward scope is incomplete';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    'royalty-credit:'||p_legal_entity_id::text||':'||p_dealer_account_id::text||':'||p_branch_id::text||':'||p_currency_code,0));

  for c in
    select oi.id open_item_id,oi.accrual_id,oi.open_amount
    from finance.open_items oi
    join finance.accruals a on a.id=oi.accrual_id
    join finance.fee_definitions fd on fd.id=a.fee_definition_id and fd.fee_family='ROYALTY'
    where oi.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id
      and oi.branch_id=p_branch_id and oi.currency_code=p_currency_code
      and oi.item_type='CREDIT' and oi.status in('OPEN','PARTIALLY_ALLOCATED') and oi.open_amount>0
    order by oi.due_date,oi.created_at_utc,oi.id
    for update of oi
  loop
    for d in
      select oi.id open_item_id,oi.accrual_id,oi.open_amount
      from finance.open_items oi
      join finance.accruals a on a.id=oi.accrual_id
      join finance.fee_definitions fd on fd.id=a.fee_definition_id and fd.fee_family='ROYALTY'
      where oi.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id
        and oi.branch_id=p_branch_id and oi.currency_code=p_currency_code
        and oi.item_type='DEBIT' and oi.status in('OPEN','PARTIALLY_ALLOCATED') and oi.open_amount>0
      order by oi.due_date,oi.created_at_utc,oi.id
      for update of oi
    loop
      select open_amount into c.open_amount from finance.open_items where id=c.open_item_id;
      exit when c.open_amount<=0;
      select open_amount into d.open_amount from finance.open_items where id=d.open_item_id;
      continue when d.open_amount<=0;
      v_apply:=least(c.open_amount,d.open_amount);

      update finance.open_items
      set allocated_amount=allocated_amount+v_apply,open_amount=open_amount-v_apply,
          status=case when open_amount-v_apply=0 then 'CLOSED' else 'PARTIALLY_ALLOCATED' end,
          version=version+1,correlation_id=p_correlation_id
      where id in(c.open_item_id,d.open_item_id);

      insert into finance.royalty_credit_applications(
        legal_entity_id,dealer_account_id,branch_id,credit_open_item_id,debit_open_item_id,
        credit_accrual_id,debit_accrual_id,currency_code,applied_amount,created_by,correlation_id
      ) values(
        p_legal_entity_id,p_dealer_account_id,p_branch_id,c.open_item_id,d.open_item_id,
        c.accrual_id,d.accrual_id,p_currency_code,v_apply,p_actor_id,p_correlation_id
      );
      v_total:=v_total+v_apply;v_count:=v_count+1;
    end loop;
  end loop;

  return pg_catalog.jsonb_build_object(
    'applicationCount',v_count,'appliedAmount',v_total::text,'currency',p_currency_code,
    'scope',pg_catalog.jsonb_build_object('dealerAccountId',p_dealer_account_id,'branchId',p_branch_id));
end $$;

revoke all on function finance_private.apply_royalty_credit_carry_forward(uuid,uuid,uuid,uuid,text,uuid)
  from public,anon,authenticated;
grant execute on function finance_private.apply_royalty_credit_carry_forward(uuid,uuid,uuid,uuid,text,uuid)
  to service_role;

create or replace function finance_api.commit_billing_batch_creation(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_finance_period_id uuid,
  p_grouping_profile_code text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid
) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  p finance.finance_periods%rowtype;e finance.billing_batches%rowtype;v_id uuid:=gen_random_uuid();
  v_batch_no text;v_net numeric(24,8);v_tax numeric(24,8);v_gross numeric(24,8);v_count integer;
  v_content text;v_payload jsonb;v_audit text;v_previous text;v_credit jsonb;v_settlement finance.royalty_credit_settlement_runs%rowtype;
begin
  if not finance_private.current_billing_batch_worker_is_trusted() then raise exception using errcode='42501',message='billing batch worker denied';end if;
  if p_actor_id is null or p_legal_entity_id is null or p_dealer_account_id is null or p_branch_id is null or p_finance_period_id is null or pg_catalog.btrim(coalesce(p_grouping_profile_code,''))='' or pg_catalog.length(p_grouping_profile_code)>100 or pg_catalog.btrim(coalesce(p_idempotency_key,''))='' or pg_catalog.length(p_idempotency_key)>200 or p_intent_hash!~'^[a-fA-F0-9]{64}$' or p_correlation_id is null then raise exception using errcode='22023',message='required billing batch fields missing';end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('billing-batch:'||p_legal_entity_id::text||':'||p_dealer_account_id::text||':'||p_branch_id::text||':'||p_finance_period_id::text,0));
  select * into e from finance.billing_batches b where b.legal_entity_id=p_legal_entity_id and b.idempotency_key=p_idempotency_key for update;
  if found then if e.intent_hash=p_intent_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','batchId',e.id,'financePeriodId',e.finance_period_id,'dealerAccountId',e.dealer_account_id,'branchId',e.branch_id,'currencyCode',e.currency_code,'status',e.status,'contentHash',e.content_hash,'controlTotals',pg_catalog.jsonb_build_object('netAmount',e.control_net::text,'taxAmount',e.control_tax::text,'grossAmount',e.control_gross::text,'currency',e.currency_code),'version',e.version);end if;return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
  select * into v_settlement from finance.royalty_credit_settlement_runs r where r.legal_entity_id=p_legal_entity_id and r.idempotency_key=p_idempotency_key for update;
  if found then if v_settlement.intent_hash=p_intent_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','settlementRunId',v_settlement.id,'financePeriodId',v_settlement.finance_period_id,'dealerAccountId',v_settlement.dealer_account_id,'branchId',v_settlement.branch_id,'currencyCode',v_settlement.currency_code,'status',v_settlement.status,'royaltyCredit',pg_catalog.jsonb_build_object('applicationCount',v_settlement.application_count,'appliedAmount',v_settlement.applied_amount::text,'currency',v_settlement.currency_code),'controlTotals',pg_catalog.jsonb_build_object('netAmount','0.00000000','taxAmount','0.00000000','grossAmount','0.00000000','currency',v_settlement.currency_code),'version',1);end if;return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
  select * into p from finance.finance_periods fp where fp.id=p_finance_period_id and fp.legal_entity_id=p_legal_entity_id and fp.dealer_account_id=p_dealer_account_id and fp.branch_id=p_branch_id and fp.scope_type='BRANCH' and fp.status='LOCKED' for update;
  if not found then raise exception using errcode='P0002',message='locked branch finance period not found';end if;

  v_credit:=finance_private.apply_royalty_credit_carry_forward(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id,p.currency_code,p_correlation_id);

  perform 1 from finance.accruals a join finance.journal_entries je on je.id=a.journal_entry_id
    join finance.open_items oi on oi.accrual_id=a.id and oi.item_type='DEBIT' and oi.status in('OPEN','PARTIALLY_ALLOCATED') and oi.open_amount>0
    where a.legal_entity_id=p_legal_entity_id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id and a.currency_code=p.currency_code and a.status='POSTED' and a.reversal_of_id is null and a.gross_amount>0 and je.finance_period_id=p.id and je.status='POSTED' and not exists(select 1 from finance.billing_batch_items bi where bi.accrual_id=a.id and bi.status='ACTIVE') order by a.id for update of a,oi;

  select pg_catalog.count(*),coalesce(pg_catalog.sum(pg_catalog.round(a.net_amount*oi.open_amount/a.gross_amount,8)),0),coalesce(pg_catalog.sum(oi.open_amount-pg_catalog.round(a.net_amount*oi.open_amount/a.gross_amount,8)),0),coalesce(pg_catalog.sum(oi.open_amount),0),pg_catalog.encode(extensions.digest(pg_catalog.convert_to(pg_catalog.string_agg(a.id::text||':'||oi.open_amount::text,'|' order by a.id),'UTF8'),'sha256'),'hex')
    into v_count,v_net,v_tax,v_gross,v_content
    from finance.accruals a join finance.journal_entries je on je.id=a.journal_entry_id
    join finance.open_items oi on oi.accrual_id=a.id and oi.item_type='DEBIT' and oi.status in('OPEN','PARTIALLY_ALLOCATED') and oi.open_amount>0
    where a.legal_entity_id=p_legal_entity_id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id and a.currency_code=p.currency_code and a.status='POSTED' and a.reversal_of_id is null and a.gross_amount>0 and je.finance_period_id=p.id and je.status='POSTED' and not exists(select 1 from finance.billing_batch_items bi where bi.accrual_id=a.id and bi.status='ACTIVE');
  if v_count=0 then
    if coalesce((v_credit->>'applicationCount')::integer,0)<=0 then raise exception using errcode='23514',message='eligible unbilled open accruals required';end if;
    insert into finance.royalty_credit_settlement_runs(
      legal_entity_id,finance_period_id,dealer_account_id,branch_id,idempotency_key,intent_hash,currency_code,
      application_count,applied_amount,status,created_by,correlation_id
    ) values(
      p_legal_entity_id,p.id,p_dealer_account_id,p_branch_id,p_idempotency_key,p_intent_hash,p.currency_code,
      (v_credit->>'applicationCount')::integer,(v_credit->>'appliedAmount')::numeric,'SETTLED_BY_CREDIT',p_actor_id,p_correlation_id
    ) returning * into v_settlement;
    update finance.royalty_credit_applications rca set billing_batch_id=null
      where rca.billing_batch_id is null and rca.legal_entity_id=p_legal_entity_id and rca.dealer_account_id=p_dealer_account_id
        and rca.branch_id=p_branch_id and rca.correlation_id=p_correlation_id;
    insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)
      values(p_legal_entity_id,'finance.billing','ROYALTY_DEBITS_SETTLED_BY_CREDIT','royalty_credit_settlement',v_settlement.id,1,
        pg_catalog.jsonb_build_object('settlementRunId',v_settlement.id,'financePeriodId',p.id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'royaltyCredit',v_credit),p_intent_hash,'PENDING',p_correlation_id);
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));
    select ae.integrity_hash into v_previous from finance.audit_events ae where ae.legal_entity_id=p_legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;
    v_audit:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous,'GENESIS')||':'||v_settlement.id::text||':ROYALTY_DEBITS_SETTLED_BY_CREDIT:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
    insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)
      values(p_legal_entity_id,p_actor_id,'SYSTEM','ROYALTY_DEBITS_SETTLED_BY_CREDIT','royalty_credit_settlement',v_settlement.id,'ALLOW',p_intent_hash,v_previous,v_audit,
        pg_catalog.jsonb_build_object('dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'applicationCount',v_credit->>'applicationCount','appliedAmount',v_credit->>'appliedAmount','currency',p.currency_code),p_correlation_id);
    return pg_catalog.jsonb_build_object('outcome','SETTLED_BY_CREDIT','settlementRunId',v_settlement.id,'financePeriodId',p.id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'currencyCode',p.currency_code,'status','SETTLED_BY_CREDIT','royaltyCredit',v_credit,'controlTotals',pg_catalog.jsonb_build_object('netAmount','0.00000000','taxAmount','0.00000000','grossAmount','0.00000000','currency',p.currency_code),'version',1);
  end if;
  if v_gross<=0 or v_gross<>v_net+v_tax then raise exception using errcode='23514',message='eligible unbilled open accrual totals are invalid';end if;
  v_batch_no:='BIL-'||pg_catalog.to_char(pg_catalog.statement_timestamp(),'YYYYMMDDHH24MISS')||'-'||pg_catalog.substr(v_id::text,1,8);
  insert into finance.billing_batches(id,legal_entity_id,finance_period_id,dealer_account_id,branch_id,idempotency_key,intent_hash,batch_no,grouping_profile_code,currency_code,control_net,control_tax,control_gross,content_hash,status,created_by,correlation_id)
    values(v_id,p_legal_entity_id,p.id,p_dealer_account_id,p_branch_id,p_idempotency_key,p_intent_hash,v_batch_no,p_grouping_profile_code,p.currency_code,v_net,v_tax,v_gross,v_content,'READY',p_actor_id,p_correlation_id);
  insert into finance.billing_batch_items(billing_batch_id,accrual_id,net_amount,tax_amount,gross_amount,status,created_by,correlation_id)
    select v_id,a.id,pg_catalog.round(a.net_amount*oi.open_amount/a.gross_amount,8),oi.open_amount-pg_catalog.round(a.net_amount*oi.open_amount/a.gross_amount,8),oi.open_amount,'ACTIVE',p_actor_id,p_correlation_id
    from finance.accruals a join finance.journal_entries je on je.id=a.journal_entry_id
    join finance.open_items oi on oi.accrual_id=a.id and oi.item_type='DEBIT' and oi.status in('OPEN','PARTIALLY_ALLOCATED') and oi.open_amount>0
    where a.legal_entity_id=p_legal_entity_id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id and a.currency_code=p.currency_code and a.status='POSTED' and a.reversal_of_id is null and a.gross_amount>0 and je.finance_period_id=p.id and je.status='POSTED' and not exists(select 1 from finance.billing_batch_items bi where bi.accrual_id=a.id and bi.status='ACTIVE') order by a.id;
  update finance.royalty_credit_applications rca set billing_batch_id=v_id
    where rca.billing_batch_id is null and rca.legal_entity_id=p_legal_entity_id and rca.dealer_account_id=p_dealer_account_id and rca.branch_id=p_branch_id
      and exists(select 1 from finance.billing_batch_items bi where bi.billing_batch_id=v_id and bi.accrual_id=rca.debit_accrual_id);
  if (select pg_catalog.count(*) from finance.billing_batch_items bi where bi.billing_batch_id=v_id and bi.status='ACTIVE')<>v_count then raise exception using errcode='23514',message='billing batch item coverage mismatch';end if;
  v_payload:=pg_catalog.jsonb_build_object('batchId',v_id,'financePeriodId',p.id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'currencyCode',p.currency_code,'itemCount',v_count,'contentHash',v_content,'royaltyCredit',v_credit,'controlTotals',pg_catalog.jsonb_build_object('netAmount',v_net::text,'taxAmount',v_tax::text,'grossAmount',v_gross::text,'currency',p.currency_code));
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id) values(p_legal_entity_id,'finance.billing','BILLING_BATCH_READY','billing_batch',v_id,1,v_payload,p_intent_hash,'PENDING',p_correlation_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));select ae.integrity_hash into v_previous from finance.audit_events ae where ae.legal_entity_id=p_legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;v_audit:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous,'GENESIS')||':'||v_id::text||':BILLING_BATCH_READY:'||v_content||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id) values(p_legal_entity_id,p_actor_id,'USER','BILLING_BATCH_READY','billing_batch',v_id,'ALLOW',v_content,v_previous,v_audit,pg_catalog.jsonb_build_object('dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'itemCount',v_count,'royaltyCreditAppliedAmount',v_credit->>'appliedAmount'),p_correlation_id);
  return pg_catalog.jsonb_build_object('outcome','CREATED','batchId',v_id,'financePeriodId',p.id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'currencyCode',p.currency_code,'status','READY','contentHash',v_content,'royaltyCredit',v_credit,'controlTotals',pg_catalog.jsonb_build_object('netAmount',v_net::text,'taxAmount',v_tax::text,'grossAmount',v_gross::text,'currency',p.currency_code),'version',1);
end $$;

revoke all on function finance_api.commit_billing_batch_creation(uuid,uuid,uuid,uuid,uuid,text,text,text,uuid)
  from public,anon,authenticated;
grant execute on function finance_api.commit_billing_batch_creation(uuid,uuid,uuid,uuid,uuid,text,text,text,uuid)
  to service_role;
