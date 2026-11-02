-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-royalty-refund-reversal-rpc.sql
-- Source SHA256: BE74EFF022D0E4ED73CF4FF6D4DD8FD561B361CFFCBF85B83BCCE047D6585F32
-- Local replay required before any staging promotion.
-- OTOTR FINANCE ROYALTY REFUND REVERSAL RPC CANDIDATE
-- A reviewed migration must provision pgcrypto in extensions and a dedicated server-only role.

create or replace function finance_private.current_refund_worker_is_trusted()
returns boolean language sql stable security definer set search_path = ''
as $$ select false $$;
revoke all on function finance_private.current_refund_worker_is_trusted() from public, anon, authenticated;

create or replace function finance_api.load_royalty_refund_context(
  p_legal_entity_id uuid,p_dealer_legal_entity_id uuid,p_dealer_account_id uuid,
  p_branch_id uuid,p_source_event_id uuid,p_refund_id uuid
) returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare v record;
begin
  if not finance_private.current_refund_worker_is_trusted() then
    raise exception using errcode='42501',message='refund worker denied';
  end if;
  select count(*) over () candidate_count,
         re.id refund_event_id,re.business_date refund_business_date,re.payload_hash refund_payload_hash,re.payload refund_payload,
         original_event.id original_event_id,original_event.payload_hash original_payload_hash,original_event.payload original_payload,
         original_run.id original_run_id,original_run.contract_fee_rule_id,original_run.fee_definition_id,
         original_run.finance_period_id original_period_id,original_period.status original_period_status,
         original_accrual.id original_accrual_id,original_accrual.journal_entry_id original_journal_entry_id,
         original_accrual.currency_code,original_accrual.net_amount original_net_amount,
         original_accrual.tax_amount original_tax_amount,original_accrual.gross_amount original_gross_amount,
         original_item.id original_open_item_id,original_item.due_date,
         original_snapshot.contract_version_id,original_snapshot.rule_version_snapshot,
         original_snapshot.tax_version_snapshot,original_snapshot.input_snapshot,
         posting_period.id posting_period_id,posting_period.period_start posting_period_start,posting_period.period_end posting_period_end,
         coalesce((select sum(abs(a.gross_amount)) from finance.accruals a where a.reversal_of_id=original_accrual.id),0) reversed_gross_amount,
         coalesce((select sum((se.payload->>'refundedGrossAmount')::numeric(24,8)) from finance.calculation_runs cr
                   join finance.source_events se on se.id=cr.source_event_id
                   join finance.accruals a on a.calculation_run_id=cr.id
                   where a.reversal_of_id=original_accrual.id and cr.status='POSTED'),0) refunded_collection_gross_amount
    into v
    from finance.source_events re
    join finance.source_events original_event on original_event.legal_entity_id=re.legal_entity_id
      and original_event.dealer_legal_entity_id=re.dealer_legal_entity_id and original_event.branch_id=re.branch_id
      and original_event.event_type='customer-payment.settled'
      and original_event.payload->>'collectionId'=re.payload->>'originalCollectionId'
    join finance.calculation_runs original_run on original_run.source_event_id=original_event.id
      and original_run.run_type='LIVE' and original_run.status='POSTED'
    join finance.calculation_snapshots original_snapshot on original_snapshot.calculation_run_id=original_run.id
    join finance.accruals original_accrual on original_accrual.calculation_run_id=original_run.id
      and original_accrual.reversal_of_id is null and original_accrual.status in ('POSTED','DISPUTED')
    join finance.open_items original_item on original_item.accrual_id=original_accrual.id and original_item.item_type='DEBIT'
    join finance.finance_periods original_period on original_period.id=original_run.finance_period_id
      and original_period.scope_type='BRANCH' and original_period.dealer_account_id=p_dealer_account_id and original_period.branch_id=p_branch_id
    left join finance.finance_periods posting_period on posting_period.legal_entity_id=re.legal_entity_id
      and posting_period.scope_type='BRANCH' and posting_period.dealer_account_id=p_dealer_account_id and posting_period.branch_id=p_branch_id
      and posting_period.mode='LIVE' and posting_period.status='OPEN'
      and re.business_date between posting_period.period_start and posting_period.period_end
   where re.id=p_source_event_id and re.event_id=p_refund_id and re.legal_entity_id=p_legal_entity_id
     and re.dealer_legal_entity_id=p_dealer_legal_entity_id and re.branch_id=p_branch_id
     and re.event_type='customer-payment.refunded' and re.status in ('RECEIVED','PROCESSING')
     and re.payload->>'refundId'=p_refund_id::text
     and (re.payload->>'branchId')::uuid=p_branch_id
     and exists (select 1 from finance.dealer_accounts da where da.id=p_dealer_account_id
       and da.legal_entity_id=p_legal_entity_id and da.dealer_legal_entity_id=p_dealer_legal_entity_id
       and da.currency_code=original_accrual.currency_code and da.status in ('SHADOW','ACTIVE'))
   order by original_accrual.id limit 1;
  if not found then return null; end if;
  if v.candidate_count <> 1 then raise exception using errcode='21000',message='ambiguous royalty refund context'; end if;
  if v.original_period_status not in ('OPEN','LOCKED') then raise exception using errcode='23514',message='original finance period is not reversible'; end if;
  if v.original_period_status='LOCKED' and v.posting_period_id is null then raise exception using errcode='23514',message='current open finance period required'; end if;
  return pg_catalog.jsonb_build_object(
    'scope',pg_catalog.jsonb_build_object('legalEntityId',p_legal_entity_id,'dealerLegalEntityId',p_dealer_legal_entity_id,'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id),
    'sourceEvent',pg_catalog.jsonb_build_object('id',v.refund_event_id,'eventType','customer-payment.refunded','businessDate',v.refund_business_date,'payloadHash',v.refund_payload_hash),
    'sourcePayload',v.refund_payload,'originalCollectionPayload',v.original_payload,
    'originalRoyaltyAccrual',pg_catalog.jsonb_build_object('id',v.original_accrual_id,'journalEntryId',v.original_journal_entry_id,'openItemId',v.original_open_item_id,'calculationRunId',v.original_run_id,'grossAmount',v.original_gross_amount::text,'currency',v.currency_code),
    'originalRuleSnapshot',v.rule_version_snapshot,'originalTaxVersion',v.tax_version_snapshot,
    'financePeriod',pg_catalog.jsonb_build_object('id',v.original_period_id,'status',v.original_period_status),
    'currentOpenFinancePeriod',case when v.posting_period_id is null then null else pg_catalog.jsonb_build_object('id',v.posting_period_id,'status','OPEN','periodStart',v.posting_period_start,'periodEnd',v.posting_period_end) end,
    'refundPolicy',pg_catalog.jsonb_build_object('recognition','EACH_SETTLED_REFUND','reversalMode','PROPORTIONAL_TO_REFUNDED_GROSS','automatic',true,'closedPeriodHandling','POST_TO_CURRENT_OPEN_PERIOD_PRESERVE_ORIGINAL_REFERENCES'),
    'refundState',pg_catalog.jsonb_build_object(
      'branchId',p_branch_id,'originalCollectionId',v.refund_payload->>'originalCollectionId','currency',v.currency_code,
      'originalCollectionGrossAmount',v.original_payload->>'collectedGrossAmount',
      'cumulativeRefundedGrossAmount',v.refunded_collection_gross_amount::text,
      'originalRoyaltyAccrualId',v.original_accrual_id,
      'remainingRoyaltyReversibleGrossAmount',(v.original_gross_amount-v.reversed_gross_amount)::text
    )
  );
end $$;

create or replace function finance_api.find_royalty_refund_intent(p_refund_id uuid,p_original_accrual_id uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare v record;
begin
  if not finance_private.current_refund_worker_is_trusted() then raise exception using errcode='42501',message='refund worker denied'; end if;
  select cr.id,cr.input_hash,cr.result_hash,cr.status,a.id accrual_id,oi.id open_item_id
    into v from finance.source_events se
    join finance.calculation_runs cr on cr.source_event_id=se.id and cr.run_type='LIVE' and cr.status='POSTED'
    join finance.accruals a on a.calculation_run_id=cr.id and a.reversal_of_id=p_original_accrual_id
    join finance.open_items oi on oi.accrual_id=a.id and oi.item_type='CREDIT'
   where se.event_id=p_refund_id and se.event_type='customer-payment.refunded'
   order by cr.created_at_utc desc limit 1;
  if not found then return null; end if;
  return pg_catalog.jsonb_build_object('outcome','REPLAY','calculationRunId',v.id,'reversalAccrualId',v.accrual_id,'openItemId',v.open_item_id,'status',v.status,'inputHash',v.input_hash,'resultHash',v.result_hash);
end $$;

create or replace function finance_api.commit_royalty_refund_reversal(
  p_actor_id uuid,p_command jsonb,p_context jsonb,p_refund jsonb,p_calculation jsonb,
  p_period_provenance jsonb,p_input_hash text,p_result_hash text
) returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_hq uuid:=(p_command->>'legalEntityId')::uuid;v_dealer uuid:=(p_command->>'dealerLegalEntityId')::uuid;
  v_account uuid:=(p_command->>'dealerAccountId')::uuid;v_branch uuid:=(p_command->>'branchId')::uuid;
  v_source uuid:=(p_command->>'sourceEventId')::uuid;v_refund uuid:=(p_command->>'refundId')::uuid;
  v_corr uuid:=(p_command->>'correlationId')::uuid;v_idem text:=p_command->>'idempotencyKey';
  v_original uuid:=(p_refund->>'originalRoyaltyAccrualId')::uuid;
  v_original_period uuid:=(p_period_provenance->>'originalPeriodId')::uuid;v_posting_period uuid:=(p_period_provenance->>'postingPeriodId')::uuid;
  v_net numeric(24,8);v_tax numeric(24,8);v_gross numeric(24,8);v_currency text;
  v record;v_existing record;v_run uuid;v_journal uuid;v_accrual uuid;v_open_item uuid;
  v_payload_hash text;v_previous_hash text;v_audit_hash text;
begin
  if not finance_private.current_refund_worker_is_trusted() then raise exception using errcode='42501',message='refund worker denied'; end if;
  if p_actor_id is null or v_corr is null or coalesce(v_idem,'')='' or coalesce(p_input_hash,'')='' or coalesce(p_result_hash,'')='' then
    raise exception using errcode='22023',message='required refund fields missing';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_refund::text||':'||v_original::text,0));
  select cr.id,cr.input_hash,cr.result_hash,cr.status,a.id accrual_id,oi.id open_item_id into v_existing
    from finance.source_events se join finance.calculation_runs cr on cr.source_event_id=se.id
    join finance.accruals a on a.calculation_run_id=cr.id and a.reversal_of_id=v_original
    join finance.open_items oi on oi.accrual_id=a.id and oi.item_type='CREDIT'
   where se.event_id=v_refund and se.event_type='customer-payment.refunded' and cr.run_type='LIVE' and cr.status='POSTED' limit 1;
  if found then
    if v_existing.input_hash=p_input_hash and v_existing.result_hash=p_result_hash then
      return pg_catalog.jsonb_build_object('outcome','REPLAY','calculationRunId',v_existing.id,'reversalAccrualId',v_existing.accrual_id,'openItemId',v_existing.open_item_id,'inputHash',v_existing.input_hash,'resultHash',v_existing.result_hash);
    end if;
    return pg_catalog.jsonb_build_object('outcome','CONFLICT','calculationRunId',v_existing.id);
  end if;
  select original_accrual.calculation_run_id,original_accrual.journal_entry_id,original_accrual.fee_definition_id,
         original_accrual.currency_code,original_accrual.gross_amount original_gross,original_run.contract_fee_rule_id,
         original_snapshot.contract_version_id,original_snapshot.rule_version_snapshot,original_snapshot.tax_version_snapshot,
         original_period.status original_period_status,posting_period.status posting_period_status,
         posting_period.period_start,posting_period.period_end,re.business_date,
         receivable.account_code receivable_account_code,
         (original_snapshot.input_snapshot#>>'{accountingMapping,revenueAccountCode}') revenue_account_code,
         (original_snapshot.input_snapshot#>>'{accountingMapping,taxAccountCode}') tax_account_code,
         coalesce((select sum(abs(a.gross_amount)) from finance.accruals a where a.reversal_of_id=original_accrual.id),0) reversed_gross
    into v from finance.accruals original_accrual
    join finance.calculation_runs original_run on original_run.id=original_accrual.calculation_run_id and original_run.status='POSTED'
    join finance.calculation_snapshots original_snapshot on original_snapshot.calculation_run_id=original_run.id
    join finance.journal_lines receivable on receivable.journal_entry_id=original_accrual.journal_entry_id
      and receivable.dealer_account_id=v_account and receivable.debit_amount>0
    join finance.finance_periods original_period on original_period.id=v_original_period and original_period.id=original_run.finance_period_id
      and original_period.scope_type='BRANCH' and original_period.dealer_account_id=v_account and original_period.branch_id=v_branch
    join finance.finance_periods posting_period on posting_period.id=v_posting_period and posting_period.legal_entity_id=v_hq
      and posting_period.scope_type='BRANCH' and posting_period.dealer_account_id=v_account and posting_period.branch_id=v_branch and posting_period.status='OPEN'
    join finance.source_events re on re.id=v_source and re.event_id=v_refund and re.event_type='customer-payment.refunded'
      and re.legal_entity_id=v_hq and re.dealer_legal_entity_id=v_dealer and re.branch_id=v_branch and re.status in ('RECEIVED','PROCESSING')
   where original_accrual.id=v_original and original_accrual.legal_entity_id=v_hq
     and original_accrual.dealer_account_id=v_account and original_accrual.branch_id=v_branch
   for update of original_accrual,original_run,original_period,posting_period,re;
  if not found then raise exception using errcode='23514',message='refund reversal context changed'; end if;
  if v_original_period<>v_posting_period and v.original_period_status<>'LOCKED' then raise exception using errcode='23514',message='period provenance mismatch'; end if;
  if v_original_period=v_posting_period and v.original_period_status<>'OPEN' then raise exception using errcode='23514',message='original period is not open'; end if;
  if v.business_date<v.period_start or v.business_date>v.period_end then raise exception using errcode='23514',message='posting period does not cover refund business date'; end if;
  if p_period_provenance->>'refundBusinessDate'<>v.business_date::text then raise exception using errcode='23514',message='refund business date provenance mismatch'; end if;
  v_net:=(p_calculation#>>'{amounts,netAmount}')::numeric(24,8);v_tax:=(p_calculation#>>'{amounts,taxAmount}')::numeric(24,8);
  v_gross:=(p_calculation#>>'{amounts,grossAmount}')::numeric(24,8);v_currency:=p_calculation#>>'{amounts,currency}';
  if p_calculation->>'status'<>'CALCULATED' or v_net<0 or v_tax<0 or v_gross<=0 or v_gross<>v_net+v_tax
     or v_currency<>v.currency_code or v.reversed_gross+v_gross>v.original_gross then raise exception using errcode='23514',message='invalid refund calculation'; end if;
  insert into finance.calculation_runs(legal_entity_id,source_event_id,contract_fee_rule_id,fee_definition_id,finance_period_id,branch_id,run_type,status,business_date,input_hash,result_hash,created_by,correlation_id)
  values(v_hq,v_source,v.contract_fee_rule_id,v.fee_definition_id,v_posting_period,v_branch,'LIVE','POSTED',v.business_date,p_input_hash,p_result_hash,p_actor_id,v_corr) returning id into v_run;
  insert into finance.calculation_snapshots(calculation_run_id,contract_version_id,rule_version_snapshot,tax_version_snapshot,input_snapshot,result_snapshot,snapshot_hash,created_by,correlation_id)
  values(v_run,v.contract_version_id,v.rule_version_snapshot,v.tax_version_snapshot,p_context,p_calculation,p_result_hash,p_actor_id,v_corr);
  insert into finance.journal_entries(legal_entity_id,finance_period_id,idempotency_key,intent_hash,entry_type,business_date,posting_date,status,reversal_of_id,posted_at_utc,posted_by,created_by,correlation_id)
  values(v_hq,v_posting_period,v_idem,p_result_hash,'ACCRUAL_REVERSAL',v.business_date,v.business_date,'POSTED',v.journal_entry_id,pg_catalog.now(),p_actor_id,p_actor_id,v_corr) returning id into v_journal;
  insert into finance.journal_lines(journal_entry_id,line_no,dealer_account_id,account_code,branch_id,currency_code,debit_amount,credit_amount,dimensions,created_by,correlation_id)
  values(v_journal,1,v_account,v.receivable_account_code,v_branch,v_currency,0,v_gross,pg_catalog.jsonb_build_object('originalAccrualId',v_original,'originalPeriodId',v_original_period),p_actor_id,v_corr),
        (v_journal,2,null,v.revenue_account_code,v_branch,v_currency,v_net,0,pg_catalog.jsonb_build_object('originalAccrualId',v_original),p_actor_id,v_corr);
  if v_tax>0 then
    insert into finance.journal_lines(journal_entry_id,line_no,dealer_account_id,account_code,branch_id,currency_code,debit_amount,credit_amount,dimensions,created_by,correlation_id)
    values(v_journal,3,null,v.tax_account_code,v_branch,v_currency,v_tax,0,pg_catalog.jsonb_build_object('originalAccrualId',v_original),p_actor_id,v_corr);
  end if;
  if (select coalesce(sum(debit_amount),0)<>coalesce(sum(credit_amount),0) from finance.journal_lines where journal_entry_id=v_journal) then raise exception using errcode='23514',message='refund journal is not balanced'; end if;
  insert into finance.accruals(legal_entity_id,calculation_run_id,dealer_account_id,branch_id,journal_entry_id,sequence_no,fee_definition_id,currency_code,net_amount,tax_amount,gross_amount,status,reversal_of_id,created_by,correlation_id)
  values(v_hq,v_run,v_account,v_branch,v_journal,1,v.fee_definition_id,v_currency,-v_net,-v_tax,-v_gross,'POSTED',v_original,p_actor_id,v_corr) returning id into v_accrual;
  insert into finance.open_items(legal_entity_id,accrual_id,dealer_account_id,branch_id,due_date,currency_code,item_type,original_amount,allocated_amount,open_amount,status,created_by,correlation_id)
  values(v_hq,v_accrual,v_account,v_branch,v.business_date,v_currency,'CREDIT',v_gross,0,v_gross,'OPEN',p_actor_id,v_corr) returning id into v_open_item;
  update finance.source_events set status='PROCESSING',version=version+1,correlation_id=v_corr where id=v_source and status='RECEIVED';
  v_payload_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(p_calculation::text,'UTF8'),'sha256'),'hex');
  insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id)
  values(v_hq,'finance.accrual','ROYALTY_REFUND_REVERSED','accrual',v_accrual,1,pg_catalog.jsonb_build_object('refundId',v_refund,'originalAccrualId',v_original,'reversalAccrualId',v_accrual,'originalPeriodId',v_original_period,'postingPeriodId',v_posting_period),v_payload_hash,'PENDING',v_corr);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||v_hq::text,0));
  select ae.integrity_hash into v_previous_hash from finance.audit_events ae where ae.legal_entity_id=v_hq order by ae.created_at_utc desc,ae.id desc limit 1;
  v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_hash,'GENESIS')||':'||v_accrual::text||':ROYALTY_REFUND_REVERSED:'||p_result_hash||':'||v_corr::text,'UTF8'),'sha256'),'hex');
  insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)
  values(v_hq,p_actor_id,'SYSTEM','ROYALTY_REFUND_REVERSED','accrual',v_accrual,'ALLOW',p_result_hash,v_previous_hash,v_audit_hash,pg_catalog.jsonb_build_object('refundId',v_refund,'originalAccrualId',v_original,'originalPeriodId',v_original_period,'postingPeriodId',v_posting_period),v_corr);
  return pg_catalog.jsonb_build_object('outcome','CREATED','calculationRunId',v_run,'reversalAccrualId',v_accrual,'openItemId',v_open_item,'inputHash',p_input_hash,'resultHash',p_result_hash);
end $$;

revoke all on function finance_api.load_royalty_refund_context(uuid,uuid,uuid,uuid,uuid,uuid) from public, anon, authenticated;
revoke all on function finance_api.find_royalty_refund_intent(uuid,uuid) from public, anon, authenticated;
revoke all on function finance_api.commit_royalty_refund_reversal(uuid,jsonb,jsonb,jsonb,jsonb,jsonb,text,text) from public, anon, authenticated;
-- Execute grants are intentionally absent until a reviewed server-only database role is provisioned.
