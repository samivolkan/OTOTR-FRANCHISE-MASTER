import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const root = fileURLToPath(new URL('..', import.meta.url));
const migrationPath = `${root}/supabase/migrations/20261103003922_gm_hr_production_foundation.sql`;
const migration = await readFile(migrationPath, 'utf8');

assert.doesNotMatch(migration, /\bdrop\s+(table|schema)\b|\btruncate\b|\bdelete\s+from\b/i, 'Foundation migration must remain additive');
assert.doesNotMatch(migration, /\balter\s+table\s+public\./i, 'Foundation migration must not rewrite an existing public table');
assert.doesNotMatch(migration, /\bservice_role\b|\bsb_secret_/i, 'Foundation migration must not depend on client-visible privileged credentials');

const ids = Object.freeze({
  hqBranch: '10000000-0000-0000-0000-000000000001',
  branchB: '10000000-0000-0000-0000-000000000002',
  ceoUser: '20000000-0000-0000-0000-000000000001',
  gmUser: '20000000-0000-0000-0000-000000000002',
  hrUser: '20000000-0000-0000-0000-000000000003',
  managerUser: '20000000-0000-0000-0000-000000000004',
  employeeUser: '20000000-0000-0000-0000-000000000005',
  financeUser: '20000000-0000-0000-0000-000000000006',
  branchBManagerUser: '20000000-0000-0000-0000-000000000007',
  auditorUser: '20000000-0000-0000-0000-000000000008',
  ceoAuth: '30000000-0000-0000-0000-000000000001',
  gmAuth: '30000000-0000-0000-0000-000000000002',
  hrAuth: '30000000-0000-0000-0000-000000000003',
  managerAuth: '30000000-0000-0000-0000-000000000004',
  employeeAuth: '30000000-0000-0000-0000-000000000005',
  financeAuth: '30000000-0000-0000-0000-000000000006',
  branchBManagerAuth: '30000000-0000-0000-0000-000000000007',
  auditorAuth: '30000000-0000-0000-0000-000000000008',
});

const db = new PGlite({ extensions: { pgcrypto } });

