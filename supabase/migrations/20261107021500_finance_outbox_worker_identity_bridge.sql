-- Service-role-only finance outbox worker identity and topic-scoped leasing.
create or replace function finance_private.current_outbox_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$
  select coalesce(pg_catalog.current_setting('request.jwt.claim.role',true),'')='service_role'
$$;
revoke all on function finance_private.current_outbox_worker_is_trusted() from public,anon,authenticated;

create or replace function finance_api.claim_outbox_messages_v2(
  p_worker_id text,p_lease_id uuid,p_batch_size integer,p_lease_seconds integer,
  p_now_utc timestamptz,p_allowed_topics text[]
) returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private as $$
declare v_rows jsonb;
begin
  if not finance_private.current_outbox_worker_is_trusted() then raise exception using errcode='42501',message='trusted outbox worker required'; end if;
  if pg_catalog.btrim(coalesce(p_worker_id,''))='' or p_lease_id is null then raise exception using errcode='22023',message='worker and lease required'; end if;
  if p_batch_size not between 1 and 100 or p_lease_seconds not between 15 and 900 then raise exception using errcode='22023',message='invalid lease limits'; end if;
  if p_allowed_topics is null or pg_catalog.cardinality(p_allowed_topics)<1 or exists(select 1 from pg_catalog.unnest(p_allowed_topics) t where pg_catalog.btrim(coalesce(t,''))='') then
    raise exception using errcode='22023',message='allowed topics required';
  end if;
  with candidates as (
    select id from finance.outbox_messages
    where status in('PENDING','RETRYING') and topic=any(p_allowed_topics)
      and available_at_utc<=p_now_utc and(lease_until_utc is null or lease_until_utc<=p_now_utc)
    order by available_at_utc,id for update skip locked limit p_batch_size
  ),claimed as (
    update finance.outbox_messages m
       set status='IN_FLIGHT',lease_owner=p_worker_id,lease_id=p_lease_id,
           lease_until_utc=p_now_utc+pg_catalog.make_interval(secs=>p_lease_seconds),attempt_count=m.attempt_count+1
      from candidates c where m.id=c.id
    returning m.id,m.legal_entity_id,m.topic,m.event_type,m.aggregate_type,m.aggregate_id,
              m.aggregate_version,m.payload,m.payload_hash,m.attempt_count,m.correlation_id
  )
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(claimed) order by id),'[]'::jsonb) into v_rows from claimed;
  return v_rows;
end$$;

revoke all on function finance_api.claim_outbox_messages_v2(text,uuid,integer,integer,timestamptz,text[]) from public,anon,authenticated;
revoke execute on function finance_api.claim_outbox_messages(text,uuid,integer,integer,timestamptz) from service_role;
grant execute on function finance_api.claim_outbox_messages_v2(text,uuid,integer,integer,timestamptz,text[]) to service_role;
grant execute on function finance_api.acknowledge_outbox_message(text,uuid,uuid,text,timestamptz) to service_role;
grant execute on function finance_api.fail_outbox_message(text,uuid,uuid,text,boolean,integer,timestamptz,timestamptz) to service_role;
