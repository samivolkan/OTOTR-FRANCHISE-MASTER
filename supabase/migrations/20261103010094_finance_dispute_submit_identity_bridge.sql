-- Real ERP identity bridge for branch-scoped dispute submission.
-- Browser users only authorize; the state mutation remains service-role only.

drop function finance_api.authorize_dispute_submit(uuid,text);
drop function finance_private.resolve_dispute_submit_scope(uuid,uuid,text);

create or replace function finance_private.resolve_dispute_submit_scope(p_actor_id uuid,p_dispute_id uuid,p_permission text)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;r record;
begin
  if p_permission<>'finance.disputes.submit' then return null;end if;
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found or u.role not in('CEO','GENERAL_MANAGER','FINANCE','BRANCH_MANAGER') then return null;end if;
  select d.legal_entity_id,o.dealer_account_id,o.branch_id,d.status,d.version into r
  from finance.disputes d join finance.open_items o on o.id=d.open_item_id and o.legal_entity_id=d.legal_entity_id
  where d.id=p_dispute_id limit 1;
  if not found or r.status<>'DRAFT' or not finance_private.current_actor_can_read_scope(p_actor_id,r.legal_entity_id,r.dealer_account_id,r.branch_id,'getDispute') then return null;end if;
  return jsonb_build_object('allowed',true,'legalEntityId',r.legal_entity_id,'dealerAccountId',r.dealer_account_id,'branchId',r.branch_id,'status',r.status,'version',r.version);
end$$;

create or replace function finance_api.authorize_dispute_submit(p_dispute_id uuid,p_permission text)
returns jsonb language sql stable security definer set search_path=pg_catalog,finance_private as $$
select finance_private.resolve_dispute_submit_scope(auth.uid(),p_dispute_id,p_permission)
$$;

create or replace function finance_private.current_dispute_submit_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

revoke all on function finance_private.resolve_dispute_submit_scope(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_private.current_dispute_submit_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_api.authorize_dispute_submit(uuid,text) from public,anon;
grant execute on function finance_api.authorize_dispute_submit(uuid,text) to authenticated;
grant execute on function finance_api.commit_dispute_submit(uuid,uuid,bigint,text,text,text,text,uuid) to service_role;
