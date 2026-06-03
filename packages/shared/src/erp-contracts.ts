export const OTOTR_ROLES = {
  CEO: 'CEO',
  HQ_ADMIN: 'HQ_ADMIN',
  ADMIN: 'ADMIN',
  REGION_MANAGER: 'REGION_MANAGER',
  FRANCHISE_MANAGER: 'FRANCHISE_MANAGER',
  BRANCH_OWNER: 'BRANCH_OWNER',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  RECEPTION_STAFF: 'RECEPTION_STAFF',
  TECHNICIAN: 'TECHNICIAN',
  FINANCE: 'FINANCE',
  QUALITY: 'QUALITY',
  SUPPORT: 'SUPPORT',
  CUSTOMER_PUBLIC: 'CUSTOMER_PUBLIC',
} as const;

export type OtotrRole = (typeof OTOTR_ROLES)[keyof typeof OTOTR_ROLES];

export const OTOTR_DB_ROLES = {
  CEO: 'CEO',
  GENERAL_MANAGER: 'GENERAL_MANAGER',
  REGIONAL_MANAGER: 'REGIONAL_MANAGER',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  INSPECTION_TECHNICIAN: 'INSPECTION_TECHNICIAN',
  QUALITY_AUDITOR: 'QUALITY_AUDITOR',
  FINANCE: 'FINANCE',
  LEGAL: 'LEGAL',
} as const;

export type OtotrDbRole = (typeof OTOTR_DB_ROLES)[keyof typeof OTOTR_DB_ROLES];

export const ROLE_TO_DB_ROLE: Partial<Record<OtotrRole, OtotrDbRole>> = {
  [OTOTR_ROLES.CEO]: OTOTR_DB_ROLES.CEO,
  [OTOTR_ROLES.HQ_ADMIN]: OTOTR_DB_ROLES.GENERAL_MANAGER,
  [OTOTR_ROLES.ADMIN]: OTOTR_DB_ROLES.GENERAL_MANAGER,
  [OTOTR_ROLES.REGION_MANAGER]: OTOTR_DB_ROLES.REGIONAL_MANAGER,
  [OTOTR_ROLES.FRANCHISE_MANAGER]: OTOTR_DB_ROLES.GENERAL_MANAGER,
  [OTOTR_ROLES.BRANCH_OWNER]: OTOTR_DB_ROLES.BRANCH_MANAGER,
  [OTOTR_ROLES.BRANCH_MANAGER]: OTOTR_DB_ROLES.BRANCH_MANAGER,
  [OTOTR_ROLES.RECEPTION_STAFF]: OTOTR_DB_ROLES.BRANCH_MANAGER,
  [OTOTR_ROLES.TECHNICIAN]: OTOTR_DB_ROLES.INSPECTION_TECHNICIAN,
  [OTOTR_ROLES.FINANCE]: OTOTR_DB_ROLES.FINANCE,
  [OTOTR_ROLES.QUALITY]: OTOTR_DB_ROLES.QUALITY_AUDITOR,
};

export const DB_ROLE_TO_ROLE: Record<OtotrDbRole, OtotrRole> = {
  [OTOTR_DB_ROLES.CEO]: OTOTR_ROLES.CEO,
  [OTOTR_DB_ROLES.GENERAL_MANAGER]: OTOTR_ROLES.HQ_ADMIN,
  [OTOTR_DB_ROLES.REGIONAL_MANAGER]: OTOTR_ROLES.REGION_MANAGER,
  [OTOTR_DB_ROLES.BRANCH_MANAGER]: OTOTR_ROLES.BRANCH_MANAGER,
  [OTOTR_DB_ROLES.INSPECTION_TECHNICIAN]: OTOTR_ROLES.TECHNICIAN,
  [OTOTR_DB_ROLES.QUALITY_AUDITOR]: OTOTR_ROLES.QUALITY,
  [OTOTR_DB_ROLES.FINANCE]: OTOTR_ROLES.FINANCE,
  [OTOTR_DB_ROLES.LEGAL]: OTOTR_ROLES.ADMIN,
};

export const ROLE_SCOPE = {
  GLOBAL: 'GLOBAL',
  REGION: 'REGION',
  BRANCH: 'BRANCH',
  ASSIGNED_TASKS: 'ASSIGNED_TASKS',
  PUBLIC_REPORT: 'PUBLIC_REPORT',
} as const;

export type RoleScope = (typeof ROLE_SCOPE)[keyof typeof ROLE_SCOPE];

