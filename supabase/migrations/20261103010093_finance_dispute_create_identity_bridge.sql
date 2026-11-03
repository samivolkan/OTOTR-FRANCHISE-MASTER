-- Real ERP identity bridge for branch-scoped dispute draft creation.
-- Browser users only authorize; financial mutation remains service-role only.

create or replace function finance_private.resolve_dispute_create_scope(p_actor_id uuid,p_dealer_account_id uuid,p_target_record_type text,p_target_record_id uuid,p_permission text)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;r record;
begin
  if p_permission<>'finance.disputes.create' or p_target_record_type not in('OPEN_ITEM','ACCRUAL','EXTERNAL_INVOICE_LINE') then return null;end if;
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE','BRANCH_MANAGER') then return null;end if;
  select oi.legal_entity_id,oi.dealer_account_id,oi.branch_id into r from finance.open_items oi join finance.accruals a on a.id=oi.accrual_id left join finance.billing_batch_items bbi on bbi.accrual_id=a.id and bbi.status='ACTIVE' left join finance.external_invoice_lines eil on eil.billing_batch_item_id=bbi.id where oi.dealer_account_id=p_dealer_account_id and ((p_target_record_type='OPEN_ITEM' and oi.id=p_target_record_id) or (p_target_record_type='ACCRUAL' and a.id=p_target_record_id) or (p_target_record_type='EXTERNAL_INVOICE_LINE' and eil.id=p_target_record_id)) and oi.status not in('CLOSED','REVERSED') limit 1;
  if not found or not finance_private.current_actor_can_read_scope(p_actor_id,r.legal_entity_id,r.dealer_account_id,r.branch_id,'getAccrualDetail') then return null;end if;
  return jsonb_build_object('allowed',true,'legalEntityId',r.legal_entity_id,'dealerAccountId',r.dealer_account_id,'branchId',r.branch_id);
end$$;

create or replace function finance_private.current_dispute_create_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

revoke all on function finance_private.resolve_dispute_create_scope(uuid,uuid,text,uuid,text) from public,anon,authenticated;
revoke all on function finance_private.current_dispute_create_committer_is_trusted() from public,anon,authenticated;
grant execute on function finance_api.commit_dispute_create(uuid,uuid,uuid,uuid,text,uuid,numeric,text,text,text,uuid[],text,text,uuid) to service_role;
