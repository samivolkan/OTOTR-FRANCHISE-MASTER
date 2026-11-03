-- Fix polymorphic trigger record access: each table branch references only its own columns.
create or replace function finance_private.guard_identity_bridge_validity_overlap() returns trigger
language plpgsql security definer set search_path=pg_catalog,finance_private as $$
declare v_key text;
begin
 if tg_table_name='erp_branch_scope_mappings' then
  v_key:=new.erp_branch_id::text;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('finance-identity-bridge:'||v_key,0));
  if new.status='ACTIVE' and exists(select 1 from finance_private.erp_branch_scope_mappings m where m.id<>new.id and m.erp_branch_id=new.erp_branch_id and m.status='ACTIVE' and pg_catalog.daterange(m.effective_from,m.effective_to,'[)')&&pg_catalog.daterange(new.effective_from,new.effective_to,'[)')) then raise exception using errcode='23P01',message='overlapping ERP branch finance scope mapping';end if;
 elsif tg_table_name='actor_scope_grants' then
  v_key:=new.app_user_id::text||':'||new.legal_entity_id::text||':'||new.dealer_account_id::text||':'||new.finance_branch_id::text;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('finance-identity-bridge:'||v_key,0));
  if new.status='ACTIVE' and exists(select 1 from finance_private.actor_scope_grants g where g.id<>new.id and g.app_user_id=new.app_user_id and g.legal_entity_id=new.legal_entity_id and g.dealer_account_id=new.dealer_account_id and g.finance_branch_id=new.finance_branch_id and g.status='ACTIVE' and pg_catalog.daterange(g.effective_from,g.effective_to,'[)')&&pg_catalog.daterange(new.effective_from,new.effective_to,'[)')) then raise exception using errcode='23P01',message='overlapping finance actor scope grant';end if;
 else raise exception using errcode='22023',message='unsupported finance identity bridge table';
 end if;
 return new;
end$$;
revoke all on function finance_private.guard_identity_bridge_validity_overlap() from public,anon,authenticated;
