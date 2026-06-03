import { execFileSync } from 'node:child_process';

const ACCOUNTS = {
  managerA: {
    email: 'local.branch.manager.a@ototr.test',
    password: 'LocalOnly-Branch-A-2026!',
    fullName: 'Local Branch Manager A',
    role: 'BRANCH_MANAGER',
    appUserId: '20000000-0000-0000-0000-000000000003',
    branchId: '10000000-0000-0000-0000-000000000001',
  },
  managerB: {
    email: 'local.branch.manager.b@ototr.test',
    password: 'LocalOnly-Branch-B-2026!',
    fullName: 'Local Branch Manager B',
    role: 'BRANCH_MANAGER',
    appUserId: '20000000-0000-0000-0000-000000000004',
    branchId: '10000000-0000-0000-0000-000000000002',
  },
  technicianA: {
    email: 'local.technician.a@ototr.test',
    password: 'LocalOnly-Tech-A-2026!',
    fullName: 'Local Technician A',
    role: 'INSPECTION_TECHNICIAN',
    appUserId: '20000000-0000-0000-0000-000000000005',
    branchId: '10000000-0000-0000-0000-000000000001',
  },
};

const FIXTURE = {
  branchA: '10000000-0000-0000-0000-000000000001',
  branchB: '10000000-0000-0000-0000-000000000002',
  caseA: '70000000-0000-0000-0000-000000000001',
  caseB: '70000000-0000-0000-0000-000000000002',
  taskA: '80000000-0000-0000-0000-000000000001',
  taskB: '80000000-0000-0000-0000-000000000002',
};

