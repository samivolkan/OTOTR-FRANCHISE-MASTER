-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-outbox-publisher-rpc.sql
-- Source SHA256: 175F6E6E11CBEA8E98DCB2B5A01FBF1B4A0697BE651ABDDA71C688FB79D5DD1A
-- Local replay required before any staging promotion.
-- TX-13 candidate: server-only outbox lease, acknowledgement and bounded failure handling.
-- No grants are issued here. Deployment must keep every function below unavailable to browser roles.
create or replace function finance_private.current_outbox_worker_is_trusted()
returns boolean language sql stable security definer set search_path=pg_catalog as $$ select false $$;

create or replace function finance_api.claim_outbox_messages(p_worker_id text,p_lease_id uuid,p_batch_size integer,p_lease_seconds integer,p_now_utc timestamptz)
returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private as $$
declare v_rows jsonb;
begin
 if not finance_private.current_outbox_worker_is_trusted() then raise exception using errcode='42501',message='trusted outbox worker required'; end if;
 if pg_catalog.btrim(coalesce(p_worker_id,''))='' or p_lease_id is null then raise exception using errcode='22023',message='worker and lease required'; end if;
 if p_batch_size not between 1 and 100 or p_lease_seconds not between 15 and 900 then raise exception using errcode='22023',message='invalid lease limits'; end if;
 with candidates as (select id from finance.outbox_messages where status in ('PENDING','RETRYING') and available_at_utc<=p_now_utc and (lease_until_utc is null or lease_until_utc<=p_now_utc) order by available_at_utc,id for update skip locked limit p_batch_size),
 claimed as (update finance.outbox_messages m set status='IN_FLIGHT',lease_owner=p_worker_id,lease_id=p_lease_id,lease_until_utc=p_now_utc+pg_catalog.make_interval(secs=>p_lease_seconds),attempt_count=m.attempt_count+1 from candidates c where m.id=c.id returning m.id,m.legal_entity_id,m.topic,m.event_type,m.aggregate_type,m.aggregate_id,m.aggregate_version,m.payload,m.payload_hash,m.attempt_count,m.correlation_id)
 select coalesce(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(claimed) order by id),'[]'::jsonb) into v_rows from claimed;
 return v_rows;
end $$;

create or replace function finance_api.acknowledge_outbox_message(p_worker_id text,p_lease_id uuid,p_message_id uuid,p_external_ack_id text,p_published_at_utc timestamptz)
returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private as $$
declare v finance.outbox_messages%rowtype;
begin
 if not finance_private.current_outbox_worker_is_trusted() then raise exception using errcode='42501',message='trusted outbox worker required'; end if;
 update finance.outbox_messages set status='PUBLISHED',published_at_utc=p_published_at_utc,external_ack_id=nullif(pg_catalog.btrim(p_external_ack_id),''),lease_owner=null,lease_id=null,lease_until_utc=null,last_error_code=null where id=p_message_id and status='IN_FLIGHT' and lease_owner=p_worker_id and lease_id=p_lease_id and lease_until_utc>=p_published_at_utc returning * into v;
 if not found then raise exception using errcode='40001',message='outbox lease lost'; end if;
 return pg_catalog.jsonb_build_object('messageId',v.id,'outcome','PUBLISHED','attemptCount',v.attempt_count);
end $$;

create or replace function finance_api.fail_outbox_message(p_worker_id text,p_lease_id uuid,p_message_id uuid,p_error_code text,p_retryable boolean,p_max_attempts integer,p_next_attempt_at_utc timestamptz,p_now_utc timestamptz)
returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private as $$
declare v finance.outbox_messages%rowtype;v_status text;
begin
 if not finance_private.current_outbox_worker_is_trusted() then raise exception using errcode='42501',message='trusted outbox worker required'; end if;
 if p_max_attempts not between 1 and 100 or pg_catalog.btrim(coalesce(p_error_code,''))='' then raise exception using errcode='22023',message='invalid failure command'; end if;
 select * into v from finance.outbox_messages where id=p_message_id for update;
 if not found or v.status<>'IN_FLIGHT' or v.lease_owner<>p_worker_id or v.lease_id<>p_lease_id or v.lease_until_utc<p_now_utc then raise exception using errcode='40001',message='outbox lease lost'; end if;
 v_status:=case when p_retryable and v.attempt_count<p_max_attempts then 'RETRYING' else 'DEAD_LETTER' end;
 if v_status='RETRYING' and (p_next_attempt_at_utc is null or p_next_attempt_at_utc<=p_now_utc) then raise exception using errcode='22023',message='future retry time required'; end if;
 update finance.outbox_messages set status=v_status,available_at_utc=case when v_status='RETRYING' then p_next_attempt_at_utc else available_at_utc end,lease_owner=null,lease_id=null,lease_until_utc=null,last_error_code=p_error_code where id=p_message_id;
 insert into finance.integration_errors(legal_entity_id,source_type,source_id,error_fingerprint,occurrence_no,error_code,redacted_detail,status,created_by,correlation_id) values(v.legal_entity_id,'OUTBOX',v.id,pg_catalog.md5(v.topic||':'||p_error_code),v.attempt_count,p_error_code,pg_catalog.jsonb_build_object('topic',v.topic,'attemptCount',v.attempt_count),case when v_status='RETRYING' then 'RETRY_SCHEDULED' else 'OPEN' end,null,v.correlation_id) on conflict(source_type,source_id,error_fingerprint,occurrence_no) do nothing;
 return pg_catalog.jsonb_build_object('messageId',v.id,'outcome',v_status,'attemptCount',v.attempt_count);
end $$;

revoke all on function finance_api.claim_outbox_messages(text,uuid,integer,integer,timestamptz) from public;
revoke all on function finance_api.acknowledge_outbox_message(text,uuid,uuid,text,timestamptz) from public;
revoke all on function finance_api.fail_outbox_message(text,uuid,uuid,text,boolean,integer,timestamptz,timestamptz) from public;
