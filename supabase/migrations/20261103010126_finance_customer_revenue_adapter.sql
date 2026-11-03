-- Canonical branch customer-revenue adapter projection.
-- External accounting products send daily aggregate totals only; customer rows and raw payloads are not exposed.

create table finance.branch_customer_revenue_snapshots(
 id uuid primary key default gen_random_uuid(),
 legal_entity_id uuid not null references finance.legal_entities(id)on delete restrict,
 dealer_account_id uuid not null references finance.dealer_accounts(id)on delete restrict,
 branch_id uuid not null references finance.branches(id)on delete restrict,
 inbox_message_id uuid not null references finance.inbox_messages(id)on delete restrict,
 source_system text not null check(source_system~'^[A-Z0-9][A-Z0-9._-]{1,79}$'),
 source_message_id text not null check(pg_catalog.length(source_message_id)between 1 and 200),
 as_of_date date not null,currency_code text not null check(currency_code~'^[A-Z]{3}$'),
 collected_gross_amount numeric(24,8)not null check(collected_gross_amount>=0),
 refunded_gross_amount numeric(24,8)not null check(refunded_gross_amount>=0),
 net_customer_revenue_amount numeric(24,8)generated always as(collected_gross_amount-refunded_gross_amount)stored,
 source_record_count integer not null check(source_record_count>=0),
 payload_hash text not null check(payload_hash~'^[a-f0-9]{64}$'),
 adapter_contract_version text not null check(pg_catalog.btrim(adapter_contract_version)<>''),
 received_at_utc timestamptz not null default pg_catalog.clock_timestamp(),created_by uuid not null,correlation_id uuid not null,
 check(refunded_gross_amount<=collected_gross_amount),unique(source_system,source_message_id)
);
create index branch_customer_revenue_lookup_idx on finance.branch_customer_revenue_snapshots(legal_entity_id,dealer_account_id,branch_id,as_of_date,currency_code,received_at_utc desc);
alter table finance.branch_customer_revenue_snapshots enable row level security;alter table finance.branch_customer_revenue_snapshots force row level security;
revoke all on table finance.branch_customer_revenue_snapshots from public,anon,authenticated;

create or replace function finance_private.guard_customer_revenue_snapshot_immutability()returns trigger language plpgsql set search_path=''as $$begin raise exception using errcode='55000',message='customer revenue snapshots are immutable';end$$;
create trigger branch_customer_revenue_snapshot_immutability before update or delete on finance.branch_customer_revenue_snapshots for each row execute function finance_private.guard_customer_revenue_snapshot_immutability();

