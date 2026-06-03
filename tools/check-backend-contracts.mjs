#!/usr/bin/env node

import { readFileSync } from 'node:fs';

function read(path) {
  return readFileSync(path, 'utf8');
}

function assertIncludes(text, needle, label) {
  if (!text.includes(needle)) {
    throw new Error(`${label} is missing: ${needle}`);
  }
}

function assertRegex(text, regex, label) {
  if (!regex.test(text)) {
    throw new Error(`${label} does not match ${regex}`);
  }
}

const apiDoc = read('docs/api.md');
const mobileContract = read('docs/mobile-bayi-api-contracts.md');
const authDoc = read('docs/auth-and-roles.md');
const sharedContracts = read('packages/shared/src/erp-contracts.ts');
const rlsChecklist = read('packages/database/rls-verification-checklist.sql');
const publicApi = read('supabase/functions/public-api/index.ts');
const envExample = read('.env.example');

for (const route of [
  '/branches',
  '/stats',
  '/reports/verify',
  '/appointments',
  '/franchise-applications',
  '/complaints',
]) {
  assertIncludes(apiDoc, route, 'docs/api.md');
  assertIncludes(publicApi, route, 'supabase/functions/public-api/index.ts');
}

for (const rpc of [
  'create_branch_work_order',
  'update_branch_work_order_task_status',
  'list_branch_technicians',
  'claim_inspection_task',
  'release_inspection_task',
  'manager_assign_inspection_task',
  'manager_clear_inspection_task_owner',
  'submit_inspection_task',
  'save_work_order_report_answer',
  'lock_work_order_report_item',
  'unlock_work_order_report_item',
]) {
  assertIncludes(mobileContract, rpc, 'docs/mobile-bayi-api-contracts.md');
}

for (const role of [
  'OTOTR_DB_ROLES',
  'ROLE_TO_DB_ROLE',
  'DB_ROLE_TO_ROLE',
  'INSPECTION_TECHNICIAN',
  'BRANCH_MANAGER',
  'QUALITY_AUDITOR',
]) {
  assertIncludes(sharedContracts, role, 'packages/shared/src/erp-contracts.ts');
  assertIncludes(authDoc, role, 'docs/auth-and-roles.md');
}

assertIncludes(rlsChecklist, "where id = 'report-media'", 'RLS checklist');
assertIncludes(rlsChecklist, "ilike '%report-media%'", 'RLS checklist');
assertIncludes(envExample, 'OTOTR_ALLOWED_ORIGINS=', '.env.example');
assertRegex(
  publicApi,
  /SUPABASE_SERVICE_ROLE_KEY/,
  'public-api service-role env lookup',
);
assertRegex(
  publicApi,
  /originAllowed\(req\.headers\.get\("Origin"\)\)/,
  'public-api origin gate',
);

console.log('Backend contract static checks passed.');