async function setupSupabaseFixture() {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema extensions;
    create extension pgcrypto with schema extensions;
    create schema auth;
    create schema storage;

    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;

    create table public.branches (
      id uuid primary key,
      name text not null
    );

    create table public.app_users (
      id uuid primary key,
      auth_user_id uuid not null unique,
      branch_id uuid references public.branches(id),
      role text not null,
      is_active boolean not null default true
    );

    create table storage.buckets (
      id text primary key,
      name text not null,
      public boolean not null default false,
      file_size_limit bigint,
      allowed_mime_types text[]
    );

    create table storage.objects (
      id uuid primary key default extensions.gen_random_uuid(),
      bucket_id text not null references storage.buckets(id),
      name text not null,
      owner uuid,
      created_at timestamptz not null default now(),
      unique(bucket_id, name)
    );
    alter table storage.objects enable row level security;
    grant usage on schema public, storage to authenticated, anon;
    grant select, insert, update, delete on storage.objects to authenticated;

    insert into public.branches(id,name) values
      ('${ids.hqBranch}','Demo Merkez'),
      ('${ids.branchB}','Demo İkinci Şube');

    insert into public.app_users(id,auth_user_id,branch_id,role,is_active) values
      ('${ids.ceoUser}','${ids.ceoAuth}','${ids.hqBranch}','CEO',true),
      ('${ids.gmUser}','${ids.gmAuth}','${ids.hqBranch}','GENERAL_MANAGER',true),
      ('${ids.hrUser}','${ids.hrAuth}','${ids.hqBranch}','CRM_AGENT',true),
      ('${ids.managerUser}','${ids.managerAuth}','${ids.hqBranch}','BRANCH_MANAGER',true),
      ('${ids.employeeUser}','${ids.employeeAuth}','${ids.hqBranch}','INSPECTION_TECHNICIAN',true),
      ('${ids.financeUser}','${ids.financeAuth}','${ids.hqBranch}','FINANCE',true),
      ('${ids.branchBManagerUser}','${ids.branchBManagerAuth}','${ids.branchB}','BRANCH_MANAGER',true),
      ('${ids.auditorUser}','${ids.auditorAuth}','${ids.hqBranch}','AUDITOR',true);
  `);
}

async function asActor(authId, callback) {
  await db.exec('set role authenticated');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [authId]);
  try {
    return await callback();
  } finally {
    await db.exec('reset role');
    await db.exec("select set_config('request.jwt.claim.sub', '', false)");
  }
}

async function rpc(authId, name, values = []) {
  return asActor(authId, async () => {
    const placeholders = values.map((_, index) => `$${index + 1}`).join(',');
    const result = await db.query(`select public.${name}(${placeholders}) as value`, values);
    return result.rows[0].value;
  });
}

async function expectDenied(label, callback, pattern = /denied|blocked|required|not found|permission/i) {
  let failure;
  try {
    await callback();
  } catch (error) {
    failure = error;
  }
  assert.ok(failure, `${label}: operation unexpectedly succeeded`);
  assert.match(String(failure.message), pattern, `${label}: unexpected error`);
}

await setupSupabaseFixture();
await db.exec(migration);

const tableSecurity = await db.query(`
  select count(*)::int as total,
         count(*) filter (where c.relrowsecurity)::int as rls_enabled
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='hr' and c.relkind='r'
`);
assert.ok(tableSecurity.rows[0].total >= 25, 'HR table set is incomplete');
assert.equal(tableSecurity.rows[0].total, tableSecurity.rows[0].rls_enabled, 'Every HR table must have RLS enabled');

const missingForeignKeyIndexes = await db.query(`
  select c.conrelid::regclass::text as table_name, a.attname as column_name
  from pg_constraint c
  join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey)
  join pg_namespace n on n.oid=(select relnamespace from pg_class where oid=c.conrelid)
  where c.contype='f' and n.nspname='hr'
    and not exists (
      select 1 from pg_index i
      where i.indrelid=c.conrelid and a.attnum=i.indkey[0] and i.indpred is null
    )
  order by 1,2
`);
assert.deepEqual(
  missingForeignKeyIndexes.rows,
  [],
  `Every HR foreign key requires an index: ${JSON.stringify(missingForeignKeyIndexes.rows)}`,
);

const directGrants = await db.query(`
  select count(*)::int as total
  from information_schema.role_table_grants
  where table_schema='hr' and grantee in ('anon','authenticated')
`);
assert.equal(directGrants.rows[0].total, 0, 'HR tables must not be directly exposed');

const rpcPrivileges = await db.query(`
  select count(*)::int as total,
         count(*) filter (where has_function_privilege('authenticated', p.oid, 'EXECUTE'))::int as authenticated_total,
         count(*) filter (where has_function_privilege('anon', p.oid, 'EXECUTE'))::int as anonymous_total
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname like 'hr_%'
`);
assert.equal(rpcPrivileges.rows[0].total, rpcPrivileges.rows[0].authenticated_total, 'Authenticated must receive every reviewed HR RPC grant');
assert.equal(rpcPrivileges.rows[0].anonymous_total, 0, 'Anonymous must not execute an HR RPC');

const privateFunctionPrivileges = await db.query(`
  select p.proname
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='hr_private' and has_function_privilege('authenticated', p.oid, 'EXECUTE')
  order by p.proname
`);
assert.deepEqual(privateFunctionPrivileges.rows, [{ proname: 'can_access_storage_object' }], 'Only the Storage policy helper may be executable by authenticated');

const storageEvidence = await db.query(`
  select b.public,
         (select count(*)::int from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'gm_hr_private_%') as policy_count
  from storage.buckets b where b.id='gm-hr-private'
