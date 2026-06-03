#!/usr/bin/env node

const DEFAULT_API_BASE =
  'https://bsjkohwbtrfwrqcyhsfz.supabase.co/functions/v1/public-api';

const apiBase = (process.env.OTOTR_PUBLIC_API_BASE || DEFAULT_API_BASE).replace(
  /\/+$/,
  '',
);
const origin = process.env.OTOTR_PUBLIC_API_ORIGIN || 'https://example.github.io';
const runWriteSmoke = process.env.OTOTR_PUBLIC_API_WRITE_SMOKE === '1';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Origin: origin,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  return { response, json };
}

async function expectOkJson(path) {
  const { response, json } = await request(path);
  assert(response.ok, `${path} failed with HTTP ${response.status}`);
  assert(json && typeof json === 'object', `${path} did not return JSON`);
  return json;
}

async function testBranches() {
  const json = await expectOkJson('/branches');
  assert(Array.isArray(json.branches), '/branches must return branches array');
  assert(json.branches.length > 0, '/branches must return at least one branch');
  const first = json.branches[0];
  assert(first.name && first.city, '/branches first record is missing name/city');
  return json.branches.length;
}

async function testStats() {
  const json = await expectOkJson('/stats');
  for (const key of [
    'activeBranches',
    'monthlyAppointments',
    'monthlyFranchiseApplications',
    'monthlyComplaints',
  ]) {
    assert(Number.isFinite(json[key]), `/stats ${key} must be numeric`);
  }
  return json;
}

async function testReportVerify() {
  const json = await expectOkJson(
    '/reports/verify?query=OTR-2026-1842&verifyCode=1842',
  );
  assert(json.reportNo === 'OTR-2026-1842', 'report verification mismatch');
  assert(json.plate, 'report verification missing plate');
  return json.reportNo;
}

async function testReportVerifyNegative() {
  const { response, json } = await request(
    '/reports/verify?query=OTR-NOT-FOUND&verifyCode=0000',
  );
  assert(response.status === 404, `negative verify expected 404, got ${response.status}`);
  assert(json?.ok === false, 'negative verify must return ok=false');
}

async function postJson(path, payload) {
  const { response, json } = await request(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  assert(
    response.status === 201 || response.status === 202,
    `${path} write smoke failed with HTTP ${response.status}`,
  );
  assert(json?.ok === true, `${path} write smoke did not return ok=true`);
  return json.referenceNo;
}

async function testWrites() {
  const stamp = new Date().toISOString();
  const common = {
    source: 'public_api_smoke',
    fullName: `OTOTR Smoke ${stamp}`,
    phone: '05550000000',
    province: 'Istanbul',
    district: 'Kadikoy',
    kvkkConsent: true,
    contactConsent: true,
    consentVersion: 'smoke-test',
    utm: { source: 'codex-smoke' },
  };

  return {
    appointment: await postJson('/appointments', {
      ...common,
      service: 'Ekspertiz',
      plate: '34 TST 001',
      note: 'Automated staging smoke test.',
    }),
    franchise: await postJson('/franchise-applications', {
      ...common,
      applicationType: 'Franchise bilgi talebi',
      budget: 'Smoke',
      region: 'Marmara',
      hasLocation: 'Hayir',
      note: 'Automated staging smoke test.',
    }),
    complaint: await postJson('/complaints', {
      ...common,
      reportNo: 'OTR-2026-1842',
      plate: '34 OTR 360',
      complaintType: 'Smoke test',
      description: 'Automated staging smoke test.',
    }),
  };
}

async function main() {
  console.log(`Public API base: ${apiBase}`);
  console.log(`Origin: ${origin}`);
  const branchCount = await testBranches();
  const stats = await testStats();
  const reportNo = await testReportVerify();
  await testReportVerifyNegative();

  console.log(`GET /branches passed (${branchCount} branches)`);
  console.log(`GET /stats passed (${JSON.stringify(stats)})`);
  console.log(`GET /reports/verify passed (${reportNo})`);
  console.log('Negative report verification passed');

  if (runWriteSmoke) {
    const references = await testWrites();
    console.log(`Write smoke passed (${JSON.stringify(references)})`);
  } else {
    console.log('Write smoke skipped. Set OTOTR_PUBLIC_API_WRITE_SMOKE=1 to enable.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
