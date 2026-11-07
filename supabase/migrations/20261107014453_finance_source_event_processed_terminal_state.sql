-- A LIVE calculation is atomically posted together with its accrual. Once the
-- accrual exists, the source event must not remain indefinitely PROCESSING.
create or replace function finance_private.mark_source_event_processed_on_posted_accrual()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_source_event_id uuid;
  v_run_type text;
  v_run_status text;
begin
  select cr.source_event_id,cr.run_type,cr.status
    into v_source_event_id,v_run_type,v_run_status
    from finance.calculation_runs cr
   where cr.id=new.calculation_run_id;

  if v_source_event_id is null or v_run_type<>'LIVE' or v_run_status<>'POSTED' then
    return new;
  end if;

  update finance.source_events
     set status='PROCESSED',version=version+1,correlation_id=new.correlation_id
   where id=v_source_event_id
     and status in('RECEIVED','PROCESSING');
  return new;
end
$$;

revoke all on function finance_private.mark_source_event_processed_on_posted_accrual() from public,anon,authenticated;

drop trigger if exists accrual_source_event_processed on finance.accruals;
create trigger accrual_source_event_processed
after insert on finance.accruals
for each row execute function finance_private.mark_source_event_processed_on_posted_accrual();

-- Replay is resolved before loading a new-work context. A successfully posted
-- refund is PROCESSED and must not be reopened merely to detect idempotency.
create or replace function finance_api.process_royalty_refund_reversal_v2(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_legal_entity_id uuid,
  p_dealer_account_id uuid,p_branch_id uuid,p_source_event_id uuid,p_refund_id uuid,
  p_idempotency_key text,p_correlation_id uuid
) returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare v record;
begin
  if not finance_private.current_refund_worker_is_trusted() then
    raise exception using errcode='42501',message='refund worker denied';
  end if;
  select cr.id calculation_run_id,cr.input_hash,cr.result_hash,
         a.id reversal_accrual_id,oi.id open_item_id
    into v
    from finance.source_events se
    join finance.calculation_runs cr on cr.source_event_id=se.id and cr.run_type='LIVE' and cr.status='POSTED'
    join finance.accruals a on a.calculation_run_id=cr.id and a.reversal_of_id is not null and a.status='POSTED'
    join finance.open_items oi on oi.accrual_id=a.id and oi.item_type='CREDIT'
   where se.id=p_source_event_id and se.event_id=p_refund_id
     and se.event_type='customer-payment.refunded'
     and se.legal_entity_id=p_legal_entity_id and se.dealer_legal_entity_id=p_dealer_legal_entity_id
     and se.branch_id=p_branch_id and a.dealer_account_id=p_dealer_account_id
   order by cr.created_at_utc desc limit 1;
  if found then
    return pg_catalog.jsonb_build_object(
      'outcome','REPLAY','calculationRunId',v.calculation_run_id,
      'reversalAccrualId',v.reversal_accrual_id,'openItemId',v.open_item_id,
      'inputHash',v.input_hash,'resultHash',v.result_hash
    );
  end if;
  return finance_api.process_royalty_refund_reversal(
    p_actor_id,p_legal_entity_id,p_dealer_legal_entity_id,p_dealer_account_id,
    p_branch_id,p_source_event_id,p_refund_id,p_idempotency_key,p_correlation_id
  );
end$$;

revoke all on function finance_api.process_royalty_refund_reversal_v2(uuid,uuid,uuid,uuid,uuid,uuid,uuid,text,uuid) from public,anon,authenticated;
revoke execute on function finance_api.process_royalty_refund_reversal(uuid,uuid,uuid,uuid,uuid,uuid,uuid,text,uuid) from service_role;
grant execute on function finance_api.process_royalty_refund_reversal_v2(uuid,uuid,uuid,uuid,uuid,uuid,uuid,text,uuid) to service_role;

-- Repair only events that already have immutable POSTED LIVE provenance and a
-- POSTED accrual. Events without that complete chain remain fail-closed.
update finance.source_events se
   set status='PROCESSED',version=se.version+1
 where se.status in('RECEIVED','PROCESSING')
   and exists(
     select 1
       from finance.calculation_runs cr
       join finance.accruals a on a.calculation_run_id=cr.id and a.status='POSTED'
      where cr.source_event_id=se.id
        and cr.run_type='LIVE'
        and cr.status='POSTED'
   );
