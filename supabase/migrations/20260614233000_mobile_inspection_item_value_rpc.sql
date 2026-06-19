-- Mobile inspection item value RPC.
-- Stores technician module answers in inspection_item_values through the existing task/RLS model.

create or replace function app_private.mobile_task_key_for_module(module_key text)
returns text
language sql
immutable
as $$
  select case lower(coalesce(module_key, ''))
    when 'kaporta' then 'BODY_PAINT_CHECKUP'
    when 'body' then 'BODY_PAINT_CHECKUP'
    when 'paint' then 'BODY_PAINT_CHECKUP'
    when 'motor' then 'MOTOR_CHECKUP'
    when 'engine' then 'MOTOR_CHECKUP'
    when 'mechanic' then 'MECHANICAL_CHECKUP'
    when 'mekanik' then 'MECHANICAL_CHECKUP'
    when 'brake' then 'BRAKE_SUSPENSION_TEST'
    when 'suspension' then 'BRAKE_SUSPENSION_TEST'
    when 'electric' then 'OBD_ECU_TEST'
    when 'elektrik' then 'OBD_ECU_TEST'
    when 'brain' then 'OBD_ECU_TEST'
    when 'airbag' then 'AIRBAG_CHECK'
    when 'interiorexterior' then 'EXTERIOR_CONDITION'
    when 'interior' then 'INTERIOR_CHECKUP'
    when 'exterior' then 'EXTERIOR_CONDITION'
    when 'roadtest' then 'DYNO_ROAD_TEST'
    when 'road_test' then 'DYNO_ROAD_TEST'
    when 'conta' then 'HEAD_GASKET_LEAK_TEST'
    else 'BODY_PAINT_CHECKUP'
  end;
$$;

create or replace function app_private.mobile_result_for_option(option_label text, has_missing_evidence boolean default false)
returns text
language sql
immutable
as $$
  select case
    when has_missing_evidence then 'RISKY'
    when coalesce(option_label, '') ilike any (array[
      '%sorunsuz%',
      '%normal%',
      '%iyi%',
      '%çalışıyor%',
      '%calisiyor%',
      '%arıza kaydı yok%',
      '%ariza kaydi yok%'
    ]) then 'NORMAL'
    when coalesce(option_label, '') ilike any (array[
      '%hasar%',
      '%arıza%',
      '%ariza%',
      '%değişen%',
      '%degisen%',
      '%işlemli%',
      '%islemli%',
      '%kaçak%',
      '%kacak%',
      '%sorun%',
      '%kötü%',
      '%kotu%'
    ]) then 'RISKY'
    when coalesce(option_label, '') ilike any (array[
      '%kontrol edilmedi%',
      '%bakılamadı%',
      '%bakilamadi%',
      '%test yapılamadı%',
      '%test yapilamadi%'
    ]) then 'NOT_DONE'
    else 'NORMAL'
  end;
$$;

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
  wanted_task_key text;
  result_status text;
  next_value public.inspection_item_values;
  safe_item_key text;
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

  normalized_module_key := lower(coalesce(target_module_key, 'kaporta'));
  wanted_task_key := app_private.mobile_task_key_for_module(normalized_module_key);
  safe_item_key := nullif(trim(coalesce(target_item_key, '')), '');

  if safe_item_key is null then
    raise exception 'Madde anahtari zorunludur.';
  end if;

  select *
    into task
  from public.inspection_tasks
  where expertise_case_id = target_case_id
    and task_key = wanted_task_key
  order by created_at asc
  limit 1;

  if task.id is null then
    select *
      into task
    from public.inspection_tasks
    where expertise_case_id = target_case_id
    order by created_at asc
    limit 1;
  end if;

  if task.id is null then
    raise exception 'Is emri icin teknik gorev bulunamadi.';
  end if;

  result_status := app_private.mobile_result_for_option(
    target_selected_option_label,
    greatest(coalesce(target_required_photo_count, 0), 0) > greatest(coalesce(target_ready_photo_count, 0), 0)
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
      'readyPhotoCount', greatest(coalesce(target_ready_photo_count, 0), 0),
      'requiredPhotoCount', greatest(coalesce(target_required_photo_count, 0), 0),
      'savedFrom', 'ototr-mobile-app'
    )::text,
    case when result_status = 'NOT_DONE' then coalesce(target_selected_option_label, 'Kontrol edilemedi') else '' end,
    task.report_field_key || '.' || safe_item_key,
    greatest(coalesce(target_required_photo_count, 0), 0) > 0,
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
      when next_value.result = 'RISKY' then 'EVIDENCE_MISSING'
      when status in ('LOCKED', 'ASSIGNED') then 'OPEN'
      else status
    end,
    updated_at = now()
  where id = task.id;

  return next_value;
end;
$$;

revoke all on function app_private.mobile_task_key_for_module(text) from public, anon;
revoke all on function app_private.mobile_result_for_option(text, boolean) from public, anon;
revoke all on function public.save_mobile_inspection_item_value(uuid, text, text, text, text, jsonb, text, int, int) from public, anon;

grant execute on function public.save_mobile_inspection_item_value(uuid, text, text, text, text, jsonb, text, int, int) to authenticated;
grant select on table public.inspection_item_values to authenticated;
