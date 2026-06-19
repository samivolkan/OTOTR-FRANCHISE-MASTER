-- Mobile final report payload RPC.
-- Builds a final report draft from persisted work-order, answer, evidence and gate data.

insert into public.report_templates (
  id,
  name,
  version,
  source_report_id,
  is_active
)
values (
  'ototr-mobile-final-v1',
  'OTOTR Mobile Final Report',
  '1.0.0',
  'ototr-mobile-final',
  true
)
on conflict (id) do update set
  name = excluded.name,
  version = excluded.version,
  is_active = excluded.is_active,
  updated_at = now();

create or replace function public.generate_mobile_final_report(
  target_case_id uuid,
  lock_report boolean default false
)
returns public.final_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid;
  actor_role text;
  current_case record;
  gate jsonb;
  answer_rows jsonb;
  evidence_rows jsonb;
  task_rows jsonb;
  final_payload jsonb;
  next_report public.final_reports;
begin
  actor_id := public.current_app_user_id();
  actor_role := coalesce(public.current_app_user_role(), '');

  if actor_id is null then
    raise exception 'Aktif uygulama kullanicisi bulunamadi.';
  end if;

  select
    ec.id,
    ec.branch_id,
    ec.work_order_no,
    ec.report_no,
    ec.status,
    ec.revision_no,
    ec.opened_at,
    ec.inspection_started_at,
    ec.inspection_completed_at,
    b.name as branch_name,
    c.full_name as customer_name,
    c.phone as customer_phone,
    c.email as customer_email,
    v.plate,
    v.vin,
    v.brand,
    v.model,
    v.model_year,
    v.mileage_km,
    pp.code as package_code,
    pp.name as package_name
    into current_case
  from public.expertise_cases ec
  join public.branches b on b.id = ec.branch_id
  join public.customers c on c.id = ec.customer_id
  join public.vehicles v on v.id = ec.vehicle_id
  left join public.package_plans pp on pp.id = ec.package_plan_id
  where ec.id = target_case_id;

  if current_case.id is null then
    raise exception 'Is emri bulunamadi.';
  end if;

  if not public.current_user_can_access_branch(current_case.branch_id) then
    raise exception 'Bu is emrine erisim yok.';
  end if;

  gate := public.get_mobile_technical_approval_gate(target_case_id);

  if lock_report and not coalesce((gate->>'canSubmit')::boolean, false) then
    raise exception 'Final rapor kilitlenemez. Eksik modül veya kanıt blokajlari mevcut.';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', iv.id,
    'taskId', iv.task_id,
    'taskKey', it.task_key,
    'taskTitle', it.title,
    'itemKey', iv.item_key,
    'title', iv.title,
    'result', iv.result,
    'note', iv.note,
    'notDoneReason', iv.not_done_reason,
    'reportFieldKey', iv.report_field_key,
    'requiresEvidenceOnRisk', iv.requires_evidence_on_risk,
    'severity', iv.severity,
    'updatedAt', iv.updated_at
  ) order by it.created_at, iv.created_at), '[]'::jsonb)
    into answer_rows
  from public.inspection_item_values iv
  join public.inspection_tasks it on it.id = iv.task_id
  where iv.expertise_case_id = target_case_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', ea.id,
    'taskId', ea.task_id,
    'itemValueId', ea.item_value_id,
    'fieldKey', ea.field_key,
    'reportFieldKey', ea.report_field_key,
    'title', ea.title,
    'evidenceType', ea.evidence_type,
    'syncStatus', ea.sync_status,
    'remoteUrl', ea.remote_url,
    'storageBucket', ea.storage_bucket,
    'storagePath', ea.storage_path,
    'contentType', ea.storage_content_type,
    'sizeBytes', ea.storage_size_bytes,
    'metadata', ea.metadata,
    'uploadedAt', ea.uploaded_at
  ) order by ea.created_at), '[]'::jsonb)
    into evidence_rows
  from public.inspection_evidence_assets ea
  where ea.expertise_case_id = target_case_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', it.id,
    'taskKey', it.task_key,
    'title', it.title,
    'assignedRole', it.assigned_role,
    'status', it.status,
    'reportFieldKey', it.report_field_key,
    'estimatedMinutes', it.estimated_minutes
  ) order by it.created_at), '[]'::jsonb)
    into task_rows
  from public.inspection_tasks it
  where it.expertise_case_id = target_case_id;

  final_payload := jsonb_build_object(
    'schema', 'ototr.mobile.final_report.v1',
    'generatedAt', now(),
    'generatedBy', jsonb_build_object(
      'appUserId', actor_id,
      'role', actor_role
    ),
    'workOrder', jsonb_build_object(
      'id', current_case.id,
      'workOrderNo', current_case.work_order_no,
      'reportNo', current_case.report_no,
      'status', current_case.status,
      'revisionNo', current_case.revision_no,
      'openedAt', current_case.opened_at,
      'inspectionStartedAt', current_case.inspection_started_at,
      'inspectionCompletedAt', current_case.inspection_completed_at
    ),
    'branch', jsonb_build_object(
      'id', current_case.branch_id,
      'name', current_case.branch_name
    ),
    'customer', jsonb_build_object(
      'name', current_case.customer_name,
      'phone', current_case.customer_phone,
      'email', current_case.customer_email
    ),
    'vehicle', jsonb_build_object(
      'plate', current_case.plate,
      'vin', current_case.vin,
      'brand', current_case.brand,
      'model', current_case.model,
      'modelYear', current_case.model_year,
      'mileageKm', current_case.mileage_km
    ),
    'package', jsonb_build_object(
      'code', current_case.package_code,
      'name', current_case.package_name
    ),
    'gate', gate,
    'tasks', task_rows,
    'answers', answer_rows,
    'evidence', evidence_rows,
    'summary', jsonb_build_object(
      'answerCount', jsonb_array_length(answer_rows),
      'evidenceCount', jsonb_array_length(evidence_rows),
      'riskyAnswerCount', coalesce((gate->>'riskyAnswerCount')::int, 0),
      'notDoneAnswerCount', coalesce((gate->>'notDoneAnswerCount')::int, 0),
      'canSubmit', coalesce((gate->>'canSubmit')::boolean, false)
    )
  );

  insert into public.final_reports (
    expertise_case_id,
    template_id,
    revision_no,
    payload,
    status,
    created_by,
    locked_by,
    locked_at
  )
  values (
    target_case_id,
    'ototr-mobile-final-v1',
    current_case.revision_no,
    final_payload,
    case when lock_report then 'LOCKED' else 'DRAFT' end,
    actor_id,
    case when lock_report then actor_id else null end,
    case when lock_report then now() else null end
  )
  on conflict (expertise_case_id, revision_no) do update set
    template_id = excluded.template_id,
    payload = excluded.payload,
    status = excluded.status,
    locked_by = excluded.locked_by,
    locked_at = excluded.locked_at
  returning * into next_report;

  if lock_report then
    update public.expertise_cases
    set
      status = 'COMPLETED',
      inspection_completed_at = coalesce(inspection_completed_at, now()),
      updated_by = actor_id
    where id = target_case_id;
  end if;

  return next_report;
end;
$$;

revoke all on function public.generate_mobile_final_report(uuid, boolean) from public, anon;
grant execute on function public.generate_mobile_final_report(uuid, boolean) to authenticated;
