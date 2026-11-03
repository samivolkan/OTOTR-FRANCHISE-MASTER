-- Server-side branch operation lock derived from overdue issued royalty invoices.

create table finance.branch_operation_access_states(
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  access_state text not null check(access_state in('OPEN','LOCKED_OVERDUE')),
  reason_code text null check(reason_code is null or reason_code='ROYALTY_INVOICE_OVERDUE'),
  blocking_open_item_id uuid null references finance.open_items(id) on delete restrict,
  blocking_invoice_count integer not null default 0 check(blocking_invoice_count>=0),
  blocking_open_amount numeric(24,8) not null default 0 check(blocking_open_amount>=0),
  currency_code text not null check(currency_code~'^[A-Z]{3}$'),
  evaluated_on date not null,evaluated_at_utc timestamptz not null,
  locked_at_utc timestamptz null,unlocked_at_utc timestamptz null,
  version bigint not null default 1 check(version>0),
  created_at_utc timestamptz not null default now(),created_by uuid not null,correlation_id uuid not null,
  unique(legal_entity_id,dealer_account_id,branch_id),
  check((access_state='OPEN' and reason_code is null and blocking_open_item_id is null and blocking_invoice_count=0 and blocking_open_amount=0)
     or(access_state='LOCKED_OVERDUE' and reason_code='ROYALTY_INVOICE_OVERDUE' and blocking_open_item_id is not null and blocking_invoice_count>0 and blocking_open_amount>0))
);
create index branch_operation_access_locked_idx on finance.branch_operation_access_states(legal_entity_id,access_state,evaluated_on);
alter table finance.branch_operation_access_states enable row level security;
alter table finance.branch_operation_access_states force row level security;
revoke all on finance.branch_operation_access_states from public,anon,authenticated;

create or replace function finance_private.current_branch_access_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
revoke all on function finance_private.current_branch_access_worker_is_trusted() from public,anon,authenticated;

create or replace function finance_api.evaluate_branch_operation_access(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_business_date date,p_correlation_id uuid
)returns jsonb language plpgsql security definer set search_path='' as $$
declare v_old finance.branch_operation_access_states%rowtype;v_new finance.branch_operation_access_states%rowtype;
  v_count integer;v_amount numeric(24,8);v_item uuid;v_currency text;v_state text;v_reason text;
  v_now timestamptz:=pg_catalog.statement_timestamp();v_payload jsonb;v_hash text;v_prev text;v_audit text;
