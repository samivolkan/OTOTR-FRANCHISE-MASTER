-- Preserve the ERP manager read-only technical-data rule.
create or replace function kaporta_private.access_case(target uuid,operation text default 'read') returns boolean language plpgsql stable security definer set search_path='' as $$
declare a public.app_users; c public.expertise_cases; t public.inspection_tasks;
begin
 a:=kaporta_private.actor();select * into c from public.expertise_cases where id=target;
 if a.id is null or c.id is null then return false;end if;
 if operation='review' then return coalesce((a.role in ('CEO','GENERAL_MANAGER') or (a.branch_id=c.branch_id and a.role in ('BRANCH_MANAGER','TECHNICAL_SUPERVISOR'))),false);end if;
 if operation='write' then
  if a.role not in ('INSPECTION_TECHNICIAN','TECHNICAL_SUPERVISOR') or c.is_locked or c.status not in ('TECHNICAL_ENTRY_OPEN','REVISION_REQUESTED') or a.branch_id is distinct from c.branch_id then return false;end if;
  return exists(select 1 from public.inspection_tasks x where x.expertise_case_id=c.id and x.task_key='BODY_PAINT_CHECKUP' and x.owner_user_id=a.id and x.status='OPEN');
 end if;
 return coalesce(kaporta_private.access_case(target,'review') or (a.branch_id=c.branch_id and (a.role='QUALITY_AUDITOR' or c.assigned_technician_id=a.id or exists(select 1 from public.inspection_tasks x where x.expertise_case_id=c.id and x.task_key='BODY_PAINT_CHECKUP' and (x.owner_user_id=a.id or x.assigned_user_id=a.id)))),false);
end $$;
