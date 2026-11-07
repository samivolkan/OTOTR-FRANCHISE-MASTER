\set ON_ERROR_STOP on

with parameters as (
  select
    :'environment_id'::text as environment_id,
    :'deployed_commit'::text as deployed_commit,
    :'cutoff_at_utc'::timestamptz as cutoff_at_utc,
    pg_catalog.string_to_array(:'branch_codes_csv'::text, ',') as branch_codes
), scope as (
  select b.id, b.branch_code
  from finance.branches b cross join parameters p
  where b.branch_code = any(p.branch_codes)
), source_totals as (
  select
    count(*)::numeric as event_count,
    coalesce(sum(case when event_type='customer-payment.settled' then (payload->>'collectedGrossAmount')::numeric else 0 end),0) as collected,
    coalesce(sum(case when event_type='customer-payment.refunded' then (payload->>'refundedGrossAmount')::numeric else 0 end),0) as refunded
  from finance.source_events e cross join parameters p where e.branch_id in(select id from scope) and e.created_at_utc<=p.cutoff_at_utc
), accrual_totals as (
  select coalesce(sum(a.gross_amount),0) as gross from finance.accruals a cross join parameters p where a.branch_id in(select id from scope) and a.created_at_utc<=p.cutoff_at_utc
), journal_totals as (
  select coalesce(sum(l.debit_amount),0) as debit,coalesce(sum(l.credit_amount),0) as credit
  from finance.journal_lines l join finance.journal_entries e on e.id=l.journal_entry_id cross join parameters p
  where l.branch_id in(select id from scope) and e.created_at_utc<=p.cutoff_at_utc
), open_item_totals as (
  select
    coalesce(sum(case when item_type='DEBIT' then original_amount else 0 end),0) as debit,
    coalesce(sum(case when item_type='CREDIT' then original_amount else 0 end),0) as credit
  from finance.open_items o cross join parameters p where o.branch_id in(select id from scope) and o.created_at_utc<=p.cutoff_at_utc
), payment_totals as (
  select coalesce(sum(pmt.verified_amount),0) as total from finance.payments pmt cross join parameters p
  where pmt.branch_id in(select id from scope) and pmt.created_at_utc<=p.cutoff_at_utc
), allocation_totals as (
  select coalesce(sum(case when pa.status='ACTIVE' then pa.amount else 0 end),0) as total
  from finance.payment_allocations pa join finance.payments pmt on pmt.id=pa.payment_id cross join parameters p
  where pmt.branch_id in(select id from scope) and pa.created_at_utc<=p.cutoff_at_utc
), billing_totals as (
  select coalesce(sum(b.control_gross),0) as gross from finance.billing_batches b cross join parameters p
  where b.branch_id in(select id from scope) and b.created_at_utc<=p.cutoff_at_utc
), accounting_totals as (
  select coalesce(sum(ap.debit_total-ap.credit_total),0) as balance
  from finance.accounting_batch_packages ap cross join parameters p
  where ap.branch_id in(select id from scope) and ap.created_at_utc<=p.cutoff_at_utc
)
select pg_catalog.jsonb_pretty(pg_catalog.jsonb_build_object(
  'schemaVersion',1,
  'dataClassification','SYNTHETIC_OR_ANONYMIZED',
  'productionDataUsed',false,
  'environmentId',p.environment_id,
  'deployedCommit',p.deployed_commit,
  'cutoffAtUtc',pg_catalog.to_char(p.cutoff_at_utc at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'),
  'identityReferences',coalesce((select pg_catalog.jsonb_agg('BRANCH:'||branch_code order by branch_code) from scope),'[]'::jsonb),
  'controlTotals',pg_catalog.jsonb_build_object(
    'SOURCE_EVENT_COUNT',s.event_count::text,'COLLECTED_GROSS',s.collected::text,'REFUNDED_GROSS',s.refunded::text,
    'ACCRUAL_GROSS',a.gross::text,'JOURNAL_DEBIT',j.debit::text,'JOURNAL_CREDIT',j.credit::text,
    'OPEN_ITEM_DEBIT',o.debit::text,'OPEN_ITEM_CREDIT',o.credit::text,'PAYMENT_TOTAL',pay.total::text,
    'ALLOCATION_TOTAL',al.total::text,'BILLING_GROSS',b.gross::text,'ACCOUNTING_EXPORT_BALANCE',ac.balance::text
  )
))
from parameters p cross join source_totals s cross join accrual_totals a cross join journal_totals j
cross join open_item_totals o cross join payment_totals pay cross join allocation_totals al
cross join billing_totals b cross join accounting_totals ac;

