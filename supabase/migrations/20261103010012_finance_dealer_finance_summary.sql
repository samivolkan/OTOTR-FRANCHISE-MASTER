-- OTOTR Finance migration promoted from a reviewed candidate.
-- Source: candidate-dealer-finance-summary-rpc.sql
-- Source SHA256: C81C07205A5E6339D893097C26BAF727464D299608D69E6DC6951F05702D44B6
-- Local replay required before any staging promotion.
-- OTOTR DEALER FINANCE SUMMARY SNAPSHOT RPC CANDIDATE

create or replace function finance_private.current_summary_projection_worker_is_trusted()
returns boolean language sql stable security definer set search_path=''
as $$ select false $$;

revoke all on function finance_private.current_summary_projection_worker_is_trusted() from public,anon,authenticated;

create or replace function finance_api.commit_dealer_finance_summary_snapshot(
  p_actor_id uuid,p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,
  p_as_of date,p_currency_code text,p_read_model_version text,p_totals jsonb,
  p_source_watermark jsonb,p_snapshot_hash text,p_correlation_id uuid
) returns jsonb language plpgsql security definer set search_path=pg_catalog,finance,finance_api,finance_private as $$
declare
  v_id uuid; v_existing_hash text; v_key text; v_part jsonb;
  v_an numeric(24,8);v_at numeric(24,8);v_ag numeric(24,8);
  v_in numeric(24,8);v_it numeric(24,8);v_ig numeric(24,8);
  v_cn numeric(24,8);v_ct numeric(24,8);v_cg numeric(24,8);
  v_on numeric(24,8);v_ot numeric(24,8);v_og numeric(24,8);
  v_vn numeric(24,8);v_vt numeric(24,8);v_vg numeric(24,8);
  v_dn numeric(24,8);v_dt numeric(24,8);v_dg numeric(24,8);
  v_rn numeric(24,8);v_rt numeric(24,8);v_rg numeric(24,8);
  v_sn numeric(24,8);v_st numeric(24,8);v_sg numeric(24,8);v_u numeric(24,8);
begin
  if not finance_private.current_summary_projection_worker_is_trusted() then raise exception using errcode='42501',message='trusted summary projection worker required'; end if;
  if p_actor_id is null or p_as_of is null or p_currency_code !~ '^[A-Z]{3}$' or pg_catalog.btrim(coalesce(p_read_model_version,''))='' or p_snapshot_hash !~ '^[a-fA-F0-9]{64}$' or pg_catalog.jsonb_typeof(p_source_watermark)<>'object' then raise exception using errcode='22023',message='invalid summary snapshot metadata'; end if;
  if not exists(select 1 from finance.dealer_accounts da join finance.branches b on b.dealer_legal_entity_id=da.dealer_legal_entity_id where da.id=p_dealer_account_id and da.legal_entity_id=p_legal_entity_id and da.currency_code=p_currency_code and da.status in('SHADOW','ACTIVE') and b.id=p_branch_id and b.legal_entity_id=p_legal_entity_id and b.status='ACTIVE') then raise exception using errcode='23514',message='invalid dealer summary scope'; end if;
  if p_totals is null or pg_catalog.jsonb_typeof(p_totals)<>'object' or not(p_totals ?& array['accrued','invoiced','collected','open','overdue','deducted','refunded','disputed','unallocated']) then raise exception using errcode='22023',message='incomplete summary totals'; end if;
  foreach v_key in array array['accrued','invoiced','collected','open','overdue','deducted','refunded','disputed'] loop
    v_part:=p_totals->v_key;
    if pg_catalog.jsonb_typeof(v_part)<>'object' or not(v_part ?& array['netAmount','taxAmount','grossAmount']) or (v_part->>'netAmount')::numeric<0 or (v_part->>'taxAmount')::numeric<0 or (v_part->>'grossAmount')::numeric<0 or (v_part->>'grossAmount')::numeric<>(v_part->>'netAmount')::numeric+(v_part->>'taxAmount')::numeric then raise exception using errcode='23514',message='invalid summary monetary breakdown'; end if;
  end loop;
  if pg_catalog.jsonb_typeof(p_totals->'unallocated')<>'object' or not((p_totals->'unallocated')?'amount') or (p_totals->'unallocated'->>'amount')::numeric<0 then raise exception using errcode='23514',message='invalid unallocated cash total'; end if;
  v_an:=(p_totals->'accrued'->>'netAmount')::numeric;v_at:=(p_totals->'accrued'->>'taxAmount')::numeric;v_ag:=(p_totals->'accrued'->>'grossAmount')::numeric;
  v_in:=(p_totals->'invoiced'->>'netAmount')::numeric;v_it:=(p_totals->'invoiced'->>'taxAmount')::numeric;v_ig:=(p_totals->'invoiced'->>'grossAmount')::numeric;
  v_cn:=(p_totals->'collected'->>'netAmount')::numeric;v_ct:=(p_totals->'collected'->>'taxAmount')::numeric;v_cg:=(p_totals->'collected'->>'grossAmount')::numeric;
  v_on:=(p_totals->'open'->>'netAmount')::numeric;v_ot:=(p_totals->'open'->>'taxAmount')::numeric;v_og:=(p_totals->'open'->>'grossAmount')::numeric;
  v_vn:=(p_totals->'overdue'->>'netAmount')::numeric;v_vt:=(p_totals->'overdue'->>'taxAmount')::numeric;v_vg:=(p_totals->'overdue'->>'grossAmount')::numeric;
  v_dn:=(p_totals->'deducted'->>'netAmount')::numeric;v_dt:=(p_totals->'deducted'->>'taxAmount')::numeric;v_dg:=(p_totals->'deducted'->>'grossAmount')::numeric;
  v_rn:=(p_totals->'refunded'->>'netAmount')::numeric;v_rt:=(p_totals->'refunded'->>'taxAmount')::numeric;v_rg:=(p_totals->'refunded'->>'grossAmount')::numeric;
  v_sn:=(p_totals->'disputed'->>'netAmount')::numeric;v_st:=(p_totals->'disputed'->>'taxAmount')::numeric;v_sg:=(p_totals->'disputed'->>'grossAmount')::numeric;v_u:=(p_totals->'unallocated'->>'amount')::numeric;
  select id,snapshot_hash into v_id,v_existing_hash from finance.dealer_finance_summary_snapshots where legal_entity_id=p_legal_entity_id and dealer_account_id=p_dealer_account_id and branch_id=p_branch_id and as_of_date=p_as_of and currency_code=p_currency_code and read_model_version=p_read_model_version;
  if found then
    if v_existing_hash=p_snapshot_hash then return pg_catalog.jsonb_build_object('outcome','REPLAY','snapshotId',v_id); end if;
    raise exception using errcode='40001',message='summary snapshot conflict';
  end if;
  insert into finance.dealer_finance_summary_snapshots(legal_entity_id,dealer_account_id,branch_id,as_of_date,currency_code,accrued_net,accrued_tax,accrued_gross,invoiced_net,invoiced_tax,invoiced_gross,collected_net,collected_tax,collected_gross,open_net,open_tax,open_gross,overdue_net,overdue_tax,overdue_gross,deducted_net,deducted_tax,deducted_gross,refunded_net,refunded_tax,refunded_gross,disputed_net,disputed_tax,disputed_gross,unallocated_cash_amount,read_model_version,source_watermark,snapshot_hash,created_by,correlation_id)
  values(p_legal_entity_id,p_dealer_account_id,p_branch_id,p_as_of,p_currency_code,v_an,v_at,v_ag,v_in,v_it,v_ig,v_cn,v_ct,v_cg,v_on,v_ot,v_og,v_vn,v_vt,v_vg,v_dn,v_dt,v_dg,v_rn,v_rt,v_rg,v_sn,v_st,v_sg,v_u,p_read_model_version,p_source_watermark,p_snapshot_hash,p_actor_id,p_correlation_id) returning id into v_id;
  return pg_catalog.jsonb_build_object('outcome','CREATED','snapshotId',v_id);
