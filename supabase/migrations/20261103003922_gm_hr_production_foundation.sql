-- OTOTR GM HR production foundation.
-- Scope: employer/branch governance, Auth/RLS boundary, personnel lifecycle,
-- operational HR, private document metadata, immutable audit, payroll/SGK shadow,
-- readiness gates and public RPC contracts.
--
-- Privacy/KVKK classification is intentionally excluded by the user. Until a
-- later reviewed migration approves that gate, real-person rows and sensitive
-- documents are rejected at the database boundary. Only Demo/Sentetik records
-- are accepted for automated acceptance and UI workflow validation.
--
-- This migration is additive. It does not delete or rewrite existing ERP data.

create schema if not exists hr;
create schema if not exists hr_private;
revoke all on schema hr from public, anon, authenticated;
revoke all on schema hr_private from public, anon, authenticated;

create extension if not exists pgcrypto with schema extensions;

create table hr.readiness_gates (
  gate_code text primary key,
  title text not null,
  status text not null check (status in ('PENDING','PASSED','BLOCKED','EXCLUDED_BY_SCOPE')),
  evidence jsonb not null default '{}'::jsonb,
  decided_by uuid references public.app_users(id),
  decided_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into hr.readiness_gates(gate_code,title,status,evidence) values
  ('EMPLOYER_SCOPE_CONFIGURED','İşveren ve şube kapsamı doğrulandı','PENDING','{}'),
  ('ROLE_MATRIX_CONFIGURED','İK rol ve onay matrisi doğrulandı','PENDING','{}'),
  ('AUTH_RLS_VERIFIED','Auth ve RLS kabul testleri geçti','PENDING','{}'),
  ('PRIVACY_POLICY_APPROVED','KVKK veri sınıflandırması ve saklama politikası onaylandı','EXCLUDED_BY_SCOPE','{"reason":"Kullanıcı talebiyle bu teslimin dışında"}'),
  ('BACKUP_RESTORE_TESTED','Yedek ve geri yükleme provası tamamlandı','PENDING','{}'),
  ('PAYROLL_SHADOW_TWO_PERIODS','İki gölge bordro dönemi mutabık kapandı','PENDING','{}'),
  ('SYNTHETIC_UAT_PASSED','Sentetik UAT kabul paketi geçti','PENDING','{}'),
  ('PRODUCTION_APPROVED','Gerçek çalışan verisi için üretim onayı','BLOCKED','{"blockedBy":"PRIVACY_POLICY_APPROVED"}')
on conflict (gate_code) do nothing;

create table hr.employers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9][A-Z0-9_-]{2,39}$'),
  legal_name text not null check (length(btrim(legal_name)) between 3 and 200),
  employer_kind text not null check (employer_kind in ('HEADQUARTERS','FRANCHISE')),
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE','SUSPENDED','ARCHIVED')),
  real_data_allowed boolean not null default false check (real_data_allowed = false),
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table hr.employer_branches (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references hr.employers(id),
  branch_id uuid not null references public.branches(id),
  effective_from date not null,
  effective_to date,
  is_primary boolean not null default true,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from)
);
create unique index hr_employer_branches_active_branch_uq
  on hr.employer_branches(branch_id)
  where status='ACTIVE' and effective_to is null and is_primary;

create table hr.departments (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references hr.employers(id),
  branch_id uuid references public.branches(id),
  parent_department_id uuid references hr.departments(id),
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,39}$'),
  name text not null check (length(btrim(name)) between 2 and 120),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ARCHIVED')),
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(employer_id,code)
);

create table hr.positions (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references hr.departments(id),
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,39}$'),
  title text not null check (length(btrim(title)) between 2 and 120),
  headcount_limit integer not null default 1 check (headcount_limit >= 0),
  employment_type text not null default 'FULL_TIME' check (employment_type in ('FULL_TIME','PART_TIME','FIXED_TERM','INTERN')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE','ARCHIVED')),
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(department_id,code)
);

create table hr.role_assignments (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id),
  role_code text not null check (role_code in ('HR_ADMIN','HR_SPECIALIST','BRANCH_HR_MANAGER','PAYROLL_OPERATOR','EMPLOYEE_SELF_SERVICE','AUDITOR')),
  employer_id uuid references hr.employers(id),
  branch_id uuid references public.branches(id),
  effective_from date not null default current_date,
  effective_to date,
  status text not null default 'PENDING' check (status in ('PENDING','ACTIVE','SUSPENDED','REVOKED')),
  granted_by uuid not null references public.app_users(id),
  approved_by uuid references public.app_users(id),
  reason text not null check (length(btrim(reason)) between 8 and 500),
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from),
  check (approved_by is null or approved_by <> app_user_id)
);
create unique index hr_role_assignments_scope_uq on hr.role_assignments(
  app_user_id,role_code,coalesce(employer_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(branch_id,'00000000-0000-0000-0000-000000000000'::uuid),effective_from
);

create table hr.candidates (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references hr.employers(id),
  branch_id uuid references public.branches(id),
  target_position_id uuid references hr.positions(id),
  display_label text not null check (length(btrim(display_label)) between 3 and 160),
  candidate_number text not null unique check (candidate_number ~ '^(DEMO|SYN)-[A-Z0-9_-]{2,64}$'),
  stage text not null default 'NEW' check (stage in ('NEW','SCREENING','INTERVIEW','OFFER','HIRED','REJECTED','WITHDRAWN')),
  is_synthetic boolean not null default true,
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table hr.employees (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid unique references public.app_users(id),
  employee_number text not null unique check (employee_number ~ '^(DEMO|SYN)-[A-Z0-9_-]{2,64}$'),
  display_label text not null check (length(btrim(display_label)) between 3 and 160),
  status text not null default 'PREBOARDING' check (status in ('PREBOARDING','ACTIVE','ON_LEAVE','SUSPENDED','OFFBOARDING','LEFT','ARCHIVED')),
  is_synthetic boolean not null default true,
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table hr.employment_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  employer_id uuid not null references hr.employers(id),
  home_branch_id uuid not null references public.branches(id),
  position_id uuid references hr.positions(id),
  manager_employee_id uuid references hr.employees(id),
  start_date date not null,
  end_date date,
  status text not null default 'PLANNED' check (status in ('PLANNED','ACTIVE','SUSPENDED','ENDED')),
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);
create unique index hr_employment_records_one_active_uq on hr.employment_records(employee_id)
  where status in ('PLANNED','ACTIVE','SUSPENDED') and end_date is null;

create table hr.assignments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  target_branch_id uuid not null references public.branches(id),
  start_date date not null,
  end_date date not null,
  allocation_percent numeric(5,2) not null default 100 check (allocation_percent > 0 and allocation_percent <= 100),
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','ACTIVE','COMPLETED','CANCELLED')),
  approved_by uuid references public.app_users(id),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  check (end_date >= start_date),
  check (approved_by is null or approved_by <> created_by)
);

create table hr.workflow_cases (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  case_type text not null check (case_type in ('ONBOARDING','TRANSFER','OFFBOARDING','ROLE_CHANGE')),
  status text not null default 'OPEN' check (status in ('OPEN','IN_PROGRESS','BLOCKED','COMPLETED','CANCELLED')),
  target_branch_id uuid references public.branches(id),
  target_position_id uuid references hr.positions(id),
  effective_date date not null,
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table hr.workflow_tasks (
  id uuid primary key default gen_random_uuid(),
  workflow_case_id uuid not null references hr.workflow_cases(id) on delete cascade,
  task_code text not null check (task_code ~ '^[A-Z0-9][A-Z0-9_]{1,63}$'),
  title text not null check (length(btrim(title)) between 3 and 160),
  owner_role text not null check (owner_role ~ '^[A-Z0-9][A-Z0-9_]{1,63}$'),
  status text not null default 'PENDING' check (status in ('PENDING','IN_PROGRESS','BLOCKED','COMPLETED','SKIPPED')),
  due_at timestamptz,
  completed_by uuid references public.app_users(id),
  completed_at timestamptz,
  evidence_hash text check (evidence_hash is null or evidence_hash ~ '^[a-f0-9]{64}$'),
  unique(workflow_case_id,task_code),
  check ((status='COMPLETED') = (completed_at is not null))
);

create table hr.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  leave_type text not null check (leave_type in ('ANNUAL','UNPAID','EXCUSE','PARENTAL','OTHER')),
  start_date date not null,
  end_date date not null,
  day_count numeric(6,2) not null check (day_count > 0),
  status text not null default 'PENDING_MANAGER' check (status in ('PENDING_MANAGER','PENDING_HR','APPROVED','REJECTED','CANCELLED')),
  manager_decided_by uuid references public.app_users(id),
  hr_decided_by uuid references public.app_users(id),
  decision_reason text check (decision_reason is null or length(btrim(decision_reason)) between 3 and 500),
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  check (manager_decided_by is null or manager_decided_by <> created_by)
);

create table hr.leave_balances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  leave_year integer not null check (leave_year between 2000 and 2200),
  leave_type text not null check (leave_type in ('ANNUAL')),
  entitled_days numeric(6,2) not null default 0 check (entitled_days >= 0),
  carried_days numeric(6,2) not null default 0 check (carried_days >= 0),
  pending_days numeric(6,2) not null default 0 check (pending_days >= 0),
  used_days numeric(6,2) not null default 0 check (used_days >= 0),
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(employee_id,leave_year,leave_type),
  check (pending_days + used_days <= entitled_days + carried_days)
);

create table hr.shift_plans (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  branch_id uuid not null references public.branches(id),
  shift_date date not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'PLANNED' check (status in ('PLANNED','PUBLISHED','CANCELLED')),
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at and ends_at <= starts_at + interval '24 hours'),
  unique(employee_id,shift_date)
);

create table hr.timesheet_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  branch_id uuid not null references public.branches(id),
  work_date date not null,
  regular_minutes integer not null default 0 check (regular_minutes between 0 and 1440),
  overtime_minutes integer not null default 0 check (overtime_minutes between 0 and 720),
  source text not null default 'MANUAL' check (source in ('MANUAL','SHIFT','DEVICE','IMPORT')),
  status text not null default 'DRAFT' check (status in ('DRAFT','SUBMITTED','APPROVED','LOCKED','REJECTED')),
  submitted_by uuid references public.app_users(id),
  approved_by uuid references public.app_users(id),
  locked_by uuid references public.app_users(id),
  locked_at timestamptz,
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(employee_id,work_date),
  check (approved_by is null or approved_by <> submitted_by),
  check ((status='LOCKED') = (locked_at is not null)),
  check (locked_by is null or (locked_by <> submitted_by and locked_by <> approved_by))
);

create table hr.certifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  certificate_code text not null check (certificate_code ~ '^[A-Z0-9][A-Z0-9_-]{2,64}$'),
  academy_reference text check (academy_reference is null or length(academy_reference) between 3 and 200),
  issued_on date not null,
  expires_on date,
  status text not null default 'VALID' check (status in ('VALID','EXPIRING','EXPIRED','REVOKED')),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  check (expires_on is null or expires_on >= issued_on),
  unique(employee_id,certificate_code,issued_on)
);

create table hr.employee_assets (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  asset_code text not null check (asset_code ~ '^[A-Z0-9][A-Z0-9_-]{2,64}$'),
  asset_label text not null check (length(btrim(asset_label)) between 3 and 160),
  assigned_at timestamptz not null default now(),
  returned_at timestamptz,
  status text not null default 'ASSIGNED' check (status in ('ASSIGNED','RETURNED','LOST','DAMAGED')),
  created_by uuid not null references public.app_users(id),
  unique(employee_id,asset_code)
);

create table hr.performance_cycles (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references hr.employers(id),
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9_-]{2,64}$'),
  starts_on date not null,
  ends_on date not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','OPEN','CALIBRATION','CLOSED')),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique(employer_id,code)
);

create table hr.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references hr.performance_cycles(id),
  employee_id uuid not null references hr.employees(id),
  reviewer_app_user_id uuid not null references public.app_users(id),
  score numeric(5,2) check (score between 0 and 100),
  status text not null default 'DRAFT' check (status in ('DRAFT','SUBMITTED','CALIBRATED','ACKNOWLEDGED')),
  evidence_hash text check (evidence_hash is null or evidence_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cycle_id,employee_id,reviewer_app_user_id)
);

create table hr.documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  document_kind text not null check (document_kind in ('CONTRACT','SGK_EVIDENCE','CERTIFICATE','ASSET_RECEIPT','IDENTITY','HEALTH','DISCIPLINARY','OTHER')),
  storage_bucket text not null default 'gm-hr-private' check (storage_bucket='gm-hr-private'),
  storage_path text not null unique,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png')),
  byte_size bigint not null check (byte_size between 1 and 10485760),
  is_synthetic boolean not null default true,
  status text not null default 'PENDING_UPLOAD' check (status in ('PENDING_UPLOAD','AVAILABLE','QUARANTINED','ARCHIVED')),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now()
);

