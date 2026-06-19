-- Keep mobile task status in sync with saved technician answers.
-- A module can close only after the answer is saved and required photo counts are satisfied.

create or replace function app_private.sync_mobile_answer_task_status()
returns trigger
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  note_payload jsonb;
  ready_photo_count integer;
  required_photo_count integer;
begin
  begin
    note_payload := coalesce(nullif(new.note, ''), '{}')::jsonb;
  exception when others then
    note_payload := '{}'::jsonb;
  end;

  if coalesce(note_payload->>'savedFrom', '') not like 'ototr-mobile-app%' then
    return new;
  end if;

  ready_photo_count := greatest(coalesce((note_payload->>'readyPhotoCount')::int, 0), 0);
  required_photo_count := greatest(coalesce((note_payload->>'requiredPhotoCount')::int, 0), 0);

  update public.inspection_tasks
  set
    status = case
      when required_photo_count > ready_photo_count then 'EVIDENCE_MISSING'
      else 'COMPLETED'
    end,
    updated_at = now()
  where id = new.task_id
    and expertise_case_id = new.expertise_case_id;

  return new;
end;
$$;

drop trigger if exists trg_sync_mobile_answer_task_status on public.inspection_item_values;
create trigger trg_sync_mobile_answer_task_status
after insert or update of result, note on public.inspection_item_values
for each row execute function app_private.sync_mobile_answer_task_status();

revoke all on function app_private.sync_mobile_answer_task_status() from public, anon, authenticated;

-- Keep ownership RPCs compatible with the stricter ownership trigger installed
-- by the branch work-order migration.
create or replace function public.claim_inspection_task(target_task_id uuid)
returns public.inspection_tasks as $$
declare
  actor_id uuid;
  previous_task public.inspection_tasks;
  next_task public.inspection_tasks;
begin
  actor_id := public.current_app_user_id();
  if actor_id is null then
    raise exception 'Aktif kullanici bulunamadi.';
  end if;

  select * into previous_task
  from public.inspection_tasks
  where id = target_task_id
  for update;

  if previous_task.id is null then
    raise exception 'Teknik baslik bulunamadi.';
  end if;

  if previous_task.owner_user_id is not null
     and previous_task.owner_user_id <> actor_id then
    raise exception 'Bu baslik baska bir usta tarafindan sahiplenilmis.';
  end if;

  perform set_config('ototr.task_claim', 'on', true);

  update public.inspection_tasks
  set
    owner_user_id = actor_id,
    claimed_at = now(),
    status = 'OPEN',
    release_reason = '',
    released_by_user_id = null,
    released_at = null,
    ownership_history = public.append_task_history(
      ownership_history,
      'CLAIMED',
      actor_id,
      actor_id,
      previous_task.owner_user_id,
      ''
    ),
    audit_log = public.append_task_audit(audit_log, 'claim', actor_id, '')
  where id = target_task_id
  returning * into next_task;

  perform public.log_task_audit(
    next_task.expertise_case_id,
    actor_id,
    'CLAIM_TASK',
    target_task_id,
    '',
    to_jsonb(previous_task),
    to_jsonb(next_task)
  );

  return next_task;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.release_inspection_task(
  target_task_id uuid,
  release_reason text
)
returns public.inspection_tasks as $$
declare
  actor_id uuid;
  previous_task public.inspection_tasks;
  next_task public.inspection_tasks;
