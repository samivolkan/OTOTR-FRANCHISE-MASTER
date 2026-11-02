-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-erp-finance-identity-bridge.sql
-- Source SHA256: A460E7B74D619FED35B2527C7319E5CDEB937223FDF604D629B70C996C57AABF
-- Local replay required before any staging promotion.
create table if not exists finance_private.erp_branch_scope_mappings (
  id uuid primary key default gen_random_uuid(),
  erp_branch_id uuid not null references public.branches(id) on delete restrict,
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  finance_branch_id uuid not null references finance.branches(id) on delete restrict,
  effective_from date not null,
  effective_to date null,
  status text not null check(status in('ACTIVE','SUPERSEDED','CANCELLED')),
  created_by uuid not null references public.app_users(id) on delete restrict,
  created_at_utc timestamptz not null default pg_catalog.statement_timestamp(),
  correlation_id uuid not null,
  check(effective_to is null or effective_from<effective_to),
  unique(erp_branch_id,effective_from)
);

create table if not exists finance_private.actor_scope_grants (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete restrict,
  legal_entity_id uuid not null references finance.legal_entities(id) on delete restrict,
  dealer_account_id uuid not null references finance.dealer_accounts(id) on delete restrict,
  finance_branch_id uuid not null references finance.branches(id) on delete restrict,
  effective_from date not null,
  effective_to date null,
  status text not null check(status in('ACTIVE','SUPERSEDED','REVOKED')),
  granted_by uuid not null references public.app_users(id) on delete restrict,
  created_at_utc timestamptz not null default pg_catalog.statement_timestamp(),
  correlation_id uuid not null,
  check(app_user_id<>granted_by),
  check(effective_to is null or effective_from<effective_to),
  unique(app_user_id,legal_entity_id,dealer_account_id,finance_branch_id,effective_from)
);

create or replace function finance_private.guard_identity_bridge_validity_overlap() returns trigger
language plpgsql security definer set search_path=pg_catalog,finance_private as $$
declare v_key text;
begin
  v_key:=case when tg_table_name='erp_branch_scope_mappings' then new.erp_branch_id::text else new.app_user_id::text||':'||new.legal_entity_id::text||':'||new.dealer_account_id::text||':'||new.finance_branch_id::text end;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('finance-identity-bridge:'||v_key,0));
  if tg_table_name='erp_branch_scope_mappings' then
    if new.status='ACTIVE' and exists(select 1 from finance_private.erp_branch_scope_mappings m where m.id<>new.id and m.erp_branch_id=new.erp_branch_id and m.status='ACTIVE' and pg_catalog.daterange(m.effective_from,m.effective_to,'[)')&&pg_catalog.daterange(new.effective_from,new.effective_to,'[)')) then raise exception using errcode='23P01',message='overlapping ERP branch finance scope mapping';end if;
  else
    if new.status='ACTIVE' and exists(select 1 from finance_private.actor_scope_grants g where g.id<>new.id and g.app_user_id=new.app_user_id and g.legal_entity_id=new.legal_entity_id and g.dealer_account_id=new.dealer_account_id and g.finance_branch_id=new.finance_branch_id and g.status='ACTIVE' and pg_catalog.daterange(g.effective_from,g.effective_to,'[)')&&pg_catalog.daterange(new.effective_from,new.effective_to,'[)')) then raise exception using errcode='23P01',message='overlapping finance actor scope grant';end if;
  end if;
  return new;
end$$;

create trigger guard_erp_branch_scope_mapping_overlap before insert or update on finance_private.erp_branch_scope_mappings for each row execute function finance_private.guard_identity_bridge_validity_overlap();
create trigger guard_actor_scope_grant_overlap before insert or update on finance_private.actor_scope_grants for each row execute function finance_private.guard_identity_bridge_validity_overlap();

create or replace function finance_private.current_actor_can_read_scope(p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_operation_id text) returns boolean
language plpgsql stable security definer set search_path=pg_catalog,public,finance,finance_private as $$
declare u public.app_users%rowtype;v_role_allowed boolean:=false;v_scope_valid boolean:=false;
begin
  select * into u from public.app_users x where x.auth_user_id=p_actor_id and x.is_active limit 1;
  if not found then return false;end if;
  select exists(select 1 from finance.dealer_accounts da join finance.branches b on b.id=p_branch_id and b.legal_entity_id=p_legal_entity_id and b.dealer_legal_entity_id=da.dealer_legal_entity_id and b.status='ACTIVE' where da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and da.status in('SHADOW','ACTIVE')) into v_scope_valid;
  if not v_scope_valid then return false;end if;
  v_role_allowed:=case
    when u.role in('CEO','GENERAL_MANAGER') then p_operation_id=any(array['getSourceEventStatus','getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','getFinancePeriod'])
    when u.role='FINANCE' then p_operation_id=any(array['getSourceEventStatus','getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','getPayment','getFranchiseContract','listContractVersions','getContractFeeRule','getFinancePeriod'])
    when u.role='BRANCH_MANAGER' then p_operation_id=any(array['getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','getPayment','getFinancePeriod'])
    when u.role in('QUALITY_AUDITOR','LEGAL') then p_operation_id=any(array['getDealerFinanceSummary','getDealerStatement','getAccrualDetail','getRoyaltyRefundTrace','getPayment','getFranchiseContract','listContractVersions','getContractFeeRule','getFinancePeriod','listIntegrationErrors'])
    else false end;
  if not v_role_allowed then return false;end if;
  if u.role in('CEO','GENERAL_MANAGER','FINANCE') then return true;end if;
  if u.role='BRANCH_MANAGER' then return exists(select 1 from finance_private.erp_branch_scope_mappings m where m.erp_branch_id=u.branch_id and m.legal_entity_id=p_legal_entity_id and m.dealer_account_id=p_dealer_account_id and m.finance_branch_id=p_branch_id and m.status='ACTIVE' and m.effective_from<=current_date and (m.effective_to is null or current_date<m.effective_to));end if;
  return exists(select 1 from finance_private.actor_scope_grants g where g.app_user_id=u.id and g.legal_entity_id=p_legal_entity_id and g.dealer_account_id=p_dealer_account_id and g.finance_branch_id=p_branch_id and g.status='ACTIVE' and g.effective_from<=current_date and (g.effective_to is null or current_date<g.effective_to));
end$$;

revoke all on table finance_private.erp_branch_scope_mappings from public,anon,authenticated;
revoke all on table finance_private.actor_scope_grants from public,anon,authenticated;
revoke all on function finance_private.guard_identity_bridge_validity_overlap() from public,anon,authenticated;
revoke all on function finance_private.current_actor_can_read_scope(uuid,uuid,uuid,uuid,text) from public,anon,authenticated;
