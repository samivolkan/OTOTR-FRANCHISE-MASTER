-- OTOTR franchise finance post-deploy catalog checks.
-- READ ONLY. Run only against an approved isolated/local or staging database.
-- This file has not been executed against any database.
\set ON_ERROR_STOP on
begin transaction read only;

-- DB-CAT-01: finance schema must contain exactly the 44 canonical base tables.
do $check$
declare
  expected text[] := array[
    'accounting_batch_entries','accounting_batch_packages','accounting_batches','accounting_mappings','accruals','approval_requests','approval_steps','audit_events','billing_batch_items','billing_batches',
    'branch_assignments','branches','calculation_runs','calculation_snapshots','contract_fee_rules','contract_versions',
    'dealer_accounts','dealer_finance_summary_snapshots','dealer_legal_entities','disputes','document_links','document_references','expense_shares','external_invoice_lines','external_invoices',
    'fee_definitions','finance_periods','franchise_contracts','inbox_messages','integration_errors','journal_entries',
    'journal_lines','legal_entities','open_items','operational_accounts','outbox_messages','pass_through_expenses','payment_account_mappings','payment_allocations','payments',
    'reconciliations','rule_exceptions','source_events','tax_code_versions','tax_codes'
  ];
  actual text[];
begin
  select array_agg(c.relname order by c.relname)
    into actual
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'finance' and c.relkind = 'r';
  if actual is distinct from expected then
    raise exception 'DB-CAT-01 failed: finance table inventory differs';
  end if;
end $check$;

-- DB-CAT-02: every raw finance table must have RLS enabled and forced.
do $check$
declare bad_count integer;
begin
  select count(*) into bad_count
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'finance' and c.relkind = 'r'
     and (not c.relrowsecurity or not c.relforcerowsecurity);
  if bad_count <> 0 then
    raise exception 'DB-CAT-02 failed: % table(s) lack ENABLE/FORCE RLS', bad_count;
  end if;
end $check$;

-- DB-CAT-03: anon and authenticated must have no raw table privileges.
do $check$
declare bad_count integer;
begin
  select count(*) into bad_count
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'finance' and c.relkind = 'r'
     and (
       pg_catalog.has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
       or pg_catalog.has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
     );
  if bad_count <> 0 then
    raise exception 'DB-CAT-03 failed: % raw table(s) expose client privileges', bad_count;
  end if;
end $check$;

-- DB-CAT-04: every FK column must be the leading column of a valid ready index.
do $check$
declare bad_count integer;
begin
  with fk_columns as (
    select con.conrelid, unnest(con.conkey) as attnum
      from pg_catalog.pg_constraint con
      join pg_catalog.pg_namespace n on n.oid = con.connamespace
     where n.nspname = 'finance' and con.contype = 'f'
  )
  select count(*) into bad_count
    from fk_columns fk
   where not exists (
     select 1 from pg_catalog.pg_index i
      where i.indrelid = fk.conrelid and i.indisvalid and i.indisready
        and i.indkey[0] = fk.attnum
   );
  if bad_count <> 0 then
    raise exception 'DB-CAT-04 failed: % FK column(s) lack a leading valid index', bad_count;
  end if;
end $check$;