end $$;

create or replace function finance_api.get_dealer_finance_summary(p_legal_entity_id uuid,p_dealer_account_id uuid,p_branch_id uuid,p_as_of date)
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,finance,finance_api as $$
declare v finance.dealer_finance_summary_snapshots%rowtype;begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'getDealerFinanceSummary') then raise exception using errcode='42501',message='finance scope denied'; end if;
  select * into v from finance.dealer_finance_summary_snapshots where legal_entity_id=p_legal_entity_id and dealer_account_id=p_dealer_account_id and branch_id=p_branch_id and as_of_date=coalesce(p_as_of,current_date) order by calculated_at_utc desc,id desc limit 1;
  if not found then return null; end if;
  return pg_catalog.jsonb_build_object('legalEntityId',v.legal_entity_id,'dealerAccountId',v.dealer_account_id,'branchId',v.branch_id,'asOf',v.as_of_date,'currencyCode',v.currency_code,
    'accrued',pg_catalog.jsonb_build_object('netAmount',v.accrued_net::text,'taxAmount',v.accrued_tax::text,'grossAmount',v.accrued_gross::text,'currency',v.currency_code),
    'invoiced',pg_catalog.jsonb_build_object('netAmount',v.invoiced_net::text,'taxAmount',v.invoiced_tax::text,'grossAmount',v.invoiced_gross::text,'currency',v.currency_code),
    'collected',pg_catalog.jsonb_build_object('netAmount',v.collected_net::text,'taxAmount',v.collected_tax::text,'grossAmount',v.collected_gross::text,'currency',v.currency_code),
    'open',pg_catalog.jsonb_build_object('netAmount',v.open_net::text,'taxAmount',v.open_tax::text,'grossAmount',v.open_gross::text,'currency',v.currency_code),
    'overdue',pg_catalog.jsonb_build_object('netAmount',v.overdue_net::text,'taxAmount',v.overdue_tax::text,'grossAmount',v.overdue_gross::text,'currency',v.currency_code),
    'unallocated',pg_catalog.jsonb_build_object('amount',v.unallocated_cash_amount::text,'currency',v.currency_code),
    'deducted',pg_catalog.jsonb_build_object('netAmount',v.deducted_net::text,'taxAmount',v.deducted_tax::text,'grossAmount',v.deducted_gross::text,'currency',v.currency_code),
    'refunded',pg_catalog.jsonb_build_object('netAmount',v.refunded_net::text,'taxAmount',v.refunded_tax::text,'grossAmount',v.refunded_gross::text,'currency',v.currency_code),
    'disputed',pg_catalog.jsonb_build_object('netAmount',v.disputed_net::text,'taxAmount',v.disputed_tax::text,'grossAmount',v.disputed_gross::text,'currency',v.currency_code),
    'calculatedAtUtc',v.calculated_at_utc,'readModelVersion',v.read_model_version);
end $$;

revoke all on function finance_api.commit_dealer_finance_summary_snapshot(uuid,uuid,uuid,uuid,date,text,text,jsonb,jsonb,text,uuid) from public,anon,authenticated;
revoke all on function finance_api.get_dealer_finance_summary(uuid,uuid,uuid,date) from public,anon;