`);
assert.equal(storageEvidence.rows[0].public, false, 'HR document bucket must remain private');
assert.equal(storageEvidence.rows[0].policy_count, 4, 'Storage select/insert/update/delete policies are required');

const initialReadiness = await rpc(ids.ceoAuth, 'hr_readiness_snapshot');
const initialByCode = Object.fromEntries(initialReadiness.map((gate) => [gate.code, gate.status]));
assert.equal(initialByCode.PRIVACY_POLICY_APPROVED, 'EXCLUDED_BY_SCOPE');
assert.equal(initialByCode.PRODUCTION_APPROVED, 'BLOCKED');

const employer = await rpc(ids.ceoAuth, 'hr_configure_employer', [
  'DEMO-HQ',
  'Demo OTOTR Merkez İşvereni',
  'HEADQUARTERS',
  ids.hqBranch,
  '2026-11-01',
]);
assert.equal(employer.outcome, 'CONFIGURED');

const roleRequest = await rpc(ids.ceoAuth, 'hr_request_role_assignment', [
  ids.hrUser,
  'HR_ADMIN',
  employer.employerId,
  ids.hqBranch,
  'Sentetik kabul testi İK yöneticisi',
]);
assert.equal(roleRequest.outcome, 'PENDING');
const roleDecision = await rpc(ids.gmAuth, 'hr_decide_role_assignment', [roleRequest.roleAssignmentId, 'APPROVE']);
assert.equal(roleDecision.status, 'ACTIVE');

const managerRoleRequest = await rpc(ids.ceoAuth, 'hr_request_role_assignment', [
  ids.managerUser,
  'BRANCH_HR_MANAGER',
  employer.employerId,
  ids.hqBranch,
  'Sentetik kabul testi şube İK yöneticisi',
]);
await rpc(ids.gmAuth, 'hr_decide_role_assignment', [managerRoleRequest.roleAssignmentId, 'APPROVE']);

const payrollRoleRequest = await rpc(ids.ceoAuth, 'hr_request_role_assignment', [
  ids.financeUser,
  'PAYROLL_OPERATOR',
  employer.employerId,
  null,
  'Sentetik kabul testi gölge bordro operatörü',
]);
await rpc(ids.gmAuth, 'hr_decide_role_assignment', [payrollRoleRequest.roleAssignmentId, 'APPROVE']);

const employeeSelfServiceRequest = await rpc(ids.ceoAuth, 'hr_request_role_assignment', [
  ids.employeeUser,
  'EMPLOYEE_SELF_SERVICE',
  employer.employerId,
  ids.hqBranch,
  'Sentetik kabul testi çalışan öz hizmet rolü',
]);
await rpc(ids.gmAuth, 'hr_decide_role_assignment', [employeeSelfServiceRequest.roleAssignmentId, 'APPROVE']);

const auditorRoleRequest = await rpc(ids.ceoAuth, 'hr_request_role_assignment', [
  ids.auditorUser,
  'AUDITOR',
  employer.employerId,
  null,
  'Sentetik kabul testi denetçi rolü',
]);
await rpc(ids.gmAuth, 'hr_decide_role_assignment', [auditorRoleRequest.roleAssignmentId, 'APPROVE']);

const roleMatrix = [
  [ids.gmAuth, 'GENERAL_MANAGER', []],
  [ids.hrAuth, 'CRM_AGENT', ['HR_ADMIN']],
  [ids.managerAuth, 'BRANCH_MANAGER', ['BRANCH_HR_MANAGER']],
  [ids.financeAuth, 'FINANCE', ['PAYROLL_OPERATOR']],
  [ids.auditorAuth, 'AUDITOR', ['AUDITOR']],
  [ids.employeeAuth, 'INSPECTION_TECHNICIAN', ['EMPLOYEE_SELF_SERVICE']],
];
for (const [authId, expectedDbRole, expectedHrRoles] of roleMatrix) {
  const context = await rpc(authId, 'hr_my_context');
  assert.equal(context.dbRole, expectedDbRole, `Role matrix db role mismatch for ${expectedDbRole}`);
  const roleCodes = context.hrRoles.map((role) => role.roleCode);
  for (const roleCode of expectedHrRoles) {
    assert.ok(roleCodes.includes(roleCode), `Role matrix assignment missing: ${expectedDbRole}/${roleCode}`);
  }
  const dashboard = await rpc(authId, 'hr_dashboard');
  assert.equal(typeof dashboard.employees, 'number', `Dashboard must be readable for ${expectedDbRole}`);
}

await expectDenied(
  'Auditor candidate mutation',
  () => rpc(ids.auditorAuth, 'hr_create_synthetic_candidate', [employer.employerId, ids.hqBranch, '00000000-0000-0000-0000-000000000000', 'Demo Denetçi Yetki Reddi', 'DEMO-AUDITOR-DENY', 'auditor-deny-0001']),
  /HR scope denied|position not found|permission|denied/i,
);
await expectDenied(
  'Employee payroll mutation',
  () => rpc(ids.employeeAuth, 'hr_create_payroll_shadow_period', [employer.employerId, '2026-12-01', '2026-12-31', 'employee-payroll-deny-0001']),
  /payroll scope denied|permission|denied/i,
);

const organization = await rpc(ids.hrAuth, 'hr_upsert_organization_unit', [
  employer.employerId,
  ids.hqBranch,
  'DEMO-OPS',
  'Demo Operasyon',
  'DEMO-EXPERT',
  'Demo Ekspertiz Uzmanı',
  25,
]);
assert.equal(organization.outcome, 'UPSERTED');

const candidate = await rpc(ids.hrAuth, 'hr_create_synthetic_candidate', [
  employer.employerId,
  ids.hqBranch,
  organization.positionId,
  'Demo Çalışan 001',
  'DEMO-CAND-001',
  'candidate-create-0001',
]);
const candidateReplay = await rpc(ids.hrAuth, 'hr_create_synthetic_candidate', [
  employer.employerId,
  ids.hqBranch,
  organization.positionId,
  'Demo Çalışan 001',
  'DEMO-CAND-001',
  'candidate-create-0001',
]);
assert.deepEqual(candidateReplay, candidate, 'Idempotent candidate replay must return the first result');

const converted = await rpc(ids.hrAuth, 'hr_convert_candidate', [
  candidate.candidateId,
  'DEMO-EMP-001',
  '2026-11-01',
  'candidate-convert-0001',
]);
assert.equal(converted.outcome, 'CONVERTED');
const convertedReplay = await rpc(ids.hrAuth, 'hr_convert_candidate', [
  candidate.candidateId,
  'DEMO-EMP-001',
  '2026-11-01',
  'candidate-convert-0001',
]);
assert.deepEqual(convertedReplay, converted, 'Idempotent conversion replay must return the first result');

await db.query('update hr.employees set app_user_id=$1 where id=$2', [ids.employeeUser, converted.employeeId]);

await rpc(ids.hrAuth, 'hr_register_sgk_evidence', [
  converted.employeeId,
  converted.workflowCaseId,
  'HIRING_STATUS',
  'a'.repeat(64),
  null,
]);

for (const taskCode of ['EMPLOYMENT_CONTRACT', 'SGK_HIRING_VERIFICATION', 'ACADEMY_ASSIGNMENT', 'ACCESS_PROVISIONING', 'ASSET_HANDOVER']) {
  await rpc(ids.hrAuth, 'hr_complete_workflow_task', [converted.workflowCaseId, taskCode, 'b'.repeat(64)]);
}
const employeeStatus = await db.query('select status from hr.employees where id=$1', [converted.employeeId]);
assert.equal(employeeStatus.rows[0].status, 'ACTIVE', 'Onboarding must activate a synthetic employee only after evidence and tasks');

const leaveBalance = await rpc(ids.hrAuth, 'hr_upsert_leave_balance', [converted.employeeId, 2026, 15, 2]);
assert.equal(leaveBalance.outcome, 'UPSERTED');
await expectDenied('Employee leave-balance mutation', () => rpc(ids.employeeAuth, 'hr_upsert_leave_balance', [converted.employeeId, 2026, 99, 0]), /leave balance scope denied/i);

const leave = await rpc(ids.employeeAuth, 'hr_submit_leave_request', [
  converted.employeeId,
  'ANNUAL',
  '2026-11-10',
  '2026-11-11',
  2,
  'leave-request-0001',
]);
assert.equal(leave.status, 'PENDING_MANAGER');
const managerDecision = await rpc(ids.managerAuth, 'hr_decide_leave_request', [leave.leaveRequestId, 'APPROVE', 'Şube onayı']);
assert.equal(managerDecision.status, 'PENDING_HR');
const hrDecision = await rpc(ids.hrAuth, 'hr_decide_leave_request', [leave.leaveRequestId, 'APPROVE', 'İK son onayı']);
assert.equal(hrDecision.status, 'APPROVED');
const balanceEvidence = await db.query('select pending_days,used_days from hr.leave_balances where id=$1', [leaveBalance.leaveBalanceId]);
assert.equal(Number(balanceEvidence.rows[0].pending_days), 0);
assert.equal(Number(balanceEvidence.rows[0].used_days), 2);
await expectDenied(
  'Overlapping leave request',
  () => rpc(ids.employeeAuth, 'hr_submit_leave_request', [converted.employeeId, 'ANNUAL', '2026-11-11', '2026-11-12', 2, 'leave-overlap-0001']),
  /overlapping active leave request/i,
);
await expectDenied(
  'Insufficient leave balance',
  () => rpc(ids.employeeAuth, 'hr_submit_leave_request', [converted.employeeId, 'ANNUAL', '2026-12-01', '2026-12-31', 31, 'leave-insufficient-0001']),
  /insufficient or missing annual leave balance/i,
);

await expectDenied('Cross-branch HR access', () => rpc(ids.branchBManagerAuth, 'hr_complete_workflow_task', [converted.workflowCaseId, 'NO_TASK', null]));

await rpc(ids.ceoAuth, 'hr_configure_employer', [
  'DEMO-HQ',
  'Demo OTOTR Merkez İşvereni',
  'HEADQUARTERS',
  ids.branchB,
  '2026-11-01',
]);
const branchBRoleRequest = await rpc(ids.ceoAuth, 'hr_request_role_assignment', [
  ids.branchBManagerUser,
  'BRANCH_HR_MANAGER',
  employer.employerId,
  ids.branchB,
  'Sentetik geçici görevlendirme hedef şube onayı',
]);
await rpc(ids.gmAuth, 'hr_decide_role_assignment', [branchBRoleRequest.roleAssignmentId, 'APPROVE']);

const assignment = await rpc(ids.hrAuth, 'hr_create_assignment', [
  converted.employeeId,
  ids.branchB,
  '2026-11-15',
  '2026-11-20',
  100,
]);
assert.equal(assignment.outcome, 'PENDING');
await expectDenied('Assignment self-approval', () => rpc(ids.hrAuth, 'hr_decide_assignment', [assignment.assignmentId, 'APPROVE']), /independent assignment approval/i);
const assignmentDecision = await rpc(ids.branchBManagerAuth, 'hr_decide_assignment', [assignment.assignmentId, 'APPROVE']);
assert.equal(assignmentDecision.status, 'APPROVED');
await expectDenied(
  'Source-branch HR target shift scope',
  () => rpc(ids.hrAuth, 'hr_upsert_shift', [converted.employeeId, ids.branchB, '2026-11-16', '2026-11-16T06:00:00.000Z', '2026-11-16T15:00:00.000Z']),
  /shift scope denied/i,
);
const assignedShift = await rpc(ids.branchBManagerAuth, 'hr_upsert_shift', [
  converted.employeeId,
  ids.branchB,
  '2026-11-16',
  '2026-11-16T06:00:00.000Z',
  '2026-11-16T15:00:00.000Z',
]);
assert.equal(assignedShift.outcome, 'UPSERTED');

const shift = await rpc(ids.hrAuth, 'hr_upsert_shift', [
  converted.employeeId,
  ids.hqBranch,
  '2026-11-03',
  '2026-11-03T06:00:00.000Z',
  '2026-11-03T15:00:00.000Z',
]);
assert.equal(shift.outcome, 'UPSERTED');

const timesheetSubmit = await rpc(ids.employeeAuth, 'hr_record_timesheet', [
  converted.employeeId,
  ids.hqBranch,
  '2026-11-03',
  480,
  60,
  'SUBMITTED',
]);
assert.equal(timesheetSubmit.outcome, 'SUBMITTED');
await expectDenied(
  'Timesheet self-approval',
  () => rpc(ids.employeeAuth, 'hr_record_timesheet', [converted.employeeId, ids.hqBranch, '2026-11-03', 480, 60, 'APPROVED']),
  /four-eyes|approval denied/i,
);
const timesheetApprove = await rpc(ids.managerAuth, 'hr_record_timesheet', [
  converted.employeeId,
  ids.hqBranch,
  '2026-11-03',
  480,
  60,
  'APPROVED',
]);
assert.equal(timesheetApprove.outcome, 'APPROVED');
await expectDenied(
  'Timesheet approver lock',
  () => rpc(ids.managerAuth, 'hr_record_timesheet', [converted.employeeId, ids.hqBranch, '2026-11-03', 480, 60, 'LOCKED']),
  /timesheet lock denied|independent timesheet lock/i,
);
const timesheetLock = await rpc(ids.financeAuth, 'hr_record_timesheet', [
  converted.employeeId,
  ids.hqBranch,
  '2026-11-03',
  480,
  60,
  'LOCKED',
]);
assert.equal(timesheetLock.outcome, 'LOCKED');

const asset = await rpc(ids.hrAuth, 'hr_assign_asset', [converted.employeeId, 'DEMO-LAPTOP-001', 'Demo dizüstü bilgisayar']);
assert.equal(asset.outcome, 'ASSIGNED');
const certification = await rpc(ids.hrAuth, 'hr_upsert_certification', [
  converted.employeeId,
  'DEMO-ACADEMY-001',
  'SYNTHETIC-ACADEMY-REF-001',
  '2026-11-01',
  '2027-11-01',
]);
assert.equal(certification.outcome, 'UPSERTED');

const document = await rpc(ids.hrAuth, 'hr_register_document', [
  converted.employeeId,
  'CONTRACT',
  'd'.repeat(64),
  'application/pdf',
  2048,
  'demo-contract.pdf',
]);
assert.equal(document.outcome, 'REGISTERED');
await asActor(ids.hrAuth, () => db.query(
  'insert into storage.objects(bucket_id,name,owner) values($1,$2,$3)',
  [document.bucket, document.storagePath, ids.hrAuth],
));
const employeeStorageView = await asActor(ids.employeeAuth, () => db.query(
  'select count(*)::int as total from storage.objects where bucket_id=$1 and name=$2',
  [document.bucket, document.storagePath],
));
assert.equal(employeeStorageView.rows[0].total, 1, 'Employee self-service must only see its authorized document object');

const performanceCycle = await rpc(ids.ceoAuth, 'hr_create_performance_cycle', [
  employer.employerId,
  'DEMO-2026-H2',
  '2026-07-01',
  '2026-12-31',
]);
assert.equal(performanceCycle.outcome, 'OPEN');
const performanceReview = await rpc(ids.managerAuth, 'hr_submit_performance_review', [
  performanceCycle.performanceCycleId,
  converted.employeeId,
  87.5,
  'e'.repeat(64),
]);
assert.equal(performanceReview.outcome, 'SUBMITTED');
await expectDenied(
  'Performance self-review',
  () => rpc(ids.employeeAuth, 'hr_submit_performance_review', [performanceCycle.performanceCycleId, converted.employeeId, 100, 'f'.repeat(64)]),
  /independent performance review/i,
);

for (const [periodStart, periodEnd, key, exportHash] of [
  ['2026-10-01', '2026-10-31', 'payroll-shadow-2026-10', '1'.repeat(64)],
  ['2026-11-01', '2026-11-30', 'payroll-shadow-2026-11', '2'.repeat(64)],
]) {
  const payroll = await rpc(ids.financeAuth, 'hr_create_payroll_shadow_period', [employer.employerId, periodStart, periodEnd, key]);
  const prepared = await rpc(ids.financeAuth, 'hr_prepare_payroll_shadow', [payroll.payrollPeriodId]);
  assert.equal(prepared.status, 'PENDING_APPROVAL');
  assert.ok(prepared.itemCount >= 1);
  await expectDenied('Payroll self-approval', () => rpc(ids.financeAuth, 'hr_approve_payroll_shadow', [payroll.payrollPeriodId, 'APPROVE']), /four-eyes payroll approval/i);
  const approved = await rpc(ids.gmAuth, 'hr_approve_payroll_shadow', [payroll.payrollPeriodId, 'APPROVE']);
  assert.equal(approved.status, 'APPROVED');
  await expectDenied('Payroll approver reconciliation', () => rpc(ids.gmAuth, 'hr_reconcile_payroll_shadow', [payroll.payrollPeriodId, exportHash]), /independent payroll reconciliation/i);
  const reconciled = await rpc(ids.ceoAuth, 'hr_reconcile_payroll_shadow', [payroll.payrollPeriodId, exportHash]);
  assert.equal(reconciled.outcome, 'RECONCILED');
}

const payrollGate = await db.query("select status from hr.readiness_gates where gate_code='PAYROLL_SHADOW_TWO_PERIODS'");
assert.equal(payrollGate.rows[0].status, 'PASSED', 'Two independently reconciled shadow periods are required');

await expectDenied(
  'Direct authenticated HR table access',
  () => asActor(ids.hrAuth, () => db.query('select count(*) from hr.employees')),
  /permission denied/i,
);
await expectDenied(
  'Anonymous HR RPC access',
  async () => {
    await db.exec('set role anon');
    try {
      await db.query('select public.hr_dashboard()');
    } finally {
      await db.exec('reset role');
    }
  },
  /permission denied/i,
);

await expectDenied(
  'Real-person employee guard',
  () => db.query(
    `insert into hr.employees(employee_number,display_label,status,is_synthetic,created_by)
     values('REAL-001','Gerçek Kişi','PREBOARDING',false,$1)`,
    [ids.hrUser],
  ),
  /real-person HR data is blocked/i,
);

await expectDenied(
  'Sensitive document guard',
  () => rpc(ids.hrAuth, 'hr_register_document', [converted.employeeId, 'IDENTITY', 'c'.repeat(64), 'application/pdf', 1000, 'identity-document-0001']),
  /sensitive document.*blocked|sensitive HR document is blocked/i,
);

await expectDenied(
  'Privacy gate override',
  () => rpc(ids.ceoAuth, 'hr_mark_readiness_gate', ['PRIVACY_POLICY_APPROVED', 'PASSED', { source: 'test' }]),
  /cannot be changed|blocked|privacy|dedicated reviewed workflow/i,
);

const auditRows = await db.query('select id,previous_integrity_hash,integrity_hash from hr.audit_events order by created_at,id');
assert.ok(auditRows.rows.length >= 10, 'Material HR actions must be audited');
assert.equal(auditRows.rows[0].previous_integrity_hash, null, 'First audit row must start the chain');
for (let index = 1; index < auditRows.rows.length; index += 1) {
  assert.equal(auditRows.rows[index].previous_integrity_hash, auditRows.rows[index - 1].integrity_hash, 'Audit chain is broken');
}
await expectDenied('Audit update immutability', () => db.query('update hr.audit_events set action_code=action_code where id=$1', [auditRows.rows[0].id]), /immutable/i);
await expectDenied('Audit delete immutability', () => db.query('delete from hr.audit_events where id=$1', [auditRows.rows[0].id]), /immutable/i);

const offboarding = await rpc(ids.hrAuth, 'hr_start_workflow', [
  converted.employeeId,
  'OFFBOARDING',
  '2026-12-01',
  null,
  null,
  'offboarding-start-0001',
]);
await rpc(ids.hrAuth, 'hr_register_sgk_evidence', [converted.employeeId, offboarding.workflowCaseId, 'TERMINATION_STATUS', '3'.repeat(64), null]);
await rpc(ids.hrAuth, 'hr_return_asset', [asset.assetId]);
for (const taskCode of ['SGK_TERMINATION_VERIFICATION', 'ASSET_RETURN', 'ACCESS_REVOCATION', 'WORK_HANDOVER']) {
  await rpc(ids.hrAuth, 'hr_complete_workflow_task', [offboarding.workflowCaseId, taskCode, '4'.repeat(64)]);
}
const offboardingReplay = await rpc(ids.hrAuth, 'hr_start_workflow', [
  converted.employeeId,
  'OFFBOARDING',
  '2026-12-01',
  null,
  null,
  'offboarding-start-0001',
]);
assert.deepEqual(offboardingReplay, offboarding, 'Completed workflow replay must return the first result');
const leftStatus = await db.query('select status from hr.employees where id=$1', [converted.employeeId]);
assert.equal(leftStatus.rows[0].status, 'LEFT', 'Offboarding must close employment after SGK evidence and asset return');

const backup = await db.dumpDataDir();
assert.ok(backup.size > 0, 'Synthetic database backup must not be empty');
const restored = new PGlite({ loadDataDir: backup, extensions: { pgcrypto } });
const restoredEvidence = await restored.query(`
  select
    (select count(*)::int from hr.audit_events) as audit_events,
    (select count(*)::int from hr.payroll_periods where status='RECONCILED') as reconciled_periods,
    (select status from hr.readiness_gates where gate_code='PRIVACY_POLICY_APPROVED') as privacy_gate,
    (select status from hr.readiness_gates where gate_code='PRODUCTION_APPROVED') as production_gate
