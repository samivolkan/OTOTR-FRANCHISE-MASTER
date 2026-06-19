-- Keep the stricter task ownership trigger from the branch work-order RPC
-- migration, but mark trusted task-operation RPC updates with the context
-- flags that the trigger already expects.

create or replace function public.claim_inspection_task(target_task_id uuid)
returns public.inspection_tasks
language plpgsql
security definer
set search_path = public
as $$
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
$$;

create or replace function public.release_inspection_task(
  target_task_id uuid,
  release_reason text
)
returns public.inspection_tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid;
  previous_task public.inspection_tasks;
  next_task public.inspection_tasks;
begin
  actor_id := public.current_app_user_id();
  if actor_id is null then
    raise exception 'Aktif kullanici bulunamadi.';
  end if;

  if public.release_inspection_task.release_reason is null
     or length(trim(public.release_inspection_task.release_reason)) = 0 then
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
    release_reason = trim(public.release_inspection_task.release_reason),
    released_by_user_id = actor_id,
    released_at = now(),
    ownership_history = public.append_task_history(
      ownership_history,
      'RELEASED',
      actor_id,
      null,
      previous_task.owner_user_id,
      trim(public.release_inspection_task.release_reason)
    ),
    audit_log = public.append_task_audit(
      audit_log,
      'release',
      actor_id,
      trim(public.release_inspection_task.release_reason)
    )
  where id = target_task_id
  returning * into next_task;

  perform public.log_task_audit(
    next_task.expertise_case_id,
    actor_id,
    'RELEASE_TASK',
    target_task_id,
    trim(public.release_inspection_task.release_reason),
    to_jsonb(previous_task),
    to_jsonb(next_task)
  );

  return next_task;
end;
$$;

create or replace function public.manager_assign_inspection_task(
  target_task_id uuid,
  next_owner_user_id uuid,
  manager_assign_reason text
)
returns public.inspection_tasks
language plpgsql
security definer
set search_path = public
as $$
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
  if public.manager_assign_inspection_task.manager_assign_reason is null
     or length(trim(public.manager_assign_inspection_task.manager_assign_reason)) = 0 then
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
    manager_assign_reason = trim(public.manager_assign_inspection_task.manager_assign_reason),
    ownership_history = public.append_task_history(
      ownership_history,
      'MANAGER_REASSIGNED',
      actor_id,
      next_owner_user_id,
      previous_task.owner_user_id,
      trim(public.manager_assign_inspection_task.manager_assign_reason)
    ),
    audit_log = public.append_task_audit(
      audit_log,
      'manager_reassigned',
      actor_id,
      trim(public.manager_assign_inspection_task.manager_assign_reason)
    )
  where id = target_task_id
  returning * into next_task;

  perform public.log_task_audit(
    next_task.expertise_case_id,
    actor_id,
    'MANAGER_REASSIGN_TASK',
    target_task_id,
    trim(public.manager_assign_inspection_task.manager_assign_reason),
    to_jsonb(previous_task),
    to_jsonb(next_task)
  );

  return next_task;
end;
$$;

create or replace function public.manager_clear_inspection_task_owner(
  target_task_id uuid,
  release_reason text
)
returns public.inspection_tasks
language plpgsql
security definer
set search_path = public
as $$
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
  if public.manager_clear_inspection_task_owner.release_reason is null
     or length(trim(public.manager_clear_inspection_task_owner.release_reason)) = 0 then
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
    release_reason = trim(public.manager_clear_inspection_task_owner.release_reason),
    released_by_user_id = actor_id,
    released_at = now(),
    ownership_history = public.append_task_history(
      ownership_history,
      'MANAGER_RELEASED',
      actor_id,
      null,
      previous_task.owner_user_id,
      trim(public.manager_clear_inspection_task_owner.release_reason)
    ),
    audit_log = public.append_task_audit(
      audit_log,
      'manager_released',
      actor_id,
      trim(public.manager_clear_inspection_task_owner.release_reason)
    )
  where id = target_task_id
  returning * into next_task;

  perform public.log_task_audit(
    next_task.expertise_case_id,
    actor_id,
    'MANAGER_RELEASE_TASK',
    target_task_id,
    trim(public.manager_clear_inspection_task_owner.release_reason),
    to_jsonb(previous_task),
    to_jsonb(next_task)
  );

  return next_task;
end;
$$;

create or replace function public.submit_inspection_task(target_task_id uuid)
returns public.inspection_tasks
language plpgsql
security definer
set search_path = public
as $$
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
$$;

create or replace function public.manager_return_inspection_task(
  target_task_id uuid,
  return_reason text
)
returns public.inspection_tasks
language plpgsql
security definer
set search_path = public
as $$
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
  if public.manager_return_inspection_task.return_reason is null
     or length(trim(public.manager_return_inspection_task.return_reason)) = 0 then
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
    manager_return_reason = trim(public.manager_return_inspection_task.return_reason),
    revision_no = revision_no + 1,
    ownership_history = public.append_task_history(
      ownership_history,
      'MANAGER_RETURNED',
      actor_id,
      owner_user_id,
      owner_user_id,
      trim(public.manager_return_inspection_task.return_reason)
    ),
    audit_log = public.append_task_audit(
      audit_log,
      'manager_returned',
      actor_id,
      trim(public.manager_return_inspection_task.return_reason)
    )
  where id = target_task_id
  returning * into next_task;

  perform public.log_task_audit(
    next_task.expertise_case_id,
    actor_id,
    'MANAGER_RETURN_TASK',
    target_task_id,
    trim(public.manager_return_inspection_task.return_reason),
    to_jsonb(previous_task),
    to_jsonb(next_task)
  );

  return next_task;
end;
$$;

revoke execute on function public.claim_inspection_task(uuid) from public, anon;
revoke execute on function public.release_inspection_task(uuid, text) from public, anon;
revoke execute on function public.manager_assign_inspection_task(uuid, uuid, text) from public, anon;
revoke execute on function public.manager_clear_inspection_task_owner(uuid, text) from public, anon;
revoke execute on function public.submit_inspection_task(uuid) from public, anon;
revoke execute on function public.manager_return_inspection_task(uuid, text) from public, anon;

grant execute on function public.claim_inspection_task(uuid) to authenticated;
grant execute on function public.release_inspection_task(uuid, text) to authenticated;
grant execute on function public.manager_assign_inspection_task(uuid, uuid, text) to authenticated;
grant execute on function public.manager_clear_inspection_task_owner(uuid, text) to authenticated;
grant execute on function public.submit_inspection_task(uuid) to authenticated;
grant execute on function public.manager_return_inspection_task(uuid, text) to authenticated;
