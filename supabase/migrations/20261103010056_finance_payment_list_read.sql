-- OTOTR Finance internal review migration.
-- Branch-scoped, cursor-paginated payment list projection.
-- Local replay required before any staging promotion.

create or replace function finance_api.list_payments(
  p_legal_entity_id uuid,
  p_dealer_account_id uuid,
  p_branch_id uuid,
  p_from date,
  p_to date,
  p_status text,
  p_cursor text,
  p_limit integer
) returns jsonb
language plpgsql stable security definer
set search_path=pg_catalog,finance,finance_api
as $$
declare
  v_limit integer:=least(greatest(coalesce(p_limit,50),1),200);
  v_cursor_text text;
  v_cursor_date date;
  v_cursor_id uuid;
  v_items jsonb;
  v_has_more boolean:=false;
  v_next_cursor text;
begin
  if not finance_api.authorize_scope(p_legal_entity_id,p_dealer_account_id,p_branch_id,'listPayments') then
    raise exception using errcode='42501',message='finance scope denied';
  end if;
  if p_from is not null and p_to is not null and p_from>p_to then
    raise exception using errcode='22023',message='invalid payment date range';
  end if;
  if p_status is not null and p_status not in ('PENDING_VERIFICATION','VERIFIED','PARTIALLY_ALLOCATED','ALLOCATED','REVERSED','REJECTED') then
    raise exception using errcode='22023',message='invalid payment status';
  end if;
  if p_cursor is not null then
    begin
      v_cursor_text:=pg_catalog.convert_from(pg_catalog.decode(p_cursor,'base64'),'UTF8');
      if v_cursor_text !~ '^\d{4}-\d{2}-\d{2}\|[0-9a-fA-F-]{36}$' then
        raise exception using errcode='22023',message='invalid payment cursor';
      end if;
      v_cursor_date:=pg_catalog.split_part(v_cursor_text,'|',1)::date;
      v_cursor_id:=pg_catalog.split_part(v_cursor_text,'|',2)::uuid;
    exception when others then
      raise exception using errcode='22023',message='invalid payment cursor';
    end;
  end if;

  with scoped as (
    select p.id,p.payment_date,p.value_date,p.status,p.payment_method_code,p.external_reference,
           p.currency_code,p.received_amount,p.verified_amount,p.allocated_amount,
           (p.verified_amount-p.allocated_amount) unallocated_amount,
           p.verified_at_utc,p.version,p.created_at_utc,
           (select pg_catalog.count(*) from finance.payment_allocations pa where pa.payment_id=p.id and pa.status='ACTIVE') allocation_count
      from finance.payments p
      join finance.dealer_accounts da on da.id=p.dealer_account_id and da.legal_entity_id=p.legal_entity_id
     where p.legal_entity_id=p_legal_entity_id
       and p.dealer_account_id=p_dealer_account_id
       and p.branch_id=p_branch_id
       and (p_from is null or p.payment_date>=p_from)
       and (p_to is null or p.payment_date<=p_to)
       and (p_status is null or p.status=p_status)
       and (v_cursor_date is null or (p.payment_date,p.id)<(v_cursor_date,v_cursor_id))
  ), page as (
    select * from scoped order by payment_date desc,id desc limit v_limit+1
  ), visible as (
    select * from page order by payment_date desc,id desc limit v_limit
  ), projected as (
    select id,payment_date,
           pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
             'paymentId',id,'paymentDate',payment_date,'valueDate',value_date,'status',status,
             'paymentMethodCode',payment_method_code,'externalReference',external_reference,
             'amount',pg_catalog.jsonb_build_object('amount',received_amount::text,'currency',currency_code),
             'verifiedAmount',pg_catalog.jsonb_build_object('amount',verified_amount::text,'currency',currency_code),
             'allocatedAmount',pg_catalog.jsonb_build_object('amount',allocated_amount::text,'currency',currency_code),
             'unallocatedAmount',pg_catalog.jsonb_build_object('amount',unallocated_amount::text,'currency',currency_code),
             'allocationCount',allocation_count,'verifiedAtUtc',verified_at_utc,'version',version,'createdAtUtc',created_at_utc
           )) item
      from visible
  )
  select coalesce(pg_catalog.jsonb_agg(item order by payment_date desc,id desc),'[]'::jsonb),
         (select pg_catalog.count(*)>v_limit from page),
         case when (select pg_catalog.count(*)>v_limit from page)
              then (select pg_catalog.encode(pg_catalog.convert_to(payment_date::text||'|'||id::text,'UTF8'),'base64') from visible order by payment_date,id limit 1)
              else null end
    into v_items,v_has_more,v_next_cursor from projected;

  return pg_catalog.jsonb_build_object('items',v_items,'nextCursor',v_next_cursor,'hasMore',v_has_more);
end$$;

revoke all on function finance_api.list_payments(uuid,uuid,uuid,date,date,text,text,integer) from public,anon;
grant execute on function finance_api.list_payments(uuid,uuid,uuid,date,date,text,text,integer) to authenticated;
