-- ERP identity, accounting context and atomic checker decision for disputes.
-- The browser authorizes with the user JWT; only service_role can mutate finance records.

create or replace function finance_private.current_dispute_decision_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_private.current_actor_can_decide_dispute(p_actor_id uuid,p_dispute_id uuid)
returns boolean language plpgsql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;r record;
begin
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE') then return false;end if;
  select d.created_by,d.legal_entity_id,o.dealer_account_id,o.branch_id into r from finance.disputes d join finance.open_items o on o.id=d.open_item_id where d.id=p_dispute_id;
  return found and r.created_by<>p_actor_id and finance_private.current_actor_can_read_scope(p_actor_id,r.legal_entity_id,r.dealer_account_id,r.branch_id,'getDispute');
end$$;

create or replace function finance_private.resolve_dispute_decision_context(p_dispute_id uuid,p_decision_date date,p_accepted_amount numeric)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance as $$
declare r record;v_period uuid;v_net numeric(24,8);v_tax numeric(24,8);v_net_account text;v_tax_account text;v_receivable text;
begin
  select d.legal_entity_id,a.id accrual_id,a.net_amount,a.tax_amount,a.gross_amount,a.journal_entry_id,je.finance_period_id original_period_id,o.dealer_account_id,o.branch_id
    into r from finance.disputes d join finance.open_items o on o.id=d.open_item_id join finance.accruals a on a.id=o.accrual_id join finance.journal_entries je on je.id=a.journal_entry_id where d.id=p_dispute_id;
  if not found or r.gross_amount<=0 or p_accepted_amount<=0 or p_accepted_amount>r.gross_amount then return null;end if;
  select fp.id into v_period from finance.finance_periods fp where fp.legal_entity_id=r.legal_entity_id and fp.scope_type='HEADQUARTERS' and fp.mode='LIVE' and fp.status='OPEN' and p_decision_date between fp.period_start and fp.period_end order by fp.period_start desc limit 1;
  if v_period is null then return null;end if;
  v_net:=round(p_accepted_amount*r.net_amount/r.gross_amount,8);v_tax:=p_accepted_amount-v_net;
  select jl.account_code into v_receivable from finance.journal_lines jl where jl.journal_entry_id=r.journal_entry_id and jl.dealer_account_id=r.dealer_account_id and jl.branch_id=r.branch_id and jl.debit_amount>0 order by jl.line_no limit 1;
  select jl.account_code into v_net_account from finance.journal_lines jl where jl.journal_entry_id=r.journal_entry_id and jl.dealer_account_id=r.dealer_account_id and jl.branch_id=r.branch_id and jl.credit_amount>0 order by jl.credit_amount desc,jl.line_no limit 1;
  if v_tax>0 then select jl.account_code into v_tax_account from finance.journal_lines jl where jl.journal_entry_id=r.journal_entry_id and jl.dealer_account_id=r.dealer_account_id and jl.branch_id=r.branch_id and jl.credit_amount>0 and jl.account_code<>v_net_account order by jl.line_no limit 1;end if;
  if v_receivable is null or v_net_account is null or (v_tax>0 and v_tax_account is null) then return null;end if;
  return jsonb_build_object('scopeValid',true,'financePeriodId',v_period,'originalFinancePeriodId',r.original_period_id,'netAmount',v_net::text,'taxAmount',v_tax::text,'grossAmount',p_accepted_amount::text,'netDebitAccountCode',v_net_account,'taxDebitAccountCode',v_tax_account,'receivableCreditAccountCode',v_receivable);
end$$;

create or replace function finance_api.authorize_dispute_decision(p_dispute_id uuid,p_permission text)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private as $$
declare d finance.disputes%rowtype;o finance.open_items%rowtype;
begin
  if auth.uid() is null or p_permission<>'finance.disputes.decide' or not finance_private.current_actor_can_decide_dispute(auth.uid(),p_dispute_id) then return null;end if;
  select * into d from finance.disputes where id=p_dispute_id;select * into o from finance.open_items where id=d.open_item_id;
  if d.status not in('SUBMITTED','UNDER_REVIEW') then return null;end if;
  return jsonb_build_object('allowed',true,'legalEntityId',d.legal_entity_id,'dealerAccountId',o.dealer_account_id,'branchId',o.branch_id,'status',d.status,'version',d.version,'disputedAmount',d.disputed_amount::text,'currencyCode',o.currency_code);
