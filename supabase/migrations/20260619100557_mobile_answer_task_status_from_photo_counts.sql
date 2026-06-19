-- Mobile answers should close a task when the required evidence count is met.
-- Risky findings are still recorded as RISKY/severity=2, but they must not
-- block final reporting when their required evidence is present.
create or replace function public.save_mobile_inspection_item_value(
  target_case_id uuid,
  target_module_key text,
  target_item_key text,
  target_item_title text,
  target_selected_option_label text default '',
  target_input_values jsonb default '{}'::jsonb,
  target_description_text text default '',
  target_ready_photo_count int default 0,
  target_required_photo_count int default 0
)
returns public.inspection_item_values
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  actor record;
  current_case public.expertise_cases;
  task public.inspection_tasks;
  normalized_module_key text;
  wanted_task_keys text[];
  result_status text;
  next_value public.inspection_item_values;
  safe_item_key text;
  ready_photo_count integer;
  required_photo_count integer;
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
    raise exception 'Bu rol mobil test maddesi kaydedemez.';
  end if;

  select *
    into current_case
  from public.expertise_cases
  where id = target_case_id;

  if current_case.id is null then
    raise exception 'Is emri bulunamadi.';
  end if;

  if current_case.is_locked then
    raise exception 'Kilitli is emrine test maddesi kaydedilemez.';
  end if;

  if not public.current_user_can_access_branch(current_case.branch_id) then
    raise exception 'Bu is emrine erisim yok.';
  end if;

  normalized_module_key := lower(coalesce(target_module_key, 'kaporta-boya'));
  wanted_task_keys := app_private.mobile_task_keys_for_module(normalized_module_key);
  safe_item_key := nullif(trim(coalesce(target_item_key, '')), '');
  ready_photo_count := greatest(coalesce(target_ready_photo_count, 0), 0);
  required_photo_count := greatest(coalesce(target_required_photo_count, 0), 0);

  if safe_item_key is null then
    raise exception 'Madde anahtari zorunludur.';
  end if;

  select *
    into task
  from public.inspection_tasks
  where expertise_case_id = target_case_id
    and task_key = any(wanted_task_keys)
  order by coalesce(array_position(wanted_task_keys, task_key), 999), created_at asc
  limit 1;

  if task.id is null then
    raise exception 'Mobil modul icin teknik gorev bulunamadi: %', normalized_module_key;
  end if;

  result_status := app_private.mobile_result_for_option(
    target_selected_option_label,
    required_photo_count > ready_photo_count
  );

  insert into public.inspection_item_values (
    expertise_case_id,
    task_id,
    item_key,
    title,
    result,
    note,
    not_done_reason,
    report_field_key,
    requires_evidence_on_risk,
    severity,
    measured_value,
    measured_unit,
    created_by,
    updated_by
  )
  values (
    target_case_id,
    task.id,
    safe_item_key,
    coalesce(nullif(trim(coalesce(target_item_title, '')), ''), safe_item_key),
    result_status,
    jsonb_build_object(
      'moduleKey', normalized_module_key,
      'selectedOptionLabel', coalesce(target_selected_option_label, ''),
      'inputValues', coalesce(target_input_values, '{}'::jsonb),
      'description', coalesce(target_description_text, ''),
      'readyPhotoCount', ready_photo_count,
      'requiredPhotoCount', required_photo_count,
      'savedFrom', 'ototr-mobile-app'
    )::text,
    case when result_status = 'NOT_DONE' then coalesce(target_selected_option_label, 'Kontrol edilemedi') else '' end,
    task.report_field_key || '.' || safe_item_key,
    required_photo_count > 0,
    case when result_status = 'RISKY' then 2 when result_status = 'NOT_DONE' then 1 else 0 end,
    null,
    '',
    actor.id,
    actor.id
  )
  on conflict (expertise_case_id, task_id, item_key) do update set
    title = excluded.title,
    result = excluded.result,
    note = excluded.note,
    not_done_reason = excluded.not_done_reason,
    report_field_key = excluded.report_field_key,
    requires_evidence_on_risk = excluded.requires_evidence_on_risk,
    severity = excluded.severity,
    measured_value = excluded.measured_value,
    measured_unit = excluded.measured_unit,
    updated_by = actor.id,
    updated_at = now()
  returning * into next_value;

  perform set_config('ototr.branch_work_order_admin', 'on', true);

  update public.inspection_tasks
  set
    status = case
      when required_photo_count > ready_photo_count then 'EVIDENCE_MISSING'
      else 'COMPLETED'
    end,
    updated_at = now()
  where id = task.id;

  return next_value;
end;
$$;

revoke all on function public.save_mobile_inspection_item_value(uuid, text, text, text, text, jsonb, text, int, int) from public, anon;
grant execute on function public.save_mobile_inspection_item_value(uuid, text, text, text, text, jsonb, text, int, int) to authenticated;
