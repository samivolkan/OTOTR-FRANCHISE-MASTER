-- Unlock generated inspection tasks when the mobile technician starts technical entry.
-- Without this, the case moves to TECHNICAL_ENTRY_OPEN but task claim/evidence RLS can still see LOCKED tasks.

create or replace function app_private.transition_mobile_work_order_status(
  target_case_id uuid,
  next_status text,
  transition_reason text default null
)
returns public.expertise_cases
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  actor record;
  current_case public.expertise_cases;
  normalized_status text;
  updated_case public.expertise_cases;
begin
  select id, branch_id, role
    into actor
  from public.app_users
  where auth_user_id = auth.uid()
    and is_active = true
  limit 1;

  if actor.id is null then
    raise exception 'Aktif uygulama kullanicisi bulunamadi.';
  end if;

  if actor.role not in (
    'INSPECTION_TECHNICIAN',
    'TECHNICAL_SUPERVISOR',
    'BRANCH_MANAGER',
    'CEO',
    'GENERAL_MANAGER',
    'QUALITY_AUDITOR'
  ) then
    raise exception 'Bu rol mobil is emri durumu guncelleyemez.';
  end if;

  select *
    into current_case
  from public.expertise_cases
  where id = target_case_id
  for update;

  if current_case.id is null then
    raise exception 'Is emri bulunamadi.';
  end if;

  if not public.current_user_can_access_branch(current_case.branch_id) then
    raise exception 'Bu is emrine erisim yok.';
  end if;

  normalized_status := case upper(coalesce(next_status, ''))
    when 'IN_PROGRESS' then 'TECHNICAL_ENTRY_OPEN'
    when 'TECHNICAL_ENTRY_OPEN' then 'TECHNICAL_ENTRY_OPEN'
    when 'TECHNICAL_REVIEW' then 'SUBMITTED'
    when 'SUBMITTED' then 'SUBMITTED'
    when 'MANAGER_REVIEW' then 'MANAGER_REVIEW'
    when 'REPORT_GATE_READY' then 'REPORT_GATE_READY'
    else null
  end;

  if normalized_status is null then
    raise exception 'Gecersiz mobil is emri durumu: %', next_status;
  end if;

  if current_case.is_locked then
    raise exception 'Kilitli is emri mobil uygulamadan guncellenemez.';
  end if;

  if normalized_status = 'TECHNICAL_ENTRY_OPEN'
     and current_case.status not in ('DRAFT', 'ASSIGNED', 'CLAIMED', 'START_EVIDENCE_REQUIRED', 'TECHNICAL_ENTRY_OPEN') then
    raise exception 'Bu is emri test baslatma durumuna gecemez. Mevcut durum: %', current_case.status;
  end if;

  if normalized_status in ('SUBMITTED', 'MANAGER_REVIEW', 'REPORT_GATE_READY')
     and current_case.status not in ('TECHNICAL_ENTRY_OPEN', 'REPORT_GATE_BLOCKED', 'REPORT_GATE_READY', 'SUBMITTED', 'MANAGER_REVIEW') then
    raise exception 'Bu is emri teknik onay durumuna gecemez. Mevcut durum: %', current_case.status;
  end if;

  update public.expertise_cases
  set
    status = normalized_status,
    inspection_started_at = case
      when normalized_status = 'TECHNICAL_ENTRY_OPEN' and inspection_started_at is null then now()
      else inspection_started_at
    end,
    inspection_completed_at = case
      when normalized_status in ('SUBMITTED', 'MANAGER_REVIEW', 'REPORT_GATE_READY') and inspection_completed_at is null then now()
      else inspection_completed_at
    end,
    assigned_technician_id = case
      when normalized_status = 'TECHNICAL_ENTRY_OPEN'
        and actor.role = 'INSPECTION_TECHNICIAN'
        and assigned_technician_id is null
      then actor.id
      else assigned_technician_id
    end,
    updated_by = actor.id
  where id = current_case.id
  returning * into updated_case;

  if normalized_status = 'TECHNICAL_ENTRY_OPEN' then
    update public.inspection_tasks
    set
      status = 'AVAILABLE',
      updated_at = now()
    where expertise_case_id = current_case.id
      and status in ('LOCKED', 'ASSIGNED')
      and owner_user_id is null;
  end if;

  insert into public.report_audit_logs (
    expertise_case_id,
    actor_id,
    action,
    entity_name,
    entity_id,
    old_value,
    new_value
  )
  values (
    updated_case.id,
    actor.id,
    'MOBILE_STATUS_TRANSITION',
    'expertise_cases',
    updated_case.id,
    jsonb_build_object('status', current_case.status),
    jsonb_build_object(
      'status', updated_case.status,
      'requested_status', upper(coalesce(next_status, '')),
      'reason', nullif(trim(coalesce(transition_reason, '')), '')
    )
  );

  return updated_case;
end;
$$;
