-- ERP identity bridge for pass-through expense lifecycle commands.
-- Browser JWT authorizes headquarters scope; only service_role executes mutations.

create or replace function finance_private.current_pass_through_expense_create_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_expense_share_calculator_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_expense_approval_committer_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_expense_posting_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;
create or replace function finance_private.current_expense_reversal_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as
$$select coalesce(current_setting('request.jwt.claim.role',true),'')='service_role'$$;

create or replace function finance_private.current_actor_can_manage_expense(
  p_actor_id uuid,p_expense_id uuid,p_action text
) returns boolean language sql stable security definer
set search_path=pg_catalog,public,finance,finance_private as $$
  select exists(
    select 1 from public.app_users u
    join finance.pass_through_expenses e on e.id=p_expense_id
    where u.auth_user_id=p_actor_id and u.is_active
      and u.role in('CEO','GENERAL_MANAGER','FINANCE')
      and finance_private.current_actor_can_read_headquarters(p_actor_id,e.legal_entity_id,'getPassThroughExpense')
      and case
        when p_action='CALCULATE' then e.status='DRAFT' and e.prepared_by=p_actor_id
        when p_action='SUBMIT' then e.status='CALCULATED' and e.prepared_by=p_actor_id
        when p_action='APPROVE' then e.status='PENDING_APPROVAL' and e.prepared_by<>p_actor_id
        when p_action='POST' then e.status='APPROVED' and e.approved_by is not null and e.approved_by<>e.prepared_by
        when p_action='REVERSE' then e.status='POSTED'
        else false end
  )
$$;

create or replace function finance_private.resolve_expense_share_authorization(
  p_actor_id uuid,p_expense_id uuid,p_permission text
) returns jsonb language sql stable security definer
set search_path=pg_catalog,finance,finance_private as $$
  select case when p_permission='finance.expenses.calculate'
    and finance_private.current_actor_can_manage_expense(p_actor_id,p_expense_id,'CALCULATE')
    then jsonb_build_object('allowed',true,'legalEntityId',e.legal_entity_id,'expenseId',e.id,'status',e.status,'version',e.version)
    else jsonb_build_object('allowed',false) end
  from finance.pass_through_expenses e where e.id=p_expense_id
$$;

create or replace function finance_private.resolve_expense_approval_scope(
  p_actor_id uuid,p_expense_id uuid,p_permission text
) returns boolean language sql stable security definer
set search_path=pg_catalog,finance_private as $$
  select case p_permission
    when 'finance.expenses.submit' then finance_private.current_actor_can_manage_expense(p_actor_id,p_expense_id,'SUBMIT')
    when 'finance.expenses.approve' then finance_private.current_actor_can_manage_expense(p_actor_id,p_expense_id,'APPROVE')
    else false end
$$;

create or replace function finance_private.current_actor_can_post_expense(p_actor_id uuid,p_expense_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance_private as
$$select finance_private.current_actor_can_manage_expense(p_actor_id,p_expense_id,'POST')$$;
create or replace function finance_private.current_actor_can_reverse_expense(p_actor_id uuid,p_expense_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,finance_private as
$$select finance_private.current_actor_can_manage_expense(p_actor_id,p_expense_id,'REVERSE')$$;

create or replace function finance_api.authorize_expense_action_scope(
  p_expense_id uuid,p_action text,p_permission text
) returns jsonb language sql stable security definer
set search_path=pg_catalog,finance,finance_private as $$
  select case when auth.uid() is not null
    and ((p_action='CALCULATE' and p_permission='finance.expenses.calculate')
      or (p_action='SUBMIT' and p_permission='finance.expenses.submit')
      or (p_action='APPROVE' and p_permission='finance.expenses.approve')
      or (p_action='POST' and p_permission='finance.expenses.post')
      or (p_action='REVERSE' and p_permission='finance.expenses.reverse'))
    and finance_private.current_actor_can_manage_expense(auth.uid(),p_expense_id,p_action)
    then jsonb_build_object('allowed',true,'legalEntityId',e.legal_entity_id,'expenseId',e.id,'status',e.status,'version',e.version,'preparedBy',e.prepared_by,'approvedBy',e.approved_by)
    else jsonb_build_object('allowed',false) end
  from finance.pass_through_expenses e where e.id=p_expense_id
$$;

revoke all on function finance_private.current_actor_can_manage_expense(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_api.authorize_expense_action_scope(uuid,text,text) from public,anon;
grant execute on function finance_api.authorize_expense_action_scope(uuid,text,text) to authenticated;
grant execute on function finance_api.commit_pass_through_expense_create(uuid,uuid,text,text,uuid,date,text,numeric,numeric,numeric,text,uuid[],jsonb,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_expense_share_calculation(uuid,uuid,text,text,bigint,text,text,uuid) to service_role;
grant execute on function finance_api.commit_expense_submit_approval(uuid,uuid,bigint,text,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_expense_approve(uuid,uuid,bigint,text,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_pass_through_expense_posting(uuid,uuid,date,bigint,text,text,text,text,uuid) to service_role;
grant execute on function finance_api.commit_pass_through_expense_reversal(uuid,uuid,date,bigint,text,text,uuid[],text,text,uuid) to service_role;
