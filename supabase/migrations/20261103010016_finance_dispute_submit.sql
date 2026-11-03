-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-dispute-submit-rpc.sql
-- Source SHA256: 2701EF0433354969A653C861DEEAC8027F504F1C68D57539B1249DA793144E19
-- Local replay required before any staging promotion.
-- OTOTR DISPUTE SUBMIT RPC CANDIDATE
create or replace function finance_private.resolve_dispute_submit_scope(p_actor_id uuid,p_dispute_id uuid,p_permission text) returns boolean language sql stable security definer set search_path='' as $$select false$$;
create or replace function finance_private.current_dispute_submit_committer_is_trusted() returns boolean language sql stable security definer set search_path='' as $$select false$$;
create or replace function finance_api.authorize_dispute_submit(p_dispute_id uuid,p_permission text) returns boolean language sql stable security definer set search_path='' as $$select auth.uid() is not null and p_permission='finance.disputes.submit' and finance_private.resolve_dispute_submit_scope(auth.uid(),p_dispute_id,p_permission)$$;
create or replace function finance_api.commit_dispute_submit(p_actor_id uuid,p_dispute_id uuid,p_expected_version bigint,p_reason_code text,p_note_hash text,p_idempotency_key text,p_intent_hash text,p_correlation_id uuid) returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_private as $$
declare d finance.disputes%rowtype;o finance.open_items%rowtype;a finance.accruals%rowtype;v_existing record;v_docs uuid[];v_doc_count integer;v_payload jsonb;v_previous_hash text;v_audit_hash text;
begin
 if not finance_private.current_dispute_submit_committer_is_trusted() then raise exception using errcode='42501',message='trusted dispute submit committer required';end if;
 if p_expected_version<1 or pg_catalog.length(pg_catalog.btrim(coalesce(p_reason_code,''))) not between 1 and 100 or (p_note_hash is not null and p_note_hash!~'^[a-fA-F0-9]{64}$') or pg_catalog.length(pg_catalog.btrim(coalesce(p_idempotency_key,''))) not between 8 and 200 or p_intent_hash!~'^[a-fA-F0-9]{64}$' then raise exception using errcode='22023',message='invalid dispute submit command';end if;
 select * into d from finance.disputes where id=p_dispute_id for update;if not found then raise exception using errcode='P0002',message='dispute not found';end if;
 select om.payload into v_existing from finance.outbox_messages om where om.legal_entity_id=d.legal_entity_id and om.topic='finance.dispute' and om.event_type='DISPUTE_SUBMITTED' and om.aggregate_id=d.id and om.payload->>'idempotencyKey'=p_idempotency_key order by om.created_at_utc desc,om.id desc limit 1;
 if found then if v_existing.payload->>'intentHash'=p_intent_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','disputeId',d.id,'status','SUBMITTED','version',p_expected_version+1);end if;return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
 if d.version<>p_expected_version or d.status<>'DRAFT' then return pg_catalog.jsonb_build_object('outcome','CONFLICT');end if;
 select * into o from finance.open_items where id=d.open_item_id and legal_entity_id=d.legal_entity_id;select * into a from finance.accruals where id=o.accrual_id and legal_entity_id=d.legal_entity_id and dealer_account_id=o.dealer_account_id and branch_id=o.branch_id;
 if o.id is null or a.id is null or d.disputed_amount<=0 or pg_catalog.btrim(coalesce(d.reason_code,''))='' then raise exception using errcode='23514',message='dispute reason amount and scope required';end if;
 select coalesce(pg_catalog.array_agg(x::uuid),array[]::uuid[]) into v_docs from pg_catalog.jsonb_array_elements_text(coalesce(d.evidence_refs->'documentIds','[]'::jsonb)) x;
 select pg_catalog.count(distinct dr.external_document_id) into v_doc_count from finance.document_references dr where dr.legal_entity_id=d.legal_entity_id and dr.status='ACTIVE' and dr.external_document_id=any(v_docs);
 if d.evidence_refs->>'statementHash' is null and pg_catalog.cardinality(v_docs)=0 then raise exception using errcode='23514',message='dispute evidence required';end if;
 if v_doc_count<>pg_catalog.cardinality(v_docs) then raise exception using errcode='23514',message='all dispute documents must remain active';end if;
 update finance.disputes set status='SUBMITTED',version=version+1,correlation_id=p_correlation_id where id=d.id;
 v_payload:=pg_catalog.jsonb_build_object('disputeId',d.id,'openItemId',o.id,'accrualId',a.id,'dealerAccountId',o.dealer_account_id,'branchId',o.branch_id,'status','SUBMITTED','version',d.version+1,'reasonCode',p_reason_code,'noteHash',p_note_hash,'evidenceDocumentCount',v_doc_count,'idempotencyKey',p_idempotency_key,'intentHash',p_intent_hash);
 insert into finance.outbox_messages(legal_entity_id,topic,event_type,aggregate_type,aggregate_id,aggregate_version,payload,payload_hash,status,correlation_id) values(d.legal_entity_id,'finance.dispute','DISPUTE_SUBMITTED','DISPUTE',d.id,d.version+1,v_payload,p_intent_hash,'PENDING',p_correlation_id);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('audit:'||d.legal_entity_id::text,0));select ae.integrity_hash into v_previous_hash from finance.audit_events ae where ae.legal_entity_id=d.legal_entity_id order by ae.created_at_utc desc,ae.id desc limit 1;v_audit_hash:=pg_catalog.encode(extensions.digest(pg_catalog.convert_to(coalesce(v_previous_hash,'GENESIS')||':'||d.id::text||':DISPUTE_SUBMITTED:'||p_intent_hash||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
 insert into finance.audit_events(legal_entity_id,actor_id,actor_type,action_code,subject_type,subject_id,decision,reason_code,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id) values(d.legal_entity_id,p_actor_id,'USER','DISPUTE_SUBMITTED','DISPUTE',d.id,'ALLOW',p_reason_code,null,p_intent_hash,v_previous_hash,v_audit_hash,pg_catalog.jsonb_build_object('noteHash',p_note_hash,'documentCount',v_doc_count,'branchId',o.branch_id),p_correlation_id);
 return pg_catalog.jsonb_build_object('outcome','SUBMITTED','disputeId',d.id,'status','SUBMITTED','version',d.version+1);
end$$;
revoke all on function finance_private.resolve_dispute_submit_scope(uuid,uuid,text) from public,anon,authenticated;
revoke all on function finance_private.current_dispute_submit_committer_is_trusted() from public,anon,authenticated;
revoke all on function finance_api.authorize_dispute_submit(uuid,text) from public,anon;grant execute on function finance_api.authorize_dispute_submit(uuid,text) to authenticated;
revoke all on function finance_api.commit_dispute_submit(uuid,uuid,bigint,text,text,text,text,uuid) from public,anon,authenticated;