export const ROLE_SCOPE_MAP: Record<OtotrRole, RoleScope> = {
  [OTOTR_ROLES.CEO]: ROLE_SCOPE.GLOBAL,
  [OTOTR_ROLES.HQ_ADMIN]: ROLE_SCOPE.GLOBAL,
  [OTOTR_ROLES.ADMIN]: ROLE_SCOPE.GLOBAL,
  [OTOTR_ROLES.REGION_MANAGER]: ROLE_SCOPE.REGION,
  [OTOTR_ROLES.FRANCHISE_MANAGER]: ROLE_SCOPE.GLOBAL,
  [OTOTR_ROLES.BRANCH_OWNER]: ROLE_SCOPE.BRANCH,
  [OTOTR_ROLES.BRANCH_MANAGER]: ROLE_SCOPE.BRANCH,
  [OTOTR_ROLES.RECEPTION_STAFF]: ROLE_SCOPE.BRANCH,
  [OTOTR_ROLES.TECHNICIAN]: ROLE_SCOPE.ASSIGNED_TASKS,
  [OTOTR_ROLES.FINANCE]: ROLE_SCOPE.GLOBAL,
  [OTOTR_ROLES.QUALITY]: ROLE_SCOPE.GLOBAL,
  [OTOTR_ROLES.SUPPORT]: ROLE_SCOPE.GLOBAL,
  [OTOTR_ROLES.CUSTOMER_PUBLIC]: ROLE_SCOPE.PUBLIC_REPORT,
};

export const AUTH_ROLE_ACCESS_LEVEL = {
  GLOBAL_ADMIN: 'GLOBAL_ADMIN',
  GLOBAL_MODULE: 'GLOBAL_MODULE',
  REGION: 'REGION',
  BRANCH: 'BRANCH',
  ASSIGNED_TASKS: 'ASSIGNED_TASKS',
  PUBLIC_REPORT: 'PUBLIC_REPORT',
} as const;

export type AuthRoleAccessLevel =
  (typeof AUTH_ROLE_ACCESS_LEVEL)[keyof typeof AUTH_ROLE_ACCESS_LEVEL];

export type AuthRoleMatrixEntry = {
  role: OtotrRole;
  dbRole?: OtotrDbRole;
  accessLevel: AuthRoleAccessLevel;
  canReadGlobal: boolean;
  canManageBranch: boolean;
  canMutateFinance: boolean;
  canMutateTechnicianTasks: boolean;
  requiresBranchScope: boolean;
  requiresRegionScope: boolean;
  requiresAssignedTaskScope: boolean;
  publicReportOnly: boolean;
};

export const AUTH_ROLE_MATRIX: readonly AuthRoleMatrixEntry[] = [
  {
    role: OTOTR_ROLES.CEO,
    dbRole: OTOTR_DB_ROLES.CEO,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.GLOBAL_ADMIN,
    canReadGlobal: true,
    canManageBranch: true,
    canMutateFinance: true,
    canMutateTechnicianTasks: true,
    requiresBranchScope: false,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.HQ_ADMIN,
    dbRole: OTOTR_DB_ROLES.GENERAL_MANAGER,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.GLOBAL_ADMIN,
    canReadGlobal: true,
    canManageBranch: true,
    canMutateFinance: false,
    canMutateTechnicianTasks: true,
    requiresBranchScope: false,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.ADMIN,
    dbRole: OTOTR_DB_ROLES.GENERAL_MANAGER,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.GLOBAL_MODULE,
    canReadGlobal: true,
    canManageBranch: false,
    canMutateFinance: false,
    canMutateTechnicianTasks: false,
    requiresBranchScope: false,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.REGION_MANAGER,
    dbRole: OTOTR_DB_ROLES.REGIONAL_MANAGER,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.REGION,
    canReadGlobal: false,
    canManageBranch: false,
    canMutateFinance: false,
    canMutateTechnicianTasks: false,
    requiresBranchScope: false,
    requiresRegionScope: true,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.FRANCHISE_MANAGER,
    dbRole: OTOTR_DB_ROLES.GENERAL_MANAGER,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.GLOBAL_MODULE,
    canReadGlobal: true,
    canManageBranch: false,
    canMutateFinance: false,
    canMutateTechnicianTasks: false,
    requiresBranchScope: false,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.BRANCH_OWNER,
    dbRole: OTOTR_DB_ROLES.BRANCH_MANAGER,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.BRANCH,
    canReadGlobal: false,
    canManageBranch: true,
    canMutateFinance: false,
    canMutateTechnicianTasks: false,
    requiresBranchScope: true,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.BRANCH_MANAGER,
    dbRole: OTOTR_DB_ROLES.BRANCH_MANAGER,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.BRANCH,
    canReadGlobal: false,
    canManageBranch: true,
    canMutateFinance: false,
    canMutateTechnicianTasks: true,
    requiresBranchScope: true,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.RECEPTION_STAFF,
    dbRole: OTOTR_DB_ROLES.BRANCH_MANAGER,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.BRANCH,
    canReadGlobal: false,
    canManageBranch: false,
    canMutateFinance: false,
    canMutateTechnicianTasks: false,
    requiresBranchScope: true,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.TECHNICIAN,
    dbRole: OTOTR_DB_ROLES.INSPECTION_TECHNICIAN,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.ASSIGNED_TASKS,
    canReadGlobal: false,
    canManageBranch: false,
    canMutateFinance: false,
    canMutateTechnicianTasks: true,
    requiresBranchScope: true,
    requiresRegionScope: false,
    requiresAssignedTaskScope: true,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.FINANCE,
    dbRole: OTOTR_DB_ROLES.FINANCE,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.GLOBAL_MODULE,
    canReadGlobal: true,
    canManageBranch: false,
    canMutateFinance: true,
    canMutateTechnicianTasks: false,
    requiresBranchScope: false,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.QUALITY,
    dbRole: OTOTR_DB_ROLES.QUALITY_AUDITOR,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.GLOBAL_MODULE,
    canReadGlobal: true,
    canManageBranch: false,
    canMutateFinance: false,
    canMutateTechnicianTasks: false,
    requiresBranchScope: false,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.SUPPORT,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.GLOBAL_MODULE,
    canReadGlobal: true,
    canManageBranch: false,
    canMutateFinance: false,
    canMutateTechnicianTasks: false,
    requiresBranchScope: false,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: false,
  },
  {
    role: OTOTR_ROLES.CUSTOMER_PUBLIC,
    accessLevel: AUTH_ROLE_ACCESS_LEVEL.PUBLIC_REPORT,
    canReadGlobal: false,
    canManageBranch: false,
    canMutateFinance: false,
    canMutateTechnicianTasks: false,
    requiresBranchScope: false,
    requiresRegionScope: false,
    requiresAssignedTaskScope: false,
    publicReportOnly: true,
  },
] as const;