begin
  if not finance_private.current_branch_access_worker_is_trusted()then raise exception using errcode='42501',message='branch access worker denied';end if;
  if p_actor_id is null or p_legal_entity_id is null or p_dealer_account_id is null or p_branch_id is null or p_business_date is null or p_correlation_id is null then raise exception using errcode='22023',message='branch access scope is incomplete';end if;
  if not exists(select 1 from finance.dealer_accounts da join finance.branches b on b.id=p_branch_id and b.legal_entity_id=da.legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id where da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and da.status in('SHADOW','ACTIVE')and b.status='ACTIVE')then raise exception using errcode='42501',message='branch access scope denied';end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('branch-access:'||p_legal_entity_id::text||':'||p_dealer_account_id::text||':'||p_branch_id::text,0));
  select * into v_old from finance.branch_operation_access_states s where s.legal_entity_id=p_legal_entity_id and s.dealer_account_id=p_dealer_account_id and s.branch_id=p_branch_id for update;
  select pg_catalog.count(distinct ei.id),coalesce(pg_catalog.sum(oi.open_amount),0),pg_catalog.min(oi.id::text)::uuid,pg_catalog.min(oi.currency_code)
    into v_count,v_amount,v_item,v_currency
    from finance.open_items oi join finance.accruals a on a.id=oi.accrual_id
    join finance.fee_definitions fd on fd.id=a.fee_definition_id and fd.fee_family='ROYALTY'
    join finance.billing_batch_items bi on bi.accrual_id=a.id and bi.status='ACTIVE'
    join finance.external_invoice_lines eil on eil.billing_batch_item_id=bi.id
    join finance.external_invoices ei on ei.id=eil.external_invoice_id and ei.status='ISSUED'
   where oi.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id and oi.branch_id=p_branch_id
     and oi.item_type='DEBIT' and oi.status in('OPEN','PARTIALLY_ALLOCATED')and oi.open_amount>0 and oi.due_date<p_business_date;
  if v_count>0 then v_state:='LOCKED_OVERDUE';v_reason:='ROYALTY_INVOICE_OVERDUE';
  else v_state:='OPEN';v_reason:=null;v_item:=null;v_amount:=0;select da.currency_code into v_currency from finance.dealer_accounts da where da.id=p_dealer_account_id;end if;
  insert into finance.branch_operation_access_states(legal_entity_id,dealer_account_id,branch_id,access_state,reason_code,blocking_open_item_id,blocking_invoice_count,blocking_open_amount,currency_code,evaluated_on,evaluated_at_utc,locked_at_utc,unlocked_at_utc,created_by,correlation_id)
  values(p_legal_entity_id,p_dealer_account_id,p_branch_id,v_state,v_reason,v_item,v_count,v_amount,v_currency,p_business_date,v_now,case when v_state='LOCKED_OVERDUE'then v_now end,null,p_actor_id,p_correlation_id)
  on conflict(legal_entity_id,dealer_account_id,branch_id)do update set access_state=excluded.access_state,reason_code=excluded.reason_code,blocking_open_item_id=excluded.blocking_open_item_id,blocking_invoice_count=excluded.blocking_invoice_count,blocking_open_amount=excluded.blocking_open_amount,currency_code=excluded.currency_code,evaluated_on=excluded.evaluated_on,evaluated_at_utc=excluded.evaluated_at_utc,locked_at_utc=case when finance.branch_operation_access_states.access_state='OPEN'and excluded.access_state='LOCKED_OVERDUE'then excluded.evaluated_at_utc else finance.branch_operation_access_states.locked_at_utc end,unlocked_at_utc=case when finance.branch_operation_access_states.access_state='LOCKED_OVERDUE'and excluded.access_state='OPEN'then excluded.evaluated_at_utc else finance.branch_operation_access_states.unlocked_at_utc end,version=finance.branch_operation_access_states.version+1,correlation_id=excluded.correlation_id returning * into v_new;
  if (v_old.id is null and v_new.access_state='LOCKED_OVERDUE')or(v_old.id is not null and v_old.access_state<>v_new.access_state)then
    v_payload:=pg_catalog.jsonb_build_object('accessStateId',v_new.id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'previousState',coalesce(v_old.access_state,'OPEN'),'accessState',v_new.access_state,'reasonCode',v_new.reason_code,'blockingInvoiceCount',v_new.blocking_invoice_count,'blockingOpenAmount',v_new.blocking_open_amount::text,'currency',v_new.currency_code,'evaluatedOn',v_new.evaluated_on,'correlationId',p_correlation_id);
    v_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(v_payload::text,'UTF8'),'sha256'),'hex');
    insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)values(p_legal_entity_id,'finance.branch-access',case when v_new.access_state='LOCKED_OVERDUE'then'BRANCH_OPERATIONS_LOCKED_OVERDUE'else'BRANCH_OPERATIONS_UNLOCKED_PAYMENT_VERIFIED'end,'branch_operation_access',v_new.id,v_new.version,v_payload,v_hash,'PENDING',p_correlation_id);
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||p_legal_entity_id::text,0));select ae.integrity_hash into v_prev from finance.audit_events ae where ae.legal_entity_id=p_legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;v_audit:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_prev,'GENESIS')||':'||v_new.id::text||':'||case when v_new.access_state='LOCKED_OVERDUE'then'BRANCH_OPERATIONS_LOCKED_OVERDUE'else'BRANCH_OPERATIONS_UNLOCKED_PAYMENT_VERIFIED'end||':'||v_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)values(p_legal_entity_id,p_actor_id,'SYSTEM',case when v_new.access_state='LOCKED_OVERDUE'then'BRANCH_OPERATIONS_LOCKED_OVERDUE'else'BRANCH_OPERATIONS_UNLOCKED_PAYMENT_VERIFIED'end,'branch_operation_access',v_new.id,'ALLOW',v_hash,v_prev,v_audit,v_payload-'blockingOpenAmount',p_correlation_id);
  end if;
  return pg_catalog.jsonb_build_object('accessStateId',v_new.id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'accessState',v_new.access_state,'reasonCode',v_new.reason_code,'paymentRequired',v_new.access_state='LOCKED_OVERDUE','blockingInvoiceCount',v_new.blocking_invoice_count,'blockingOpenAmount',v_new.blocking_open_amount::text,'currency',v_new.currency_code,'evaluatedOn',v_new.evaluated_on,'evaluatedAtUtc',v_new.evaluated_at_utc,'version',v_new.version,'correlationId',p_correlation_id,'rawPaymentDataExposed',false);
end$$;

create or replace function finance_api.authorize_branch_operation_access(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_capability text,p_business_date date,p_correlation_id uuid
)returns jsonb language plpgsql security definer set search_path='' as $$
declare v jsonb;v_allowed boolean;v_safe constant text[]:=array['PAYMENT','INVOICE_READ','STATEMENT_READ','SUPPORT','LOGOUT'];
begin
  if p_capability!~'^[A-Z][A-Z0-9_]{1,63}$'then raise exception using errcode='22023',message='invalid branch capability';end if;
  v:=finance_api.evaluate_branch_operation_access(p_actor_id,p_legal_entity_id,p_dealer_account_id,p_branch_id,p_business_date,p_correlation_id);
  v_allowed:=v->>'accessState'='OPEN'or p_capability=any(v_safe);
  return v||pg_catalog.jsonb_build_object('capability',p_capability,'allowed',v_allowed,'allowedWhileLocked',case when v->>'accessState'='LOCKED_OVERDUE'then pg_catalog.to_jsonb(v_safe)else'[]'::jsonb end,'denialCode',case when not v_allowed then'BRANCH_FINANCE_LOCKED'end);
end$$;

revoke all on function finance_api.evaluate_branch_operation_access(uuid,uuid,uuid,uuid,date,uuid)from public,anon,authenticated;
revoke all on function finance_api.authorize_branch_operation_access(uuid,uuid,uuid,uuid,text,date,uuid)from public,anon,authenticated;
grant execute on function finance_api.evaluate_branch_operation_access(uuid,uuid,uuid,uuid,date,uuid)to service_role;
grant execute on function finance_api.authorize_branch_operation_access(uuid,uuid,uuid,uuid,text,date,uuid)to service_role;
