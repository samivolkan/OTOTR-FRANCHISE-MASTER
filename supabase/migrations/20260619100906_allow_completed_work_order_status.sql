-- Simplified mobile flow: after technician completion, a work order can move
-- directly to a completed / report-ready state without the deferred technical
-- approval layer.
alter table public.expertise_cases
  drop constraint if exists expertise_cases_status_check;

alter table public.expertise_cases
  add constraint expertise_cases_status_check
  check (status = any (array[
    'DRAFT',
    'ASSIGNED',
    'CLAIMED',
    'START_EVIDENCE_REQUIRED',
    'TECHNICAL_ENTRY_OPEN',
    'SUBMITTED',
    'COMPLETED',
    'MANAGER_REVIEW',
    'REPORT_GATE_BLOCKED',
    'REPORT_GATE_READY',
    'APPROVED',
    'DELIVERED',
    'REVISION_REQUESTED',
    'CANCELLED'
  ]));