end$$;

create or replace function finance_api.commit_dispute_review_decision(p_actor_id uuid,p_dispute_id uuid,p_decision text,p_accepted_amount numeric,p_decision_date date,p_expected_version bigint,p_reason_code text,p_note_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_api,finance_private,extensions as $$
declare d finance.disputes%rowtype;v_snapshot jsonb;v_hash text;v_request uuid;v_result jsonb;
begin
  if not finance_private.current_dispute_decision_worker_is_trusted() or not finance_private.current_actor_can_decide_dispute(p_actor_id,p_dispute_id) then raise exception using errcode='42501',message='trusted independent dispute checker required';end if;
  select * into d from finance.disputes where id=p_dispute_id for update;if not found then raise exception using errcode='P0002',message='dispute not found';end if;
  if d.decision_idempotency_key is not null then return finance_api.commit_dispute_decision(p_actor_id,p_dispute_id,p_decision,p_accepted_amount,p_decision_date,p_expected_version,p_reason_code,p_note_hash,p_idempotency_key,p_intent_hash,p_correlation_id);end if;
  if d.version<>p_expected_version or d.status not in('SUBMITTED','UNDER_REVIEW') then return jsonb_build_object('outcome','CONFLICT');end if;
  v_snapshot:=jsonb_build_object('disputeId',d.id,'caseNo',d.case_no,'disputedAmount',d.disputed_amount::text,'decision',p_decision,'acceptedAmount',p_accepted_amount::text,'decisionDate',p_decision_date,'reasonCode',p_reason_code,'noteHash',p_note_hash,'sourceVersion',d.version);
  v_hash:=encode(digest(convert_to(v_snapshot::text,'UTF8'),'sha256'),'hex');
  insert into finance.approval_requests(legal_entity_id,subject_type,subject_id,approval_policy_version,prepared_by,subject_snapshot,subject_snapshot_hash,status,version,created_by,correlation_id) values(d.legal_entity_id,'DISPUTE_DECISION',d.id,'DISPUTE_CHECKER_V1',d.created_by,v_snapshot,v_hash,'APPROVED',1,d.created_by,p_correlation_id) returning id into v_request;
  insert into finance.approval_steps(approval_request_id,step_no,required_role,decision,decided_by,decided_at_utc,evidence_ref,created_by,correlation_id) values(v_request,1,'finance-dispute-approver','APPROVE',p_actor_id,statement_timestamp(),'DISPUTE_DECISION:'||p_correlation_id::text,d.created_by,p_correlation_id);
  v_result:=finance_api.commit_dispute_decision(p_actor_id,p_dispute_id,p_decision,p_accepted_amount,p_decision_date,p_expected_version,p_reason_code,p_note_hash,p_idempotency_key,p_intent_hash,p_correlation_id);
  if v_result->>'outcome' not in('COMMITTED','REPLAY') then raise exception using errcode='40001',message='dispute changed during checker decision';end if;
  return v_result||jsonb_build_object('approvalRequestId',v_request,'snapshotHash',v_hash);
end$$;

revoke all on function finance_private.current_dispute_decision_worker_is_trusted() from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_decide_dispute(uuid,uuid) from public,anon,authenticated;
revoke all on function finance_private.resolve_dispute_decision_context(uuid,date,numeric) from public,anon,authenticated;
revoke all on function finance_api.authorize_dispute_decision(uuid,text) from public,anon;
grant execute on function finance_api.authorize_dispute_decision(uuid,text) to authenticated;
revoke all on function finance_api.commit_dispute_review_decision(uuid,uuid,text,numeric,date,bigint,text,text,text,text,uuid) from public,anon,authenticated;
grant execute on function finance_api.commit_dispute_review_decision(uuid,uuid,text,numeric,date,bigint,text,text,text,text,uuid) to service_role;