function runSupabaseStatus() {
  const raw = execFileSync('cmd.exe', ['/d', '/s', '/c', 'npx.cmd supabase status --output json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const jsonStart = raw.indexOf('{');
  if (jsonStart < 0) throw new Error('Supabase status did not return JSON.');
  return JSON.parse(raw.slice(jsonStart));
}

function requireStatusValue(status, key) {
  if (!status[key]) throw new Error(`Missing ${key} from local Supabase status.`);
  return status[key];
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { response, body };
}

async function adminRequest(status, path, options = {}) {
  const serviceRoleKey = requireStatusValue(status, 'SERVICE_ROLE_KEY');
  return requestJson(`${requireStatusValue(status, 'API_URL')}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

async function listAuthUsers(status) {
  const { response, body } = await adminRequest(status, '/auth/v1/admin/users?page=1&per_page=1000');
  if (!response.ok) {
    throw new Error(`Auth admin user list failed: HTTP ${response.status} ${safeBody(body)}`);
  }
  return Array.isArray(body?.users) ? body.users : [];
}

async function ensureAuthUser(status, account) {
  const users = await listAuthUsers(status);
  const existing = users.find((user) => user.email?.toLowerCase() === account.email.toLowerCase());
  if (!existing) {
    const { response, body } = await adminRequest(status, '/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {},
        app_metadata: { ototr_local_fixture: true },
      }),
    });
    if (!response.ok) {
      throw new Error(`Auth user create failed for ${account.email}: HTTP ${response.status} ${safeBody(body)}`);
    }
    return body.id;
  }

  const { response, body } = await adminRequest(status, `/auth/v1/admin/users/${existing.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      password: account.password,
      email_confirm: true,
      app_metadata: { ...(existing.app_metadata || {}), ototr_local_fixture: true },
    }),
  });
  if (!response.ok) {
    throw new Error(`Auth user update failed for ${account.email}: HTTP ${response.status} ${safeBody(body)}`);
  }
  return existing.id;
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function runPsql(sql) {
  return execFileSync(
    'docker',
    ['exec', '-i', 'supabase_db_ototr-local', 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'],
    {
      input: sql,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
}

function seedOperationalRows(authIds) {
  const accountValues = Object.entries(ACCOUNTS)
    .map(([, account]) => {
      return `(${sqlLiteral(account.appUserId)}::uuid, ${sqlLiteral(authIds[account.email])}::uuid, ${sqlLiteral(account.branchId)}::uuid, ${sqlLiteral(account.fullName)}, ${sqlLiteral(account.email)}, '', ${sqlLiteral(account.role)}, true)`;
    })
    .join(',\n  ');

  const sql = `
begin;

insert into public.branches (id, code, name, city, district, region, is_active)
values
  ('10000000-0000-0000-0000-000000000001', 'RLS-A', 'RLS Test Branch A', 'Bursa', 'Nilufer', 'Marmara', true),
  ('10000000-0000-0000-0000-000000000002', 'RLS-B', 'RLS Test Branch B', 'Ankara', 'Cankaya', 'Ic Anadolu', true)
on conflict (id) do update set
  code = excluded.code,
  name = excluded.name,
  city = excluded.city,
  district = excluded.district,
  region = excluded.region,
  is_active = excluded.is_active;

insert into public.app_users (id, auth_user_id, branch_id, full_name, email, phone, role, is_active)
values
  ${accountValues}
on conflict (id) do update set
  auth_user_id = excluded.auth_user_id,
  branch_id = excluded.branch_id,
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone,
  role = excluded.role,
  is_active = excluded.is_active;

insert into public.customers (id, full_name, phone, email, customer_role, kvkk_consent, service_consent)
values
  ('40000000-0000-0000-0000-000000000001', 'RLS Customer A', '+900000000001', 'rls-customer-a@example.test', 'OWNER', true, true),
  ('40000000-0000-0000-0000-000000000002', 'RLS Customer B', '+900000000002', 'rls-customer-b@example.test', 'OWNER', true, true)
on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  email = excluded.email,
  customer_role = excluded.customer_role,
  kvkk_consent = excluded.kvkk_consent,
  service_consent = excluded.service_consent;

insert into public.vehicles (id, customer_id, plate, vin, vin_normalized, brand, model, model_year, fuel_type, transmission, mileage_km)
values
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'RLS001', 'RLSVIN00000000001', 'RLSVIN00000000001', 'OTOTR', 'Scope A', 2026, 'Benzin', 'Otomatik', 1000),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'RLS002', 'RLSVIN00000000002', 'RLSVIN00000000002', 'OTOTR', 'Scope B', 2026, 'Benzin', 'Otomatik', 2000)
on conflict (id) do update set
  customer_id = excluded.customer_id,
  plate = excluded.plate,
  vin = excluded.vin,
  vin_normalized = excluded.vin_normalized,
  brand = excluded.brand,
  model = excluded.model,
  model_year = excluded.model_year,
  fuel_type = excluded.fuel_type,
  transmission = excluded.transmission,
  mileage_km = excluded.mileage_km;

insert into public.package_plans (id, code, name, duration_minutes, included_modules, is_active)
values ('60000000-0000-0000-0000-000000000001', 'RLS', 'RLS Test Package', 60, '[]'::jsonb, true)
on conflict (id) do update set
  code = excluded.code,
  name = excluded.name,
  duration_minutes = excluded.duration_minutes,
  included_modules = excluded.included_modules,
  is_active = excluded.is_active;

insert into public.expertise_cases (
  id, branch_id, customer_id, vehicle_id, package_plan_id, work_order_no, report_no,
  verification_token, status, risk_level, assigned_technician_id, created_by, updated_by
)
values
  ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'RLS-WO-A', 'RLS-REPORT-A', 'rls-token-a', 'ASSIGNED', 'NONE', '20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003'),
  ('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 'RLS-WO-B', 'RLS-REPORT-B', 'rls-token-b', 'ASSIGNED', 'NONE', null, '20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004')
on conflict (id) do update set
  branch_id = excluded.branch_id,
  customer_id = excluded.customer_id,
  vehicle_id = excluded.vehicle_id,
  package_plan_id = excluded.package_plan_id,
  work_order_no = excluded.work_order_no,
  report_no = excluded.report_no,
  verification_token = excluded.verification_token,
  status = excluded.status,
  risk_level = excluded.risk_level,
  assigned_technician_id = excluded.assigned_technician_id,
  created_by = excluded.created_by,
  updated_by = excluded.updated_by;

insert into public.inspection_tasks (
  id, expertise_case_id, task_key, title, assigned_role, assigned_user_id, status,
  report_field_key, required_fields, risky_findings, customer_friendly_note,
  owner_user_id, assigned_by_manager_id
)
values
  ('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'rls_assigned_task', 'RLS Assigned Task', 'BODY_PAINT', '20000000-0000-0000-0000-000000000005', 'ASSIGNED', 'rls.body.assigned', '[]'::jsonb, '[]'::jsonb, '', '20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003'),
  ('80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', 'rls_other_branch_task', 'RLS Other Branch Task', 'BODY_PAINT', null, 'AVAILABLE', 'rls.body.other', '[]'::jsonb, '[]'::jsonb, '', null, '20000000-0000-0000-0000-000000000004')
on conflict (id) do nothing;

commit;
`;
  runPsql(sql);
}

async function signIn(status, account) {
  const anonKey = requireStatusValue(status, 'ANON_KEY');
  const { response, body } = await requestJson(`${requireStatusValue(status, 'API_URL')}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: account.email, password: account.password }),
  });
  if (!response.ok || !body?.access_token) {
    throw new Error(`Sign-in failed for ${account.email}: HTTP ${response.status} ${safeBody(body)}`);
  }
  return body.access_token;
}

async function restGet(status, token, path) {
  const anonKey = requireStatusValue(status, 'ANON_KEY');
  const { response, body } = await requestJson(`${requireStatusValue(status, 'REST_URL')}${path}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`REST GET failed ${path}: HTTP ${response.status} ${safeBody(body)}`);
  }
  return body;
}

function expectCount(label, rows, expected) {
  if (!Array.isArray(rows)) throw new Error(`${label}: expected array response.`);
  if (rows.length !== expected) {
    throw new Error(`${label}: expected ${expected} row(s), got ${rows.length}.`);
  }
  console.log(`PASS ${label}: ${rows.length}`);
}

function safeBody(body) {
  if (!body) return '';
  if (typeof body === 'string') return body.slice(0, 200);
  const clone = JSON.parse(JSON.stringify(body));
  for (const key of ['access_token', 'refresh_token', 'token', 'apikey', 'api_key']) {
    if (clone[key]) clone[key] = '[redacted]';
  }
  return JSON.stringify(clone).slice(0, 300);
}

async function main() {
  const status = runSupabaseStatus();
  const authIds = {};

  for (const account of Object.values(ACCOUNTS)) {
    authIds[account.email] = await ensureAuthUser(status, account);
  }
  console.log('PASS local auth fixtures: 3 fake users ensured');

  seedOperationalRows(authIds);
  console.log('PASS operational fixture seed: branch/case/task rows ensured');

  const managerToken = await signIn(status, ACCOUNTS.managerA);
  console.log('PASS branch manager session: sign-in succeeded');

  const managerSelf = await restGet(status, managerToken, `/app_users?select=id,email,role,branch_id&email=eq.${encodeURIComponent(ACCOUNTS.managerA.email)}`);
  expectCount('branch manager self app_user visible', managerSelf, 1);

  const managerOwnCase = await restGet(status, managerToken, `/expertise_cases?select=id,branch_id,work_order_no&id=eq.${FIXTURE.caseA}`);
  expectCount('branch manager own branch case visible', managerOwnCase, 1);

  const managerOtherCase = await restGet(status, managerToken, `/expertise_cases?select=id,branch_id,work_order_no&id=eq.${FIXTURE.caseB}`);
  expectCount('branch manager other branch case hidden', managerOtherCase, 0);

  const managerOwnTask = await restGet(status, managerToken, `/inspection_tasks?select=id,expertise_case_id,title&id=eq.${FIXTURE.taskA}`);
  expectCount('branch manager own branch task visible', managerOwnTask, 1);

  const managerOtherTask = await restGet(status, managerToken, `/inspection_tasks?select=id,expertise_case_id,title&id=eq.${FIXTURE.taskB}`);
  expectCount('branch manager other branch task hidden', managerOtherTask, 0);

  const technicianToken = await signIn(status, ACCOUNTS.technicianA);
  console.log('PASS technician session: sign-in succeeded');

  const technicianSelf = await restGet(status, technicianToken, `/app_users?select=id,email,role,branch_id&email=eq.${encodeURIComponent(ACCOUNTS.technicianA.email)}`);
  expectCount('technician self app_user visible', technicianSelf, 1);

  const technicianAssignedTask = await restGet(status, technicianToken, `/inspection_tasks?select=id,expertise_case_id,title,assigned_user_id&id=eq.${FIXTURE.taskA}`);
  expectCount('technician assigned branch task visible', technicianAssignedTask, 1);

  const technicianOtherTask = await restGet(status, technicianToken, `/inspection_tasks?select=id,expertise_case_id,title&id=eq.${FIXTURE.taskB}`);
  expectCount('technician other branch task hidden', technicianOtherTask, 0);

  console.log('PASS local role session smoke: completed');
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
