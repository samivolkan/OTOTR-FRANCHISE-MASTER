-- Correct the package dimension rule: headquarters revenue/tax lines may omit
-- dealer_account_id. Each journal must still resolve to exactly one non-null
-- dealer account and one branch, and every line must carry that branch.

do $migration$
declare v_definition text;v_rewritten text;
begin
  select pg_catalog.pg_get_functiondef(p.oid) into v_definition
  from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
  where n.nspname='finance_api' and p.proname='commit_accounting_batch_creation'
    and pg_catalog.pg_get_function_identity_arguments(p.oid)='p_actor_id uuid, p_legal_entity_id uuid, p_period_start date, p_period_end date, p_mapping_version text, p_journal_entry_ids uuid[], p_idempotency_key text, p_intent_hash text, p_correlation_id uuid';
  if v_definition is null then raise exception 'accounting batch function not found';end if;

  v_rewritten:=pg_catalog.replace(v_definition,
    $old$if exists(select 1 from finance.journal_lines jl where jl.journal_entry_id=v_entry.id and (jl.dealer_account_id is null or jl.branch_id is null)) or (select count(distinct jl.dealer_account_id::text||':'||jl.branch_id::text) from finance.journal_lines jl where jl.journal_entry_id=v_entry.id)<>1 then raise exception using errcode='23514',message='single dealer and branch accounting package scope required';end if;$old$,
    $new$if exists(select 1 from finance.journal_lines jl where jl.journal_entry_id=v_entry.id and jl.branch_id is null)
     or (select count(distinct jl.branch_id) from finance.journal_lines jl where jl.journal_entry_id=v_entry.id)<>1
     or (select count(distinct jl.dealer_account_id) from finance.journal_lines jl where jl.journal_entry_id=v_entry.id and jl.dealer_account_id is not null)<>1
     then raise exception using errcode='23514',message='single dealer and branch accounting package scope required';end if;$new$);
  if v_rewritten=v_definition then raise exception 'accounting scope validation rewrite target not found';end if;

  v_definition:=v_rewritten;
  v_rewritten:=pg_catalog.replace(v_definition,
    $old$from (select pg_catalog.min(jl.dealer_account_id::text)::uuid dealer_account_id,pg_catalog.min(jl.branch_id::text)::uuid branch_id,pg_catalog.sum(jl.debit_amount) debit_total,pg_catalog.sum(jl.credit_amount) credit_total,pg_catalog.string_agg(distinct je.id::text,',' order by je.id::text) entry_ids from finance.journal_entries je join finance.finance_periods ep on ep.id=je.finance_period_id join finance.journal_lines jl on jl.journal_entry_id=je.id where je.legal_entity_id=p_legal_entity_id and (ep.id=v_period.id or ep.parent_period_id=v_period.id) and je.status='POSTED' and (coalesce(pg_catalog.cardinality(p_journal_entry_ids),0)=0 or je.id=any(p_journal_entry_ids)) group by jl.dealer_account_id,jl.branch_id) s;$old$,
    $new$from (
   select x.dealer_account_id,x.branch_id,pg_catalog.sum(x.debit_total) debit_total,pg_catalog.sum(x.credit_total) credit_total,pg_catalog.string_agg(x.entry_id::text,',' order by x.entry_id::text) entry_ids
   from (
    select je.id entry_id,pg_catalog.min(jl.dealer_account_id::text)::uuid dealer_account_id,pg_catalog.min(jl.branch_id::text)::uuid branch_id,pg_catalog.sum(jl.debit_amount) debit_total,pg_catalog.sum(jl.credit_amount) credit_total
    from finance.journal_entries je join finance.finance_periods ep on ep.id=je.finance_period_id join finance.journal_lines jl on jl.journal_entry_id=je.id
    where je.legal_entity_id=p_legal_entity_id and (ep.id=v_period.id or ep.parent_period_id=v_period.id) and je.status='POSTED' and (coalesce(pg_catalog.cardinality(p_journal_entry_ids),0)=0 or je.id=any(p_journal_entry_ids))
    group by je.id
   ) x group by x.dealer_account_id,x.branch_id
  ) s;$new$);
  if v_rewritten=v_definition then raise exception 'accounting package aggregation rewrite target not found';end if;
  execute v_rewritten;
end
$migration$;

revoke all on function finance_api.commit_accounting_batch_creation(uuid,uuid,date,date,text,uuid[],text,text,uuid) from public,anon,authenticated;
grant execute on function finance_api.commit_accounting_batch_creation(uuid,uuid,date,date,text,uuid[],text,text,uuid) to service_role;
