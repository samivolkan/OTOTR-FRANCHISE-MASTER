import {
  AUTH_ROLE_MATRIX,
  AUTH_RLS_TEST_SCENARIOS,
  OTOTR_DB_ROLES,
  OTOTR_ROLES,
  ROLE_SCOPE,
  ROLE_SCOPE_MAP,
  ROLE_TO_DB_ROLE,
} from './erp-contracts';

const roleCount = Object.keys(OTOTR_ROLES).length;
const matrixRoleCount = new Set(AUTH_ROLE_MATRIX.map((entry) => entry.role))
  .size;

if (matrixRoleCount !== roleCount) {
  throw new Error('AUTH_ROLE_MATRIX must contain every product role exactly once.');
}

const technician = AUTH_ROLE_MATRIX.find(
  (entry) => entry.role === OTOTR_ROLES.TECHNICIAN,
);
if (!technician?.requiresAssignedTaskScope) {
  throw new Error('Technician role must require assigned task scope.');
}

const customerPublic = AUTH_ROLE_MATRIX.find(
  (entry) => entry.role === OTOTR_ROLES.CUSTOMER_PUBLIC,
);
if (!customerPublic?.publicReportOnly) {
  throw new Error('Customer/public role must be limited to public report access.');
}

for (const [role, scope] of Object.entries(ROLE_SCOPE_MAP)) {
  const matrixEntry = AUTH_ROLE_MATRIX.find((entry) => entry.role === role);
  if (!matrixEntry) {
    throw new Error(`Missing auth matrix entry for ${role}.`);
  }
  if (scope === ROLE_SCOPE.REGION && !matrixEntry.requiresRegionScope) {
    throw new Error(`${role} must require region scope.`);
  }
  if (scope === ROLE_SCOPE.BRANCH && !matrixEntry.requiresBranchScope) {
    throw new Error(`${role} must require branch scope.`);
  }
  if (
    scope === ROLE_SCOPE.ASSIGNED_TASKS &&
    !matrixEntry.requiresAssignedTaskScope
  ) {
    throw new Error(`${role} must require assigned task scope.`);
  }
}

for (const [role, dbRole] of Object.entries(ROLE_TO_DB_ROLE)) {
  if (!Object.values(OTOTR_DB_ROLES).includes(dbRole)) {
    throw new Error(`${role} maps to an unknown database role.`);
  }
}

const scenarioCount = Object.keys(AUTH_RLS_TEST_SCENARIOS).length;
if (scenarioCount < 10) {
  throw new Error('Auth RLS scenario coverage is too small for production review.');
}