-- DB-CAT-05: canonical money columns must be numeric(24,8), never floating point.
do $check$
declare bad_count integer;
begin
  with expected(table_name, column_name) as (values
    ('accruals','net_amount'),('accruals','tax_amount'),('accruals','gross_amount'),
    ('open_items','original_amount'),('open_items','allocated_amount'),('open_items','open_amount'),
    ('journal_lines','debit_amount'),('journal_lines','credit_amount'),
    ('payments','received_amount'),('payments','verified_amount'),('payments','allocated_amount'),
    ('payment_allocations','amount'),
    ('reconciliations','source_total'),('reconciliations','ledger_total'),('reconciliations','difference_amount'),
    ('billing_batches','control_net'),('billing_batches','control_tax'),('billing_batches','control_gross'),
    ('billing_batch_items','net_amount'),('billing_batch_items','tax_amount'),('billing_batch_items','gross_amount'),
    ('accounting_batches','debit_total'),('accounting_batches','credit_total'),
    ('external_invoices','net_amount'),('external_invoices','tax_amount'),('external_invoices','gross_amount'),
    ('external_invoice_lines','net_amount'),('external_invoice_lines','tax_amount'),('external_invoice_lines','gross_amount'),
    ('dealer_finance_summary_snapshots','accrued_net'),('dealer_finance_summary_snapshots','accrued_tax'),('dealer_finance_summary_snapshots','accrued_gross'),
    ('dealer_finance_summary_snapshots','invoiced_net'),('dealer_finance_summary_snapshots','invoiced_tax'),('dealer_finance_summary_snapshots','invoiced_gross'),
    ('dealer_finance_summary_snapshots','collected_net'),('dealer_finance_summary_snapshots','collected_tax'),('dealer_finance_summary_snapshots','collected_gross'),
    ('dealer_finance_summary_snapshots','open_net'),('dealer_finance_summary_snapshots','open_tax'),('dealer_finance_summary_snapshots','open_gross'),
    ('dealer_finance_summary_snapshots','overdue_net'),('dealer_finance_summary_snapshots','overdue_tax'),('dealer_finance_summary_snapshots','overdue_gross'),
    ('dealer_finance_summary_snapshots','deducted_net'),('dealer_finance_summary_snapshots','deducted_tax'),('dealer_finance_summary_snapshots','deducted_gross'),
    ('dealer_finance_summary_snapshots','refunded_net'),('dealer_finance_summary_snapshots','refunded_tax'),('dealer_finance_summary_snapshots','refunded_gross'),
    ('dealer_finance_summary_snapshots','disputed_net'),('dealer_finance_summary_snapshots','disputed_tax'),('dealer_finance_summary_snapshots','disputed_gross'),
    ('dealer_finance_summary_snapshots','unallocated_cash_amount'),
    ('pass_through_expenses','source_net_amount'),('pass_through_expenses','source_tax_amount'),('pass_through_expenses','source_amount'),
    ('pass_through_expenses','distributable_net_amount'),('pass_through_expenses','distributable_tax_amount'),('pass_through_expenses','distributable_amount'),
    ('expense_shares','net_amount'),('expense_shares','tax_amount'),('expense_shares','share_amount'),('disputes','disputed_amount'),('disputes','accepted_amount'),
    ('tax_code_versions','rate')
  )
  select count(*) into bad_count
    from expected e
    left join information_schema.columns c
      on c.table_schema = 'finance' and c.table_name = e.table_name and c.column_name = e.column_name
   where c.data_type is distinct from 'numeric' or c.numeric_precision is distinct from 24 or c.numeric_scale is distinct from 8;
  if bad_count <> 0 then
    raise exception 'DB-CAT-05 failed: % money column(s) differ from numeric(24,8)', bad_count;
  end if;
end $check$;

-- DB-CAT-06: security-definer RPCs must be outside public, pin either an empty
-- search_path or a pg_catalog-first allowlist of trusted schemas, deny PUBLIC
-- execute, and keep CREATE away from browser roles on every allowlisted schema.
do $check$
declare bad_count integer;
begin
  select count(*) into bad_count
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'finance_api' and p.prosecdef
     and (
       not exists (
         select 1
           from unnest(coalesce(p.proconfig, array[]::text[])) as setting(value)
          where setting.value = 'search_path=""'
             or replace(setting.value, ' ', '') ~ '^search_path=pg_catalog(,(finance|finance_api|finance_private|auth))*$'
       )
       or pg_catalog.has_function_privilege('public', p.oid, 'EXECUTE')
     );
  if exists (
    select 1
      from unnest(array['finance','finance_api','finance_private','auth']) as trusted_schema(schema_name)
     where pg_catalog.has_schema_privilege('anon', trusted_schema.schema_name, 'CREATE')
        or pg_catalog.has_schema_privilege('authenticated', trusted_schema.schema_name, 'CREATE')
        or pg_catalog.has_schema_privilege('public', trusted_schema.schema_name, 'CREATE')
  ) then
    bad_count := bad_count + 1;
  end if;
  if bad_count <> 0 then
    raise exception 'DB-CAT-06 failed: % security-definer RPC(s) violate search_path/PUBLIC execute policy', bad_count;
  end if;
end $check$;

rollback;
