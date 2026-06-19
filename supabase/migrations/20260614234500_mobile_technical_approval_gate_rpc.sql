-- Mobile completion gate RPC.
-- Calculates whether a mobile work order can be completed directly after technician flow.

create or replace function public.get_mobile_technical_approval_gate(target_case_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_case public.expertise_cases;
  total_task_count integer;
  completed_task_count integer;
  answer_count integer;
  answered_task_count integer;
  risky_count integer;
  not_done_count integer;
  missing_required_evidence_count integer;
  uploaded_evidence_count integer;
  blocker_items jsonb := '[]'::jsonb;
  can_submit boolean;
begin
  select *
    into current_case
  from public.expertise_cases
  where id = target_case_id;

  if current_case.id is null then
    raise exception 'Is emri bulunamadi.';
  end if;

  if not public.current_user_can_access_branch(current_case.branch_id) then
    raise exception 'Bu is emrine erisim yok.';
  end if;

  select
    count(*),
    count(*) filter (where status = 'COMPLETED')
    into total_task_count, completed_task_count
  from public.inspection_tasks
  where expertise_case_id = target_case_id;

  select
    count(*),
    count(distinct task_id),
    count(*) filter (where result = 'RISKY'),
    count(*) filter (where result = 'NOT_DONE'),
    count(*) filter (
      where greatest(coalesce(((note::jsonb)->>'requiredPhotoCount')::int, 0), 0)
          > greatest(coalesce(((note::jsonb)->>'readyPhotoCount')::int, 0), 0)
    )
    into answer_count, answered_task_count, risky_count, not_done_count, missing_required_evidence_count
  from public.inspection_item_values
  where expertise_case_id = target_case_id;

  select count(*)
    into uploaded_evidence_count
  from public.inspection_evidence_assets
  where expertise_case_id = target_case_id
    and sync_status = 'UPLOADED';

  if coalesce(answer_count, 0) = 0 then
    blocker_items := blocker_items || jsonb_build_array(jsonb_build_object(
      'label', 'Test cevabi kaydedilmedi',
      'tone', 'red'
    ));
  end if;

  if coalesce(answered_task_count, 0) < coalesce(total_task_count, 0) then
    blocker_items := blocker_items || jsonb_build_array(jsonb_build_object(
      'label', answered_task_count::text || '/' || total_task_count::text || ' gorevde cevap kaydi var',
      'tone', 'warning'
    ));
  end if;

  if coalesce(completed_task_count, 0) < coalesce(total_task_count, 0) then
    blocker_items := blocker_items || jsonb_build_array(jsonb_build_object(
      'label', completed_task_count::text || '/' || total_task_count::text || ' gorev tamamlandi',
      'tone', 'red'
    ));
  end if;

  if coalesce(not_done_count, 0) > 0 then
    blocker_items := blocker_items || jsonb_build_array(jsonb_build_object(
      'label', not_done_count::text || ' madde kontrol edilemedi',
      'tone', 'warning'
    ));
  end if;

  if coalesce(missing_required_evidence_count, 0) > 0 then
    blocker_items := blocker_items || jsonb_build_array(jsonb_build_object(
      'label', missing_required_evidence_count::text || ' maddede zorunlu kanit eksik',
      'tone', 'red'
    ));
  end if;

  can_submit := jsonb_array_length(blocker_items) = 0;

  return jsonb_build_object(
    'canSubmit', can_submit,
    'source', 'supabase',
    'caseStatus', current_case.status,
    'totalTaskCount', coalesce(total_task_count, 0),
    'completedTaskCount', coalesce(completed_task_count, 0),
    'answeredTaskCount', coalesce(answered_task_count, 0),
    'answerCount', coalesce(answer_count, 0),
    'riskyAnswerCount', coalesce(risky_count, 0),
    'notDoneAnswerCount', coalesce(not_done_count, 0),
    'missingEvidenceItemCount', coalesce(missing_required_evidence_count, 0),
    'uploadedEvidenceCount', coalesce(uploaded_evidence_count, 0),
    'pendingEvidenceCount', 0,
    'failedEvidenceCount', 0,
    'blockers', blocker_items
  );
end;
$$;

revoke all on function public.get_mobile_technical_approval_gate(uuid) from public, anon;
grant execute on function public.get_mobile_technical_approval_gate(uuid) to authenticated;
