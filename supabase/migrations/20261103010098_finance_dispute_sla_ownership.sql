-- Configurable dispute SLA and ownership. No commercial duration is seeded.

create table finance.dispute_sla_policies(
  id uuid primary key default gen_random_uuid(),legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  policy_code text not null,version_no integer not null check(version_no>0),clock_type text not null check(clock_type='CALENDAR_MINUTES'),
  response_minutes integer not null check(response_minutes between 1 and 43200),resolution_minutes integer not null check(resolution_minutes between response_minutes and 129600),
  owner_role text not null check(owner_role in('FINANCE','GENERAL_MANAGER')),effective_from date not null,effective_to date null,
  status text not null check(status in('DRAFT','PUBLISHED','SUPERSEDED','DISABLED')),approved_by uuid null,approved_at_utc timestamptz null,
  version bigint not null default 1 check(version>0),created_at_utc timestamptz not null default now(),created_by uuid not null,correlation_id uuid not null,
  unique(legal_entity_id,policy_code,version_no),check(effective_to is null or effective_from<effective_to),check((status='PUBLISHED')=(approved_by is not null and approved_at_utc is not null))
);
create unique index dispute_sla_one_published_idx on finance.dispute_sla_policies(legal_entity_id,policy_code) where status='PUBLISHED';

create table finance.dispute_work_items(
  id uuid primary key default gen_random_uuid(),legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dispute_id uuid not null references finance.disputes(id) on delete restrict,policy_id uuid not null references finance.dispute_sla_policies(id) on delete restrict,
  owner_role text not null,owner_user_id uuid null,response_due_at_utc timestamptz not null,resolution_due_at_utc timestamptz not null,
  first_response_at_utc timestamptz null,completed_at_utc timestamptz null,status text not null check(status in('OPEN','IN_PROGRESS','COMPLETED','CANCELLED')),
  version bigint not null default 1 check(version>0),created_at_utc timestamptz not null default now(),created_by uuid not null,correlation_id uuid not null,
  unique(dispute_id),check(response_due_at_utc<=resolution_due_at_utc),check((status='COMPLETED')=(completed_at_utc is not null))
);
create index dispute_work_items_due_idx on finance.dispute_work_items(legal_entity_id,status,resolution_due_at_utc);

alter table finance.dispute_sla_policies enable row level security;alter table finance.dispute_sla_policies force row level security;
alter table finance.dispute_work_items enable row level security;alter table finance.dispute_work_items force row level security;
revoke all on table finance.dispute_sla_policies,finance.dispute_work_items from public,anon,authenticated;

create or replace function finance_private.create_dispute_work_item_from_policy()
returns trigger language plpgsql security definer set search_path=pg_catalog,finance as $$
declare p finance.dispute_sla_policies%rowtype;
begin
  if new.status='SUBMITTED' and old.status is distinct from new.status then
    select * into p from finance.dispute_sla_policies x where x.legal_entity_id=new.legal_entity_id and x.policy_code='DISPUTE_REVIEW' and x.status='PUBLISHED' and current_date>=x.effective_from and(x.effective_to is null or current_date<x.effective_to) order by x.version_no desc limit 1;
    if found then insert into finance.dispute_work_items(legal_entity_id,dispute_id,policy_id,owner_role,response_due_at_utc,resolution_due_at_utc,status,created_by,correlation_id) values(new.legal_entity_id,new.id,p.id,p.owner_role,clock_timestamp()+make_interval(mins=>p.response_minutes),clock_timestamp()+make_interval(mins=>p.resolution_minutes),'OPEN',new.created_by,new.correlation_id) on conflict(dispute_id) do nothing;end if;
  end if;
  if new.status in('ACCEPTED','PARTIALLY_ACCEPTED','REJECTED','CLOSED') and old.status is distinct from new.status then update finance.dispute_work_items set status='COMPLETED',completed_at_utc=clock_timestamp(),version=version+1,correlation_id=new.correlation_id where dispute_id=new.id and status in('OPEN','IN_PROGRESS');end if;
  return new;
end$$;
create trigger create_dispute_work_item_after_status after update of status on finance.disputes for each row execute function finance_private.create_dispute_work_item_from_policy();

create or replace function finance_api.get_dispute_sla_state(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_dispute_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare d finance.disputes%rowtype;w finance.dispute_work_items%rowtype;p finance.dispute_sla_policies%rowtype;v_now timestamptz:=clock_timestamp();
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDispute') then raise exception using errcode='42501',message='finance scope denied';end if;
  select x.* into d from finance.disputes x join finance.open_items o on o.id=x.open_item_id where x.id=p_dispute_id and x.legal_entity_id=p_legal_entity_id and o.dealer_account_id=p_dealer_account_id and o.branch_id=p_branch_id;if not found then return null;end if;
  select * into w from finance.dispute_work_items where dispute_id=d.id;if not found then return jsonb_build_object('configured',false,'reason','NO_PUBLISHED_POLICY','disputeStatus',d.status);end if;
  select * into p from finance.dispute_sla_policies where id=w.policy_id;
  return jsonb_build_object('configured',true,'policyCode',p.policy_code,'policyVersion',p.version_no,'clockType',p.clock_type,'ownerRole',w.owner_role,'ownerUserId',w.owner_user_id,'status',w.status,'responseDueAtUtc',w.response_due_at_utc,'resolutionDueAtUtc',w.resolution_due_at_utc,'firstResponseAtUtc',w.first_response_at_utc,'completedAtUtc',w.completed_at_utc,'responseBreached',w.first_response_at_utc is null and v_now>w.response_due_at_utc,'resolutionBreached',w.completed_at_utc is null and v_now>w.resolution_due_at_utc,'version',w.version);
end$$;

revoke all on function finance_private.create_dispute_work_item_from_policy() from public,anon,authenticated;
revoke all on function finance_api.get_dispute_sla_state(uuid,uuid,uuid,uuid) from public,anon;grant execute on function finance_api.get_dispute_sla_state(uuid,uuid,uuid,uuid) to authenticated;