create or replace function finance_private.current_customer_revenue_adapter_is_trusted()returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(pg_catalog.current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_api.commit_branch_customer_revenue_snapshot(
 p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_source_system text,p_source_message_id text,p_as_of date,p_currency_code text,p_collected_gross_amount numeric,p_refunded_gross_amount numeric,p_source_record_count integer,p_payload_hash text,p_adapter_contract_version text,p_correlation_id uuid
)returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private as $$
declare v_inbox uuid;v_snapshot uuid;v_existing record;v_safe_payload jsonb;
begin
 if not finance_private.current_customer_revenue_adapter_is_trusted()then raise exception using errcode='42501',message='trusted customer revenue adapter required';end if;
 if p_actor_id is null or p_source_system!~'^[A-Z0-9][A-Z0-9._-]{1,79}$'or pg_catalog.length(p_source_message_id)not between 1 and 200 or p_as_of is null or p_currency_code!~'^[A-Z]{3}$'or p_collected_gross_amount<0 or p_refunded_gross_amount<0 or p_refunded_gross_amount>p_collected_gross_amount or p_source_record_count<0 or p_payload_hash!~'^[a-f0-9]{64}$'or pg_catalog.btrim(coalesce(p_adapter_contract_version,''))=''then raise exception using errcode='22023',message='invalid customer revenue snapshot';end if;
 if not exists(select 1 from finance.dealer_accounts a join finance.branches b on b.dealer_legal_entity_id=a.dealer_legal_entity_id where a.id=p_dealer_account_id and a.legal_entity_id=p_legal_entity_id and a.currency_code=p_currency_code and a.status in('SHADOW','ACTIVE')and b.id=p_branch_id and b.legal_entity_id=p_legal_entity_id and b.status='ACTIVE')then raise exception using errcode='23514',message='invalid customer revenue scope';end if;
 select id,payload_hash,result_reference into v_existing from finance.inbox_messages where source_system=p_source_system and message_id=p_source_message_id;
 if found then return pg_catalog.jsonb_build_object('outcome',case when v_existing.payload_hash=p_payload_hash then'REPLAY'else'CONFLICT'end,'snapshotId',nullif(v_existing.result_reference,'')::uuid,'inboxMessageId',v_existing.id);end if;
 v_safe_payload:=pg_catalog.jsonb_build_object('schemaVersion',1,'aggregateType','BRANCH_CUSTOMER_REVENUE_DAILY','legalEntityId',p_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,'asOf',p_as_of,'currency',p_currency_code,'collectedGrossAmount',p_collected_gross_amount::text,'refundedGrossAmount',p_refunded_gross_amount::text,'sourceRecordCount',p_source_record_count,'adapterContractVersion',p_adapter_contract_version,'rawCustomerRecordsExposed',false);
 insert into finance.inbox_messages(legal_entity_id,source_system,message_id,payload_hash,schema_version,payload,status,correlation_id)values(p_legal_entity_id,p_source_system,p_source_message_id,p_payload_hash,1,v_safe_payload,'PROCESSING',p_correlation_id)returning id into v_inbox;
 insert into finance.branch_customer_revenue_snapshots(legal_entity_id,dealer_account_id,branch_id,inbox_message_id,source_system,source_message_id,as_of_date,currency_code,collected_gross_amount,refunded_gross_amount,source_record_count,payload_hash,adapter_contract_version,created_by,correlation_id)values(p_legal_entity_id,p_dealer_account_id,p_branch_id,v_inbox,p_source_system,p_source_message_id,p_as_of,p_currency_code,p_collected_gross_amount,p_refunded_gross_amount,p_source_record_count,p_payload_hash,p_adapter_contract_version,p_actor_id,p_correlation_id)returning id into v_snapshot;
 update finance.inbox_messages set status='PROCESSED',result_reference=v_snapshot::text,processed_at_utc=pg_catalog.clock_timestamp()where id=v_inbox;
 return pg_catalog.jsonb_build_object('outcome','CREATED','snapshotId',v_snapshot,'inboxMessageId',v_inbox,'netCustomerRevenueAmount',(p_collected_gross_amount-p_refunded_gross_amount)::text,'rawCustomerRecordsExposed',false);
end$$;

create or replace function finance_api.get_dealer_finance_summary(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_as_of date)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare v finance.dealer_finance_summary_snapshots%rowtype;r finance.branch_customer_revenue_snapshots%rowtype;v_families jsonb;v_branches jsonb;v_contribution jsonb;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDealerFinanceSummary')then raise exception using errcode='42501',message='finance scope denied';end if;
 select * into v from finance.dealer_finance_summary_snapshots where legal_entity_id=p_legal_entity_id and dealer_account_id=p_dealer_account_id and branch_id=p_branch_id and as_of_date=coalesce(p_as_of,current_date)order by calculated_at_utc desc,id desc limit 1;if not found then return null;end if;
 select * into r from finance.branch_customer_revenue_snapshots where legal_entity_id=p_legal_entity_id and dealer_account_id=p_dealer_account_id and branch_id=p_branch_id and as_of_date=v.as_of_date and currency_code=v.currency_code order by received_at_utc desc,id desc limit 1;
 if found then v_contribution:=pg_catalog.jsonb_build_object('status','CALCULATED','reasonCode',null,'amount',(r.net_customer_revenue_amount-v.accrued_gross)::text,'currency',v.currency_code,'customerNetRevenueAmount',r.net_customer_revenue_amount::text,'gmAccruedGrossAmount',v.accrued_gross::text,'method','CUSTOMER_NET_REVENUE_MINUS_GM_ACCRUALS','isAccountingProfit',false,'sourceSystem',r.source_system,'sourceAsOf',r.as_of_date,'adapterContractVersion',r.adapter_contract_version,'rawCustomerRecordsExposed',false);else v_contribution:=pg_catalog.jsonb_build_object('status','SOURCE_NOT_CONNECTED','reasonCode','CUSTOMER_REVENUE_ADAPTER_REQUIRED','amount',null,'currency',v.currency_code,'isAccountingProfit',false,'rawCustomerRecordsExposed',false);end if;
 select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('feeFamily',x.fee_family,'netAmount',x.net_amount::text,'taxAmount',x.tax_amount::text,'grossAmount',x.gross_amount::text,'currency',v.currency_code)order by x.fee_family),'[]'::jsonb)into v_families from(select fd.fee_family,coalesce(pg_catalog.sum(a.net_amount),0)net_amount,coalesce(pg_catalog.sum(a.tax_amount),0)tax_amount,coalesce(pg_catalog.sum(a.gross_amount),0)gross_amount from finance.accruals a join finance.fee_definitions fd on fd.id=a.fee_definition_id join finance.journal_entries je on je.id=a.journal_entry_id and je.status='POSTED'where a.legal_entity_id=p_legal_entity_id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id and a.currency_code=v.currency_code and a.status='POSTED'and je.business_date<=v.as_of_date group by fd.fee_family)x;
 select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('branchId',x.branch_id,'branchCode',x.branch_code,'accruedGrossAmount',x.accrued_gross::text,'collectedGrossAmount',x.collected_gross::text,'openGrossAmount',x.open_gross::text,'overdueGrossAmount',x.overdue_gross::text,'currency',x.currency_code)order by x.branch_code),'[]'::jsonb)into v_branches from(select distinct on(s.branch_id)s.branch_id,b.branch_code,s.accrued_gross,s.collected_gross,s.open_gross,s.overdue_gross,s.currency_code from finance.dealer_finance_summary_snapshots s join finance.branches b on b.id=s.branch_id and b.legal_entity_id=p_legal_entity_id where s.legal_entity_id=p_legal_entity_id and s.dealer_account_id=p_dealer_account_id and s.as_of_date=v.as_of_date and s.currency_code=v.currency_code and b.status='ACTIVE'and finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,s.branch_id,'getDealerFinanceSummary')order by s.branch_id,s.calculated_at_utc desc,s.id desc)x;
 return pg_catalog.jsonb_build_object('legalEntityId',v.legal_entity_id,'dealerAccountId',v.dealer_account_id,'branchId',v.branch_id,'asOf',v.as_of_date,'currencyCode',v.currency_code,'accrued',pg_catalog.jsonb_build_object('netAmount',v.accrued_net::text,'taxAmount',v.accrued_tax::text,'grossAmount',v.accrued_gross::text,'currency',v.currency_code),'invoiced',pg_catalog.jsonb_build_object('netAmount',v.invoiced_net::text,'taxAmount',v.invoiced_tax::text,'grossAmount',v.invoiced_gross::text,'currency',v.currency_code),'collected',pg_catalog.jsonb_build_object('netAmount',v.collected_net::text,'taxAmount',v.collected_tax::text,'grossAmount',v.collected_gross::text,'currency',v.currency_code),'open',pg_catalog.jsonb_build_object('netAmount',v.open_net::text,'taxAmount',v.open_tax::text,'grossAmount',v.open_gross::text,'currency',v.currency_code),'overdue',pg_catalog.jsonb_build_object('netAmount',v.overdue_net::text,'taxAmount',v.overdue_tax::text,'grossAmount',v.overdue_gross::text,'currency',v.currency_code),'unallocated',pg_catalog.jsonb_build_object('amount',v.unallocated_cash_amount::text,'currency',v.currency_code),'deducted',pg_catalog.jsonb_build_object('netAmount',v.deducted_net::text,'taxAmount',v.deducted_tax::text,'grossAmount',v.deducted_gross::text,'currency',v.currency_code),'refunded',pg_catalog.jsonb_build_object('netAmount',v.refunded_net::text,'taxAmount',v.refunded_tax::text,'grossAmount',v.refunded_gross::text,'currency',v.currency_code),'disputed',pg_catalog.jsonb_build_object('netAmount',v.disputed_net::text,'taxAmount',v.disputed_tax::text,'grossAmount',v.disputed_gross::text,'currency',v.currency_code),'feeFamilies',v_families,'branchBreakdown',v_branches,'operationalContribution',v_contribution,'calculatedAtUtc',v.calculated_at_utc,'readModelVersion',v.read_model_version);
end$$;

revoke all on function finance_private.guard_customer_revenue_snapshot_immutability()from public,anon,authenticated;
revoke all on function finance_private.current_customer_revenue_adapter_is_trusted()from public,anon,authenticated;
revoke all on function finance_api.commit_branch_customer_revenue_snapshot(uuid,uuid,uuid,uuid,text,text,date,text,numeric,numeric,integer,text,text,uuid)from public,anon,authenticated;
revoke all on function finance_api.get_dealer_finance_summary(uuid,uuid,uuid,date)from public,anon;
grant execute on function finance_api.commit_branch_customer_revenue_snapshot(uuid,uuid,uuid,uuid,text,text,date,text,numeric,numeric,integer,text,text,uuid)to service_role;
grant execute on function finance_api.get_dealer_finance_summary(uuid,uuid,uuid,date)to authenticated;
