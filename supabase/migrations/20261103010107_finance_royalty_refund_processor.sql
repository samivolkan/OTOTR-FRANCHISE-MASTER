-- Atomic royalty-refund processor. The caller supplies only immutable event
-- identity; amounts and period provenance are derived from server-side data.

create or replace function finance_api.process_royalty_refund_reversal(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_legal_entity_id uuid,
  p_dealer_account_id uuid,p_branch_id uuid,p_source_event_id uuid,p_refund_id uuid,
  p_idempotency_key text,p_correlation_id uuid
) returns jsonb language plpgsql volatile security definer set search_path='' as $$
declare
  v_context jsonb;v_original uuid;v_original_period uuid;v_posting_period uuid;
  v_refund_business_date date;v_currency text;v_refund_gross numeric(24,8);
  v_collection_gross numeric(24,8);v_cumulative_refund numeric(24,8);
  v_original_net numeric(24,8);v_original_tax numeric(24,8);v_original_gross numeric(24,8);
  v_remaining_gross numeric(24,8);v_reversal_net numeric(24,8);
  v_reversal_tax numeric(24,8);v_reversal_gross numeric(24,8);
  v_command jsonb;v_refund jsonb;v_calculation jsonb;v_provenance jsonb;
  v_input_hash text;v_result_hash text;v_existing jsonb;
begin
  if not finance_private.current_refund_worker_is_trusted() then
    raise exception using errcode='42501',message='refund worker denied';
  end if;
  if p_actor_id is null or p_correlation_id is null
     or coalesce(pg_catalog.btrim(p_idempotency_key),'')=''
     or pg_catalog.length(p_idempotency_key)>200 then
    raise exception using errcode='22023',message='required refund processor fields missing';
  end if;

  v_context:=finance_api.load_royalty_refund_context(
    p_legal_entity_id,p_dealer_legal_entity_id,p_dealer_account_id,
    p_branch_id,p_source_event_id,p_refund_id
  );
  if v_context is null then return pg_catalog.jsonb_build_object('outcome','NOT_FOUND');end if;

  v_original:=(v_context#>>'{originalRoyaltyAccrual,id}')::uuid;
  v_existing:=finance_api.find_royalty_refund_intent(p_refund_id,v_original);
  if v_existing is not null then return v_existing;end if;
  v_original_period:=(v_context#>>'{financePeriod,id}')::uuid;
  v_posting_period:=coalesce(
    (v_context#>>'{currentOpenFinancePeriod,id}')::uuid,v_original_period
  );
  v_refund_business_date:=(v_context#>>'{sourceEvent,businessDate}')::date;
  v_refund_gross:=(v_context#>>'{sourcePayload,refundedGrossAmount}')::numeric(24,8);
  v_collection_gross:=(v_context#>>'{originalCollectionPayload,collectedGrossAmount}')::numeric(24,8);
  v_cumulative_refund:=(v_context#>>'{refundState,cumulativeRefundedGrossAmount}')::numeric(24,8);
  v_remaining_gross:=(v_context#>>'{refundState,remainingRoyaltyReversibleGrossAmount}')::numeric(24,8);
  v_currency:=v_context#>>'{refundState,currency}';

  select a.net_amount,a.tax_amount,a.gross_amount into strict
    v_original_net,v_original_tax,v_original_gross
    from finance.accruals a
   where a.id=v_original and a.legal_entity_id=p_legal_entity_id
     and a.dealer_account_id=p_dealer_account_id and a.branch_id=p_branch_id
     and a.reversal_of_id is null and a.status in('POSTED','DISPUTED');

  if v_context#>>'{sourcePayload,settlementStatus}'<>'SETTLED'
     or v_context#>>'{sourcePayload,refundStatus}'<>'SETTLED'
     or v_context#>>'{sourcePayload,currency}'<>v_currency
     or v_refund_gross<=0 or v_collection_gross<=0
     or v_cumulative_refund+v_refund_gross>v_collection_gross
     or v_original_gross<=0 or v_remaining_gross<=0 then
    raise exception using errcode='23514',message='invalid settled refund calculation context';
  end if;

  v_reversal_gross:=least(v_remaining_gross,pg_catalog.round(v_original_gross*v_refund_gross/v_collection_gross,8));
  v_reversal_net:=pg_catalog.round(v_original_net*v_reversal_gross/v_original_gross,8);
  v_reversal_tax:=v_reversal_gross-v_reversal_net;
  if v_reversal_gross<=0 or v_reversal_net<0 or v_reversal_tax<0 then
    raise exception using errcode='23514',message='invalid royalty reversal amount';
  end if;

  v_command:=pg_catalog.jsonb_build_object(
    'legalEntityId',p_legal_entity_id,'dealerLegalEntityId',p_dealer_legal_entity_id,
    'dealerAccountId',p_dealer_account_id,'branchId',p_branch_id,
    'sourceEventId',p_source_event_id,'refundId',p_refund_id,
    'correlationId',p_correlation_id,'idempotencyKey',p_idempotency_key
  );
  v_refund:=pg_catalog.jsonb_build_object('originalRoyaltyAccrualId',v_original);
  v_calculation:=pg_catalog.jsonb_build_object(
    'status','CALCULATED','basisAmount',v_refund_gross::text,
    'amounts',pg_catalog.jsonb_build_object(
      'netAmount',v_reversal_net::text,'taxAmount',v_reversal_tax::text,
      'grossAmount',v_reversal_gross::text,'currency',v_currency
    ),
    'policy','PROPORTIONAL_REVERSAL_WITH_ORIGINAL_PROVENANCE'
  );
  v_provenance:=pg_catalog.jsonb_build_object(
    'originalPeriodId',v_original_period,'postingPeriodId',v_posting_period,
    'refundBusinessDate',v_refund_business_date
  );
  v_input_hash:=pg_catalog.encode(extensions.digest(
    pg_catalog.convert_to((v_command-'correlationId')::text||':'||v_context::text,'UTF8'),'sha256'
  ),'hex');
  v_result_hash:=pg_catalog.encode(extensions.digest(
    pg_catalog.convert_to(v_calculation::text||':'||v_provenance::text,'UTF8'),'sha256'
  ),'hex');

  return finance_api.commit_royalty_refund_reversal(
    p_actor_id,v_command,v_context,v_refund,v_calculation,v_provenance,
    v_input_hash,v_result_hash
  );
end$$;

revoke all on function finance_api.process_royalty_refund_reversal(uuid,uuid,uuid,uuid,uuid,uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function finance_api.process_royalty_refund_reversal(uuid,uuid,uuid,uuid,uuid,uuid,uuid,text,uuid) to service_role;
