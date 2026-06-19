-- OTOTR evidence storage upload flow.
-- Scope: local/staging reviewed migration. Do not put service_role keys in clients.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ototr-evidence',
  'ototr-evidence',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.inspection_evidence_assets
  add column if not exists storage_bucket text not null default 'ototr-evidence',
  add column if not exists storage_object_id uuid,
  add column if not exists storage_content_type text,
  add column if not exists storage_size_bytes bigint,
  add column if not exists upload_source text not null default 'mobile',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_evidence_storage_path
  on public.inspection_evidence_assets(storage_bucket, storage_path)
  where storage_path is not null;

create index if not exists idx_evidence_task_sync
  on public.inspection_evidence_assets(task_id, sync_status);

create or replace function public.current_user_can_access_evidence_task(target_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.inspection_tasks it
    join public.expertise_cases ec on ec.id = it.expertise_case_id
    where it.id = target_task_id
      and public.current_user_can_access_branch(ec.branch_id)
      and (
        public.current_app_user_role() in ('CEO', 'GENERAL_MANAGER', 'BRANCH_MANAGER', 'QUALITY_AUDITOR')
        or it.assigned_user_id = public.current_app_user_id()
        or it.owner_user_id = public.current_app_user_id()
      )
  );
$$;

create or replace function public.current_user_can_access_evidence_case(target_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.expertise_cases ec
    where ec.id = target_case_id
      and public.current_user_can_access_branch(ec.branch_id)
      and (
        public.current_app_user_role() in ('CEO', 'GENERAL_MANAGER', 'BRANCH_MANAGER', 'QUALITY_AUDITOR')
        or ec.assigned_technician_id = public.current_app_user_id()
        or exists (
          select 1
          from public.inspection_tasks it
          where it.expertise_case_id = ec.id
            and (
              it.assigned_user_id = public.current_app_user_id()
              or it.owner_user_id = public.current_app_user_id()
            )
        )
      )
  );
$$;

drop policy if exists evidence_assets_case_access on public.inspection_evidence_assets;

create policy evidence_assets_select_scope
on public.inspection_evidence_assets
for select
to authenticated
using (
  public.current_user_can_access_evidence_case(expertise_case_id)
);

create policy evidence_assets_insert_scope
on public.inspection_evidence_assets
for insert
to authenticated
with check (
  public.current_user_can_access_evidence_case(expertise_case_id)
  and (
    task_id is null
    or public.current_user_can_access_evidence_task(task_id)
  )
  and captured_by = public.current_app_user_id()
);

create policy evidence_assets_update_scope
on public.inspection_evidence_assets
for update
to authenticated
using (
  public.current_user_can_access_evidence_case(expertise_case_id)
)
with check (
  public.current_user_can_access_evidence_case(expertise_case_id)
  and (
    public.current_app_user_role() in ('CEO', 'GENERAL_MANAGER', 'BRANCH_MANAGER', 'QUALITY_AUDITOR')
    or captured_by = public.current_app_user_id()
  )
);

create or replace function public.register_inspection_evidence_upload(
  target_case_id uuid,
  target_task_id uuid,
  target_item_value_id uuid,
  evidence_field_key text,
  evidence_report_field_key text,
  evidence_title text,
  evidence_type text,
  storage_bucket_name text,
  storage_object_path text,
  content_type text,
  size_bytes bigint,
  device_id text default null,
  metadata jsonb default '{}'::jsonb
)
returns public.inspection_evidence_assets
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid;
  next_asset public.inspection_evidence_assets;
begin
  actor_id := public.current_app_user_id();
  if actor_id is null then
    raise exception 'Aktif kullanici bulunamadi.';
  end if;

  if not public.current_user_can_access_evidence_case(target_case_id) then
    raise exception 'Bu is emri kanit kaydina erisim yok.';
  end if;

  if target_task_id is not null and not public.current_user_can_access_evidence_task(target_task_id) then
    raise exception 'Bu test basligi icin kanit kaydi yetkiniz yok.';
  end if;

  if storage_bucket_name <> 'ototr-evidence' then
    raise exception 'Gecersiz kanit bucket: %', storage_bucket_name;
  end if;

  if storage_object_path is null or storage_object_path !~ '^work-orders/[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+$' then
    raise exception 'Gecersiz storage path.';
  end if;

  insert into public.inspection_evidence_assets (
    expertise_case_id,
    task_id,
    item_value_id,
    field_key,
    report_field_key,
    evidence_type,
    title,
    remote_url,
    storage_bucket,
    storage_path,
    storage_content_type,
    storage_size_bytes,
    sync_status,
    is_required,
    captured_by,
    captured_at,
    uploaded_at,
    device_id,
    upload_source,
    metadata
  )
  values (
    target_case_id,
    target_task_id,
    target_item_value_id,
    coalesce(nullif(trim(evidence_field_key), ''), 'mobile_evidence'),
    coalesce(nullif(trim(evidence_report_field_key), ''), coalesce(nullif(trim(evidence_field_key), ''), 'mobile_evidence')),
    upper(coalesce(nullif(trim(evidence_type), ''), 'IMAGE')),
    coalesce(nullif(trim(evidence_title), ''), 'Mobil kanit'),
    storage_bucket_name || '/' || storage_object_path,
    storage_bucket_name,
    storage_object_path,
    nullif(trim(coalesce(content_type, '')), ''),
    greatest(coalesce(size_bytes, 0), 0),
    'UPLOADED',
    true,
    actor_id,
    now(),
    now(),
    nullif(trim(coalesce(device_id, '')), ''),
    'mobile',
    coalesce(metadata, '{}'::jsonb)
  )
  returning * into next_asset;

  return next_asset;
end;
$$;

revoke all on function public.current_user_can_access_evidence_task(uuid) from public, anon;
revoke all on function public.current_user_can_access_evidence_case(uuid) from public, anon;
revoke all on function public.register_inspection_evidence_upload(uuid, uuid, uuid, text, text, text, text, text, text, text, bigint, text, jsonb) from public, anon;

grant execute on function public.current_user_can_access_evidence_task(uuid) to authenticated;
grant execute on function public.current_user_can_access_evidence_case(uuid) to authenticated;
grant execute on function public.register_inspection_evidence_upload(uuid, uuid, uuid, text, text, text, text, text, text, text, bigint, text, jsonb) to authenticated;
grant select, insert, update on table public.inspection_evidence_assets to authenticated;

drop policy if exists ototr_evidence_object_select on storage.objects;
drop policy if exists ototr_evidence_object_insert on storage.objects;
drop policy if exists ototr_evidence_object_update on storage.objects;

create policy ototr_evidence_object_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'ototr-evidence'
  and (storage.foldername(name))[1] = 'work-orders'
  and exists (
    select 1
    from public.inspection_evidence_assets ea
    where ea.storage_bucket = bucket_id
      and ea.storage_path = name
      and public.current_user_can_access_evidence_case(ea.expertise_case_id)
  )
);

create policy ototr_evidence_object_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ototr-evidence'
  and (storage.foldername(name))[1] = 'work-orders'
  and (
    public.current_app_user_role() in ('CEO', 'GENERAL_MANAGER', 'BRANCH_MANAGER', 'QUALITY_AUDITOR', 'INSPECTION_TECHNICIAN')
  )
);
