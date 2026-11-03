-- Historical opening/closing balance and aging projection for dealer statements.

create or replace function finance_api.get_dealer_statement_control(
 p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_from date,p_to date,p_currency text
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_opening numeric(24,8);v_debits numeric(24,8);v_credits numeric(24,8);v_allocations numeric(24,8);v_reversals numeric(24,8);v_closing numeric(24,8);v_aging jsonb;
begin
 if auth.uid() is null or not finance_private.current_actor_can_read_scope(auth.uid(),p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDealerStatementControl') then raise exception using errcode='42501',message='finance scope denied';end if;
 if p_from is null or p_to is null or p_from>p_to or p_currency!~'^[A-Z]{3}$' then raise exception using errcode='22023',message='valid statement range and currency required';end if;
 with accrual_events as(
  select coalesce(cr.business_date,pe.expense_date,a.created_at_utc::date) event_date,
   case when oi.item_type='DEBIT' then a.gross_amount else -a.gross_amount end amount,'ACCRUAL' kind
  from finance.accruals a join finance.open_items oi on oi.accrual_id=a.id
  left join finance.calculation_runs cr on cr.id=a.calculation_run_id left join finance.pass_through_expenses pe on pe.id=a.pass_through_expense_id
  where a.legal_entity_id=p_legal_entity_id and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id and a.currency_code=p_currency
 ),allocation_events as(
  select case when pa.reversal_of_id is null then p.payment_date else pa.created_at_utc::date end event_date,
   case when pa.reversal_of_id is null then -pa.amount else pa.amount end amount,
   case when pa.reversal_of_id is null then 'ALLOCATION' else 'ALLOCATION_REVERSAL' end kind
  from finance.payment_allocations pa join finance.payments p on p.id=pa.payment_id join finance.open_items oi on oi.id=pa.open_item_id
  where p.legal_entity_id=p_legal_entity_id and p.dealer_account_id=p_dealer_account_id and p.branch_id=p_branch_id and pa.currency_code=p_currency
 ),events as(select * from accrual_events union all select * from allocation_events)
 select coalesce(sum(amount) filter(where event_date<p_from),0),coalesce(sum(amount) filter(where event_date between p_from and p_to and kind='ACCRUAL' and amount>0),0),coalesce(-sum(amount) filter(where event_date between p_from and p_to and kind='ACCRUAL' and amount<0),0),coalesce(-sum(amount) filter(where event_date between p_from and p_to and kind='ALLOCATION'),0),coalesce(sum(amount) filter(where event_date between p_from and p_to and kind='ALLOCATION_REVERSAL'),0),coalesce(sum(amount) filter(where event_date<=p_to),0)
 into v_opening,v_debits,v_credits,v_allocations,v_reversals,v_closing from events;
 with item_balance as(
  select oi.id,oi.due_date,case when oi.item_type='DEBIT' then 1 else -1 end direction,
   greatest(oi.original_amount-coalesce(sum(case when pa.reversal_of_id is null and p.payment_date<=p_to then pa.amount when pa.reversal_of_id is not null and pa.created_at_utc::date<=p_to then -pa.amount else 0 end),0),0) balance
  from finance.open_items oi join finance.accruals a on a.id=oi.accrual_id
  left join finance.payment_allocations pa on pa.open_item_id=oi.id left join finance.payments p on p.id=pa.payment_id
  where oi.legal_entity_id=p_legal_entity_id and oi.dealer_account_id=p_dealer_account_id and oi.branch_id=p_branch_id and oi.currency_code=p_currency
  group by oi.id,oi.due_date,oi.item_type,oi.original_amount
 ),bucketed as(select case when due_date>=p_to then 'CURRENT' when p_to-due_date between 1 and 30 then 'DAYS_1_30' when p_to-due_date between 31 and 60 then 'DAYS_31_60' when p_to-due_date between 61 and 90 then 'DAYS_61_90' else 'DAYS_91_PLUS' end bucket,direction*balance amount from item_balance where balance>0)
 select pg_catalog.jsonb_build_object('current',coalesce(sum(amount) filter(where bucket='CURRENT'),0)::text,'days1To30',coalesce(sum(amount) filter(where bucket='DAYS_1_30'),0)::text,'days31To60',coalesce(sum(amount) filter(where bucket='DAYS_31_60'),0)::text,'days61To90',coalesce(sum(amount) filter(where bucket='DAYS_61_90'),0)::text,'days91Plus',coalesce(sum(amount) filter(where bucket='DAYS_91_PLUS'),0)::text) into v_aging from bucketed;
 return pg_catalog.jsonb_build_object('from',p_from,'to',p_to,'currency',p_currency,'openingBalance',v_opening::text,'periodDebits',v_debits::text,'periodCredits',v_credits::text,'periodAllocations',v_allocations::text,'allocationReversals',v_reversals::text,'closingBalance',v_closing::text,'aging',v_aging,'historicalReconstruction',true,'rawRecordsExposed',false);
end$$;

revoke all on function finance_api.get_dealer_statement_control(uuid,uuid,uuid,date,date,text) from public,anon;
grant execute on function finance_api.get_dealer_statement_control(uuid,uuid,uuid,date,date,text) to authenticated;