export const AUTH_RLS_TEST_SCENARIOS = {
  UNAUTHENTICATED_OPERATIONAL_TABLES_DENIED:
    'UNAUTHENTICATED_OPERATIONAL_TABLES_DENIED',
  AUTHENTICATED_WITHOUT_APP_USER_DENIED:
    'AUTHENTICATED_WITHOUT_APP_USER_DENIED',
  CEO_GLOBAL_READ_ALLOWED: 'CEO_GLOBAL_READ_ALLOWED',
  REGION_MANAGER_ASSIGNED_REGION_ALLOWED:
    'REGION_MANAGER_ASSIGNED_REGION_ALLOWED',
  REGION_MANAGER_OTHER_REGION_DENIED: 'REGION_MANAGER_OTHER_REGION_DENIED',
  BRANCH_MANAGER_OWN_BRANCH_ALLOWED: 'BRANCH_MANAGER_OWN_BRANCH_ALLOWED',
  BRANCH_MANAGER_OTHER_BRANCH_DENIED: 'BRANCH_MANAGER_OTHER_BRANCH_DENIED',
  TECHNICIAN_ASSIGNED_TASK_ALLOWED: 'TECHNICIAN_ASSIGNED_TASK_ALLOWED',
  TECHNICIAN_UNASSIGNED_TASK_DENIED: 'TECHNICIAN_UNASSIGNED_TASK_DENIED',
  PUBLIC_VERIFIED_REPORT_ALLOWED: 'PUBLIC_VERIFIED_REPORT_ALLOWED',
  PUBLIC_RAW_OPERATIONAL_TABLES_DENIED: 'PUBLIC_RAW_OPERATIONAL_TABLES_DENIED',
  SERVICE_ROLE_ONLY_WITH_CLIENT_KEY_DENIED:
    'SERVICE_ROLE_ONLY_WITH_CLIENT_KEY_DENIED',
} as const;

export type AuthRlsTestScenario =
  (typeof AUTH_RLS_TEST_SCENARIOS)[keyof typeof AUTH_RLS_TEST_SCENARIOS];

export const APPOINTMENT_STATUS = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  ARRIVED: 'ARRIVED',
  INTAKE_STARTED: 'INTAKE_STARTED',
  CONVERTED_TO_WORK_ORDER: 'CONVERTED_TO_WORK_ORDER',
  NO_SHOW: 'NO_SHOW',
  CANCELLED: 'CANCELLED',
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const APPOINTMENT_CONVERTIBLE_STATUSES = [
  APPOINTMENT_STATUS.CONFIRMED,
  APPOINTMENT_STATUS.ARRIVED,
  APPOINTMENT_STATUS.INTAKE_STARTED,
] as const;

