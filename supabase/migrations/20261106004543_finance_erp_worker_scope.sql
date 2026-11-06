-- Scope grants are maintained by Auth administrators and read fresh on each request.
create function finance_private.erp_worker_has_scope(
  p_actor_id uuid, p_hq_id uuid, p_dealer_id uuid, p_branch_id uuid, p_permission text
) returns boolean
language sql stable security definer set search_path = ''
as $$
  select p_actor_id = auth.uid() and exists (
    select 1 from auth.users u
    where u.id = p_actor_id
      and u.deleted_at is null
      and (u.banned_until is null or u.banned_until <= pg_catalog.now())
      and (u.raw_app_meta_data->'finance_worker_scopes') @> pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'legalEntityId', p_hq_id, 'dealerLegalEntityId', p_dealer_id,
          'branchId', p_branch_id, 'permissions', pg_catalog.jsonb_build_array(p_permission)
        )
      )
  )
$$;

revoke all on function finance_private.erp_worker_has_scope(uuid,uuid,uuid,uuid,text)
  from public, anon, authenticated;

create or replace function finance_private.current_actor_can_ingest_source_event(
  p_actor_id uuid, p_headquarters_legal_entity_id uuid, p_dealer_legal_entity_id uuid, p_branch_id uuid
) returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(finance_private.erp_worker_has_scope(
    p_actor_id, p_headquarters_legal_entity_id, p_dealer_legal_entity_id, p_branch_id,
    'finance.source-events.ingest'
  ), false)
$$;

create or replace function finance_private.current_actor_can_calculate_accrual(
  p_actor_id uuid, p_legal_entity_id uuid, p_dealer_legal_entity_id uuid, p_branch_id uuid
) returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(finance_private.erp_worker_has_scope(
    p_actor_id, p_legal_entity_id, p_dealer_legal_entity_id, p_branch_id,
    'finance.accruals.calculate'
  ), false)
$$;
