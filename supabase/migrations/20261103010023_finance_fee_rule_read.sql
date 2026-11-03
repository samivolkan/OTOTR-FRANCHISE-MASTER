-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-fee-rule-read-rpc.sql
-- Source SHA256: D98075D79D7296074471113ECC048ED8028EDC000174D05BBA86817029ACCCCA
-- Local replay required before any staging promotion.
-- OTOTR CONTRACT FEE RULE READ RPC CANDIDATE
create or replace function finance_api.get_contract_fee_rule(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_contract_version_id uuid,p_fee_rule_id uuid) returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare r record;v_branch_ids jsonb;v_exceptions jsonb;v_evidence uuid;v_evidence_count integer;v_evidence_purpose text;
begin
 if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getContractFeeRule') then raise exception using errcode='42501',message='finance scope denied';end if;
 select cfr.*,fd.version_no fee_definition_version,fd.code fee_definition_code,fd.name fee_definition_name,fd.fee_family,
        cv.effective_from,cv.effective_to,fc.legal_entity_id,fc.dealer_legal_entity_id
 into r from finance.contract_fee_rules cfr
 join finance.fee_definitions fd on fd.id=cfr.fee_definition_id
 join finance.contract_versions cv on cv.id=cfr.contract_version_id
 join finance.franchise_contracts fc on fc.id=cv.contract_id
 join finance.dealer_accounts da on da.legal_entity_id=fc.legal_entity_id and da.dealer_legal_entity_id=fc.dealer_legal_entity_id
 join finance.branches b on b.legal_entity_id=fc.legal_entity_id and b.dealer_legal_entity_id=fc.dealer_legal_entity_id
 where cfr.id=p_fee_rule_id and cfr.contract_version_id=p_contract_version_id and fc.legal_entity_id=p_legal_entity_id and da.id=p_dealer_account_id and b.id=p_branch_id;
 if not found then return null;end if;
 select coalesce(pg_catalog.jsonb_agg(b.id order by b.branch_code,b.id),'[]'::jsonb) into v_branch_ids from finance.branches b where b.legal_entity_id=r.legal_entity_id and b.dealer_legal_entity_id=r.dealer_legal_entity_id and b.status='ACTIVE';
 select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('exceptionId',e.id,'code',e.exception_code,'scope',e.scope_definition,'conditions',e.condition_definition,'override',e.override_definition,'priority',e.priority,'validFrom',e.effective_from,'validTo',e.effective_to,'status',e.status,'version',e.version) order by e.priority desc,e.exception_code,e.id),'[]'::jsonb) into v_exceptions from finance.rule_exceptions e where e.contract_fee_rule_id=r.id;
 select dl.purpose_code,dr.id into v_evidence_purpose,v_evidence from finance.document_links dl join finance.document_references dr on dr.id=dl.document_reference_id and dr.status='ACTIVE' where dl.legal_entity_id=r.legal_entity_id and dl.subject_type='CONTRACT_FEE_RULE' and dl.subject_id=r.id and dl.purpose_code~'^EVIDENCE_V[1-9][0-9]*$' order by pg_catalog.substr(dl.purpose_code,11)::integer desc,dl.created_at_utc desc,dl.id desc limit 1;
 if v_evidence_purpose is not null then select pg_catalog.count(*) into v_evidence_count from finance.document_links dl where dl.legal_entity_id=r.legal_entity_id and dl.subject_type='CONTRACT_FEE_RULE' and dl.subject_id=r.id and dl.purpose_code=v_evidence_purpose;if v_evidence_count>1 then raise exception using errcode='23514',message='fee rule evidence projection is ambiguous';end if;end if;
 return pg_catalog.jsonb_build_object(
  'feeRuleId',r.id,'feeDefinitionId',r.fee_definition_id,'feeDefinitionVersion',r.fee_definition_version,'version',r.version,
  'code',r.rule_code,'name',r.fee_definition_name,'category',r.fee_family,'status',r.status,'configurationStatus',r.configuration_status,
  'scope',pg_catalog.jsonb_build_object('headquartersLegalEntityId',r.legal_entity_id,'dealerLegalEntityId',r.dealer_legal_entity_id,'branchIds',v_branch_ids,'packageIds','[]'::jsonb,'serviceIds','[]'::jsonb),
  'validity',pg_catalog.jsonb_build_object('validFrom',r.effective_from,'validTo',r.effective_to,'contractVersionId',r.contract_version_id),
  'trigger',case when r.trigger_event_type is null then null else pg_catalog.jsonb_build_object('eventType',r.trigger_event_type,'conditions',r.trigger_conditions) end,
  'basis',r.basis_definition,
  'calculation',case when r.calculation_method is null then null else coalesce(r.calculation_parameters,'{}'::jsonb)||pg_catalog.jsonb_build_object('method',r.calculation_method,'currency',r.currency_code,'decimalScale',r.decimal_scale,'roundingMode',r.rounding_mode,'minimumAmount',r.minimum_amount,'maximumAmount',r.maximum_amount) end,
  'tax',case when r.tax_code_version_id is null then null else pg_catalog.jsonb_build_object('taxCodeVersionId',r.tax_code_version_id,'priceIncludesTax',r.price_includes_tax) end,
  'due',r.due_rule,'cancellationPolicy',r.cancellation_policy,'exceptions',v_exceptions,
  'createdBy',pg_catalog.jsonb_build_object('actorType','USER','actorId',r.created_by),'createdAtUtc',r.created_at_utc,
  'approvedBy',case when r.approved_by is null then null else pg_catalog.jsonb_build_object('actorType','USER','actorId',r.approved_by) end,'approvedAtUtc',r.approved_at_utc,'evidenceDocumentId',v_evidence
 );
end$$;
revoke all on function finance_api.get_contract_fee_rule(uuid,uuid,uuid,uuid,uuid) from public,anon;