`);
assert.ok(restoredEvidence.rows[0].audit_events >= auditRows.rows.length, 'Restored audit evidence is incomplete');
assert.equal(restoredEvidence.rows[0].reconciled_periods, 2);
assert.equal(restoredEvidence.rows[0].privacy_gate, 'EXCLUDED_BY_SCOPE');
assert.equal(restoredEvidence.rows[0].production_gate, 'BLOCKED');
await restored.close();

await rpc(ids.ceoAuth, 'hr_mark_readiness_gate', ['AUTH_RLS_VERIFIED', 'PASSED', { test: 'PGlite PostgreSQL 17 security acceptance' }]);
await rpc(ids.ceoAuth, 'hr_mark_readiness_gate', ['BACKUP_RESTORE_TESTED', 'PASSED', { test: 'Synthetic PGlite dump/load restore', bytes: backup.size }]);
await rpc(ids.ceoAuth, 'hr_mark_readiness_gate', ['SYNTHETIC_UAT_PASSED', 'PASSED', { test: 'GM HR synthetic end-to-end acceptance' }]);

const acceptance = await rpc(ids.ceoAuth, 'hr_acceptance_snapshot');
assert.equal(acceptance.privacyGate, 'EXCLUDED_BY_SCOPE');
assert.equal(acceptance.productionGate, 'BLOCKED');
assert.equal(acceptance.directAuthenticatedTableGrants, 0);
assert.equal(acceptance.tablesWithRls, acceptance.hrTables);

console.log(JSON.stringify({
  result: 'PASS',
  hrTables: acceptance.hrTables,
  rpcCount: acceptance.rpcCount,
  auditEvents: auditRows.rows.length,
  privacyGate: acceptance.privacyGate,
  productionGate: acceptance.productionGate,
}, null, 2));

await db.close();
