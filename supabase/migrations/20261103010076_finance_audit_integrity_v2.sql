-- Canonical SHA-256 audit chain enforcement. Caller supplied hashes are never trusted.
create or replace function finance_private.audit_v2_hash(p_previous text,p_id uuid,p_legal_entity_id uuid,p_actor_id uuid,p_actor_type text,p_action_code text,p_subject_type text,p_subject_id uuid,p_decision text,p_reason_code text,p_before_hash text,p_after_hash text,p_safe_context jsonb,p_created_at_utc timestamptz,p_correlation_id uuid)
returns text language sql immutable set search_path=pg_catalog,extensions as $$
 select pg_catalog.encode(extensions.digest(pg_catalog.convert_to(pg_catalog.concat_ws('|','AUDIT_SHA256_V2',coalesce(p_previous,'GENESIS'),p_id::text,coalesce(p_legal_entity_id::text,''),coalesce(p_actor_id::text,''),p_actor_type,p_action_code,p_subject_type,p_subject_id::text,coalesce(p_decision,''),coalesce(p_reason_code,''),coalesce(p_before_hash,''),coalesce(p_after_hash,''),coalesce(p_safe_context,'{}'::jsonb)::text,p_created_at_utc::text,p_correlation_id::text),'UTF8'),'sha256'),'hex')
$$;

create or replace function finance_private.enforce_audit_integrity_v2() returns trigger language plpgsql security definer set search_path=pg_catalog,finance,finance_private as $$
declare v_previous text;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||coalesce(new.legal_entity_id::text,'GLOBAL'),0));
 select a.integrity_hash into v_previous from finance.audit_events a where a.legal_entity_id is not distinct from new.legal_entity_id order by a.created_at_utc desc,a.id desc limit 1;
 new.safe_context:=coalesce(new.safe_context,'{}'::jsonb)||pg_catalog.jsonb_build_object('integrityVersion','AUDIT_SHA256_V2');
 new.previous_integrity_hash:=v_previous;
 new.integrity_hash:=finance_private.audit_v2_hash(v_previous,new.id,new.legal_entity_id,new.actor_id,new.actor_type,new.action_code,new.subject_type,new.subject_id,new.decision,new.reason_code,new.before_hash,new.after_hash,new.safe_context,new.created_at_utc,new.correlation_id);
 return new;
end$$;

drop trigger if exists audit_events_integrity_v2 on finance.audit_events;
create trigger audit_events_integrity_v2 before insert on finance.audit_events for each row execute function finance_private.enforce_audit_integrity_v2();

create or replace function finance_private.verify_audit_integrity_v2(p_legal_entity_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private as $$
declare r record;v_previous text;v_expected text;v_checked integer:=0;v_invalid integer:=0;v_legacy integer:=0;
begin
 for r in select * from finance.audit_events a where a.legal_entity_id=p_legal_entity_id order by a.created_at_utc,a.id loop
  if r.safe_context->>'integrityVersion'<>'AUDIT_SHA256_V2' then v_legacy:=v_legacy+1;v_previous:=r.integrity_hash;continue;end if;
  v_expected:=finance_private.audit_v2_hash(v_previous,r.id,r.legal_entity_id,r.actor_id,r.actor_type,r.action_code,r.subject_type,r.subject_id,r.decision,r.reason_code,r.before_hash,r.after_hash,r.safe_context,r.created_at_utc,r.correlation_id);
  v_checked:=v_checked+1;if r.previous_integrity_hash is distinct from v_previous or r.integrity_hash<>v_expected then v_invalid:=v_invalid+1;end if;v_previous:=r.integrity_hash;
 end loop;
 return pg_catalog.jsonb_build_object('version','AUDIT_SHA256_V2','checkedEventCount',v_checked,'invalidEventCount',v_invalid,'legacyEventCount',v_legacy,'valid',v_invalid=0);
end$$;

create or replace function finance_api.get_audit_correlation_trace(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_correlation_id uuid)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_private,finance_api as $$
declare v_items jsonb;v_count integer;v_verification jsonb;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getAuditCorrelationTrace') then raise exception using errcode='42501',message='finance scope denied';end if;
 select coalesce(jsonb_agg(jsonb_build_object('eventId',id,'actorId',actor_id,'actorType',actor_type,'actionCode',action_code,'subjectType',subject_type,'subjectId',subject_id,'decision',decision,'reasonCode',reason_code,'createdAtUtc',created_at_utc,'integrityHash',integrity_hash,'previousIntegrityHash',previous_integrity_hash)order by created_at_utc,id),'[]'::jsonb),count(*) into v_items,v_count from finance.audit_events a where a.legal_entity_id=p_legal_entity_id and a.correlation_id=p_correlation_id and finance_private.audit_event_is_in_scope(a.id,p_legal_entity_id,p_dealer_account_id,p_branch_id);
 v_verification:=finance_private.verify_audit_integrity_v2(p_legal_entity_id);
 return jsonb_build_object('correlationId',p_correlation_id,'items',v_items,'eventCount',v_count,'chainProjection','SHA256_V2_VERIFIED','chainVerification',v_verification,'rawContextExposed',false);
end$$;

revoke all on function finance_private.audit_v2_hash(text,uuid,uuid,uuid,text,text,text,uuid,text,text,text,text,jsonb,timestamptz,uuid) from public,anon,authenticated;
revoke all on function finance_private.enforce_audit_integrity_v2() from public,anon,authenticated;
revoke all on function finance_private.verify_audit_integrity_v2(uuid) from public,anon,authenticated;