begin
  actor_id := public.current_app_user_id();
  if actor_id is null then
    raise exception 'Aktif kullanici bulunamadi.';
  end if;

  if release_inspection_task.release_reason is null
     or length(trim(release_inspection_task.release_reason)) = 0 then
    raise exception 'releaseReason zorunludur.';
  end if;

  select * into previous_task
  from public.inspection_tasks
  where id = target_task_id
  for update;

  if previous_task.owner_user_id <> actor_id then
    raise exception 'Sadece gorev sahibi basligi havuza birakabilir.';
  end if;

  perform set_config('ototr.task_release', 'on', true);

  update public.inspection_tasks
  set
    owner_user_id = null,
    claimed_at = null,
    status = 'AVAILABLE',
    release_reason = trim(release_inspection_task.release_reason),
    released_by_user_id = actor_id,
    released_at = now(),
    ownership_history = public.append_task_history(
      ownership_history,
      'RELEASED',
      actor_id,
      null,
      previous_task.owner_user_id,
      trim(release_inspection_task.release_reason)
    ),
    audit_log = public.append_task_audit(
      audit_log,
      'release',
      actor_id,
      trim(release_inspection_task.release_reason)
    )
  where id = target_task_id
  returning * into next_task;

  perform public.log_task_audit(
    next_task.expertise_case_id,
    actor_id,
    'RELEASE_TASK',
    target_task_id,
    trim(release_inspection_task.release_reason),
    to_jsonb(previous_task),
    to_jsonb(next_task)
  );

  return next_task;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.submit_inspection_task(target_task_id uuid)
returns public.inspection_tasks as $$
declare
  actor_id uuid;
  previous_task public.inspection_tasks;
  next_task public.inspection_tasks;
begin
  actor_id := public.current_app_user_id();
  if actor_id is null then
    raise exception 'Aktif kullanici bulunamadi.';
  end if;

  select * into previous_task
  from public.inspection_tasks
  where id = target_task_id
  for update;

  if previous_task.owner_user_id <> actor_id
     and public.current_app_user_role() <> 'BRANCH_MANAGER' then
    raise exception 'Sadece gorev sahibi basligi gonderebilir.';
  end if;

  perform set_config('ototr.task_submit', 'on', true);

  update public.inspection_tasks
  set
    status = 'COMPLETED',
    ownership_history = public.append_task_history(
      ownership_history,
      'SUBMITTED',
      actor_id,
      previous_task.owner_user_id,
      previous_task.owner_user_id,
      'completed'
    ),
    audit_log = public.append_task_audit(audit_log, 'submit', actor_id, 'completed')
  where id = target_task_id
  returning * into next_task;

  perform public.log_task_audit(
    next_task.expertise_case_id,
    actor_id,
    'SUBMIT_TASK',
    target_task_id,
    'completed',
    to_jsonb(previous_task),
    to_jsonb(next_task)
  );

  return next_task;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.manager_assign_inspection_task(
  target_task_id uuid,
  next_owner_user_id uuid,
  manager_assign_reason text
)
returns public.inspection_tasks as $$
declare
  actor_id uuid;
  actor_role text;
  previous_task public.inspection_tasks;
  next_task public.inspection_tasks;
begin
  actor_id := public.current_app_user_id();
  actor_role := public.current_app_user_role();

  if actor_role <> 'BRANCH_MANAGER' then
    raise exception 'Baska ustaya dogrudan atama sadece mudur yetkisindedir.';
  end if;
  if next_owner_user_id is null then
    raise exception 'Yeni usta zorunludur.';
  end if;
  if manager_assign_inspection_task.manager_assign_reason is null
     or length(trim(manager_assign_inspection_task.manager_assign_reason)) = 0 then
    raise exception 'managerAssignReason zorunludur.';
  end if;

  select * into previous_task
  from public.inspection_tasks
  where id = target_task_id
  for update;

  perform set_config('ototr.manager_task_admin', 'on', true);

  update public.inspection_tasks
  set
    owner_user_id = next_owner_user_id,
    claimed_at = now(),
    status = 'OPEN',
    assigned_by_manager_id = actor_id,
    manager_assign_reason = trim(manager_assign_inspection_task.manager_assign_reason),
    ownership_history = public.append_task_history(
      ownership_history,
      'MANAGER_REASSIGNED',
      actor_id,
      next_owner_user_id,
      previous_task.owner_user_id,
      trim(manager_assign_inspection_task.manager_assign_reason)
    ),
    audit_log = public.append_task_audit(
      audit_log,
      'manager_reassigned',
      actor_id,
      trim(manager_assign_inspection_task.manager_assign_reason)
    )
  where id = target_task_id
  returning * into next_task;

  perform public.log_task_audit(
    next_task.expertise_case_id,
    actor_id,
    'MANAGER_REASSIGN_TASK',
    target_task_id,
    trim(manager_assign_inspection_task.manager_assign_reason),
    to_jsonb(previous_task),
    to_jsonb(next_task)
  );

  return next_task;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.manager_clear_inspection_task_owner(
  target_task_id uuid,
  release_reason text
)
returns public.inspection_tasks as $$
declare
  actor_id uuid;
  actor_role text;
  previous_task public.inspection_tasks;
  next_task public.inspection_tasks;
