-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-schema.sql
-- Source SHA256: 41F4487E93F417D41FF4405BA57B214CFBB3791DC520969A954AAD4C6D5A5C92
-- Local replay required before any staging promotion.
create schema if not exists finance;
create schema if not exists finance_api;
create schema if not exists finance_private;

revoke all on schema finance from public, anon, authenticated;
revoke all on schema finance_api from public, anon;
revoke all on schema finance_private from public, anon, authenticated;

create table finance.legal_entities (
  id uuid primary key default gen_random_uuid(),
  entity_code text not null unique,
  legal_name text not null,
  tax_identity_ciphertext text null,
  status text not null check (status in ('DRAFT','ACTIVE','SUSPENDED','CLOSED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(),
  created_by uuid not null,
  correlation_id uuid not null
);

create table finance.dealer_legal_entities (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_code text not null,
  legal_name text not null,
  status text not null check (status in ('DRAFT','ACTIVE','SUSPENDED','CLOSED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (legal_entity_id, dealer_code)
);

create table finance.branches (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_legal_entity_id uuid not null references finance.dealer_legal_entities(id) on delete restrict,
  branch_code text not null,
  external_branch_id text null,
  status text not null check (status in ('DRAFT','ACTIVE','SUSPENDED','CLOSED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (legal_entity_id, branch_code),
  unique (legal_entity_id, external_branch_id)
);

create table finance.branch_assignments (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  dealer_legal_entity_id uuid not null references finance.dealer_legal_entities(id) on delete restrict,
  valid_from date not null, valid_to date null,
  status text not null check (status in ('ACTIVE','SUPERSEDED','CANCELLED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (valid_to is null or valid_from < valid_to),
  unique (branch_id, valid_from)
);

create table finance.dealer_accounts (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_legal_entity_id uuid not null references finance.dealer_legal_entities(id) on delete restrict,
  account_code text not null,
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  status text not null check (status in ('SHADOW','ACTIVE','SUSPENDED','CLOSED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (legal_entity_id, dealer_legal_entity_id, currency_code),
  unique (legal_entity_id, account_code)
);

create table finance.fee_definitions (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid null references finance.legal_entities(id) on delete restrict,
  code text not null, version_no integer not null check (version_no > 0),
  fee_family text not null check (fee_family in ('ROYALTY','ENTRY_FRANCHISE','PERIODIC_FRANCHISE','QUERY','EXTERNAL_SERVICE','OPTIONAL_PRODUCT_SERVICE','PASS_THROUGH_EXPENSE','ADJUSTMENT')),
  name text not null,
  status text not null check (status in ('DRAFT','PUBLISHED','SUPERSEDED','DISABLED')),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (code, version_no)
);

create table finance.tax_codes (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  code text not null, description text not null,
  status text not null check (status in ('DRAFT','ACTIVE','DISABLED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (legal_entity_id, country_code, code)
);

create table finance.tax_code_versions (
  id uuid primary key default gen_random_uuid(),
  tax_code_id uuid not null references finance.tax_codes(id) on delete restrict,
  version_no integer not null check (version_no > 0),
  effective_from date not null, effective_to date null,
  calculation_method text not null,
  rate numeric(24,8) null check (rate is null or rate >= 0),
  calculation_payload jsonb not null default '{}'::jsonb,
  external_code text null, metadata jsonb not null default '{}'::jsonb,
  evidence_object_key text not null,
  status text not null check (status in ('DRAFT','PENDING_APPROVAL','APPROVED','ACTIVE','SUPERSEDED','REJECTED')),
  prepared_by uuid not null, approved_by uuid null, approved_at_utc timestamptz null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (effective_to is null or effective_from < effective_to),
  check (approved_by is null or approved_by <> prepared_by),
  unique (tax_code_id, version_no)
);

create table finance.accounting_mappings (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  fee_definition_id uuid not null references finance.fee_definitions(id) on delete restrict,
  version_no integer not null check (version_no > 0),
  effective_from date not null, effective_to date null,
  receivable_account_code text not null, revenue_account_code text not null, tax_account_code text not null, reversal_account_code text not null,
  erp_mapping_payload jsonb not null default '{}'::jsonb,
  status text not null check (status in ('DRAFT','PENDING_APPROVAL','APPROVED','ACTIVE','SUPERSEDED','REJECTED')),
  prepared_by uuid not null, approved_by uuid null, approved_at_utc timestamptz null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (effective_to is null or effective_from < effective_to),
  check (approved_by is null or approved_by <> prepared_by),
  unique (legal_entity_id, fee_definition_id, version_no)
);

create table finance.operational_accounts (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  account_code text not null check (pg_catalog.btrim(account_code) <> ''),
  account_name text not null check (pg_catalog.btrim(account_name) <> ''),
  account_type text not null check (account_type in ('ASSET','LIABILITY','REVENUE','EXPENSE','EQUITY','CLEARING')),
  currency_policy text not null check (currency_policy in ('ANY','FIXED')),
  currency_code text null check (currency_code is null or currency_code ~ '^[A-Z]{3}$'),
  erp_account_code text not null check (pg_catalog.btrim(erp_account_code) <> ''),
  status text not null check (status in ('DRAFT','PENDING_APPROVAL','APPROVED','ACTIVE','SUPERSEDED','DISABLED')),
  prepared_by uuid not null, approved_by uuid null, approved_at_utc timestamptz null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check ((currency_policy='ANY' and currency_code is null) or (currency_policy='FIXED' and currency_code is not null)),
  check (approved_by is null or approved_by <> prepared_by),
  unique (legal_entity_id, account_code)
);

create table finance.payment_account_mappings (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  payment_method_code text not null check (pg_catalog.btrim(payment_method_code) <> ''),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  version_no integer not null check (version_no > 0),
  effective_from date not null, effective_to date null,
  clearing_account_id uuid not null references finance.operational_accounts(id) on delete restrict,
  receivable_account_id uuid not null references finance.operational_accounts(id) on delete restrict,
  status text not null check (status in ('DRAFT','PENDING_APPROVAL','APPROVED','ACTIVE','SUPERSEDED','REJECTED')),
  prepared_by uuid not null, approved_by uuid null, approved_at_utc timestamptz null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (effective_to is null or effective_from < effective_to),
  check (clearing_account_id <> receivable_account_id), check (approved_by is null or approved_by <> prepared_by),
  unique (legal_entity_id, payment_method_code, currency_code, version_no)
);

create table finance.franchise_contracts (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_legal_entity_id uuid not null references finance.dealer_legal_entities(id) on delete restrict,
  contract_code text not null,
  status text not null check (status in ('DRAFT','ACTIVE','SUSPENDED','TERMINATED','DISCARDED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (legal_entity_id, contract_code)
);

create table finance.contract_versions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references finance.franchise_contracts(id) on delete restrict,
  version_no integer not null check (version_no > 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  effective_from date not null, effective_to date null,
  content_hash text not null,
  evidence_object_key text not null,
  status text not null check (status in ('DRAFT','PENDING_APPROVAL','APPROVED','ACTIVE','SUPERSEDED','REJECTED')),
  prepared_by uuid not null, approved_by uuid null, approved_at_utc timestamptz null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (effective_to is null or effective_from < effective_to),
  check (approved_by is null or approved_by <> prepared_by),
  unique (contract_id, version_no)
);

create table finance.contract_fee_rules (
  id uuid primary key default gen_random_uuid(),
  contract_version_id uuid not null references finance.contract_versions(id) on delete restrict,
  fee_definition_id uuid not null references finance.fee_definitions(id) on delete restrict,
  rule_code text not null,
  trigger_event_type text null,
  trigger_conditions jsonb null,
  priority integer not null default 0 check (priority >= 0),
  status text not null check (status in ('DRAFT','PENDING_APPROVAL','APPROVED','ACTIVE','SUPERSEDED','DISABLED')),
  configuration_status text not null check (configuration_status in ('UNCONFIGURED','CONFIGURED')),
  basis_definition jsonb null, calculation_method text null, calculation_parameters jsonb null,
  tax_code_version_id uuid null references finance.tax_code_versions(id) on delete restrict, due_rule jsonb null, cancellation_policy jsonb null,
  price_includes_tax boolean null,
  minimum_amount numeric(24,8) null check (minimum_amount is null or minimum_amount >= 0),
  maximum_amount numeric(24,8) null check (maximum_amount is null or maximum_amount >= 0),
  currency_code text null check (currency_code is null or currency_code ~ '^[A-Z]{3}$'),
  decimal_scale smallint null check (decimal_scale between 0 and 8),
  rounding_mode text null check (rounding_mode in ('HALF_UP','HALF_EVEN','DOWN','UP')),
  prepared_by uuid not null, approved_by uuid null, approved_at_utc timestamptz null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (contract_version_id, rule_code),
  check (approved_by is null or approved_by <> prepared_by),
  check (status not in ('APPROVED','ACTIVE','SUPERSEDED') or (approved_by is not null and approved_at_utc is not null)),
  check (minimum_amount is null or maximum_amount is null or minimum_amount <= maximum_amount),
  check (configuration_status = 'UNCONFIGURED' or (trigger_event_type is not null and trigger_conditions is not null and jsonb_typeof(trigger_conditions)='array' and basis_definition is not null and calculation_method is not null and calculation_parameters is not null and tax_code_version_id is not null and due_rule is not null and cancellation_policy is not null and price_includes_tax is not null and currency_code is not null and decimal_scale is not null and rounding_mode is not null)),
  check (configuration_status = 'CONFIGURED' or (trigger_event_type is null and trigger_conditions is null and basis_definition is null and calculation_method is null and calculation_parameters is null and tax_code_version_id is null and due_rule is null and cancellation_policy is null and price_includes_tax is null and minimum_amount is null and maximum_amount is null and currency_code is null and decimal_scale is null and rounding_mode is null))
);

create table finance.rule_exceptions (
  id uuid primary key default gen_random_uuid(),
  contract_fee_rule_id uuid not null references finance.contract_fee_rules(id) on delete restrict,
  exception_code text not null,
  scope_definition jsonb not null,
  condition_definition jsonb not null default '{}'::jsonb,
  override_definition jsonb not null,
  priority integer not null default 0 check (priority >= 0),
  effective_from date not null, effective_to date null,
  status text not null check (status in ('DRAFT','PENDING_APPROVAL','APPROVED','ACTIVE','SUPERSEDED','DISABLED')),
  prepared_by uuid not null, approved_by uuid null, approved_at_utc timestamptz null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (effective_to is null or effective_from < effective_to),
  check (approved_by is null or approved_by <> prepared_by),
  check (status not in ('APPROVED','ACTIVE') or (approved_by is not null and approved_at_utc is not null)),
  check (jsonb_typeof(scope_definition)='object' and jsonb_typeof(condition_definition)='object' and jsonb_typeof(override_definition)='object'),
  check (override_definition <> '{}'::jsonb),
  unique (contract_fee_rule_id, exception_code)
);

create table finance.finance_periods (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  parent_period_id uuid null references finance.finance_periods(id) on delete restrict,
  scope_type text not null check (scope_type in ('HEADQUARTERS','BRANCH')),
  dealer_account_id uuid null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid null references finance.branches(id) on delete restrict,
  period_start date not null, period_end date not null,
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  mode text not null check (mode in ('SHADOW','LIVE')),
  status text not null check (status in ('OPEN','SOURCE_FROZEN','CALCULATED','INTERNAL_REVIEW','SENT_TO_DEALER','DISPUTED','RECONCILED','APPROVED','LOCKED','REOPEN_PENDING','REOPENED')),
  source_snapshot_hash text null check (source_snapshot_hash is null or source_snapshot_hash ~ '^[a-fA-F0-9]{64}$'),
  check_snapshot_hash text null check (check_snapshot_hash is null or check_snapshot_hash ~ '^[a-fA-F0-9]{64}$'),
  prepared_by uuid null, approved_by uuid null, locked_at_utc timestamptz null,
  reopened_at_utc timestamptz null, reopened_by uuid null, reopen_reason_code text null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (period_start <= period_end), check (approved_by is null or approved_by <> prepared_by),
  check ((reopened_at_utc is null and reopened_by is null and reopen_reason_code is null) or (reopened_at_utc is not null and reopened_by is not null and pg_catalog.btrim(reopen_reason_code) <> '')),
  check ((scope_type='HEADQUARTERS' and parent_period_id is null and dealer_account_id is null and branch_id is null)
      or (scope_type='BRANCH' and parent_period_id is not null and dealer_account_id is not null and branch_id is not null))
);

create unique index finance_periods_headquarters_unique on finance.finance_periods(legal_entity_id,period_start,period_end,currency_code,mode) where scope_type='HEADQUARTERS';
create unique index finance_periods_branch_unique on finance.finance_periods(parent_period_id,dealer_account_id,branch_id) where scope_type='BRANCH';

create table finance.reconciliations (
  id uuid primary key default gen_random_uuid(),
  finance_period_id uuid not null references finance.finance_periods(id) on delete restrict,
  reconciliation_type text not null, run_no integer not null check (run_no > 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  source_total numeric(24,8) not null, ledger_total numeric(24,8) not null,
  difference_amount numeric(24,8) generated always as (source_total - ledger_total) stored,
  snapshot_hash text not null,
  status text not null check (status in ('MATCHED','MISMATCH','APPROVED_DIFFERENCE','LOCKED')),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (finance_period_id, reconciliation_type, run_no)
);

create table finance.source_events (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_legal_entity_id uuid not null references finance.dealer_legal_entities(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  source_system text not null, event_id uuid not null, event_type text not null,
  schema_version integer not null check (schema_version > 0),
  business_date date not null, occurred_at_utc timestamptz not null, received_at_utc timestamptz not null,
  aggregate_type text not null, aggregate_id text not null, aggregate_version bigint not null check (aggregate_version >= 0),
  payload jsonb not null, payload_hash text not null,
  status text not null check (status in ('RECEIVED','WAITING_PREDECESSOR','PROCESSING','PROCESSED','REJECTED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (source_system, event_id),
  unique (source_system, aggregate_type, aggregate_id, aggregate_version)
);

create table finance.calculation_runs (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  source_event_id uuid not null references finance.source_events(id) on delete restrict,
  contract_fee_rule_id uuid not null references finance.contract_fee_rules(id) on delete restrict,
  fee_definition_id uuid not null references finance.fee_definitions(id) on delete restrict,
  finance_period_id uuid not null references finance.finance_periods(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  run_type text not null check (run_type in ('LIVE','SHADOW','REPLAY')),
  status text not null check (status in ('STARTED','CALCULATED','POSTED','FAILED','SUPERSEDED')),
  business_date date not null,
  input_hash text not null, result_hash text null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null
);

create unique index calculation_runs_active_unique on finance.calculation_runs(source_event_id, contract_fee_rule_id, fee_definition_id, run_type) where status in ('STARTED','CALCULATED','POSTED');

create table finance.calculation_snapshots (
  id uuid primary key default gen_random_uuid(),
  calculation_run_id uuid not null unique references finance.calculation_runs(id) on delete restrict,
  contract_version_id uuid not null references finance.contract_versions(id) on delete restrict,
  rule_version_snapshot jsonb not null, tax_version_snapshot jsonb not null,
  input_snapshot jsonb not null, result_snapshot jsonb not null,
  snapshot_hash text not null unique,
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null
);

create table finance.journal_entries (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  finance_period_id uuid not null references finance.finance_periods(id) on delete restrict,
  idempotency_key text not null,
  intent_hash text not null check (intent_hash ~ '^[a-fA-F0-9]{64}$'),
  entry_type text not null, business_date date not null, posting_date date not null,
  status text not null check (status in ('DRAFT','POSTED','REVERSED')),
  reversal_of_id uuid null references finance.journal_entries(id) on delete restrict,
  posted_at_utc timestamptz null, posted_by uuid null,
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (reversal_of_id is null or reversal_of_id <> id),
  unique (legal_entity_id, idempotency_key)
);

create table finance.journal_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references finance.journal_entries(id) on delete restrict,
  line_no integer not null check (line_no > 0),
  dealer_account_id uuid null references finance.dealer_accounts(id) on delete restrict,
  account_code text not null,
  branch_id uuid null references finance.branches(id) on delete restrict,
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  debit_amount numeric(24,8) not null default 0 check (debit_amount >= 0),
  credit_amount numeric(24,8) not null default 0 check (credit_amount >= 0),
  dimensions jsonb not null default '{}'::jsonb,
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check ((debit_amount > 0) <> (credit_amount > 0)),
  unique (journal_entry_id, line_no)
);

create table finance.accruals (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  calculation_run_id uuid null references finance.calculation_runs(id) on delete restrict,
  pass_through_expense_id uuid null,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  journal_entry_id uuid not null references finance.journal_entries(id) on delete restrict,
  sequence_no integer not null check (sequence_no > 0),
  fee_definition_id uuid not null references finance.fee_definitions(id) on delete restrict,
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  net_amount numeric(24,8) not null, tax_amount numeric(24,8) not null, gross_amount numeric(24,8) not null,
  status text not null check (status in ('POSTED','REVERSED','DISPUTED')),
  reversal_of_id uuid null references finance.accruals(id) on delete restrict,
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (gross_amount = net_amount + tax_amount), check (reversal_of_id is null or reversal_of_id <> id),
  check ((calculation_run_id is not null) <> (pass_through_expense_id is not null)),
  unique (calculation_run_id, sequence_no)
);

create table finance.open_items (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  accrual_id uuid not null unique references finance.accruals(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  due_date date not null, currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  item_type text not null check (item_type in ('DEBIT','CREDIT')),
  original_amount numeric(24,8) not null check (original_amount >= 0),
  allocated_amount numeric(24,8) not null default 0 check (allocated_amount >= 0),
  open_amount numeric(24,8) not null check (open_amount >= 0),
  status text not null check (status in ('OPEN','PARTIALLY_ALLOCATED','CLOSED','DISPUTED','REVERSED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (original_amount = allocated_amount + open_amount)
);

create table finance.payments (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  journal_entry_id uuid null references finance.journal_entries(id) on delete restrict,
  idempotency_key text not null,
  intent_hash text not null check (intent_hash ~ '^[a-fA-F0-9]{64}$'),
  external_system text null, external_reference text not null check (pg_catalog.btrim(external_reference) <> ''),
  payment_date date not null, value_date date not null,
  payment_method_code text not null check (pg_catalog.btrim(payment_method_code) <> ''),
  bank_transaction_reference text null,
  description text null,
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  received_amount numeric(24,8) not null check (received_amount > 0),
  verified_amount numeric(24,8) not null default 0 check (verified_amount >= 0),
  allocated_amount numeric(24,8) not null default 0 check (allocated_amount >= 0),
  status text not null check (status in ('PENDING_VERIFICATION','VERIFIED','PARTIALLY_ALLOCATED','ALLOCATED','REVERSED','REJECTED')),
  prepared_by uuid not null, verified_by uuid null, verified_at_utc timestamptz null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (allocated_amount <= verified_amount), check (verified_by is null or verified_by <> prepared_by),
  unique (legal_entity_id, idempotency_key)
);

create unique index payments_external_reference_unique on finance.payments(legal_entity_id, external_reference);

create table finance.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references finance.payments(id) on delete restrict,
  open_item_id uuid not null references finance.open_items(id) on delete restrict,
  allocation_sequence integer not null check (allocation_sequence > 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  amount numeric(24,8) not null check (amount > 0),
  status text not null check (status in ('ACTIVE','REVERSED')),
  reversal_of_id uuid null references finance.payment_allocations(id) on delete restrict,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (reversal_of_id is null or reversal_of_id <> id),
  unique (payment_id, open_item_id, allocation_sequence)
);

create table finance.pass_through_expenses (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  fee_definition_id uuid not null references finance.fee_definitions(id) on delete restrict,
  supplier_reference text not null check (pg_catalog.btrim(supplier_reference) <> ''),
  supplier_reference_normalized text not null check (pg_catalog.btrim(supplier_reference_normalized) <> ''),
  contractual_basis_reference text not null check (pg_catalog.btrim(contractual_basis_reference) <> ''),
  expense_date date not null,
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  source_net_amount numeric(24,8) not null check (source_net_amount >= 0),
  source_tax_amount numeric(24,8) not null check (source_tax_amount >= 0),
  source_amount numeric(24,8) not null check (source_amount >= 0),
  distributable_net_amount numeric(24,8) not null check (distributable_net_amount >= 0),
  distributable_tax_amount numeric(24,8) not null check (distributable_tax_amount >= 0),
  distributable_amount numeric(24,8) not null check (distributable_amount >= 0),
  allocation_policy jsonb not null, evidence_object_key text not null, evidence_hash text not null,
  idempotency_key text not null check (pg_catalog.btrim(idempotency_key) <> ''),
  input_hash text not null check (input_hash ~ '^[a-fA-F0-9]{64}$'),
  note_hash text null check (note_hash is null or note_hash ~ '^[a-fA-F0-9]{64}$'),
  journal_entry_id uuid null references finance.journal_entries(id) on delete restrict,
  posting_idempotency_key text null,
  posting_intent_hash text null check (posting_intent_hash is null or posting_intent_hash ~ '^[a-fA-F0-9]{64}$'),
  posting_date date null,
  posted_by uuid null,
  reversal_journal_entry_id uuid null references finance.journal_entries(id) on delete restrict,
  reversal_idempotency_key text null,
  reversal_intent_hash text null check (reversal_intent_hash is null or reversal_intent_hash ~ '^[a-fA-F0-9]{64}$'),
  reversal_date date null, reversal_reason_code text null,
  reversal_note_hash text null check (reversal_note_hash is null or reversal_note_hash ~ '^[a-fA-F0-9]{64}$'),
  reversed_by uuid null, reversed_at_utc timestamptz null,
  status text not null check (status in ('DRAFT','CALCULATED','PENDING_APPROVAL','APPROVED','POSTED','REVERSED')),
  prepared_by uuid not null, approved_by uuid null,
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (approved_by is null or approved_by <> prepared_by),
  check (source_amount = source_net_amount + source_tax_amount),
  check (distributable_amount = distributable_net_amount + distributable_tax_amount),
  check (distributable_net_amount <= source_net_amount and distributable_tax_amount <= source_tax_amount and distributable_amount <= source_amount),
  check ((posting_idempotency_key is null and posting_intent_hash is null and posting_date is null and posted_by is null and journal_entry_id is null) or (pg_catalog.btrim(posting_idempotency_key) <> '' and posting_intent_hash is not null and posting_date is not null and posted_by is not null and journal_entry_id is not null)),
  check ((status = 'REVERSED') = (reversal_journal_entry_id is not null and pg_catalog.btrim(reversal_idempotency_key) <> '' and reversal_intent_hash is not null and reversal_date is not null and pg_catalog.btrim(reversal_reason_code) <> '' and reversed_by is not null and reversed_at_utc is not null)),
  unique (legal_entity_id, supplier_reference_normalized),
  unique (legal_entity_id, idempotency_key)
);

create table finance.expense_shares (
  id uuid primary key default gen_random_uuid(),
  pass_through_expense_id uuid not null references finance.pass_through_expenses(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  accrual_id uuid null references finance.accruals(id) on delete restrict,
  allocation_method text not null check (allocation_method in ('FIXED','EQUAL','QUANTITY')),
  distribution_rule_reference text not null check (pg_catalog.btrim(distribution_rule_reference) <> ''),
  basis_value numeric(24,8) not null check (basis_value >= 0),
  allocation_rate numeric(24,8) not null check (allocation_rate >= 0 and allocation_rate <= 1),
  net_amount numeric(24,8) not null check (net_amount >= 0),
  tax_amount numeric(24,8) not null check (tax_amount >= 0),
  share_amount numeric(24,8) not null check (share_amount >= 0),
  allocation_order integer not null check (allocation_order > 0),
  snapshot_hash text not null,
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (share_amount = net_amount + tax_amount),
  unique (pass_through_expense_id, dealer_account_id, branch_id)
);

alter table finance.accruals add constraint accruals_pass_through_expense_fk foreign key (pass_through_expense_id) references finance.pass_through_expenses(id) on delete restrict;
create unique index accruals_pass_through_sequence_unique on finance.accruals(pass_through_expense_id,sequence_no) where pass_through_expense_id is not null;

create table finance.disputes (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  case_no text not null, open_item_id uuid not null references finance.open_items(id) on delete restrict,
  disputed_amount numeric(24,8) not null check (disputed_amount > 0),
  accepted_amount numeric(24,8) null check (accepted_amount is null or (accepted_amount >= 0 and accepted_amount <= disputed_amount)),
  reason_code text not null, evidence_refs jsonb not null default '[]'::jsonb,
  decision_idempotency_key text null,
  decision_intent_hash text null check (decision_intent_hash is null or decision_intent_hash ~ '^[a-fA-F0-9]{64}$'),
  decision_reason_code text null, decision_note_hash text null check (decision_note_hash is null or decision_note_hash ~ '^[a-fA-F0-9]{64}$'),
  decision_journal_entry_id uuid null references finance.journal_entries(id) on delete restrict,
  decided_by uuid null, decided_at_utc timestamptz null,
  status text not null check (status in ('DRAFT','SUBMITTED','UNDER_REVIEW','ACCEPTED','PARTIALLY_ACCEPTED','REJECTED','CLOSED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (legal_entity_id, case_no), unique (legal_entity_id, decision_idempotency_key),
  check ((status in ('ACCEPTED','PARTIALLY_ACCEPTED','REJECTED','CLOSED')) = (decision_idempotency_key is not null and decision_intent_hash is not null and decision_reason_code is not null and decided_by is not null and decided_at_utc is not null)),
  check ((status in ('ACCEPTED','PARTIALLY_ACCEPTED')) = (decision_journal_entry_id is not null)),
  check ((status = 'ACCEPTED' and accepted_amount = disputed_amount) or (status = 'PARTIALLY_ACCEPTED' and accepted_amount > 0 and accepted_amount < disputed_amount) or (status = 'REJECTED' and accepted_amount = 0) or status not in ('ACCEPTED','PARTIALLY_ACCEPTED','REJECTED'))
);

create table finance.approval_requests (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  subject_type text not null, subject_id uuid not null, approval_policy_version text not null,
  prepared_by uuid not null,
  subject_snapshot jsonb null,
  subject_snapshot_hash text null check (subject_snapshot_hash is null or subject_snapshot_hash ~ '^[a-fA-F0-9]{64}$'),
  status text not null check (status in ('PENDING','APPROVED','REJECTED','CANCELLED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (subject_type, subject_id, approval_policy_version)
);

create table finance.approval_steps (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid not null references finance.approval_requests(id) on delete restrict,
  step_no integer not null check (step_no > 0), required_role text not null,
  decision text null check (decision in ('APPROVE','REJECT')),
  decided_by uuid null, decided_at_utc timestamptz null, evidence_ref text null,
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (decision is null or (decided_by is not null and decided_at_utc is not null and evidence_ref is not null)),
  unique (approval_request_id, step_no)
);

create table finance.billing_batches (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  finance_period_id uuid not null references finance.finance_periods(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  idempotency_key text not null check (pg_catalog.btrim(idempotency_key) <> ''),
  intent_hash text not null check (intent_hash ~ '^[a-fA-F0-9]{64}$'),
  batch_no text not null, grouping_profile_code text not null check (pg_catalog.btrim(grouping_profile_code) <> ''),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  control_net numeric(24,8) not null, control_tax numeric(24,8) not null, control_gross numeric(24,8) not null,
  content_hash text not null check (content_hash ~ '^[a-fA-F0-9]{64}$'),
  export_idempotency_key text null, export_intent_hash text null check (export_intent_hash is null or export_intent_hash ~ '^[a-fA-F0-9]{64}$'),
  target_adapter_code text null, mapping_version text null, export_job_id uuid null,
  export_queued_at_utc timestamptz null, export_queued_by uuid null,
  status text not null check (status in ('DRAFT','READY','EXPORT_QUEUED','EXPORTED','INVOICED','REJECTED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (control_gross = control_net + control_tax),
  check ((export_idempotency_key is null and export_intent_hash is null and target_adapter_code is null and mapping_version is null and export_job_id is null and export_queued_at_utc is null and export_queued_by is null) or (pg_catalog.btrim(export_idempotency_key)<>'' and export_intent_hash is not null and pg_catalog.btrim(target_adapter_code)<>'' and pg_catalog.btrim(mapping_version)<>'' and export_job_id is not null and export_queued_at_utc is not null and export_queued_by is not null)),
  unique (legal_entity_id, batch_no), unique (legal_entity_id,idempotency_key)
);

create table finance.billing_batch_items (
  id uuid primary key default gen_random_uuid(),
  billing_batch_id uuid not null references finance.billing_batches(id) on delete restrict,
  accrual_id uuid not null references finance.accruals(id) on delete restrict,
  net_amount numeric(24,8) not null, tax_amount numeric(24,8) not null, gross_amount numeric(24,8) not null,
  status text not null check (status in ('ACTIVE','CANCELLED')),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (gross_amount = net_amount + tax_amount),
  unique (billing_batch_id, accrual_id)
);

create unique index billing_batch_items_active_accrual_unique on finance.billing_batch_items(accrual_id) where status = 'ACTIVE';

create table finance.accounting_batches (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  finance_period_id uuid not null references finance.finance_periods(id) on delete restrict,
  idempotency_key text not null check (pg_catalog.btrim(idempotency_key) <> ''),
  intent_hash text not null check (intent_hash ~ '^[a-fA-F0-9]{64}$'),
  batch_no text not null check (pg_catalog.btrim(batch_no) <> ''),
  mapping_version text not null check (pg_catalog.btrim(mapping_version) <> ''),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  debit_total numeric(24,8) not null check (debit_total >= 0),
  credit_total numeric(24,8) not null check (credit_total >= 0),
  content_hash text not null check (content_hash ~ '^[a-fA-F0-9]{64}$'),
  export_idempotency_key text null,
  export_intent_hash text null check (export_intent_hash is null or export_intent_hash ~ '^[a-fA-F0-9]{64}$'),
  target_adapter_code text null,
  export_job_id uuid null,
  export_queued_at_utc timestamptz null,
  export_queued_by uuid null,
  external_batch_id text null check (external_batch_id is null or pg_catalog.btrim(external_batch_id) <> ''),
  status text not null check (status in ('DRAFT','READY','EXPORT_QUEUED','EXPORTED','PARTIALLY_ACCEPTED','ACCEPTED','REJECTED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (debit_total = credit_total),
  check ((export_idempotency_key is null and export_intent_hash is null and target_adapter_code is null and export_job_id is null and export_queued_at_utc is null and export_queued_by is null) or (pg_catalog.btrim(export_idempotency_key) <> '' and export_intent_hash is not null and pg_catalog.btrim(target_adapter_code) <> '' and export_job_id is not null and export_queued_at_utc is not null and export_queued_by is not null)),
  unique (legal_entity_id, idempotency_key),
  unique (legal_entity_id, batch_no)
);

create table finance.accounting_batch_packages (
  id uuid primary key default gen_random_uuid(),
  accounting_batch_id uuid not null references finance.accounting_batches(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  package_order integer not null check (package_order > 0),
  debit_total numeric(24,8) not null check (debit_total > 0),
  credit_total numeric(24,8) not null check (credit_total > 0),
  content_hash text not null check (content_hash ~ '^[a-fA-F0-9]{64}$'),
  external_package_id text null check (external_package_id is null or pg_catalog.btrim(external_package_id) <> ''),
  status text not null check (status in ('READY','EXPORT_QUEUED','ACCEPTED','REJECTED')),
  safe_error_code text null check (safe_error_code is null or pg_catalog.btrim(safe_error_code) <> ''),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (debit_total = credit_total),
  unique (accounting_batch_id, dealer_account_id, branch_id),
  unique (accounting_batch_id, package_order)
);

create table finance.accounting_batch_entries (
  id uuid primary key default gen_random_uuid(),
  accounting_batch_id uuid not null references finance.accounting_batches(id) on delete restrict,
  accounting_batch_package_id uuid not null references finance.accounting_batch_packages(id) on delete restrict,
  journal_entry_id uuid not null references finance.journal_entries(id) on delete restrict,
  entry_order integer not null check (entry_order > 0),
  snapshot_hash text not null check (snapshot_hash ~ '^[a-fA-F0-9]{64}$'),
  status text not null check (status in ('ACTIVE','CANCELLED')),
  export_status text not null default 'PENDING' check (export_status in ('PENDING','ACCEPTED','REJECTED')),
  safe_error_code text null check (safe_error_code is null or pg_catalog.btrim(safe_error_code) <> ''),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (accounting_batch_id, journal_entry_id),
  unique (accounting_batch_id, entry_order)
);

create unique index accounting_batch_entries_active_journal_unique on finance.accounting_batch_entries(journal_entry_id) where status='ACTIVE';
create index accounting_batches_period_idx on finance.accounting_batches(finance_period_id,status);
create index accounting_batch_packages_batch_idx on finance.accounting_batch_packages(accounting_batch_id,status);
create index accounting_batch_packages_dealer_branch_idx on finance.accounting_batch_packages(dealer_account_id,branch_id,status);
create index accounting_batch_packages_branch_idx on finance.accounting_batch_packages(branch_id,status);
create index accounting_batch_entries_package_idx on finance.accounting_batch_entries(accounting_batch_package_id,status);

create table finance.external_invoices (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  billing_batch_id uuid not null unique references finance.billing_batches(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  idempotency_key text not null,
  intent_hash text not null,
  external_system text not null, external_invoice_id text not null,
  invoice_number text null, invoice_date date null,
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  net_amount numeric(24,8) not null, tax_amount numeric(24,8) not null, gross_amount numeric(24,8) not null,
  status text not null check (status in ('PENDING','ISSUED','CANCELLED','CREDITED','REJECTED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (gross_amount = net_amount + tax_amount),
  unique (legal_entity_id, idempotency_key),
  unique (external_system, external_invoice_id)
);

create table finance.external_invoice_lines (
  id uuid primary key default gen_random_uuid(),
  external_invoice_id uuid not null references finance.external_invoices(id) on delete restrict,
  billing_batch_item_id uuid not null references finance.billing_batch_items(id) on delete restrict,
  line_no integer not null check (line_no > 0),
  net_amount numeric(24,8) not null, tax_amount numeric(24,8) not null, gross_amount numeric(24,8) not null,
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (gross_amount = net_amount + tax_amount),
  unique (external_invoice_id, line_no),
  unique (external_invoice_id, billing_batch_item_id)
);

create table finance.dealer_finance_summary_snapshots (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  branch_id uuid not null references finance.branches(id) on delete restrict,
  as_of_date date not null,
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  accrued_net numeric(24,8) not null, accrued_tax numeric(24,8) not null, accrued_gross numeric(24,8) not null,
  invoiced_net numeric(24,8) not null, invoiced_tax numeric(24,8) not null, invoiced_gross numeric(24,8) not null,
  collected_net numeric(24,8) not null, collected_tax numeric(24,8) not null, collected_gross numeric(24,8) not null,
  open_net numeric(24,8) not null, open_tax numeric(24,8) not null, open_gross numeric(24,8) not null,
  overdue_net numeric(24,8) not null, overdue_tax numeric(24,8) not null, overdue_gross numeric(24,8) not null,
  deducted_net numeric(24,8) not null, deducted_tax numeric(24,8) not null, deducted_gross numeric(24,8) not null,
  refunded_net numeric(24,8) not null, refunded_tax numeric(24,8) not null, refunded_gross numeric(24,8) not null,
  disputed_net numeric(24,8) not null, disputed_tax numeric(24,8) not null, disputed_gross numeric(24,8) not null,
  unallocated_cash_amount numeric(24,8) not null,
  read_model_version text not null check (pg_catalog.btrim(read_model_version) <> ''),
  source_watermark jsonb not null check (pg_catalog.jsonb_typeof(source_watermark)='object'),
  snapshot_hash text not null check (snapshot_hash ~ '^[a-fA-F0-9]{64}$'),
  calculated_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  check (accrued_gross=accrued_net+accrued_tax and invoiced_gross=invoiced_net+invoiced_tax and collected_gross=collected_net+collected_tax and open_gross=open_net+open_tax and overdue_gross=overdue_net+overdue_tax and deducted_gross=deducted_net+deducted_tax and refunded_gross=refunded_net+refunded_tax and disputed_gross=disputed_net+disputed_tax),
  check (least(accrued_net,accrued_tax,accrued_gross,invoiced_net,invoiced_tax,invoiced_gross,collected_net,collected_tax,collected_gross,open_net,open_tax,open_gross,overdue_net,overdue_tax,overdue_gross,deducted_net,deducted_tax,deducted_gross,refunded_net,refunded_tax,refunded_gross,disputed_net,disputed_tax,disputed_gross,unallocated_cash_amount)>=0),
  unique (legal_entity_id,dealer_account_id,branch_id,as_of_date,currency_code,read_model_version)
);

create table finance.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid null references finance.legal_entities(id) on delete restrict,
  source_system text not null, message_id text not null, payload_hash text not null,
  schema_version integer not null check (schema_version > 0), payload jsonb not null,
  status text not null check (status in ('RECEIVED','PROCESSING','PROCESSED','REJECTED','DEAD_LETTER')),
  result_reference text null, processed_at_utc timestamptz null,
  created_at_utc timestamptz not null default now(), correlation_id uuid not null,
  unique (source_system, message_id)
);

create table finance.outbox_messages (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid null references finance.legal_entities(id) on delete restrict,
  topic text not null, event_type text not null,
  aggregate_type text not null, aggregate_id uuid not null, aggregate_version bigint not null check (aggregate_version >= 0),
  payload jsonb not null, payload_hash text not null,
  status text not null check (status in ('PENDING','IN_FLIGHT','RETRYING','PUBLISHED','DEAD_LETTER')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  available_at_utc timestamptz not null default now(),
  lease_owner text null, lease_id uuid null, lease_until_utc timestamptz null,
  last_error_code text null, published_at_utc timestamptz null, external_ack_id text null,
  created_at_utc timestamptz not null default now(), correlation_id uuid not null,
  check ((lease_owner is null and lease_id is null and lease_until_utc is null) or (lease_owner is not null and lease_id is not null and lease_until_utc is not null)),
  unique (topic, aggregate_type, aggregate_id, aggregate_version)
);

create table finance.integration_errors (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid null references finance.legal_entities(id) on delete restrict,
  source_type text not null, source_id uuid not null,
  error_fingerprint text not null, occurrence_no integer not null check (occurrence_no > 0),
  error_code text not null, redacted_detail jsonb not null,
  status text not null check (status in ('OPEN','RETRY_SCHEDULED','RESOLVED','IGNORED_WITH_APPROVAL')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid null, correlation_id uuid not null,
  unique (source_type, source_id, error_fingerprint, occurrence_no)
);

create table finance.audit_events (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid null references finance.legal_entities(id) on delete restrict,
  actor_id uuid null, actor_type text not null,
  action_code text not null, subject_type text not null, subject_id uuid not null,
  decision text null, reason_code text null,
  before_hash text null, after_hash text null, previous_integrity_hash text null, integrity_hash text not null unique,
  safe_context jsonb not null default '{}'::jsonb,
  created_at_utc timestamptz not null default now(), correlation_id uuid not null
);

create table finance.document_references (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  external_document_id uuid not null,
  document_type text not null check (pg_catalog.btrim(document_type) <> ''),
  storage_provider text not null check (pg_catalog.btrim(storage_provider) <> ''),
  object_key text not null check (pg_catalog.btrim(object_key) <> ''),
  content_hash text not null check (content_hash ~ '^[a-fA-F0-9]{64}$'),
  status text not null check (status in ('PENDING','ACTIVE','REVOKED')),
  version bigint not null default 1 check (version > 0),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (legal_entity_id, external_document_id), unique (legal_entity_id, content_hash)
);

create table finance.document_links (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  document_reference_id uuid not null references finance.document_references(id) on delete restrict,
  subject_type text not null check (pg_catalog.btrim(subject_type) <> ''),
  subject_id uuid not null,
  purpose_code text not null check (pg_catalog.btrim(purpose_code) <> ''),
  created_at_utc timestamptz not null default now(), created_by uuid not null, correlation_id uuid not null,
  unique (document_reference_id, subject_type, subject_id, purpose_code)
);

-- Foreign-key and primary access-path indexes. PostgreSQL does not create FK indexes automatically.
create index dealer_legal_entities_legal_entity_idx on finance.dealer_legal_entities(legal_entity_id);
create index tax_codes_legal_entity_idx on finance.tax_codes(legal_entity_id, status);
create index tax_code_versions_tax_code_idx on finance.tax_code_versions(tax_code_id, status, effective_from);
create index accounting_mappings_scope_idx on finance.accounting_mappings(legal_entity_id, fee_definition_id, status, effective_from);
create index accounting_mappings_fee_definition_idx on finance.accounting_mappings(fee_definition_id);
create index operational_accounts_scope_idx on finance.operational_accounts(legal_entity_id, status, account_type);
create index payment_account_mappings_scope_idx on finance.payment_account_mappings(legal_entity_id, payment_method_code, currency_code, status, effective_from);
create index payment_account_mappings_clearing_idx on finance.payment_account_mappings(clearing_account_id);
create index payment_account_mappings_receivable_idx on finance.payment_account_mappings(receivable_account_id);
create index branches_scope_idx on finance.branches(legal_entity_id, dealer_legal_entity_id, status);
create index branch_assignments_scope_idx on finance.branch_assignments(legal_entity_id, dealer_legal_entity_id, branch_id, valid_from);
create index dealer_accounts_scope_idx on finance.dealer_accounts(legal_entity_id, dealer_legal_entity_id, status);
create index franchise_contracts_dealer_idx on finance.franchise_contracts(legal_entity_id, dealer_legal_entity_id, status);
create index contract_versions_contract_idx on finance.contract_versions(contract_id, status, effective_from);
create index contract_fee_rules_version_idx on finance.contract_fee_rules(contract_version_id, fee_definition_id);
create index rule_exceptions_rule_idx on finance.rule_exceptions(contract_fee_rule_id, status, effective_from);
create index rule_exceptions_scope_gin_idx on finance.rule_exceptions using gin(scope_definition jsonb_path_ops);
create index finance_periods_status_idx on finance.finance_periods(legal_entity_id, status, period_start);
create index finance_periods_branch_scope_idx on finance.finance_periods(legal_entity_id,dealer_account_id,branch_id,status,period_start) where scope_type='BRANCH';
create index finance_periods_parent_idx on finance.finance_periods(parent_period_id,status) where parent_period_id is not null;
create index finance_periods_dealer_account_idx on finance.finance_periods(dealer_account_id,status,period_start) where dealer_account_id is not null;
create index finance_periods_branch_idx on finance.finance_periods(branch_id,status,period_start) where branch_id is not null;
create index reconciliations_period_idx on finance.reconciliations(finance_period_id, status);
create index source_events_processing_idx on finance.source_events(status, received_at_utc) where status in ('RECEIVED','WAITING_PREDECESSOR','PROCESSING');
create index source_events_scope_idx on finance.source_events(legal_entity_id, dealer_legal_entity_id, branch_id, business_date);
create index source_events_dealer_legal_entity_idx on finance.source_events(dealer_legal_entity_id);
create index source_events_branch_idx on finance.source_events(branch_id);
create index calculation_runs_period_idx on finance.calculation_runs(finance_period_id, status);
create index journal_entries_period_idx on finance.journal_entries(finance_period_id, status, posting_date);
create index journal_lines_entry_idx on finance.journal_lines(journal_entry_id);
create index journal_lines_dealer_idx on finance.journal_lines(dealer_account_id, currency_code);
create index accruals_dealer_idx on finance.accruals(dealer_account_id, status, created_at_utc);
create index accruals_pass_through_expense_idx on finance.accruals(pass_through_expense_id);
create index open_items_account_due_idx on finance.open_items(dealer_account_id, due_date) where open_amount > 0;
create index payments_account_date_idx on finance.payments(dealer_account_id, payment_date, status);
create index payments_branch_date_idx on finance.payments(branch_id, payment_date, status);
create index payment_allocations_payment_idx on finance.payment_allocations(payment_id, status);
create index payment_allocations_open_item_idx on finance.payment_allocations(open_item_id, status);
create index expense_shares_expense_idx on finance.expense_shares(pass_through_expense_id);
create index disputes_open_item_idx on finance.disputes(open_item_id, status);
create index disputes_decision_journal_idx on finance.disputes(decision_journal_entry_id) where decision_journal_entry_id is not null;
create index approval_steps_request_idx on finance.approval_steps(approval_request_id, step_no);
create index billing_batches_period_idx on finance.billing_batches(finance_period_id, status);
create index billing_batches_branch_idx on finance.billing_batches(branch_id, status);
create index billing_batches_dealer_account_idx on finance.billing_batches(dealer_account_id,status);
create index billing_batch_items_batch_idx on finance.billing_batch_items(billing_batch_id);
create index external_invoices_batch_idx on finance.external_invoices(billing_batch_id, status);
create index external_invoices_branch_idx on finance.external_invoices(branch_id, status);
create index external_invoice_lines_invoice_idx on finance.external_invoice_lines(external_invoice_id);
create index dealer_finance_summary_lookup_idx on finance.dealer_finance_summary_snapshots(legal_entity_id,dealer_account_id,branch_id,as_of_date,currency_code,calculated_at_utc desc);
create index dealer_finance_summary_account_idx on finance.dealer_finance_summary_snapshots(dealer_account_id);
create index dealer_finance_summary_branch_idx on finance.dealer_finance_summary_snapshots(branch_id);
create index outbox_claim_idx on finance.outbox_messages(status, available_at_utc, created_at_utc) where status in ('PENDING','RETRYING');
create index integration_errors_open_idx on finance.integration_errors(status, created_at_utc) where status in ('OPEN','RETRY_SCHEDULED');
create index audit_events_subject_idx on finance.audit_events(subject_type, subject_id, created_at_utc);
create index audit_events_correlation_idx on finance.audit_events(correlation_id, created_at_utc);
create index branches_dealer_legal_entity_idx on finance.branches(dealer_legal_entity_id);
create index branch_assignments_dealer_legal_entity_idx on finance.branch_assignments(dealer_legal_entity_id);
create index dealer_accounts_dealer_legal_entity_idx on finance.dealer_accounts(dealer_legal_entity_id);
create index fee_definitions_legal_entity_idx on finance.fee_definitions(legal_entity_id);
create index franchise_contracts_dealer_legal_entity_idx on finance.franchise_contracts(dealer_legal_entity_id);
create index contract_fee_rules_fee_definition_idx on finance.contract_fee_rules(fee_definition_id);
create index contract_fee_rules_tax_code_version_idx on finance.contract_fee_rules(tax_code_version_id);
create index source_events_legal_entity_idx on finance.source_events(legal_entity_id);
create index calculation_runs_contract_fee_rule_idx on finance.calculation_runs(contract_fee_rule_id);
create index calculation_runs_fee_definition_idx on finance.calculation_runs(fee_definition_id);
create index calculation_runs_legal_entity_idx on finance.calculation_runs(legal_entity_id);
create index calculation_runs_branch_idx on finance.calculation_runs(branch_id);
create index calculation_snapshots_calculation_run_idx on finance.calculation_snapshots(calculation_run_id);
create index calculation_snapshots_contract_version_idx on finance.calculation_snapshots(contract_version_id);
create index journal_entries_reversal_idx on finance.journal_entries(reversal_of_id);
create index journal_lines_branch_idx on finance.journal_lines(branch_id);
create index accruals_fee_definition_idx on finance.accruals(fee_definition_id);
create index accruals_journal_entry_idx on finance.accruals(journal_entry_id);
create index accruals_legal_entity_idx on finance.accruals(legal_entity_id);
create index accruals_branch_idx on finance.accruals(branch_id);
create index accruals_reversal_idx on finance.accruals(reversal_of_id);
create index open_items_accrual_idx on finance.open_items(accrual_id);
create index open_items_legal_entity_idx on finance.open_items(legal_entity_id);
create index open_items_branch_idx on finance.open_items(branch_id);
create index payments_journal_entry_idx on finance.payments(journal_entry_id);
create index document_references_scope_idx on finance.document_references(legal_entity_id, status, document_type);
create index document_links_subject_idx on finance.document_links(legal_entity_id, subject_type, subject_id);
create unique index payment_allocations_reversal_unique on finance.payment_allocations(reversal_of_id) where reversal_of_id is not null;
create index pass_through_expenses_journal_entry_idx on finance.pass_through_expenses(journal_entry_id);
create index pass_through_expenses_fee_definition_idx on finance.pass_through_expenses(fee_definition_id);
create index pass_through_expenses_reversal_journal_idx on finance.pass_through_expenses(reversal_journal_entry_id) where reversal_journal_entry_id is not null;
create index expense_shares_accrual_idx on finance.expense_shares(accrual_id);
create index expense_shares_dealer_account_idx on finance.expense_shares(dealer_account_id);
create index expense_shares_branch_idx on finance.expense_shares(branch_id);
create index approval_requests_legal_entity_idx on finance.approval_requests(legal_entity_id);
create index external_invoices_legal_entity_idx on finance.external_invoices(legal_entity_id);
create index external_invoice_lines_billing_item_idx on finance.external_invoice_lines(billing_batch_item_id);
create index inbox_messages_legal_entity_idx on finance.inbox_messages(legal_entity_id);
create index outbox_messages_legal_entity_idx on finance.outbox_messages(legal_entity_id);
create index integration_errors_legal_entity_idx on finance.integration_errors(legal_entity_id);
create index audit_events_legal_entity_idx on finance.audit_events(legal_entity_id);

-- Expense approval immutability: financial snapshot inputs cannot be altered once
-- the aggregate enters approval. Posting may only attach the generated accrual id
-- to an existing share; financial columns and provenance remain unchanged.
create or replace function finance_private.guard_expense_share_snapshot_immutability()
returns trigger language plpgsql set search_path=pg_catalog,finance as $$
declare parent_status text;
begin
  select status into parent_status from finance.pass_through_expenses
   where id=coalesce(new.pass_through_expense_id,old.pass_through_expense_id);
  if parent_status in ('PENDING_APPROVAL','APPROVED','POSTED','REVERSED') then
    if tg_op<>'UPDATE' then
      raise exception using errcode='55000',message='approved expense shares are immutable';
    end if;
    if new.pass_through_expense_id is distinct from old.pass_through_expense_id
       or new.dealer_account_id is distinct from old.dealer_account_id
       or new.branch_id is distinct from old.branch_id
       or new.allocation_method is distinct from old.allocation_method
       or new.distribution_rule_reference is distinct from old.distribution_rule_reference
       or new.basis_value is distinct from old.basis_value
       or new.allocation_rate is distinct from old.allocation_rate
       or new.net_amount is distinct from old.net_amount
       or new.tax_amount is distinct from old.tax_amount
       or new.share_amount is distinct from old.share_amount
       or new.allocation_order is distinct from old.allocation_order
       or new.snapshot_hash is distinct from old.snapshot_hash
       or new.created_by is distinct from old.created_by
       or new.created_at_utc is distinct from old.created_at_utc
       or (new.accrual_id is distinct from old.accrual_id
           and not (old.accrual_id is null and new.accrual_id is not null))
       or (new.correlation_id is distinct from old.correlation_id
           and not (old.accrual_id is null and new.accrual_id is not null)) then
      raise exception using errcode='55000',message='approved expense share snapshot is immutable';
    end if;
  end if;
  return case when tg_op='DELETE' then old else new end;
end $$;

create trigger expense_share_snapshot_immutability
before insert or update or delete on finance.expense_shares
for each row execute function finance_private.guard_expense_share_snapshot_immutability();

create or replace function finance_private.guard_expense_snapshot_input_immutability()
returns trigger language plpgsql set search_path=pg_catalog,finance as $$
begin
  if old.status in ('PENDING_APPROVAL','APPROVED','POSTED','REVERSED')
     or new.status in ('PENDING_APPROVAL','APPROVED','POSTED','REVERSED') then
    if new.legal_entity_id is distinct from old.legal_entity_id
       or new.fee_definition_id is distinct from old.fee_definition_id
       or new.supplier_reference is distinct from old.supplier_reference
       or new.supplier_reference_normalized is distinct from old.supplier_reference_normalized
       or new.contractual_basis_reference is distinct from old.contractual_basis_reference
       or new.expense_date is distinct from old.expense_date
       or new.currency_code is distinct from old.currency_code
       or new.source_net_amount is distinct from old.source_net_amount
       or new.source_tax_amount is distinct from old.source_tax_amount
       or new.source_amount is distinct from old.source_amount
       or new.distributable_net_amount is distinct from old.distributable_net_amount
       or new.distributable_tax_amount is distinct from old.distributable_tax_amount
       or new.distributable_amount is distinct from old.distributable_amount
       or new.allocation_policy is distinct from old.allocation_policy
       or new.evidence_object_key is distinct from old.evidence_object_key
       or new.evidence_hash is distinct from old.evidence_hash
       or new.input_hash is distinct from old.input_hash
       or new.note_hash is distinct from old.note_hash
       or new.prepared_by is distinct from old.prepared_by then
      raise exception using errcode='55000',message='expense approval snapshot inputs are immutable';
    end if;
  end if;
  return new;
end $$;

create trigger expense_snapshot_input_immutability
before update on finance.pass_through_expenses
for each row execute function finance_private.guard_expense_snapshot_input_immutability();

create or replace function finance_private.guard_summary_snapshot_immutability()
returns trigger language plpgsql set search_path='' as $$
begin
  raise exception using errcode='55000',message='dealer finance summary snapshots are immutable';
end $$;

create trigger dealer_finance_summary_snapshot_immutability
before update or delete on finance.dealer_finance_summary_snapshots
for each row execute function finance_private.guard_summary_snapshot_immutability();

-- Defense in depth: raw finance tables are never client-readable/writable.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'legal_entities','dealer_legal_entities','branches','branch_assignments','dealer_accounts','fee_definitions','tax_codes','tax_code_versions','accounting_mappings','operational_accounts','payment_account_mappings',
    'franchise_contracts','contract_versions','contract_fee_rules','rule_exceptions','finance_periods','reconciliations',
    'source_events','calculation_runs','calculation_snapshots','journal_entries','journal_lines','accruals','open_items',
    'payments','payment_allocations','pass_through_expenses','expense_shares','disputes','approval_requests','approval_steps','document_references','document_links',
    'billing_batches','billing_batch_items','accounting_batches','accounting_batch_packages','accounting_batch_entries','external_invoices','external_invoice_lines','dealer_finance_summary_snapshots','inbox_messages','outbox_messages',
    'integration_errors','audit_events'
  ] loop
    execute format('alter table finance.%I enable row level security', table_name);
    execute format('alter table finance.%I force row level security', table_name);
    execute format('revoke all on finance.%I from public, anon, authenticated', table_name);
  end loop;
end $$;

-- No permissive raw-table RLS policy is intentionally defined in this candidate.
-- Narrow finance_api RPCs and private actor/scope helpers belong to a reviewed later wave.
