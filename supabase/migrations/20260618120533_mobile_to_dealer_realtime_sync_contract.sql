-- Mobile technician -> dealer portal sync contract.
-- Non-destructive: aligns module task keys and enables Realtime publications.

create or replace function app_private.mobile_task_keys_for_module(module_key text)
returns text[]
language sql
immutable
as $$
  select case lower(coalesce(module_key, ''))
    when 'kaporta-boya' then array['KAPORTA_KONTROL', 'BOYA_KONTROL', 'BODY_PAINT_CHECKUP']
    when 'kaporta' then array['KAPORTA_KONTROL', 'BOYA_KONTROL', 'BODY_PAINT_CHECKUP']
    when 'body' then array['KAPORTA_KONTROL', 'BODY_PAINT_CHECKUP']
    when 'paint' then array['BOYA_KONTROL', 'KAPORTA_KONTROL', 'BODY_PAINT_CHECKUP']
    when 'boya' then array['BOYA_KONTROL', 'KAPORTA_KONTROL', 'BODY_PAINT_CHECKUP']
    when 'motor' then array['MOTOR_KONTROL', 'MOTOR_CHECKUP']
    when 'engine' then array['MOTOR_KONTROL', 'MOTOR_CHECKUP']
    when 'alt-on-mekanik' then array['ALT_TAKIM_KONTROL', 'MEKANIK_KONTROL', 'MECHANICAL_CHECKUP']
    when 'mechanic' then array['MEKANIK_KONTROL', 'ALT_TAKIM_KONTROL', 'MECHANICAL_CHECKUP']
    when 'mekanik' then array['MEKANIK_KONTROL', 'ALT_TAKIM_KONTROL', 'MECHANICAL_CHECKUP']
    when 'fren-suspansiyon' then array['FREN_KONTROL', 'BRAKE_SUSPENSION_TEST']
    when 'brakesuspension' then array['FREN_KONTROL', 'BRAKE_SUSPENSION_TEST']
    when 'brake' then array['FREN_KONTROL', 'BRAKE_SUSPENSION_TEST']
    when 'suspension' then array['FREN_KONTROL', 'BRAKE_SUSPENSION_TEST']
    when 'fren' then array['FREN_KONTROL', 'BRAKE_SUSPENSION_TEST']
    when 'obd-beyin' then array['ELEKTRIK_KONTROL', 'OBD_ECU_TEST']
    when 'electric' then array['ELEKTRIK_KONTROL', 'OBD_ECU_TEST']
    when 'elektrik' then array['ELEKTRIK_KONTROL', 'OBD_ECU_TEST']
    when 'brain' then array['ELEKTRIK_KONTROL', 'OBD_ECU_TEST']
    when 'beyin' then array['ELEKTRIK_KONTROL', 'OBD_ECU_TEST']
    when 'obd' then array['ELEKTRIK_KONTROL', 'OBD_ECU_TEST']
    when 'dyno-yol' then array['DYNO_TEST', 'DYNO_ROAD_TEST']
    when 'roadtest' then array['DYNO_TEST', 'DYNO_ROAD_TEST']
    when 'road-test' then array['DYNO_TEST', 'DYNO_ROAD_TEST']
    when 'road_test' then array['DYNO_TEST', 'DYNO_ROAD_TEST']
    when 'dyno' then array['DYNO_TEST', 'DYNO_ROAD_TEST']
    when 'genel-kondisyon-dis' then array['KAPORTA_KONTROL', 'GENEL_FOTO', 'EXTERIOR_CONDITION']
    when 'exterior' then array['KAPORTA_KONTROL', 'GENEL_FOTO', 'EXTERIOR_CONDITION']
    when 'dis' then array['KAPORTA_KONTROL', 'GENEL_FOTO', 'EXTERIOR_CONDITION']
    when 'ic-ekspertiz' then array['IC_KONDISYON', 'INTERIOR_CHECKUP']
    when 'interior' then array['IC_KONDISYON', 'INTERIOR_CHECKUP']
    when 'ic' then array['IC_KONDISYON', 'INTERIOR_CHECKUP']
    when 'airbag' then array['ELEKTRIK_KONTROL', 'AIRBAG_CHECK', 'OBD_ECU_TEST']
    when 'conta-kacak' then array['MOTOR_KONTROL', 'HEAD_GASKET_LEAK_TEST', 'MOTOR_CHECKUP']
    when 'conta' then array['MOTOR_KONTROL', 'HEAD_GASKET_LEAK_TEST', 'MOTOR_CHECKUP']
    when 'gasket' then array['MOTOR_KONTROL', 'HEAD_GASKET_LEAK_TEST', 'MOTOR_CHECKUP']
    else array['KAPORTA_KONTROL', 'BODY_PAINT_CHECKUP']
  end;
$$;

create or replace function app_private.mobile_task_key_for_module(module_key text)
returns text
language sql
immutable
as $$
  select (app_private.mobile_task_keys_for_module(module_key))[1];
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
  wanted_task_keys text[];
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

  normalized_module_key := lower(coalesce(target_module_key, 'kaporta-boya'));
  wanted_task_keys := app_private.mobile_task_keys_for_module(normalized_module_key);
  safe_item_key := nullif(trim(coalesce(target_item_key, '')), '');

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

revoke all on function app_private.mobile_task_keys_for_module(text) from public, anon;
revoke all on function app_private.mobile_task_key_for_module(text) from public, anon;
revoke all on function public.save_mobile_inspection_item_value(uuid, text, text, text, text, jsonb, text, int, int) from public, anon;

grant execute on function public.save_mobile_inspection_item_value(uuid, text, text, text, text, jsonb, text, int, int) to authenticated;
grant select on table public.inspection_item_values to authenticated;

do $$
declare
  target_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach target_table in array array[
      'expertise_cases',
      'inspection_tasks',
      'inspection_evidence_assets',
      'inspection_item_values',
      'work_order_report_answers',
      'work_order_group_status',
      'final_reports'
    ] loop
      if exists (
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = target_table
      )
      and not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = target_table
      ) then
        execute format('alter publication supabase_realtime add table public.%I', target_table);
      end if;
    end loop;
  end if;
end $$;