begin
  actor_id := public.current_app_user_id();
  actor_role := public.current_app_user_role();

  if actor_role <> 'BRANCH_MANAGER' then
    raise exception 'Sahipligi kaldirma sadece mudur yetkisindedir.';
  end if;
  if manager_clear_inspection_task_owner.release_reason is null
     or length(trim(manager_clear_inspection_task_owner.release_reason)) = 0 then
    raise exception 'Gerekce zorunludur.';
  end if;

  select * into previous_task
  from public.inspection_tasks
  where id = target_task_id
  for update;

  perform set_config('ototr.manager_task_admin', 'on', true);

  update public.inspection_tasks
  set
    owner_user_id = null,
    claimed_at = null,
    status = 'AVAILABLE',
    release_reason = trim(manager_clear_inspection_task_owner.release_reason),
    released_by_user_id = actor_id,
    released_at = now(),
    ownership_history = public.append_task_history(
      ownership_history,
      'MANAGER_RELEASED',
      actor_id,
      null,
      previous_task.owner_user_id,
      trim(manager_clear_inspection_task_owner.release_reason)
    ),
    audit_log = public.append_task_audit(
      audit_log,
      'manager_released',
      actor_id,
      trim(manager_clear_inspection_task_owner.release_reason)
    )
  where id = target_task_id
  returning * into next_task;

  perform public.log_task_audit(
    next_task.expertise_case_id,
    actor_id,
    'MANAGER_RELEASE_TASK',
    target_task_id,
    trim(manager_clear_inspection_task_owner.release_reason),
    to_jsonb(previous_task),
    to_jsonb(next_task)
  );

  return next_task;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.manager_return_inspection_task(
  target_task_id uuid,
  return_reason text
)
returns public.inspection_tasks as $$
declare
  actor_id uuid;
  actor_role text;
  previous_task public.inspection_tasks;
  next_task public.inspection_tasks;
begin
  actor_id := public.current_app_user_id();
  actor_role := public.current_app_user_role();

  if actor_role <> 'BRANCH_MANAGER' then
    raise exception 'Iade sadece mudur yetkisindedir.';
  end if;
  if manager_return_inspection_task.return_reason is null
     or length(trim(manager_return_inspection_task.return_reason)) = 0 then
    raise exception 'Iade gerekcesi zorunludur.';
  end if;

  select * into previous_task
  from public.inspection_tasks
  where id = target_task_id
  for update;

  perform set_config('ototr.manager_task_admin', 'on', true);

  update public.inspection_tasks
  set
    status = 'MANAGER_RETURNED',
    manager_return_reason = trim(manager_return_inspection_task.return_reason),
    revision_no = revision_no + 1,
    ownership_history = public.append_task_history(
      ownership_history,
      'MANAGER_RETURNED',
      actor_id,
      owner_user_id,
      owner_user_id,
      trim(manager_return_inspection_task.return_reason)
    ),
    audit_log = public.append_task_audit(
      audit_log,
      'manager_returned',
      actor_id,
      trim(manager_return_inspection_task.return_reason)
    )
  where id = target_task_id
  returning * into next_task;

  perform public.log_task_audit(
    next_task.expertise_case_id,
    actor_id,
    'MANAGER_RETURN_TASK',
    target_task_id,
    trim(manager_return_inspection_task.return_reason),
    to_jsonb(previous_task),
    to_jsonb(next_task)
  );

  return next_task;
end;
$$ language plpgsql security definer set search_path = public;