create table hr.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references hr.employers(id),
  period_start date not null,
  period_end date not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','PREPARED','PENDING_APPROVAL','APPROVED','EXPORTED','RECONCILED','CANCELLED')),
  is_shadow boolean not null default true check (is_shadow=true),
  input_hash text check (input_hash is null or input_hash ~ '^[a-f0-9]{64}$'),
  output_hash text check (output_hash is null or output_hash ~ '^[a-f0-9]{64}$'),
  prepared_by uuid references public.app_users(id),
  approved_by uuid references public.app_users(id),
  reconciled_by uuid references public.app_users(id),
  version bigint not null default 1 check (version > 0),
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  check (approved_by is null or approved_by <> prepared_by),
  unique(employer_id,period_start,period_end)
);

create table hr.payroll_items (
  id uuid primary key default gen_random_uuid(),
  payroll_period_id uuid not null references hr.payroll_periods(id) on delete cascade,
  employee_id uuid not null references hr.employees(id),
  regular_minutes integer not null default 0 check (regular_minutes >= 0),
  overtime_minutes integer not null default 0 check (overtime_minutes >= 0),
  leave_days numeric(6,2) not null default 0 check (leave_days >= 0),
  gross_amount numeric(14,2) not null default 0 check (gross_amount >= 0),
  net_amount numeric(14,2) not null default 0 check (net_amount >= 0),
  currency_code text not null default 'TRY' check (currency_code ~ '^[A-Z]{3}$'),
  input_hash text not null check (input_hash ~ '^[a-f0-9]{64}$'),
  is_synthetic boolean not null default true,
  created_at timestamptz not null default now(),
  unique(payroll_period_id,employee_id)
);

create table hr.sgk_evidence (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references hr.employees(id),
  workflow_case_id uuid references hr.workflow_cases(id),
  evidence_type text not null check (evidence_type in ('HIRING_STATUS','TERMINATION_STATUS')),
  status text not null check (status in ('PENDING','VERIFIED','REJECTED')),
  external_reference_hash text not null check (external_reference_hash ~ '^[a-f0-9]{64}$'),
  document_id uuid references hr.documents(id),
  verified_by uuid references public.app_users(id),
  verified_at timestamptz,
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  check ((status='VERIFIED') = (verified_at is not null))
);

create table hr.approval_requests (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type ~ '^[A-Z0-9][A-Z0-9_]{1,63}$'),
  subject_id uuid not null,
  policy_code text not null check (policy_code ~ '^[A-Z0-9][A-Z0-9_]{1,63}$'),
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED','CANCELLED')),
  requested_by uuid not null references public.app_users(id),
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table hr.approval_steps (
  id uuid primary key default gen_random_uuid(),
  approval_request_id uuid not null references hr.approval_requests(id) on delete cascade,
  step_no integer not null check (step_no > 0),
  required_role text not null check (required_role ~ '^[A-Z0-9][A-Z0-9_]{1,63}$'),
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED','SKIPPED')),
  decided_by uuid references public.app_users(id),
  decided_at timestamptz,
  unique(approval_request_id,step_no),
  check ((status in ('APPROVED','REJECTED')) = (decided_at is not null))
);

create table hr.idempotency_keys (
  actor_id uuid not null references public.app_users(id),
  operation_code text not null check (operation_code ~ '^[A-Z0-9][A-Z0-9_]{1,63}$'),
  idempotency_key text not null,
  result jsonb,
  created_at timestamptz not null default now(),
  primary key(actor_id,operation_code,idempotency_key),
  check (length(idempotency_key) between 8 and 200)
);

create table hr.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.app_users(id),
  action_code text not null check (action_code ~ '^[A-Z0-9][A-Z0-9_]{1,63}$'),
  subject_type text not null check (subject_type ~ '^[A-Z0-9][A-Z0-9_]{1,63}$'),
  subject_id uuid,
  decision text not null default 'ALLOW' check (decision in ('ALLOW','DENY')),
  before_hash text,
  after_hash text,
  previous_integrity_hash text,
  integrity_hash text not null unique,
  safe_context jsonb not null default '{}'::jsonb,
  correlation_id uuid not null,
  created_at timestamptz not null default now()
);

create or replace function hr_private.touch_updated_at()
returns trigger language plpgsql set search_path='' as $$
begin
  new.updated_at=now();
  new.version=old.version+1;
  return new;
end$$;

create or replace function hr_private.prevent_mutation()
returns trigger language plpgsql set search_path='' as $$
begin
  raise exception using errcode='42501',message='immutable HR record';
end$$;

create or replace function hr_private.privacy_gate_passed()
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from hr.readiness_gates where gate_code='PRIVACY_POLICY_APPROVED' and status='PASSED')
$$;

create or replace function hr_private.guard_person_record()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if not new.is_synthetic and not hr_private.privacy_gate_passed() then
    raise exception using errcode='42501',message='real-person HR data is blocked until privacy policy approval';
  end if;
  if new.is_synthetic and not (lower(new.display_label) like 'demo %' or lower(new.display_label) like 'sentetik %') then
    raise exception using errcode='23514',message='synthetic HR labels must start with Demo or Sentetik';
  end if;
  if tg_table_name='employees' and new.is_synthetic and (to_jsonb(new)->>'employee_number') !~ '^(DEMO|SYN)-' then
    raise exception using errcode='23514',message='synthetic employee number must start with DEMO- or SYN-';
  end if;
  if tg_table_name='candidates' and new.is_synthetic and (to_jsonb(new)->>'candidate_number') !~ '^(DEMO|SYN)-' then
    raise exception using errcode='23514',message='synthetic candidate number must start with DEMO- or SYN-';
  end if;
  return new;
end$$;

create or replace function hr_private.guard_sensitive_document()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if (not new.is_synthetic or new.document_kind in ('IDENTITY','HEALTH','DISCIPLINARY')) and not hr_private.privacy_gate_passed() then
    raise exception using errcode='42501',message='sensitive HR document is blocked until privacy policy approval';
  end if;
  return new;
end$$;

create or replace function hr_private.guard_payroll_item()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if not new.is_synthetic and not hr_private.privacy_gate_passed() then
    raise exception using errcode='42501',message='real payroll item is blocked until privacy policy approval';
  end if;
  if not exists(select 1 from hr.employees e where e.id=new.employee_id and (e.is_synthetic or hr_private.privacy_gate_passed())) then
    raise exception using errcode='42501',message='payroll employee is outside the active privacy boundary';
  end if;
  return new;
end$$;

create trigger hr_candidates_person_guard before insert or update on hr.candidates for each row execute function hr_private.guard_person_record();
create trigger hr_employees_person_guard before insert or update on hr.employees for each row execute function hr_private.guard_person_record();
create trigger hr_documents_sensitive_guard before insert or update on hr.documents for each row execute function hr_private.guard_sensitive_document();
create trigger hr_payroll_items_guard before insert or update on hr.payroll_items for each row execute function hr_private.guard_payroll_item();
create trigger hr_audit_immutable before update or delete on hr.audit_events for each row execute function hr_private.prevent_mutation();

create trigger hr_employers_touch before update on hr.employers for each row execute function hr_private.touch_updated_at();
create trigger hr_departments_touch before update on hr.departments for each row execute function hr_private.touch_updated_at();
create trigger hr_positions_touch before update on hr.positions for each row execute function hr_private.touch_updated_at();
create trigger hr_candidates_touch before update on hr.candidates for each row execute function hr_private.touch_updated_at();
create trigger hr_employees_touch before update on hr.employees for each row execute function hr_private.touch_updated_at();
create trigger hr_employment_records_touch before update on hr.employment_records for each row execute function hr_private.touch_updated_at();
create trigger hr_workflow_cases_touch before update on hr.workflow_cases for each row execute function hr_private.touch_updated_at();
create trigger hr_leave_requests_touch before update on hr.leave_requests for each row execute function hr_private.touch_updated_at();
create trigger hr_leave_balances_touch before update on hr.leave_balances for each row execute function hr_private.touch_updated_at();
create trigger hr_shift_plans_touch before update on hr.shift_plans for each row execute function hr_private.touch_updated_at();
create trigger hr_timesheets_touch before update on hr.timesheet_entries for each row execute function hr_private.touch_updated_at();
create trigger hr_payroll_periods_touch before update on hr.payroll_periods for each row execute function hr_private.touch_updated_at();

create or replace function hr_private.current_actor()
returns table(app_user_id uuid,db_role text,branch_id uuid)
language sql stable security definer set search_path='' as $$
  select u.id,u.role,u.branch_id from public.app_users u
  where u.auth_user_id=auth.uid() and u.is_active
  limit 1
$$;