export const WORK_ORDER_STATUS = {
  DRAFT: 'DRAFT',
  CUSTOMER_WAITING: 'CUSTOMER_WAITING',
  VEHICLE_ACCEPTED: 'VEHICLE_ACCEPTED',
  TECHNICAL_ASSIGNMENT_READY: 'TECHNICAL_ASSIGNMENT_READY',
  START_EVIDENCE_REQUIRED: 'START_EVIDENCE_REQUIRED',
  INSPECTION_WAITING: 'INSPECTION_WAITING',
  INSPECTION_IN_PROGRESS: 'INSPECTION_IN_PROGRESS',
  EVIDENCE_MISSING: 'EVIDENCE_MISSING',
  MANAGER_REVIEW: 'MANAGER_REVIEW',
  MANAGER_RETURNED: 'MANAGER_RETURNED',
  REPORT_GATE_BLOCKED: 'REPORT_GATE_BLOCKED',
  REPORT_GATE_READY: 'REPORT_GATE_READY',
  REPORT_PREPARING: 'REPORT_PREPARING',
  APPROVAL_WAITING: 'APPROVAL_WAITING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type WorkOrderStatus =
  (typeof WORK_ORDER_STATUS)[keyof typeof WORK_ORDER_STATUS];

export const WORK_ORDER_GATE = {
  APPOINTMENT_READY: 'APPOINTMENT_READY',
  VEHICLE_INTAKE_READY: 'VEHICLE_INTAKE_READY',
  CUSTOMER_CONSENT_READY: 'CUSTOMER_CONSENT_READY',
  PACKAGE_APPROVED: 'PACKAGE_APPROVED',
  TECHNICAL_ASSIGNMENT_READY: 'TECHNICAL_ASSIGNMENT_READY',
  TECHNICIAN_START_EVIDENCE_READY: 'TECHNICIAN_START_EVIDENCE_READY',
  INSPECTION_MODULES_READY: 'INSPECTION_MODULES_READY',
  REQUIRED_PHOTOS_READY: 'REQUIRED_PHOTOS_READY',
  EXTERNAL_QUERIES_READY: 'EXTERNAL_QUERIES_READY',
  QUALITY_APPROVED: 'QUALITY_APPROVED',
  REPORT_PRINTED: 'REPORT_PRINTED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  HANDOVER_APPROVED: 'HANDOVER_APPROVED',
  DELIVERY_READY: 'DELIVERY_READY',
} as const;

export type WorkOrderGate =
  (typeof WORK_ORDER_GATE)[keyof typeof WORK_ORDER_GATE];

export const WORK_ORDER_TASK_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type WorkOrderTaskStatus =
  (typeof WORK_ORDER_TASK_STATUS)[keyof typeof WORK_ORDER_TASK_STATUS];

export const CAPACITY_RISK_LEVEL = {
  GREEN: 'GREEN',
  AMBER: 'AMBER',
  RED: 'RED',
} as const;

export type CapacityRiskLevel =
  (typeof CAPACITY_RISK_LEVEL)[keyof typeof CAPACITY_RISK_LEVEL];

export type BranchCapacityInput = {
  branchId: string;
  workingMinutesPerDay: number;
  liftCount: number;
  bayCount: number;
  activeTechnicianCount: number;
  technicianShiftMinutes: number;
  scheduledPackageMinutes: number;
  walkInBufferMinutes: number;
};

export type BranchCapacitySnapshot = BranchCapacityInput & {
  physicalCapacityMinutes: number;
  technicianCapacityMinutes: number;
  usableCapacityMinutes: number;
  loadMinutes: number;
  loadRatio: number;
  riskLevel: CapacityRiskLevel;
};

export type AppointmentConversionRequest = {
  appointmentId: string;
  branchId: string;
  packagePlanId: string;
  assignedTechnicianId?: string | null;
  vehicleIntake: {
    plate?: string;
    vin?: string;
    mileageKm?: number;
  };
  consents: {
    kvkkReady: boolean;
    scopeAccepted: boolean;
    roadTestAccepted?: boolean;
  };
  notes?: string;
};

export type AppointmentConversionResponse = {
  ok: true;
  appointmentId: string;
  expertiseCaseId: string;
  workOrderNo: string;
  createdTaskCount: number;
  nextStatus: WorkOrderStatus;
};

export const APPOINTMENT_CONVERSION_ERROR = {
  SCOPE_DENIED: 'SCOPE_DENIED',
  INVALID_APPOINTMENT_STATE: 'INVALID_APPOINTMENT_STATE',
  MISSING_CUSTOMER: 'MISSING_CUSTOMER',
  MISSING_VEHICLE: 'MISSING_VEHICLE',
  MISSING_PACKAGE: 'MISSING_PACKAGE',
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  ALREADY_CONVERTED: 'ALREADY_CONVERTED',
} as const;

export type AppointmentConversionError =
  (typeof APPOINTMENT_CONVERSION_ERROR)[keyof typeof APPOINTMENT_CONVERSION_ERROR];
