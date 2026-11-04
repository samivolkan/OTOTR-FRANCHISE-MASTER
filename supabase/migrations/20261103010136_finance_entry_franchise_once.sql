-- Preserve historical original charges in the uniqueness check. If existing
-- data contains duplicates, stop migration and reconcile them explicitly.
alter table finance.accruals
  add column is_original_entry_franchise boolean not null default false;

update finance.accruals a
set is_original_entry_franchise = true
from finance.fee_definitions f
where a.fee_definition_id = f.id
  and f.fee_family = 'ENTRY_FRANCHISE'
  and a.reversal_of_id is null;

create unique index accruals_entry_franchise_once_per_branch
  on finance.accruals (branch_id)
  where is_original_entry_franchise;

create function finance_private.classify_entry_franchise_accrual()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if (new.branch_id, new.legal_entity_id, new.fee_definition_id, new.calculation_run_id,
        new.reversal_of_id, new.is_original_entry_franchise) is distinct from
       (old.branch_id, old.legal_entity_id, old.fee_definition_id, old.calculation_run_id,
        old.reversal_of_id, old.is_original_entry_franchise) then
      raise exception using errcode = '23514', message = 'entry franchise accrual identity is immutable';
    end if;
    return new;
  end if;

  new.is_original_entry_franchise := new.reversal_of_id is null and exists (
    select 1 from finance.fee_definitions f
    where f.id = new.fee_definition_id and f.fee_family = 'ENTRY_FRANCHISE'
  );
  if new.is_original_entry_franchise and not exists (
    select 1
    from finance.calculation_runs r
    join finance.source_events e on e.id = r.source_event_id
    where r.id = new.calculation_run_id
      and r.fee_definition_id = new.fee_definition_id
      and r.legal_entity_id = new.legal_entity_id
      and r.branch_id = new.branch_id
      and r.run_type = 'LIVE'
      and r.status = 'POSTED'
      and e.legal_entity_id = new.legal_entity_id
      and e.branch_id = new.branch_id
      and e.event_type = 'branch.opened'
      and pg_catalog.jsonb_typeof(e.payload->'branchOpeningReference') = 'string'
      and pg_catalog.btrim(e.payload->>'branchOpeningReference') <> ''
      and r.business_date = e.business_date
      and e.business_date = (e.occurred_at_utc at time zone 'Europe/Istanbul')::date
  ) then
    raise exception using errcode = '23514', message = 'entry franchise accrual requires a dated branch opening reference';
  end if;
  return new;
end $$;

revoke all on function finance_private.classify_entry_franchise_accrual() from public, anon, authenticated;

create trigger accruals_classify_entry_franchise
before insert on finance.accruals
for each row execute function finance_private.classify_entry_franchise_accrual();

create trigger accruals_preserve_entry_franchise_identity
before update on finance.accruals
for each row
when (old.is_original_entry_franchise or new.is_original_entry_franchise)
execute function finance_private.classify_entry_franchise_accrual();