create or replace function hr_private.actor_has_role(p_role text,p_employer_id uuid default null,p_branch_id uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
  with actor as (select * from hr_private.current_actor())
  select exists(select 1 from actor where db_role in ('CEO','GENERAL_MANAGER'))
    or exists(
      select 1 from actor a join hr.role_assignments r on r.app_user_id=a.app_user_id
      where r.role_code=p_role and r.status='ACTIVE'
        and r.effective_from<=current_date and (r.effective_to is null or r.effective_to>=current_date)
        and ((p_employer_id is null and r.employer_id is null) or (p_employer_id is not null and (r.employer_id is null or r.employer_id=p_employer_id)))
        and ((p_branch_id is null and r.branch_id is null) or (p_branch_id is not null and (r.branch_id is null or r.branch_id=p_branch_id)))
    )
$$;

create or replace function hr_private.actor_can_manage(p_employer_id uuid,p_branch_id uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
  select hr_private.actor_has_role('HR_ADMIN',p_employer_id,p_branch_id)
      or hr_private.actor_has_role('HR_SPECIALIST',p_employer_id,p_branch_id)
      or hr_private.actor_has_role('BRANCH_HR_MANAGER',p_employer_id,p_branch_id)
$$;

create or replace function hr_private.actor_can_payroll(p_employer_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
  with actor as (select * from hr_private.current_actor())
  select exists(select 1 from actor where db_role in ('CEO','GENERAL_MANAGER','FINANCE'))
      or hr_private.actor_has_role('PAYROLL_OPERATOR',p_employer_id,null)
$$;

create or replace function hr_private.actor_can_access_employee(p_employee_id uuid,p_write boolean default false)
returns boolean language sql stable security definer set search_path='' as $$
  with scope as (
    select er.employer_id,er.home_branch_id,e.app_user_id
    from hr.employees e join hr.employment_records er on er.employee_id=e.id
    where e.id=p_employee_id and er.status in ('PLANNED','ACTIVE','SUSPENDED') and er.end_date is null
    limit 1
  ), actor as (select * from hr_private.current_actor())
  select exists(select 1 from actor a,scope s where a.app_user_id=s.app_user_id and not p_write)
      or exists(select 1 from scope s where hr_private.actor_can_manage(s.employer_id,s.home_branch_id))
$$;

create or replace function hr_private.actor_id_required()
returns uuid language plpgsql stable security definer set search_path='' as $$
declare v uuid;
begin
  select app_user_id into v from hr_private.current_actor();
  if v is null then raise exception using errcode='42501',message='active ERP user required'; end if;
  return v;
end$$;

create or replace function hr_private.claim_request(p_operation text,p_key text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=hr_private.actor_id_required();v_result jsonb;v_count integer;
begin
  if length(coalesce(p_key,'')) not between 8 and 200 then raise exception using errcode='22023',message='valid idempotency key required';end if;
  insert into hr.idempotency_keys(actor_id,operation_code,idempotency_key) values(v_actor,p_operation,p_key)
  on conflict do nothing;
  get diagnostics v_count=row_count;
  if v_count=1 then return jsonb_build_object('claimed',true);end if;
  select result into v_result from hr.idempotency_keys where actor_id=v_actor and operation_code=p_operation and idempotency_key=p_key;
  if v_result is null then raise exception using errcode='55P03',message='idempotent operation is still in progress';end if;
  return jsonb_build_object('claimed',false,'result',v_result);
end$$;

create or replace function hr_private.complete_request(p_operation text,p_key text,p_result jsonb)
returns void language plpgsql security definer set search_path='' as $$
begin
  update hr.idempotency_keys set result=p_result where actor_id=hr_private.actor_id_required() and operation_code=p_operation and idempotency_key=p_key and result is null;
  if not found then raise exception using errcode='P0002',message='idempotency claim missing';end if;
end$$;

create or replace function hr_private.write_audit(p_action text,p_subject_type text,p_subject_id uuid,p_before jsonb,p_after jsonb,p_context jsonb,p_correlation_id uuid)
returns uuid language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_actor uuid:=hr_private.actor_id_required();v_previous text;v_before text;v_after text;v_hash text;v_id uuid:=gen_random_uuid();
begin
  perform pg_advisory_xact_lock(hashtextextended('ototr-gm-hr-audit',0));
  select integrity_hash into v_previous from hr.audit_events order by created_at desc,id desc limit 1;
  v_before=case when p_before is null then null else encode(digest(convert_to(p_before::text,'UTF8'),'sha256'),'hex') end;
  v_after=case when p_after is null then null else encode(digest(convert_to(p_after::text,'UTF8'),'sha256'),'hex') end;
  v_hash=encode(digest(convert_to(coalesce(v_previous,'GENESIS')||':'||v_id::text||':'||p_action||':'||coalesce(p_subject_id::text,'')||':'||coalesce(v_before,'')||':'||coalesce(v_after,'')||':'||p_correlation_id::text,'UTF8'),'sha256'),'hex');
  insert into hr.audit_events(id,actor_id,action_code,subject_type,subject_id,before_hash,after_hash,previous_integrity_hash,integrity_hash,safe_context,correlation_id)
  values(v_id,v_actor,p_action,p_subject_type,p_subject_id,v_before,v_after,v_previous,v_hash,coalesce(p_context,'{}'::jsonb),p_correlation_id);
  return v_id;
end$$;

create or replace function hr_private.can_access_storage_object(p_name text,p_write boolean default false)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare v_employee uuid;
begin
  select d.employee_id into v_employee from hr.documents d where d.storage_bucket='gm-hr-private' and d.storage_path=p_name;
  return v_employee is not null and hr_private.actor_can_access_employee(v_employee,p_write);
end$$;

create or replace function public.hr_my_context()
returns jsonb language plpgsql stable security definer set search_path=pg_catalog as $$
declare v_actor record;v_roles jsonb;
begin
  select * into v_actor from hr_private.current_actor();
  if v_actor.app_user_id is null then raise exception using errcode='42501',message='active ERP user required';end if;
  select coalesce(jsonb_agg(jsonb_build_object('roleCode',r.role_code,'employerId',r.employer_id,'branchId',r.branch_id) order by r.role_code),'[]'::jsonb)
  into v_roles from hr.role_assignments r where r.app_user_id=v_actor.app_user_id and r.status='ACTIVE' and r.effective_from<=current_date and (r.effective_to is null or r.effective_to>=current_date);
  return jsonb_build_object('appUserId',v_actor.app_user_id,'dbRole',v_actor.db_role,'branchId',v_actor.branch_id,'hrRoles',v_roles,'realPersonDataAllowed',hr_private.privacy_gate_passed());
end$$;

create or replace function public.hr_readiness_snapshot()
returns jsonb language plpgsql stable security definer set search_path=pg_catalog as $$
begin
  perform hr_private.actor_id_required();
  return (select coalesce(jsonb_agg(jsonb_build_object('code',g.gate_code,'title',g.title,'status',g.status,'evidence',g.evidence,'decidedAt',g.decided_at) order by g.gate_code),'[]'::jsonb) from hr.readiness_gates g);
end$$;

create or replace function public.hr_dashboard()
returns jsonb language plpgsql stable security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_employee_count bigint;v_pending_leave bigint;v_open_workflows bigint;v_expiring_cert bigint;v_payroll_pending bigint;
begin
  select count(*) into v_employee_count from hr.employees e where e.status<>'ARCHIVED' and hr_private.actor_can_access_employee(e.id,false);
  select count(*) into v_pending_leave from hr.leave_requests l where l.status in ('PENDING_MANAGER','PENDING_HR') and hr_private.actor_can_access_employee(l.employee_id,false);
  select count(*) into v_open_workflows from hr.workflow_cases c where c.status in ('OPEN','IN_PROGRESS','BLOCKED') and hr_private.actor_can_access_employee(c.employee_id,false);
  select count(*) into v_expiring_cert from hr.certifications c where c.expires_on between current_date and current_date+30 and hr_private.actor_can_access_employee(c.employee_id,false);
  select count(*) into v_payroll_pending from hr.payroll_periods p where p.status in ('PREPARED','PENDING_APPROVAL') and hr_private.actor_can_payroll(p.employer_id);
  return jsonb_build_object('actorId',v_actor,'employees',v_employee_count,'pendingLeave',v_pending_leave,'openWorkflows',v_open_workflows,'expiringCertificates',v_expiring_cert,'pendingPayrollShadow',v_payroll_pending,'realDataBlocked',not hr_private.privacy_gate_passed());
end$$;

create or replace function public.hr_create_synthetic_candidate(
  p_employer_id uuid,p_branch_id uuid,p_target_position_id uuid,p_display_label text,p_candidate_number text,p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_claim jsonb;v_id uuid;v_result jsonb;v_corr uuid:=gen_random_uuid();
begin
  if not hr_private.actor_can_manage(p_employer_id,p_branch_id) then raise exception using errcode='42501',message='HR scope denied';end if;
  if not exists(select 1 from hr.employer_branches eb where eb.employer_id=p_employer_id and eb.branch_id=p_branch_id and eb.status='ACTIVE' and eb.effective_from<=current_date and (eb.effective_to is null or eb.effective_to>=current_date)) then raise exception using errcode='23503',message='active employer-branch mapping required';end if;
  v_claim=hr_private.claim_request('CREATE_CANDIDATE',p_idempotency_key);if not (v_claim->>'claimed')::boolean then return v_claim->'result';end if;
  insert into hr.candidates(employer_id,branch_id,target_position_id,display_label,candidate_number,is_synthetic,created_by)
  values(p_employer_id,p_branch_id,p_target_position_id,btrim(p_display_label),upper(btrim(p_candidate_number)),true,v_actor) returning id into v_id;
  perform hr_private.write_audit('CANDIDATE_CREATED','CANDIDATE',v_id,null,jsonb_build_object('stage','NEW','synthetic',true),jsonb_build_object('employerId',p_employer_id,'branchId',p_branch_id),v_corr);
  v_result=jsonb_build_object('outcome','CREATED','candidateId',v_id,'stage','NEW','correlationId',v_corr);perform hr_private.complete_request('CREATE_CANDIDATE',p_idempotency_key,v_result);return v_result;
end$$;

create or replace function public.hr_convert_candidate(
  p_candidate_id uuid,p_employee_number text,p_start_date date,p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_candidate hr.candidates%rowtype;v_claim jsonb;v_employee uuid;v_employment uuid;v_case uuid;v_result jsonb;v_corr uuid:=gen_random_uuid();
begin
  v_claim=hr_private.claim_request('CONVERT_CANDIDATE',p_idempotency_key);if not (v_claim->>'claimed')::boolean then return v_claim->'result';end if;
  select * into v_candidate from hr.candidates where id=p_candidate_id for update;if not found then raise exception using errcode='P0002',message='candidate not found';end if;
  if not hr_private.actor_can_manage(v_candidate.employer_id,v_candidate.branch_id) then raise exception using errcode='42501',message='HR scope denied';end if;
  if v_candidate.stage in ('HIRED','REJECTED','WITHDRAWN') then raise exception using errcode='23514',message='candidate stage cannot be converted';end if;
  insert into hr.employees(employee_number,display_label,status,is_synthetic,created_by) values(upper(btrim(p_employee_number)),v_candidate.display_label,'PREBOARDING',true,v_actor) returning id into v_employee;
  insert into hr.employment_records(employee_id,employer_id,home_branch_id,position_id,start_date,status,created_by) values(v_employee,v_candidate.employer_id,v_candidate.branch_id,v_candidate.target_position_id,p_start_date,'PLANNED',v_actor) returning id into v_employment;
  insert into hr.workflow_cases(employee_id,case_type,status,effective_date,created_by) values(v_employee,'ONBOARDING','IN_PROGRESS',p_start_date,v_actor) returning id into v_case;
  insert into hr.workflow_tasks(workflow_case_id,task_code,title,owner_role) values
    (v_case,'EMPLOYMENT_CONTRACT','İş sözleşmesi kontrolü','HR_SPECIALIST'),
    (v_case,'SGK_HIRING_VERIFICATION','SGK işe giriş durum kanıtı','HR_SPECIALIST'),
    (v_case,'ACADEMY_ASSIGNMENT','Zorunlu Academy paketleri','HR_SPECIALIST'),
    (v_case,'ACCESS_PROVISIONING','ERP ve şube erişimlerinin açılması','HR_ADMIN'),
    (v_case,'ASSET_HANDOVER','Zimmet teslimi','BRANCH_HR_MANAGER');
  update hr.candidates set stage='HIRED' where id=v_candidate.id;
  perform hr_private.write_audit('CANDIDATE_CONVERTED','EMPLOYEE',v_employee,jsonb_build_object('candidateStage',v_candidate.stage),jsonb_build_object('employeeStatus','PREBOARDING','workflowCaseId',v_case),jsonb_build_object('candidateId',v_candidate.id,'employmentId',v_employment),v_corr);
  v_result=jsonb_build_object('outcome','CONVERTED','employeeId',v_employee,'employmentId',v_employment,'workflowCaseId',v_case,'correlationId',v_corr);perform hr_private.complete_request('CONVERT_CANDIDATE',p_idempotency_key,v_result);return v_result;
end$$;

create or replace function public.hr_start_workflow(
  p_employee_id uuid,p_case_type text,p_effective_date date,p_target_branch_id uuid default null,p_target_position_id uuid default null,p_idempotency_key text default null
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_scope record;v_case uuid;v_claim jsonb;v_result jsonb;v_corr uuid:=gen_random_uuid();
begin
  if p_case_type not in ('TRANSFER','OFFBOARDING','ROLE_CHANGE') then raise exception using errcode='22023',message='unsupported workflow type';end if;
  v_claim=hr_private.claim_request('START_'||p_case_type,p_idempotency_key);if not (v_claim->>'claimed')::boolean then return v_claim->'result';end if;
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=p_employee_id and er.status in ('PLANNED','ACTIVE','SUSPENDED') and er.end_date is null for update;
  if v_scope.employer_id is null then raise exception using errcode='P0002',message='active employment not found';end if;
  if not hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id) then raise exception using errcode='42501',message='HR scope denied';end if;
  insert into hr.workflow_cases(employee_id,case_type,status,target_branch_id,target_position_id,effective_date,created_by) values(p_employee_id,p_case_type,'IN_PROGRESS',p_target_branch_id,p_target_position_id,p_effective_date,v_actor) returning id into v_case;
  if p_case_type='OFFBOARDING' then
    insert into hr.workflow_tasks(workflow_case_id,task_code,title,owner_role) values
      (v_case,'SGK_TERMINATION_VERIFICATION','SGK ayrılış durum kanıtı','HR_SPECIALIST'),(v_case,'ASSET_RETURN','Tüm zimmetlerin iadesi','BRANCH_HR_MANAGER'),(v_case,'ACCESS_REVOCATION','ERP ve şube erişimlerini kapatma','HR_ADMIN'),(v_case,'WORK_HANDOVER','Açık işlerin devri','BRANCH_HR_MANAGER');
    update hr.employees set status='OFFBOARDING' where id=p_employee_id;
  elsif p_case_type='TRANSFER' then
    insert into hr.workflow_tasks(workflow_case_id,task_code,title,owner_role) values(v_case,'TARGET_SCOPE_APPROVAL','Hedef şube ve kadro onayı','HR_ADMIN'),(v_case,'ACCESS_SCOPE_CHANGE','Erişim kapsamı güncellemesi','HR_ADMIN'),(v_case,'HANDOVER','Görev devri','BRANCH_HR_MANAGER');
  else
    insert into hr.workflow_tasks(workflow_case_id,task_code,title,owner_role) values(v_case,'ROLE_APPROVAL','Rol değişikliği onayı','HR_ADMIN'),(v_case,'SOD_REVIEW','Görev ayrılığı kontrolü','AUDITOR'),(v_case,'ACCESS_ROLE_CHANGE','Erişim rolü güncellemesi','HR_ADMIN');
  end if;
  perform hr_private.write_audit('WORKFLOW_STARTED','WORKFLOW_CASE',v_case,null,jsonb_build_object('type',p_case_type,'effectiveDate',p_effective_date),jsonb_build_object('employeeId',p_employee_id),v_corr);
  v_result=jsonb_build_object('outcome','STARTED','workflowCaseId',v_case,'caseType',p_case_type,'correlationId',v_corr);perform hr_private.complete_request('START_'||p_case_type,p_idempotency_key,v_result);return v_result;
end$$;

create or replace function public.hr_complete_workflow_task(
  p_workflow_case_id uuid,p_task_code text,p_evidence_hash text default null
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_case hr.workflow_cases%rowtype;v_scope record;v_remaining bigint;v_corr uuid:=gen_random_uuid();
begin
  select * into v_case from hr.workflow_cases where id=p_workflow_case_id for update;if not found then raise exception using errcode='P0002',message='workflow case not found';end if;
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=v_case.employee_id and er.status in ('PLANNED','ACTIVE','SUSPENDED') and er.end_date is null;
  if not hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id) then raise exception using errcode='42501',message='HR scope denied';end if;
  update hr.workflow_tasks set status='COMPLETED',completed_by=v_actor,completed_at=now(),evidence_hash=p_evidence_hash where workflow_case_id=v_case.id and task_code=p_task_code and status<>'COMPLETED';
  if not found then raise exception using errcode='P0002',message='pending workflow task not found';end if;
  select count(*) into v_remaining from hr.workflow_tasks where workflow_case_id=v_case.id and status not in ('COMPLETED','SKIPPED');
  if v_remaining=0 then
    if v_case.case_type='ONBOARDING' and not exists(select 1 from hr.sgk_evidence s where s.workflow_case_id=v_case.id and s.evidence_type='HIRING_STATUS' and s.status='VERIFIED') then
      update hr.workflow_cases set status='BLOCKED' where id=v_case.id;
      perform hr_private.write_audit('WORKFLOW_BLOCKED','WORKFLOW_CASE',v_case.id,null,jsonb_build_object('reason','VERIFIED_SGK_HIRING_EVIDENCE_REQUIRED'),jsonb_build_object('employeeId',v_case.employee_id),v_corr);
      return jsonb_build_object('outcome','BLOCKED','workflowCaseId',v_case.id,'reason','VERIFIED_SGK_HIRING_EVIDENCE_REQUIRED','correlationId',v_corr);
    elsif v_case.case_type='OFFBOARDING' and (exists(select 1 from hr.employee_assets a where a.employee_id=v_case.employee_id and a.status='ASSIGNED') or not exists(select 1 from hr.sgk_evidence s where s.workflow_case_id=v_case.id and s.evidence_type='TERMINATION_STATUS' and s.status='VERIFIED')) then
      update hr.workflow_cases set status='BLOCKED' where id=v_case.id;
      perform hr_private.write_audit('WORKFLOW_BLOCKED','WORKFLOW_CASE',v_case.id,null,jsonb_build_object('reason','ASSET_AND_SGK_TERMINATION_EVIDENCE_REQUIRED'),jsonb_build_object('employeeId',v_case.employee_id),v_corr);
      return jsonb_build_object('outcome','BLOCKED','workflowCaseId',v_case.id,'reason','ASSET_AND_SGK_TERMINATION_EVIDENCE_REQUIRED','correlationId',v_corr);
    end if;
    update hr.workflow_cases set status='COMPLETED' where id=v_case.id;
    if v_case.case_type='ONBOARDING' then update hr.employees set status='ACTIVE' where id=v_case.employee_id;update hr.employment_records set status='ACTIVE' where employee_id=v_case.employee_id and status='PLANNED';
    elsif v_case.case_type='OFFBOARDING' then update hr.employees set status='LEFT' where id=v_case.employee_id;update hr.employment_records set status='ENDED',end_date=v_case.effective_date where employee_id=v_case.employee_id and end_date is null;
    elsif v_case.case_type in ('TRANSFER','ROLE_CHANGE') then update hr.employment_records set home_branch_id=coalesce(v_case.target_branch_id,home_branch_id),position_id=coalesce(v_case.target_position_id,position_id) where employee_id=v_case.employee_id and end_date is null;end if;
  end if;
  perform hr_private.write_audit('WORKFLOW_TASK_COMPLETED','WORKFLOW_CASE',v_case.id,null,jsonb_build_object('taskCode',p_task_code,'remaining',v_remaining),jsonb_build_object('employeeId',v_case.employee_id),v_corr);
  return jsonb_build_object('outcome','COMPLETED','workflowCaseId',v_case.id,'remainingTasks',v_remaining,'correlationId',v_corr);
end$$;

create or replace function public.hr_upsert_leave_balance(
  p_employee_id uuid,p_leave_year integer,p_entitled_days numeric,p_carried_days numeric default 0
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_scope record;v_id uuid;v_corr uuid:=gen_random_uuid();
begin
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=p_employee_id and er.end_date is null limit 1;
  if v_scope.employer_id is null or not hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id) then raise exception using errcode='42501',message='leave balance scope denied';end if;
  if p_leave_year not between 2000 and 2200 or p_entitled_days<0 or p_carried_days<0 or p_entitled_days*2<>trunc(p_entitled_days*2) or p_carried_days*2<>trunc(p_carried_days*2) then raise exception using errcode='22023',message='invalid leave balance';end if;
  insert into hr.leave_balances(employee_id,leave_year,leave_type,entitled_days,carried_days,created_by)
  values(p_employee_id,p_leave_year,'ANNUAL',p_entitled_days,p_carried_days,v_actor)
  on conflict(employee_id,leave_year,leave_type) do update set entitled_days=excluded.entitled_days,carried_days=excluded.carried_days
  returning id into v_id;
  perform hr_private.write_audit('LEAVE_BALANCE_UPSERTED','LEAVE_BALANCE',v_id,null,jsonb_build_object('year',p_leave_year,'entitledDays',p_entitled_days,'carriedDays',p_carried_days),jsonb_build_object('employeeId',p_employee_id),v_corr);
  return jsonb_build_object('outcome','UPSERTED','leaveBalanceId',v_id,'correlationId',v_corr);
end$$;

create or replace function public.hr_submit_leave_request(
  p_employee_id uuid,p_leave_type text,p_start_date date,p_end_date date,p_day_count numeric,p_idempotency_key text
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_self uuid;v_employer uuid;v_branch uuid;v_claim jsonb;v_id uuid;v_corr uuid:=gen_random_uuid();v_result jsonb;
begin
  select e.app_user_id,er.employer_id,er.home_branch_id into v_self,v_employer,v_branch from hr.employees e join hr.employment_records er on er.employee_id=e.id where e.id=p_employee_id and er.end_date is null limit 1;
  if v_self is null and v_employer is null then raise exception using errcode='P0002',message='employee not found';end if;
  if v_actor<>coalesce(v_self,'00000000-0000-0000-0000-000000000000'::uuid) and not hr_private.actor_can_manage(v_employer,v_branch) then raise exception using errcode='42501',message='leave scope denied';end if;
  v_claim=hr_private.claim_request('SUBMIT_LEAVE',p_idempotency_key);if not (v_claim->>'claimed')::boolean then return v_claim->'result';end if;
  if p_end_date<p_start_date or p_day_count<=0 or p_day_count*2<>trunc(p_day_count*2) or p_day_count>(p_end_date-p_start_date+1) then raise exception using errcode='22023',message='invalid leave date or half-day count';end if;
  if p_leave_type='ANNUAL' and extract(year from p_start_date)<>extract(year from p_end_date) then raise exception using errcode='22023',message='annual leave request must stay within one balance year';end if;
  perform pg_advisory_xact_lock(hashtextextended('hr-leave:'||p_employee_id::text,extract(year from p_start_date)::bigint));
  if exists(select 1 from hr.leave_requests l where l.employee_id=p_employee_id and l.status in ('PENDING_MANAGER','PENDING_HR','APPROVED') and daterange(l.start_date,l.end_date,'[]') && daterange(p_start_date,p_end_date,'[]')) then raise exception using errcode='23P01',message='overlapping active leave request';end if;
  if p_leave_type='ANNUAL' then
    update hr.leave_balances set pending_days=pending_days+p_day_count
    where employee_id=p_employee_id and leave_year=extract(year from p_start_date)::integer and leave_type='ANNUAL'
      and entitled_days+carried_days-used_days-pending_days>=p_day_count;
    if not found then raise exception using errcode='23514',message='insufficient or missing annual leave balance';end if;
  end if;
  insert into hr.leave_requests(employee_id,leave_type,start_date,end_date,day_count,created_by) values(p_employee_id,p_leave_type,p_start_date,p_end_date,p_day_count,v_actor) returning id into v_id;
  perform hr_private.write_audit('LEAVE_SUBMITTED','LEAVE_REQUEST',v_id,null,jsonb_build_object('status','PENDING_MANAGER','dayCount',p_day_count),jsonb_build_object('employeeId',p_employee_id),v_corr);
  v_result=jsonb_build_object('outcome','SUBMITTED','leaveRequestId',v_id,'status','PENDING_MANAGER','correlationId',v_corr);perform hr_private.complete_request('SUBMIT_LEAVE',p_idempotency_key,v_result);return v_result;
end$$;

create or replace function public.hr_decide_leave_request(p_leave_request_id uuid,p_decision text,p_reason text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor record;v_req hr.leave_requests%rowtype;v_scope record;v_next text;v_corr uuid:=gen_random_uuid();
begin
  select * into v_actor from hr_private.current_actor();if v_actor.app_user_id is null then raise exception using errcode='42501',message='active ERP user required';end if;
  if p_decision not in ('APPROVE','REJECT') then raise exception using errcode='22023',message='invalid leave decision';end if;
  select * into v_req from hr.leave_requests where id=p_leave_request_id for update;if not found then raise exception using errcode='P0002',message='leave request not found';end if;
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=v_req.employee_id and er.end_date is null limit 1;
  if v_req.status='PENDING_MANAGER' then
    if not ((v_actor.db_role='BRANCH_MANAGER' and v_actor.branch_id=v_scope.home_branch_id) or hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id)) then raise exception using errcode='42501',message='manager decision denied';end if;
    if v_actor.app_user_id=v_req.created_by then raise exception using errcode='42501',message='requester cannot approve own leave';end if;
    v_next=case when p_decision='APPROVE' then 'PENDING_HR' else 'REJECTED' end;
    update hr.leave_requests set status=v_next,manager_decided_by=v_actor.app_user_id,decision_reason=p_reason where id=v_req.id;
  elsif v_req.status='PENDING_HR' then
    if not hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id) then raise exception using errcode='42501',message='HR decision denied';end if;
    if v_actor.app_user_id in (v_req.created_by,v_req.manager_decided_by) then raise exception using errcode='42501',message='four-eyes leave approval required';end if;
    v_next=case when p_decision='APPROVE' then 'APPROVED' else 'REJECTED' end;
    update hr.leave_requests set status=v_next,hr_decided_by=v_actor.app_user_id,decision_reason=p_reason where id=v_req.id;
  else raise exception using errcode='23514',message='leave request is not pending';end if;
  if v_req.leave_type='ANNUAL' and v_next in ('APPROVED','REJECTED') then
    update hr.leave_balances set pending_days=pending_days-v_req.day_count,used_days=used_days+case when v_next='APPROVED' then v_req.day_count else 0 end
    where employee_id=v_req.employee_id and leave_year=extract(year from v_req.start_date)::integer and leave_type='ANNUAL' and pending_days>=v_req.day_count;
    if not found then raise exception using errcode='23514',message='annual leave balance reservation missing';end if;
  end if;
  perform hr_private.write_audit('LEAVE_DECIDED','LEAVE_REQUEST',v_req.id,jsonb_build_object('status',v_req.status),jsonb_build_object('status',v_next),jsonb_build_object('decision',p_decision),v_corr);
  return jsonb_build_object('outcome','DECIDED','leaveRequestId',v_req.id,'status',v_next,'correlationId',v_corr);
end$$;

create or replace function public.hr_upsert_shift(
  p_employee_id uuid,p_branch_id uuid,p_shift_date date,p_starts_at timestamptz,p_ends_at timestamptz
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_scope record;v_id uuid;v_corr uuid:=gen_random_uuid();
begin
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=p_employee_id and er.end_date is null limit 1;
  if not hr_private.actor_can_manage(v_scope.employer_id,p_branch_id) then raise exception using errcode='42501',message='shift scope denied';end if;
  if (p_starts_at at time zone 'Europe/Istanbul')::date<>p_shift_date or p_ends_at<=p_starts_at or p_ends_at>p_starts_at+interval '24 hours' then raise exception using errcode='22023',message='invalid Europe/Istanbul shift interval';end if;
  if p_branch_id<>v_scope.home_branch_id and not exists(select 1 from hr.assignments a where a.employee_id=p_employee_id and a.target_branch_id=p_branch_id and a.status in ('APPROVED','ACTIVE') and p_shift_date between a.start_date and a.end_date) then raise exception using errcode='42501',message='approved assignment required for target branch shift';end if;
  insert into hr.shift_plans(employee_id,branch_id,shift_date,starts_at,ends_at,created_by) values(p_employee_id,p_branch_id,p_shift_date,p_starts_at,p_ends_at,hr_private.actor_id_required())
  on conflict(employee_id,shift_date) do update set branch_id=excluded.branch_id,starts_at=excluded.starts_at,ends_at=excluded.ends_at,status='PLANNED' returning id into v_id;
  perform hr_private.write_audit('SHIFT_UPSERTED','SHIFT_PLAN',v_id,null,jsonb_build_object('shiftDate',p_shift_date),jsonb_build_object('employeeId',p_employee_id,'branchId',p_branch_id),v_corr);
  return jsonb_build_object('outcome','UPSERTED','shiftPlanId',v_id,'correlationId',v_corr);
end$$;

create or replace function public.hr_record_timesheet(
  p_employee_id uuid,p_branch_id uuid,p_work_date date,p_regular_minutes integer,p_overtime_minutes integer,p_target_status text
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor record;v_self uuid;v_employer uuid;v_home_branch uuid;v_current hr.timesheet_entries%rowtype;v_id uuid;v_corr uuid:=gen_random_uuid();
begin
  select * into v_actor from hr_private.current_actor();if v_actor.app_user_id is null then raise exception using errcode='42501',message='active ERP user required';end if;
  select e.app_user_id,er.employer_id,er.home_branch_id into v_self,v_employer,v_home_branch from hr.employees e join hr.employment_records er on er.employee_id=e.id where e.id=p_employee_id and er.end_date is null limit 1;
  if v_employer is null then raise exception using errcode='P0002',message='active employee not found';end if;
  if p_branch_id<>v_home_branch and not exists(select 1 from hr.assignments a where a.employee_id=p_employee_id and a.target_branch_id=p_branch_id and a.status in ('APPROVED','ACTIVE') and p_work_date between a.start_date and a.end_date) then raise exception using errcode='42501',message='approved assignment required for target branch timesheet';end if;
  select * into v_current from hr.timesheet_entries where employee_id=p_employee_id and work_date=p_work_date for update;
  if p_target_status in ('DRAFT','SUBMITTED') then
    if v_actor.app_user_id<>coalesce(v_self,'00000000-0000-0000-0000-000000000000'::uuid) and not hr_private.actor_can_manage(v_employer,p_branch_id) then raise exception using errcode='42501',message='timesheet submit denied';end if;
    if v_current.id is not null and v_current.status in ('APPROVED','LOCKED') then raise exception using errcode='23514',message='approved or locked timesheet cannot return to draft';end if;
  elsif p_target_status='APPROVED' then
    if not ((v_actor.db_role='BRANCH_MANAGER' and v_actor.branch_id=p_branch_id) or hr_private.actor_can_manage(v_employer,p_branch_id)) then raise exception using errcode='42501',message='timesheet approval denied';end if;
    if v_current.id is null or v_current.status<>'SUBMITTED' then raise exception using errcode='23514',message='submitted timesheet required for approval';end if;
    if v_actor.app_user_id=coalesce(v_current.submitted_by,v_current.created_by) then raise exception using errcode='42501',message='four-eyes timesheet approval required';end if;
  elsif p_target_status='LOCKED' then
    if not hr_private.actor_can_payroll(v_employer) then raise exception using errcode='42501',message='timesheet lock denied';end if;
    if v_current.id is null or v_current.status<>'APPROVED' then raise exception using errcode='23514',message='approved timesheet required for lock';end if;
    if v_actor.app_user_id in (coalesce(v_current.submitted_by,v_current.created_by),v_current.approved_by) then raise exception using errcode='42501',message='independent timesheet lock required';end if;
  else raise exception using errcode='22023',message='invalid timesheet target status';end if;
  if v_current.id is not null and p_target_status in ('APPROVED','LOCKED') and (v_current.branch_id<>p_branch_id or v_current.regular_minutes<>p_regular_minutes or v_current.overtime_minutes<>p_overtime_minutes) then raise exception using errcode='23514',message='approval cannot alter submitted timesheet values';end if;
  insert into hr.timesheet_entries(employee_id,branch_id,work_date,regular_minutes,overtime_minutes,status,submitted_by,approved_by,locked_by,locked_at,created_by)
  values(p_employee_id,p_branch_id,p_work_date,p_regular_minutes,p_overtime_minutes,p_target_status,case when p_target_status='SUBMITTED' then v_actor.app_user_id end,case when p_target_status='APPROVED' then v_actor.app_user_id end,case when p_target_status='LOCKED' then v_actor.app_user_id end,case when p_target_status='LOCKED' then now() end,v_actor.app_user_id)
  on conflict(employee_id,work_date) do update set branch_id=excluded.branch_id,regular_minutes=excluded.regular_minutes,overtime_minutes=excluded.overtime_minutes,status=excluded.status,submitted_by=coalesce(hr.timesheet_entries.submitted_by,excluded.submitted_by),approved_by=case when excluded.status='APPROVED' then excluded.approved_by else hr.timesheet_entries.approved_by end,locked_by=case when excluded.status='LOCKED' then excluded.locked_by else hr.timesheet_entries.locked_by end,locked_at=case when excluded.status='LOCKED' then excluded.locked_at else hr.timesheet_entries.locked_at end returning id into v_id;
  perform hr_private.write_audit('TIMESHEET_'||p_target_status,'TIMESHEET',v_id,null,jsonb_build_object('status',p_target_status,'regularMinutes',p_regular_minutes,'overtimeMinutes',p_overtime_minutes),jsonb_build_object('employeeId',p_employee_id),v_corr);
  return jsonb_build_object('outcome',p_target_status,'timesheetId',v_id,'correlationId',v_corr);
end$$;

create or replace function public.hr_create_payroll_shadow_period(p_employer_id uuid,p_period_start date,p_period_end date,p_idempotency_key text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_claim jsonb;v_id uuid;v_result jsonb;v_corr uuid:=gen_random_uuid();
begin
  if not hr_private.actor_can_payroll(p_employer_id) then raise exception using errcode='42501',message='payroll scope denied';end if;
  v_claim=hr_private.claim_request('CREATE_PAYROLL_SHADOW',p_idempotency_key);if not (v_claim->>'claimed')::boolean then return v_claim->'result';end if;
  insert into hr.payroll_periods(employer_id,period_start,period_end,created_by) values(p_employer_id,p_period_start,p_period_end,v_actor) returning id into v_id;
  perform hr_private.write_audit('PAYROLL_SHADOW_CREATED','PAYROLL_PERIOD',v_id,null,jsonb_build_object('status','DRAFT','shadow',true),jsonb_build_object('employerId',p_employer_id),v_corr);
  v_result=jsonb_build_object('outcome','CREATED','payrollPeriodId',v_id,'status','DRAFT','correlationId',v_corr);perform hr_private.complete_request('CREATE_PAYROLL_SHADOW',p_idempotency_key,v_result);return v_result;
end$$;

create or replace function public.hr_prepare_payroll_shadow(p_payroll_period_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_actor uuid:=hr_private.actor_id_required();v_period hr.payroll_periods%rowtype;v_hash text;v_count bigint;v_corr uuid:=gen_random_uuid();
begin
  select * into v_period from hr.payroll_periods where id=p_payroll_period_id for update;if not found then raise exception using errcode='P0002',message='payroll period not found';end if;
  if not hr_private.actor_can_payroll(v_period.employer_id) then raise exception using errcode='42501',message='payroll scope denied';end if;
  if v_period.status<>'DRAFT' then raise exception using errcode='23514',message='payroll period must be draft';end if;
  insert into hr.payroll_items(payroll_period_id,employee_id,regular_minutes,overtime_minutes,leave_days,gross_amount,net_amount,input_hash,is_synthetic)
  select v_period.id,e.id,coalesce(sum(t.regular_minutes),0)::integer,coalesce(sum(t.overtime_minutes),0)::integer,
    coalesce((select sum(l.day_count) from hr.leave_requests l where l.employee_id=e.id and l.status='APPROVED' and l.start_date<=v_period.period_end and l.end_date>=v_period.period_start),0),0,0,
    encode(digest(convert_to(e.id::text||':'||coalesce(sum(t.regular_minutes),0)::text||':'||coalesce(sum(t.overtime_minutes),0)::text,'UTF8'),'sha256'),'hex'),true
  from hr.employees e join hr.employment_records er on er.employee_id=e.id and er.employer_id=v_period.employer_id and er.end_date is null
  left join hr.timesheet_entries t on t.employee_id=e.id and t.work_date between v_period.period_start and v_period.period_end and t.status in ('APPROVED','LOCKED')
  where e.is_synthetic group by e.id
  on conflict(payroll_period_id,employee_id) do update set regular_minutes=excluded.regular_minutes,overtime_minutes=excluded.overtime_minutes,leave_days=excluded.leave_days,input_hash=excluded.input_hash;
  select count(*),encode(digest(convert_to(coalesce(string_agg(i.employee_id::text||':'||i.input_hash,'|' order by i.employee_id),'EMPTY'),'UTF8'),'sha256'),'hex') into v_count,v_hash from hr.payroll_items i where i.payroll_period_id=v_period.id;
  update hr.payroll_periods set status='PENDING_APPROVAL',prepared_by=v_actor,input_hash=v_hash,output_hash=v_hash where id=v_period.id;
  perform hr_private.write_audit('PAYROLL_SHADOW_PREPARED','PAYROLL_PERIOD',v_period.id,jsonb_build_object('status',v_period.status),jsonb_build_object('status','PENDING_APPROVAL','itemCount',v_count,'snapshotHash',v_hash),jsonb_build_object('employerId',v_period.employer_id),v_corr);
  return jsonb_build_object('outcome','PREPARED','payrollPeriodId',v_period.id,'status','PENDING_APPROVAL','itemCount',v_count,'snapshotHash',v_hash,'correlationId',v_corr);
end$$;

create or replace function public.hr_approve_payroll_shadow(p_payroll_period_id uuid,p_decision text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_period hr.payroll_periods%rowtype;v_next text;v_corr uuid:=gen_random_uuid();
begin
  select * into v_period from hr.payroll_periods where id=p_payroll_period_id for update;if not found then raise exception using errcode='P0002',message='payroll period not found';end if;
  if not hr_private.actor_can_payroll(v_period.employer_id) then raise exception using errcode='42501',message='payroll scope denied';end if;
  if v_period.status<>'PENDING_APPROVAL' then raise exception using errcode='23514',message='payroll period is not pending approval';end if;
  if v_actor=v_period.prepared_by then raise exception using errcode='42501',message='four-eyes payroll approval required';end if;
  v_next=case when p_decision='APPROVE' then 'APPROVED' when p_decision='REJECT' then 'DRAFT' else null end;if v_next is null then raise exception using errcode='22023',message='invalid payroll decision';end if;
  update hr.payroll_periods set status=v_next,approved_by=case when v_next='APPROVED' then v_actor else null end where id=v_period.id;
  perform hr_private.write_audit('PAYROLL_SHADOW_DECIDED','PAYROLL_PERIOD',v_period.id,jsonb_build_object('status',v_period.status),jsonb_build_object('status',v_next),jsonb_build_object('decision',p_decision),v_corr);
  return jsonb_build_object('outcome','DECIDED','payrollPeriodId',v_period.id,'status',v_next,'correlationId',v_corr);
end$$;

create or replace function public.hr_reconcile_payroll_shadow(p_payroll_period_id uuid,p_export_hash text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_period hr.payroll_periods%rowtype;v_count bigint;v_corr uuid:=gen_random_uuid();
begin
  if p_export_hash !~ '^[a-f0-9]{64}$' then raise exception using errcode='22023',message='valid export hash required';end if;
  select * into v_period from hr.payroll_periods where id=p_payroll_period_id for update;if not found then raise exception using errcode='P0002',message='payroll period not found';end if;
  if not hr_private.actor_can_payroll(v_period.employer_id) then raise exception using errcode='42501',message='payroll scope denied';end if;
  if v_period.status<>'APPROVED' or v_actor in (v_period.prepared_by,v_period.approved_by) then raise exception using errcode='42501',message='independent payroll reconciliation required';end if;
  update hr.payroll_periods set status='RECONCILED',reconciled_by=v_actor,output_hash=p_export_hash where id=v_period.id;
  select count(*) into v_count from hr.payroll_periods where employer_id=v_period.employer_id and status='RECONCILED' and is_shadow;
  if v_count>=2 then update hr.readiness_gates set status='PASSED',evidence=jsonb_build_object('employerId',v_period.employer_id,'reconciledPeriods',v_count),decided_by=v_actor,decided_at=now(),updated_at=now() where gate_code='PAYROLL_SHADOW_TWO_PERIODS';end if;
  perform hr_private.write_audit('PAYROLL_SHADOW_RECONCILED','PAYROLL_PERIOD',v_period.id,jsonb_build_object('status',v_period.status),jsonb_build_object('status','RECONCILED','outputHash',p_export_hash),jsonb_build_object('reconciledPeriods',v_count),v_corr);
  return jsonb_build_object('outcome','RECONCILED','payrollPeriodId',v_period.id,'reconciledPeriods',v_count,'correlationId',v_corr);
end$$;

create or replace function public.hr_register_document(
  p_employee_id uuid,p_document_kind text,p_content_hash text,p_mime_type text,p_byte_size bigint,p_file_name text
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_scope record;v_id uuid:=gen_random_uuid();v_path text;v_corr uuid:=gen_random_uuid();
begin
  select er.employer_id,er.home_branch_id,e.is_synthetic into v_scope from hr.employees e join hr.employment_records er on er.employee_id=e.id where e.id=p_employee_id and er.end_date is null limit 1;
  if not hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id) then raise exception using errcode='42501',message='document scope denied';end if;
  if not v_scope.is_synthetic or p_document_kind in ('IDENTITY','HEALTH','DISCIPLINARY') then raise exception using errcode='42501',message='real or sensitive document registration is blocked until privacy policy approval';end if;
  v_path=v_scope.employer_id::text||'/'||p_employee_id::text||'/'||v_id::text||'/'||regexp_replace(lower(p_file_name),'[^a-z0-9._-]+','-','g');
  insert into hr.documents(id,employee_id,document_kind,storage_path,content_hash,mime_type,byte_size,is_synthetic,created_by) values(v_id,p_employee_id,p_document_kind,v_path,lower(p_content_hash),p_mime_type,p_byte_size,true,v_actor);
  perform hr_private.write_audit('DOCUMENT_REGISTERED','DOCUMENT',v_id,null,jsonb_build_object('kind',p_document_kind,'contentHash',lower(p_content_hash),'byteSize',p_byte_size),jsonb_build_object('employeeId',p_employee_id),v_corr);
  return jsonb_build_object('outcome','REGISTERED','documentId',v_id,'bucket','gm-hr-private','storagePath',v_path,'correlationId',v_corr);
end$$;

create or replace function public.hr_mark_readiness_gate(p_gate_code text,p_status text,p_evidence jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor record;v_corr uuid:=gen_random_uuid();
begin
  select * into v_actor from hr_private.current_actor();if v_actor.app_user_id is null or v_actor.db_role not in ('CEO','GENERAL_MANAGER') then raise exception using errcode='42501',message='HQ readiness authority required';end if;
  if p_gate_code in ('PRIVACY_POLICY_APPROVED','PRODUCTION_APPROVED','PAYROLL_SHADOW_TWO_PERIODS') then raise exception using errcode='42501',message='gate requires its dedicated reviewed workflow';end if;
  if p_status not in ('PENDING','PASSED','BLOCKED') or coalesce(p_evidence,'{}'::jsonb)='{}'::jsonb then raise exception using errcode='22023',message='readiness evidence required';end if;
  update hr.readiness_gates set status=p_status,evidence=p_evidence,decided_by=v_actor.app_user_id,decided_at=now(),updated_at=now() where gate_code=p_gate_code;
  if not found then raise exception using errcode='P0002',message='readiness gate not found';end if;
  perform hr_private.write_audit('READINESS_GATE_MARKED','READINESS_GATE',null,null,jsonb_build_object('gateCode',p_gate_code,'status',p_status),p_evidence,v_corr);
  return jsonb_build_object('outcome','MARKED','gateCode',p_gate_code,'status',p_status,'correlationId',v_corr);
end$$;

create or replace function public.hr_acceptance_snapshot()
returns jsonb language plpgsql stable security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();
begin
  return jsonb_build_object(
    'actorId',v_actor,
    'hrTables',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='hr' and c.relkind='r'),
    'tablesWithRls',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='hr' and c.relkind='r' and c.relrowsecurity),
    'rpcCount',(select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'hr_%'),
    'rlsEnabled',(select bool_and(c.relrowsecurity) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='hr' and c.relkind='r'),
    'directAuthenticatedTableGrants',(select count(*) from information_schema.role_table_grants where table_schema='hr' and grantee='authenticated'),
    'realPersonDataAllowed',hr_private.privacy_gate_passed(),
    'privacyGate',(select status from hr.readiness_gates where gate_code='PRIVACY_POLICY_APPROVED'),
    'productionGate',(select status from hr.readiness_gates where gate_code='PRODUCTION_APPROVED'),
    'auditChainRows',(select count(*) from hr.audit_events),
    'readiness',public.hr_readiness_snapshot()
  );
end$$;

create or replace function public.hr_configure_employer(
  p_code text,p_legal_name text,p_employer_kind text,p_branch_id uuid,p_effective_from date
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor record;v_employer uuid;v_mapping uuid;v_corr uuid:=gen_random_uuid();
begin
  select * into v_actor from hr_private.current_actor();if v_actor.app_user_id is null or v_actor.db_role not in ('CEO','GENERAL_MANAGER') then raise exception using errcode='42501',message='HQ employer authority required';end if;
  insert into hr.employers(code,legal_name,employer_kind,status,created_by) values(upper(btrim(p_code)),btrim(p_legal_name),p_employer_kind,'ACTIVE',v_actor.app_user_id)
  on conflict(code) do update set legal_name=excluded.legal_name,employer_kind=excluded.employer_kind,status='ACTIVE' returning id into v_employer;
  insert into hr.employer_branches(employer_id,branch_id,effective_from,created_by) values(v_employer,p_branch_id,p_effective_from,v_actor.app_user_id)
  on conflict(branch_id) where status='ACTIVE' and effective_to is null and is_primary do update set employer_id=excluded.employer_id,effective_from=excluded.effective_from returning id into v_mapping;
  update hr.readiness_gates set status='PASSED',evidence=jsonb_build_object('employerId',v_employer,'branchId',p_branch_id),decided_by=v_actor.app_user_id,decided_at=now(),updated_at=now() where gate_code='EMPLOYER_SCOPE_CONFIGURED';
  perform hr_private.write_audit('EMPLOYER_CONFIGURED','EMPLOYER',v_employer,null,jsonb_build_object('code',upper(btrim(p_code)),'branchId',p_branch_id),jsonb_build_object('employerKind',p_employer_kind),v_corr);
  return jsonb_build_object('outcome','CONFIGURED','employerId',v_employer,'branchId',p_branch_id,'correlationId',v_corr);
end$$;

create or replace function public.hr_request_role_assignment(
  p_app_user_id uuid,p_role_code text,p_employer_id uuid,p_branch_id uuid,p_reason text
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor record;v_id uuid;v_approval uuid;v_corr uuid:=gen_random_uuid();
begin
  select * into v_actor from hr_private.current_actor();if v_actor.app_user_id is null then raise exception using errcode='42501',message='active ERP user required';end if;
  if v_actor.db_role not in ('CEO','GENERAL_MANAGER') and not hr_private.actor_has_role('HR_ADMIN',p_employer_id,p_branch_id) then raise exception using errcode='42501',message='role assignment request denied';end if;
  if v_actor.app_user_id=p_app_user_id then raise exception using errcode='42501',message='self role elevation is prohibited';end if;
  insert into hr.role_assignments(app_user_id,role_code,employer_id,branch_id,status,granted_by,reason) values(p_app_user_id,p_role_code,p_employer_id,p_branch_id,'PENDING',v_actor.app_user_id,btrim(p_reason)) returning id into v_id;
  insert into hr.approval_requests(subject_type,subject_id,policy_code,requested_by,correlation_id) values('ROLE_ASSIGNMENT',v_id,'HR_ROLE_FOUR_EYES_V1',v_actor.app_user_id,v_corr) returning id into v_approval;
  insert into hr.approval_steps(approval_request_id,step_no,required_role) values(v_approval,1,'CEO_OR_GENERAL_MANAGER');
  perform hr_private.write_audit('ROLE_ASSIGNMENT_REQUESTED','ROLE_ASSIGNMENT',v_id,null,jsonb_build_object('roleCode',p_role_code,'appUserId',p_app_user_id),jsonb_build_object('approvalRequestId',v_approval),v_corr);
  return jsonb_build_object('outcome','PENDING','roleAssignmentId',v_id,'approvalRequestId',v_approval,'correlationId',v_corr);
end$$;

create or replace function public.hr_decide_role_assignment(p_role_assignment_id uuid,p_decision text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor record;v_role hr.role_assignments%rowtype;v_approval uuid;v_next text;v_corr uuid:=gen_random_uuid();
begin
  select * into v_actor from hr_private.current_actor();if v_actor.app_user_id is null or v_actor.db_role not in ('CEO','GENERAL_MANAGER') then raise exception using errcode='42501',message='HQ role approval required';end if;
  select * into v_role from hr.role_assignments where id=p_role_assignment_id for update;if not found then raise exception using errcode='P0002',message='role assignment not found';end if;
  if v_role.status<>'PENDING' or v_actor.app_user_id in (v_role.granted_by,v_role.app_user_id) then raise exception using errcode='42501',message='independent role approval required';end if;
  v_next=case when p_decision='APPROVE' then 'ACTIVE' when p_decision='REJECT' then 'REVOKED' else null end;if v_next is null then raise exception using errcode='22023',message='invalid role decision';end if;
  update hr.role_assignments set status=v_next,approved_by=v_actor.app_user_id where id=v_role.id;
  select id into v_approval from hr.approval_requests where subject_type='ROLE_ASSIGNMENT' and subject_id=v_role.id and status='PENDING' order by created_at desc limit 1 for update;
  update hr.approval_requests set status=case when v_next='ACTIVE' then 'APPROVED' else 'REJECTED' end,decided_at=now() where id=v_approval;
  update hr.approval_steps set status=case when v_next='ACTIVE' then 'APPROVED' else 'REJECTED' end,decided_by=v_actor.app_user_id,decided_at=now() where approval_request_id=v_approval and status='PENDING';
  if v_next='ACTIVE' then update hr.readiness_gates set status='PASSED',evidence=jsonb_build_object('latestRoleAssignmentId',v_role.id),decided_by=v_actor.app_user_id,decided_at=now(),updated_at=now() where gate_code='ROLE_MATRIX_CONFIGURED';end if;
  perform hr_private.write_audit('ROLE_ASSIGNMENT_DECIDED','ROLE_ASSIGNMENT',v_role.id,jsonb_build_object('status',v_role.status),jsonb_build_object('status',v_next),jsonb_build_object('decision',p_decision),v_corr);
  return jsonb_build_object('outcome','DECIDED','roleAssignmentId',v_role.id,'status',v_next,'correlationId',v_corr);
end$$;

create or replace function public.hr_upsert_organization_unit(
  p_employer_id uuid,p_branch_id uuid,p_department_code text,p_department_name text,p_position_code text,p_position_title text,p_headcount_limit integer
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_department uuid;v_position uuid;v_corr uuid:=gen_random_uuid();
begin
  if not hr_private.actor_can_manage(p_employer_id,p_branch_id) then raise exception using errcode='42501',message='organization scope denied';end if;
  insert into hr.departments(employer_id,branch_id,code,name,created_by) values(p_employer_id,p_branch_id,upper(btrim(p_department_code)),btrim(p_department_name),v_actor)
  on conflict(employer_id,code) do update set branch_id=excluded.branch_id,name=excluded.name,status='ACTIVE' returning id into v_department;
  insert into hr.positions(department_id,code,title,headcount_limit,created_by) values(v_department,upper(btrim(p_position_code)),btrim(p_position_title),p_headcount_limit,v_actor)
  on conflict(department_id,code) do update set title=excluded.title,headcount_limit=excluded.headcount_limit,status='ACTIVE' returning id into v_position;
  perform hr_private.write_audit('ORGANIZATION_UNIT_UPSERTED','POSITION',v_position,null,jsonb_build_object('departmentId',v_department,'headcountLimit',p_headcount_limit),jsonb_build_object('employerId',p_employer_id,'branchId',p_branch_id),v_corr);
  return jsonb_build_object('outcome','UPSERTED','departmentId',v_department,'positionId',v_position,'correlationId',v_corr);
end$$;

create or replace function public.hr_create_assignment(
  p_employee_id uuid,p_target_branch_id uuid,p_start_date date,p_end_date date,p_allocation_percent numeric
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_scope record;v_id uuid;v_corr uuid:=gen_random_uuid();
begin
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=p_employee_id and er.end_date is null limit 1;
  if not hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id) or not exists(select 1 from hr.employer_branches eb where eb.employer_id=v_scope.employer_id and eb.branch_id=p_target_branch_id and eb.status='ACTIVE') then raise exception using errcode='42501',message='cross-branch assignment scope denied';end if;
  if exists(select 1 from hr.assignments a where a.employee_id=p_employee_id and a.status in ('APPROVED','ACTIVE') and daterange(a.start_date,a.end_date,'[]') && daterange(p_start_date,p_end_date,'[]')) then raise exception using errcode='23P01',message='overlapping active assignment';end if;
  insert into hr.assignments(employee_id,target_branch_id,start_date,end_date,allocation_percent,created_by) values(p_employee_id,p_target_branch_id,p_start_date,p_end_date,p_allocation_percent,v_actor) returning id into v_id;
  perform hr_private.write_audit('ASSIGNMENT_CREATED','ASSIGNMENT',v_id,null,jsonb_build_object('status','PENDING','targetBranchId',p_target_branch_id),jsonb_build_object('employeeId',p_employee_id),v_corr);
  return jsonb_build_object('outcome','PENDING','assignmentId',v_id,'correlationId',v_corr);
end$$;

create or replace function public.hr_decide_assignment(p_assignment_id uuid,p_decision text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_assignment hr.assignments%rowtype;v_scope record;v_next text;v_corr uuid:=gen_random_uuid();
begin
  select * into v_assignment from hr.assignments where id=p_assignment_id for update;if not found then raise exception using errcode='P0002',message='assignment not found';end if;
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=v_assignment.employee_id and er.end_date is null limit 1;
  if not hr_private.actor_can_manage(v_scope.employer_id,v_assignment.target_branch_id) or v_actor=v_assignment.created_by then raise exception using errcode='42501',message='independent assignment approval required';end if;
  v_next=case when p_decision='APPROVE' then 'APPROVED' when p_decision='REJECT' then 'CANCELLED' else null end;if v_next is null then raise exception using errcode='22023',message='invalid assignment decision';end if;
  update hr.assignments set status=v_next,approved_by=case when v_next='APPROVED' then v_actor end where id=v_assignment.id;
  perform hr_private.write_audit('ASSIGNMENT_DECIDED','ASSIGNMENT',v_assignment.id,jsonb_build_object('status',v_assignment.status),jsonb_build_object('status',v_next),jsonb_build_object('decision',p_decision),v_corr);
  return jsonb_build_object('outcome','DECIDED','assignmentId',v_assignment.id,'status',v_next,'correlationId',v_corr);
end$$;

create or replace function public.hr_register_sgk_evidence(
  p_employee_id uuid,p_workflow_case_id uuid,p_evidence_type text,p_external_reference_hash text,p_document_id uuid default null
) returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_scope record;v_id uuid;v_corr uuid:=gen_random_uuid();
begin
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=p_employee_id and er.end_date is null limit 1;
  if not hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id) then raise exception using errcode='42501',message='SGK evidence scope denied';end if;
  insert into hr.sgk_evidence(employee_id,workflow_case_id,evidence_type,status,external_reference_hash,document_id,verified_by,verified_at,created_by)
  values(p_employee_id,p_workflow_case_id,p_evidence_type,'VERIFIED',lower(p_external_reference_hash),p_document_id,v_actor,now(),v_actor) returning id into v_id;
  perform hr_private.write_audit('SGK_EVIDENCE_VERIFIED','SGK_EVIDENCE',v_id,null,jsonb_build_object('type',p_evidence_type,'referenceHash',lower(p_external_reference_hash)),jsonb_build_object('employeeId',p_employee_id,'workflowCaseId',p_workflow_case_id),v_corr);
  return jsonb_build_object('outcome','VERIFIED','sgkEvidenceId',v_id,'correlationId',v_corr);
end$$;

create or replace function public.hr_assign_asset(p_employee_id uuid,p_asset_code text,p_asset_label text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_scope record;v_id uuid;v_corr uuid:=gen_random_uuid();
begin
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=p_employee_id and er.end_date is null limit 1;
  if not hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id) then raise exception using errcode='42501',message='asset scope denied';end if;
  insert into hr.employee_assets(employee_id,asset_code,asset_label,created_by) values(p_employee_id,upper(btrim(p_asset_code)),btrim(p_asset_label),v_actor)
  on conflict(employee_id,asset_code) do update set asset_label=excluded.asset_label,assigned_at=now(),returned_at=null,status='ASSIGNED' returning id into v_id;
  perform hr_private.write_audit('ASSET_ASSIGNED','EMPLOYEE_ASSET',v_id,null,jsonb_build_object('assetCode',upper(btrim(p_asset_code))),jsonb_build_object('employeeId',p_employee_id),v_corr);
  return jsonb_build_object('outcome','ASSIGNED','assetId',v_id,'correlationId',v_corr);
end$$;

create or replace function public.hr_return_asset(p_asset_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_asset hr.employee_assets%rowtype;v_scope record;v_corr uuid:=gen_random_uuid();
begin
  select * into v_asset from hr.employee_assets where id=p_asset_id for update;if not found then raise exception using errcode='P0002',message='asset not found';end if;
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=v_asset.employee_id and er.end_date is null limit 1;
  if not hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id) then raise exception using errcode='42501',message='asset return scope denied';end if;
  update hr.employee_assets set status='RETURNED',returned_at=now() where id=v_asset.id;
  perform hr_private.write_audit('ASSET_RETURNED','EMPLOYEE_ASSET',v_asset.id,jsonb_build_object('status',v_asset.status),jsonb_build_object('status','RETURNED'),jsonb_build_object('employeeId',v_asset.employee_id),v_corr);
  return jsonb_build_object('outcome','RETURNED','assetId',v_asset.id,'correlationId',v_corr);
end$$;

create or replace function public.hr_upsert_certification(p_employee_id uuid,p_certificate_code text,p_academy_reference text,p_issued_on date,p_expires_on date)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_scope record;v_id uuid;v_corr uuid:=gen_random_uuid();
begin
  select er.employer_id,er.home_branch_id into v_scope from hr.employment_records er where er.employee_id=p_employee_id and er.end_date is null limit 1;
  if not hr_private.actor_can_manage(v_scope.employer_id,v_scope.home_branch_id) then raise exception using errcode='42501',message='certification scope denied';end if;
  insert into hr.certifications(employee_id,certificate_code,academy_reference,issued_on,expires_on,status,created_by)
  values(p_employee_id,upper(btrim(p_certificate_code)),p_academy_reference,p_issued_on,p_expires_on,case when p_expires_on is not null and p_expires_on<current_date then 'EXPIRED' when p_expires_on is not null and p_expires_on<=current_date+30 then 'EXPIRING' else 'VALID' end,v_actor)
  on conflict(employee_id,certificate_code,issued_on) do update set academy_reference=excluded.academy_reference,expires_on=excluded.expires_on,status=excluded.status returning id into v_id;
  perform hr_private.write_audit('CERTIFICATION_UPSERTED','CERTIFICATION',v_id,null,jsonb_build_object('certificateCode',upper(btrim(p_certificate_code)),'expiresOn',p_expires_on),jsonb_build_object('employeeId',p_employee_id),v_corr);
  return jsonb_build_object('outcome','UPSERTED','certificationId',v_id,'correlationId',v_corr);
end$$;

create or replace function public.hr_create_performance_cycle(p_employer_id uuid,p_code text,p_starts_on date,p_ends_on date)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor uuid:=hr_private.actor_id_required();v_id uuid;v_corr uuid:=gen_random_uuid();
begin
  if not hr_private.actor_can_manage(p_employer_id,null) then raise exception using errcode='42501',message='performance cycle scope denied';end if;
  insert into hr.performance_cycles(employer_id,code,starts_on,ends_on,status,created_by) values(p_employer_id,upper(btrim(p_code)),p_starts_on,p_ends_on,'OPEN',v_actor)
  on conflict(employer_id,code) do update set starts_on=excluded.starts_on,ends_on=excluded.ends_on,status='OPEN' returning id into v_id;
  perform hr_private.write_audit('PERFORMANCE_CYCLE_OPENED','PERFORMANCE_CYCLE',v_id,null,jsonb_build_object('code',upper(btrim(p_code)),'startsOn',p_starts_on,'endsOn',p_ends_on),jsonb_build_object('employerId',p_employer_id),v_corr);
  return jsonb_build_object('outcome','OPEN','performanceCycleId',v_id,'correlationId',v_corr);
end$$;

create or replace function public.hr_submit_performance_review(p_cycle_id uuid,p_employee_id uuid,p_score numeric,p_evidence_hash text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare v_actor record;v_employee_user uuid;v_employer uuid;v_branch uuid;v_id uuid;v_corr uuid:=gen_random_uuid();
begin
  select * into v_actor from hr_private.current_actor();if v_actor.app_user_id is null then raise exception using errcode='42501',message='active ERP user required';end if;
  select e.app_user_id,er.employer_id,er.home_branch_id into v_employee_user,v_employer,v_branch from hr.employees e join hr.employment_records er on er.employee_id=e.id where e.id=p_employee_id and er.end_date is null limit 1;
  if v_actor.app_user_id=coalesce(v_employee_user,'00000000-0000-0000-0000-000000000000'::uuid) or not ((v_actor.db_role='BRANCH_MANAGER' and v_actor.branch_id=v_branch) or hr_private.actor_can_manage(v_employer,v_branch)) then raise exception using errcode='42501',message='independent performance review required';end if;
  insert into hr.performance_reviews(cycle_id,employee_id,reviewer_app_user_id,score,status,evidence_hash) values(p_cycle_id,p_employee_id,v_actor.app_user_id,p_score,'SUBMITTED',p_evidence_hash)
  on conflict(cycle_id,employee_id,reviewer_app_user_id) do update set score=excluded.score,status='SUBMITTED',evidence_hash=excluded.evidence_hash,updated_at=now() returning id into v_id;
  perform hr_private.write_audit('PERFORMANCE_REVIEW_SUBMITTED','PERFORMANCE_REVIEW',v_id,null,jsonb_build_object('score',p_score,'evidenceHash',p_evidence_hash),jsonb_build_object('employeeId',p_employee_id,'cycleId',p_cycle_id),v_corr);
  return jsonb_build_object('outcome','SUBMITTED','performanceReviewId',v_id,'correlationId',v_corr);
end$$;

create index hr_employment_scope_idx on hr.employment_records(employer_id,home_branch_id,status) where end_date is null;
create index hr_workflow_employee_status_idx on hr.workflow_cases(employee_id,status);
create index hr_workflow_tasks_open_idx on hr.workflow_tasks(workflow_case_id,status) where status not in ('COMPLETED','SKIPPED');
create index hr_leave_employee_status_idx on hr.leave_requests(employee_id,status,start_date);
create index hr_timesheet_period_idx on hr.timesheet_entries(branch_id,work_date,status);
create index hr_certification_expiry_idx on hr.certifications(expires_on,status) where expires_on is not null;
create index hr_payroll_employer_period_idx on hr.payroll_periods(employer_id,period_start,period_end,status);
create index hr_audit_subject_idx on hr.audit_events(subject_type,subject_id,created_at desc);
create index hr_audit_correlation_idx on hr.audit_events(correlation_id,created_at);

-- PostgreSQL does not create indexes for referencing foreign-key columns.
-- Keep full (non-partial) leftmost indexes for referential checks and joins;
-- filtered workflow indexes above remain in place for hot operational queries.
create index hr_readiness_gates_decided_by_fk_idx on hr.readiness_gates(decided_by);
create index hr_employers_created_by_fk_idx on hr.employers(created_by);
create index hr_employer_branches_employer_id_fk_idx on hr.employer_branches(employer_id);
create index hr_employer_branches_branch_id_fk_idx on hr.employer_branches(branch_id);
create index hr_employer_branches_created_by_fk_idx on hr.employer_branches(created_by);
create index hr_departments_branch_id_fk_idx on hr.departments(branch_id);
create index hr_departments_parent_department_id_fk_idx on hr.departments(parent_department_id);
create index hr_departments_created_by_fk_idx on hr.departments(created_by);
create index hr_positions_created_by_fk_idx on hr.positions(created_by);
create index hr_role_assignments_employer_id_fk_idx on hr.role_assignments(employer_id);
create index hr_role_assignments_branch_id_fk_idx on hr.role_assignments(branch_id);
create index hr_role_assignments_granted_by_fk_idx on hr.role_assignments(granted_by);
create index hr_role_assignments_approved_by_fk_idx on hr.role_assignments(approved_by);
create index hr_candidates_employer_id_fk_idx on hr.candidates(employer_id);
create index hr_candidates_branch_id_fk_idx on hr.candidates(branch_id);
create index hr_candidates_target_position_id_fk_idx on hr.candidates(target_position_id);
create index hr_candidates_created_by_fk_idx on hr.candidates(created_by);
create index hr_employees_created_by_fk_idx on hr.employees(created_by);
create index hr_employment_records_employee_id_fk_idx on hr.employment_records(employee_id);
create index hr_employment_records_employer_id_fk_idx on hr.employment_records(employer_id);
create index hr_employment_records_home_branch_id_fk_idx on hr.employment_records(home_branch_id);
create index hr_employment_records_position_id_fk_idx on hr.employment_records(position_id);
create index hr_employment_records_manager_employee_id_fk_idx on hr.employment_records(manager_employee_id);
create index hr_employment_records_created_by_fk_idx on hr.employment_records(created_by);
create index hr_assignments_employee_id_fk_idx on hr.assignments(employee_id);
create index hr_assignments_target_branch_id_fk_idx on hr.assignments(target_branch_id);
create index hr_assignments_approved_by_fk_idx on hr.assignments(approved_by);
create index hr_assignments_created_by_fk_idx on hr.assignments(created_by);
create index hr_workflow_cases_target_branch_id_fk_idx on hr.workflow_cases(target_branch_id);
create index hr_workflow_cases_target_position_id_fk_idx on hr.workflow_cases(target_position_id);
create index hr_workflow_cases_created_by_fk_idx on hr.workflow_cases(created_by);
create index hr_workflow_tasks_workflow_case_id_fk_idx on hr.workflow_tasks(workflow_case_id);
create index hr_workflow_tasks_completed_by_fk_idx on hr.workflow_tasks(completed_by);
create index hr_leave_requests_created_by_fk_idx on hr.leave_requests(created_by);
create index hr_leave_requests_manager_decided_by_fk_idx on hr.leave_requests(manager_decided_by);
create index hr_leave_requests_hr_decided_by_fk_idx on hr.leave_requests(hr_decided_by);
create index hr_leave_balances_created_by_fk_idx on hr.leave_balances(created_by);
create index hr_shift_plans_branch_id_fk_idx on hr.shift_plans(branch_id);
create index hr_shift_plans_created_by_fk_idx on hr.shift_plans(created_by);
create index hr_timesheet_entries_submitted_by_fk_idx on hr.timesheet_entries(submitted_by);
create index hr_timesheet_entries_approved_by_fk_idx on hr.timesheet_entries(approved_by);
create index hr_timesheet_entries_locked_by_fk_idx on hr.timesheet_entries(locked_by);
create index hr_timesheet_entries_created_by_fk_idx on hr.timesheet_entries(created_by);
create index hr_certifications_created_by_fk_idx on hr.certifications(created_by);
create index hr_employee_assets_created_by_fk_idx on hr.employee_assets(created_by);
create index hr_performance_cycles_created_by_fk_idx on hr.performance_cycles(created_by);
create index hr_performance_reviews_employee_id_fk_idx on hr.performance_reviews(employee_id);
create index hr_performance_reviews_reviewer_fk_idx on hr.performance_reviews(reviewer_app_user_id);
create index hr_documents_employee_id_fk_idx on hr.documents(employee_id);
create index hr_documents_created_by_fk_idx on hr.documents(created_by);
create index hr_payroll_periods_prepared_by_fk_idx on hr.payroll_periods(prepared_by);
create index hr_payroll_periods_approved_by_fk_idx on hr.payroll_periods(approved_by);
create index hr_payroll_periods_reconciled_by_fk_idx on hr.payroll_periods(reconciled_by);
create index hr_payroll_periods_created_by_fk_idx on hr.payroll_periods(created_by);
create index hr_payroll_items_employee_id_fk_idx on hr.payroll_items(employee_id);
create index hr_sgk_evidence_employee_id_fk_idx on hr.sgk_evidence(employee_id);
create index hr_sgk_evidence_workflow_case_id_fk_idx on hr.sgk_evidence(workflow_case_id);
create index hr_sgk_evidence_document_id_fk_idx on hr.sgk_evidence(document_id);
create index hr_sgk_evidence_verified_by_fk_idx on hr.sgk_evidence(verified_by);
create index hr_sgk_evidence_created_by_fk_idx on hr.sgk_evidence(created_by);
create index hr_approval_requests_requested_by_fk_idx on hr.approval_requests(requested_by);
create index hr_approval_steps_decided_by_fk_idx on hr.approval_steps(decided_by);
create index hr_audit_events_actor_id_fk_idx on hr.audit_events(actor_id);

do $$
declare v_table text;
begin
  foreach v_table in array array[
    'readiness_gates','employers','employer_branches','departments','positions','role_assignments','candidates','employees','employment_records','assignments','workflow_cases','workflow_tasks','leave_requests','leave_balances','shift_plans','timesheet_entries','certifications','employee_assets','performance_cycles','performance_reviews','documents','payroll_periods','payroll_items','sgk_evidence','approval_requests','approval_steps','idempotency_keys','audit_events'
  ] loop
    execute format('alter table hr.%I enable row level security',v_table);
    execute format('revoke all on table hr.%I from public,anon,authenticated',v_table);
  end loop;
end$$;

alter default privileges in schema hr revoke all on tables from public,anon,authenticated;
alter default privileges in schema hr revoke all on sequences from public,anon,authenticated;
alter default privileges in schema hr_private revoke execute on functions from public,anon,authenticated;

revoke all on all functions in schema hr_private from public,anon,authenticated;
grant usage on schema hr_private to authenticated;
grant execute on function hr_private.can_access_storage_object(text,boolean) to authenticated;

revoke all on function public.hr_my_context() from public,anon;
revoke all on function public.hr_readiness_snapshot() from public,anon;
revoke all on function public.hr_dashboard() from public,anon;
revoke all on function public.hr_create_synthetic_candidate(uuid,uuid,uuid,text,text,text) from public,anon;
revoke all on function public.hr_convert_candidate(uuid,text,date,text) from public,anon;
revoke all on function public.hr_start_workflow(uuid,text,date,uuid,uuid,text) from public,anon;
revoke all on function public.hr_complete_workflow_task(uuid,text,text) from public,anon;
revoke all on function public.hr_upsert_leave_balance(uuid,integer,numeric,numeric) from public,anon;
revoke all on function public.hr_submit_leave_request(uuid,text,date,date,numeric,text) from public,anon;
revoke all on function public.hr_decide_leave_request(uuid,text,text) from public,anon;
revoke all on function public.hr_upsert_shift(uuid,uuid,date,timestamptz,timestamptz) from public,anon;
revoke all on function public.hr_record_timesheet(uuid,uuid,date,integer,integer,text) from public,anon;
revoke all on function public.hr_create_payroll_shadow_period(uuid,date,date,text) from public,anon;
revoke all on function public.hr_prepare_payroll_shadow(uuid) from public,anon;
revoke all on function public.hr_approve_payroll_shadow(uuid,text) from public,anon;
revoke all on function public.hr_reconcile_payroll_shadow(uuid,text) from public,anon;
revoke all on function public.hr_register_document(uuid,text,text,text,bigint,text) from public,anon;
revoke all on function public.hr_mark_readiness_gate(text,text,jsonb) from public,anon;
revoke all on function public.hr_acceptance_snapshot() from public,anon;
revoke all on function public.hr_configure_employer(text,text,text,uuid,date) from public,anon;
revoke all on function public.hr_request_role_assignment(uuid,text,uuid,uuid,text) from public,anon;
revoke all on function public.hr_decide_role_assignment(uuid,text) from public,anon;
revoke all on function public.hr_upsert_organization_unit(uuid,uuid,text,text,text,text,integer) from public,anon;
revoke all on function public.hr_create_assignment(uuid,uuid,date,date,numeric) from public,anon;
revoke all on function public.hr_decide_assignment(uuid,text) from public,anon;
revoke all on function public.hr_register_sgk_evidence(uuid,uuid,text,text,uuid) from public,anon;
revoke all on function public.hr_assign_asset(uuid,text,text) from public,anon;
revoke all on function public.hr_return_asset(uuid) from public,anon;
revoke all on function public.hr_upsert_certification(uuid,text,text,date,date) from public,anon;
revoke all on function public.hr_create_performance_cycle(uuid,text,date,date) from public,anon;
revoke all on function public.hr_submit_performance_review(uuid,uuid,numeric,text) from public,anon;

grant execute on function public.hr_my_context() to authenticated;
grant execute on function public.hr_readiness_snapshot() to authenticated;
grant execute on function public.hr_dashboard() to authenticated;
grant execute on function public.hr_create_synthetic_candidate(uuid,uuid,uuid,text,text,text) to authenticated;
grant execute on function public.hr_convert_candidate(uuid,text,date,text) to authenticated;
grant execute on function public.hr_start_workflow(uuid,text,date,uuid,uuid,text) to authenticated;
grant execute on function public.hr_complete_workflow_task(uuid,text,text) to authenticated;
grant execute on function public.hr_upsert_leave_balance(uuid,integer,numeric,numeric) to authenticated;
grant execute on function public.hr_submit_leave_request(uuid,text,date,date,numeric,text) to authenticated;
grant execute on function public.hr_decide_leave_request(uuid,text,text) to authenticated;
grant execute on function public.hr_upsert_shift(uuid,uuid,date,timestamptz,timestamptz) to authenticated;
grant execute on function public.hr_record_timesheet(uuid,uuid,date,integer,integer,text) to authenticated;
grant execute on function public.hr_create_payroll_shadow_period(uuid,date,date,text) to authenticated;
grant execute on function public.hr_prepare_payroll_shadow(uuid) to authenticated;
grant execute on function public.hr_approve_payroll_shadow(uuid,text) to authenticated;
grant execute on function public.hr_reconcile_payroll_shadow(uuid,text) to authenticated;
grant execute on function public.hr_register_document(uuid,text,text,text,bigint,text) to authenticated;
grant execute on function public.hr_mark_readiness_gate(text,text,jsonb) to authenticated;
grant execute on function public.hr_acceptance_snapshot() to authenticated;
grant execute on function public.hr_configure_employer(text,text,text,uuid,date) to authenticated;
grant execute on function public.hr_request_role_assignment(uuid,text,uuid,uuid,text) to authenticated;
grant execute on function public.hr_decide_role_assignment(uuid,text) to authenticated;
grant execute on function public.hr_upsert_organization_unit(uuid,uuid,text,text,text,text,integer) to authenticated;
grant execute on function public.hr_create_assignment(uuid,uuid,date,date,numeric) to authenticated;
grant execute on function public.hr_decide_assignment(uuid,text) to authenticated;
grant execute on function public.hr_register_sgk_evidence(uuid,uuid,text,text,uuid) to authenticated;
grant execute on function public.hr_assign_asset(uuid,text,text) to authenticated;
grant execute on function public.hr_return_asset(uuid) to authenticated;
grant execute on function public.hr_upsert_certification(uuid,text,text,date,date) to authenticated;
grant execute on function public.hr_create_performance_cycle(uuid,text,date,date) to authenticated;
grant execute on function public.hr_submit_performance_review(uuid,uuid,numeric,text) to authenticated;

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
    values('gm-hr-private','gm-hr-private',false,10485760,array['application/pdf','image/jpeg','image/png'])
    on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
  end if;
end$$;

create policy "gm_hr_private_select" on storage.objects for select to authenticated
  using (bucket_id='gm-hr-private' and hr_private.can_access_storage_object(name,false));
create policy "gm_hr_private_insert" on storage.objects for insert to authenticated
  with check (bucket_id='gm-hr-private' and hr_private.can_access_storage_object(name,true));
create policy "gm_hr_private_update" on storage.objects for update to authenticated
  using (bucket_id='gm-hr-private' and hr_private.can_access_storage_object(name,true))
  with check (bucket_id='gm-hr-private' and hr_private.can_access_storage_object(name,true));
create policy "gm_hr_private_delete" on storage.objects for delete to authenticated
  using (bucket_id='gm-hr-private' and hr_private.can_access_storage_object(name,true));

comment on schema hr is 'OTOTR GM HR private data schema. Not exposed directly through Data API.';
comment on table hr.employees is 'Minimal HR identity shell. Real-person rows remain blocked until a later privacy-policy migration.';
comment on table hr.payroll_periods is 'Shadow-only payroll reconciliation; cannot activate payment or production calculation.';
comment on function public.hr_acceptance_snapshot() is 'Read-only security/readiness evidence for authenticated OTOTR ERP users.';
