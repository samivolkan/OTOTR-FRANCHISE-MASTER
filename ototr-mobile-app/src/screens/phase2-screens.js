import {
  approvalSentWaitingData,
  bodyPanels,
  blockingIssues,
  checklistItems,
  customerSummaryData,
  customerSummarySections,
  dailyPlan,
  emptyStateCopy,
  evidenceSlots,
  expertiseModuleForms,
  expertiseSchemaStats,
  fieldValidationHints,
  finalApprovalGate,
  finalApprovalWarnings,
  finalChecklist,
  finalReportPreviewData,
  highlightedWorkOrder,
  issueAlerts,
  moduleCatalog,
  notificationsFeed,
  offlineQueue,
  permissionsMatrix,
  phase2ComponentRoutes,
  referenceScreens,
  routeMetaById,
  quickActions,
  reportApprovedData,
  reportBlockedData,
  reportHistory,
  revisionRequestData,
  summaryStats,
  syncFailures,
  technicianSession,
  technicalApprovalDetail,
  technicalApprovalQueue,
  technicalApprovalFlow,
  technicalApprovalTerminology,
  unresolvedSelectedOptions,
  workOrders
} from "../data/mock-data.js";
import {
  getRuntimeWorkOrders,
  getSelectedWorkOrder,
  getVehicleImagePath,
  getWorkOrderTargetRoute,
  mockWorkOrders,
  setSelectedWorkOrder,
  workOrderStatusLabels,
  workOrderStatusTones
} from "../data/mockWorkOrders.js";
import {
  getEvidenceUploadConfigStatus,
  syncEvidenceCaptures
} from "../services/evidenceUploadService.js";
import {
  getCachedLiveWorkOrders,
  getLiveWorkOrderSyncStatus,
  syncLiveWorkOrders
} from "../services/liveWorkOrdersService.js";
import { getInspectionPackageModuleIds } from "../services/inspectionPackageCatalog.js";
import { saveMobileInspectionAnswer } from "../services/mobileInspectionAnswerService.js";
import {
  claimInspectionTaskForModule,
  releaseInspectionTaskForModule,
  submitInspectionTaskForModule
} from "../services/mobileInspectionTaskService.js";
import {
  fetchTechnicalApprovalGate,
  getCachedTechnicalApprovalGate
} from "../services/technicalApprovalGateService.js";
import {
  generateFinalReportPayload,
  getCachedFinalReport
} from "../services/finalReportService.js";
import { transitionLiveWorkOrderStatus } from "../services/liveWorkOrderStatusService.js";

const shellRoutes = new Set([
  "login",
  "branch",
  "password",
  "forgot-password",
  "reset-password",
  "home",
  "jobs",
  "detail",
  "job-detail",
  "start",
  "start-proof",
  "start-proof-success",
  "modules",
  "tests",
  "lock",
  "taskTransfer",
  "permissionDenied",
  "moduleControl",
  "itemDetail",
  "statusModal",
  "evidence",
  "camera",
  "photoApproval",
  "photoUploadError",
  "issues",
  "blockingIssues",
  "missing",
  "customerSummary",
  "customer-summary",
  "finalReport",
  "final-report",
  "approvalWaiting",
  "approval-waiting",
  "completed",
  "summary",
  "returned",
  "help",
  "reports",
  "notifications",
  "permissions",
  "offlineSync",
  "offline-sync",
  "syncError",
  "sync-error",
  "emptyState",
  "empty-state",
  "profile"
]);

const authStorageKeys = Object.freeze([
  "ototrAuth",
  "ototrBranch",
  "ototrBranchName",
  "ototrDefaultBranch",
  "ototrRememberMe",
  "ototrUser",
  "ototrResetTarget",
  "ototrSelectedWorkOrder",
  "ototrWorkflowState"
]);

const taskNavRoutes = new Set([
  "start",
  "start-proof",
  "start-proof-success",
  "modules",
  "tests",
  "lock",
  "taskTransfer",
  "permissionDenied",
  "moduleControl",
  "itemDetail",
  "statusModal",
  "evidence",
  "camera",
  "photoApproval",
  "photoUploadError"
]);

const phase1ExtraRoutes = Object.freeze([
  "section-owned",
  "manager-takeover-success",
  "save-success",
  "save-continue",
  "unsaved-changes",
  "discard-changes",
  "section-completed",
  "all-sections-completed",
  "report-created",
  "required-fields-missing",
  "evidence-sync-queue",
  "offline-warning",
  "task-transfer-confirm",
  "task-transferred",
  "pre-approval-check",
  "technical-approval-submitted",
  "technical-revision-request",
  "approved-locked-report",
  "cancelled-job",
  "unauthorized",
  "operation-failed",
  "profile-setting-detail"
]);

phase1ExtraRoutes.forEach((route) => shellRoutes.add(route));

const fullscreenTransitionRoutes = new Set([
  "splash",
  "lock",
  "taskTransfer",
  "start-proof-success",
  "section-owned",
  "manager-takeover-success",
  "save-success",
  "save-continue",
  "unsaved-changes",
  "discard-changes",
  "section-completed",
  "all-sections-completed",
  "report-created",
  "required-fields-missing",
  "offline-warning",
  "task-transfer-confirm",
  "task-transferred",
  "technical-approval-submitted",
  "unauthorized",
  "operation-failed"
]);

const branchOptions = Object.freeze([
  { id: "istanbul-kadikoy", name: "İstanbul Kadıköy Şubesi", city: "İstanbul", code: "IST-KDK-01" },
  { id: "bursa-kucuk-sanayi", name: "Bursa Küçük Sanayi Şubesi", city: "Bursa", code: "BURSA-01" },
  { id: "istanbul-avrupa", name: "İstanbul Avrupa Şubesi", city: "İstanbul", code: "IST-AVR-01" },
  { id: "izmir-sube", name: "İzmir Şubesi", city: "İzmir", code: "IZMIR-01" }
]);

const technicianProfile = Object.freeze({
  name: "Mehmet Demir",
  title: "Kıdemli Ekspertiz Teknisyeni",
  technicianId: "TX-2024-0158",
  email: "mehmet.demir@mobilapk.com",
  phone: "+90 555 123 45 67",
  performanceScore: "4.8",
  completedOrders: 128,
  approvalRate: "96%",
  customerRating: "4.8",
  dailyAverageOrders: 12,
  appVersion: "v2.3.1",
  notificationCount: 3
});

const permissionRoleSummary = Object.freeze({
  name: "Ahmet Usta",
  title: "Ekspertiz Teknisyeni",
  branch: "İstanbul Kadıköy Şubesi",
  activeCount: 5,
  limitedCount: 1,
  deniedCount: 1
});

let liveWorkOrdersSyncStarted = false;
let liveWorkOrdersSyncInFlight = false;
let liveWorkOrdersSyncTimer = null;
const liveWorkOrdersRefreshRoutes = new Set(["home", "jobs", "job-detail", "detail"]);
const liveWorkOrdersSyncIntervalMs = 5000;

function getCurrentRouteId() {
  return window.location.hash.replace(/^#/, "") || "home";
}

function liveWorkOrdersFingerprint() {
  return getCachedLiveWorkOrders()
    .map((order) => [
      order.id,
      order.plate,
      order.status,
      order.progress,
      order.completedItems,
      order.totalItems
    ].join(":"))
    .join("|");
}

async function runLiveWorkOrdersSync(onNavigate, { forceRender = false } = {}) {
  const status = getLiveWorkOrderSyncStatus();
  if (!status.configured || (!status.authenticated && !status.refreshable) || liveWorkOrdersSyncInFlight) return;

  liveWorkOrdersSyncInFlight = true;
  const before = liveWorkOrdersFingerprint();
  try {
    const result = await syncLiveWorkOrders();
    if (!result.ok || !result.rows?.length) return;
    const route = getCurrentRouteId();
    const changed = before !== liveWorkOrdersFingerprint();
    if ((forceRender || changed) && liveWorkOrdersRefreshRoutes.has(route)) {
      onNavigate?.(route);
    }
  } catch {
    // Live sync should not block the technician flow.
  } finally {
    liveWorkOrdersSyncInFlight = false;
  }
}

function ensureLiveWorkOrdersSync(onNavigate) {
  if (liveWorkOrdersSyncStarted) return;
  const status = getLiveWorkOrderSyncStatus();
  if (!status.configured || (!status.authenticated && !status.refreshable)) return;
  liveWorkOrdersSyncStarted = true;
  runLiveWorkOrdersSync(onNavigate, { forceRender: true });
  liveWorkOrdersSyncTimer = window.setInterval(() => {
    runLiveWorkOrdersSync(onNavigate);
  }, liveWorkOrdersSyncIntervalMs);
}

async function syncLiveWorkOrdersBeforeRoute(onNavigate, targetRoute) {
  const status = getLiveWorkOrderSyncStatus();
  if (status.configured && status.authenticated) {
    try {
      await Promise.race([
        syncLiveWorkOrders(),
        new Promise((resolve) => window.setTimeout(resolve, 1200))
      ]);
    } catch {
      // Keep auth and branch flow usable even when live sync fails.
    }
  }
  onNavigate(targetRoute);
}

function getBranchById(branchId) {
  return branchOptions.find((branch) => branch.id === branchId);
}

function getStoredBranchName() {
  const storedBranchId = localStorage.getItem("ototrBranch");
  const branchById = getBranchById(storedBranchId);
  if (branchById?.name) return branchById.name;
  if (storedBranchId === "bursa") return "Bursa Küçük Sanayi Şubesi";
  if (storedBranchId === "istanbul") return "İstanbul Kadıköy Şubesi";
  if (storedBranchId === "istanbul-kadikoy") return "İstanbul Kadıköy Şubesi";
  if (storedBranchId === "izmir") return "İzmir Şubesi";
  const storedBranchName = localStorage.getItem("ototrBranchName");
  if (storedBranchName && !/[?\uFFFD]/.test(storedBranchName)) return storedBranchName;
  return getBranchById(storedBranchId)?.name
    ?? storedBranchId
    ?? technicianSession.activeBranch
    ?? "İstanbul Kadıköy Şubesi";
}

function setBranchReturnRoute(routeId) {
  try {
    sessionStorage.setItem("ototrBranchReturnRoute", routeId);
  } catch {
    // Session storage may be unavailable in restricted WebViews.
  }
}

function getBranchReturnRoute() {
  try {
    return sessionStorage.getItem("ototrBranchReturnRoute") || "";
  } catch {
    return "";
  }
}

function clearBranchReturnRoute() {
  try {
    sessionStorage.removeItem("ototrBranchReturnRoute");
  } catch {
    // Session storage may be unavailable in restricted WebViews.
  }
}

const issueNavRoutes = new Set([
  "issues",
  "blockingIssues",
  "missing",
  "returned"
]);

const approvedReferenceRouteByRoute = Object.freeze({
  detail: "detail",
  "job-detail": "detail",
  modules: "modules",
  tests: "modules",
  lock: "lock",
  taskTransfer: "taskTransfer",
  permissionDenied: "permissionDenied",
  moduleControl: "moduleControl",
  itemDetail: "itemDetail",
  statusModal: "statusModal",
  evidence: "evidence",
  camera: "camera",
  photoApproval: "photoApproval",
  photoUploadError: "photoUploadError",
  issues: "issues",
  blockingIssues: "blockingIssues",
  customerSummary: "customerSummary",
  "customer-summary": "customerSummary",
  finalReport: "finalReport",
  "final-report": "finalReport",
  approvalWaiting: "approvalWaiting",
  "approval-waiting": "approvalWaiting",
  completed: "completed",
  summary: "completed",
  returned: "returned",
  notifications: "notifications",
  permissions: "permissions",
  offlineSync: "offlineSync",
  "offline-sync": "offlineSync",
  syncError: "syncError",
  "sync-error": "syncError",
  emptyState: "emptyState",
  "empty-state": "emptyState",
  help: "help",
  reports: "reports"
});

const approvedReferenceVisualRoutes = new Set(
  Object.keys(approvedReferenceRouteByRoute).filter((route) => ![
    "detail",
    "job-detail",
    "taskTransfer",
    "lock",
    "modules",
    "tests",
    "moduleControl",
    "itemDetail",
    "statusModal",
    "evidence",
    "camera",
    "finalReport",
    "final-report",
    "approvalWaiting",
    "approval-waiting",
    "completed",
    "summary",
    "reports",
    "emptyState",
    "empty-state"
  ].includes(route))
);

const approvedReferenceFlowByRoute = Object.freeze({
  modules: { back: "job-detail", previous: "start-proof", next: "lock", primary: "moduleControl" },
  lock: { back: "tests", previous: "modules", next: "taskTransfer", primary: "moduleControl" },
  taskTransfer: { back: "tests", previous: "lock", next: "tests", primary: "tests" },
  permissionDenied: { back: "tests", previous: "taskTransfer", next: "moduleControl", primary: "tests" },
  moduleControl: { back: "tests", previous: "permissionDenied", next: "statusModal", primary: "statusModal" },
  itemDetail: { back: "moduleControl", previous: "moduleControl", next: "statusModal", primary: "statusModal" },
  statusModal: { back: "moduleControl", previous: "moduleControl", next: "moduleControl", primary: "moduleControl" },
  evidence: { back: "statusModal", previous: "statusModal", next: "camera", primary: "camera" },
  camera: { back: "evidence", previous: "evidence", next: "photoApproval", primary: "photoApproval" },
  photoApproval: { back: "evidence", previous: "camera", next: "photoUploadError", primary: "evidence" },
  photoUploadError: { back: "evidence", previous: "photoApproval", next: "issues", primary: "evidence" },
  issues: { back: "tests", previous: "photoUploadError", next: "blockingIssues", primary: "tests" },
  blockingIssues: { back: "missing", previous: "issues", next: "customer-summary", primary: "missing" },
  customerSummary: { back: "missing", previous: "blockingIssues", next: "final-report", primary: "final-report" },
  finalReport: { back: "customer-summary", previous: "customer-summary", next: "completed", primary: "completed" },
  approvalWaiting: { back: "final-report", previous: "finalReport", next: "summary", primary: "summary" },
  completed: { back: "jobs", previous: "finalReport", next: "returned", primary: "jobs" },
  returned: { back: "jobs", previous: "completed", next: "notifications", primary: "missing" },
  notifications: { back: "home", previous: "returned", next: "profile", primary: "home" },
  permissions: { back: "profile", previous: "profile", next: "offline-sync", primary: "profile" },
  offlineSync: { back: "profile", previous: "permissions", next: "sync-error", primary: "sync-error" },
  syncError: { back: "offline-sync", previous: "offlineSync", next: "empty-state", primary: "offline-sync" },
  emptyState: { back: "jobs", previous: "syncError", next: "help", primary: "jobs" },
  help: { back: "profile", previous: "emptyState", next: "reports", primary: "profile" },
  reports: { back: "profile", previous: "help", next: "home", primary: "profile" }
});

const jobsApprovedOrders = Object.freeze([
  {
    plate: "16 ABC 123",
    brandModel: "BMW 3 Serisi",
    year: "2021",
    engine: "320i",
    km: "45.000 km",
    status: "Devam Ediyor",
    statusTone: "success",
    missing: "2 Eksik",
    progress: 65,
    completedItems: 34,
    totalItems: 60,
    progressTone: "red",
    image: "./src/assets/approved-group2/job-car-1.png"
  },
  {
    plate: "34 DFG 456",
    brandModel: "Volkswagen Passat",
    year: "2020",
    engine: "1.6 TDI",
    km: "62.500 km",
    status: "Beklemede",
    statusTone: "warning",
    missing: "1 Eksik",
    progress: 40,
    progressTone: "orange",
    image: "./src/assets/approved-group2/job-car-2.png"
  },
  {
    plate: "35 KLM 789",
    brandModel: "Renault Megane",
    year: "2019",
    engine: "1.5 dCi",
    km: "78.300 km",
    status: "Eksik / Uyarı",
    statusTone: "red",
    missing: "3 Eksik",
    progress: 25,
    progressTone: "red",
    image: "./src/assets/approved-group2/job-car-3.png"
  },
  {
    plate: "16 HJK 321",
    brandModel: "Peugeot 508",
    year: "2022",
    engine: "1.5 BlueHDi",
    km: "33.100 km",
    status: "Devam Ediyor",
    statusTone: "success",
    missing: "",
    progress: 80,
    progressTone: "success",
    image: "./src/assets/approved-group2/job-car-4.png"
  },
  {
    plate: "06 MNO 654",
    brandModel: "Toyota Corolla",
    year: "2021",
    engine: "1.5 Hybrid",
    km: "27.800 km",
    status: "Tamamlandı",
    statusTone: "purple",
    missing: "",
    progress: 100,
    progressTone: "purple",
    image: "./src/assets/approved-group2/job-car-5.png"
  }
]);

const icons = Object.freeze({
  alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v5M12 18h.01" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 20a2 2 0 004 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V5l8-2 8 4v14M8 9h2M8 13h2M8 17h2M14 11h2M14 15h2M3 21h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h4l2-3h4l2 3h4v12H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="14" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15l1.8-5.2A3 3 0 019.6 8h4.8a3 3 0 012.8 1.8L19 15M4 15h16v4H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="7" cy="19" r="1.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="19" r="1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v4M17 3v4M4 9h16M5 5h14v16H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1113.5 5.8L12 20H4.8l1.7-4A7.8 7.8 0 014 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 11h.01M12 11h.01M16 11h.01" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6l1 2h3v15H5V6h3l1-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 10h6M9 14h6M9 18h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M8 11l4 4 4-4M5 20h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  electric: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13 6l-3 6h4l-3 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5A3.5 3.5 0 018.5 2H20v17H8.5A3.5 3.5 0 005 22V5.5zM5 5.5A3.5 3.5 0 011.5 2H1v17h.5A3.5 3.5 0 015 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v5M12 8h.01" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  report: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h8l4 4v14H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M15 3v5h5M10 12h6M10 16h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  key: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 12l8-8M17 6l2 2M14 9l2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  location: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-13a7 7 0 10-14 0c0 6.8 7 13 7 13z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c2.3 2.4 3.5 5.4 3.5 9S14.3 18.6 12 21c-2.3-2.4-3.5-5.4-3.5-9S9.7 5.4 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  engine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h3l2-3h5l2 3h2v3h2v5h-4l-2 2H9l-2-2H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4h6M12 4v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8V5a2 2 0 00-2-2H5v18h7a2 2 0 002-2v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 12h10M16 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4h3l1.5 4-2 1.2a12 12 0 005.8 5.8l1.2-2 4 1.5v3A2.5 2.5 0 0117.5 21 14.5 14.5 0 013 6.5 2.5 2.5 0 015.5 4h1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  gauge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17a8 8 0 1116 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 16l4-5M7 17h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h11M19 18h1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  sync: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.2 10A6.5 6.5 0 007.4 6.6L4 10M5.8 14a6.5 6.5 0 0010.8 3.4L20 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7V5h6v2M4 8h16v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 13h16M10 13v2h4v-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  scan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H4v4M17 3h3v4M7 21H4v-4M17 21h3v-4M8 12h8M12 8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v14M9 6l3-3 3 3M5 16v2a3 3 0 003 3h8a3 3 0 003-3v-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M8 10l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 12l2 2 4-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.8l1-6.1-4.4-4.3 6.1-.9L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  headset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13a8 8 0 0116 0v4a2 2 0 01-2 2h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 13v3a2 2 0 002 2h1v-7H6a2 2 0 00-2 2zM20 13v3a2 2 0 01-2 2h-1v-7h1a2 2 0 012 2zM14 21h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  userPlus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 12a4 4 0 100-8 4 4 0 000 8zM3 21a7 7 0 0114 0M19 8v6M16 11h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9v5M12 18h.01" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6a4 4 0 015 5l-9 9-4 1 1-4 9-9a4 4 0 01-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  panel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18V7.5C4 5.6 5.6 4 7.5 4H20v14H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 18V7h8M17 10h1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  returnLeft: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14l-5-5 5-5M4 9h10a6 6 0 010 12h-2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  xCircle: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 9l6 6M15 9l-6 6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>'
});

const lockedSectionDefault = Object.freeze({
  sectionName: "Kaporta Panel Kontrolü",
  status: "Kilitli",
  lockedBy: "Mehmet Usta",
  lockedAt: "12.05.2025 09:15",
  currentUserCanEdit: false,
  readOnlyTarget: "itemDetail",
  managerRequestTarget: "taskTransfer",
  currentUser: "Ahmet Usta",
  takeoverReasons: ["Usta müsait değil", "İş akışı gecikiyor", "Teknik destek gerekiyor", "Diğer"],
  takeoverMaxDescriptionLength: 250
});

const moduleForms = Object.freeze(moduleCatalog.map((module) => ({
  key: module.formKey || module.id,
  title: module.title,
  form: expertiseModuleForms[module.formKey || module.id]
})));

const inspectionDisplayTitles = Object.freeze({
  motor: [
    "Motor Yağ Kaçağı Var mı?",
    "Motor Üst Kapak Durumu",
    "Turbo Hortumları Sağlam mı?",
    "Radyatör ve Soğutma Kaçağı",
    "Motor Çalışma Sesi Normal mi?",
    "Şase No / Motor No Kontrolü",
    "Akü ve Şarj Durumu",
    "Kayış ve Gergi Kontrolü",
    "Sıvı Seviyeleri Uygun mu?",
    "Motor Arıza Lambası Yanıyor mu?"
  ],
  mechanic: [
    "Ön Takım Boşluğu Var mı?",
    "Aks Körükleri Sağlam mı?",
    "Rot / Rotil Kontrolü",
    "Alt Salıncak Burçları",
    "Amortisör Kaçağı Var mı?",
    "Direksiyon Kutusu Boşluğu",
    "Şanzıman Alt Kaçak Kontrolü",
    "Egzoz Hattı ve Askıları",
    "Karter Koruma Durumu",
    "Diferansiyel / Aktarma Kontrolü"
  ],
  brakeSuspension: [
    "Ön Fren Balataları",
    "Arka Fren Balataları",
    "Disk Yüzey Durumu",
    "Fren Hidrolik Kaçağı",
    "El Freni Tutuyor mu?",
    "Ön Amortisör Performansı",
    "Arka Amortisör Performansı",
    "Süspansiyon Ses Kontrolü"
  ],
  kaporta: [
    "Araç Genelinde Dolu Hasarı Mevcut mu?",
    "Sağ Ön Kapı İçi",
    "Sağ Ön Şasi Ucu",
    "Sol Ön Kapı İçi",
    "Sol Ön Şasi Ucu",
    "Araç Alt Ön Kısım Fotoğrafı",
    "Gösterge Panelinde Airbag Işığı Yanıyor mu?",
    "Ön Tampon Durumu",
    "Motor Kaputu Boya Kontrolü",
    "Sağ Ön Çamurluk",
    "Sol Ön Çamurluk",
    "Sağ Arka Kapı",
    "Sol Arka Kapı",
    "Sağ Arka Çamurluk",
    "Sol Arka Çamurluk",
    "Bagaj Kapağı",
    "Tavan Sacı",
    "Şasi Podye Kontrolü"
  ],
  electric: [
    "Farlar ve Aydınlatma Çalışıyor mu?",
    "Sinyal / Dörtlü Kontrolü",
    "Cam Düğmeleri Çalışıyor mu?",
    "Merkezi Kilit Çalışıyor mu?",
    "Klima Paneli Çalışıyor mu?",
    "Multimedya Ekranı Açılıyor mu?",
    "Park Sensörü / Kamera Kontrolü",
    "OBD Ön Elektrik Hatası Var mı?"
  ],
  brain: [
    "Motor ECU Hata Kodu Var mı?",
    "Şanzıman Modülü Hata Kodu",
    "ABS / ESP Hata Kaydı",
    "Airbag Modülü Hata Kaydı",
    "BCM / Gövde Kontrol Modülü",
    "Kilometre / Beyin Uyuşmazlığı",
    "Silinen Arıza Tekrarlıyor mu?",
    "OBD Genel Sistem Sağlığı"
  ],
  roadTest: [
    "Yol Testinde Çekiş ve Yürüyen Kontrolü"
  ],
  interiorExterior: [
    "Ön Cam Durumu",
    "Arka Cam Durumu",
    "Sağ Aynalar ve Kumanda",
    "Sol Aynalar ve Kumanda",
    "Torpido ve İç Trim",
    "Tavan Döşemesi",
    "Sürücü Koltuğu Mekanizması",
    "Yolcu Koltuğu Mekanizması",
    "Arka Koltuk ve Emniyetler",
    "Kapı Döşemeleri",
    "Bagaj İç Trim",
    "Jant ve Lastik Görseli",
    "Yedek Lastik / Stepne",
    "Kriko / Bijon Takımı",
    "Dış Plastik Aksam",
    "Silecekler ve Fiskiyeler"
  ],
  airbag: [
    "Airbag Lambası Sabit Yanıyor mu?",
    "Kemer Uyarı Sistemi Çalışıyor mu?",
    "SRS Hata Kaydı Var mı?",
    "Direksiyon Airbag Kapağı Durumu",
    "Yolcu Airbag Bölgesi Durumu"
  ],
  conta: [
    "Conta Kaçak Testi Yapıldı mı?",
    "Suya Yağ Karışımı Belirtisi Var mı?",
    "Egzoz Dumanı Anormal mi?",
    "Basınç / Kaçak Bulgusu Var mı?"
  ]
});

export function createPhase2Screen(activeRoute, onNavigate, { createBottomNav } = {}) {
  if (!phase2ComponentRoutes.includes(activeRoute)) return null;
  const approvedReferenceRoute = approvedReferenceRouteByRoute[activeRoute];
  const usesApprovedReferenceVisual = approvedReferenceVisualRoutes.has(activeRoute) && Boolean(approvedReferenceRoute);

  const screen = element("div", {
    className: `app-shell app-screen phase2-screen phase2-${activeRoute}${usesApprovedReferenceVisual ? " has-approved-reference-visual" : ""}`,
    dataset: { phase2Route: activeRoute }
  });

  const renderers = {
    splash: () => renderSplash(onNavigate),
    login: () => renderLogin(onNavigate),
    branch: () => renderBranch(onNavigate),
    password: () => ForgotPasswordScreen(onNavigate),
    "forgot-password": () => ForgotPasswordScreen(onNavigate),
    "reset-password": () => renderResetPassword(onNavigate),
    home: () => renderHome(onNavigate),
    jobs: () => renderJobs(onNavigate),
    detail: () => renderDetail(onNavigate),
    "job-detail": () => renderDetail(onNavigate),
    start: () => renderStart(onNavigate),
    "start-proof": () => renderStart(onNavigate),
    "start-proof-success": () => renderStartProofSuccess(onNavigate),
    "section-owned": () => renderSectionOwnedSuccess(onNavigate),
    "manager-takeover-success": () => renderManagerTakeoverSuccess(onNavigate),
    "save-success": () => renderSaveSuccess(onNavigate),
    "save-continue": () => renderSaveAndContinue(onNavigate),
    "unsaved-changes": () => renderUnsavedChangesWarning(onNavigate),
    "discard-changes": () => renderDiscardChangesConfirm(onNavigate),
    "section-completed": () => renderSectionCompletedSuccess(onNavigate),
    "all-sections-completed": () => renderAllSectionsCompleted(onNavigate),
    "report-created": () => renderReportCreatedSuccess(onNavigate),
    "required-fields-missing": () => renderRequiredFieldsMissing(onNavigate),
    "evidence-sync-queue": () => renderEvidenceSyncQueue(onNavigate),
    "offline-warning": () => renderOfflineWorkWarning(onNavigate),
    "task-transfer-confirm": () => renderTaskTransferConfirm(onNavigate),
    "task-transferred": () => renderTaskTransferredSuccess(onNavigate),
    "pre-approval-check": () => renderPreApprovalCheck(onNavigate),
    "technical-approval-submitted": () => renderTechnicalApprovalSubmitted(onNavigate),
    "technical-revision-request": () => renderTechnicalRevisionRequest(onNavigate),
    "approved-locked-report": () => renderApprovedLockedReport(onNavigate),
    "cancelled-job": () => renderCancelledJobDetail(onNavigate),
    "unauthorized": () => renderUnauthorizedAction(onNavigate),
    "operation-failed": () => renderOperationFailed(onNavigate),
    "profile-setting-detail": () => renderProfileSettingDetail(onNavigate),
    modules: () => renderModules(onNavigate),
    tests: () => renderModules(onNavigate),
    lock: () => renderLock(onNavigate),
    taskTransfer: () => renderTaskTransfer(onNavigate),
    permissionDenied: () => renderPermissionDenied(onNavigate),
    moduleControl: () => renderModuleControl(onNavigate),
    itemDetail: () => renderItemDetail(onNavigate),
    statusModal: () => renderStatusModal(onNavigate),
    evidence: () => renderEvidence(onNavigate),
    camera: () => renderCamera(onNavigate),
    photoApproval: () => renderPhotoApproval(onNavigate),
    photoUploadError: () => renderPhotoUploadError(onNavigate),
    issues: () => renderIssues(onNavigate),
    blockingIssues: () => renderBlockingIssues(onNavigate),
    missing: () => renderMissingIssues(onNavigate),
    customerSummary: () => renderCustomerSummary(onNavigate),
    "customer-summary": () => renderCustomerSummary(onNavigate),
    finalReport: () => renderFinalReportPreview(onNavigate),
    "final-report": () => renderFinalReportPreview(onNavigate),
    approvalWaiting: () => renderApprovalWaiting(onNavigate),
    "approval-waiting": () => renderApprovalWaiting(onNavigate),
    completed: () => renderReportApproved(onNavigate),
    summary: () => renderSummary(onNavigate),
    returned: () => renderRevisionRequested(onNavigate),
    help: () => renderHelpCenter(onNavigate),
    reports: () => renderReportsHistory(onNavigate),
    notifications: () => renderNotifications(onNavigate),
    permissions: () => renderPermissions(onNavigate),
    offlineSync: () => renderOfflineSync(onNavigate),
    "offline-sync": () => renderOfflineSync(onNavigate),
    syncError: () => renderSyncError(onNavigate),
    "sync-error": () => renderSyncError(onNavigate),
    emptyState: () => renderEmptyState(onNavigate),
    "empty-state": () => renderEmptyState(onNavigate),
    profile: () => renderProfile(onNavigate)
  };

  const routeContent = usesApprovedReferenceVisual
    ? renderApprovedReferenceRoute(approvedReferenceRoute, onNavigate)
    : renderers[activeRoute]();
  if (routeContent?.tagName === "MAIN" && activeRoute !== "home") {
    routeContent.classList.add("app-content");
  }
  screen.append(routeContent);

  if (shellRoutes.has(activeRoute) && createBottomNav) {
    const navRoute = bottomNavRouteFor(activeRoute);
    const isFullscreenTransition = fullscreenTransitionRoutes.has(activeRoute);
    if (!isFullscreenTransition) {
      screen.append(element("div", { className: "app-bottom-safe", attrs: { "aria-hidden": "true" } }));
      screen.append(createBottomNav(navRoute, onNavigate));
    }
  }

  return screen;
}

function showAuthNavToast(screen, message) {
  let toast = screen.querySelector(".auth-nav-toast");
  if (!toast) {
    toast = element("div", {
      className: "auth-nav-toast",
      attrs: { role: "status", "aria-live": "polite" }
    });
    screen.append(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showAuthNavToast.timer);
  showAuthNavToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1500);
}

function clearAuthStorage() {
  if (typeof window.ototrClearAuthStorage === "function") {
    window.ototrClearAuthStorage();
    return;
  }
  authStorageKeys.forEach((key) => localStorage.removeItem(key));
}

function bottomNavRouteFor(activeRoute) {
  if (taskNavRoutes.has(activeRoute)) return "tests";
  if (issueNavRoutes.has(activeRoute)) return "missing";
  if (activeRoute === "permissions") return "profile";
  if (["home", "jobs", "profile"].includes(activeRoute)) return activeRoute;
  return activeRoute;
}

function renderApprovedReferenceRoute(referenceRoute, onNavigate) {
  const meta = routeMetaById[referenceRoute];
  const imagePath = referenceScreens[referenceRoute];
  const main = element("main", {
    className: "approved-reference-route app-content",
    dataset: {
      referenceRoute,
      referenceScreen: meta?.originalFileName ?? ""
    }
  });

  const frame = element("section", {
    className: "approved-reference-frame",
    attrs: {
      "aria-label": `${meta?.title ?? "OTOTR ekran"} approved referans yerleşimi`
    }
  });

  const image = element("img", {
    className: "approved-reference-image",
    attrs: {
      src: `${imagePath}?v=approved-placement-34-v1`,
      alt: `${meta?.title ?? "OTOTR"} referans ekranı`
    }
  });

  const hotspots = element("div", {
    className: "approved-reference-hotspots",
    attrs: { "aria-label": "Referans ekran tıklama alanları" }
  });

  const flow = approvedReferenceFlowByRoute[referenceRoute] ? approvedReferenceFlowByRoute[referenceRoute] : {};
  if (flow.primary) {
    hotspots.append(referenceHotspot("Ana aksiyon", "primary", referenceRoute, flow.primary, onNavigate));
  }

  if (flow.previous) {
    hotspots.append(referenceHotspot("Önceki ekran", "previous", referenceRoute, flow.previous, onNavigate));
  }

  if (flow.next) {
    hotspots.append(referenceHotspot("Sonraki ekran", "next", referenceRoute, flow.next, onNavigate));
  }

  hotspots.append(
    referenceHotspot("Geri", "back", referenceRoute, flow.back ?? "home", onNavigate),
    referenceHotspot("Bildirimler", "notifications", referenceRoute, "notifications", onNavigate)
  );

  frame.append(image, hotspots);
  main.append(frame);
  return main;
}

function referenceHotspot(label, area, sourceRoute, targetRoute, onNavigate) {
  const button = element("button", {
    className: `approved-reference-hotspot ${area}`,
    attrs: {
      type: "button",
      "aria-label": label,
      "data-source-route": sourceRoute,
      "data-target-route": targetRoute
    }
  });
  button.addEventListener("click", () => {
    updateReferenceWorkflowState(sourceRoute, area, targetRoute);
    onNavigate?.(targetRoute);
  });
  return button;
}

function getWorkflowState() {
  try {
    return JSON.parse(localStorage.getItem("ototrWorkflowState") || "{}");
  } catch {
    return {};
  }
}

function setWorkflowState(patch) {
  const current = getWorkflowState();
  const next = {
    ...current,
    ...patch,
    lastUpdatedAt: new Date().toISOString()
  };
  localStorage.setItem("ototrWorkflowState", JSON.stringify(next));
  return next;
}

function recordWorkflowStep(step, patch = {}) {
  const order = getSelectedWorkOrder();
  return setWorkflowState({
    currentOrderId: order.id,
    currentPlate: order.plate,
    workflowStep: step,
    routeUpdatedBy: "component-ui",
    ...patch
  });
}

const moduleFormStorageKey = "ototrModuleFormState";
const evidenceCaptureStorageKey = "ototrEvidenceCaptures";

function getEvidenceCaptureStore() {
  try {
    return JSON.parse(localStorage.getItem(evidenceCaptureStorageKey) || "[]");
  } catch {
    return [];
  }
}

function setEvidenceCaptureStore(items) {
  const nextItems = Array.isArray(items) ? items.slice(0, 40) : [];
  localStorage.setItem(evidenceCaptureStorageKey, JSON.stringify(nextItems));
  return nextItems;
}

function getSelectedEvidenceSlot() {
  const workflow = getWorkflowState();
  const selectedItemTitle = workflow.selectedItemTitle || "";
  const selectedModuleTitle = workflow.selectedModuleTitle || workflow.selectedModule || "";
  const testSlotTitle = selectedItemTitle
    ? `${selectedItemTitle} Fotoğraf`
    : "";
  return {
    slotTitle: workflow.selectedEvidenceSlot || testSlotTitle || "Manuel kanıt",
    slotStatus: workflow.selectedEvidenceStatus || "Bekliyor",
    moduleTitle: selectedModuleTitle || "Genel Kanıt",
    workOrderId: workflow.currentOrderId || getSelectedWorkOrder().id,
    expertiseCaseId: workflow.expertiseCaseId || workflow.currentCaseId || "",
    taskId: workflow.taskId || workflow.currentTaskId || "",
    itemValueId: workflow.itemValueId || workflow.currentItemValueId || "",
    fieldKey: workflow.fieldKey || workflow.selectedEvidenceFieldKey || "",
    reportFieldKey: workflow.reportFieldKey || workflow.selectedReportFieldKey || "",
    plate: workflow.currentPlate || getSelectedWorkOrder().plate
  };
}

function normalizeCapturedEvidencePayload(source, payload = {}) {
  const selectedSlot = getSelectedEvidenceSlot();
  const now = new Date();
  const slotTitle = payload.slotTitle || selectedSlot.slotTitle;
  const moduleTitle = payload.moduleTitle || selectedSlot.moduleTitle;
  const workOrderId = payload.workOrderId || selectedSlot.workOrderId;
  const expertiseCaseId = payload.expertiseCaseId || selectedSlot.expertiseCaseId;
  const taskId = payload.taskId || selectedSlot.taskId;
  const itemValueId = payload.itemValueId || selectedSlot.itemValueId;
  const fieldKey = payload.fieldKey || selectedSlot.fieldKey;
  const reportFieldKey = payload.reportFieldKey || selectedSlot.reportFieldKey;
  const plate = payload.plate || selectedSlot.plate;
  return {
    id: `ev-${now.getTime()}-${Math.round(Math.random() * 1000)}`,
    source,
    slotTitle,
    moduleTitle,
    workOrderId,
    expertiseCaseId,
    taskId,
    itemValueId,
    fieldKey,
    reportFieldKey,
    plate,
    slotIndex: payload.slotIndex || null,
    moduleKey: payload.moduleKey || "",
    itemKey: payload.itemKey || "",
    itemTitle: payload.itemTitle || "",
    createdAt: now.toISOString(),
    status: "Bekliyor",
    syncStatus: "pending",
    mimeType: payload.mimeType || "image/jpeg",
    fileName: payload.fileName || `${plate.replace(/\s+/g, "-").toLowerCase()}-${now.getTime()}.jpg`,
    previewUrl: payload.previewUrl || payload.dataUrl || "",
    sizeBytes: Number(payload.sizeBytes) || 0,
    sizeText: payload.sizeText || "Hazır",
    note: payload.note || "Cihazda saklandı, senkron kuyruğuna eklendi."
  };
}

function saveCapturedEvidence(source, payload = {}) {
  const item = normalizeCapturedEvidencePayload(source, payload);
  const nextStore = setEvidenceCaptureStore([item, ...getEvidenceCaptureStore()]);
  sessionStorage.setItem("ototrMockPhotoReady", "true");
  sessionStorage.setItem("ototrLastEvidenceCapture", JSON.stringify(item));
  recordWorkflowStep("camera_capture_ready", {
    selectedEvidenceSlot: item.slotTitle,
    selectedEvidenceId: item.id,
    evidenceSource: source,
    evidenceReady: true,
    workOrderStatus: "evidence_ready"
  });
  return { item, store: nextStore };
}

function clearLastEvidenceCapture() {
  try {
    const last = JSON.parse(sessionStorage.getItem("ototrLastEvidenceCapture") || "null");
    if (last?.id) {
      setEvidenceCaptureStore(getEvidenceCaptureStore().filter((item) => item.id !== last.id));
    }
  } catch {
    // Session storage may be unavailable in restricted WebViews.
  }
  sessionStorage.removeItem("ototrMockPhotoReady");
  sessionStorage.removeItem("ototrLastEvidenceCapture");
  recordWorkflowStep("camera_capture_cleared", {
    evidenceReady: false,
    workOrderStatus: "evidence_in_progress"
  });
}

function removeEvidenceCaptureById(captureId = "") {
  if (!captureId) return getEvidenceCaptureStore();
  return setEvidenceCaptureStore(getEvidenceCaptureStore().filter((item) => item.id !== captureId));
}

function getStatusEvidenceCaptures(formKey, item) {
  const captures = getModuleItemState(formKey, item).statusEvidenceCaptures;
  return Array.isArray(captures) ? captures.slice(0, 3) : [];
}

function setStatusEvidenceCapture(formKey, item, slotIndex, capture) {
  const captures = getStatusEvidenceCaptures(formKey, item);
  const nextCaptures = captures.filter((entry) => Number(entry.slotIndex) !== slotIndex);
  nextCaptures.push({
    id: capture.id,
    slotIndex,
    previewUrl: capture.previewUrl || "",
    fileName: capture.fileName || `${slotIndex}. fotoğraf`,
    sizeText: capture.sizeText || "Hazır",
    syncStatus: capture.syncStatus || "pending",
    createdAt: capture.createdAt || new Date().toISOString()
  });
  setModuleItemState(formKey, item, {
    statusEvidenceCaptures: nextCaptures.sort((a, b) => Number(a.slotIndex) - Number(b.slotIndex)),
    readyPhotoSlots: nextCaptures.map((entry) => Number(entry.slotIndex)).sort((a, b) => a - b),
    needsEvidenceAttention: false
  });
  return nextCaptures;
}

function clearStatusEvidenceCapture(formKey, item, slotIndex) {
  const captures = getStatusEvidenceCaptures(formKey, item);
  const removed = captures.find((entry) => Number(entry.slotIndex) === slotIndex);
  if (removed?.id) removeEvidenceCaptureById(removed.id);
  const nextCaptures = captures.filter((entry) => Number(entry.slotIndex) !== slotIndex);
  setModuleItemState(formKey, item, {
    statusEvidenceCaptures: nextCaptures,
    readyPhotoSlots: nextCaptures.map((entry) => Number(entry.slotIndex)).sort((a, b) => a - b)
  });
  return nextCaptures;
}

function saveStatusSelectionEvidenceCapture(selectedModule, selectedItem, slotIndex, payload = {}) {
  const order = getSelectedWorkOrder();
  const itemKey = getModuleItemKey(selectedItem);
  const fieldKey = `${selectedModule.formKey}.${itemKey}.photo_${slotIndex}`;
  const { item } = saveCapturedEvidence("status-selection", {
    ...payload,
    slotTitle: `${selectedItem.title || selectedModule.title} Fotoğraf ${slotIndex}`,
    slotIndex,
    moduleTitle: selectedModule.title,
    moduleKey: selectedModule.formKey,
    itemTitle: selectedItem.title || "",
    itemKey,
    workOrderId: order.id,
    expertiseCaseId: order.expertiseCaseId || order.id,
    taskId: "",
    itemValueId: "",
    fieldKey,
    reportFieldKey: fieldKey,
    plate: order.plate,
    note: "Durum seçimi ekranında eklendi, arka planda senkron kuyruğuna alındı."
  });
  setStatusEvidenceCapture(selectedModule.formKey, selectedItem, slotIndex, item);
  return item;
}

function updateEvidenceSyncStatus(status = "uploaded") {
  const captures = getEvidenceCaptureStore();
  const updatedAt = new Date().toISOString();
  const nextStore = captures.map((item) => ({
    ...item,
    status: status === "uploaded" ? "Yüklendi" : item.status,
    syncStatus: status,
    syncedAt: status === "uploaded" ? updatedAt : item.syncedAt
  }));
  return setEvidenceCaptureStore(nextStore);
}

async function syncPendingEvidenceCaptureStore() {
  const captures = getEvidenceCaptureStore();
  const result = await syncEvidenceCaptures(captures);
  setEvidenceCaptureStore(result.updated);
  return result;
}

function syncPendingEvidenceCaptureStoreWithTimeout(timeoutMs = 1800) {
  return Promise.race([
    syncPendingEvidenceCaptureStore(),
    new Promise((resolve) => {
      window.setTimeout(() => resolve({
        uploadedCount: 0,
        failedCount: 0,
        attemptedCount: getEvidenceCaptureStore().filter((item) => item.syncStatus !== "uploaded").length,
        timedOut: true
      }), timeoutMs);
    })
  ]);
}

function transitionLiveWorkOrderStatusWithTimeout(payload, timeoutMs = 1800) {
  return Promise.race([
    transitionLiveWorkOrderStatus(payload),
    new Promise((resolve) => {
      window.setTimeout(() => resolve({
        ok: false,
        status: "timeout",
        reason: "Canlı durum güncellemesi zaman aşımına uğradı."
      }), timeoutMs);
    })
  ]);
}

function getEvidenceSyncStats() {
  const captures = getEvidenceCaptureStore();
  const pending = captures.filter((item) => item.syncStatus === "pending").length;
  const failed = captures.filter((item) => item.syncStatus === "failed").length;
  const uploaded = captures.filter((item) => item.syncStatus === "uploaded").length;
  const configStatus = getEvidenceUploadConfigStatus();
  return {
    captures,
    total: captures.length,
    pending,
    failed,
    uploaded,
    progress: captures.length ? Math.round((uploaded / captures.length) * 100) : 0,
    uploadConfigured: configStatus.configured,
    uploadBucket: configStatus.bucket,
    uploadMissing: configStatus.missing
  };
}

function getEvidenceApprovalGate() {
  const stats = getEvidenceSyncStats();
  const order = getSelectedWorkOrder();
  const liveGate = getCachedTechnicalApprovalGate(order.expertiseCaseId || order.id);
  const requiredSlotCount = 0;
  const blockers = liveGate?.blockers?.length
    ? liveGate.blockers.map((item) => [item.label || "Canlı tamamlama blokajı", item.tone || "warning"])
    : [];

  return {
    ...stats,
    source: liveGate?.source || "local",
    total: Math.max(stats.total, liveGate?.uploadedEvidenceCount ?? 0),
    answerCount: liveGate?.answerCount ?? 0,
    riskyAnswerCount: liveGate?.riskyAnswerCount ?? 0,
    notDoneAnswerCount: liveGate?.notDoneAnswerCount ?? 0,
    requiredSlotCount,
    uploaded: liveGate?.uploadedEvidenceCount ?? stats.uploaded,
    uploadedEvidenceCount: liveGate?.uploadedEvidenceCount ?? stats.uploaded,
    pendingEvidenceCount: liveGate?.pendingEvidenceCount ?? stats.pending,
    failedEvidenceCount: liveGate?.failedEvidenceCount ?? stats.failed,
    canSubmit: liveGate ? Boolean(liveGate.canSubmit) : blockers.length === 0,
    blockers
  };
}

async function refreshTechnicalApprovalGateForCurrentOrder() {
  const order = getSelectedWorkOrder();
  return fetchTechnicalApprovalGate(order.expertiseCaseId || order.id).catch((error) => ({
    ok: false,
    status: "error",
    reason: error?.message || "Teknik onay kontrolü alınamadı."
  }));
}

async function refreshFinalReportForCurrentOrder({ lockReport = false } = {}) {
  const order = getSelectedWorkOrder();
  return generateFinalReportPayload(order.expertiseCaseId || order.id, { lockReport }).catch((error) => ({
    ok: false,
    status: "error",
    reason: error?.message || "Final rapor üretilemedi."
  }));
}

const moduleTaskCompletionStorageKey = "ototrCompletedModuleTasks";
const moduleStateOverrideStorageKey = "ototrModuleStateOverrides";
const moduleTaskSyncTimers = new Map();

function readCompletedModuleTaskStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(moduleTaskCompletionStorageKey) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCompletedModuleTaskStore(nextStore) {
  localStorage.setItem(moduleTaskCompletionStorageKey, JSON.stringify(nextStore));
  return nextStore;
}

function moduleTaskStoreKey(order, formKey) {
  return `${order.expertiseCaseId || order.id}:${formKey}`;
}

function readModuleStateOverrideStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(moduleStateOverrideStorageKey) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeModuleStateOverrideStore(nextStore) {
  localStorage.setItem(moduleStateOverrideStorageKey, JSON.stringify(nextStore));
  return nextStore;
}

function getModuleStateOverride(order, formKey) {
  if (!order?.id || !formKey) return null;
  const store = readModuleStateOverrideStore();
  return store[moduleTaskStoreKey(order, formKey)] || store[formKey] || null;
}

function setModuleStateOverride(order, formKey, value) {
  if (!order?.id || !formKey) return;
  const store = readModuleStateOverrideStore();
  const key = moduleTaskStoreKey(order, formKey);
  if (value) {
    store[key] = value;
    store[formKey] = value;
  } else {
    delete store[key];
    delete store[formKey];
  }
  writeModuleStateOverrideStore(store);
}

function markModuleTaskCompleted(order, formKey, completed) {
  const store = readCompletedModuleTaskStore();
  const key = moduleTaskStoreKey(order, formKey);
  if (completed) store[key] = true;
  else delete store[key];
  writeCompletedModuleTaskStore(store);
}

function isModuleTaskCompleted(order, formKey) {
  return Boolean(readCompletedModuleTaskStore()[moduleTaskStoreKey(order, formKey)]);
}

function scheduleModuleTaskCompletionSync(formKey) {
  const form = expertiseModuleForms[formKey];
  const order = getSelectedWorkOrder();
  if (!form || !order?.id) return;
  const existingTimer = moduleTaskSyncTimers.get(formKey);
  if (existingTimer) clearTimeout(existingTimer);
  const timer = setTimeout(async () => {
    const progress = getModuleFormProgress(formKey, form);
    if (progress.total === 0) return;
    if (progress.completed === progress.total && progress.missingEvidence === 0) {
      if (isModuleTaskCompleted(order, formKey)) return;
      const result = await submitInspectionTaskForModule({
        expertiseCaseId: order.expertiseCaseId || order.id,
        moduleKey: formKey
      }).catch((error) => ({
        ok: false,
        status: "error",
        reason: error?.message || "Teknik görev tamamlanamadı."
      }));
      if (result.ok) {
        markModuleTaskCompleted(order, formKey, true);
        recordWorkflowStep("module_task_completed", {
          selectedModuleFormKey: formKey,
          currentOrderId: order.id,
          workOrderStatus: "module_completed"
        });
      }
      return;
    }
    markModuleTaskCompleted(order, formKey, false);
  }, 280);
  moduleTaskSyncTimers.set(formKey, timer);
}

async function releaseActiveModuleOwnership(onNavigate, reason = "Usta testi bıraktı.") {
  const workflow = getWorkflowState();
  const formKey = workflow.selectedModuleFormKey || "kaporta";
  const order = getSelectedWorkOrder();
  clearClaimedModuleOwner(order, formKey);
  const result = await releaseInspectionTaskForModule({
    expertiseCaseId: order.expertiseCaseId || order.id,
    moduleKey: formKey,
    releaseReason: reason
  }).catch((error) => ({
    ok: false,
    status: "error",
    reason: error?.message || "Test sahipliği bırakılamadı."
  }));
  setModuleStateOverride(order, formKey, {
    owner: "Atama Bekliyor",
    status: "Bekliyor",
    lockedBy: "",
    lockedAt: "",
    releasedAt: new Date().toISOString()
  });
  markModuleTaskCompleted(order, formKey, false);
  recordWorkflowStep(result.ok ? "module_released" : "module_release_failed", {
    currentOrderId: order.id,
    selectedModuleFormKey: formKey,
    releaseReason: reason,
    liveResult: result.status
  });
  try {
    const workflowState = getWorkflowState();
    localStorage.setItem("ototrWorkflowState", JSON.stringify({
      ...workflowState,
      selectedModuleFormKey: "",
      selectedModule: "",
      selectedModuleTitle: "",
      selectedModuleSubtitle: "",
      selectedModuleOwner: "",
      selectedModuleClaimedAt: ""
    }));
  } catch {
    // Local storage may be unavailable in restricted WebViews.
  }
  onNavigate("tests");
}

function getModuleFormStore() {
  try {
    return JSON.parse(localStorage.getItem(moduleFormStorageKey) || "{}");
  } catch {
    return {};
  }
}

function setModuleFormStore(nextStore) {
  localStorage.setItem(moduleFormStorageKey, JSON.stringify(nextStore));
  return nextStore;
}

function getModuleFormState(formKey) {
  return getModuleFormStore()[formKey] || {};
}

function getModuleItemKey(item) {
  return String(item.itemId || item.noktaId || item.title).replace(/\s+/g, "_");
}

function queueMobileInspectionAnswerSave(formKey, item) {
  const order = getSelectedWorkOrder();
  const state = getModuleItemState(formKey, item);
  const statusEvidenceCaptures = Array.isArray(state.statusEvidenceCaptures) ? state.statusEvidenceCaptures : [];
  const readyPhotoSlots = Array.isArray(state.readyPhotoSlots)
    ? state.readyPhotoSlots
    : Number(state.readyPhotoSlots || 0) > 0 ? [1] : [];
  saveMobileInspectionAnswer({
    expertiseCaseId: order.expertiseCaseId || order.id,
    moduleKey: formKey,
    itemKey: getModuleItemKey(item),
    itemTitle: item.title,
    selectedOptionLabel: state.selectedOption || "",
    inputValues: state.inputs || {},
    description: state.description || "",
    readyPhotoCount: Math.max(statusEvidenceCaptures.length, readyPhotoSlots.length),
    requiredPhotoCount: 0
  }).then((result) => {
    setModuleItemState(formKey, item, {
      liveAnswerSaved: Boolean(result.ok),
      liveAnswerResult: result.status,
      liveAnswerId: result.answer?.id || state.liveAnswerId || "",
      syncInlineStatus: result.ok ? "Senkronize edildi" : "Hata / tekrar dene"
    });
    recordWorkflowStep(result.ok ? "mobile_inspection_answer_saved" : "mobile_inspection_answer_save_failed", {
      selectedModuleFormKey: formKey,
      selectedItem: item.title,
      liveAnswerResult: result.status,
      liveAnswerSaved: Boolean(result.ok)
    });
  }).catch((error) => {
    setModuleItemState(formKey, item, {
      liveAnswerSaved: false,
      liveAnswerResult: "error",
      syncInlineStatus: "Hata / tekrar dene"
    });
    recordWorkflowStep("mobile_inspection_answer_save_failed", {
      selectedModuleFormKey: formKey,
      selectedItem: item.title,
      liveAnswerResult: "error",
      errorMessage: error?.message || "Mobil test cevabı kaydedilemedi."
    });
  });
}

function getModuleItemState(formKey, item) {
  return getModuleFormState(formKey)[getModuleItemKey(item)] || {};
}

function setModuleItemState(formKey, item, patch) {
  const store = getModuleFormStore();
  const moduleState = store[formKey] || {};
  const itemKey = getModuleItemKey(item);
  const nextItemState = {
    ...(moduleState[itemKey] || {}),
    ...patch,
    updatedAt: new Date().toISOString()
  };
  const nextModuleState = {
    ...moduleState,
    [itemKey]: nextItemState
  };
  const nextStore = setModuleFormStore({
    ...store,
    [formKey]: nextModuleState
  });
  return nextStore[formKey][itemKey];
}

function isModuleItemComplete(item, state = {}) {
  if (state.completed === true) return true;
  const hasRequiredOption = item.options.length === 0 || Boolean(state.selectedOption);
  const requiredInputsOk = item.inputs.length === 0 || item.inputs.every((input) => {
    const key = input.name || input.label || "Ek alan";
    return Boolean(state.inputs?.[key]);
  });
  return hasRequiredOption && requiredInputsOk;
}

function getModuleFormProgress(formKey, form) {
  const moduleState = getModuleFormState(formKey);
  const completed = form.items.filter((item) => isModuleItemComplete(item, moduleState[getModuleItemKey(item)])).length;
  const requiredEvidence = 0;
  const readyEvidence = form.items.filter((item) => {
    const itemState = moduleState[getModuleItemKey(item)] || {};
    const statusCaptures = itemState.statusEvidenceCaptures;
    if (Array.isArray(statusCaptures) && statusCaptures.length > 0) return true;
    const readySlots = itemState.readyPhotoSlots;
    return (Array.isArray(readySlots) ? readySlots.length : Number(readySlots || 0)) > 0;
  }).length;
  const missingEvidence = 0;
  const percent = form.items.length ? Math.round((completed / form.items.length) * 100) : 0;
  return {
    completed,
    total: form.items.length,
    percent,
    requiredEvidence,
    readyEvidence,
    missingEvidence
  };
}

function updateReferenceWorkflowState(sourceRoute, actionArea, targetRoute) {
  const order = getSelectedWorkOrder();
  const basePatch = {
    currentOrderId: order.id,
    currentPlate: order.plate,
    lastRoute: sourceRoute,
    lastAction: actionArea,
    nextRoute: targetRoute
  };

  if (actionArea !== "primary") {
    setWorkflowState(basePatch);
    return;
  }

  const patchByRoute = {
    modules: {
      selectedModule: "Motor Ekspertizi",
      moduleProgress: "7/10",
      workflowStep: "module_selected"
    },
    lock: {
      lockReviewed: true,
      workflowStep: "module_lock_reviewed"
    },
    taskTransfer: {
      transferCandidate: "Ahmet Usta",
      transferStatus: "cancelled_or_returned",
      workflowStep: "transfer_checked"
    },
    permissionDenied: {
      permissionRequestSeen: true,
      workflowStep: "permission_checked"
    },
    moduleControl: {
      activeModule: "Motor Ekspertizi",
      activeItem: "Motor Yağ Kaçağı",
      moduleControlStarted: true,
      workflowStep: "module_control_started"
    },
    itemDetail: {
      activeItem: "Sol Ön Çamurluk",
      itemDetailOpened: true,
      measurementMicron: 185,
      workflowStep: "item_detail_opened"
    },
    statusModal: {
      selectedStatus: "Lokal Boyalı",
      itemStatusCompleted: true,
      workflowStep: "status_selected"
    },
    evidence: {
      evidenceCenterOpened: true,
      requiredEvidence: 3,
      uploadedEvidence: Number(getWorkflowState().uploadedEvidence || 0),
      workflowStep: "evidence_center"
    },
    camera: {
      cameraCaptureReady: true,
      uploadedEvidence: Number(getWorkflowState().uploadedEvidence || 0) + 1,
      workflowStep: "camera_capture_mocked"
    },
    photoApproval: {
      photoApproved: true,
      approvedEvidence: Number(getWorkflowState().approvedEvidence || 0) + 1,
      workflowStep: "photo_approved"
    },
    photoUploadError: {
      uploadRetryQueued: true,
      workflowStep: "upload_retry_queued"
    },
    issues: {
      issuesReviewed: true,
      missingCount: 2,
      workflowStep: "issues_reviewed"
    },
    blockingIssues: {
      blockingIssuesReviewed: true,
      blockersRemaining: 1,
      workflowStep: "blocking_issues_reviewed"
    },
    customerSummary: {
      customerSummaryReviewed: true,
      workflowStep: "customer_summary_reviewed"
    },
    finalReport: {
      finalReportPreviewed: true,
      reportReadyForTechnicalReview: false,
      workflowStep: "final_report_ready"
    },
    approvalWaiting: {
      sentToTechnicalApproval: false,
      workOrderStatus: "completed",
      workflowStep: "work_order_completed"
    },
    completed: {
      workOrderStatus: "completed",
      workflowStep: "work_order_completed"
    },
    returned: {
      workOrderStatus: "returned_for_correction",
      workflowStep: "returned_for_correction"
    }
  };

  const routePatch = patchByRoute[sourceRoute] ?? { workflowStep: `${sourceRoute}_${actionArea}` };
  if (routePatch.workOrderStatus) {
    localStorage.setItem(`ototrWorkOrderStatus:${order.id}`, routePatch.workOrderStatus);
  }
  setWorkflowState({ ...basePatch, ...routePatch });
}

function renderHomeOptimized(onNavigate) {
  const activeOrders = filterWorkOrdersByStatus(getRuntimeWorkOrders(), ["in_progress"]);
  const waitingOrders = filterWorkOrdersByStatus(getRuntimeWorkOrders(), ["waiting_start_proof", "start_proof_incomplete"]);
  const missingOrders = filterWorkOrdersByStatus(getRuntimeWorkOrders(), ["test_missing", "returned_for_correction"]);
  const technicalOrders = filterWorkOrdersByStatus(getRuntimeWorkOrders(), ["completed"]);
  const main = element("main", { className: "app-content phase2-main home-ref-main home-standard-main" });
  const sections = [
    homeFinalHeader(onNavigate),
    homeFinalProfile(onNavigate),
    homeStandardKpis(onNavigate)
  ];
  if (activeOrders.length) sections.push(homeStandardOrderSection("Aktif İş Emirleri", activeOrders, onNavigate));
  if (waitingOrders.length) sections.push(homeStandardOrderSection("Bekleyen İş Emirleri", waitingOrders, onNavigate));
  if (missingOrders.length) sections.push(homeStandardOrderSection("Eksik / Uyarı Olan İşler", missingOrders, onNavigate));
  if (technicalOrders.length) sections.push(homeStandardOrderSection("Tamamlanan İşler", technicalOrders, onNavigate));
  sections.push(homeFinalQuickActions(onNavigate, technicalOrders.length));
  main.append(...sections);
  return main;
}

function homeStandardKpis(onNavigate) {
  const strip = jobsKpiStrip(() => onNavigate("jobs"));
  strip.classList.add("home-standard-kpis");
  return strip;
}

function homeStandardOrderSection(title, orders, onNavigate) {
  const wrap = element("section", { className: "home-final-block home-standard-order-section" });
  wrap.append(homeFinalSectionTitle(title, "Tümünü Gör", () => onNavigate("jobs")));
  const list = element("div", { className: "home-standard-order-list jobs-approved-list" });
  if (!orders.length) {
    list.append(homeFinalEmptyListState(`${title} bulunmuyor.`));
  } else {
    orders.forEach((order) => list.append(jobsApprovedCard(order, onNavigate)));
  }
  wrap.append(list);
  return wrap;
}

function homeExactImageSection(kind, fileName, alt, hotspots = [], overlay = null) {
  const section = element("section", { className: `home-exact-section home-exact-${kind}` });
  section.append(element("img", {
    attrs: {
      src: `./src/assets/home-reference/${fileName}`,
      alt,
      draggable: "false",
      decoding: "async"
    }
  }));
  if (overlay) {
    section.append(overlay);
  }
  hotspots.forEach((hotspot) => {
    const action = button("", "home-exact-hotspot", hotspot.action, hotspot.label);
    action.style.left = `${hotspot.x}%`;
    action.style.top = `${hotspot.y}%`;
    action.style.width = `${hotspot.w}%`;
    action.style.height = `${hotspot.h}%`;
    section.append(action);
  });
  return section;
}

function createAuthImageAction(onNavigate, { route, altRoute, label, style, onTap } = {}) {
  const buttonElement = element("button", {
    className: "auth-image-action",
    attrs: {
      type: "button",
      "aria-label": label ?? `${route ?? altRoute} aksiyonu`,
      style
    }
  });
  let lastTap = 0;

  const activate = () => {
    const now = Date.now();
    if (now - lastTap < 250) return;
    lastTap = now;

    if (typeof onTap === "function") {
      onTap();
    }
    if (route) {
      onNavigate(route);
      return;
    }
    if (altRoute) onNavigate(altRoute);
  };

  const handleActivate = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    activate();
  };

  buttonElement.addEventListener("click", handleActivate);
  buttonElement.addEventListener("touchend", handleActivate);
  buttonElement.addEventListener("pointerup", handleActivate);
  buttonElement.addEventListener("pointerdown", (event) => event.preventDefault());

  buttonElement.addEventListener("keyup", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      handleActivate(event);
    }
  });

  return buttonElement;
}
function setAuthControlPosition(node, {
  left = "0%",
  top = "0%",
  width = "10%",
  height = "10%",
  zIndex = 2,
  pointer = "auto"
} = {}) {
  node.style.position = "absolute";
  node.style.left = left;
  node.style.top = top;
  node.style.width = width;
  node.style.height = height;
  node.style.zIndex = String(zIndex);
  node.style.pointerEvents = pointer;
  node.style.border = "0";
  node.style.background = "transparent";
}

function setAuthKeyboardActive(isActive) {
  document.documentElement.classList.toggle("auth-keyboard-active", isActive);
}

function setStableAuthViewportHeight() {
  const viewportHeight = Math.max(
    window.innerHeight || 0,
    window.visualViewport?.height || 0,
    640
  );
  const currentLockedHeight = Number.parseInt(
    document.documentElement.style.getPropertyValue("--auth-layout-height"),
    10
  );
  const nextHeight = Math.max(viewportHeight, Number.isFinite(currentLockedHeight) ? currentLockedHeight : 0);
  document.documentElement.style.setProperty("--auth-layout-height", `${Math.round(nextHeight)}px`);
}

function releaseAuthKeyboardWhenIdle() {
  window.setTimeout(() => {
    const activeElement = document.activeElement;
    const isAuthInput =
      activeElement?.classList?.contains("auth-entry-control") ||
      activeElement?.classList?.contains("login-production-input") ||
      activeElement?.hasAttribute?.("data-auth-field");
    if (!isAuthInput) setAuthKeyboardActive(false);
  }, 120);
}

function focusAuthInput(field) {
  if (!field) return;
  setStableAuthViewportHeight();
  setAuthKeyboardActive(true);
  const applyFocus = () => {
    try {
      field.focus({ preventScroll: true });
    } catch {
      field.focus();
    }
    const valueLength = field.value?.length ?? 0;
    if (typeof field.setSelectionRange === "function") {
      try {
        field.setSelectionRange(valueLength, valueLength);
      } catch {
        // Some input types do not support selection ranges.
      }
    }
    if (navigator.virtualKeyboard?.show) {
      try {
        navigator.virtualKeyboard.show();
      } catch {
        // The API is optional and may be blocked by the WebView.
      }
    }
  };
  applyFocus();
  requestAnimationFrame(applyFocus);
}

function wireLoginInputFocus(field, input) {
  if (!field || !input) return;
  input.addEventListener("focus", () => {
    setStableAuthViewportHeight();
    setAuthKeyboardActive(true);
  });
  input.addEventListener("blur", releaseAuthKeyboardWhenIdle);
  const applyFocus = () => {
    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
    if (navigator.virtualKeyboard?.show) {
      try {
        navigator.virtualKeyboard.show();
      } catch {
        // Optional API; native WebView may ignore it.
      }
    }
  };
  const ensureFocus = () => {
    setStableAuthViewportHeight();
    setAuthKeyboardActive(true);
    applyFocus();
    requestAnimationFrame(applyFocus);
  };
  field.addEventListener("pointerdown", ensureFocus);
  field.addEventListener("touchstart", ensureFocus, { passive: true });
  field.addEventListener("click", ensureFocus);
  field.addEventListener("touchend", ensureFocus);
}

function createAuthImageInput(type, attrs = {}, style) {
  const field = element("input", {
    className: "auth-overlay-control auth-entry-control",
    attrs: {
      type,
      autocomplete: "off",
      ...attrs
    }
  });
  setAuthControlPosition(field, style);
  field.style.color = "#111827";
  field.style.background = "transparent";
  field.style.caretColor = "#e30613";
  field.style.textIndent = "0";
  field.style.fontSize = "16px";
  field.style.opacity = "1";
  field.addEventListener("focus", () => {
    setStableAuthViewportHeight();
    setAuthKeyboardActive(true);
  });
  field.addEventListener("blur", releaseAuthKeyboardWhenIdle);
  field.addEventListener("pointerdown", () => focusAuthInput(field));
  field.addEventListener("touchstart", () => focusAuthInput(field), { passive: true });
  field.addEventListener("click", () => focusAuthInput(field));
  return field;
}
function createAuthImageButton(label, className = "", style, onClick) {
  const buttonNode = element("button", {
    className: `auth-overlay-control auth-action-control ${className}`.trim(),
    text: "",
    attrs: { type: "button", "aria-label": label }
  });
  setAuthControlPosition(buttonNode, style);
  buttonNode.style.color = "transparent";
  buttonNode.style.opacity = "0";
  let lastTap = 0;

  const handleActivate = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const now = Date.now();
    if (now - lastTap < 220) return;
    lastTap = now;
    if (typeof onClick === "function") onClick();
  };

  buttonNode.addEventListener("click", handleActivate);
  buttonNode.addEventListener("mouseup", handleActivate);
  buttonNode.addEventListener("touchend", handleActivate);
  buttonNode.addEventListener("pointerup", handleActivate);
  buttonNode.addEventListener("keyup", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      handleActivate(event);
    }
  });
  return buttonNode;
}
function renderAuthImageScreen(onNavigate, { imagePath, alt, controls = [] } = {}) {
  setAuthKeyboardActive(false);
  setStableAuthViewportHeight();
  const main = element("main", { className: "phase2-auth-shell auth-image-shell" });
  const wrap = element("div", { className: "auth-image-screen" });
  const img = element("img", {
    className: "auth-image-screen-image",
    attrs: {
      src: imagePath,
      alt: alt ?? "OTOTR Terminal arayüzü",
      decoding: "async",
      draggable: "false"
    }
  });

  const layer = element("div", { className: "auth-image-control-layer" });
  controls.forEach((control) => layer.append(createAuthImageAction(onNavigate, control)));
  wrap.append(img, layer);
  main.append(wrap);
  return main;
}

function renderSplash(onNavigate) {
  const main = element("main", { className: "app-loading-shell phase2-auth-shell splash-screen-shell" });
  const media = element("div", {
    className: "splash-screen-media",
    attrs: {
      "data-splash-loading": "locked",
      "data-splash-loading-bar": "locked",
      "data-splash-source": "splash-01-final"
    }
  });
  const image = element("img", {
    attrs: {
      src: "./src/assets/brand/ototr-native-splash.png?v=splash-01-final-v1",
      alt: "OTOTR Terminal splash ekranı",
      decoding: "async",
      draggable: "false",
      loading: "eager"
    }
  });
  const loading = element("div", {
    className: "splash-loading-lock",
    html: `
      <span class="splash-loading-track" aria-hidden="true"><i class="splash-loading-fill"></i></span>
    `
  });
  media.append(image, loading);
  main.append(media);
  return main;
}

function renderLogin(onNavigate) {
  const main = element("main", { className: "phase2-auth-shell login-production-shell" });
  const background = element("img", {
    className: "login-production-bg",
    attrs: {
      src: "./src/assets/brand/ototr-login-reference-final.png",
      alt: "",
      decoding: "async",
      draggable: "false",
      "aria-hidden": "true"
    }
  });
  const carStage = element("img", {
    className: "login-production-car",
    attrs: {
      src: "./src/assets/brand/ototr-login-car-stage.png?v=no-photo-curve-v1",
      alt: "",
      decoding: "async",
      draggable: "false",
      "aria-hidden": "true"
    }
  });
  const form = element("form", {
    className: "login-production-form",
    attrs: { autocomplete: "on", novalidate: "novalidate" }
  });
  const username = element("input", {
    className: "login-production-input",
    attrs: {
      type: "text",
      name: "username",
      inputmode: "email",
      autocomplete: "username",
      placeholder: "Telefon veya e-posta girin",
      "aria-label": "E-posta veya kullanıcı adı",
      "data-auth-field": "username"
    }
  });
  const password = element("input", {
    className: "login-production-input",
    attrs: {
      type: "password",
      name: "password",
      autocomplete: "current-password",
      placeholder: "Şifrenizi girin",
      "aria-label": "Şifre",
      "data-auth-field": "password"
    }
  });
  const passwordToggle = button(`${icons.eye}<span class="sr-only">Şifreyi göster veya gizle</span>`, "login-production-eye", () => {
    password.type = password.type === "password" ? "text" : "password";
    passwordToggle.setAttribute("aria-pressed", password.type === "text" ? "true" : "false");
  }, "Şifreyi göster veya gizle", true);
  passwordToggle.type = "button";
  passwordToggle.setAttribute("aria-pressed", "false");
  const remember = element("input", {
    className: "login-production-checkbox",
    attrs: { type: "checkbox", checked: "checked", "aria-label": "Beni Hatırla" }
  });
  const message = element("div", {
    className: "auth-message login-production-message",
    attrs: { role: "status", "aria-live": "polite" }
  });
  message.textContent = "";
  const completeLiveLogin = ({ accessToken, refreshToken = "", email = "", rememberMe = true }) => {
    localStorage.setItem("ototrAuth", "true");
    localStorage.setItem("ototrRememberMe", rememberMe ? "true" : "false");
    localStorage.setItem("ototrSupabaseAccessToken", accessToken);
    localStorage.setItem("ototrSupabaseRefreshToken", refreshToken || "");
    localStorage.setItem("ototrSupabaseUserEmail", email);
    const normalizedEmail = String(email).toLowerCase();
    localStorage.setItem("ototrUser", normalizedEmail.includes("ahmet.usta") ? "Ahmet Usta" : email);
    const runtimeConfig = globalThis.OTOTR_SUPABASE_CONFIG || {};
    const debugAutoBranchId = runtimeConfig.allowFakeSupabaseSession === true ? runtimeConfig.debugAutoBranchId || "" : "";
    const debugSelectedWorkOrderId = runtimeConfig.allowFakeSupabaseSession === true ? runtimeConfig.debugSelectedWorkOrderId || "" : "";
    const debugStartupRoute = runtimeConfig.allowFakeSupabaseSession === true ? runtimeConfig.debugStartupRoute || "" : "";
    if (debugAutoBranchId && !localStorage.getItem("ototrBranch")) {
      const debugBranch = getBranchById(debugAutoBranchId);
      if (debugBranch) {
        localStorage.setItem("ototrBranch", debugBranch.id);
        localStorage.setItem("ototrBranchName", debugBranch.name);
        localStorage.setItem("ototrDefaultBranch", "true");
      }
    }
    if (debugSelectedWorkOrderId) {
      localStorage.setItem("ototrSelectedWorkOrder", debugSelectedWorkOrderId);
    }
    setAuthKeyboardActive(false);
    username.blur();
    password.blur();
    message.className = "auth-message login-production-message auth-message-success";
    const targetRoute = localStorage.getItem("ototrBranch")
      ? (debugStartupRoute || "home")
      : "branch";
    message.textContent = targetRoute === "home" ? "Canlı giriş başarılı." : "Canlı giriş başarılı, şube seçimine yönlendiriliyorsunuz.";
    onNavigate(targetRoute);
  };
  const submitLogin = async (credentials = null) => {
    const usernameValue = credentials?.email || username.value?.trim();
    const passwordValue = credentials?.password || password.value?.trim();
    if (!usernameValue || !passwordValue) {
      message.className = "auth-message login-production-message auth-message-error";
      message.textContent = "E-posta ve şifre alanları zorunludur.";
      return;
    }
    const runtimeConfig = globalThis.OTOTR_SUPABASE_CONFIG || {};
    const baseUrl = String(runtimeConfig.url || localStorage.getItem("ototrSupabaseUrl") || "").replace(/\/+$/, "");
    const apiKey = runtimeConfig.anonKey || runtimeConfig.publishableKey || localStorage.getItem("ototrSupabaseAnonKey") || "";
    if (!baseUrl || !apiKey) {
      message.className = "auth-message login-production-message auth-message-error";
      message.textContent = "Canlı giriş ayarı eksik. Supabase bağlantısı bulunamadı.";
      return;
    }
    message.className = "auth-message login-production-message";
    message.textContent = "Canlı oturum açılıyor...";
    try {
      const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: usernameValue,
          password: passwordValue
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.access_token) {
        const reason = payload?.msg || payload?.error_description || payload?.message || "Giriş bilgileri doğrulanamadı.";
        throw new Error(reason);
      }
      completeLiveLogin({
        accessToken: payload.access_token,
        refreshToken: payload.refresh_token || "",
        email: payload.user?.email || usernameValue,
        rememberMe: remember.checked
      });
    } catch (error) {
      localStorage.removeItem("ototrAuth");
      localStorage.removeItem("ototrSupabaseAccessToken");
      localStorage.removeItem("ototrSupabaseRefreshToken");
      localStorage.removeItem("ototrSupabaseUserEmail");
      message.className = "auth-message login-production-message auth-message-error";
      message.textContent = error?.message || "Canlı giriş başarısız oldu.";
    }
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitLogin();
  });
  const submit = button(`${icons.key}<span>Giriş Yap</span>${icons.arrow}`, "login-production-submit", submitLogin, "Giriş Yap", true);
  submit.type = "button";
  const forgot = element("a", {
    className: "login-production-forgot",
    text: "Şifremi Unuttum",
    attrs: { href: "#forgot-password", "aria-label": "Şifremi Unuttum" }
  });
  forgot.addEventListener("click", (event) => {
    event.preventDefault();
    onNavigate("forgot-password");
  });
  const support = button(`${icons.wrench}<span>Teknik Destek</span>`, "login-production-support", () => {
    message.className = "auth-message login-production-message auth-message-success";
    message.textContent = "Teknik destek talebi için yönlendirme hazırlanıyor.";
  }, "Teknik Destek", true);
  support.type = "button";
  const runtimeConfig = globalThis.OTOTR_SUPABASE_CONFIG || {};
  const fakeSupabaseSessionAllowed = runtimeConfig.allowFakeSupabaseSession === true;
  const debugLoginEnabled = fakeSupabaseSessionAllowed && runtimeConfig.debugLoginEnabled === true;
  const debugAutoLoginEnabled = fakeSupabaseSessionAllowed && runtimeConfig.debugAutoLoginEnabled === true;
  const debugAutoLoginKey = "ototrDebugAutoLoginAttempted";
  const debugRealAutoLoginEnabled = runtimeConfig.debugRealAutoLoginEnabled === true
    && typeof runtimeConfig.debugRealAutoLoginEmail === "string"
    && runtimeConfig.debugRealAutoLoginEmail.trim()
    && typeof runtimeConfig.debugRealAutoLoginPassword === "string"
    && runtimeConfig.debugRealAutoLoginPassword.trim();
  const debugRealAutoLoginKey = "ototrDebugRealAutoLoginAttempted";
  const triggerDebugSession = () => {
    username.value = "ahmet.usta@ototr.test";
    password.value = "123456";
    completeLiveLogin({
      accessToken: "debug-session-token",
      refreshToken: "debug-refresh-token",
      email: "ahmet.usta@ototr.test",
      rememberMe: true
    });
  };
  const debugLoginButton = debugLoginEnabled
    ? button("Test Girişi: Ahmet Usta", "login-production-debug", () => {
      triggerDebugSession();
    }, "Ahmet Usta test girişi", true)
    : null;
  if (debugLoginButton) debugLoginButton.type = "button";
  const usernameField = element("label", { className: "login-production-field login-production-username" });
  usernameField.append(
    element("span", { className: "login-production-label", text: "Telefon / E-posta" }),
    element("span", { className: "login-production-field-icon", html: icons.user }),
    username
  );
  const passwordField = element("label", { className: "login-production-field login-production-password" });
  passwordField.append(
    element("span", { className: "login-production-label", text: "Şifre" }),
    element("span", { className: "login-production-field-icon", html: icons.key }),
    password,
    passwordToggle
  );
  wireLoginInputFocus(usernameField, username);
  wireLoginInputFocus(passwordField, password);
  const row = element("div", { className: "login-production-row" });
  const rememberLabel = element("label", { className: "login-production-remember" });
  rememberLabel.append(remember, element("span", { text: "Beni Hatırla" }));
  row.append(rememberLabel, forgot);
  form.append(usernameField, passwordField, row, message, submit, support);
  if (debugLoginButton) form.append(debugLoginButton);
  main.append(background, carStage, form);
  if (
    debugAutoLoginEnabled
    && localStorage.getItem("ototrAuth") !== "true"
    && sessionStorage.getItem(debugAutoLoginKey) !== "true"
  ) {
    sessionStorage.setItem(debugAutoLoginKey, "true");
    requestAnimationFrame(() => {
      triggerDebugSession();
    });
  }
  if (
    debugRealAutoLoginEnabled
    && localStorage.getItem("ototrAuth") !== "true"
    && sessionStorage.getItem(debugRealAutoLoginKey) !== "true"
  ) {
    sessionStorage.setItem(debugRealAutoLoginKey, "true");
    requestAnimationFrame(() => {
      submitLogin({
        email: runtimeConfig.debugRealAutoLoginEmail.trim(),
        password: runtimeConfig.debugRealAutoLoginPassword
      });
    });
  }
  return main;
}
function renderBranch(onNavigate) {
  setAuthKeyboardActive(false);
  setStableAuthViewportHeight();

  const storedBranch = getBranchById(localStorage.getItem("ototrBranch"));
  const returnRoute = getBranchReturnRoute();
  let selectedBranch = storedBranch ?? branchOptions[0];
  let defaultBranchEnabled = localStorage.getItem("ototrDefaultBranch") !== "false";

  const main = element("main", { className: "phase2-auth-shell auth-branch-shell branch-select-screen" });
  const header = element("header", { className: "branch-select-header" });
  const backTarget = returnRoute || (localStorage.getItem("ototrAuth") === "true" && storedBranch ? "profile" : "login");
  const backButton = button(icons.arrowLeft, "branch-select-back", () => {
    clearBranchReturnRoute();
    onNavigate(backTarget);
  }, "Geri dön", true);
  const logo = element("img", {
    className: "branch-select-logo",
    attrs: {
      src: "./src/assets/home-reference/ototr-logo.png",
      alt: "OTOTR Tarafsız Araç Ekspertizi"
    }
  });
  const notify = button(`${icons.bell}<b>3</b>`, "branch-select-bell", () => onNavigate("notifications"), "Bildirimler", true);
  header.append(backButton, logo, notify);

  const hero = element("section", { className: "branch-select-hero" });
  hero.append(
    iconWrap("building"),
    element("div", {
      html: "<h1>Şube Seçimi</h1><p>Aktif çalışacağınız OTOTR şubesini seçin.</p>"
    })
  );

  const list = element("section", { className: "branch-list branch-select-list" });
  const feedback = element("div", {
    className: "branch-select-feedback",
    text: `Seçilen şube: ${selectedBranch.name}`,
    attrs: { role: "status", "aria-live": "polite" }
  });
  const selectBranch = (branchId) => {
    const branch = getBranchById(branchId);
    if (!branch) return;
    selectedBranch = branch;
    feedback.textContent = `Seçilen şube: ${branch.name}`;
    renderCards();
  };
  const handleBranchListSelect = (event) => {
    const branchCard = event.target.closest?.(".branch-card");
    if (!branchCard?.dataset.branchId) return;
    event.preventDefault();
    selectBranch(branchCard.dataset.branchId);
  };
  list.addEventListener("click", handleBranchListSelect);
  list.addEventListener("pointerup", handleBranchListSelect);
  const submit = button("Devam Et", "primary-button branch-select-submit", async () => {
    const branchToUse = selectedBranch ?? branchOptions[0];
    localStorage.setItem("ototrAuth", "true");
    localStorage.setItem("ototrBranch", branchToUse.id);
    localStorage.setItem("ototrBranchName", branchToUse.name);
    localStorage.setItem("ototrDefaultBranch", defaultBranchEnabled ? "true" : "false");
    clearBranchReturnRoute();
    submit.disabled = true;
    submit.classList.add("is-loading");
    await syncLiveWorkOrdersBeforeRoute(onNavigate, returnRoute || "home");
  });

  const renderCards = () => {
    list.replaceChildren();
    branchOptions.forEach((branch) => {
      const isSelected = branch.id === selectedBranch.id;
      const card = button("", `branch-card${isSelected ? " selected" : ""}`, undefined, `${branch.name} şubesini seç`);
      card.dataset.branchId = branch.id;
      card.setAttribute("aria-pressed", isSelected ? "true" : "false");
      card.append(
        iconWrap("building"),
        element("span", { className: "branch-card-copy", html: `<strong>${branch.name}</strong><small>${branch.city} · ${branch.code}</small>` }),
        element("span", { className: "branch-check", html: isSelected ? icons.check : "" })
      );
      list.append(card);
    });
  };

  const defaultBranch = button("", "branch-default-toggle", () => {
    defaultBranchEnabled = !defaultBranchEnabled;
    defaultBranch.setAttribute("aria-pressed", defaultBranchEnabled ? "true" : "false");
    defaultBranch.innerHTML = `${defaultBranchEnabled ? icons.check : ""}<span>Varsayılan şube olarak kullan</span>`;
    feedback.textContent = defaultBranchEnabled ? "Varsayılan şube tercihi açık." : "Varsayılan şube tercihi kapalı.";
  }, "Varsayılan şube olarak kullan", true);
  defaultBranch.setAttribute("aria-pressed", defaultBranchEnabled ? "true" : "false");
  defaultBranch.innerHTML = `${defaultBranchEnabled ? icons.check : ""}<span>Varsayılan şube olarak kullan</span>`;

  renderCards();
  main.append(header, hero, list, defaultBranch, feedback, submit);
  return main;
}

function ForgotPasswordScreen(onNavigate) {
  setAuthKeyboardActive(false);
  setStableAuthViewportHeight();
  const main = element("main", { className: "forgot-password-screen app-content" });
  const status = element("p", {
    className: "forgot-password-status",
    attrs: { role: "status", "aria-live": "polite" }
  });
  const contactInput = element("input", {
    className: "forgot-password-input auth-entry-control",
    attrs: {
      type: "text",
      inputmode: "email",
      autocomplete: "email",
      placeholder: "Telefon numaranız veya e-posta adresiniz",
      "aria-label": "Telefon veya e-posta"
    }
  });

  const setStatus = (tone, message) => {
    status.dataset.tone = tone;
    status.textContent = message;
  };

  const sendResetCode = () => {
    const value = contactInput.value?.trim();
    const digits = value?.replace(/\D/g, "") ?? "";
    const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value ?? "");
    const isPhone = digits.length >= 10;

    if (!value || (!isEmail && !isPhone)) {
      setStatus("error", "Telefon numarası veya geçerli e-posta girin.");
      focusAuthInput(contactInput);
      return;
    }

    localStorage.setItem("ototrResetTarget", value);
    setAuthKeyboardActive(false);
    contactInput.blur();
    setStatus("success", "Doğrulama kodu gönderildi. Şifre sıfırlamaya geçiliyor.");
    window.setTimeout(() => onNavigate("reset-password"), 650);
  };

  contactInput.addEventListener("focus", () => {
    setStableAuthViewportHeight();
    setAuthKeyboardActive(true);
  });
  contactInput.addEventListener("blur", releaseAuthKeyboardWhenIdle);
  contactInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendResetCode();
    }
  });

  const header = element("header", { className: "forgot-password-topbar" });
  header.append(
    button(icons.arrowLeft, "forgot-password-icon-button", () => onNavigate("login"), "Giriş ekranına dön", true),
    element("img", {
      className: "forgot-password-logo",
      attrs: {
        src: "./src/assets/home-reference/ototr-logo.png",
        alt: "OTOTR Tarafsız Araç Ekspertizi"
      }
    }),
    button(`${icons.bell}<b>3</b>`, "forgot-password-icon-button forgot-password-bell", () => {
      setStatus("info", "Bildirimlere giriş yaptıktan sonra erişebilirsiniz.");
    }, "Bildirimler", true)
  );

  const hero = element("section", { className: "forgot-password-hero", attrs: { "aria-label": "Güvenli doğrulama" } });
  hero.append(
    element("span", { className: "forgot-password-orbit", attrs: { "aria-hidden": "true" } }),
    element("div", { className: "forgot-password-shield", html: `${icons.shield}<span>${icons.key}</span>` }),
    element("div", { className: "forgot-password-token", html: icons.check })
  );

  const title = element("section", {
    className: "forgot-password-title",
    html: "<h1>Şifremi Unuttum</h1><p>Telefon veya e-posta ile doğrulama alın</p>"
  });

  const form = element("form", { className: "forgot-password-form", attrs: { novalidate: "novalidate" } });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendResetCode();
  });
  const field = element("label", { className: "forgot-password-field" });
  field.append(
    element("span", { className: "forgot-password-label", text: "Telefon / E-posta" }),
    element("span", { className: "forgot-password-input-wrap", html: `${icons.user}` })
  );
  const inputWrap = field.querySelector(".forgot-password-input-wrap");
  inputWrap.append(contactInput);
  wireLoginInputFocus(inputWrap, contactInput);
  form.append(
    field,
    status,
    button(`<span>Doğrulama Kodu Gönder</span>${icons.arrow}`, "forgot-password-primary", sendResetCode, "Doğrulama Kodu Gönder", true),
    button(`${icons.headset}<span>Teknik Desteğe Ulaş</span>`, "forgot-password-secondary", () => {
      setStatus("info", "Teknik destek talebi için yönlendirme hazırlanıyor.");
    }, "Teknik Desteğe Ulaş", true)
  );

  main.append(header, hero, title, form, element("div", { className: "forgot-password-wave", attrs: { "aria-hidden": "true" } }));
  return main;
}

function renderResetPassword(onNavigate) {
  const main = screenMain("Şifre Sıfırlama", "Yeni şifrenizi belirleyin", onNavigate, false);
  const target = localStorage.getItem("ototrResetTarget") ?? "ahmet.usta@ototr.test";
  const password = element("input", { attrs: { type: "password", placeholder: "Yeni şifre", autocomplete: "new-password" } });
  const repeat = element("input", { attrs: { type: "password", placeholder: "Yeni şifre tekrar", autocomplete: "new-password" } });
  const status = element("p", { className: "auth-message", attrs: { role: "status", "aria-live": "polite" } });
  main.append(
    bannerCard("Reset hedefi", `${target} için demo sıfırlama akışı. Canlı şifre servisi bu fazda bağlı değildir.`, "warning"),
    createSection("Yeni Şifre", "", [
      passwordVisibilityField("Yeni şifre", password),
      passwordVisibilityField("Tekrar", repeat),
      status
    ]),
    actionRow([
      button("Vazgeç", "secondary-button full-width", () => onNavigate("login")),
      button("Şifreyi Güncelle", "primary-button full-width", () => {
        if (!password.value || password.value.length < 6 || password.value !== repeat.value) {
          status.className = "auth-message auth-message-error";
          status.textContent = "Şifreler aynı olmalı ve en az 6 karakter içermeli.";
          return;
        }
        localStorage.removeItem("ototrResetTarget");
        status.className = "auth-message auth-message-success";
        status.textContent = "Şifre güncellendi. Giriş ekranına yönlendiriliyorsunuz.";
        onNavigate("login");
      })
    ])
  );
  return main;
}

function passwordVisibilityField(label, inputNode) {
  const wrap = element("label", { className: "form-field password-visibility-field" });
  const inputWrap = element("span", { className: "password-visibility-wrap" });
  const toggle = button(`${icons.eye}<span class="sr-only">Şifreyi göster veya gizle</span>`, "password-visibility-toggle", () => {
    const isHidden = inputNode.getAttribute("type") === "password";
    inputNode.setAttribute("type", isHidden ? "text" : "password");
    toggle.setAttribute("aria-pressed", isHidden ? "true" : "false");
    inputNode.focus();
  }, "Şifreyi göster veya gizle", true);

  toggle.setAttribute("aria-pressed", "false");
  inputWrap.append(inputNode, toggle);
  wrap.append(element("span", { text: label }), inputWrap);
  return wrap;
}

function renderHome(onNavigate) {
  ensureLiveWorkOrdersSync(onNavigate);
  return renderHomeOptimized(onNavigate);
}

function homeApprovedHotspots(onNavigate) {
  const layer = element("div", { className: "home-approved-hotspots" });
  [
    ["Bildirimler", "notifications", "bell"],
    ["Tüm aktif iş emirleri", "jobs", "all-active"],
    ["Aktif iş emrini aç", "tests", "featured"],
    ["Tüm bekleyen araçlar", "jobs", "all-waiting"],
    ["Bekleyen araç 1", "start-proof", "waiting-1"],
    ["Bekleyen araç 2", "start-proof", "waiting-2"],
    ["Bekleyen araç 3", "start-proof", "waiting-3"],
    ["İşe Başla", "start-proof", "quick-start-proof"],
    ["Durum Gir", "tests", "quick-evidence"],
    ["Devam Eden Modül", "tests", "quick-module"],
    ["Tamamlamaya Hazır", "final-report", "quick-ready"],
    ["Görevler", "tests", "nav-tasks"],
    ["İşlerim", "jobs", "nav-jobs"],
    ["Ana Sayfa", "home", "nav-home"],
    ["Eksikler", "missing", "nav-issues"],
    ["Profil", "profile", "nav-profile"]
  ].forEach(([label, route, className]) => {
    layer.append(button("", `home-approved-hotspot ${className}`, () => onNavigate(route), label));
  });
  return layer;
}

function homeFinalHeader(onNavigate) {
  const header = element("header", { className: "home-final-header" });
  header.append(button(`${icons.bell}<b>3</b>`, "notification-button home-final-bell", () => onNavigate("notifications"), "Bildirimler", true));
  return header;
}

function homeFinalProfile(onNavigate) {
  const section = button("", "home-final-profile", () => onNavigate("profile"), "Usta profilini aç");
  section.append(
    element("img", {
      className: "home-final-avatar",
      attrs: { src: "./src/assets/home-reference/technician-avatar.png", alt: "Ahmet Usta" }
    }),
    element("div", {
      className: "home-final-profile-copy",
      html: `<h1>Merhaba, Ahmet Usta</h1><div><strong>Ekspertiz Teknisyeni</strong><i></i><span>${icons.location}İstanbul Kadıköy Şubesi</span></div>`
    })
  );
  return section;
}

function homeFinalKpis(orders = getRuntimeWorkOrders()) {
  const items = [
    { icon: "clipboard", value: "8", label: "Aktif İş Emri", tone: "red" },
    { icon: "check", value: "5", label: "Bugün Tamamlanan", tone: "success" },
    { icon: "alert", value: "2", label: "Eksik / Uyarı", tone: "warning" },
    { icon: "shield", value: "3", label: "Tamamlanan", tone: "info" }
  ];
  const grid = element("section", { className: "home-final-kpis" });
  items.forEach((item) => {
    const card = element("article", { className: `home-final-kpi tone-${item.tone}` });
    card.append(iconWrap(item.icon), element("span", { text: item.label }), element("b", { text: item.value }));
    grid.append(card);
  });
  return grid;
}

function filterWorkOrdersByStatus(orders, statusList) {
  return orders.filter((order) => statusList.includes(order.status));
}

function homeFinalReferenceRows(waitingOrders = [], missingOrders = [], technicalOrders = []) {
  return [
    waitingOrders[0],
    missingOrders[0],
    technicalOrders[0]
  ].filter(Boolean);
}

function homeFinalFeatured(onNavigate, featuredOrder) {
  const wrap = element("section", { className: "home-final-block" });
  wrap.append(homeFinalSectionTitle("Aktif İş Emirleri", "Tümünü Gör", () => onNavigate("jobs")));
  const order = featuredOrder ?? getRuntimeWorkOrders()[0];
  const targetRoute = getWorkOrderTargetRoute(order);
  const card = button("", "home-final-featured-card", () => {
    setSelectedWorkOrder(order);
    onNavigate(targetRoute);
  }, "Aktif iş emrini aç");
  card.append(
    element("img", {
      className: "home-final-featured-car",
      attrs: { src: homeFinalVehicleImagePath(order), alt: order.brandModel }
    }),
    element("div", {
      className: "home-final-featured-copy",
      html: `<div class="home-final-plate"><span>TR</span><strong>${order.plate}</strong></div><h2>${order.brandModel}</h2><p><span>${icons.engine}${order.packageName}</span><em></em><span>${icons.gauge}${order.km}</span></p>`
    }),
    homeFinalProgressRing(order.progress || 0)
  );
  return wrap.appendChild(card), wrap;
}

function homeFinalWaitingVehicles(onNavigate, rows = []) {
  const wrap = element("section", { className: "home-final-block" });
  wrap.append(homeFinalSectionTitle("Bekleyen Araçlar", "Tümünü Gör", () => onNavigate("jobs")));
  if (!rows.length) {
    wrap.append(homeFinalEmptyListState("Şu an bekleyen iş emri bulunamadı."));
    return wrap;
  }
  const list = element("div", { className: "home-final-waiting-list" });
  rows.forEach((row) => {
    list.append(createHomeFinalVehicleRow(onNavigate, row));
  });
  wrap.append(list);
  return wrap;
}

function homeFinalTechnicalReviewVehicles(onNavigate, rows = []) {
  const wrap = element("section", { className: "home-final-block" });
  wrap.append(homeFinalSectionTitle("Tamamlananlar", "Tümünü Gör", () => onNavigate("jobs")));
  if (!rows.length) {
    wrap.append(homeFinalEmptyListState("Şu an tamamlanan araç bulunamadı."));
    return wrap;
  }
  const list = element("div", { className: "home-final-waiting-list" });
  rows.forEach((row) => {
    list.append(createHomeFinalVehicleRow(onNavigate, row));
  });
  wrap.append(list);
  return wrap;
}

function homeFinalMissingVehicles(onNavigate, rows = []) {
  const wrap = element("section", { className: "home-final-block" });
  wrap.append(homeFinalSectionTitle("Eksikler", "Tümünü Gör", () => onNavigate("jobs")));
  if (!rows.length) {
    wrap.append(homeFinalEmptyListState("Şu an eksik veya uyarı bulunmuyor."));
    return wrap;
  }
  const list = element("div", { className: "home-final-waiting-list" });
  rows.forEach((row) => {
    list.append(createHomeFinalVehicleRow(onNavigate, row));
  });
  wrap.append(list);
  return wrap;
}

function createHomeFinalVehicleRow(onNavigate, order) {
  const tone = homeFinalRowTone(order);
  const targetRoute = getWorkOrderTargetRoute(order);
  const statusText = homeFinalStatusLabel(order);
  const row = button("", `home-final-waiting-row tone-${tone}`, () => {
    setSelectedWorkOrder(order);
    onNavigate(targetRoute);
  }, `${order.plate} iş emrini aç`);
  row.innerHTML = `<span class="home-final-brand brand-${order.brand.toLowerCase()}">${homeFinalBrandGraphic(order)}</span><img src="${homeFinalVehicleImagePath(order)}" alt="${order.brandModel}"><div><b class="home-final-mini-plate"><strong>${order.plate}</strong></b><span>${order.brandModel}</span></div><em class="tone-${tone}">${statusText}</em>${icons.arrow}`;
  return row;
}

function homeFinalVehicleImagePath(order) {
  const images = {
    bmw: "./src/assets/home-reference/hero-car-ref.png",
    passat: "./src/assets/home-reference/row-car-vw-ref.png",
    megane: "./src/assets/home-reference/row-car-renault-ref.png",
    peugeot: "./src/assets/home-reference/row-car-peugeot-ref.png"
  };
  return images[order.image] ?? getVehicleImagePath(order);
}

function homeFinalRowTone(order) {
  const tones = {
    waiting_start_proof: "success",
    start_proof_incomplete: "success",
    test_missing: "warning",
    returned_for_correction: "warning",
    technical_review: "info",
    completed: "success"
  };
  return tones[order.status] ?? workOrderStatusTones[order.status] ?? "info";
}

function homeFinalStatusLabel(order) {
  const labels = {
    waiting_start_proof: "Tamamlandı",
    start_proof_incomplete: "Tamamlandı",
    test_missing: "Eksikleri Var",
    returned_for_correction: "Düzeltme",
    technical_review: "Tamamlandı",
    completed: "Tamamlandı"
  };
  return labels[order.status] ?? workOrderStatusLabels[order.status] ?? order.status;
}

function homeFinalEmptyListState(message) {
  return element("div", {
    className: "home-final-empty",
    html: `<p>${message}</p>`
  });
}

function homeFinalBrandLabel(brand) {
  const labels = {
    vw: "VW",
    renault: "R",
    peugeot: "PE",
    bmw: "BMW",
    volkswagen: "VW",
    ford: "FOR"
  };
  return labels[brand] ?? brand.toUpperCase();
}

function homeFinalBrandGraphic(order) {
  const brand = order.brand.toLowerCase();
  const graphics = {
    volkswagen: "./src/assets/home-reference/brand-vw-ref.png",
    vw: "./src/assets/home-reference/brand-vw-ref.png",
    renault: "./src/assets/home-reference/brand-renault-ref.png",
    peugeot: "./src/assets/home-reference/brand-peugeot-ref.png"
  };
  const src = graphics[brand];
  if (!src) return homeFinalBrandLabel(brand);
  return `<img src="${src}" alt="${homeFinalBrandLabel(brand)}" aria-hidden="true">`;
}

function homeFinalQuickActions(onNavigate, readyCount = 0) {
  const readyLabel = `${readyCount} iş emri hazır`;
  const actions = [
    { label: "İş Emri Tara", description: "İş emrini tara", icon: "scan", route: "start-proof", badge: "", tone: "red" },
    { label: "Durum Gir", description: "Fotoğraf opsiyonel", icon: "camera", route: "tests", badge: "", tone: "blue" },
    { label: "Devam Eden Modül", description: "Motor Kontrolü", icon: "engine", route: "tests", badge: "", tone: "orange" },
    { label: "Tamamlamaya Hazır", description: readyLabel, icon: "shield", route: "final-report", badge: readyCount ? String(readyCount) : "", tone: "purple" }
  ];
  const wrap = element("section", { className: "home-final-block home-final-actions-block" });
  wrap.append(element("h2", { text: "Hızlı Aksiyonlar" }));
  const grid = element("div", { className: "home-final-actions" });
  actions.forEach((item) => {
    const action = button("", `home-final-action tone-${item.tone}`, () => onNavigate(item.route), item.label);
    action.append(iconWrap(item.icon), element("span", { html: `<strong>${item.label}</strong><small>${item.description}</small>` }));
    if (item.badge) action.append(element("b", { text: item.badge }));
    grid.append(action);
  });
  wrap.append(grid);
  return wrap;
}

function homeFinalSectionTitle(title, label, onClick) {
  const row = element("div", { className: "home-final-section-title" });
  row.append(element("h2", { text: title }), button(`${label} ${icons.arrow}`, "home-final-link", onClick, label, true));
  return row;
}

function homeFinalProgressRing(value) {
  const totalTicks = 40;
  const activeTicks = Math.round((Math.max(0, Math.min(100, value)) / 100) * totalTicks);
  const ticks = Array.from({ length: totalTicks }, (_, index) => {
    const tone = index < activeTicks ? "active" : index < activeTicks + 4 ? "soft-red" : "inactive";
    return `<i class="home-final-ring-tick tone-${tone}" style="--tick:${index}"></i>`;
  }).join("");
  const ring = element("div", {
    className: "home-final-ring",
    html: `<b class="home-final-ring-ticks" aria-hidden="true">${ticks}</b><strong>%${value}</strong><span>İlerleme</span>`
  });
  return ring;
}

function renderJobs(onNavigate) {
  ensureLiveWorkOrdersSync(onNavigate);
  const main = element("main", { className: "phase2-main jobs-approved-screen" });
  let activeFilter = "all";
  let searchQuery = "";
  let kpiStrip;
  const setActiveFilter = (nextFilter) => {
    activeFilter = nextFilter;
    syncKpis();
    refresh();
  };
  const list = element("section", { className: "work-list phase2-work-list jobs-approved-list" });
  const clearFilters = () => {
    activeFilter = "all";
    searchQuery = "";
    setActiveFilter("all");
  };
  const matchesFilter = (order, filter) => {
    if (filter === "waiting") return order.status === "waiting_start_proof" || order.status === "start_proof_incomplete";
    if (filter === "devam") return order.status === "in_progress";
    if (filter === "tamamlanan") return order.status === "completed";
    if (filter === "technical") return order.status === "technical_review";
    if (filter === "eksik") return order.status === "test_missing" || order.status === "returned_for_correction" || order.missingCount > 0;
    return true;
  };
  const matchesSearch = (order, query) => {
    if (!query) return true;
    const searchable = [
      order.plate,
      order.brand,
      order.model,
      order.brandModel,
      order.vin,
      order.packageName
    ].map((item) => (item || "").toLowerCase()).join(" ");
    return searchable.includes(query);
  };
  const refresh = () => {
    list.replaceChildren();
    const query = searchQuery.trim().toLowerCase();
    const orders = getRuntimeWorkOrders();
    if (activeFilter !== "all" && !query && !orders.some((order) => matchesFilter(order, activeFilter))) {
      activeFilter = "all";
      syncKpis();
    }
    const rows = orders
      .filter((order) => matchesFilter(order, activeFilter))
      .filter((order) => matchesSearch(order, query));

    if (!rows.length) {
      list.append(createJobsEmptyState(onNavigate, clearFilters, activeFilter));
      return;
    }

    rows.forEach((order) => list.append(jobsApprovedCard(order, onNavigate)));
  };
  const syncKpis = () => {
    kpiStrip?.querySelectorAll("button").forEach((button) => {
      const isActive = button.dataset.filter === activeFilter;
      if (isActive) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  };
  kpiStrip = jobsKpiStrip(setActiveFilter);
  main.append(jobsApprovedHeader(onNavigate), kpiStrip);
  syncKpis();
  refresh();
  main.append(list);
  return main;
}

function createJobsEmptyState(onNavigate, onReset, activeFilter) {
  const section = element("div", { className: "jobs-empty-state-inline" });
  const message = `Bu filtreye göre iş emri bulunamadı (${activeFilter}).`;
  section.append(
    element("h2", { text: "İş Emri Bulunamadı" }),
    element("p", { text: "Seçili filtreye veya aramaya uygun iş emri bulunamadı." }),
    element("p", { className: "jobs-empty-inline-meta", text: message }),
    actionRow([
      button("Filtreleri Temizle", "secondary-button jobs-empty-reset", () => onReset?.(), "Filtreleri temizle"),
      button("İşlerime Dön", "primary-button jobs-empty-jobs", () => onNavigate("jobs"), "İşlerime dön")
    ])
  );
  return section;
}

function renderDetail(onNavigate) {
  ensureLiveWorkOrdersSync(onNavigate);
  const order = getSelectedWorkOrder();
  const statusLabel = workOrderStatusLabels[order.status] ?? order.status;
  const statusTone = workOrderStatusTones[order.status] ?? "neutral";
  const actionMap = {
    waiting_start_proof: ["İşe Başlama Kanıtına Git", "start-proof"],
    start_proof_incomplete: ["Kanıtı Tamamla", "start-proof"],
    in_progress: ["Teste Devam Et", "tests"],
    test_missing: ["Eksikleri Gör", "missing"],
    technical_review: ["Tamamlanma Durumunu Gör", "summary"],
    completed: ["Özeti Gör", "summary"],
    returned_for_correction: ["Düzeltmeleri Gör", "missing"]
  };
  const cta = actionMap[order.status] || ["Özeti Gör", "summary"];
  const main = screenMain("İş Emri Detayı", "Bayi/ERP kaynaklı görev özeti", onNavigate, true);
  main.append(
    element("section", {
      className: "detail-approved-hero section-card",
      html: `<div class="detail-approved-plate-row"><span class="detail-country">TR</span><h2>${order.plate}</h2></div>
        <div class="detail-approved-vehicle-copy"><h3>${order.brandModel} <span class="status-badge detail-brand-status" data-tone="${statusTone}">${statusLabel}</span></h3><p><span>${icons.calendar}${order.year}</span><span>${icons.engine}${order.packageName}</span><span>${icons.gauge}${order.km}</span></p></div>
        <img class="detail-approved-car" src="${getVehicleImagePath(order)}" alt="${order.brandModel}">`
    }),
    createSection("Araç Bilgileri", "İş emri bayi/ERP tarafından açılmıştır. Usta yeni iş emri oluşturamaz.", [
      summaryTileGrid([
        ["VIN", order.vin ?? "-"],
        ["KM", order.km ?? "-"],
        ["Paket", order.packageName ?? "-"],
        ["Eksik Sayısı", `${order.missingCount ?? 0}`],
        ["Fotoğraf", `${order.photoCount ?? 0}`],
        ["Planlanan Süre", order.plannedTime ?? "-"]
      ])
    ]),
    createSection("Paket / Test Listesi", "Ekspertiz başlıkları araç paketine göre hazırlandı ve görev modüllerine bağlandı.", [
      listSummary(["Kaporta / Boya", "Mekanik", "Motor", "Elektrik", "Beyin / OBD", "Airbag", "İç Donanım", "Dış Donanım", "Yol Testi", "Fotoğraflar"], "neutral")
    ]),
    actionRow([
      button("Eksikleri Gör", "secondary-button full-width", () => onNavigate("missing")),
      button(cta[0], "primary-button full-width", () => onNavigate(cta[1]))
    ])
  );
  return main;
}

function renderStart(onNavigate) {
  const order = getSelectedWorkOrder();
  const vehicle = {
    plate: order.plate,
    brandModel: order.brandModel.toUpperCase(),
    vin: order.vin,
    currentKm: order.km.replace(/\s*km$/i, ""),
    transmissionType: order.transmissionType ?? order.vitesTipi ?? "",
    lastSystemKm: "92.450",
    imagePath: getVehicleImagePath(order)
  };
  const main = element("main", { className: "phase2-main start-proof-screen start-proof-state-normal" });
  main.append(
    startProofHeader(onNavigate),
    startProofVehicleCard(vehicle),
    startProofVinBlock(vehicle),
    startProofPlateKmBlock(vehicle),
    startProofTransmissionBlock(vehicle),
    startProofEvidenceBlock(onNavigate),
    startProofInfoBand(),
    startProofAction(onNavigate)
  );
  return main;
}

function startProofHeader(onNavigate) {
  const header = element("header", { className: "start-proof-header app-header phase2-top-header" });
  header.append(
    button("‹", "icon-button start-proof-back", () => onNavigate("job-detail"), "Geri dön"),
    element("h1", { text: "İşe Başlama Kanıtı" }),
    element("span", { className: "start-proof-header-spacer", attrs: { "aria-hidden": "true" } })
  );
  return header;
}

function startProofVehicleCard(vehicle) {
  const card = element("section", { className: "start-proof-vehicle-card" });
  card.append(
    element("img", {
      className: "start-proof-car",
      attrs: {
        src: vehicle.imagePath,
        alt: `${vehicle.brandModel} araç görseli`
      }
    }),
    element("div", {
      className: "start-proof-vehicle-copy",
      html: `<strong>${vehicle.plate}</strong><span>${vehicle.brandModel}</span>`
    }),
    element("div", {
      className: "start-proof-vehicle-side",
      html: `<small>Şasi (VIN): <b>${vehicle.vin}</b></small>`
    })
  );
  return card;
}

function startProofVinBlock(vehicle) {
  const section = element("section", { className: "start-proof-block start-proof-vin-block" });
  const input = element("input", {
    attrs: {
      type: "text",
      value: vehicle.vin,
      maxlength: "17",
      inputmode: "latin",
      autocomplete: "off",
      "aria-label": "Şasi VIN numarası"
    }
  });
  input.addEventListener("input", () => {
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
    const counter = section.querySelector(".start-proof-counter");
    const valid = input.value.length === 17;
    if (counter) counter.textContent = `${input.value.length} / 17`;
    section.classList.toggle("is-valid", valid);
  });
  const field = element("label", { className: "start-proof-vin-field" });
  field.append(
    element("span", { className: "start-proof-input-icon tone-red", html: icons.scan }),
    input,
    element("span", { className: "start-proof-counter", text: "17 / 17" }),
    element("span", { className: "start-proof-check", html: icons.check })
  );
  section.append(
    element("h2", { html: `1. Şasi (VIN) Numarası <b>*</b>` }),
    field
  );
  return section;
}

function startProofPlateKmBlock(vehicle) {
  const section = element("section", { className: "start-proof-block start-proof-plate-km-block" });
  const row = element("div", { className: "start-proof-two-col" });
  row.append(
    startProofMiniInput("2. Plaka", vehicle.plate, "red", icons.clipboard, ""),
    startProofMiniInput("3. Araç Kilometresi (km)", vehicle.currentKm, "amber", icons.gauge, "km")
  );
  section.append(
    row,
    element("div", {
      className: "start-proof-km-band",
      html: `<span class="start-proof-info-icon">i</span><strong>Sistemdeki son kilometre: ${vehicle.lastSystemKm} km</strong><b>Düşük Km Uyarısı</b>`
    })
  );
  return section;
}

function startProofTransmissionBlock(vehicle) {
  const section = element("section", { className: "start-proof-block start-proof-transmission-block" });
  const options = element("div", { className: "start-proof-transmission-options", attrs: { role: "radiogroup", "aria-label": "Vites tipi" } });
  ["Otomatik", "Manuel", "Yarı Otomatik"].forEach((type) => {
    const option = button(type, `start-proof-transmission-option${type === vehicle.transmissionType ? " is-selected" : ""}`, () => {
      options.querySelectorAll(".start-proof-transmission-option").forEach((item) => {
        item.classList.toggle("is-selected", item === option);
        item.setAttribute("aria-checked", item === option ? "true" : "false");
      });
      localStorage.setItem("ototrStartProofTransmissionType", type);
      section.classList.remove("has-error");
      updateStartProofSubmitState();
    }, type);
    option.setAttribute("role", "radio");
    option.setAttribute("aria-checked", type === vehicle.transmissionType ? "true" : "false");
    options.append(option);
  });
  section.append(
    element("h2", { html: "4. Vites Tipi <b>*</b>" }),
    element("p", { className: "start-proof-optional-note", text: "Usta için zorunlu. Sekreterya iş emri detayında bu bilgiyi buradan kullanabilir." }),
    options
  );
  return section;
}

function startProofMiniInput(label, value, tone, icon, suffix) {
  const wrap = element("label", { className: `start-proof-mini-field tone-${tone}` });
  const input = element("input", {
    className: "start-proof-real-input",
    attrs: {
      type: "text",
      value,
      inputmode: suffix ? "numeric" : "text",
      autocomplete: "off",
      "aria-label": label.replace(/^\d+\.\s*/, "")
    }
  });
  input.addEventListener("input", () => {
    input.value = suffix
      ? input.value.replace(/[^0-9]/g, "").slice(0, 7)
      : input.value.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 12);
  });
  const field = element("span", { className: "start-proof-mini-input" });
  field.append(
    element("i", { html: icon }),
    input,
    ...(suffix ? [element("em", { text: suffix })] : []),
    element("span", { html: icons.check })
  );
  wrap.append(
    element("span", { className: "start-proof-mini-label", html: `${label} <b>*</b>` }),
    field
  );
  return wrap;
}

function startProofEvidenceBlock(onNavigate) {
  const section = element("section", { className: "start-proof-block start-proof-evidence-block" });
  const list = element("div", { className: "start-proof-evidence-list" });
  [
    ["vinPhoto", "Şasi (VIN) Fotoğrafı", "Araç üzerindeki şasi numarası", "red", icons.scan],
    ["platePhoto", "Plaka Fotoğrafı", "Aracın plaka görünümü", "amber", icons.clipboard],
    ["kmPhoto", "KM Ekran Fotoğrafı", "Kilometre ekranı net görünüm", "violet", icons.gauge]
  ].forEach(([id, title, description, tone, icon]) => {
    list.append(startProofEvidenceRow({ id, title, description, tone, icon }, onNavigate));
  });
  section.append(element("h2", { html: "5. Gerekli Kanıt Fotoğrafları <b>*</b>" }), list);
  return section;
}

function startProofEvidenceRow({ id, title, description, tone, icon }, onNavigate) {
  const row = element("article", { className: `start-proof-evidence-row tone-${tone}`, dataset: { evidenceId: id } });
  const fieldKey = `start_proof_${id}`;
  const existingCapture = getEvidenceCaptureStore().find((item) => item.fieldKey === fieldKey);
  if (existingCapture?.id) {
    row.dataset.captureId = existingCapture.id;
    row.classList.add("is-complete");
  }
  const action = button(`${icons.camera}<span>Fotoğraf Çek / Yükle</span>`, "start-proof-camera-drop", () => {
    if (row.classList.contains("is-complete")) {
      removeEvidenceCaptureById(row.dataset.captureId || "");
      delete row.dataset.captureId;
      row.classList.remove("is-complete");
      updateStartProofSubmitState();
      return;
    }

    const order = getSelectedWorkOrder();
    recordWorkflowStep("start_proof_evidence_selected", {
      currentCaseId: order.expertiseCaseId || order.id,
      expertiseCaseId: order.expertiseCaseId || order.id,
      selectedEvidenceSlot: title,
      selectedEvidenceStatus: "Bekliyor",
      selectedEvidenceFieldKey: fieldKey,
      selectedReportFieldKey: fieldKey,
      selectedModuleTitle: "İşe Başlama Kanıtı",
      workOrderStatus: "start_proof_evidence_required"
    });
    onNavigate("camera");
    return;
    const { item } = saveCapturedEvidence("start-proof", {
      dataUrl: startProofPlaceholderDataUrl(),
      fileName: `${order.plate.replace(/\s+/g, "-").toLowerCase()}-${id}-${Date.now()}.png`,
      mimeType: "image/png",
      sizeBytes: 92,
      sizeText: "Gercek kamera",
      note: `${title} canlı iş emrine bağlandı.`
    });
    row.dataset.captureId = item.id;
    row.classList.add("is-complete");
    updateStartProofSubmitState();
  }, `${title} ekle`, true);
  row.append(
    element("span", { className: "start-proof-evidence-icon", html: icon }),
    element("div", {
      className: "start-proof-evidence-copy",
      html: `<strong>${title}</strong><p>${description}</p><b>Zorunlu</b>`
    }),
    action,
    element("div", { className: "start-proof-evidence-done", html: `<span>${icons.check}</span><strong>Çekildi</strong><button type="button" aria-label="${title} kanıtını kaldır">×</button>` })
  );
  row.querySelector(".start-proof-evidence-done button")?.addEventListener("click", (event) => {
    event.stopPropagation();
    removeEvidenceCaptureById(row.dataset.captureId || "");
    delete row.dataset.captureId;
    row.classList.remove("is-complete");
    updateStartProofSubmitState();
  });
  return row;
}

function startProofPlaceholderDataUrl() {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lhD2NwAAAABJRU5ErkJggg==";
}

function startProofInfoBand() {
  return element("div", {
    className: "start-proof-system-band",
    html: `<span>${icons.shield}</span><strong>Doğrulama sonrası sistem kaydı kontrol edilecektir.</strong>`
  });
}

function startProofAction(onNavigate) {
  const wrap = element("section", { className: "start-proof-submit-wrap" });
  const warning = element("p", { className: "start-proof-inline-warning", text: "Teste başlamak için üç zorunlu fotoğrafı tamamlayın ve vites tipini seçin." });
  const submit = button(`${icons.check}<span>İş Emri Tamamla, Teste Başla</span>`, "start-proof-primary-cta", async () => {
    if (submit.dataset.ready === "true") {
      const order = getSelectedWorkOrder();
      localStorage.setItem(`ototrWorkOrderStatus:${order.id}`, "in_progress");
      submit.dataset.syncing = "true";
      submit.querySelector("span").textContent = "Kanıtlar kaydediliyor...";
      const syncResult = await syncPendingEvidenceCaptureStoreWithTimeout().catch((error) => ({
        uploadedCount: 0,
        failedCount: 1,
        attemptedCount: 0,
        errorMessage: error?.message || "Kanıt senkronu tamamlanamadı."
      }));
      const statusResult = await transitionLiveWorkOrderStatusWithTimeout({
        expertiseCaseId: order.expertiseCaseId || order.id,
        nextStatus: "in_progress",
        reason: "Mobil işe başlama kanıtı tamamlandı."
      }).catch((error) => ({
        ok: false,
        status: "error",
        reason: error?.message || "Canlı durum güncellemesi tamamlanamadı."
      }));
      recordWorkflowStep("start_proof_completed", {
        currentCaseId: order.expertiseCaseId || order.id,
        expertiseCaseId: order.expertiseCaseId || order.id,
        startProofEvidenceCount: 3,
        evidenceSyncAttempted: syncResult.attemptedCount ?? 0,
        evidenceUploadedCount: syncResult.uploadedCount ?? 0,
        evidenceFailedCount: syncResult.failedCount ?? 0,
        evidenceSyncTimedOut: Boolean(syncResult.timedOut),
        liveStatusUpdated: Boolean(statusResult.ok),
        liveStatusResult: statusResult.status,
        liveRemoteStatus: statusResult.remoteStatus || "",
        workOrderStatus: "in_progress"
      });
      onNavigate("start-proof-success");
      return;
    }
    warning.classList.add("is-visible");
    updateStartProofSubmitState();
  }, "İş emri tamamla, teste başla", true);
  submit.dataset.ready = "false";
  wrap.append(warning, submit);
  return wrap;
}

function updateStartProofSubmitState() {
  const rows = Array.from(document.querySelectorAll(".start-proof-evidence-row"));
  const transmissionSelected = Boolean(document.querySelector(".start-proof-transmission-option.is-selected"));
  const ready = rows.length === 3 && rows.every((row) => row.classList.contains("is-complete")) && transmissionSelected;
  const submit = document.querySelector(".start-proof-primary-cta");
  const warning = document.querySelector(".start-proof-inline-warning");
  if (submit) submit.dataset.ready = ready ? "true" : "false";
  if (warning && ready) warning.classList.remove("is-visible");
  document.querySelector(".start-proof-transmission-block")?.classList.toggle("has-error", !transmissionSelected && warning?.classList.contains("is-visible"));
}

function renderStartProofSuccess(onNavigate) {
  const main = element("main", {
    className: "phase2-main start-proof-success-screen",
    attrs: { "aria-live": "polite" }
  });
  const progressText = element("p", {
    className: "start-proof-success-progress-text",
    text: "Bir sonraki ekrana yönlendiriliyorsunuz..."
  });
  const completedText = element("p", {
    className: "start-proof-success-complete",
    text: "Tamamlandı!"
  });
  const checkMark = element("span", {
    className: "start-proof-success-bar-check",
    html: icons.check,
    attrs: { "aria-hidden": "true" }
  });

  main.append(
    element("section", {
      className: "start-proof-success-hero",
      html: `
        <div class="start-proof-success-logo" aria-label="OTOTR"><span>OTO</span><b>TR</b></div>
        <div class="start-proof-success-burst" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i><i></i>
        </div>
        <div class="start-proof-success-icon">${icons.check}</div>
        <h1>İş başlatıldı!</h1>
        <p>İşe başlama kanıtı başarıyla kaydedildi ve iş emri başlatıldı.</p>
      `
    }),
    startProofSuccessChecklist(),
    startProofSuccessNextStep(),
    element("section", {
      className: "start-proof-success-progress",
      attrs: { "aria-label": "Ekspertiz başlıklarına yönlendirme ilerlemesi" }
    })
  );

  const progress = main.querySelector(".start-proof-success-progress");
  progress.append(
    progressText,
    element("div", {
      className: "start-proof-success-bar-track",
      html: `<span class="start-proof-success-bar-fill"></span>`
    }),
    checkMark,
    completedText
  );

  const completeTimer = window.setTimeout(() => {
    main.classList.add("is-complete");
    progressText.textContent = "Tamamlandı!";
  }, 1550);
  const routeTimer = window.setTimeout(() => onNavigate("tests"), 1990);
  main.ototrCleanup = () => {
    window.clearTimeout(completeTimer);
    window.clearTimeout(routeTimer);
  };
  return main;
}

function startProofSuccessChecklist() {
  const card = element("section", { className: "start-proof-success-card start-proof-success-checklist" });
  [
    ["camera", "Fotoğraflar kaydedildi", "3 fotoğraf başarıyla kaydedildi."],
    ["scan", "AI Netlik Kontrolü", "Fotoğraflar net ve okunaklı."],
    ["clock", "Saat kaydedildi", "12 Mayıs 2025 • 10:30"]
  ].forEach(([icon, title, description]) => {
    card.append(element("article", {
      className: "start-proof-success-row",
      html: `
        <span class="start-proof-success-row-icon">${icons[icon]}</span>
        <span class="start-proof-success-row-copy"><strong>${title}</strong><small>${description}</small></span>
        <span class="start-proof-success-row-check">${icons.check}</span>
      `
    }));
  });
  return card;
}

function startProofSuccessNextStep() {
  return element("section", {
    className: "start-proof-success-next",
    html: `
      <span class="start-proof-success-next-icon">${icons.clipboard}</span>
      <span class="start-proof-success-next-copy">
        <small>Sıradaki adım</small>
        <strong>Ekspertiz Başlıkları</strong>
        <p>Ekspertiz sürecine başlamak için başlıklara yönlendiriliyorsunuz.</p>
      </span>
      <span class="start-proof-success-chevrons" aria-hidden="true">›››</span>
    `
  });
}

function renderSectionOwnedSuccess(onNavigate) {
  const main = extraStateMain("Başlık Sahiplendi", "Kaporta Panel Kontrolü artık senin üzerinde.", "success", "shield");
  main.append(
    extraInfoGrid([
      ["Başlık", "Kaporta Panel Kontrolü"],
      ["Sahiplenen", "Ahmet Usta"],
      ["Yetki", "Düzenleme açık"],
      ["Saat", "12.05.2025 09:18"]
    ]),
    extraActionStack([
      button("Kontrole Başla", "primary-button full-width", () => onNavigate("moduleControl")),
      button("Başlıklara Dön", "secondary-button full-width", () => onNavigate("tests"))
    ])
  );
  return main;
}

function renderManagerTakeoverSuccess(onNavigate) {
  const lockedSection = getLockedSectionData();
  const main = extraStateMain("Müdür Talebi Gönderildi", "Talebin müdür ekranına iletildi. Başlık müdür kararı gelene kadar kilitli kalır.", "success", "send");
  main.append(
    extraInfoGrid([
      ["Başlık", lockedSection.sectionName],
      ["Sahiplenen Usta", lockedSection.lockedBy],
      ["Talep Durumu", "Müdür onayı bekliyor"],
      ["İşlem", "Devralma talebi"]
    ]),
    extraTimeline([
      ["Talep oluşturuldu", "Tamamlandı", "success"],
      ["Müdür incelemesi", "Bekliyor", "warning"],
      ["Yetki güncellemesi", "Sonraki adım", "neutral"]
    ]),
    extraActionStack([
      button("Başlıklara Dön", "primary-button full-width", () => {
        clearLockedSectionRequest();
        onNavigate("tests");
      }),
      button("Kilitli Başlığı Gör", "secondary-button full-width", () => onNavigate("lock"))
    ])
  );
  return main;
}

function renderSaveSuccess(onNavigate) {
  const main = extraStateMain("Kaydetme Başarılı", "Girdiğin veriler, notlar ve kanıt durumu güvenli şekilde kaydedildi.", "success", "check");
  main.append(
    extraChecklist([
      ["Kontrol verileri kaydedildi", "success"],
      ["Fotoğraf slotları korundu", "success"],
      ["Usta notu güncellendi", "success"]
    ]),
    extraActionStack([
      button("Devam Et", "primary-button full-width", () => onNavigate("itemDetail")),
      button("Başlıklara Dön", "secondary-button full-width", () => onNavigate("tests"))
    ])
  );
  return main;
}

function renderSaveAndContinue(onNavigate) {
  const main = extraStateMain("Kaydedildi, Sıradaki Kontrole Geçiliyor", "Mevcut kontrol tamamlandı. Bir sonraki başlık hazırlanıyor.", "success", "sync");
  main.append(extraProgress("Sıradaki kontrol yükleniyor", 100), extraChecklist([
    ["Form kaydedildi", "success"],
    ["Kanıtlar kuyruğa alındı", "success"],
    ["Sıradaki başlık hazırlandı", "warning"]
  ]));
  const timer = window.setTimeout(() => onNavigate("statusModal"), 1700);
  main.ototrCleanup = () => window.clearTimeout(timer);
  return main;
}

function renderUnsavedChangesWarning(onNavigate) {
  const main = extraStateMain("Kaydedilmemiş Değişiklik Var", "Bu formdan çıkarsan son düzenlemelerin kaybolabilir.", "warning", "alert");
  main.append(
    extraChecklist([
      ["Seçilen durum alanı kaydedilmedi", "warning"],
      ["Açıklama alanında yeni metin var", "warning"],
      ["Kanıt slotu değişikliği bekliyor", "warning"]
    ]),
    extraActionStack([
      button("Kaydet ve Çık", "primary-button full-width", () => onNavigate("save-success")),
      button("Kaydetmeden Çık", "secondary-button full-width", () => onNavigate("discard-changes")),
      button("Vazgeç", "text-button full-width", () => onNavigate("itemDetail"))
    ])
  );
  return main;
}

function renderDiscardChangesConfirm(onNavigate) {
  const main = extraStateMain("Kaydetmeden Çıkış Onayı", "Bu işlem geri alınamaz. Kaydedilmeyen değişiklikler silinecek.", "red", "xCircle");
  main.append(
    extraInfoGrid([
      ["Hedef", "Ekspertiz Başlıkları"],
      ["Silinecek değişiklik", "3 alan"],
      ["Korunan veri", "Son kayıtlı form"],
      ["Durum", "İkinci onay gerekli"]
    ]),
    extraActionStack([
      button("Evet, Kaydetmeden Çık", "primary-button full-width danger-button", () => onNavigate("tests")),
      button("Hayır, Forma Dön", "secondary-button full-width", () => onNavigate("itemDetail"))
    ])
  );
  return main;
}

function renderSectionCompletedSuccess(onNavigate) {
  const main = extraStateMain("Başlık Tamamlandı", "Kaporta Panel Kontrolü zorunlu alanlarıyla tamamlandı.", "success", "check");
  main.append(
    extraInfoGrid([
      ["Tamamlanan madde", "18/18"],
      ["Kanıt", "6 fotoğraf"],
      ["Eksik", "Yok"],
      ["Durum", "Kontrol tamamlandı"]
    ]),
    extraActionStack([
      button("Sonraki Başlığa Geç", "primary-button full-width", () => onNavigate("moduleControl")),
      button("Son Başlık Tamamlandı", "secondary-button full-width", () => onNavigate("all-sections-completed")),
      button("Başlıklara Dön", "secondary-button full-width", () => onNavigate("tests"))
    ])
  );
  return main;
}

function renderAllSectionsCompleted(onNavigate) {
  const main = extraStateMain("Tüm Başlıklar Tamamlandı", "Zorunlu ekspertiz başlıkları tamamlandı. İş özeti hazır.", "success", "clipboard");
  main.append(
    extraInfoGrid([
      ["Başlık", "7/7 tamamlandı"],
      ["Kanıt", "18 fotoğraf"],
      ["Eksik / Uyarı", "2 takip maddesi"],
      ["Rapor", "Oluşturulabilir"]
    ]),
    extraActionStack([
      button("Rapor Oluştur", "primary-button full-width", () => onNavigate("report-created")),
      button("İş Özetine Geç", "secondary-button full-width", () => onNavigate("summary")),
      button("Başlıklara Dön", "secondary-button full-width", () => onNavigate("tests"))
    ])
  );
  return main;
}

function renderReportCreatedSuccess(onNavigate) {
  const main = extraStateMain("Rapor Oluşturuldu", "Rapor taslağı son kontrol için görüntülenebilir hale geldi.", "success", "report");
  main.append(
    extraInfoGrid([
      ["Rapor No", finalReportPreviewData.reportNo],
      ["Plaka", getSelectedWorkOrder().plate],
      ["Başlık", "7 modül"],
      ["Kanıt", "18 fotoğraf"]
    ]),
    extraActionStack([
      button("Raporu Gör", "primary-button full-width", () => onNavigate("final-report")),
      button("Raporu İndir", "secondary-button full-width", () => onNavigate("unauthorized")),
      button("Rapor Geçmişi", "text-button full-width", () => onNavigate("reports"))
    ])
  );
  return main;
}

function renderRequiredFieldsMissing(onNavigate) {
  const main = extraStateMain("Zorunlu Alan Eksik", "Bu işlem için tamamlanması gereken alanlar var.", "warning", "alert");
  main.append(
    extraChecklist([
      ["Kaporta panel fotoğrafı eksik", "red"],
      ["Motor çalışma notu eksik", "warning"],
      ["OBD ekran görüntüsü bekliyor", "warning"],
      ["KM doğrulama fotoğrafı eksik", "red"]
    ]),
    extraActionStack([
      button("Eksikleri Tamamla", "primary-button full-width", () => onNavigate("itemDetail")),
      button("Başlıklara Dön", "secondary-button full-width", () => onNavigate("tests"))
    ])
  );
  return main;
}

function renderEvidenceSyncQueue(onNavigate) {
  const main = screenMain("Kanıt Senkron Kuyruğu", "Fotoğraf ve video yükleme durumu", onNavigate, true);
  main.classList.add("phase1-extra-standard");
  const syncStats = getEvidenceSyncStats();
  const progressLabel = syncStats.total ? "Cihaz kanıt senkronu" : "Demo yükleme ilerlemesi";
  const progressValue = syncStats.total ? syncStats.progress : 72;
  const queueRows = syncStats.total
    ? syncStats.captures.map((item) => [
      item.uploadError ? `${item.slotTitle} · ${item.uploadError}` : `${item.slotTitle} · ${item.fileName}`,
      item.syncStatus === "uploaded" ? "success" : item.syncStatus === "failed" ? "red" : "warning"
    ])
    : [
      ["Şasi fotoğrafı yüklendi", "success"],
      ["Kaporta sağ ön bekliyor", "warning"],
      ["OBD ekranı bağlantı bekliyor", "warning"],
      ["Video yükleme başarısız", "red"]
    ];
  const feedback = element("p", {
    className: "camera-flow-status",
    text: syncStats.total
      ? `${syncStats.pending} kanıt cihazda bekliyor. Bucket: ${syncStats.uploadBucket}${syncStats.uploadConfigured ? "" : " · Supabase ayarı bekliyor."}`
      : "Demo kuyruk gösteriliyor; kamera/galeri ile kanıt eklerseniz gerçek kuyruk burada görünür."
  });
  main.append(
    extraProgress(progressLabel, progressValue),
    extraInfoGrid([
      ["Toplam", syncStats.total ? `${syncStats.total} kanıt` : "18 kanıt"],
      ["Yüklendi", syncStats.total ? String(syncStats.uploaded) : "13"],
      ["Bekleyen", syncStats.total ? String(syncStats.pending) : "4"],
      ["Başarısız", syncStats.total ? String(syncStats.failed) : "1"]
    ]),
    createSection("Kuyruk Detayı", "", [
      extraChecklist(queueRows),
      feedback
    ]),
    extraActionStack([
      button("Şimdi Senkronize Et", "primary-button full-width", async () => {
        if (!syncStats.total) {
          onNavigate("offline-warning");
          return;
        }
        feedback.textContent = "Kanıtlar Supabase Storage alanına yükleniyor...";
        const result = await syncPendingEvidenceCaptureStore();
        recordWorkflowStep(result.failedCount ? "evidence_sync_failed" : "evidence_sync_completed", {
          syncedEvidenceCount: result.uploadedCount,
          failedEvidenceCount: result.failedCount,
          workOrderStatus: result.failedCount ? "evidence_sync_failed" : "evidence_synced"
        });
        onNavigate(result.failedCount ? "evidence-sync-queue" : "evidence");
      }),
      button("Arka Planda Devam Et", "secondary-button full-width", () => onNavigate("evidence"))
    ])
  );
  return main;
}

function renderOfflineWorkWarning(onNavigate) {
  const syncStats = getEvidenceSyncStats();
  const main = extraStateMain("Çevrimdışı Çalışma", "Bağlantı yok. Veriler cihazda güvenle saklanıyor.", "warning", "sync");
  main.append(
    extraInfoGrid([
      ["Bekleyen kanıt", String(syncStats.pending || 4)],
      ["Bekleyen form", "2"],
      ["Bekleyen not", "1"],
      ["Otomatik sync", "Hazır"]
    ]),
    extraActionStack([
      button("Bağlantı Gelince Senkronize Et", "primary-button full-width", () => onNavigate("evidence-sync-queue")),
      button("Duruma Dön", "secondary-button full-width", () => onNavigate("tests"))
    ])
  );
  return main;
}

function renderTaskTransferConfirm(onNavigate) {
  const main = extraStateMain("Görevi Devret", "Bu başlığı Mehmet Usta üzerine devretmek üzeresin.", "warning", "userPlus");
  main.append(
    extraInfoGrid([
      ["Önceki sahip", "Sen"],
      ["Yeni sahip", "Mehmet Usta"],
      ["Korunacak veri", "Tüm kayıtlar"],
      ["Yetki", "Düzenleme devredilecek"]
    ]),
    extraActionStack([
      button("Evet, Görevi Devret", "primary-button full-width", () => onNavigate("task-transferred")),
      button("Hayır, Devretme", "secondary-button full-width", () => onNavigate("tests"))
    ])
  );
  return main;
}

function renderTaskTransferredSuccess(onNavigate) {
  const main = extraStateMain("Görev Devredildi", "Başlık yeni ustaya aktarıldı. Kaydedilmiş veriler korundu.", "success", "check");
  main.append(
    extraInfoGrid([
      ["Önceki sahip", "Ahmet Usta"],
      ["Yeni sahip", "Mehmet Usta"],
      ["Devredilen başlık", "Kaporta Panel Kontrolü"],
      ["Durum", "Yetki güncellendi"]
    ]),
    extraActionStack([
      button("Ekspertiz Başlıklarına Dön", "primary-button full-width", () => onNavigate("tests")),
      button("İş Özetine Dön", "secondary-button full-width", () => onNavigate("summary"))
    ])
  );
  return main;
}

function renderPreApprovalCheck(onNavigate) {
  refreshTechnicalApprovalGateForCurrentOrder();
  const main = screenMain("Kapanış Kontrolü", "İş emrini tamamlamadan önce son doğrulama", onNavigate, true);
  main.classList.add("phase1-extra-standard");
  const evidenceGate = getEvidenceApprovalGate();
  const checklist = [
    [`Gate kaynağı: ${evidenceGate.source === "supabase" ? "Canlı sistem" : "Cihaz kontrolü"}`, evidenceGate.source === "supabase" ? "success" : "warning"],
    [evidenceGate.answerCount ? `${evidenceGate.answerCount} test cevabı kaydedildi` : "Canlı test cevabı bekleniyor", evidenceGate.answerCount ? "success" : "warning"],
    ["Zorunlu başlıklar kontrol edildi", "success"],
    [evidenceGate.total ? `${evidenceGate.total} kanıt sisteme alındı` : "Kanıt eklenmedi", evidenceGate.total ? "success" : "red"],
    [evidenceGate.pending ? `${evidenceGate.pending} kanıt senkron bekliyor` : "Senkron kuyruğu temiz", evidenceGate.pending ? "warning" : "success"],
    [evidenceGate.failed ? `${evidenceGate.failed} kanıt yükleme hatası` : "Yükleme hatası yok", evidenceGate.failed ? "red" : "success"],
    [evidenceGate.canSubmit ? "İş emri kapatılabilir" : "Eksik modül veya kanıt blokajı var", evidenceGate.canSubmit ? "success" : "red"]
  ];
  main.append(
    createSection("Kontrol Özeti", "Bloklayıcı eksikler giderilmeden iş emri tamamlanamaz.", [
      extraChecklist(checklist)
    ]),
    extraActionStack([
      button(evidenceGate.canSubmit ? "İş Emrini Tamamla" : "Eksikleri Gör", "primary-button full-width", async () => {
        const order = getSelectedWorkOrder();
        await refreshTechnicalApprovalGateForCurrentOrder();
        const currentGate = getEvidenceApprovalGate();
        const statusResult = currentGate.canSubmit
          ? await transitionLiveWorkOrderStatusWithTimeout({
            expertiseCaseId: order.expertiseCaseId || order.id,
            nextStatus: "completed",
            reason: "Mobil kapanış kontrolü geçildi."
          }).catch((error) => ({
            ok: false,
            status: "error",
            reason: error?.message || "Canlı durum güncellemesi tamamlanamadı."
          }))
          : { ok: false, status: "blocked" };
        recordWorkflowStep(currentGate.canSubmit ? "pre_approval_passed" : "pre_approval_blocked", {
          gateSource: currentGate.source,
          answerCount: currentGate.answerCount,
          riskyAnswerCount: currentGate.riskyAnswerCount,
          notDoneAnswerCount: currentGate.notDoneAnswerCount,
          uploadedEvidenceCount: currentGate.uploaded,
          pendingEvidenceCount: currentGate.pending,
          failedEvidenceCount: currentGate.failed,
          liveStatusUpdated: Boolean(statusResult.ok),
          liveStatusResult: statusResult.status,
          liveRemoteStatus: statusResult.remoteStatus || "",
          workOrderStatus: currentGate.canSubmit ? "completed" : "blocked_by_evidence"
        });
        onNavigate(currentGate.canSubmit ? "completed" : "required-fields-missing");
      }),
      button("Kanıt Kuyruğunu Gör", "secondary-button full-width", () => onNavigate("evidence-sync-queue"))
    ])
  );
  return main;
}

function renderTechnicalApprovalSubmitted(onNavigate) {
  const main = extraStateMain("İş Emri Tamamlandı", "Rapor kilitlendi ve iş emri kapanışına alındı.", "success", "send");
  const evidenceGate = getEvidenceApprovalGate();
  main.append(
    extraTimeline([
      ["Rapor kilitlendi", "Tamamlandı", "success"],
      ["İş emri durumu", "Kapandı", "success"],
      ["Şube görünümü", "Hazır", "neutral"],
      ["Sonuç bildirimi", "Hazır", "neutral"]
    ]),
    extraInfoGrid([
      ["Yüklenen kanıt", String(evidenceGate.uploaded)],
      ["Bekleyen kanıt", String(evidenceGate.pending)],
      ["Hatalı kanıt", String(evidenceGate.failed)],
      ["Storage", evidenceGate.uploadBucket]
    ]),
    extraActionStack([
      button("İş Özeti", "primary-button full-width", () => onNavigate("summary")),
      button("Rapor Geçmişi", "secondary-button full-width", () => onNavigate("reports"))
    ])
  );
  return main;
}

function renderTechnicalRevisionRequest(onNavigate) {
  const main = screenMain("Eksik Düzeltme Detayı", revisionRequestData.reportNo, onNavigate, true);
  main.classList.add("phase1-extra-standard");
  main.append(
    bannerCard("Kapanış kontrolü eksik buldu", revisionRequestData.reviewerNote, "warning"),
    createSection("Düzeltme Maddeleri", "", [
      extraChecklist([
        ["Kaporta sol ön fotoğrafını yenile", "warning"],
        ["Motor yağ kaçağı açıklamasını tamamla", "warning"],
        ["OBD ekran görüntüsü ekle", "red"]
      ])
    ]),
    extraActionStack([
      button("İlgili Forma Git", "primary-button full-width", () => onNavigate("itemDetail")),
      button("Kapanış Kontrolüne Dön", "secondary-button full-width", () => onNavigate("pre-approval-check"))
    ])
  );
  return main;
}

function renderApprovedLockedReport(onNavigate) {
  const main = screenMain("Rapor Tamamlandı / Kilitli", `${reportApprovedData.reportNo} / ${reportApprovedData.approvedAt}`, onNavigate, true);
  main.classList.add("phase1-extra-standard");
  main.append(
    bannerCard("Rapor kilitli", "Tamamlanan rapor salt okunur durumdadır. Usta düzenleme yapamaz.", "success"),
    extraInfoGrid([
      ["Rapor No", reportApprovedData.reportNo],
      ["Kayıt", reportApprovedData.reviewer],
      ["Durum", "Tamamlandı"],
      ["Düzenleme", "Kapalı"]
    ]),
    extraActionStack([
      button("Tamamlanan Raporu Gör", "primary-button full-width", () => onNavigate("summary")),
      button("Raporu İndir", "secondary-button full-width", () => onNavigate("unauthorized"))
    ])
  );
  return main;
}

function renderCancelledJobDetail(onNavigate) {
  const main = screenMain("İptal Edilen İş Detayı", "16 ABC 123 / İşlem kapalı", onNavigate, true);
  main.classList.add("phase1-extra-standard");
  main.append(
    bannerCard("İş iptal edildi", "Bu iş emrinde usta işlemi yapılamaz.", "red"),
    extraInfoGrid([
      ["İptal nedeni", "Müşteri randevuyu iptal etti"],
      ["İptal eden", "Sekreterya"],
      ["İptal saati", "14.05.2025 11:20"],
      ["Durum", "Kapalı"]
    ]),
    extraTimeline([
      ["İş emri açıldı", "Tamamlandı", "success"],
      ["Usta atandı", "Tamamlandı", "success"],
      ["İptal edildi", "Kapalı", "red"]
    ]),
    extraActionStack([
      button("İşlerime Git", "primary-button full-width", () => onNavigate("jobs")),
      button("Ana Sayfaya Dön", "secondary-button full-width", () => onNavigate("home"))
    ])
  );
  return main;
}

function renderUnauthorizedAction(onNavigate) {
  const main = extraStateMain("Yetkisiz İşlem", "Bu işlemi yapmak için gerekli yetkin bulunmuyor.", "red", "shield");
  main.append(
    extraChecklist([
      ["Onaylı rapor düzenlenemez", "red"],
      ["Rapor indirme yetkisi sınırlı", "warning"],
      ["İş emri sana atanmamış olabilir", "warning"]
    ]),
    extraActionStack([
      button("Geri Dön", "primary-button full-width", () => onNavigate("summary")),
      button("Destek ile İletişime Geç", "secondary-button full-width", () => onNavigate("help"))
    ])
  );
  return main;
}

function renderOperationFailed(onNavigate) {
  const main = extraStateMain("İşlem Başarısız", "Sunucuya ulaşılamadı veya işlem zaman aşımına uğradı. Kayıtlı veriler silinmedi.", "red", "xCircle");
  main.append(
    extraInfoGrid([
      ["İşlem", "Kanıt yükleme"],
      ["Hata", "Zaman aşımı"],
      ["Veri durumu", "Cihazda kayıtlı"],
      ["Tekrar", "Mümkün"]
    ]),
    extraActionStack([
      button("Tekrar Dene", "primary-button full-width", () => onNavigate("evidence-sync-queue")),
      button("Destek Talebi Oluştur", "secondary-button full-width", () => onNavigate("help"))
    ])
  );
  return main;
}

function renderProfileSettingDetail(onNavigate) {
  const main = screenMain("Profil Ayar Detayı", "Profil ana sayfası bozulmadan detay ekranı", onNavigate, true);
  main.classList.add("phase1-extra-standard");
  main.append(
    createSection("Ayarlar", "Mock state ile kaydedilebilir profil ayarları.", [
      extraChecklist([
        ["Profil Bilgileri", "neutral"],
        ["Şifre Değiştir", "neutral"],
        ["Bildirim Ayarları", "neutral"],
        ["Fotoğraf & Kamera Ayarları", "neutral"],
        ["Rapor Ayarları", "neutral"],
        ["Senkronizasyon", "neutral"]
      ])
    ]),
    extraActionStack([
      button("Ayarı Kaydet", "primary-button full-width", () => onNavigate("save-success")),
      button("Profile Dön", "secondary-button full-width", () => onNavigate("profile"))
    ])
  );
  return main;
}

function renderModules(onNavigate) {
  const order = getSelectedWorkOrder();
  const modules = getNormalizedTaskModules();
  const main = element("main", { className: "phase2-main task-modules-screen" });
  main.append(
    taskModulesHeader(onNavigate),
    taskModulesSummary(order, modules),
    taskModulesList(onNavigate, modules)
  );
  return main;
}

function taskModulesHeader(onNavigate) {
  const header = element("header", { className: "task-modules-header" });
  header.append(
    button(icons.arrowLeft, "task-modules-back", () => onNavigate("job-detail"), "İş emri detayına dön", true),
    element("div", {
      className: "task-modules-title",
      html: "<h1>Görev Modülleri</h1><p>Tüm modülleri tamamlayarak ekspertizi bitirin</p>"
    }),
    button(`${icons.bell}<b>3</b>`, "task-modules-bell", () => onNavigate("notifications"), "Bildirimler", true)
  );
  return header;
}

function taskModulesSummary(order, modules = getNormalizedTaskModules()) {
  const card = element("section", { className: "task-modules-summary-card" });
  const aggregate = getTaskModulesAggregate(modules);
  const progress = aggregate.percent;
  const totalTasks = aggregate.totalItems;
  const completedTasks = aggregate.completedItems;
  const progressOffset = Math.max(0, 284 - ((284 * progress) / 100));
  card.append(
    element("div", {
      className: "task-modules-vehicle",
      html: `
        <div class="task-modules-plate"><span>TR</span><strong>${order.plate}</strong></div>
        <h2>${order.brandModel}</h2>
        <small>${order.year} <i></i> ${order.packageName} <i></i> ${order.km}</small>
      `
    }),
    element("div", {
      className: "task-modules-ring",
      html: `<svg viewBox="0 0 112 112" aria-hidden="true"><circle cx="56" cy="56" r="45"></circle><circle cx="56" cy="56" r="45" style="stroke-dashoffset:${progressOffset.toFixed(1)}"></circle></svg><strong>%${progress}</strong><span>${completedTasks}/${totalTasks}</span>`
    }),
    taskModulesMetrics(modules)
  );
  return card;
}

function taskModulesMetrics(modules = getNormalizedTaskModules()) {
  const rows = [
    { value: String(modules.filter((module) => module.complete || module.progress >= 100).length), label: "Tamamlanan", tone: "success", icon: "check" },
    { value: String(modules.filter((module) => module.status === "Devam Ediyor" || module.status === "Usta Üzerinde").length), label: "Devam Eden", tone: "blue", icon: "clock" },
    { value: String(modules.filter((module) => module.status === "Eksik Var" || module.status === "Eksik / Uyarı").length), label: "Eksik / Uyarı", tone: "orange", icon: "warning" },
    { value: String(modules.filter((module) => module.status === "Kilitli").length), label: "Kilitli", tone: "slate", icon: "key" }
  ];
  const wrap = element("div", { className: "task-modules-metrics" });
  rows.forEach((row) => {
    wrap.append(element("div", {
      className: `task-modules-metric tone-${row.tone}`,
      html: `<span>${icons[row.icon]}</span><strong>${row.value}</strong><em>${row.label}</em>`
    }));
  });
  wrap.append(element("div", { className: "task-modules-total", html: `<span>Toplam Modül</span><strong>${modules.length}</strong>` }));
  return wrap;
}

function getTaskModulesAggregate(modules = getNormalizedTaskModules()) {
  const totalItems = modules.reduce((sum, module) => sum + Math.max(0, Number(module.totalItems ?? module.itemCount ?? 0)), 0);
  const completedItems = modules.reduce((sum, module) => {
    const total = Math.max(0, Number(module.totalItems ?? module.itemCount ?? 0));
    const completed = module.complete || module.progress >= 100
      ? total
      : Math.max(0, Number(module.completedItems ?? 0));
    return sum + Math.min(total, completed);
  }, 0);
  return {
    totalItems,
    completedItems,
    percent: totalItems ? Math.round((completedItems / totalItems) * 100) : 0
  };
}

function getWorkOrderPackageModuleIds(order = getSelectedWorkOrder()) {
  if (Array.isArray(order.packageModuleIds) && order.packageModuleIds.length) return new Set(order.packageModuleIds);
  const moduleIds = getInspectionPackageModuleIds(order.packageCode || order.packageName || "");
  return moduleIds.length ? new Set(moduleIds) : null;
}

function filterTaskModulesByOrderPackage(modules, order = getSelectedWorkOrder()) {
  const packageModuleIds = getWorkOrderPackageModuleIds(order);
  const filtered = packageModuleIds
    ? modules.filter((module) => packageModuleIds.has(module.formKey || module.id))
    : modules;
  return filtered.map((module, index) => ({ ...module, no: index + 1 }));
}

function getBaseTaskModules() {
  const order = getSelectedWorkOrder();
  const baseModules = moduleCatalog.map((module, index) => {
    const formKey = module.formKey || module.id;
    const form = expertiseModuleForms[formKey];
    const progress = form ? getModuleFormProgress(formKey, form) : { completed: 0, total: module.itemCount || 0, percent: 0 };
    return {
      no: index + 1,
      title: module.subtitle || module.title,
      subtitle: `${module.itemCount} madde · ${form?.groupTitles?.length || 1} alt başlık`,
      count: `${progress.completed} / ${module.itemCount} madde`,
      itemCount: module.itemCount || progress.total || 0,
      totalItems: progress.total || module.itemCount || 0,
      completedItems: progress.completed || 0,
      status: module.status || "Bekliyor",
      tone: resolveModuleControlTone(module.tone, module.status),
      icon: resolveModuleControlIcon(module.id),
      progress: progress.percent,
      formKey,
      routeId: module.routeId || "moduleControl",
      owner: module.owner,
      lockedBy: module.lockedBy || "",
      lockedAt: module.lockedAt || ""
    };
  });
  return filterTaskModulesByOrderPackage(baseModules, order);
}

function getNormalizedTaskModules() {
  const currentTechnician = getCurrentTechnicianName();
  const order = getSelectedWorkOrder();
  return getBaseTaskModules().map((module) => {
    const override = getModuleStateOverride(order, module.formKey || "kaporta");
    const claimed = getClaimedModuleOwner(module.formKey || "kaporta");
    const released = Boolean(override?.releasedAt);
    const taskCompleted = module.progress >= 100
      || isModuleTaskCompleted(order, module.formKey || "kaporta")
      || override?.status === "Tamamlandı"
      || module.status === "Tamamlandı";
    const effectiveOwner = released
      ? (override?.owner || "Atama Bekliyor")
      : (claimed?.owner || override?.owner || module.owner);
    const effectiveStatus = taskCompleted
      ? "Tamamlandı"
      : released
      ? (override?.status || "Bekliyor")
      : (claimed?.owner ? "Devam Ediyor" : (override?.status || module.status));
      const effectiveLockedBy = released ? "" : (claimed?.owner ? "" : (override?.lockedBy || module.lockedBy));
      const effectiveLockedAt = released ? "" : (claimed?.owner ? claimed?.claimedAt || "" : (override?.lockedAt || module.lockedAt));
      const isOwnedByCurrent = effectiveOwner ? effectiveOwner === currentTechnician : effectiveLockedBy === currentTechnician;
      const effectiveProgress = taskCompleted ? 100 : module.progress;
    return {
      ...module,
      owner: effectiveOwner,
      status: effectiveStatus,
      count: taskCompleted ? `${module.itemCount} / ${module.itemCount} madde` : module.count,
      completedItems: taskCompleted ? module.totalItems : module.completedItems,
      totalItems: module.totalItems,
      tone: taskCompleted ? "success" : resolveModuleControlTone(module.tone, effectiveStatus),
      complete: taskCompleted,
      progress: effectiveProgress,
      lockedBy: effectiveLockedBy,
      lockedAt: effectiveLockedAt,
      currentUserCanEdit: effectiveStatus === "Kilitli" ? isOwnedByCurrent : true,
      locked: effectiveStatus === "Kilitli" && !isOwnedByCurrent
    };
  });
}

function taskModulesList(onNavigate, normalizedModules = getNormalizedTaskModules()) {
  const list = element("section", { className: "task-modules-list", attrs: { "aria-label": "Görev modülleri" } });
  const isCompletedModule = (module) => module.complete || module.progress >= 100 || module.status === "Tamamlandı";
  const activeModules = normalizedModules.filter((module) => !isCompletedModule(module));
  const completedModules = normalizedModules.filter(isCompletedModule);
  if (activeModules.length) {
    list.append(taskModulesGroup("Devam Edenler", activeModules, onNavigate));
  }
  list.append(taskModulesGroup("Tamamlananlar", completedModules, onNavigate));
  return list;
}

function taskModulesGroup(title, modules, onNavigate) {
  if (!modules.length) {
    return document.createDocumentFragment();
  }
  const group = element("section", { className: "task-modules-group" });
  group.append(element("div", {
    className: "task-modules-group-title",
    html: `<h2>${title}</h2><span>${modules.length}</span>`
  }));
  modules.forEach((module) => group.append(taskModuleRow(module, onNavigate)));
  return group;
}

function taskModuleRow(module, onNavigate) {
  const row = button("", `task-module-row tone-${module.tone}`, () => {
    clearLockedSectionState();
    const ownership = claimInspectionModule(module);
    recordWorkflowStep("module_selected", {
      selectedModule: module.title,
      selectedModuleTitle: module.title,
      selectedModuleSubtitle: module.subtitle || module.title,
      selectedModuleFormKey: module.formKey || "kaporta",
      selectedModuleRoute: module.routeId || "itemDetail",
      selectedModuleOwner: ownership.owner,
      selectedModuleClaimedAt: ownership.claimedAt,
      moduleStatus: module.status,
      workOrderStatus: "module_in_progress"
    });
    onNavigate(module.routeId || "itemDetail");
  }, `${module.title} modülüne git`);
  const stateIcon = module.complete ? icons.check : module.warning ? icons.warning : module.locked ? icons.key : "";
  row.append(
    element("span", { className: "task-module-icon", html: icons[module.icon] }),
    element("span", { className: "task-module-number", text: String(module.no) }),
    element("span", {
      className: "task-module-copy",
      html: `<strong>${module.title}</strong><small>${module.count}</small><i><b style="width:${module.progress}%"></b></i>`
    }),
    element("span", { className: "task-module-state", html: `<em>${module.status}</em>${stateIcon ? `<b>${stateIcon}</b>` : ""}` }),
    element("span", { className: "task-module-chevron", html: icons.arrow })
  );
  return row;
}

function claimInspectionModule(module) {
  const order = getSelectedWorkOrder();
  const owner = getCurrentTechnicianName();
  const claimedAt = new Date().toISOString();
  const formKey = module.formKey || "kaporta";
  const ownershipKey = `${order.expertiseCaseId || order.id}:${formKey}`;
  try {
    const current = JSON.parse(localStorage.getItem("ototrModuleOwnership") || "{}");
    current[ownershipKey] = {
      moduleTitle: module.title,
      formKey,
      workOrderId: order.id,
      expertiseCaseId: order.expertiseCaseId || "",
      plate: order.plate,
      owner,
      claimedAt
    };
    current[formKey] = current[ownershipKey];
    localStorage.setItem("ototrModuleOwnership", JSON.stringify(current));
  } catch {
    // Local storage may be unavailable in restricted WebViews.
  }
  setModuleStateOverride(order, formKey, {
    owner,
    status: "Devam Ediyor",
    lockedBy: "",
    lockedAt: "",
    claimedAt
  });
  claimInspectionTaskForModule({
    expertiseCaseId: order.expertiseCaseId || order.id,
    moduleKey: formKey
  }).then((result) => {
    recordWorkflowStep(result.ok ? "module_claim_synced" : "module_claim_sync_failed", {
      currentOrderId: order.id,
      selectedModuleFormKey: formKey,
      selectedModule: module.title,
      liveResult: result.status
    });
  }).catch((error) => {
    recordWorkflowStep("module_claim_sync_failed", {
      currentOrderId: order.id,
      selectedModuleFormKey: formKey,
      selectedModule: module.title,
      liveResult: "error",
      errorMessage: error?.message || "Modül sahipliği senkronize edilemedi."
    });
  });
  return { owner, claimedAt };
}

function getCurrentTechnicianName() {
  const workflow = getWorkflowState();
  return workflow.currentTechnicianName || "Ahmet Usta";
}

function taskModulesInfo() {
  return element("section", {
    className: "task-modules-info",
    html: `<span>${icons.info}</span><p><strong>Modülleri sırayla tamamlamanız önerilir.</strong><small>Bazı modüller önceki modüllerin tamamlanmasını gerektirir.</small></p><button type="button" aria-label="Bilgi mesajını kapat">×</button>`
  });
}

function renderLock(onNavigate) {
  const lockedSection = getLockedSectionData();
  const main = element("main", { className: "locked-section-screen", attrs: { "aria-label": "Başlık Kilitli Uyarısı" } });
  const close = button(icons.xCircle, "locked-section-close", () => {
    clearLockedSectionState();
    onNavigate("tests");
  }, "Başlıklara geri dön", true);

  main.append(
    element("header", {
      className: "locked-section-topbar",
      html: '<img src="./src/assets/home-reference/ototr-logo.png" alt="OTOTR">'
    }),
    close,
    element("section", {
      className: "locked-section-hero",
      html: `
        <div class="locked-section-orbit" aria-hidden="true">
          <span class="locked-section-lock">${icons.lock}</span>
          <span class="locked-section-shield">${icons.shield}</span>
        </div>
        <h1>Bu başlık başka bir usta tarafından sahiplenilmiş.</h1>
        <p>Şu anda bu başlığı sadece görüntüleyebilirsin. Düzenleme yetkin bulunmuyor.</p>
      `
    }),
    lockedSectionInfoCard(lockedSection),
    lockedSectionHelpBox(),
    lockedSectionActionCard("Görüntüle", "Mevcut verileri incele", "eye", "view", () => {
      markLockedSectionReadOnly();
      onNavigate(lockedSection.readOnlyTarget);
    }),
    lockedSectionActionCard("Geri Dön", "Başlıklara geri dön", "returnLeft", "back", () => {
      clearLockedSectionState();
      onNavigate("tests");
    }),
    element("section", {
      className: "locked-section-footnote",
      html: `<span>${icons.info}</span><p>Bu başlık aktif ustada kaldığı sürece sadece görüntülenir. Testi bıraktığında başka usta tıklayarak sahiplenebilir.</p>`
    })
  );
  return main;
}

function lockedSectionInfoCard(lockedSection) {
  return element("section", {
    className: "locked-section-info-card",
    html: `
      <span class="locked-section-panel-icon">${icons.panel}</span>
      <div class="locked-section-info-copy">
        <div class="locked-section-info-title">
          <h2>${lockedSection.sectionName}</h2>
          <em>${lockedSection.status} ${icons.lock}</em>
        </div>
        <dl>
          <div><dt>Sahiplenen Usta</dt><dd>${lockedSection.lockedBy}</dd></div>
          <div><dt>Sahiplenme Saati</dt><dd>${lockedSection.lockedAt}</dd></div>
        </dl>
      </div>
    `
  });
}

function lockedSectionHelpBox() {
  return element("section", {
    className: "locked-section-help-box",
    html: `<span>${icons.eye}</span><div><h2>Ne yapabilirsin?</h2><p>Mevcut verileri görüntüleyebilir veya modül boşa düştüğünde tıklayarak doğrudan sahiplenebilirsin.</p></div>`
  });
}

function lockedSectionActionCard(title, description, icon, action, onClick) {
  const card = button("", `locked-section-action is-${action}`, onClick, title);
  card.dataset.action = action;
  card.innerHTML = `
    <span>${icons[icon]}</span>
    <strong>${title}</strong>
    <small>${description}</small>
    <i>${icons.arrow}</i>
  `;
  return card;
}

function renderTaskTransfer(onNavigate) {
  return renderSectionOwnedSuccess(onNavigate);
}

function renderManagerTakeoverRequest(onNavigate) {
  const lockedSection = getLockedSectionData();
  const order = getSelectedWorkOrder();
  const reasons = Array.isArray(lockedSection.takeoverReasons) && lockedSection.takeoverReasons.length
    ? lockedSection.takeoverReasons
    : ["Vardiya değişimi", "Yoğunluk nedeniyle devretme", "Teknik uzmanlık gerekiyor", "Testi bırak ve boşa düşür"];
  const maxDescriptionLength = Number(lockedSection.takeoverMaxDescriptionLength) || 250;

  const main = element("main", { className: "manager-takeover-screen", attrs: { "aria-label": "Test Sahiplenme Bilgisi" } });
  const close = button(icons.xCircle, "manager-takeover-bell", () => onNavigate("lock"), "Kilitli başlık ekranına dön", true);
  const fileInput = element("input", {
    className: "manager-takeover-file-input",
    attrs: { type: "file", accept: "image/*,.pdf,.doc,.docx,.txt" }
  });
  fileInput.style.display = "none";

  const assigneeSelect = element("select", {
    className: "manager-takeover-select",
    attrs: { "aria-label": "Devredilecek kişi", required: "true" }
  });
  assigneeSelect.append(new Option("Müdür Onayı Bekle", "Müdür Onayı Bekle", true, true));

  const reasonSelect = element("select", {
    className: "manager-takeover-select",
    attrs: { "aria-label": "Sebep", required: "true" }
  });
  reasonSelect.append(new Option("Nedeninizi seçiniz", "", true, true));
  reasons.forEach((reason) => reasonSelect.append(new Option(reason, reason)));

  const descriptionInput = element("textarea", {
    className: "manager-takeover-textarea",
    attrs: { placeholder: "Talebinizle ilgili detaylı açıklama yazınız..." }
  });
  const reasonError = element("small", { className: "manager-takeover-inline-error", text: "Talep nedeni seçmelisiniz.", hidden: true });
  const descriptionError = element("small", { className: "manager-takeover-inline-error", text: "Açıklama yazmalısınız.", hidden: true });
  const charCounter = element("small", { className: "manager-takeover-char-counter", text: `0 / ${maxDescriptionLength}` });
  const fileStatus = element("small", { className: "manager-takeover-file-meta", text: "Fotoğraf veya belge yükleyebilirsiniz." });
  const fileActions = element("div", { className: "manager-takeover-file-actions" });

  const submitBtn = button(`${icons.send}<span>Talebi Gönder</span>${icons.arrow}`, "primary-button manager-takeover-submit", null, "Talebi Gönder", true);
  let formValid = false;

  let attachedFileName = "";
  let showValidationErrors = false;
  assigneeSelect.addEventListener("change", () => {
    showValidationErrors = true;
    validate();
  });
  reasonSelect.addEventListener("change", () => {
    showValidationErrors = true;
    validate();
  });
  descriptionInput.addEventListener("input", () => {
    showValidationErrors = true;
    validate();
  });
  fileInput.addEventListener("change", () => {
    attachedFileName = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : "";
    fileStatus.textContent = attachedFileName
      ? `Seçilen dosya: ${attachedFileName}`
      : "Fotoğraf veya belge yükleyebilirsiniz.";
    fileActions.innerHTML = "";
    if (attachedFileName) {
      fileActions.append(
        button("Dosyayı Görüntüle", "secondary-button", () => {
          alert(`Mock dosya: ${attachedFileName}`);
        }),
        button("Dosyayı Kaldır", "secondary-button", () => {
          fileInput.value = "";
          attachedFileName = "";
          fileStatus.textContent = "Fotoğraf veya belge yükleyebilirsiniz.";
          fileActions.innerHTML = "";
        })
      );
    }
  });

  const submit = () => {
    showValidationErrors = true;
    validate();
    if (!formValid) return;
    markLockedSectionRequest();
    onNavigate("manager-takeover-success");
  };
  submitBtn.addEventListener("click", submit);

  function validate() {
    const assigneeSelected = true;
    const reasonSelected = reasonSelect.value.trim().length > 0;
    const descriptionValue = descriptionInput.value.trim();
    const isLengthOk = descriptionInput.value.length <= maxDescriptionLength;
    formValid = assigneeSelected && reasonSelected && descriptionValue.length > 0 && isLengthOk;
    reasonError.hidden = !showValidationErrors || reasonSelected;
    descriptionError.hidden = !showValidationErrors || (descriptionValue.length > 0 && isLengthOk);
    if (!showValidationErrors) {
      charCounter.textContent = `${descriptionInput.value.length} / ${maxDescriptionLength}`;
      charCounter.classList.toggle("is-error", !isLengthOk);
      submitBtn.setAttribute("aria-disabled", String(!formValid));
      submitBtn.classList.toggle("is-disabled", !formValid);
      return;
    }
    if (!reasonSelected) reasonError.hidden = false;
    if (!descriptionValue.length) {
      descriptionError.textContent = "Açıklama yazmalısınız.";
      descriptionError.hidden = false;
    } else if (!isLengthOk) {
      descriptionError.textContent = "Açıklama en fazla 250 karakter olabilir.";
      descriptionError.hidden = false;
    }
    charCounter.textContent = `${descriptionInput.value.length} / ${maxDescriptionLength}`;
    charCounter.classList.toggle("is-error", !isLengthOk);
    submitBtn.setAttribute("aria-disabled", String(!formValid));
    submitBtn.classList.toggle("is-disabled", !formValid);
  }

  const formSection = element("section", { className: "manager-takeover-form" });
  const reasonLabel = element("label", { className: "manager-takeover-field" });
  reasonLabel.append(element("span", { text: "Talep Nedeni *" }));
  reasonLabel.append(reasonSelect);
  const descLabel = element("label", { className: "manager-takeover-field" });
  descLabel.append(element("span", { text: "Açıklama *" }));
  descLabel.append(descriptionInput);
  formSection.append(reasonLabel, reasonError, descLabel, charCounter, descriptionError);

  const fileSection = element("section", { className: "manager-takeover-file-card" });
  const fileActionWrap = element("div", { className: "manager-takeover-upload-row" });
  fileActionWrap.append(fileStatus, fileActions);
  const uploadVisual = button(`<span>${icons.upload}</span><small>Dosya eklemek için dokunun</small>`, "manager-takeover-upload-box", () => fileInput.click(), "Dosya eklemek için dokunun", true);
  fileSection.append(
    element("h2", { text: "Ek Dosya (İsteğe Bağlı)" }),
    uploadVisual,
    element("label", { className: "manager-takeover-hidden-label", attrs: { for: "manager-takeover-file-input" }, html: "Seçim alanı" })
  );
  fileSection.append(fileInput, fileActionWrap);
  fileInput.setAttribute("id", "manager-takeover-file-input");

  const actionBar = actionRow([
    button("İptal", "secondary-button manager-takeover-cancel", () => onNavigate("lock")),
    submitBtn
  ]);
  actionBar.classList.add("manager-takeover-actions");

  main.append(
    element("header", { className: "manager-takeover-topbar", html: '<img src="./src/assets/home-reference/ototr-logo.png" alt="OTOTR"><div class="manager-takeover-title"><h1>Test Sahiplenme Bilgisi</h1><p>Boştaki testi tıklayan usta doğrudan sahiplenir. Dolu testler sadece görüntülenir.</p></div>' }),
    close,
    element("section", { className: "manager-takeover-vehicle-card", html: `
      <div class="manager-takeover-vehicle-main">
        <strong>${order.plate}</strong>
        <span>${order.brandModel}</span>
        <small>${order.year || "2019"} ${order.packageName || "320i"} · İş Emri No: ${order.id || "IE-2025-000123"}</small>
      </div>
      <em>Devam Ediyor</em>
      <div class="manager-takeover-progress-ring"><b>%65</b><small>Tamamlandı</small></div>
    ` }),
    element("section", { className: "manager-takeover-main-card", html: `
      <span class="manager-takeover-main-icon">${icons.panel}</span>
      <div class="manager-takeover-main-copy">
        <div class="manager-takeover-main-title">
          <i>1</i>
          <h2>${lockedSection.sectionName || "Kaporta Kontrolü"}</h2>
          <em>${lockedSection.status || "Kilitli"}</em>
        </div>
        <p>Bu başlık şu anda başka bir usta tarafından sahiplenilmiş.</p>
        <div class="manager-takeover-module-progress"><span style="width:100%"></span></div>
        <dl><div><dt>Sahiplenen Usta</dt><dd>${lockedSection.lockedBy || "Mehmet Usta"}</dd></div><div><dt>Sahiplenme Saati</dt><dd>${lockedSection.lockedAt || "12.05.2025 09:15"}</dd></div></dl>
      </div>
    ` }),
    element("section", { className: "manager-takeover-help", html: `<span>${icons.info}</span><p>Bu başlık şu anda başka bir usta tarafından sahiplenilmiş. Devralma talebiniz onaylanırsa düzenleme yetkin aktif olacak.</p>` }),
    formSection,
    fileSection,
    actionBar,
    element("section", { className: "manager-takeover-help", html: `<span>${icons.info}</span><p>Test boşa düştüğünde tıklayan usta modülü doğrudan sahiplenir.</p>` })
  );
  validate();
  return main;
}

function renderPermissionDenied(onNavigate) {
  const main = screenMain("Yetki Yok", "Erişim engeli", onNavigate, true);
  main.append(
    bannerCard("Yetki sınırı", "Bu modül için sadece izleme yetkiniz var. Müdür rolü devralma kararı verebilir.", "red"),
    createSection("Ne Yapabilirsiniz?", "", [
      checklistRow("Bayi veya müdür onayı", "Gerekli", "warning"),
      checklistRow("Modül geçmişi görüntüleme", "Açık", "success"),
      checklistRow("Değişiklik talebi", "Bildirim iletilir", "neutral")
    ]),
    actionRow([
      button("Bildirimlere Git", "secondary-button full-width", () => onNavigate("notifications")),
      button("Modüllere Dön", "primary-button full-width", () => onNavigate("tests"))
    ])
  );
  return main;
}

function renderModuleControl(onNavigate) {
  const order = getSelectedWorkOrder();
  const selectedModule = getSelectedInspectionModule();
  const moduleItems = selectedModule.form?.items || [];
  const moduleProgress = getModuleFormProgress(selectedModule.formKey, selectedModule.form);
  const isMechanicDesign = isMechanicInspectionModule(selectedModule.formKey);
  const main = element("main", {
    className: `phase2-main inspection-module-screen inspection-module-${selectedModule.formKey}${isMechanicDesign ? " inspection-mechanic-screen" : ""}`
  });
  const activeFilter = { value: "all", category: "all" };
  const list = element("section", { className: "inspection-panel-list", attrs: { "aria-live": "polite" } });

  const filters = [
    ["all", `Tümü (${moduleItems.length})`, "all"],
    ["completed", `Tamamlanan (${moduleProgress.completed})`, "completed"],
    ["missing", `Eksik (${moduleProgress.missingEvidence})`, "missing"],
    ["warning", `Bekleyen (${Math.max(0, moduleItems.length - moduleProgress.completed)})`, "warning"]
  ];
  const categoryFilters = ["Tümü", ...new Set(moduleItems.map((item) => item.groupTitle || item.groupName || "Diğer"))];
  const filterTabs = element("div", { className: "inspection-module-tabs", attrs: { role: "tablist", "aria-label": `${selectedModule.title} durum filtreleri` } });
  const categoryTabs = element("div", { className: "inspection-category-tabs", attrs: { role: "tablist", "aria-label": `${selectedModule.title} kategori filtreleri` } });
  const searchInput = element("input", {
    className: "inspection-module-search-input",
    attrs: { type: "search", placeholder: "Madde ara...", "aria-label": "Madde ara" }
  });
  const pendingCount = Math.max(0, moduleProgress.total - moduleProgress.completed);
  const summaryTone = moduleProgress.missingEvidence > 0 ? "warning" : pendingCount > 0 ? "danger" : "ok";
  const progressMeta = isMechanicDesign ? `<b class="inspection-mechanic-ring-meta">${moduleProgress.completed} / ${moduleProgress.total}<small>tamamlandı</small></b>` : "";
  const moduleReadyToSubmit = moduleProgress.total > 0 && moduleProgress.completed >= moduleProgress.total && moduleProgress.missingEvidence === 0;
  const renderChunkSize = 10;
  let panelRenderToken = 0;
  let searchRenderTimer = 0;

  function visiblePanels() {
    const query = searchInput.value.trim().toLocaleLowerCase("tr-TR");
    return moduleItems.filter((rawItem, index) => {
      const item = getInspectionDisplayItem(selectedModule.formKey, rawItem, index);
      const summary = summarizeInspectionItemState(selectedModule.formKey, rawItem);
      const stateKey = summary.tone === "success" ? "completed" : summary.tone === "red" ? "missing" : "warning";
      const category = item.groupTitle || item.groupName || "Diğer";
      const matchesState = activeFilter.value === "all" || stateKey === activeFilter.value;
      const matchesCategory = activeFilter.category === "all" || category === activeFilter.category;
      const matchesQuery = !query || `${item.title || ""} ${item.description || ""}`.toLocaleLowerCase("tr-TR").includes(query);
      return matchesState && matchesCategory && matchesQuery;
    });
  }

  function renderPanels() {
    panelRenderToken += 1;
    const currentToken = panelRenderToken;
    const panels = visiblePanels();
    let cursor = 0;
    list.innerHTML = "";
    list.setAttribute("aria-busy", "true");

    function appendChunk() {
      if (currentToken !== panelRenderToken) return;
      const fragment = document.createDocumentFragment();
      const nextCursor = Math.min(cursor + renderChunkSize, panels.length);
      for (let index = cursor; index < nextCursor; index += 1) {
        fragment.append(renderInspectionModuleItemRow(panels[index], index, selectedModule, onNavigate));
      }
      list.append(fragment);
      cursor = nextCursor;
      if (cursor < panels.length) {
        const schedule = typeof window !== "undefined" && typeof window.requestAnimationFrame === "function"
          ? window.requestAnimationFrame
          : (callback) => setTimeout(callback, 16);
        schedule(appendChunk);
        return;
      }
      list.setAttribute("aria-busy", "false");
    }

    appendChunk();
  }

  const stateButtons = filters.map(([key, label]) => {
    const tab = button(label, "inspection-module-tab", () => {
      activeFilter.value = key;
      stateButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === key));
      renderPanels();
    }, `${label} filtresi`);
    tab.dataset.filter = key;
    tab.classList.toggle("is-active", key === "all");
    filterTabs.append(tab);
    return tab;
  });

  const categoryButtons = categoryFilters.map((label) => {
    const key = label === "Tümü" ? "all" : label;
    const tab = button(label, "inspection-category-tab", () => {
      activeFilter.category = key;
      categoryButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.category === key));
      renderPanels();
    }, `${label} kategorisi`);
    tab.dataset.category = key;
    tab.classList.toggle("is-active", key === "all");
    categoryTabs.append(tab);
    return tab;
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(searchRenderTimer);
    searchRenderTimer = setTimeout(renderPanels, 120);
  });
  main.append(
    inspectionHeader(selectedModule.title, `${moduleProgress.completed} / ${moduleProgress.total} Tamamlandı`, onNavigate, "tests"),
    element("section", { className: "inspection-module-hero", html: `
      <div class="inspection-module-vehicle-card">
        <div class="inspection-module-vehicle-copy">
          <div class="inspection-module-plate"><span>TR</span><strong>${order.plate}</strong></div>
          <h3>${order.brandModel}</h3>
          <p><span>${icons.calendar}${order.year || "2021"}</span><i></i><span>${icons.gauge}${order.mileage || "128.450 km"}</span></p>
          <div class="inspection-module-hero-actions">
            <button type="button" class="inspection-module-release-inline" aria-label="Testi devret">${icons.logout}<span>Testi Devret</span></button>
            <button type="button" class="inspection-module-good-inline${moduleReadyToSubmit ? " is-submit" : ""}" aria-label="${moduleReadyToSubmit ? "Testi gönder" : "Tüm noktaları iyi durumda işaretle"}">${moduleReadyToSubmit ? icons.send : icons.check}<span>${moduleReadyToSubmit ? "Testi Gönder" : "Tümü İyi"}</span></button>
          </div>
        </div>
        <div class="inspection-module-ring">${renderInspectionProgressGauge(moduleProgress.percent)}<strong>%${moduleProgress.percent}</strong><span>Tamamlandı</span>${progressMeta}</div>
        <button type="button" aria-label="İş emri detayına git">${icons.arrow}</button>
      </div>
    ` }),
    element("section", { className: "inspection-module-card" })
  );
  const card = main.querySelector(".inspection-module-card");
  main.querySelector(".inspection-module-release-inline")?.addEventListener("click", (event) => {
    event.stopPropagation();
    releaseActiveModuleOwnership(onNavigate);
  });
  main.querySelector(".inspection-module-good-inline")?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (moduleReadyToSubmit) {
      submitCurrentInspectionModule(selectedModule, onNavigate);
      return;
    }
    markAllInspectionItemsGood(selectedModule, onNavigate);
  });
  card.append(
    element("div", { className: "inspection-module-list-head", html: `<h2>Tüm Test Maddeleri (${moduleItems.length})</h2><span class="tone-${summaryTone}">${moduleProgress.percent >= 100 ? "Tamamlandı" : `${pendingCount} Bekliyor`}</span>` }),
    filterTabs,
    element("div", { className: "inspection-module-search-row" }),
    categoryTabs,
    list,
    element("section", { className: "inspection-module-sticky-summary", html: `
      <article><span>Toplam Madde</span><strong>${moduleProgress.total}</strong></article>
      <article><span>Tamamlanan</span><strong class="ok">${moduleProgress.completed}</strong></article>
      <article><span>Fotoğraf</span><strong class="warn">${moduleProgress.readyEvidence}</strong></article>
      <article><span>Bekleyen</span><strong class="danger">${pendingCount}</strong></article>
    ` })
  );
  card.querySelector(".inspection-module-search-row").append(
    element("label", { className: "inspection-module-search", html: `${icons.search}` }),
    button(`${icons.filter}<span>Filtrele</span><i></i>`, "inspection-module-filter", () => {
      activeFilter.value = "missing";
      stateButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === "missing"));
      renderPanels();
    }, "Eksik filtrele", true)
  );
  card.querySelector(".inspection-module-search").append(searchInput);
  renderPanels();
  return main;
}

function renderInspectionProgressGauge(percent = 0) {
  const totalSegments = 32;
  const normalized = Math.max(0, Math.min(100, Number(percent) || 0));
  const activeSegments = Math.min(totalSegments, Math.max(0, Math.round((normalized / 100) * totalSegments)));
  const segmentStep = 360 / totalSegments;
  const startAngle = -140;
  return `
    <svg class="inspection-module-ring-svg" viewBox="0 0 140 140" aria-hidden="true" focusable="false">
      ${Array.from({ length: totalSegments }).map((_, index) => {
        const angle = startAngle + index * segmentStep;
        const activeClass = index < activeSegments ? " is-active" : "";
        return `<line class="inspection-module-ring-segment${activeClass}" x1="70" y1="11" x2="70" y2="28" transform="rotate(${angle.toFixed(2)} 70 70)" />`;
      }).join("")}
    </svg>
  `;
}

function isMechanicInspectionModule(formKey = "") {
  return formKey === "alt-on-mekanik" || formKey === "mechanic";
}

function resolveStatusSelectionOptions(selectedModule, selectedItem) {
  const labels = [];
  const appendLabel = (label) => {
    const normalized = String(label || "").trim();
    if (!normalized || labels.includes(normalized)) return;
    labels.push(normalized);
  };
  (selectedItem.options || []).forEach((option) => {
    if (option?.disabled) return;
    appendLabel(option.displayLabel || option.label || option.value || option.sourceText);
  });
  (selectedItem.statusOptions || []).forEach(appendLabel);
  return labels.length ? labels : ["Sorunsuz"];
}

function resolveGoodStatusForItem(item) {
  const options = resolveStatusSelectionOptions({ formKey: "" }, item);
  const preferred = [
    "İyi",
    "Sorunsuz",
    "Hasarsız",
    "Arıza Kaydı Yok",
    "Çalışıyor",
    "Uygun",
    "Yanmıyor",
    "Hayır",
    "Yok"
  ];
  return preferred.find((label) => options.includes(label)) || options[0] || "Sorunsuz";
}

function resolveModuleControlHeroIcon(formKey) {
  const iconMap = {
    motor: icons.engine,
    mechanic: icons.wrench,
    brakeSuspension: icons.wrench,
    kaporta: icons.car,
    electric: icons.electric,
    brain: icons.sliders,
    roadTest: icons.gauge,
    interiorExterior: icons.user,
    airbag: icons.shield,
    conta: icons.key
  };
  return iconMap[formKey] || icons.clipboard;
}

async function submitCurrentInspectionModule(selectedModule, onNavigate) {
  const order = getSelectedWorkOrder();
  const formKey = selectedModule.formKey;
  const progress = getModuleFormProgress(formKey, selectedModule.form);
  if (progress.total > 0 && progress.completed < progress.total) {
    recordWorkflowStep("module_submit_blocked", {
      selectedModule: selectedModule.title,
      selectedModuleFormKey: formKey,
      completed: progress.completed,
      total: progress.total,
      currentOrderId: order.id
    });
    onNavigate("moduleControl");
    return;
  }
  const completedAt = new Date().toISOString();
  markModuleTaskCompleted(order, formKey, true);
  setModuleStateOverride(order, formKey, {
    owner: getCurrentTechnicianName(),
    status: "Tamamlandı",
    lockedBy: "",
    lockedAt: "",
    completedAt
  });
  const result = await Promise.race([
    submitInspectionTaskForModule({
      expertiseCaseId: order.expertiseCaseId || order.id,
      moduleKey: formKey
    }),
    new Promise((resolve) => window.setTimeout(() => resolve({
      ok: false,
      status: "queued",
      reason: "Canlı senkron arka planda devam ediyor."
    }), 1200))
  ]).catch((error) => ({
    ok: false,
    status: "error",
    reason: error?.message || "Test gönderimi senkronize edilemedi."
  }));
  recordWorkflowStep(result.ok ? "module_task_submit_requested" : "module_task_submit_queued", {
    selectedModule: selectedModule.title,
    selectedModuleFormKey: formKey,
    currentOrderId: order.id,
    liveResult: result.status,
    completedAt
  });
  onNavigate("tests");
}

function openInspectionItemStatus(item, index, selectedModule, onNavigate, returnRoute = "moduleControl") {
  const displayItem = getInspectionDisplayItem(selectedModule.formKey, item, index);
  const selectedItemKey = getModuleItemKey(item);
  recordWorkflowStep("module_item_status_requested", {
    selectedModule: selectedModule.title,
    selectedModuleTitle: selectedModule.title,
    selectedModuleSubtitle: selectedModule.subtitle,
    selectedModuleFormKey: selectedModule.formKey,
    selectedItem: displayItem.title,
    selectedItemTitle: displayItem.title,
    selectedItemKey,
    statusSelectionReturnRoute: returnRoute
  });
  setWorkflowState({
    selectedModuleTitle: selectedModule.title,
    selectedModuleSubtitle: selectedModule.subtitle,
    selectedModuleFormKey: selectedModule.formKey,
    selectedItemTitle: displayItem.title,
    selectedItemKey,
    statusSelectionReturnRoute: returnRoute
  });
  onNavigate("statusModal");
}

function markAllInspectionItemsGood(selectedModule, onNavigate) {
  const order = getSelectedWorkOrder();
  const items = selectedModule.form?.items || [];
  const completedAt = new Date().toISOString();
  items.forEach((item, index) => {
    const goodStatus = resolveGoodStatusForItem(item);
    const needsEvidenceAttention = isInspectionItemPhotoRequired(item, index)
      && getStatusEvidenceCaptures(selectedModule.formKey, item).length === 0;
    const inputs = (item.inputs || []).reduce((acc, input) => {
      const key = input.name || input.label || "Ek alan";
      acc[key] = goodStatus;
      return acc;
    }, {});
    setModuleItemState(selectedModule.formKey, item, {
      selectedOption: goodStatus,
      inputs,
      description: "",
      syncInlineStatus: "Senkron bekliyor",
      completed: true,
      bulkGoodApplied: true,
      needsEvidenceAttention,
      reportAnswer: {
        reportId: order.expertiseCaseId || order.id,
        moduleId: selectedModule.formKey,
        moduleTitle: selectedModule.title,
        itemId: getModuleItemKey(item),
        noktaId: item.noktaId || "",
        itemTitle: item.title || "",
        status: goodStatus,
        note: "",
        photos: [],
        completed: true,
        updatedAt: completedAt
      }
    });
    queueMobileInspectionAnswerSave(selectedModule.formKey, item);
  });
  refreshCurrentModuleFormProgress(selectedModule.formKey);
  recordWorkflowStep("module_all_items_marked_good", {
    selectedModule: selectedModule.title,
    selectedModuleFormKey: selectedModule.formKey,
    markedGoodCount: items.length,
    currentOrderId: order.id
  });
  onNavigate("moduleControl");
}

function hasInspectionItemReportHistory(item, index, selectedModule) {
  if (item?.previousReport || item?.reportHistory || item?.historyRecord) return true;
  return index >= 4 && index <= 6;
}

function isInspectionItemPhotoRequired(item, index) {
  if (item?.photoRequired === true || item?.evidenceRequired === true) return true;
  return Number(item?.photoSlots || 0) > 0 && index >= 2 && index <= 3;
}

function getInspectionItemReportHistory(item, index, selectedModule) {
  const explicit = item?.previousReport || item?.reportHistory || item?.historyRecord;
  if (explicit) return explicit;
  return {
    date: index % 2 === 0 ? "12.03.2025" : "18.11.2024",
    status: index % 2 === 0 ? "İşlemli" : "Boyalı",
    note: `${item?.title || "Kontrol maddesi"} önceki ekspertiz raporunda kayıt altına alınmış.`,
    photos: [
      "./src/assets/design-reference/inspection-flow/evidence-hood-main.png",
      "./src/assets/design-reference/inspection-flow/panel-door-front.png"
    ],
    reportNo: `RPR-2025-${String(120 + index).padStart(6, "0")}`,
    module: selectedModule?.title || "Ekspertiz"
  };
}

function openInspectionHistoryModal(item, index, selectedModule) {
  const history = getInspectionItemReportHistory(item, index, selectedModule);
  document.querySelector(".inspection-history-modal")?.remove();
  const overlay = element("section", {
    className: "inspection-history-modal",
    attrs: { role: "dialog", "aria-modal": "true", "aria-label": "Geçmiş Rapor" }
  });
  const close = () => overlay.remove();
  const photos = Array.isArray(history.photos) ? history.photos.filter(Boolean) : [];
  overlay.append(
    element("div", { className: "inspection-history-backdrop" }),
    element("article", {
      className: "inspection-history-sheet",
      html: `
        <div class="inspection-history-head">
          <span>${icons.clock}</span>
          <div>
            <h2>Geçmiş Rapor</h2>
            <p>${history.reportNo || "Önceki ekspertiz kaydı"}</p>
          </div>
          <button type="button" aria-label="Kapat">×</button>
        </div>
        <div class="inspection-history-facts">
          <article><small>Tarih</small><strong>${history.date || "-"}</strong></article>
          <article><small>Eski Durum</small><strong>${history.status || "-"}</strong></article>
          <article><small>Modül</small><strong>${history.module || selectedModule?.title || "-"}</strong></article>
        </div>
        <div class="inspection-history-note">
          <small>Eski Not</small>
          <p>${history.note || "Bu madde için eski not bulunmuyor."}</p>
        </div>
        <div class="inspection-history-photos">
          <small>Eski Fotoğraf Kanıtları</small>
          <div>${photos.length ? photos.map((src, photoIndex) => `<span class="inspection-history-photo-thumb">${icons.camera}<b>Fotoğraf ${photoIndex + 1}</b></span>`).join("") : "<span>Fotoğraf kaydı yok</span>"}</div>
        </div>
      `
    })
  );
  overlay.querySelector(".inspection-history-backdrop")?.addEventListener("click", close);
  overlay.querySelector(".inspection-history-head button")?.addEventListener("click", close);
  document.body.append(overlay);
}

function renderInspectionModuleItemRow(item, index, selectedModule, onNavigate) {
  const displayItem = getInspectionDisplayItem(selectedModule.formKey, item, index);
  const state = summarizeInspectionItemState(selectedModule.formKey, item);
  const itemState = getModuleItemState(selectedModule.formKey, item);
  const photoCount = getStatusEvidenceCaptures(selectedModule.formKey, item).length;
  const hasNote = Boolean((itemState.description || "").trim());
  const leftTone = state.tone === "success" ? "success" : state.tone === "red" ? "missing" : "neutral";
  const hasHistory = hasInspectionItemReportHistory(item, index, selectedModule);
  const photoRequired = isInspectionItemPhotoRequired(item, index);
  const photoStateClass = photoCount > 0 ? " is-complete" : photoRequired ? " is-required" : "";
  const needsEvidenceAttention = Boolean(itemState.needsEvidenceAttention) && photoRequired && photoCount === 0;
  const openStatus = () => openInspectionItemStatus(item, index, selectedModule, onNavigate, "moduleControl");
  const row = element("article", {
    className: `inspection-panel-row tone-${leftTone}${hasHistory ? " has-history" : ""}${photoRequired ? " has-required-photo" : ""}${needsEvidenceAttention ? " needs-photo-attention" : ""}`,
    attrs: {
      role: "button",
      tabindex: "0",
      "aria-label": `${displayItem.title || "Kontrol maddesi"} durumunu seç`
    }
  });
  row.innerHTML = `
      <span class="inspection-panel-index">${index + 1}</span>
      <div class="inspection-panel-copy">
        <strong>${displayItem.title || `Kontrol ${index + 1}`}</strong>
        <em>NoktaID ${displayItem.noktaId || "-"} · Fotoğraf ${photoCount}/3 · ${hasNote ? "Açıklama var" : "Açıklama yok"}</em>
      </div>
      <span class="inspection-panel-actions">
        <span class="inspection-panel-status tone-${state.tone}">${state.label}</span>
        <span class="inspection-panel-history-slot">
          ${hasHistory ? `<button type="button" class="inspection-panel-history" aria-label="${displayItem.title || "Madde"} geçmiş rapor detayı">${icons.clock}</button>` : ""}
        </span>
        <button type="button" class="inspection-panel-camera${photoStateClass}" aria-label="${displayItem.title || "Madde"} fotoğraf ekle">${icons.camera}${photoRequired && photoCount === 0 ? "<b>*</b>" : ""}</button>
      </span>
      <i class="inspection-panel-arrow">${icons.arrow}</i>
    `;
  row.addEventListener("click", openStatus);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openStatus();
    }
  });
  row.querySelector(".inspection-panel-history")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openInspectionHistoryModal(item, index, selectedModule);
  });
  row.querySelector(".inspection-panel-camera")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openStatus();
  });
  return row;
}

function inspectionHeader(title, subtitle, onNavigate, backRoute) {
  const header = element("header", { className: "inspection-flow-header" });
  header.append(
    button(icons.arrowLeft, "inspection-flow-back", () => onNavigate(backRoute), "Geri dön", true),
    element("div", { className: "inspection-flow-heading", html: `<h1>${title}</h1><p>${subtitle}</p>` }),
    button(`${icons.bell}<b>${technicianProfile.notificationCount}</b>`, "inspection-flow-bell", () => onNavigate("notifications"), "Bildirimler", true)
  );
  return header;
}

function getKaportaPanelItems() {
  return [
    { no: 1, title: "Motor Kaputu", desc: "Yüzey durumu ve boya kontrolü", state: "completed", badge: "Tamamlandı", category: "Dış Yüzey", tone: "success", icon: "car", image: "./src/assets/design-reference/inspection-flow/panel-hood.png" },
    { no: 2, title: "Ön Tampon", desc: "Çizik, göçük ve boya kontrolü", state: "completed", badge: "Tamamlandı", category: "Dış Yüzey", tone: "success", icon: "panel", image: "./src/assets/design-reference/inspection-flow/panel-bumper.png" },
    { no: 3, title: "Sol Ön Çamurluk", desc: "Çizik, göçük ve boya kontrolü", state: "missing", badge: "Eksik", category: "Dış Yüzey", tone: "missing", icon: "car", image: "./src/assets/design-reference/inspection-flow/panel-fender.png" },
    { no: 4, title: "Sol Ön Kapı", desc: "Çizik, göçük ve boya kontrolü", state: "completed", badge: "Tamamlandı", category: "Dış Yüzey", tone: "success", icon: "panel", image: "./src/assets/design-reference/inspection-flow/panel-door-front.png" },
    { no: 5, title: "Sol Yan Ayna", desc: "Çalışma ve yüzey kontrolü", state: "warning", badge: "Uyarı", category: "Diğer", tone: "warning", icon: "panel", image: "./src/assets/design-reference/inspection-flow/panel-mirror.png" },
    { no: 6, title: "Sol Arka Kapı", desc: "Çizik, göçük ve boya kontrolü", state: "completed", badge: "Tamamlandı", category: "Dış Yüzey", tone: "success", icon: "panel", image: "./src/assets/design-reference/inspection-flow/panel-door-rear.png" }
  ];
}

function renderKaportaPanelRow(panel, onNavigate) {
  const row = button("", `inspection-panel-row tone-${panel.tone}`, () => {
    recordWorkflowStep("kaporta_panel_selected", {
      selectedModule: "Kaporta Kontrolü",
      selectedModuleTitle: "Kaporta Kontrolü",
      selectedModuleFormKey: "kaporta",
      selectedPanel: panel.title,
      selectedPanelStatus: panel.badge,
      selectedItem: panel.title,
      selectedItemTitle: panel.title,
      selectedItemKey: getModuleItemKey(panel),
      statusSelectionReturnRoute: "moduleControl"
    });
    setWorkflowState({
      selectedModuleTitle: "Kaporta Kontrolü",
      selectedModuleSubtitle: "Kaporta panel ve boya kontrolü",
      selectedModuleFormKey: "kaporta",
      selectedItemTitle: panel.title,
      selectedItemKey: getModuleItemKey(panel),
      statusSelectionReturnRoute: "moduleControl"
    });
    onNavigate("statusModal");
  }, `${panel.title} durumunu seç`);
  row.innerHTML = `
    <span class="inspection-panel-index">${panel.no}</span>
    <span class="inspection-panel-icon">${icons[panel.icon] || icons.car}</span>
    <span class="inspection-panel-copy">
      <strong>${panel.title}</strong>
      <em>${panel.desc}</em>
      <small>${panel.badge}</small>
    </span>
    <span class="inspection-panel-photo"><img src="${panel.image}" alt=""><b>${panel.tone === "success" ? icons.check : icons.warning}</b></span>
    <span class="inspection-panel-arrow">${icons.arrow}</span>
  `;
  return row;
}

function getModuleControlModules() {
  const currentTechnician = getCurrentTechnicianName();
  const order = getSelectedWorkOrder();
  const packageModuleIds = getWorkOrderPackageModuleIds(order);
  return moduleCatalog
  .filter((module) => !packageModuleIds || packageModuleIds.has(module.formKey || module.id))
  .map((module, index) => {
    const formKey = module.formKey || module.id;
    const override = getModuleStateOverride(order, formKey);
    const claimed = getClaimedModuleOwner(formKey);
    const released = Boolean(override?.releasedAt);
    const effectiveOwner = released
      ? (override?.owner || "Atama Bekliyor")
      : (claimed?.owner || override?.owner || module.owner);
    const effectiveStatus = released
      ? (override?.status || "Bekliyor")
      : (claimed?.owner ? "Devam Ediyor" : (override?.status || module.status));
    const tone = resolveModuleControlTone(module.tone, module.status);
    const isOwnedByCurrent = effectiveOwner === currentTechnician;
    return {
      no: index + 1,
      title: module.title,
      status: effectiveStatus,
      tone,
      icon: resolveModuleControlIcon(module.id),
      routeId: module.routeId || "itemDetail",
      progress: resolveModuleControlProgress(module),
      count: `${module.itemCount} madde`,
      owner: effectiveOwner,
      formKey,
      locked: effectiveStatus === "Kilitli" && !isOwnedByCurrent,
      lockedBy: effectiveOwner,
      lockedAt: lockedSectionDefault.lockedAt,
      currentUserCanEdit: effectiveStatus === "Kilitli" ? isOwnedByCurrent : true
    };
  });
}

function renderModuleControlList(modules, onNavigate) {
  const section = element("section", { className: "section-card stack" });
  const header = element("div", { className: "detail-modules-title", html: `<h2>Modül Listesi</h2><button type="button">${modules.length} Modül</button>` });
  const list = element("section", { className: "detail-module-list", attrs: { "aria-label": "Modül kontrol listesi" } });
  modules.forEach((module) => list.append(renderModuleControlRow(module, onNavigate)));
  section.append(header, list);
  return section;
}

function renderModuleControlRow(module, onNavigate) {
  const route = module.routeId || "itemDetail";
  const row = button("", `detail-module-row tone-${module.tone}`, () => {
    clearLockedSectionState();
    const ownership = claimInspectionModule(module);
    recordWorkflowStep("module_control_selected", {
      selectedModule: module.title,
      moduleStatus: module.status,
      selectedModuleFormKey: module.formKey || "kaporta",
      selectedModuleOwner: ownership.owner,
      selectedModuleClaimedAt: ownership.claimedAt,
      workOrderStatus: "module_in_progress"
    });
    onNavigate(route);
  }, `${module.title} modülünü aç`);
  row.append(
    element("span", { className: "detail-module-icon", html: icons[module.icon] ?? icons.clipboard }),
    element("strong", { text: module.title }),
    element("em", { text: module.count }),
    element("small", { text: module.status }),
    element("i", { className: "detail-module-progress", html: `<b style="width:${module.progress}%"></b>` }),
    element("span", { className: "detail-module-arrow", html: icons.arrow })
  );
  return row;
}

function moduleControlSummaryCard(order, modules) {
  const card = element("section", { className: "task-modules-summary-card module-control-summary" });
  const aggregate = getTaskModulesAggregate(modules);
  const progress = aggregate.percent;
  const totalTasks = aggregate.totalItems;
  const completedTasks = aggregate.completedItems;
  const progressOffset = Math.max(0, 284 - ((284 * progress) / 100));
  card.append(
    element("div", {
      className: "task-modules-vehicle",
      html: `
        <div class="task-modules-plate"><span>TR</span><strong>${order.plate}</strong></div>
        <h2>${order.brandModel}</h2>
        <small>${order.year} <i></i> ${order.packageName} <i></i> ${order.km}</small>
        <em>${icons.clock} ${workOrderStatusLabels[order.status] || order.status || "Devam Ediyor"}</em>
      `
    }),
    element("div", {
      className: "task-modules-ring",
      html: `<svg viewBox="0 0 112 112" aria-hidden="true"><circle cx="56" cy="56" r="45"></circle><circle cx="56" cy="56" r="45" style="stroke-dashoffset:${progressOffset.toFixed(1)}"></circle></svg><strong>%${progress}</strong><span>${completedTasks}/${totalTasks}</span>`
    }),
    (() => {
      const summary = element("div", { className: "task-modules-metrics" });
      moduleControlSummaryRows(modules).forEach((metric) => {
        summary.append(element("div", {
          className: `task-modules-metric tone-${metric.tone}`,
          html: `<span>${icons[metric.icon]}</span><strong>${metric.value}</strong><em>${metric.label}</em>`
        }));
      });
      summary.append(element("div", { className: "task-modules-total", html: `<span>Toplam Modül</span><strong>${modules.length}</strong>` }));
      return summary;
    })()
  );
  return card;
}

function moduleControlSummaryRows(modules) {
  const completed = modules.filter((module) => module.status === "Tamamlandı");
  const inProgress = modules.filter((module) => module.status === "Devam Ediyor" || module.status === "Usta Üzerinde");
  const warning = modules.filter((module) => ["Eksik / Uyarı", "Eksik Var", "Teknik Onaya Geçici", "Düzeltme Gerekiyor"].includes(module.status));

  return [
    { value: String(completed.length), label: "Tamamlanan", tone: "success", icon: "check" },
    { value: String(inProgress.length), label: "Devam Eden", tone: "blue", icon: "clock" },
    { value: String(warning.length), label: "Eksik / Uyarı", tone: "orange", icon: "warning" },
    { value: String(modules.filter((module) => module.status === "Kilitli").length), label: "Kilitli", tone: "slate", icon: "key" }
  ];
}

function moduleControlApprovalCard() {
  return createSection("Teknik Kural", technicalApprovalFlow.blockingRule, [
    checklistRow("Final aksiyon", technicalApprovalTerminology.technicianFinalAction, "success"),
    checklistRow("Tamamlama kuralı", technicalApprovalFlow.blockingRule, "warning")
  ]);
}

function getModuleControlContinueRoute(modules) {
  const activeModule = modules.find((module) => module.status !== "Kilitli");
  return activeModule?.routeId || "itemDetail";
}

function resolveModuleControlTone(statusTone, status) {
  if (status === "Kilitli") return "orange";
  if (["warning", "orange"].includes(statusTone)) return "orange";
  if (["neutral"].includes(statusTone)) return "blue";
  if (["red"].includes(statusTone)) return "orange";
  if (["success"].includes(statusTone)) return "success";
  return "slate";
}

function resolveModuleControlProgress(module) {
  if (module.status === "Tamamlandı") return 100;
  if (module.status === "Devam Ediyor" || module.status === "Usta Üzerinde") return 62;
  if (module.status === "Kilitli") return 0;
  return 18;
}

function resolveModuleControlIcon(moduleId) {
  const iconMap = {
    "kaporta-boya": "panel",
    kaporta: "panel",
    motor: "engine",
    "alt-on-mekanik": "wrench",
    mekanik: "wrench",
    "fren-suspansiyon": "wrench",
    elektrik: "electric",
    "obd-beyin": "sliders",
    beyin: "sliders",
    "genel-kondisyon-dis": "car",
    "ic-ekspertiz": "user",
    airbag: "shield",
    "conta-kacak": "key",
    conta: "key",
    "dyno-yol": "gauge",
    donanim: "user",
    yoltesti: "gauge",
    mekanik_panel: "wrench"
  };
  return iconMap[moduleId] || "clipboard";
}

function renderItemDetail(onNavigate) {
  const isReadOnly = isLockedSectionReadOnlyActive();
  const selectedModule = getSelectedInspectionModule();
  const formItems = selectedModule.form?.items || [];
  const firstItem = getSelectedInspectionItem(selectedModule);
  const moduleProgress = getModuleFormProgress(selectedModule.formKey, selectedModule.form);
  const itemTitle = firstItem.title || "Kontrol Maddesi";
  const itemDescription = firstItem.helpText || firstItem.description || "Seçilen modülün detay kontrol maddesi.";
  const evidenceCount = Math.max(1, getStatusEvidenceCaptures(selectedModule.formKey, firstItem).length || 3);
  const moduleIcon = icons[
    selectedModule.formKey === "motor" ? "engine"
      : selectedModule.formKey === "mechanic" ? "wrench"
      : selectedModule.formKey === "electric" ? "electric"
      : selectedModule.formKey === "airbag" ? "shield"
      : selectedModule.formKey === "roadTest" ? "gauge"
      : "car"
    ] || icons.car;
  const itemRequirements = [];
  if (firstItem.optionCount > 0) itemRequirements.push("Zorunlu");
  if (getStatusEvidenceCaptures(selectedModule.formKey, firstItem).length > 0) itemRequirements.push("Fotoğraf");
  if (firstItem.hasDescription) itemRequirements.push("Not");
  if (firstItem.inputs?.length) itemRequirements.push("Ek Alan");
  const main = element("main", { className: "phase2-main inspection-item-screen" });
  main.append(
    inspectionHeader("Madde Detayı", selectedModule.title, onNavigate, "moduleControl"),
    element("section", { className: "inspection-item-hero", html: `
      <span class="inspection-item-index">1</span>
        <span class="inspection-item-icon">${moduleIcon}</span>
        <div class="inspection-item-copy">
          <h2>${itemTitle}</h2>
          <p>${itemDescription}</p>
          <div class="inspection-item-requirements">
            ${itemRequirements.map((label) => `<span>${label}</span>`).join("")}
          </div>
          <button type="button" class="inspection-item-status" ${isReadOnly ? "disabled" : ""}>${moduleProgress.completed}/${moduleProgress.total} Tamamlandı ${icons.check}</button>
        </div>
        <button type="button" class="inspection-item-photo" aria-label="Fotoğrafları görüntüle"><img src="./src/assets/design-reference/inspection-flow/detail-hood-main.png" alt=""><b>1 / ${evidenceCount}</b></button>
      <button type="button" class="inspection-item-next-photo" aria-label="Sonraki fotoğraf">${icons.arrow}</button>
      <dl>
        <div><dt>Modül</dt><dd>${selectedModule.title}</dd></div>
        <div><dt>Kontrol</dt><dd>${(formItems.findIndex((item) => getModuleItemKey(item) === getModuleItemKey(firstItem)) + 1) || 1} / ${selectedModule.form?.itemCount || formItems.length || 1}</dd></div>
        <div><dt>Öncelik</dt><dd><span>Normal</span></dd></div>
        <div><dt>Tahmini Süre</dt><dd>2 dk</dd></div>
      </dl>
    ` }),
    ...(isReadOnly ? [element("section", { className: "inspection-item-readonly", html: `${icons.lock}<span>Bu madde salt okunur modda görüntüleniyor.</span>` })] : []),
    renderInspectionChecklist(onNavigate, isReadOnly, selectedModule),
    renderInspectionEvidence(onNavigate, isReadOnly, selectedModule),
    element("section", { className: "inspection-item-note", html: `<h2>Not</h2><label><textarea maxlength="250" placeholder="Not eklemek için yazın..." ${isReadOnly ? "disabled" : ""}></textarea><small>0 / 250</small></label>` }),
    element("section", { className: "inspection-item-actions" })
  );
  const actions = main.querySelector(".inspection-item-actions");
  if (isReadOnly) {
    actions.append(
      button(`${icons.arrowLeft}<span>Başlıklara Dön</span>`, "inspection-item-secondary", () => {
        clearLockedSectionState();
        onNavigate("tests");
      }, "Başlıklara dön", true),
      button(`${icons.userPlus}<span>Devralma Talebi</span>`, "inspection-item-primary", () => {
        markLockedSectionRequest();
        onNavigate("taskTransfer");
      }, "Devralma talebi", true)
    );
  } else {
    actions.append(
      button(`${icons.report}<span>Eksik / Uyarı Ekle</span>`, "inspection-item-outline-danger", () => onNavigate("missing"), "Eksik uyarı ekle", true),
      button(`${icons.arrowLeft}<span>Testi Bırak</span>`, "inspection-item-secondary", () => {
        releaseActiveModuleOwnership(onNavigate);
      }, "Testi bırak", true),
      button(`<span>Sonraki Madde</span>${icons.arrow}`, "inspection-item-primary", () => {
        recordWorkflowStep("item_detail_status_requested", {
          selectedItem: itemTitle,
          selectedModule: selectedModule.title,
          statusSelectionReturnRoute: "itemDetail"
        });
        onNavigate("statusModal");
      }, "Sonraki madde", true)
    );
  }
  return main;
}

function renderInspectionChecklist(onNavigate, isReadOnly, selectedModule = getSelectedInspectionModule()) {
  const section = element("section", { className: "inspection-item-section inspection-checklist-section" });
  const checklistItems = selectedModule.form?.items || [];
  const moduleState = getModuleFormState(selectedModule.formKey);
  const completedCount = checklistItems.filter((item) => isModuleItemComplete(item, moduleState[getModuleItemKey(item)])).length;
  section.append(element("div", { className: "inspection-item-section-head", html: `<h2>Kontrol Listesi</h2><span>${completedCount} / ${checklistItems.length} Tamamlandı</span><button type="button" aria-label="Daralt">${icons.arrow}</button>` }));
  const list = element("div", { className: "inspection-checklist-list" });
  checklistItems.forEach((item, index) => {
    const title = item.title || "Kontrol maddesi";
    const desc = item.helpText || item.description || "Detay kontrolü yapılır.";
    const itemState = moduleState[getModuleItemKey(item)];
    const isComplete = isModuleItemComplete(item, itemState);
    const rowStatus = isComplete ? "Tamamlandı" : itemState?.selectedOption || "Devam Ediyor";
    const row = button("", "inspection-checklist-row", () => {
      if (!isReadOnly) openInspectionItemStatus(item, index, selectedModule, onNavigate, "itemDetail");
    }, `${title} durum seçimi`);
    row.innerHTML = `<span>${isComplete ? icons.check : icons.clipboard}</span><div><strong>${title}</strong><em>${desc}</em></div><b>${rowStatus}</b>${icons.arrow}`;
    list.append(row);
  });
  section.append(list);
  return section;
}

function renderInspectionEvidence(onNavigate, isReadOnly, selectedModule = getSelectedInspectionModule()) {
  const progress = getModuleFormProgress(selectedModule.formKey, selectedModule.form);
  const section = element("section", { className: "inspection-item-section inspection-evidence-section" });
  section.append(element("div", { className: "inspection-item-section-head", html: `<h2>Fotoğraflar <small>Opsiyonel</small></h2><span>${progress.readyEvidence} / 3</span><button type="button" aria-label="Daralt">${icons.arrow}</button>` }));
  const grid = element("div", { className: "inspection-evidence-grid" });
  grid.append(
    button(`<img src="./src/assets/design-reference/inspection-flow/evidence-hood-main.png" alt=""><b>${icons.check}</b><strong>Ana Görünüm</strong><em>12.05.2025 09:24</em>`, "inspection-evidence-slot is-filled", () => onNavigate("photoApproval"), "Ana görünüm", true),
    button(`${icons.camera}<strong>Fotoğraf 2</strong><em>Opsiyonel</em>`, "inspection-evidence-slot", () => !isReadOnly && onNavigate("camera"), "İkinci fotoğraf", true),
    button(`${icons.camera}<strong>Fotoğraf 3</strong><em>Opsiyonel</em>`, "inspection-evidence-slot", () => !isReadOnly && onNavigate("camera"), "Üçüncü fotoğraf", true)
  );
  section.append(grid, element("p", { className: "inspection-evidence-info", html: `${icons.info}<span>Fotoğraf eklemek isteğe bağlıdır; durum ekranından eklenenler Uygula sonrası arka planda gönderilir.</span>` }));
  return section;
}

function moduleFormProgressCard(module, progress) {
  return element("section", {
    className: "section-card module-form-progress-card",
    attrs: { "data-module-form-key": module.formKey },
    html: `
      <div class="module-form-progress-head">
        <span>${icons.check}</span>
        <div>
          <h2>${module.title} İlerleme</h2>
          <p class="module-form-progress-summary">${progress.completed}/${progress.total} madde tamamlandı · ${progress.readyEvidence} opsiyonel fotoğraf eklendi</p>
        </div>
        <strong class="module-form-progress-percent">%${progress.percent}</strong>
      </div>
      <i class="module-form-progress-line"><b style="width:${progress.percent}%"></b></i>
      <div class="module-form-progress-kpis">
        <article><b data-module-form-kpi="missingEvidence">${progress.missingEvidence}</b><span>Zorunlu yok</span></article>
        <article><b>${module.form.descriptionItemCount}</b><span>Açıklama alanı</span></article>
        <article><b>${module.form.items.slice(0, 8).length}</b><span>Bu ekranda görünen</span></article>
      </div>
    `
  });
}

function refreshCurrentModuleFormProgress(formKey) {
  const form = expertiseModuleForms[formKey];
  if (!form) return;
  const card = document.querySelector(`.module-form-progress-card[data-module-form-key="${formKey}"]`);
  if (!card) return;
  const progress = getModuleFormProgress(formKey, form);
  const summary = card.querySelector(".module-form-progress-summary");
  const percent = card.querySelector(".module-form-progress-percent");
  const line = card.querySelector(".module-form-progress-line b");
  const missing = card.querySelector('[data-module-form-kpi="missingEvidence"]');
  if (summary) summary.textContent = `${progress.completed}/${progress.total} madde tamamlandı · ${progress.readyEvidence} opsiyonel fotoğraf eklendi`;
  if (percent) percent.textContent = `%${progress.percent}`;
  if (line) line.style.width = `${progress.percent}%`;
  if (missing) missing.textContent = String(progress.missingEvidence);
  scheduleModuleTaskCompletionSync(formKey);
}

function getSelectedInspectionModule() {
  const workflow = getWorkflowState();
  const formKey = workflow.selectedModuleFormKey && expertiseModuleForms[workflow.selectedModuleFormKey]
    ? workflow.selectedModuleFormKey
    : "kaporta-boya";
  const title = workflow.selectedModuleTitle || moduleTitleForFormKey(formKey);
  const subtitle = workflow.selectedModuleSubtitle || moduleSubtitleForFormKey(formKey);
  return {
    title,
    subtitle,
    formKey,
    form: expertiseModuleForms[formKey],
    schemaTitle: moduleTitleForFormKey(formKey),
    owner: workflow.selectedModuleOwner || getClaimedModuleOwner(formKey)?.owner || getCurrentTechnicianName(),
    claimedAt: workflow.selectedModuleClaimedAt || getClaimedModuleOwner(formKey)?.claimedAt || "",
    summaryTitle: formKey === "kaporta-boya" ? "Panel Özeti" : "Başlık Özeti",
    summaryText: formKey === "kaporta-boya"
      ? "Durumlar: Orijinal, Boyalı, Lokal Boyalı, Değişen, Hasarlı, Kontrol Edilmedi."
      : "Bu ekran seçilen görev modülünün test maddelerini gösterir."
  };
}

function getSelectedInspectionItem(selectedModule = getSelectedInspectionModule()) {
  const workflow = getWorkflowState();
  const items = selectedModule.form?.items || [];
  const itemKey = workflow.selectedItemKey || "";
  const itemTitle = workflow.selectedItemTitle || "";
  const foundIndex = items.findIndex((item, index) => {
    const displayItem = getInspectionDisplayItem(selectedModule.formKey, item, index);
    return getModuleItemKey(item) === itemKey || displayItem.title === itemTitle || item.title === itemTitle;
  });
  if (foundIndex >= 0) return getInspectionDisplayItem(selectedModule.formKey, items[foundIndex], foundIndex);
  return getInspectionDisplayItem(selectedModule.formKey, items[0] || {}, 0);
}

function summarizeInspectionItemState(formKey, item) {
  const state = getModuleItemState(formKey, item);
  const isComplete = isModuleItemComplete(item, state);
  const optionLabel = state.selectedOption || "";
  if (isComplete) return { label: optionLabel || "İyi", tone: "success", icon: icons.check };
  if (optionLabel) return { label: optionLabel, tone: "warning", icon: icons.alert };
  return { label: "Boş", tone: "neutral", icon: icons.info };
}

function getInspectionDisplayItem(formKey, item, index) {
  const preferredTitle = inspectionDisplayTitles[formKey]?.[index];
  const title = preferredTitle || item.title || `Kontrol ${index + 1}`;
  const description = item.helpText || item.description || "";
  return { ...item, title, description };
}

function getClaimedModuleOwner(formKey) {
  try {
    const current = JSON.parse(localStorage.getItem("ototrModuleOwnership") || "{}");
    return current[formKey] || null;
  } catch {
    return null;
  }
}

function clearClaimedModuleOwner(order, formKey) {
  try {
    const current = JSON.parse(localStorage.getItem("ototrModuleOwnership") || "{}");
    delete current[formKey];
    if (order?.id) delete current[moduleTaskStoreKey(order, formKey)];
    localStorage.setItem("ototrModuleOwnership", JSON.stringify(current));
  } catch {
    // Local storage may be unavailable in restricted WebViews.
  }
}

function moduleTitleForFormKey(formKey) {
  const titles = {
    motor: "Motor",
    "alt-on-mekanik": "Alt / Ön / Mekanik",
    mechanic: "Alt / Ön / Mekanik",
    brakeSuspension: "Fren / Süspansiyon",
    "fren-suspansiyon": "Fren / Süspansiyon",
    electric: "Elektrik / OBD",
    "obd-beyin": "OBD / Beyin",
    brain: "Beyin Kontrolü",
    airbag: "Airbag",
    "genel-kondisyon-dis": "Dış Kondisyon",
    "ic-ekspertiz": "İç Ekspertiz",
    interiorExterior: "İç / Dış Donanım",
    roadTest: "Yol Testi",
    "dyno-yol": "Dyno / Yol",
    "kaporta-boya": "Kaporta / Boya",
    kaporta: "Kaporta",
    "conta-kacak": "Conta Kaçak",
    conta: "Conta Kaçak Testi"
  };
  return titles[formKey] || "Kaporta / Boya";
}

function moduleSubtitleForFormKey(formKey) {
  const subtitles = {
    motor: "Motor Ekspertiz ve Check-Up",
    "alt-on-mekanik": "Alt / Ön / Mekanik Ekspertiz",
    mechanic: "Alt / Ön / Mekanik Ekspertiz",
    brakeSuspension: "Fren / Süspansiyon Testi",
    "fren-suspansiyon": "Fren / Süspansiyon Testi",
    electric: "Elektrik, beyin ve OBD test grubu",
    "obd-beyin": "OBD / beyin tarama ve hata kaydı",
    brain: "OBD / beyin tarama ve hata kaydı",
    airbag: "Airbag ve güvenlik sistemi kontrolü",
    "genel-kondisyon-dis": "Genel kondisyon ve dış ekipman kontrolü",
    "ic-ekspertiz": "İç trim, donanım ve güvenlik kontrolü",
    interiorExterior: "İç / dış donanım ve genel kondüsyon",
    roadTest: "Yol testi ve sürüş dinamiği",
    "dyno-yol": "Dyno / yol testi ve sürüş dinamiği",
    "kaporta-boya": "Kaporta - boya ekspertiz ve check-up",
    kaporta: "Kaporta - boya ekspertiz ve check-up",
    "conta-kacak": "Conta kaçak test akışı",
    conta: "Conta kaçak test akışı"
  };
  return subtitles[formKey] || "12 panel ve boya / hasar akışı";
}

function selectedModuleHero(module) {
  return element("section", {
    className: "section-card selected-module-hero",
    html: `
      <span>${icons[module.formKey === "motor" ? "engine" : module.formKey === "mechanic" ? "wrench" : module.formKey === "electric" ? "electric" : module.formKey === "airbag" ? "shield" : module.formKey === "roadTest" ? "gauge" : "clipboard"]}</span>
      <div>
        <h2>${module.title}</h2>
        <p>${module.subtitle}</p>
        <small>${module.form.itemCount} madde · fotoğraf opsiyonel</small>
        <em>Sahiplenen Usta: ${module.owner}</em>
      </div>
    `
  });
}

function getSelectedInspectionItemIndex(selectedModule, selectedItem) {
  const items = selectedModule.form?.items || [];
  const selectedKey = getModuleItemKey(selectedItem);
  const foundIndex = items.findIndex((item, index) => {
    const displayItem = getInspectionDisplayItem(selectedModule.formKey, item, index);
    return getModuleItemKey(item) === selectedKey || displayItem.title === selectedItem.title || item.title === selectedItem.title;
  });
  return foundIndex >= 0 ? foundIndex : 0;
}

function renderStatusSelectionSummary(selectedModule, selectedItem) {
  const itemIndex = getSelectedInspectionItemIndex(selectedModule, selectedItem);
  const description = selectedItem.helpText || selectedItem.description || "Bu madde için durum seçimi yapılır.";
  return element("section", {
    className: "status-selection-summary",
    html: `
      <article>
        <span>Modül</span>
        <strong>${selectedModule.title}</strong>
      </article>
      <article>
        <span>Madde</span>
        <strong>${itemIndex + 1} / ${selectedModule.form?.itemCount || selectedModule.form?.items?.length || 1}</strong>
      </article>
      <article class="wide">
        <span>Kontrol özeti</span>
        <strong>${description}</strong>
      </article>
    `
  });
}

function queueStatusEvidenceBackgroundSync(selectedModule, selectedItem) {
  const captures = getStatusEvidenceCaptures(selectedModule.formKey, selectedItem);
  if (!captures.length) return;
  syncPendingEvidenceCaptureStoreWithTimeout(4500).then((result) => {
    const storeById = new Map(getEvidenceCaptureStore().map((item) => [item.id, item]));
    const nextCaptures = getStatusEvidenceCaptures(selectedModule.formKey, selectedItem).map((capture) => {
      const latest = storeById.get(capture.id);
      return latest ? {
        ...capture,
        syncStatus: latest.syncStatus || capture.syncStatus,
        syncedAt: latest.syncedAt || capture.syncedAt,
        uploadError: latest.uploadError || ""
      } : capture;
    });
    setModuleItemState(selectedModule.formKey, selectedItem, { statusEvidenceCaptures: nextCaptures });
    setModuleItemState(selectedModule.formKey, selectedItem, {
      syncInlineStatus: result.failedCount || result.timedOut ? "Senkron bekliyor" : "Senkronize edildi"
    });
    recordWorkflowStep(result.failedCount ? "status_evidence_sync_queued" : "status_evidence_sync_started", {
      selectedModule: selectedModule.title,
      selectedItem: selectedItem.title,
      attemptedEvidenceCount: result.attemptedCount || 0,
      uploadedEvidenceCount: result.uploadedCount || 0,
      failedEvidenceCount: result.failedCount || 0,
      evidenceSyncTimedOut: Boolean(result.timedOut),
      workOrderStatus: result.failedCount ? "evidence_pending_sync" : "status_saved_background_sync"
    });
  }).catch((error) => {
    setModuleItemState(selectedModule.formKey, selectedItem, { syncInlineStatus: "Hata / tekrar dene" });
    recordWorkflowStep("status_evidence_sync_failed", {
      selectedModule: selectedModule.title,
      selectedItem: selectedItem.title,
      errorMessage: error?.message || "Durum ekranı kanıt senkronu başlatılamadı.",
      workOrderStatus: "evidence_pending_sync"
    });
  });
}

function renderStatusSelectionEvidence(selectedModule, selectedItem) {
  const section = element("section", { className: "status-selection-evidence-panel" });
  const grid = element("div", { className: "status-selection-photo-grid" });
  const status = element("p", {
    className: "status-selection-evidence-status",
    text: "Fotoğraf eklemek opsiyoneldir. Eklenenler Uygula sonrası arka planda senkronize edilir."
  });
  const fallbackInput = element("input", {
    className: "status-selection-file-input",
    attrs: { type: "file", accept: "image/*", capture: "environment", "aria-label": "Durum seçimi fotoğrafı seç" }
  });
  let activeSlotIndex = 1;

  const openFallbackPicker = (sourceLabel) => {
    fallbackInput.onchange = () => {
      const file = fallbackInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        saveStatusSelectionEvidenceCapture(selectedModule, selectedItem, activeSlotIndex, {
          dataUrl: String(reader.result || ""),
          fileName: file.name,
          mimeType: file.type || "image/jpeg",
          sizeBytes: file.size,
          sizeText: formatEvidenceSize(file.size)
        });
        status.textContent = `${sourceLabel} ${activeSlotIndex}. slota eklendi. Senkron Uygula sonrası arka planda başlar.`;
        fallbackInput.value = "";
        renderSlots();
      };
      reader.onerror = () => {
        status.textContent = "Görsel okunamadı. Lütfen tekrar deneyin.";
      };
      reader.readAsDataURL(file);
    };
    fallbackInput.click();
  };

  const captureSlot = (slotIndex) => {
    activeSlotIndex = slotIndex;
    status.textContent = `${slotIndex}. fotoğraf için kamera açılıyor...`;
    captureEvidenceFromNative("camera", (sourceLabel, payload) => {
      saveStatusSelectionEvidenceCapture(selectedModule, selectedItem, slotIndex, payload);
      status.textContent = `${slotIndex}. fotoğraf eklendi. Uygula dediğinizde kayıt arka planda gönderilir.`;
      renderSlots();
    }, openFallbackPicker, status);
  };

  const clearSlot = (slotIndex) => {
    clearStatusEvidenceCapture(selectedModule.formKey, selectedItem, slotIndex);
    status.textContent = `${slotIndex}. fotoğraf kaldırıldı.`;
    renderSlots();
  };

  const renderSlots = () => {
    grid.innerHTML = "";
    const captures = getStatusEvidenceCaptures(selectedModule.formKey, selectedItem);
    [1, 2, 3].forEach((slotIndex) => {
      const capture = captures.find((entry) => Number(entry.slotIndex) === slotIndex);
      const card = element("article", {
        className: `status-selection-photo-card${capture ? " is-filled" : ""}`
      });
      if (capture) {
        card.append(
          element("div", {
            className: "status-selection-photo-preview",
            html: `${capture.previewUrl ? `<img src="${capture.previewUrl}" alt="${slotIndex}. fotoğraf önizleme">` : icons.camera}<b>${icons.check}</b>`
          }),
          element("div", {
            className: "status-selection-photo-copy",
            html: `<strong>Fotoğraf ${slotIndex}</strong><span>${capture.syncStatus === "uploaded" ? "Yüklendi" : "Arka plan kuyruğu"}</span><small>${capture.sizeText || "Hazır"}</small>`
          }),
          element("div", { className: "status-selection-photo-actions" })
        );
        card.querySelector(".status-selection-photo-actions").append(
          button("Değiştir", "status-selection-photo-change", () => captureSlot(slotIndex)),
          button("Sil", "status-selection-photo-remove", () => clearSlot(slotIndex))
        );
      } else {
        card.append(
          button(`${icons.camera}<strong>Fotoğraf ${slotIndex}</strong><span>Ekle</span>`, "status-selection-photo-add", () => captureSlot(slotIndex), `${slotIndex}. fotoğraf ekle`, true)
        );
      }
      grid.append(card);
    });
  };

  section.append(
    element("div", { className: "status-selection-section-head", html: `<h2>Fotoğraflar</h2><span>Opsiyonel 0-3</span>` }),
    grid,
    status,
    fallbackInput
  );
  renderSlots();
  return section;
}

function renderStatusModal(onNavigate) {
  const selectedModule = getSelectedInspectionModule();
  const selectedItem = getSelectedInspectionItem(selectedModule);
  const itemState = getModuleItemState(selectedModule.formKey, selectedItem);
  const isMechanicDesign = isMechanicInspectionModule(selectedModule.formKey);
  const workflow = getWorkflowState();
  const statusReturnRoute = workflow.statusSelectionReturnRoute || "itemDetail";
  const closeStatusSelection = (targetRoute) => {
    setWorkflowState({ statusSelectionReturnRoute: "" });
    onNavigate(targetRoute);
  };
  const main = element("main", {
    className: `phase2-main status-selection-screen${isMechanicDesign ? " status-selection-mechanic" : ""}`
  });
  const statusDescriptions = {
    "Sorunsuz": "Madde kontrol edildi ve sorun tespit edilmedi.",
    "Kontrol Gerekli": "Madde için ek kontrol, açıklama veya kanıt gerekli.",
    "Kusurlu": "Maddede kusur veya onarım gerektiren durum var.",
    "İşlemli": "Maddede daha önce işlem uygulanmış.",
    "Uygulanamaz": "Bu madde araç veya koşullar için uygulanamaz."
  };
  const options = resolveStatusSelectionOptions(selectedModule, selectedItem).map((label) => ({
    key: label,
    title: label,
    desc: statusDescriptions[label] || "Standart ekspertiz durumu.",
    tone: optionTone(label),
    icon: ["Sorunsuz", "İyi"].includes(label) ? icons.check : label === "Kusurlu" ? icons.warning : label === "İşlemli" || label.includes("Kaçağı") ? icons.wrench : icons.info
  }));
  let selected = options.some((option) => option.key === itemState.selectedOption)
    ? itemState.selectedOption
    : options[0]?.key || "Sorunsuz";
  const noteInput = element("textarea", {
    className: "status-selection-note-input",
    attrs: {
      maxlength: "250",
      rows: "3",
      placeholder: "Açıklama / not ekleyin..."
    }
  });
  noteInput.value = itemState.description || "";
  const optionList = element("section", { className: "status-selection-options", attrs: { role: "radiogroup", "aria-label": "Parça durumu" } });
  const optionButtons = options.map((option) => {
    const row = button("", `status-selection-option tone-${option.tone}`, () => {
      selected = option.key;
      optionButtons.forEach((item) => {
        const isSelected = item.dataset.key === selected;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-checked", isSelected ? "true" : "false");
      });
    }, `${option.title} seç`, false);
    row.dataset.key = option.key;
    row.setAttribute("role", "radio");
    row.setAttribute("aria-checked", option.key === selected ? "true" : "false");
    row.classList.toggle("is-selected", option.key === selected);
    row.innerHTML = `<span>${option.icon}</span><div><strong>${option.title}</strong><em>${option.desc}</em></div><i></i>`;
    optionList.append(row);
    return row;
  });
  main.append(
    element("section", { className: "status-selection-backdrop", html: `<div class="status-selection-blur"><h2>${selectedModule.title}</h2><p>${selectedItem.title || "Kontrol maddesi"}</p></div>` }),
    element("section", { className: "status-selection-sheet" })
  );
  const sheet = main.querySelector(".status-selection-sheet");
  sheet.append(
    element("i", { className: "status-selection-handle" }),
    element("div", { className: "status-selection-hero", html: `<span>${isMechanicDesign ? icons.wrench : icons.car}</span><h1>${isMechanicDesign ? (selectedItem.title || "Durum Seçimi") : "Durum Seçimi"}</h1><p>${selectedModule.title} için durum belirleyin.</p>` }),
    renderStatusSelectionSummary(selectedModule, selectedItem),
    optionList,
    element("section", { className: "status-selection-note-panel", html: `<label><span>Açıklama / Not</span></label>` }),
    renderStatusSelectionEvidence(selectedModule, selectedItem),
    element("p", { className: "status-selection-info", html: `${icons.info}<span>Doğru seçim, ekspertiz raporunun doğruluğu için önemlidir.</span>` }),
    element("section", { className: "status-selection-actions" })
  );
  sheet.querySelector(".status-selection-note-panel label")?.append(noteInput);
  sheet.querySelector(".status-selection-actions").append(
    button("İptal", "status-selection-cancel", () => closeStatusSelection(statusReturnRoute)),
    button("Uygula", "status-selection-apply", () => {
      const selectedStatus = options.find((option) => option.key === selected)?.title || "Sorunsuz";
      const captures = getStatusEvidenceCaptures(selectedModule.formKey, selectedItem);
      const order = getSelectedWorkOrder();
      setModuleItemState(selectedModule.formKey, selectedItem, {
        selectedOption: selectedStatus,
        description: noteInput.value.trim(),
        syncInlineStatus: "Senkron bekliyor",
        completed: true,
        reportAnswer: {
          reportId: order.expertiseCaseId || order.id,
          moduleId: selectedModule.formKey,
          moduleTitle: selectedModule.title,
          itemId: getModuleItemKey(selectedItem),
          noktaId: selectedItem.noktaId || "",
          itemTitle: selectedItem.title || "",
          status: selectedStatus,
          note: noteInput.value.trim(),
          photos: [1, 2, 3].map((slotIndex) => captures.find((capture) => Number(capture.slotIndex) === slotIndex) || null),
          completed: true,
          updatedAt: new Date().toISOString()
        }
      });
      queueMobileInspectionAnswerSave(selectedModule.formKey, selectedItem);
      queueStatusEvidenceBackgroundSync(selectedModule, selectedItem);
      refreshCurrentModuleFormProgress(selectedModule.formKey);
      recordWorkflowStep("status_selection_saved", {
        selectedModule: selectedModule.title,
        selectedItemGroup: selectedItem.title || "Kontrol Maddesi",
        selectedStatus,
        optionalEvidenceCount: captures.length
      });
      closeStatusSelection(statusReturnRoute);
    })
  );
  return main;
}

function renderEvidence(onNavigate) {
  const main = screenMain("Fotoğraf ve Kanıt", "Zorunlu slotlar ve açıklama alanları", onNavigate, true);
  const syncStats = getEvidenceSyncStats();
  const list = element("div", { className: "stack" });
  evidenceSlots.forEach((slot) => list.append(evidenceCard(slot, onNavigate)));
  const captureList = evidenceCaptureList(syncStats.captures);
  main.append(
    evidenceSyncSummaryCard(syncStats),
    createSection("Fotoğraf Slotları", "Durum Seçimi ekranında 3 opsiyonel fotoğraf alanı açılır. Eklenen görseller Uygula sonrası arka planda senkronize edilir.", [list]),
    createSection("Cihazdaki Kanıtlar", "Çekilen veya galeriden seçilen görseller senkron kuyruğuna eklenir.", [captureList]),
    actionRow([
      button("Durum Gir", "secondary-button full-width", () => {
        recordWorkflowStep("evidence_add_requested", {
          selectedEvidenceSlot: "manual",
          workOrderStatus: "evidence_in_progress"
        });
        onNavigate("tests");
      }),
      button("Senkron Kuyruğu", "secondary-button full-width", () => onNavigate("evidence-sync-queue")),
      button("Eksik Uyarıları Gör", "primary-button full-width", () => {
        recordWorkflowStep("evidence_missing_review", {
          missingEvidenceCount: evidenceSlots.filter((slot) => slot.status === "Eksik").length
        });
        onNavigate("missing");
      })
    ])
  );
  return main;
}

function renderCamera(onNavigate) {
  const main = screenMain("Kanıt Fotoğrafı Çek", "Fotoğraf çek veya galeriden seç", onNavigate, true);
  const selectedSlot = getSelectedEvidenceSlot();
  const lastCapture = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("ototrLastEvidenceCapture") || "null");
    } catch {
      return null;
    }
  })();
  let captured = false;
  const status = element("p", { className: "camera-flow-status", text: `Hedef slot: ${selectedSlot.slotTitle}` });
  const preview = element("section", {
    className: "section-card camera-capture-preview",
    html: `<span>${icons.camera}</span><strong>Kanıt önizleme alanı</strong><p>Çek veya Galeri seçimi sonrası görsel burada hazırlanır.</p>`
  });
  const setCaptured = (source, payload = {}) => {
    const { item } = saveCapturedEvidence(source, payload);
    captured = true;
    preview.classList.add("has-capture");
    preview.innerHTML = item.previewUrl
      ? `<img src="${item.previewUrl}" alt="${item.slotTitle} önizleme"><strong>${source} hazır</strong><p>${item.fileName} · ${item.sizeText}</p>`
      : `<span>${icons.check}</span><strong>${source} hazır</strong><p>${item.fileName} · ${item.sizeText}</p>`;
    status.textContent = `${source} başarıyla hazırlandı ve senkron kuyruğuna eklendi.`;
    keepCameraActionsVisible();
  };
  const useAndSyncCapture = async () => {
    if (!captured) {
      status.textContent = "Devam etmek için önce fotoğraf çekin veya galeriden seçin.";
      recordWorkflowStep("camera_capture_required", {
        evidenceReady: false,
        workOrderStatus: "evidence_required"
      });
      return;
    }
    status.textContent = "Kanıt kullanılıyor ve Storage senkronu başlatılıyor...";
    const result = await syncPendingEvidenceCaptureStoreWithTimeout(4500);
    const synced = result.uploadedCount > 0 && result.failedCount === 0 && !result.timedOut;
    recordWorkflowStep("camera_capture_used", {
      evidenceReady: true,
      syncedEvidenceCount: result.uploadedCount || 0,
      failedEvidenceCount: result.failedCount || 0,
      evidenceSyncTimedOut: Boolean(result.timedOut),
      evidenceSyncStep: synced ? "camera_capture_synced" : "camera_capture_queued",
      workOrderStatus: synced ? "evidence_uploaded" : "evidence_pending_sync"
    });
    status.textContent = synced
      ? "Kanıt Storage alanına yüklendi. Önizlemeye geçiliyor..."
      : "Kanıt cihaz kuyruğunda kaldı. Senkron kuyruğundan tekrar deneyebilirsiniz.";
    onNavigate(synced ? "photoApproval" : "evidence-sync-queue");
  };
  const clearCaptured = () => {
    captured = false;
    preview.classList.remove("has-capture");
    preview.innerHTML = `<span>${icons.camera}</span><strong>Kanıt önizleme alanı</strong><p>Çek veya Galeri seçimi sonrası görsel burada hazırlanır.</p>`;
    status.textContent = "Fotoğraf sıfırlandı. Yeniden çekebilir veya galeriden seçebilirsiniz.";
    clearLastEvidenceCapture();
  };
  if (lastCapture?.previewUrl) {
    captured = true;
    preview.classList.add("has-capture");
    preview.innerHTML = `<img src="${lastCapture.previewUrl}" alt="${lastCapture.slotTitle} önizleme"><strong>Son kanıt hazır</strong><p>${lastCapture.fileName} · ${lastCapture.sizeText}</p>`;
    status.textContent = "Son kanıt cihazda saklanıyor. Kullanabilir veya yeni kanıt çekebilirsiniz.";
  }
  const fallbackInput = element("input", {
    className: "camera-file-input",
    attrs: { type: "file", accept: "image/*", capture: "environment", "aria-label": "Kanıt fotoğrafı seç" }
  });
  const openFallbackPicker = (source) => {
    fallbackInput.onchange = () => {
      const file = fallbackInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setCaptured(source, {
          dataUrl: String(reader.result || ""),
          fileName: file.name,
          mimeType: file.type || "image/jpeg",
          sizeBytes: file.size,
          sizeText: formatEvidenceSize(file.size)
        });
        fallbackInput.value = "";
      };
      reader.onerror = () => {
        status.textContent = "Görsel okunamadı. Lütfen tekrar deneyin.";
      };
      reader.readAsDataURL(file);
    };
    fallbackInput.click();
  };
  const actionStack = element("section", { className: "camera-action-stack" });
  const keepCameraActionsVisible = () => {
    requestAnimationFrame(() => {
      actionStack.scrollIntoView({ block: "center", inline: "nearest" });
    });
  };
  actionStack.append(
    actionRow([
      button("Çek", "secondary-button full-width", () => captureEvidenceFromNative("camera", setCaptured, openFallbackPicker, status)),
      button("Galeri", "secondary-button full-width", () => captureEvidenceFromNative("gallery", setCaptured, openFallbackPicker, status))
    ]),
    actionRow([
      button("Tekrar Çek", "secondary-button full-width", clearCaptured),
      button("Kullan ve Senkronize Et", "primary-button full-width", useAndSyncCapture)
    ]),
    button("Vazgeç", "ghost-button full-width", () => onNavigate("evidence"))
  );
  main.append(
    preview,
    createSection("Kanıt Bilgisi", "", [
      checklistRow("Seçilen slot", selectedSlot.slotTitle, selectedSlot.slotStatus === "Eksik" ? "red" : "warning"),
      checklistRow("İş emri", `${selectedSlot.plate} · ${selectedSlot.moduleTitle}`, "neutral"),
      checklistRow("Açıklama alanı", "Aktif", "success"),
      status
    ]),
    actionStack,
    fallbackInput
  );
  return main;
}

async function captureEvidenceFromNative(mode, onCaptured, onFallback, statusNode) {
  const sourceLabel = mode === "camera" ? "Fotoğraf" : "Galeri görseli";
  const cameraPlugin = window.Capacitor?.Plugins?.Camera;
  if (!cameraPlugin?.getPhoto && !cameraPlugin?.takePhoto && !cameraPlugin?.chooseFromGallery) {
    statusNode.textContent = "Web preview modu: dosya seçici açılıyor.";
    onFallback(sourceLabel);
    return;
  }
  try {
    statusNode.textContent = `${sourceLabel} hazırlanıyor...`;
    const photo = await getNativeEvidencePhoto(cameraPlugin, mode);
    onCaptured(sourceLabel, await normalizeNativeEvidencePhoto(photo, mode));
  } catch (error) {
    const message = error?.message || "";
    statusNode.textContent = message.includes("cancel")
      ? "İşlem iptal edildi. Kamera veya galeriyi yeniden açabilirsiniz."
      : "Native kamera açılamadı; dosya seçici ile devam edebilirsiniz.";
    if (!message.includes("cancel")) onFallback(sourceLabel);
  }
}

async function getNativeEvidencePhoto(cameraPlugin, mode) {
  if (mode === "camera" && cameraPlugin.takePhoto) {
    return cameraPlugin.takePhoto({
      quality: 72,
      includeMetadata: true,
      saveToGallery: false,
      correctOrientation: true
    });
  }
  if (mode === "gallery" && cameraPlugin.chooseFromGallery) {
    const result = await cameraPlugin.chooseFromGallery({
      quality: 72,
      limit: 1,
      allowMultipleSelection: false,
      includeMetadata: true
    });
    return result?.results?.[0] || result?.photos?.[0] || result;
  }
  return cameraPlugin.getPhoto({
    quality: 72,
    allowEditing: false,
    resultType: "dataUrl",
    source: mode === "camera" ? "CAMERA" : "PHOTOS",
    saveToGallery: false,
    correctOrientation: true
  });
}

async function normalizeNativeEvidencePhoto(photo = {}, mode = "camera") {
  const format = normalizeEvidenceImageFormat(photo.format || photo.metadata?.format || "jpeg");
  const mimeType = `image/${format === "jpg" ? "jpeg" : format}`;
  const dataUrl = await getEvidenceDataUrl(photo, mimeType);
  const sizeBytes = estimateDataUrlSize(dataUrl);
  return {
    dataUrl,
    previewUrl: dataUrl || photo.webPath || "",
    fileName: `${mode}-${Date.now()}.${format === "jpeg" ? "jpg" : format}`,
    mimeType,
    sizeBytes,
    sizeText: sizeBytes ? formatEvidenceSize(sizeBytes) : "Native seçim"
  };
}

async function getEvidenceDataUrl(photo = {}, mimeType = "image/jpeg") {
  if (photo.dataUrl) return photo.dataUrl;
  if (photo.base64String) return `data:${mimeType};base64,${photo.base64String}`;
  if (photo.thumbnail) return `data:${mimeType};base64,${photo.thumbnail}`;
  if (photo.webPath) return readImageUrlAsDataUrl(photo.webPath, mimeType);
  return "";
}

async function readImageUrlAsDataUrl(url = "", fallbackMimeType = "image/jpeg") {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Görsel okunamadı: HTTP ${response.status}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Görsel dataUrl formatına çevrilemedi."));
    reader.readAsDataURL(blob.type ? blob : new Blob([blob], { type: fallbackMimeType }));
  });
}

function normalizeEvidenceImageFormat(format = "jpeg") {
  const normalized = String(format || "jpeg").toLowerCase().replace(/^image\//, "");
  if (normalized === "jpg") return "jpeg";
  if (normalized === "png" || normalized === "webp" || normalized === "jpeg") return normalized;
  return "jpeg";
}

function estimateDataUrlSize(dataUrl = "") {
  const base64 = String(dataUrl).split(",")[1] || "";
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

function formatEvidenceSize(size = 0) {
  const numericSize = Number(size) || 0;
  if (numericSize < 1024) return `${numericSize} B`;
  if (numericSize < 1024 * 1024) return `${Math.round(numericSize / 1024)} KB`;
  return `${(numericSize / (1024 * 1024)).toFixed(1)} MB`;
}

function evidenceSyncSummaryCard(stats) {
  return element("section", {
    className: "section-card evidence-sync-summary-card",
    html: `
      <span>${icons.sync}</span>
      <div>
        <strong>${stats.pending} bekleyen kanıt</strong>
        <p>${stats.uploaded} yüklendi · ${stats.failed} hata · ${stats.total} toplam</p>
        <i><b style="width:${stats.progress}%"></b></i>
      </div>
    `
  });
}

function evidenceCaptureList(captures) {
  const list = element("div", { className: "evidence-capture-list" });
  if (!captures.length) {
    list.append(element("article", {
      className: "evidence-capture-empty",
      html: `<span>${icons.camera}</span><strong>Henüz cihazda kanıt yok</strong><p>Kamera veya galeri ile kanıt eklediğinizde burada ve senkron kuyruğunda görünecek.</p>`
    }));
    return list;
  }
  captures.slice(0, 6).forEach((item) => {
    const tone = item.syncStatus === "uploaded" ? "success" : item.syncStatus === "failed" ? "red" : "warning";
    list.append(element("article", {
      className: `evidence-capture-card tone-${tone}`,
      html: `
        ${item.previewUrl ? `<img src="${item.previewUrl}" alt="${item.slotTitle} kanıtı">` : `<span>${icons.camera}</span>`}
        <div>
          <strong>${item.slotTitle}</strong>
          <p>${item.moduleTitle} · ${item.plate}</p>
          <small>${item.uploadError || `${item.fileName} · ${item.sizeText}`}</small>
        </div>
        <em>${item.syncStatus === "uploaded" ? "Yüklendi" : item.syncStatus === "failed" ? "Hata" : "Bekliyor"}</em>
      `
    }));
  });
  return list;
}

function evidenceReportSummary(gate) {
  return element("section", {
    className: `section-card evidence-report-summary ${gate.canSubmit ? "tone-success" : "tone-warning"}`,
    html: `
      <span>${gate.canSubmit ? icons.check : icons.warning}</span>
      <div>
        <strong>${gate.canSubmit ? "Kanıtlar tamamlamaya hazır" : "Kanıt blokajı var"}</strong>
        <p>${gate.uploaded} yüklendi · ${gate.pending} bekliyor · ${gate.failed} hata · ${gate.total} toplam</p>
        <small>${gate.source === "supabase" ? `${gate.answerCount} canlı cevap · ${gate.riskyAnswerCount} riskli` : `Bucket: ${gate.uploadBucket}${gate.uploadConfigured ? "" : " · Supabase config bekleniyor"}`}</small>
      </div>
    `
  });
}

function renderPermissions(onNavigate) {
  const main = element("main", { className: "phase2-main permissions-roles-main" });
  main.append(
    permissionsRolesHeader(onNavigate),
    permissionsRolesProfileCard(),
    permissionsRolesSummaryCard(),
    permissionsRolesListCard(),
    permissionsRolesInfoCard(),
    button(`${icons.key}<span>Yetki Talebi Oluştur</span>${icons.arrow}`, "permissions-request-button", () => onNavigate("help"), "Yetki Talebi Oluştur", true)
  );
  return main;
}

function permissionsRolesHeader(onNavigate) {
  const header = element("header", { className: "permissions-roles-header" });
  header.append(
    button(icons.arrowLeft, "permissions-back-button", () => onNavigate("profile"), "Profile dön", true),
    element("div", {
      className: "permissions-title-lockup",
      html: "<h1>Yetkilerim / Rol Detayı</h1><p>Kendi erişim yetkilerinizi görüntüleyin.</p>"
    }),
    button(`${icons.bell}<b>${technicianProfile.notificationCount}</b>`, "permissions-bell-button", () => onNavigate("notifications"), "Bildirimler", true)
  );
  return header;
}

function permissionsRolesProfileCard() {
  return element("section", {
    className: "permissions-profile-card permissions-card",
    html: `
      <div class="permissions-avatar-figure">${icons.user}</div>
      <div class="permissions-profile-copy">
        <h2>${permissionRoleSummary.name}</h2>
        <p>${permissionRoleSummary.title}</p>
        <small>${icons.location}${permissionRoleSummary.branch}</small>
      </div>
      <span class="permissions-active-pill"><i></i>Aktif</span>
    `
  });
}

function permissionsRolesSummaryCard() {
  const items = [
    ["check", permissionRoleSummary.activeCount, "Aktif yetki", "success"],
    ["key", permissionRoleSummary.limitedCount, "Kısıtlı yetki", "warning"],
    ["xCircle", permissionRoleSummary.deniedCount, "Yetkisiz", "danger"]
  ];
  const card = element("section", { className: "permissions-summary-card permissions-card" });
  items.forEach(([icon, value, label, tone]) => {
    card.append(element("article", { className: `tone-${tone}`, html: `<span>${icons[icon] ?? icons.alert}</span><strong>${value}</strong><small>${label}</small>` }));
  });
  return card;
}

function permissionsRolesListCard() {
  const iconMap = ["car", "engine", "wrench", "electric", "gauge", "send", "shield"];
  const card = element("section", { className: "permissions-list-card permissions-card" });
  permissionsMatrix.forEach((item, index) => {
    const statusTone = item.tone === "success" ? "success" : item.tone === "warning" ? "warning" : "danger";
    card.append(
      element("button", {
        className: `permissions-row tone-${statusTone}`,
        attrs: { type: "button", "aria-label": item.title },
        html: `<i>${icons[iconMap[index]] ?? icons.shield}</i><strong>${item.title}</strong><span><b></b>${item.status}</span>${icons.arrow}`
      })
    );
  });
  return card;
}

function permissionsRolesInfoCard() {
  return element("section", {
    className: "permissions-info-card permissions-card",
    html: `
      <i>${icons.info}</i>
      <div>
        <p>Yetki değişiklikleri bayi portalı veya müdür onayı ile yapılır.</p>
        <p>Bu ekran sadece görüntüleme amaçlıdır.</p>
      </div>
    `
  });
}

function renderOfflineSync(onNavigate) {
  const main = screenMain("Offline Senkronizasyon", "Cihazda bekleyen kayıtlar", onNavigate, true);
  const status = element("p", { className: "camera-flow-status", text: `${offlineQueue.length} kayıt senkronizasyon bekliyor.` });
  main.append(
    createSection("Bekleyen Kayıtlar", "", [
      listSummary(offlineQueue.map((item) => `${item.title} · ${item.type} · ${item.status}`), "warning"),
      status
    ]),
    actionRow([
      button("Hata Detayı", "secondary-button full-width", () => onNavigate("sync-error")),
      button("Senkronize Et", "primary-button full-width", () => {
        status.textContent = "Demo senkronizasyon tamamlandı; kayıtlar sıradan çıkarıldı.";
      })
    ])
  );
  return main;
}

function renderSyncError(onNavigate) {
  const main = screenMain("Senkronizasyon Hatası", "Yeniden denenecek kayıtlar", onNavigate, true);
  const feedback = element("p", { className: "camera-flow-status", text: "Bağlantı geri geldiğinde otomatik tekrar denenir." });
  main.append(
    bannerCard("Bağlantı sorunu", "Form verisi cihazda korunur, kullanıcı yeniden giriş yapmak zorunda kalmaz.", "red"),
    createSection("Hata Listesi", "", [
      listSummary(syncFailures.map((item) => `${item.title} · ${item.type} · ${item.detail}`), "red"),
      feedback
    ]),
    actionRow([
      button("Offline Kuyruk", "secondary-button full-width", () => onNavigate("offline-sync")),
      button("Tekrar Dene", "primary-button full-width", () => {
        feedback.textContent = "Tekrar deneme kuyruğa alındı.";
      })
    ])
  );
  return main;
}

function renderEmptyState(onNavigate) {
  const main = screenMain("İş Emri Bulunamadı", "Seçili filtreye veya aramaya uygun iş emri bulunamadı", onNavigate, true);
  main.append(
    createSection(emptyStateCopy.title, emptyStateCopy.description, [
      element("div", { className: "empty-state-illustration", html: `<span>${icons.clipboard}</span><strong>${emptyStateCopy.title}</strong><p>${emptyStateCopy.secondaryAction}</p>` })
    ]),
    actionRow([
      button("Filtreleri Temizle", "secondary-button full-width", () => onNavigate("jobs")),
      button("İşlerime Dön", "primary-button full-width", () => onNavigate("jobs"))
    ])
  );
  return main;
}

function renderPhotoApproval(onNavigate) {
  const main = screenMain("Tanı Testleri", "Beyin, Airbag ve Conta", onNavigate, true);
  const photoReady = sessionStorage.getItem("ototrMockPhotoReady") === "true";
  main.append(
    ...(photoReady ? [bannerCard("Kanıt hazır", "Son çekilen kanıt bu modüle bağlanmak üzere hazır.", "success")] : []),
    createSection("Beyin Kontrolü", "OBD/Beyin test maddeleri JSON şemasından alınır.", [formPreviewSection(expertiseModuleForms.brain, 4)]),
    createSection("Airbag", "Airbag Kontrol Testi", [formPreviewSection(expertiseModuleForms.airbag, 3)]),
    createSection("Conta Kaçak Testi", "Conta Kaçak Testi", [formPreviewSection(expertiseModuleForms.conta, 1)]),
    actionRow([
      button("İç / Dış Donanım", "secondary-button full-width", () => {
        recordWorkflowStep("diagnostic_tests_continue", {
          evidenceReady: photoReady,
          workOrderStatus: "diagnostic_tests"
        });
        onNavigate("photoUploadError");
      }),
      button("Eksik Uyarıları Gör", "primary-button full-width", () => {
        recordWorkflowStep("diagnostic_missing_review", {
          evidenceReady: photoReady,
          workOrderStatus: "missing_review"
        });
        onNavigate("missing");
      })
    ])
  );
  return main;
}

function renderPhotoUploadError(onNavigate) {
  const main = screenMain("Donanım ve Yol Testi", "İç / Dış kontroller ve yol testi", onNavigate, true);
  main.append(
    bannerCard("Bağlantı veya kanıt açığı", "Yükleme aksadıysa kayıtlar cihazda kalır. Form verisi korunur.", "red"),
    createSection("İç / Dış Donanım", "Genel Kondisyon / Dış ve İç Ekspertiz grupları birlikte gösterilir.", [
      formPreviewSection(expertiseModuleForms.interiorExterior, 5)
    ]),
    createSection("Yol Testi", "Dyno / Yol Testi", [formPreviewSection(expertiseModuleForms.roadTest, 3)]),
    actionRow([
      button("Tekrar Kanıtla", "secondary-button full-width", () => {
        recordWorkflowStep("photo_upload_retry_requested", {
          workOrderStatus: "evidence_retry"
        });
        onNavigate("evidence");
      }),
      button("Eksik Uyarıları Gör", "primary-button full-width", () => {
        recordWorkflowStep("photo_upload_missing_review", {
          workOrderStatus: "missing_review"
        });
        onNavigate("missing");
      })
    ])
  );
  return main;
}

function renderIssues(onNavigate) {
  const main = screenMain("Eksik ve Uyarılar", "Eksik ve uyarı takibi", onNavigate, true);
  const list = element("div", { className: "stack" });
  issueAlerts.forEach((issue) => list.append(issueCard(issue)));
  main.append(
    createSection("Aktif Uyarılar", "Kritik bulgularda fotoğraf ekleme bu fazda opsiyoneldir.", [list]),
    createSection("Kontrol Özeti", "", checklistItems.map((item) => checklistRow(item.title, item.status, item.tone))),
    actionRow([
      button("Durum Gir", "secondary-button full-width", () => {
        recordWorkflowStep("issues_evidence_requested", {
          issueCount: issueAlerts.length
        });
        onNavigate("tests");
      }),
      button("Engelleyici Eksikler", "primary-button full-width", () => {
        recordWorkflowStep("issues_blockers_requested", {
          blockerCount: blockingIssues.length,
          workOrderStatus: "blocked_by_missing"
        });
        onNavigate("missing");
      })
    ])
  );
  return main;
}

function renderBlockingIssues(onNavigate) {
  const main = screenMain("Rapor Engelleyici Eksik", "İş emri kapanışı öncesi zorunlu çözüm", onNavigate, true);
  const list = element("div", { className: "stack" });
  reportBlockedData.blockers.forEach((issue) => list.append(issueCard(issue)));
  main.append(
    bannerCard("İş emri tamamlanamaz", finalApprovalGate.blockingMessage, "red"),
    createSection("Engelleyici Eksikler", "Bu liste çözülmeden iş emri tamamlanamaz.", [list]),
    createSection("Doğrulama Bekleyen Seçenekler", "", [listSummary(unresolvedSelectedOptions.map((item) => `${item.warningLabel} · ${item.itemTitle}`), "warning")]),
    actionRow([
      button("İlgili Başlığa Git", "secondary-button full-width", () => {
        recordWorkflowStep("blocking_issue_route_requested", {
          blockerCount: reportBlockedData.blockers.length,
          workOrderStatus: "blocked_by_missing"
        });
        onNavigate(reportBlockedData.relatedActionRoute);
      }),
      button("Müşteri Özetine Git", "primary-button full-width", () => {
        recordWorkflowStep("blocking_customer_summary_requested", {
          blockerCount: reportBlockedData.blockers.length
        });
        onNavigate("customer-summary");
      })
    ])
  );
  return main;
}

function renderMissingIssues(onNavigate) {
  const order = getSelectedWorkOrder();
  const normalizeTone = (value) => {
    const raw = String(value || "").toLowerCase();
    if (raw === "red" || raw === "critical" || raw === "kritik") return "critical";
    if (raw === "warning" || raw === "alert" || raw === "uyarı" || raw === "uyari") return "warning";
    if (raw === "success" || raw === "resolved" || raw === "cozuleldi" || raw === "çözüldü") return "resolved";
    return raw || "warning";
  };

  const normalizeSeverity = (value) => {
    const raw = String(value || "").toLowerCase();
    return raw === "yüksek" || raw === "high" || raw === "kritik" || raw === "critical" ? "Kritik"
      : raw === "orta" || raw === "warning" ? "Uyarı"
        : raw === "çözüldü" || raw === "cozuleldi" || raw === "resolved" || raw === "success" ? "Çözüldü"
          : "Kritik";
  };

  const moduleIssueDefaultPhoto = {
    "Kaporta": "./src/assets/design-reference/issues-alerts/issue-bumper.png",
    "Fren": "./src/assets/design-reference/issues-alerts/issue-brake.png",
    "Lastikler": "./src/assets/design-reference/issues-alerts/issue-tire.png",
    "İç Mekan": "./src/assets/design-reference/issues-alerts/issue-seat.png",
    "Aydınlatma": "./src/assets/design-reference/issues-alerts/issue-headlight.png",
    default: "./src/assets/design-reference/issues-alerts/issue-bumper.png"
  };

  const issues = [
    { order: getRuntimeWorkOrders()[0], title: "Sol Ön Lastik Aşınmış", detail: "Diş derinliği yasal sınırın altında.", module: "Lastikler", route: "tests", tone: "critical", severity: "Kritik", badge: "Eksik", photo: moduleIssueDefaultPhoto["Lastikler"], evidence: "Fotoğraf Ekle", date: "12.05.2025 09:24" },
    { order: getRuntimeWorkOrders()[0], title: "Ön Fren Diskleri Aşınmış", detail: "Fren disk yüzeyi aşınma sınırının altında.", module: "Fren", route: "photoApproval", tone: "critical", severity: "Kritik", badge: "Eksik", photo: moduleIssueDefaultPhoto["Fren"], evidence: "Fotoğraf Ekle", date: "12.05.2025 09:18" },
    { order: getRuntimeWorkOrders()[0], title: "Arka Tampon Boya Çizgisi", detail: "Boya çizik ve lokal onarım gerektiriyor.", module: "Kaporta", route: "tests", tone: "warning", severity: "Uyarı", badge: "Uyarı", photo: moduleIssueDefaultPhoto["Kaporta"], evidence: "1 Fotoğraf", done: true, date: "12.05.2025 09:12" },
    { order: getRuntimeWorkOrders()[0], title: "Sürücü Koltuk Döşemesi", detail: "Döşemede yıpranma ve deformasyon var.", module: "İç Mekan", route: "tests", tone: "warning", severity: "Uyarı", badge: "Uyarı", photo: moduleIssueDefaultPhoto["İç Mekan"], evidence: "Fotoğraf Ekle", date: "12.05.2025 09:10" },
    { order: getRuntimeWorkOrders()[0], title: "Sağ Ön Far Ayar", detail: "Far yükseklik ayarı uygun değil.", module: "Aydınlatma", route: "summary", tone: "resolved", severity: "Çözüldü", badge: "Çözüldü", photo: moduleIssueDefaultPhoto["Aydınlatma"], evidence: "2 Fotoğraf", done: true, date: "12.05.2025 08:55" }
  ].map((issue) => ({
    ...issue,
    tone: normalizeTone(issue.tone),
    severity: normalizeSeverity(issue.severity),
    photo: issue.photo || moduleIssueDefaultPhoto.default,
    badge: issue.badge || (normalizeTone(issue.tone) === "critical" ? "Eksik" : normalizeTone(issue.tone) === "warning" ? "Uyarı" : "Çözüldü")
  }));

  const issueCounts = issues.reduce((acc, issue) => {
    acc.all += 1;
    acc[issue.tone] = (acc[issue.tone] || 0) + 1;
    return acc;
  }, { all: 0, critical: 0, warning: 0, resolved: 0 });

  const filters = [
    ["all", `Tümü (${issueCounts.all})`],
    ["critical", `Eksik (${issueCounts.critical})`],
    ["warning", `Uyarı (${issueCounts.warning})`],
    ["resolved", `Çözülen (${issueCounts.resolved})`]
  ];
  let activeFilter = "all";
  let criticalOnly = false;

  const main = element("main", { className: "phase2-main missing-alerts-screen" });
  const filterTabs = element("div", { className: "missing-alerts-tabs", attrs: { role: "tablist", "aria-label": "Eksik uyarı filtreleri" } });
  const list = element("section", { className: "missing-alerts-list", attrs: { "aria-live": "polite" } });
  const filterButton = button(`${icons.filter}<span>Filtrele</span><i></i>`, "missing-alerts-filter-button", () => {
    criticalOnly = !criticalOnly;
    filterButton.classList.toggle("is-active", criticalOnly);
    filterButton.setAttribute("aria-pressed", criticalOnly ? "true" : "false");
    renderList();
  }, "Kritik filtreyi aç veya kapat", true);
  filterButton.setAttribute("aria-pressed", "false");
  const primaryAction = button(`<span>İşleme Devam Et</span>${icons.arrow}`, "missing-alerts-primary-action", () => {
    const first = filteredIssues()[0];
    if (first) {
      setSelectedWorkOrder(first.order);
      onNavigate(first.route);
    }
  }, "Eksikleri gider", true);

  const tabButtons = filters.map(([key, label]) => {
    const tab = button(label, "missing-alerts-tab", () => {
      activeFilter = key;
      tabButtons.forEach((item) => {
        item.classList.toggle("is-active", item.dataset.filter === activeFilter);
        item.setAttribute("aria-selected", item.dataset.filter === activeFilter ? "true" : "false");
      });
      renderList();
    }, `${label} filtresi`);
    tab.dataset.filter = key;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", key === activeFilter ? "true" : "false");
    tab.classList.toggle("is-active", key === activeFilter);
    filterTabs.append(tab);
    return tab;
  });

  function filteredIssues() {
    const applyCriticalFilter = activeFilter === "all" && criticalOnly;
    return issues.filter((issue) => {
      const matchesTab = activeFilter === "all" || issue.tone === activeFilter;
      const matchesCritical = !applyCriticalFilter || issue.tone === "critical";
      return matchesTab && matchesCritical;
    });
  }

  function renderList() {
    const visibleIssues = filteredIssues();
    list.innerHTML = "";
    if (!visibleIssues.length) {
      list.append(
        element("article", {
          className: "missing-alerts-empty",
          html: `<span>${icons.check}</span><strong>Bu filtrede uyarı yok</strong><p>Filtreleri değiştirerek diğer eksik ve uyarıları görüntüleyebilirsiniz.</p>`
        })
      );
      return;
    }
    visibleIssues.forEach((issue) => {
      const card = button("", `missing-alerts-card tone-${issue.tone} missing-issue-action`, () => {
        setSelectedWorkOrder(issue.order);
        recordWorkflowStep("missing_issue_action_selected", {
          currentOrderId: issue.order.id,
          currentPlate: issue.order.plate,
          selectedIssue: issue.title,
          selectedFilter: activeFilter,
          workOrderStatus: "missing_action"
        });
        onNavigate(issue.route);
      }, `${issue.title} aksiyonuna git`);
      card.innerHTML = `
        <span class="missing-alerts-thumb"><img src="${issue.photo}" alt=""><b>${issue.severity}</b></span>
        <span class="missing-alerts-copy">
          <strong>${issue.title}</strong>
          <em>${issue.detail}</em>
          <small>${icons.clipboard}${issue.module}</small>
          <small>${issue.date} <i>•</i> ${issue.module}</small>
        </span>
        <span class="missing-alerts-side">
          <i>${issue.badge}</i>
          <span class="missing-alerts-evidence ${issue.done ? "is-done" : ""}">${issue.done ? `<img src="${issue.photo}" alt=""><b>${icons.check}</b>` : icons.camera}<small>${issue.evidence}</small></span>
          ${icons.arrow}
        </span>
      `;
      list.append(card);
    });
  }

  const header = element("header", { className: "missing-alerts-header" });
  header.append(
    button(icons.arrowLeft, "missing-alerts-back", () => onNavigate("job-detail"), "Geri dön", true),
    element("div", { className: "missing-alerts-heading", html: "<h1>Eksik / Uyarı Listesi</h1><p>İş Emri No: IE-2025-000123</p>" }),
    button(`${icons.bell}<b>${technicianProfile.notificationCount}</b>`, "missing-alerts-bell", () => onNavigate("notifications"), "Bildirimler", true)
  );

  main.append(
    header,
    element("section", {
      className: "missing-alerts-vehicle-card",
      html: `
        <div class="missing-alerts-plate"><span>TR</span><strong>${order.plate}</strong></div>
        <h2>${order.brandModel}</h2>
        <p>${order.year || "2019"} <i>•</i> ${order.packageName || "320i"} <i>•</i> Benzin <i>•</i> Otomatik</p>
        <small>${order.km || "45.000 km"}</small>
        <div class="missing-alerts-progress"><em>İlerleme</em><b>75%</b><small>Tamamlandı</small></div>
        <img src="${getVehicleImagePath(order)}" alt="${order.brandModel}">
      `
    }),
    element("section", {
      className: "missing-alerts-stats",
      html: `
        <article>${icons.alert}<span>Toplam</span><strong>${issueCounts.all}</strong><small>Madde</small></article>
        <article>${icons.warning}<span>Eksik (Kırmızı)</span><strong>${issueCounts.critical}</strong><small>Kritik</small></article>
        <article>${icons.info}<span>Uyarı (Sarı)</span><strong>${issueCounts.warning}</strong><small>Önemli</small></article>
        <article>${icons.check}<span>Çözülen</span><strong>${issueCounts.resolved}</strong><small>Madde</small></article>
      `
    }),
    element("section", { className: "missing-alerts-filter-row" }),
    list,
    element("p", { className: "missing-alerts-footnote", html: `${icons.info}<span>Eksikleri giderdikten sonra tekrar kontrol edip durumunu güncelleyiniz.</span>` }),
    element("section", { className: "missing-alerts-actions" })
  );
  main.querySelector(".missing-alerts-filter-row").append(filterTabs, filterButton);
  main.querySelector(".missing-alerts-actions").append(
    button(`${icons.report}<span>Rapor Önizle</span>`, "missing-alerts-secondary-action", () => onNavigate("summary"), "Rapor önizle", true),
    button(`${icons.clipboard}<span>Not Ekle</span>`, "missing-alerts-note-action", () => onNavigate("itemDetail"), "Not ekle", true),
    primaryAction
  );
  renderList();
  return main;
}

function renderCustomerSummary(onNavigate) {
  const main = screenMain("Müşteri Özeti", `${customerSummaryData.customer} / ${customerSummaryData.branch}`, onNavigate, true);
  main.append(
    createSection(customerSummarySections[0], "", [
      summaryTileGrid([
        ["Araç", customerSummaryData.vehicle],
        ["Paket", highlightedWorkOrder.paket],
        [customerSummarySections[4], `${customerSummaryData.photoCount}`],
        ["Rapor No", finalReportPreviewData.reportNo]
      ])
    ]),
    createSection(customerSummarySections[1], "", [listSummary([customerSummaryData.internalNote], "neutral")]),
    createSection("Tamamlanan Modüller", "", [
      listSummary(finalReportPreviewData.completedModules.map((module) => `${module.title} · ${module.status}`), "success")
    ]),
    createSection("Eksik Kalan Modüller", "", [
      listSummary(finalReportPreviewData.incompleteModules.map((module) => `${module.title} · ${module.status}`), "warning")
    ]),
    createSection(customerSummarySections[2], "", [
      listSummary(customerSummaryData.criticalFindings, "red"),
      listSummary(unresolvedSelectedOptions.map((item) => `${item.warningLabel} · ${item.itemTitle}`), "warning")
    ]),
    createSection(customerSummarySections[3], "", [listSummary(customerSummaryData.goodFindings, "success")]),
    createSection(customerSummarySections[5], "", [listSummary(["Önizle ile final raporu kontrol edin.", "Düzenle ile iş emri detayına dönün."], "neutral")]),
    actionRow([
      button("Önizle", "secondary-button full-width", () => {
        recordWorkflowStep("customer_summary_preview_requested", {
          reportNo: finalReportPreviewData.reportNo
        });
        onNavigate("summary");
      }),
      button("Düzenle", "primary-button full-width", () => {
        recordWorkflowStep("customer_summary_edit_requested", {
          reportNo: finalReportPreviewData.reportNo
        });
        onNavigate("job-detail");
      })
    ])
  );
  return main;
}

function renderFinalReportPreview(onNavigate) {
  refreshTechnicalApprovalGateForCurrentOrder();
  refreshFinalReportForCurrentOrder();
  const order = getSelectedWorkOrder();
  const liveReport = getCachedFinalReport(order.expertiseCaseId || order.id);
  const main = screenMain("Final Rapor Önizleme", `${finalReportPreviewData.reportNo} / ${finalReportPreviewData.revision}`, onNavigate, true);
  const evidenceGate = getEvidenceApprovalGate();
  const closeState = getFinalReportCloseState(liveReport, evidenceGate);
  main.append(
    reportScoreCard(liveReport, closeState),
    createSection("Rapor Bölümleri", "İş emri kapanışı öncesi son kontrol.", [reportSectionGrid(liveReport, closeState)]),
    ...(liveReport ? [
      createSection("Canlı Rapor Taslağı", "Backend final rapor payload özeti.", [liveFinalReportSummary(liveReport, closeState)])
    ] : []),
    createSection("Kanıt Galerisi", "Storage yükleme durumu rapor önizlemesine bağlandı.", [
      evidenceReportSummary(evidenceGate),
      evidenceCaptureList(evidenceGate.captures)
    ]),
    createSection("Kaporta Boya Özeti", "", [panelGrid()]),
    createSection("Alan Doğrulama Notları", "", [listSummary(fieldValidationHints.map((item) => `${item.label} · ${item.rule}`), "warning")]),
    createSection("Kritik Uyarılar", "", [listSummary(finalApprovalWarnings.map((item) => `${item.title} · ${item.module}`), "red")]),
    createSection("Doğrulama Bekleyen Seçenekler", "", [listSummary(unresolvedSelectedOptions.map((item) => `${item.warningLabel} · ${item.itemTitle}`), "warning")]),
    ...(evidenceGate.canSubmit ? [] : [
      createSection("Tamamlama Blokajları", "Eksik modül veya eksik kanıt varken iş emri kapatılamaz.", [
        extraChecklist(evidenceGate.blockers.length ? evidenceGate.blockers : [["Kanıt kontrolü bekliyor", "warning"]])
      ])
    ]),
    actionRow([
      button("Eksikleri Gör", "secondary-button full-width", () => {
        recordWorkflowStep("final_report_blockers_requested", {
          reportNo: finalReportPreviewData.reportNo,
          workOrderStatus: "blocked_by_missing"
        });
        onNavigate("blockingIssues");
      }),
      button("İş Emrini Tamamla", "primary-button full-width", async () => {
        await refreshTechnicalApprovalGateForCurrentOrder();
        const currentGate = getEvidenceApprovalGate();
        const hasVisualBlockers = finalApprovalWarnings.length > 0 || unresolvedSelectedOptions.length > 0;
        const gateAllowsSubmit = currentGate.source === "supabase"
          ? currentGate.canSubmit
          : currentGate.canSubmit;
        const canSubmit = gateAllowsSubmit && !hasVisualBlockers;
        const order = getSelectedWorkOrder();
        const finalReportResult = canSubmit
          ? await refreshFinalReportForCurrentOrder({ lockReport: true })
          : { ok: false, status: "blocked" };
        const statusResult = canSubmit
          ? await transitionLiveWorkOrderStatusWithTimeout({
            expertiseCaseId: order.expertiseCaseId || order.id,
            nextStatus: "completed",
            reason: "Mobil final rapor tamamlandı ve iş emri kapatıldı."
          }).catch((error) => ({
            ok: false,
            status: "error",
            reason: error?.message || "Canlı durum güncellemesi tamamlanamadı."
          }))
          : { ok: false, status: "blocked" };
        recordWorkflowStep(canSubmit ? "final_report_completed_directly" : "final_report_blocked", {
          reportNo: finalReportPreviewData.reportNo,
          canCloseWorkOrder: canSubmit,
          blockerCount: finalApprovalWarnings.length,
          unresolvedOptionCount: unresolvedSelectedOptions.length,
          gateSource: currentGate.source,
          answerCount: currentGate.answerCount,
          riskyAnswerCount: currentGate.riskyAnswerCount,
          notDoneAnswerCount: currentGate.notDoneAnswerCount,
          uploadedEvidenceCount: currentGate.uploaded,
          pendingEvidenceCount: currentGate.pending,
          failedEvidenceCount: currentGate.failed,
          liveStatusUpdated: Boolean(statusResult.ok),
          liveStatusResult: statusResult.status,
          liveRemoteStatus: statusResult.remoteStatus || "",
          finalReportGenerated: Boolean(finalReportResult.ok),
          finalReportResult: finalReportResult.status,
          finalReportStatus: finalReportResult.finalReport?.status || "",
          workOrderStatus: canSubmit ? "completed" : "blocked_by_missing"
        });
        onNavigate(canSubmit ? "completed" : "blockingIssues");
      })
    ])
  );
  return main;
}

function renderTechnicalApprovalQueue(onNavigate) {
  const main = screenMain("Rapor Kapanış Kuyruğu", "Hazırlanan ve tamamlanan raporlar", onNavigate, true);
  const list = element("div", { className: "stack" });
  technicalApprovalQueue.forEach((item) => {
    list.append(
      element("article", {
        className: "section-card issue-card",
        html: `<div class="module-detail-head"><strong>${item.reportNo}</strong><span class="status-chip tone-${item.tone}">${item.status}</span></div><p>${item.vehicle} · ${item.plate} · ${item.package}</p><small>${item.technician} · ${item.date} · ${item.warningCount} uyarı</small>`
      })
    );
  });
  main.append(
    createSection("Rapor Listesi", "", [list]),
    actionRow([
      button("Rapor Detayı", "secondary-button full-width", () => onNavigate("reports")),
      button("Kilitli Raporu Gör", "primary-button full-width", () => onNavigate("summary"))
    ])
  );
  return main;
}

function renderTechnicalApprovalDetail(onNavigate) {
  const main = screenMain("Rapor Kapanış Detayı", `${technicalApprovalDetail.reportNo} / ${technicalApprovalDetail.status}`, onNavigate, true);
  main.append(
    createSection("Rapor Bölümleri", "", [listSummary(technicalApprovalDetail.sections, "neutral")]),
    createSection("Kritik Bulgular", "", [listSummary(customerSummaryData.criticalFindings, "red")]),
    createSection("Fotoğraf Notları", "", [listSummary(technicalApprovalDetail.missingEvidence.map((item) => item.title), "warning")]),
    createSection("Çözümsüz Option Label Uyarıları", "", [listSummary(technicalApprovalDetail.unresolvedWarnings.map((item) => `${item.warningLabel} · ${item.itemTitle}`), "warning")]),
    createSection("Fotoğraf / Kanıt Kontrolü", "", [listSummary(evidenceSlots.map((slot) => `${slot.title} · ${slot.status}`), "neutral")]),
    actionRow([
      button("Eksikleri Gör", "secondary-button full-width", () => onNavigate("missing")),
      button("Raporu Gör", "primary-button full-width", () => onNavigate("summary"))
    ])
  );
  return main;
}

function renderHelpCenter(onNavigate) {
  const main = screenMain("Yardım Merkezi", "Usta destek ve işlem rehberi", onNavigate, true);
  main.append(
    createSection("Hızlı Yardım", "", [
      listSummary([
        "Başlama kanıtı: Şasi, plaka ve KM fotoğrafı zorunlu.",
        "Eksik test: Eksikler ekranından ilgili modüle dön.",
        "Tamamlama: Teknisyen tüm modülleri ve kanıtları kapatmadan işi bitiremez.",
        "Destek: Şube müdürü veya teknik destek hattı üzerinden talep aç."
      ], "neutral")
    ]),
    actionRow([
      button("Eksikleri Gör", "secondary-button full-width", () => onNavigate("missing")),
      button("Profil", "primary-button full-width", () => onNavigate("profile"))
    ])
  );
  return main;
}

function renderReportsHistory(onNavigate) {
  const main = screenMain("Rapor Geçmişi", "Tamamlanan ve işlemdeki kayıtlar", onNavigate, true);
  main.append(
    createSection("Raporlar", "", [listSummary(reportHistory.map((item) => `${item.title} · ${item.detail}`), "neutral")]),
    createSection("Rapor Durumu", "", [
      listSummary(technicalApprovalQueue.map((item) => `${item.reportNo} · ${item.status} · ${item.plate}`), "warning")
    ]),
    actionRow([
      button("Özet", "secondary-button full-width", () => onNavigate("summary")),
      button("İptal Edilen İş", "secondary-button full-width", () => onNavigate("cancelled-job")),
      button("İşlerim", "primary-button full-width", () => onNavigate("jobs"))
    ])
  );
  return main;
}

function renderRevisionRequested(onNavigate) {
  const main = screenMain("Düzeltme İstendi", revisionRequestData.reportNo, onNavigate, true);
  main.append(
    bannerCard("Kapanış kontrolü notu", revisionRequestData.reviewerNote, "warning"),
    createSection("Düzeltilecek Başlıklar", "", [listSummary(revisionRequestData.sectionsToRevise, "warning")]),
    createSection("Eksik Fotoğraflar", "", [listSummary(revisionRequestData.missingPhotos, "red")]),
    createSection("Eksik Açıklamalar", "", [listSummary(revisionRequestData.missingDescriptions, "warning")]),
    createSection("Çözümsüz Seçenek Uyarıları", "", [listSummary(revisionRequestData.unresolvedWarnings.map((item) => `${item.warningLabel} · ${item.itemTitle}`), "warning")]),
    actionRow([
      button("İşaretli Başlıklara Git", "secondary-button full-width", () => onNavigate("missing")),
      button("Düzeltme Detayını Gör", "secondary-button full-width", () => onNavigate("technical-revision-request")),
      button("Tekrar Düzenle", "primary-button full-width", () => onNavigate("job-detail"))
    ])
  );
  return main;
}

function renderApprovalWaiting(onNavigate) {
  recordWorkflowStep("work_order_completed_viewed", {
    reportNo: approvalSentWaitingData.reportNo,
    workOrderStatus: "completed"
  });
  const main = screenMain("İş Emri Tamamlandı", `${approvalSentWaitingData.reportNo} / ${approvalSentWaitingData.status}`, onNavigate, true);
  main.append(
    bannerCard("Rapor kilitlendi", "İlgili başlıklar salt okunur durumdadır. Basım ve teslim işlemi bayi portalından yapılır.", "success"),
    createSection("Kapanış Durumu", "", [
      summaryTileGrid([
        ["Durum", approvalSentWaitingData.status],
        ["Rapor", approvalSentWaitingData.estimatedReviewTime],
        ["Geri Çek", approvalSentWaitingData.canWithdraw ? "Açık" : "Kapalı"],
        ["Görüntüle", approvalSentWaitingData.canView ? "Açık" : "Kapalı"]
      ])
    ]),
    actionRow([
      button("Rapor Geçmişi", "secondary-button full-width", () => {
        recordWorkflowStep("completed_reports_requested", {
          reportNo: approvalSentWaitingData.reportNo,
          workOrderStatus: "completed"
        });
        onNavigate("reports");
      }),
      button("Kilitli Raporu Gör", "secondary-button full-width", () => onNavigate("approved-locked-report")),
      button("İşlerime Dön", "primary-button full-width", () => {
        recordWorkflowStep("completed_jobs_requested", {
          reportNo: approvalSentWaitingData.reportNo,
          workOrderStatus: "completed"
        });
        onNavigate("jobs");
      })
    ])
  );
  return main;
}

function renderReportApproved(onNavigate) {
  const main = screenMain(reportApprovedData.statusTitle, `${reportApprovedData.reportNo} / ${reportApprovedData.approvedAt}`, onNavigate, true);
  main.append(
    bannerCard(reportApprovedData.completionLabel, `Kayıt: ${reportApprovedData.reviewer}`, "success"),
    createSection("Paylaşım Hazırlığı", "", [listSummary(reportApprovedData.shareActions, "success")]),
    createSection("Rapor Geçmişi", "", [listSummary(reportHistory.map((item) => `${item.title} · ${item.detail}`), "neutral")]),
    actionRow([
      button("Rapor Geçmişine Dön", "secondary-button full-width", () => onNavigate("reports")),
      button("Kilitli Raporu Gör", "secondary-button full-width", () => onNavigate("approved-locked-report")),
      button("Müşteri Özeti", "primary-button full-width", () => onNavigate("customer-summary"))
    ])
  );
  return main;
}

function renderSummary(onNavigate) {
  const order = getSelectedWorkOrder();
  const statusLabel = "Tamamlandı";
  const tone = order.status === "completed" ? "success" : "warning";
  const main = screenMain("Rapor Özeti", `${order.plate} / ${statusLabel}`, onNavigate, true);
  main.append(
    bannerCard(statusLabel, "Teknisyen burada tamamlanan iş emrinin özetini ve kilitli raporu görür.", tone),
    createSection("Araç Bilgileri", "", [
      summaryTileGrid([
        ["Plaka", order.plate],
        ["Araç", order.brandModel],
        ["VIN", order.vin],
        ["KM", order.km],
        ["İlerleme", `%${order.progress}`],
        ["Eksik", order.missingCount > 0 ? `${order.missingCount} eksik` : "Yok"]
      ])
    ]),
    createSection("Test İlerleme Özeti", "", [
      listSummary(["Kaporta / Boya tamamlandı", "Motor ve mekanik kontrol edildi", "Fotoğraf sayısı: 18", "Başlama kanıtı görüntülenebilir"], order.missingCount > 0 ? "warning" : "success")
    ]),
    actionRow([
      button("Başlama Kanıtı Görüntüle", "secondary-button full-width", () => onNavigate("start-proof")),
      button("Rapor Oluştur", "secondary-button full-width", () => onNavigate("report-created")),
      button("Kilitli Raporu Gör", "secondary-button full-width", () => onNavigate("approved-locked-report")),
      button("İşlerime Dön", "primary-button full-width", () => onNavigate("jobs"))
    ])
  );
  return main;
}

function renderNotifications(onNavigate) {
  const main = screenMain("Bildirimler", "İş emri, eksik kanıt ve teknik süreç uyarıları", onNavigate, true);
  const list = element("section", { className: "premium-notification-list" });
  const feedback = element("p", { className: "camera-flow-status", text: `${notificationsFeed.length} bildirim listeleniyor.` });
  notificationsFeed.forEach((item) => list.append(notificationCard(item, onNavigate)));
  const clearButton = button("Tüm Bildirimleri Temizle", "secondary-button full-width", () => {
    list.replaceChildren(
      element("article", {
        className: "section-card empty-state-illustration",
        html: `<span>${icons.check}</span><strong>Bildirim yok</strong><p>Tüm bildirimler demo oturumu için temizlendi.</p>`
      })
    );
    feedback.textContent = "Bildirimler temizlendi.";
    clearButton.setAttribute("disabled", "disabled");
  });
  main.append(
    statusTabs(),
    list,
    feedback,
    clearButton
  );
  return main;
}

function renderProfile(onNavigate) {
  const main = element("main", { className: "phase2-main profile-settings-main" });
  const logoutModal = profileLogoutModal(onNavigate);
  main.append(
    profileSettingsHeader(onNavigate),
    profileHeroCard(),
    profileStatsCard(),
    profileSettingsSection("Hesap Ayarları", [
      ["Kişisel Bilgilerim", "Ad, soyad, iletişim ve kimlik bilgileri", "user", "profile"],
      ["Şifre & Güvenlik", "Şifre değiştir, iki adımlı doğrulama", "key", "reset-password"],
      ["Bildirim Tercihleri", "Bildirim ayarlarını yönet", "bell", "notifications"],
      ["Dil Seçimi", "Uygulama dili tercihi", "globe", "profile", "Türkçe"]
    ], onNavigate),
    profileSettingsSection("Uygulama Ayarları", [
      ["Görünüm", "Açık / Koyu tema seçimi", "sliders", "profile", "Açık", "pill"],
      ["Fotoğraf & Kamera Ayarları", "Kamera kalitesi ve depolama ayarları", "camera", "profile"],
      ["Rapor Ayarları", "Rapor şablonları ve içerik tercihleri", "report", "reports"],
      ["Senkronizasyon", "Veri senkronizasyon ayarları", "sync", "offline-sync", "Otomatik"]
    ], onNavigate),
    profileSettingsSection("Destek & Hakkında", [
      ["Yardım & Destek", "Sık sorulan sorular ve destek", "info", "help"],
      ["Bize Ulaşın", "İletişim kanallarımız", "headset", "help"],
      ["Sürüm Bilgisi", "Uygulama versiyonu ve yenilikler", "info", "profile", technicianProfile.appVersion],
      ["Kullanım Koşulları & Gizlilik Politikası", "Koşullar ve gizlilik detayları", "shield", "profile"]
    ], onNavigate),
    profileLogoutCard(() => logoutModal.classList.add("is-open")),
    logoutModal
  );
  return main;
}

function homeReferenceHeader(onNavigate) {
  const header = element("header", { className: "home-ref-header" });
  header.append(
    element("img", {
      className: "home-ref-logo",
      attrs: { src: "./src/assets/home-reference/ototr-logo.png", alt: "OTOTR Tarafsız Araç Ekspertizi" }
    }),
    button(`${icons.bell}<b>3</b>`, "home-ref-bell", () => onNavigate("notifications"), "Bildirimler", true)
  );
  return header;
}

function homeReferenceProfile() {
  const section = element("section", { className: "home-ref-profile" });
  section.append(
    element("img", {
      className: "home-ref-avatar",
      attrs: { src: "./src/assets/home-reference/technician-avatar.png", alt: "Ahmet Usta" }
    }),
    element("div", {
      className: "home-ref-profile-copy",
      html: `<h1>Merhaba, Ahmet Usta</h1><p>Ekspertiz Teknisyeni</p><div><span>${icons.calendar}14 Mayıs 2025, Çarşamba</span><span>${icons.building}İstanbul Kadıköy Şubesi</span></div>`
    })
  );
  return section;
}

function homeReferenceKpis() {
  const items = [
    { icon: "clipboard", value: "8", label: "Aktif İş Emri", tone: "red", progress: 58 },
    { icon: "check", value: "5", label: "Bugün Tamamlanan", tone: "success", progress: 0 },
    { icon: "alert", value: "2", label: "Eksik / Uyarı", tone: "warning", progress: 0 },
    { icon: "shield", value: "3", label: "Tamamlanan", tone: "info", progress: 0 }
  ];
  const grid = element("section", { className: "home-ref-kpis" });
  items.forEach((item) => {
    const card = element("article", { className: `home-ref-kpi tone-${item.tone}` });
    card.append(iconWrap(item.icon), element("strong", { text: item.value }), element("span", { text: item.label }));
    if (item.progress) card.append(element("i", { html: `<b style="width:${item.progress}%"></b>` }));
    grid.append(card);
  });
  return grid;
}

function homeReferenceFeatured(onNavigate) {
  const wrap = element("section", { className: "home-ref-block" });
  wrap.append(homeReferenceSectionTitle("Öne Çıkan İş Emri", "Tümünü Gör", () => onNavigate("jobs")));
  const card = element("article", { className: "home-ref-featured-card" });
  card.append(
    element("div", {
      className: "home-ref-featured-copy",
      html: `<div class="home-ref-plate"><span>TR</span><strong>16 ABC 123</strong></div><h2>BMW 3 Serisi</h2><p>2019 · 320i · 45.000 km</p><em>Devam Ediyor</em>`
    }),
    element("img", {
      className: "home-ref-car",
      attrs: { src: "./src/assets/home-reference/featured-car.png", alt: "BMW 3 Serisi" }
    }),
    homeReferenceRing(65),
    button("Devam Et", "home-ref-primary", () => onNavigate("job-detail"))
  );
  wrap.append(card);
  return wrap;
}

function homeReferencePlan(onNavigate) {
  const rows = [
    ["10:00", "34 DFG 456", "Volkswagen Passat", "Tamamlandı", "success", "./src/assets/home-reference/plan-car-1.png"],
    ["13:00", "35 KLM 789", "Renault Megane", "Devam Ediyor", "warning", "./src/assets/home-reference/plan-car-2.png"],
    ["15:30", "16 HJK 321", "Peugeot 508", "Planlandı", "info", "./src/assets/home-reference/plan-car-3.png"]
  ];
  const wrap = element("section", { className: "home-ref-block" });
  wrap.append(homeReferenceSectionTitle("Bugünkü Plan", "Tüm Planı Gör", () => onNavigate("jobs")));
  const list = element("div", { className: "home-ref-plan-list" });
  rows.forEach(([time, plate, car, status, tone, image]) => {
    list.append(
      element("article", {
        className: "home-ref-plan-row",
        html: `<div><strong>${time}</strong><span>Randevu</span></div><img src="${image}" alt="${car}"><div><b>${plate}</b><span>${car}</span></div><em class="tone-${tone}">${status}</em>`
      })
    );
  });
  wrap.append(list);
  return wrap;
}

function homeReferenceQuickActions(onNavigate) {
  const actions = [
    ["İşe Başla", "clipboard", "start-proof", "", "red"],
    ["Eksikleri Gör", "alert", "missing", "2", "orange"],
    ["Kanıtlar", "camera", "evidence", "", "purple"],
    ["Raporlar", "report", "reports", "", "blue"]
  ];
  const wrap = element("section", { className: "home-ref-block home-ref-actions-block" });
  wrap.append(element("h2", { text: "Hızlı İşlemler" }));
  const grid = element("div", { className: "home-ref-actions" });
  actions.forEach(([label, icon, route, badge, tone]) => {
    const action = button("", `home-ref-action tone-${tone}`, () => onNavigate(route));
    action.append(iconWrap(icon), element("span", { text: label }));
    if (badge) action.append(element("b", { text: badge }));
    grid.append(action);
  });
  wrap.append(grid);
  return wrap;
}

function homeReferenceSectionTitle(title, label, onClick) {
  const row = element("div", { className: "home-ref-section-title" });
  row.append(element("h2", { text: title }), button(`${label} ${icons.arrow}`, "home-ref-link", onClick, label, true));
  return row;
}

function homeReferenceRing(value) {
  return element("div", { className: "home-ref-ring", html: `<strong>%${value}</strong><span>İlerleme</span>` });
}

function premiumGreetingCard(onNavigate) {
  const card = element("section", { className: "premium-greeting-card section-card" });
  card.append(
    iconWrap("user"),
    element("div", {
      className: "premium-greeting-copy",
      html: `<small>Merhaba,</small><h2>${technicianSession.name}</h2><p>${technicianSession.role} · ${technicianSession.activeBranch}</p><span>Bugün 3 randevu, 1 tamamlanmaya hazır iş var</span>`
    }),
    statusBadge(technicianSession.accountStatus, "success")
  );
  return card;
}

function premiumKpiGrid(items) {
  const grid = element("section", { className: "premium-kpi-grid" });
  items.forEach((item) => {
    const card = element("article", { className: `premium-kpi-card tone-${item.tone}` });
    card.append(
      iconWrap(item.icon),
      element("strong", { text: item.value }),
      element("span", { text: item.label }),
      progressLine(item.tone, item.tone === "red" ? 62 : item.tone === "success" ? 86 : 48)
    );
    grid.append(card);
  });
  return grid;
}

function featuredWorkOrderCard(order, onNavigate) {
  const card = element("section", { className: "featured-work-card section-card" });
  card.append(
    element("div", {
      className: "featured-work-copy",
      html: `<small>Öne çıkan iş emri</small><h2>${order.plaka}</h2><p>${order.marka} ${order.model} · ${order["yıl"]} · ${order.kilometre}</p><span>${order["işEmriNo"]} · ${order.bayi}</span>`
    }),
    element("div", { className: "car-visual", html: carSilhouette() }),
    segmentedSemiGauge(order.ilerleme ?? 65, "İlerleme"),
    button("Devam Et", "primary-button full-width", () => onNavigate(order.birincilAksiyon === "İşe Başla" ? "start-proof" : "tests"))
  );
  return card;
}

function jobsKpiStrip(onSelectFilter) {
  const countByFilter = (filter) => getRuntimeWorkOrders().filter((order) => {
    if (filter === "devam") return order.status === "in_progress";
    if (filter === "waiting") return order.status === "waiting_start_proof" || order.status === "start_proof_incomplete";
    if (filter === "eksik") return order.status === "test_missing" || order.status === "returned_for_correction" || order.missingCount > 0;
    if (filter === "technical") return order.status === "technical_review";
    return true;
  }).length;
  const strip = element("section", { className: "jobs-kpi-strip jobs-approved-kpis", attrs: { "aria-label": "İş emri durum özeti" } });
  [
    { label: "Aktif", value: countByFilter("devam"), icon: "clipboard", tone: "info", filter: "devam" },
    { label: "Bekleyen", value: countByFilter("waiting"), icon: "clock", tone: "success", filter: "waiting" },
    { label: "Eksik-Uyarı", value: countByFilter("eksik"), icon: "alert", tone: "orange", filter: "eksik" },
    { label: "Tamamlanan", value: countByFilter("technical"), icon: "shield", tone: "purple", filter: "technical" }
  ].forEach((item) => {
    const card = button("", `jobs-approved-kpi tone-${item.tone}`, () => onSelectFilter?.(item.filter), `${item.label} filtresini aç`);
    card.dataset.filter = item.filter;
    card.append(iconWrap(item.icon), element("span", { text: item.label }), element("b", { text: `${item.value}` }));
    strip.append(card);
  });
  return strip;
}

function detailApprovedHero(order) {
  const card = element("section", { className: "detail-approved-hero section-card" });
  card.append(
    element("div", {
      className: "detail-approved-plate-row",
      html: `<span class="detail-country">TR</span><h2>${order.plaka}</h2>`
    }),
    element("div", {
      className: "detail-approved-vehicle-copy",
      html: `<h3>${order.marka} ${order.model} <span class="status-badge detail-brand-status" data-tone="success">Devam Ediyor</span></h3><p><span>${icons.calendar}${order["yıl"]}</span><span>${icons.engine}${order.paket}</span><span>${icons.gauge}${order.kilometre}</span></p>`
    }),
    element("img", {
      className: "detail-approved-car",
      attrs: { src: "./src/assets/approved-group2/job-car-1.png", alt: `${order.marka} ${order.model}` }
    }),
    detailSpecCards()
  );
  return card;
}

function detailSpecCards() {
  const specs = [
    ["gauge", "Yakıt", "Benzin", "neutral"],
    ["sliders", "Vites", "Otomatik", "purple"],
    ["alert", "Renk", "Beyaz", "neutral"],
    ["briefcase", "Paket", "Full Expert", "red"]
  ];
  const grid = element("section", { className: "detail-spec-grid" });
  specs.forEach(([icon, label, value, tone]) => {
    grid.append(
      element("button", {
        className: `detail-spec-card tone-${tone}`,
        attrs: { type: "button", "aria-label": `${label}: ${value}` },
        html: `${icons[icon]}<span>${label}</span><strong>${value}</strong>${icons.arrow}`
      })
    );
  });
  return grid;
}

function detailConnectedProgress(order) {
  const card = element("section", { className: "detail-connected-progress section-card" });
  card.append(
    detailProgressRing(order.ilerleme ?? 65),
    element("div", {
      className: "detail-progress-flow",
      html: `
        <article class="tone-success">${icons.check}<strong>42/60</strong><span>Tamamlanan</span></article>
        <article class="tone-warning">${icons.alert}<strong>${order["eksikSayısı"]}</strong><span>Eksik / Uyarı</span></article>
        <article class="tone-purple">${icons.shield}<strong>${order["kanıtSayısı"]}</strong><span>Kanıt</span></article>
        <article class="tone-info">${icons.clock}<strong>01:35</strong><span>Süre</span></article>
        <article class="tone-blue">${icons.clipboard}<strong>7</strong><span>Modül</span></article>
      `
    })
  );
  return card;
}

function detailProgressRing(value) {
  const safeValue = Math.min(100, Math.max(0, value));
  const ring = element("div", {
    className: "detail-progress-ring",
    html: `
      <span class="detail-gauge-scale"></span>
      <span class="detail-gauge-needle"></span>
      <strong>%${safeValue}</strong>
    `
  });
  ring.style.setProperty("--progress", `${safeValue * 1.8}deg`);
  ring.style.setProperty("--needle", `${-90 + safeValue * 1.8}deg`);
  return ring;
}

function detailHistoryActions(onNavigate) {
  const grid = element("section", { className: "detail-history-grid" });
  [
    ["calendar", "12 Mart 2025", "Son Ekspertiz Tarihi", "Geçmiş Raporu Gör", "reports", "blue"],
    ["shield", "Ağır Hasar Kaydı Yok", "Son Sorgu: 12 Mart 2025", "Tramer Sorgula", "reports", "green"],
    ["gauge", "Tutarlı", "Son Kayıt: 34.800 km<br>Güncel Giriş: 45.000 km", "KM Sorgula", "reports", "orange"]
  ].forEach(([icon, title, text, action, route, tone]) => {
    const card = button("", `detail-history-card tone-${tone}`, () => onNavigate(route), action);
    card.innerHTML = `<div class="detail-history-top">${icons[icon]}<strong>${title}</strong></div><p>${text}</p><span>${action}${icons.arrow}</span>`;
    grid.append(card);
  });
  return grid;
}

function detailApprovedModules(order, onNavigate) {
  const section = element("section", { className: "detail-approved-modules" });
  section.append(
    element("div", { className: "detail-modules-title", html: `<h2>Görev Modülleri</h2><button type="button">Tümünü Gör ${icons.arrow}</button>` })
  );
  const list = element("div", { className: "detail-module-list section-card" });
  const rows = [
    ["Kaporta Kontrolü", "10/11", "Devam Ediyor", 91, "success", "clipboard", "moduleControl"],
    ["Motor Ekspertizi", "7/10", "Devam Ediyor", 70, "orange", "engine", "statusModal"],
    ["Mekanik Kontrol", "8/10", "Devam Ediyor", 80, "blue", "wrench", "statusModal"],
    ["Elektrik / OBD", "6/8", "Devam Ediyor", 75, "purple", "sliders", "photoApproval"],
    ["Airbag Testi", "5/5", "Tamamlandı", 100, "success", "shield", "photoApproval"],
    ["İç Mekan Kontrolü", "6/8", "Devam Ediyor", 75, "orange", "user", "evidence"],
    ["Test Sürüşü", "1/1", "Tamamlandı", 100, "success", "gauge", "summary"]
  ];
  rows.forEach(([title, ratio, status, progress, tone, icon, route]) => {
    const row = button("", `detail-module-row tone-${tone}`, () => onNavigate(route), `${title} modülünü aç`);
    row.innerHTML = `
      <span class="detail-module-icon">${icons[icon]}</span>
      <strong>${title}</strong>
      <em>${ratio}</em>
      <small>${status}</small>
      <i class="detail-module-progress"><b style="width:${progress}%"></b></i>
      <span class="detail-module-arrow">${icons.arrow}</span>
    `;
    list.append(row);
  });
  section.append(list);
  return section;
}

function moduleProgressList(order, onNavigate) {
  const list = element("section", { className: "premium-module-list" });
  order.moduller.forEach((module) => list.append(moduleCard(module, onNavigate)));
  return list;
}

function moduleFormAccordion(form, count = 4) {
  const wrap = element("div", { className: "module-accordion-group accordion-test-list" });
  form.items.slice(0, count).forEach((item, index) => wrap.append(formItemCard(item, index === 0)));
  return wrap;
}

function bodyPanelHero() {
  const card = element("section", { className: "body-panel-hero section-card" });
  card.append(
    element("div", { className: "panel-tabs", html: "<span>Üstten Görünüm</span><span>Yandan Görünüm</span>" }),
    element("div", { className: "vehicle-map", html: carTopSilhouette() }),
    element("div", {
      className: "selected-panel-card",
      html: `<strong>Sol arka çamurluk</strong><span class="status-chip tone-red">Hasarlı</span><p>Yakın plan kanıt ve usta notu zorunlu.</p>`
    })
  );
  return card;
}

function getFinalReportCloseState(liveReport = null, evidenceGate = getEvidenceApprovalGate()) {
  const payload = liveReport?.payload || {};
  const summary = payload.summary || {};
  const liveGate = payload.gate || {};
  const hasVisualBlockers = finalApprovalWarnings.length > 0 || unresolvedSelectedOptions.length > 0;
  const liveCanSubmit = Boolean(liveGate.canSubmit || summary.canSubmit);
  const effectiveCanSubmit = evidenceGate?.source === "supabase"
    ? Boolean(evidenceGate?.canSubmit) && liveCanSubmit
    : Boolean(evidenceGate?.canSubmit);
  return {
    hasVisualBlockers,
    canClose: effectiveCanSubmit && !hasVisualBlockers,
    evidenceGate,
    liveGate,
    summary
  };
}

function reportScoreCard(liveReport = null, closeState = getFinalReportCloseState(liveReport)) {
  const payload = liveReport?.payload || {};
  const vehicle = payload.vehicle || finalReportPreviewData.vehicleCard;
  const summary = closeState.summary || payload.summary || {};
  const card = element("section", { className: "detail-progress-card section-card" });
  card.append(
    segmentedSemiGauge(closeState.canClose ? 96 : 82, "Rapor Hazırlık Skoru"),
    element("div", {
      className: "featured-work-copy",
      html: `<h2>${finalReportPreviewData.coverTitle}</h2><p>${vehicle.plate || finalReportPreviewData.vehicleCard.plate} · ${vehicle.brandModel || `${vehicle.brand || ""} ${vehicle.model || ""}`.trim() || finalReportPreviewData.vehicleCard.brandModel}</p><span>${liveReport ? `${summary.answerCount || 0} canlı cevap · ${summary.evidenceCount || 0} kanıt · ${liveReport.status || "DRAFT"}` : finalApprovalGate.blockingMessage}</span>`
    })
  );
  return card;
}

function reportSectionGrid(liveReport = null, closeState = getFinalReportCloseState(liveReport)) {
  const summary = closeState.summary || liveReport?.payload?.summary || {};
  const grid = element("section", { className: "report-section-grid" });
  let rows;
  if (liveReport) {
    rows = [
      ["Canl? Cevap", summary.answerCount || 0],
      ["Riskli Madde", summary.riskyAnswerCount || 0],
      ["Kontrol Edilemeyen", summary.notDoneAnswerCount || 0],
      ["Kan?t", summary.evidenceCount || 0],
      ["Gate", closeState.canClose ? "Ge?ti" : "Blokaj"],
      ["Rapor", liveReport.status || "DRAFT"]
    ];
  } else {
    rows = [
      ["M??teri ?zeti", customerSummaryData.customer],
      ["?? Teknik Not", "1 not"],
      ["Kritik Bulgular", customerSummaryData.criticalFindings.length],
      ["?yi Durumlar", customerSummaryData.goodFindings.length],
      ["Foto?raf Say?s?", customerSummaryData.photoCount],
      ["Eksik", `${customerSummaryData.missingItems} alan`]
    ];
  }
  rows.forEach(([label, value]) => {
    grid.append(element("article", { className: "premium-kpi-card compact", html: `<strong>${value}</strong><span>${label}</span>` }));
  });
  return grid;
}

function liveFinalReportSummary(liveReport, closeState = getFinalReportCloseState(liveReport)) {
  const payload = liveReport?.payload || {};
  const workOrder = payload.workOrder || {};
  const vehicle = payload.vehicle || {};
  const summary = closeState.summary || payload.summary || {};
  return extraInfoGrid([
    ["İş Emri", workOrder.workOrderNo || "-"],
    ["Rapor No", workOrder.reportNo || "-"],
    ["Araç", `${vehicle.plate || "-"} / ${vehicle.brand || ""} ${vehicle.model || ""}`.trim()],
    ["Cevap", String(summary.answerCount || 0)],
    ["Kanıt", String(summary.evidenceCount || 0)],
    ["Kapanış Durumu", closeState.canClose ? "Hazır" : "Blokaj var"]
  ]);
}

function notificationCard(item, onNavigate) {
  const card = element("article", { className: `notification-card tone-${item.tone}`, attrs: { role: "button", tabindex: "0" } });
  card.addEventListener("click", () => {
    if (/Düzeltme/i.test(item.title)) {
      onNavigate("technical-revision-request");
      return;
    }
    onNavigate(item.tone === "red" ? "missing" : "job-detail");
  });
  card.append(
    iconWrap(item.tone === "red" ? "alert" : item.tone === "warning" ? "clock" : "bell"),
    element("div", { html: `<small>${item.group} · ${item.time}</small><strong>${item.title}</strong><p>${item.detail}</p>` }),
    element("span", { className: "order-arrow", html: icons.arrow })
  );
  return card;
}

function profileSettingsHeader(onNavigate) {
  const header = element("header", { className: "profile-settings-header" });
  header.append(
    button(icons.arrowLeft, "profile-back-button", () => onNavigate("home"), "Ana sayfaya dön", true),
    element("div", {
      className: "profile-title-lockup",
      html: '<img src="./src/assets/home-reference/ototr-logo.png" alt="OTOTR"><h1>Profil & Ayarlar</h1><p>Hesap bilgileriniz ve uygulama ayarlarınız</p>'
    }),
    button(`${icons.bell}<b>${technicianProfile.notificationCount}</b>`, "profile-bell-button", () => onNavigate("notifications"), "Bildirimler", true)
  );
  return header;
}

function profileHeroCard() {
  return element("section", {
    className: "profile-hero-card profile-glass-card",
    html: `
      <div class="profile-avatar-stack">
        <img class="profile-avatar-photo" src="./src/assets/home-reference/technician-avatar.png" alt="${technicianProfile.name}">
        <span class="profile-camera-chip">${icons.camera}</span>
      </div>
      <div class="profile-hero-copy">
        <h2>${technicianProfile.name}</h2>
        <p>${technicianProfile.title}</p>
        <small>${icons.briefcase}Teknisyen ID: ${technicianProfile.technicianId}</small>
        <small>${icons.report}${technicianProfile.email}</small>
        <small>${icons.phone ?? icons.headset}${technicianProfile.phone}</small>
      </div>
      <div class="profile-performance-box">
        ${icons.shield}
        <strong>${technicianProfile.performanceScore}</strong>
        <span>Performans<br>Puanı</span>
      </div>
    `
  });
}

function logoutToLogin(onNavigate) {
  clearAuthStorage();
  setAuthKeyboardActive(false);
  onNavigate("login");
}

function profileDirectLogoutAction(onNavigate) {
  return button(`${icons.key}<span>Çıkış Yap</span>`, "profile-direct-logout", () => logoutToLogin(onNavigate), "Çıkış Yap", true);
}

function profileStatsCard() {
  const stats = [
    ["clipboard", "Tamamlanan<br>İş Emri", `${technicianProfile.completedOrders}`, "blue"],
    ["check", "Onay Oranı", technicianProfile.approvalRate, "green"],
    ["star", "Müşteri Puanı", technicianProfile.customerRating, "orange"],
    ["gauge", "Günlük Ort.<br>İş Emri", `${technicianProfile.dailyAverageOrders}`, "purple"]
  ];
  const card = element("section", { className: "profile-stats-card profile-glass-card" });
  stats.forEach(([icon, label, value, tone]) => {
    card.append(element("article", { className: `tone-${tone}`, html: `<span>${icons[icon] ?? icons.shield}</span><strong>${value}</strong><small>${label}</small>` }));
  });
  return card;
}

function profileInfoCard() {
  const branch = getStoredBranchName();
  const card = element("section", { className: "profile-info-card section-card" });
  [
    ["Ad Soyad", technicianSession.name || "Ahmet Usta"],
    ["Rol", "Ekspertiz Teknisyeni"],
    ["Şube", branch],
    ["Telefon / E-posta", "ahmet.usta@ototr.test"],
    ["Uygulama Sürümü", "1.0 debug"]
  ].forEach(([label, value]) => {
    card.append(element("article", { html: `<span>${label}</span><strong>${value}</strong>` }));
  });
  return card;
}

function permissionsGrid() {
  const grid = element("section", { className: "permissions-grid" });
  permissionsMatrix.forEach((item) => {
    grid.append(element("article", { className: "profile-menu-row", html: `<strong>${item.title}</strong><span class="status-chip tone-${item.tone}">${item.status}</span>` }));
  });
  return grid;
}

function profileSettingsSection(title, rows, onNavigate) {
  const section = element("section", { className: "profile-settings-section profile-glass-card" });
  section.append(element("h2", { text: title }));
  const list = element("div", { className: "profile-settings-list" });
  rows.forEach(([label, description, icon, route, value = "", tone = "default"]) => {
    list.append(profileMenuButton(label, icon, () => {
      if (route === "branch") setBranchReturnRoute("profile");
      onNavigate(route);
    }, tone, value, description));
  });
  section.append(list);
  return section;
}

function profileMenuButton(label, icon, onClick, tone = "default", value = "", description = "") {
  const valueClass = tone === "pill" ? "profile-row-pill" : "profile-row-value";
  return button(
    `<i>${icons[icon] ?? icons.user}</i><span><strong>${label}</strong>${description ? `<small>${description}</small>` : ""}</span>${value ? `<em class="${valueClass}">${value}</em>` : ""}${icons.arrow}`,
    `profile-settings-row tone-${tone}`,
    onClick,
    label,
    true
  );
}

function profilePermissionsSection(onNavigate) {
  const section = element("section", { className: "profile-permissions-card profile-glass-card" });
  section.append(element("h2", { text: "Yetkilerim" }));
  const chips = element("div", { className: "profile-permission-chips" });
  const authorityIcons = ["car", "engine", "sliders", "gauge"];
  technicianProfile.authorities.forEach((label, index) => {
    const icon = authorityIcons[index] ?? "shield";
    chips.append(button(`${icons[icon]}<span>${label}</span><b>${icons.check}</b>`, "profile-permission-chip", () => onNavigate("permissions"), label, true));
  });
  section.append(chips);
  return section;
}

function profileLogoutCard(onLogout) {
  return button(
    `${icons.logout}<span><strong>Çıkış Yap</strong><small>Hesabınızdan güvenli şekilde çıkış yapın</small></span>${icons.arrow}`,
    "profile-logout-row",
    onLogout,
    "Çıkış Yap",
    true
  );
}

function profileLogoutModal(onNavigate) {
  const modal = element("section", {
    className: "profile-logout-modal",
    attrs: { role: "dialog", "aria-modal": "true", "aria-label": "Çıkış yapılsın mı?" }
  });
  const close = () => modal.classList.remove("is-open");
  const confirm = () => {
    close();
    logoutToLogin(onNavigate);
  };
  modal.append(
    element("div", { className: "profile-logout-backdrop" }),
    element("div", {
      className: "profile-logout-panel",
      html: `<h2>Çıkış yapılsın mı?</h2><p>Hesabınızdan güvenli şekilde çıkış yapılacak.</p>`
    })
  );
  const panel = modal.querySelector(".profile-logout-panel");
  panel.append(
    button("Vazgeç", "secondary-button profile-logout-cancel", close),
    button("Çıkış Yap", "primary-button profile-logout-confirm", confirm)
  );
  modal.querySelector(".profile-logout-backdrop").addEventListener("click", close);
  return modal;
}

function segmentedSemiGauge(value, label) {
  const gauge = element("div", { className: "segmented-semi-gauge", dataset: { value: `${value}` } });
  gauge.append(
    element("div", { className: "gauge-segments", html: "<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>" }),
    element("strong", { text: `%${value}` }),
    element("span", { text: label })
  );
  return gauge;
}

function progressLine(tone, value) {
  return element("span", { className: `premium-progress-line tone-${tone}`, html: `<i style="width:${value}%"></i>` });
}

function carSilhouette() {
  return '<svg viewBox="0 0 260 110" aria-hidden="true"><path d="M35 72h190l-20-30c-7-10-19-16-32-16H98c-16 0-31 8-40 21L35 72z" fill="currentColor" opacity=".12"/><path d="M38 72h184c11 0 20 9 20 20H18c0-11 9-20 20-20z" fill="currentColor" opacity=".2"/><circle cx="76" cy="92" r="13" fill="#fff" stroke="currentColor" stroke-width="8"/><circle cx="188" cy="92" r="13" fill="#fff" stroke="currentColor" stroke-width="8"/></svg>';
}

function carTopSilhouette() {
  return '<svg viewBox="0 0 220 420" aria-hidden="true"><rect x="52" y="26" width="116" height="368" rx="42" fill="currentColor" opacity=".08"/><path d="M71 92h78l19 58v126l-18 54H70L52 276V150l19-58z" fill="#fff" stroke="currentColor" stroke-width="4"/><path d="M78 110h64M68 188h84M68 254h84M78 310h64" stroke="currentColor" stroke-width="4" opacity=".35"/><circle cx="52" cy="134" r="13" fill="#e30613"/><circle cx="168" cy="270" r="13" fill="#f59e0b"/><circle cx="65" cy="335" r="13" fill="#16a34a"/></svg>';
}

function extraStateMain(title, description, tone = "success", iconName = "check") {
  const main = element("main", {
    className: `phase1-extra-main tone-${tone}`,
    attrs: { "aria-label": title }
  });
  main.append(
    element("section", {
      className: "phase1-extra-hero",
      html: `
        <div class="phase1-extra-logo" aria-label="OTOTR"><span>OTO</span><b>TR</b></div>
        <span class="phase1-extra-icon">${icons[iconName] ?? icons.check}</span>
        <h1>${title}</h1>
        <p>${description}</p>
      `
    })
  );
  return main;
}

function extraInfoGrid(items) {
  const grid = element("section", { className: "phase1-extra-info-grid" });
  items.forEach(([label, value]) => {
    grid.append(element("article", { html: `<span>${label}</span><strong>${value}</strong>` }));
  });
  return grid;
}

function extraChecklist(items) {
  const list = element("section", { className: "phase1-extra-checklist" });
  items.forEach(([label, tone = "neutral"]) => {
    const icon = tone === "success" ? "check" : tone === "red" ? "xCircle" : tone === "warning" ? "alert" : "info";
    list.append(element("article", {
      className: `tone-${tone}`,
      html: `<span>${icons[icon]}</span><strong>${label}</strong><em>${tone === "success" ? "Tamam" : tone === "red" ? "Kritik" : tone === "warning" ? "Uyarı" : "Bilgi"}</em>`
    }));
  });
  return list;
}

function extraTimeline(items) {
  const list = element("section", { className: "phase1-extra-timeline" });
  items.forEach(([title, label, tone = "neutral"]) => {
    list.append(element("article", {
      className: `tone-${tone}`,
      html: `<i></i><div><strong>${title}</strong><span>${label}</span></div>`
    }));
  });
  return list;
}

function extraProgress(label, value) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return element("section", {
    className: "phase1-extra-progress-card",
    html: `<div><strong>${label}</strong><span>%${safeValue}</span></div><i><b style="width:${safeValue}%"></b></i>`
  });
}

function extraActionStack(actions) {
  const stack = element("section", { className: "phase1-extra-actions" });
  actions.forEach((action) => stack.append(action));
  return stack;
}

function screenMain(title, subtitle, onNavigate, showBack = false) {
  const main = element("main", { className: "phase2-main" });
  main.append(topHeader(title, subtitle, onNavigate, showBack));
  return main;
}

function topHeader(title, subtitle, onNavigate, showBack = false) {
  const header = element("header", { className: "app-header phase2-top-header" });
  const left = showBack
    ? button("‹", "icon-button", () => onNavigate(getBackRouteForTitle(title)), "Geri dön")
    : element("span", { className: "header-logo", text: "OTOTR" });
  const copy = element("div", { className: "phase2-header-copy" });
  copy.append(element("h1", { text: title }), element("p", { text: subtitle }));
  const bell = button(`${icons.bell}<b>3</b>`, "icon-button notification-button", () => onNavigate("notifications"), "Bildirimler", true);
  header.append(left, copy, bell);
  return header;
}

function getBackRouteForTitle(title) {
  const backRoutes = {
    "İş Emri Detayı": "jobs",
    "İşe Başlama Kanıtı": "job-detail",
    "Test Başlıkları": "home",
    "Eksikler / Uyarılar": "tests",
    "Profil": "home",
    "Rapor Özeti": "tests",
    "Yardım Merkezi": "profile",
    "Rapor Geçmişi": "profile",
    "Bildirimler": "home",
    "Müşteri Özeti": "summary",
    "Final Rapor Önizleme": "customer-summary",
    "İş Emri Tamamlandı": "final-report",
    "Yetkilerim": "profile",
    "Offline Senkronizasyon": "profile",
    "Senkronizasyon Hatası": "offline-sync",
    "Kayıt Bulunamadı": "jobs",
    "Modül Kontrolü": "tests",
    "Kanıt Senkron Kuyruğu": "evidence",
    "Kapanış Kontrolü": "summary",
    "Eksik Düzeltme Detayı": "missing",
    "Rapor Tamamlandı / Kilitli": "reports",
    "İptal Edilen İş Detayı": "jobs",
    "Profil Ayar Detayı": "profile"
  };
  return backRoutes[title] ?? "home";
}

function heroCard() {
  const card = element("section", { className: "hero-card section-card" });
  card.append(
    element("div", { className: "avatar-badge", html: icons.user }),
    element("div", {
      className: "hero-card-copy",
      html: `<span>Hoş geldiniz</span><h2>${technicianSession.name}</h2><p>${technicianSession.role}</p>`
    }),
    statusBadge(technicianSession.accountStatus, "success")
  );
  return card;
}

function metricGrid(items) {
  const grid = element("section", { className: "metric-grid" });
  items.forEach((item) => {
    const card = element("article", { className: `metric-card tone-${item.tone}` });
    card.append(iconWrap(item.icon), element("strong", { text: item.value }), element("span", { text: item.label }));
    grid.append(card);
  });
  return grid;
}

function sectionTitle(title, actionLabel, onClick) {
  const wrap = element("div", { className: "section-title phase2-section-title" });
  wrap.append(element("h2", { text: title }));
  if (actionLabel) wrap.append(button(actionLabel, "text-button", onClick));
  return wrap;
}

function dailyPlanCard() {
  const card = element("section", { className: "section-card plan-card" });
  dailyPlan.forEach((item) => {
    const row = element("div", { className: "plan-row phase2-plan-row" });
    row.append(
      element("div", { className: "plan-time", html: `<strong>${item.time}</strong><span>${item.type}</span>` }),
      iconWrap("calendar"),
      element("div", { className: "plan-copy", html: `<strong>${item.plaka}</strong><span>${item["araç"]}</span>` }),
      statusBadge(item.durum, item.tone)
    );
    card.append(row);
  });
  return card;
}

function quickActionGrid(onNavigate) {
  const grid = element("section", { className: "quick-grid phase2-quick-grid" });
  quickActions.forEach((item) => {
    const card = button("", "quick-card", () => onNavigate(item.routeId));
    card.append(iconWrap(item.icon), element("span", { text: item.label }));
    if (item.badge) card.append(element("b", { text: item.badge }));
    grid.append(card);
  });
  return grid;
}

function jobsApprovedHeader(onNavigate) {
  const header = element("header", { className: "app-header jobs-approved-header" });
  header.append(
    element("img", {
      className: "jobs-approved-avatar",
      attrs: { src: "./src/assets/home-reference/technician-avatar.png", alt: "Ahmet Usta" }
    }),
    element("div", {
      className: "jobs-approved-title",
      html: "<h1>İşlerim</h1><p>Tüm iş emri ve durumlar</p>"
    }),
    button(`${icons.bell}<b>3</b>`, "notification-button jobs-approved-bell", () => onNavigate("notifications"), "Bildirimler", true)
  );
  return header;
}

function jobsReferenceHotspots(onNavigate) {
  const layer = element("div", { className: "jobs-reference-hotspots", attrs: { "aria-label": "İşlerim ekran kısayolları" } });
  [
    ["job-1", "16 ABC 123 iş emrini aç", "job-detail"],
    ["job-2", "34 DFG 456 iş emrini aç", "job-detail"],
    ["job-3", "35 KLM 789 iş emrini aç", "job-detail"],
    ["job-4", "16 HJK 321 iş emrini aç", "job-detail"],
    ["job-5", "06 MNO 654 iş emrini aç", "job-detail"],
    ["nav-tasks", "Görevler", "tests"],
    ["nav-jobs", "İşlerim", "jobs"],
    ["nav-home", "Ana Sayfa", "home"],
    ["nav-issues", "Eksikler", "missing"],
    ["nav-profile", "Profil", "profile"],
    ["bell", "Bildirimler", "notifications"]
  ].forEach(([id, label, route]) => {
    layer.append(button("", `jobs-reference-hotspot ${id}`, () => onNavigate(route), label));
  });
  return layer;
}

function toolsRow(onSearch, onFilterWaiting, onInputReady) {
  const wrap = element("section", { className: "premium-search-row jobs-tools phase2-jobs-tools jobs-approved-tools" });
  const searchInput = element("input", {
    className: "jobs-approved-search-input",
    attrs: {
      type: "search",
      placeholder: "Plaka, şasi veya iş emri ara",
      "aria-label": "İş emri ara",
      autocomplete: "off",
      autocorrect: "off",
      spellcheck: "false"
    }
  });
  searchInput.addEventListener("input", (event) => {
    onSearch?.(event.target.value || "");
  });
  if (onInputReady) onInputReady(searchInput);
  const searchArea = element("div", { className: "search-box jobs-approved-search" });
  searchArea.append(element("span", { className: "jobs-approved-search-icon", html: icons.search }));
  searchArea.append(searchInput);
  wrap.append(
    searchArea,
    button(`<span>Filtrele</span>${icons.sliders}`, "filter-button jobs-approved-filter", onFilterWaiting, "Filtrele", true)
  );
  return wrap;
}

function statusTabs(onChange) {
  const tabs = element("div", { className: "tabs phase2-tabs premium-tabs jobs-approved-tabs" });
  const labels = ["Tümü", "Devam Eden", "Bekleyen", "Tamamlanan", "Eksik"];
  const values = ["all", "devam", "waiting", "tamamlanan", "eksik"];
  labels.forEach((label, index) => {
    const tab = element("button", { text: label, attrs: { type: "button" } });
    if (index === 0) tab.setAttribute("aria-current", "page");
    tab.addEventListener("click", () => onChange(values[index]));
    tabs.append(tab);
  });
  return tabs;
}

function workOrderCard(order, onNavigate) {
  const card = element("article", {
    className: `order-list-card phase2-order-card premium-order-card jobs-approved-card status-${order.durumTone}`,
    attrs: { role: "button", tabindex: "0", "aria-label": `${order.plaka} iş emri detayını aç` }
  });
  const openDetail = () => onNavigate("job-detail");
  card.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    openDetail();
  });
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openDetail();
  });
  const progress = jobsProgressRing(order.ilerleme ?? 65);
  const copy = element("div", { className: "order-card-main jobs-approved-card-copy" });
  const plateRow = element("div", { className: "jobs-approved-plate-row" });
  plateRow.append(element("h3", { text: order.plaka }));
  const badgeRow = element("div", { className: "jobs-approved-badges" });
  badgeRow.append(statusBadge(order.durum, order.durumTone));
  if (order["eksikSayısı"] > 0) {
    badgeRow.append(element("span", { className: "jobs-approved-missing", text: `${order["eksikSayısı"]} eksik` }));
  }
  copy.append(
    plateRow,
    badgeRow,
    element("strong", { text: `${order.marka} ${order.model}` }),
    element("p", { text: `${order["yıl"]} · ${order.paket} · ${order.kilometre}` }),
    element("small", { text: order["başlamaDurumu"] })
  );
  card.append(
    element("i", { className: `jobs-approved-status-bar tone-${order.durumTone}`, attrs: { "aria-hidden": "true" } }),
    element("img", {
      className: "jobs-approved-car",
      attrs: { src: jobsVehicleImage(order), alt: `${order.marka} ${order.model}` }
    }),
    copy,
    progress,
    button(icons.arrow, "order-arrow", openDetail, "Detayı gör", true)
  );
  return card;
}

function jobsApprovedCard(order, onNavigate) {
  const statusLabel = workOrderStatusLabels[order.status] ?? order.status;
  const statusTone = workOrderStatusTones[order.status] ?? "neutral";
  const targetRoute = getWorkOrderTargetRoute(order);
  const progressSnapshot = getHomeWorkOrderProgress(order);
  const card = element("article", {
    className: `order-list-card phase2-order-card premium-order-card jobs-approved-card status-${statusTone}`,
    attrs: { role: "button", tabindex: "0", "aria-label": `${order.plate} iş emrini aç` }
  });
  const openDetail = () => {
    setSelectedWorkOrder(order);
    onNavigate(targetRoute);
  };
  card.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    openDetail();
  });
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openDetail();
  });

  const copy = element("div", { className: "order-card-main jobs-approved-card-copy" });
  const plate = element("div", { className: "jobs-approved-license", html: `<span>TR</span><strong>${order.plate}</strong>` });
  const topLine = element("div", { className: "jobs-approved-topline" });
  topLine.append(plate);
  const vehicleInfo = element("div", { className: "jobs-approved-vehicle-info" });
  vehicleInfo.append(
    element("strong", { text: order.brandModel })
  );
  vehicleInfo.append(
    element("p", { className: "jobs-approved-km", text: `${order.year}  •  ${order.packageName}  •  ${order.km}` })
  );
  copy.append(
    topLine,
    vehicleInfo
  );
  const vehicleThumb = element("div", { className: "jobs-approved-vehicle-thumb" });
  vehicleThumb.append(element("img", {
    className: "jobs-approved-car",
    attrs: { src: getVehicleImagePath(order), alt: order.brandModel }
  }));
  if (order.missingCount > 0) {
    vehicleThumb.append(element("span", { className: "jobs-approved-missing", text: `${order.missingCount} Eksik` }));
  }
  const progressLine = jobsLinearProgress(progressSnapshot.percent, statusTone);
  card.append(
    element("i", { className: `jobs-approved-status-bar tone-${statusTone}`, attrs: { "aria-hidden": "true" } }),
    vehicleThumb,
    copy,
    jobsProgressRing(progressSnapshot.percent, "red", progressSnapshot),
    progressLine,
    button(icons.arrow, "order-arrow", openDetail, "İş emrini aç", true)
  );
  return card;
}

function getHomeWorkOrderProgress(order = {}) {
  const selectedOrder = getSelectedWorkOrder();
  const modules = getNormalizedTaskModules();
  const aggregate = getTaskModulesAggregate(modules);
  const moduleTotal = Math.max(0, Number(aggregate.totalItems || 0));
  const moduleCompleted = Math.max(0, Number(aggregate.completedItems || 0));
  const openedStepTotal = 1;
  const startProofStepTotal = 1;
  const openedStepCompleted = order.id ? 1 : 0;
  const startProofStepCompleted = isWorkOrderStartProofComplete(order) ? 1 : 0;
  const total = openedStepTotal + startProofStepTotal + moduleTotal;
  let completed = openedStepCompleted + startProofStepCompleted + moduleCompleted;

  if (order.status === "completed" || order.status === "technical_review") {
    completed = total;
  }

  const fallbackTotal = Math.max(1, Number(order.totalItems || 60));
  const fallbackCompleted = Number.isFinite(Number(order.completedItems))
    ? Math.max(0, Number(order.completedItems))
    : Math.round((Math.max(0, Number(order.progress || 0)) / 100) * fallbackTotal);
  const isSelectedOrder = isSameWorkOrder(order, selectedOrder);
  const shouldUseWorkflowProgress = isSelectedOrder
    && moduleTotal > 0
    && ["in_progress", "test_missing", "returned_for_correction", "completed", "technical_review"].includes(order.status);

  if (!shouldUseWorkflowProgress) {
    const baseCompleted = order.status === "waiting_start_proof" || order.status === "start_proof_incomplete"
      ? Math.max(1, fallbackCompleted)
      : fallbackCompleted;
    const fallbackPercent = Math.round((Math.min(fallbackTotal, baseCompleted) / fallbackTotal) * 100);
    return {
      ...order,
      percent: Math.min(100, Math.max(0, fallbackPercent)),
      progress: Math.min(100, Math.max(0, fallbackPercent)),
      completedItems: Math.min(fallbackTotal, baseCompleted),
      totalItems: fallbackTotal
    };
  }

  const safeCompleted = Math.min(total, Math.max(0, completed));
  const percent = total ? Math.round((safeCompleted / total) * 100) : 0;
  return {
    ...order,
    percent: Math.min(100, Math.max(0, percent)),
    progress: Math.min(100, Math.max(0, percent)),
    completedItems: safeCompleted,
    totalItems: total
  };
}

function isSameWorkOrder(order = {}, selectedOrder = {}) {
  if (order.id && selectedOrder.id && order.id === selectedOrder.id) return true;
  if (order.expertiseCaseId && selectedOrder.expertiseCaseId && order.expertiseCaseId === selectedOrder.expertiseCaseId) return true;
  return Boolean(order.plate && selectedOrder.plate && order.plate === selectedOrder.plate);
}

function isWorkOrderStartProofComplete(order = {}) {
  if (["in_progress", "test_missing", "returned_for_correction", "completed", "technical_review"].includes(order.status)) {
    return true;
  }
  const caseId = order.expertiseCaseId || order.id;
  const requiredKeys = ["start_proof_vinPhoto", "start_proof_platePhoto", "start_proof_kmPhoto"];
  const captures = getEvidenceCaptureStore();
  return requiredKeys.every((fieldKey) => captures.some((capture) => {
    const sameField = capture.fieldKey === fieldKey;
    const sameOrder = !caseId
      || capture.workOrderId === order.id
      || capture.expertiseCaseId === caseId
      || capture.plate === order.plate;
    return sameField && sameOrder && (capture.previewUrl || capture.id);
  }));
}

function jobsVehicleImage(order) {
  const brand = order.marka.toLowerCase();
  if (brand.includes("bmw")) return "./src/assets/home-reference/featured-car.png";
  if (brand.includes("volkswagen")) return "./src/assets/home-reference/plan-car-1.png";
  if (brand.includes("renault")) return "./src/assets/home-reference/plan-car-2.png";
  return "./src/assets/home-reference/plan-car-3.png";
}

function jobsProgressRing(value, tone = "red", order = {}) {
  const safeValue = Math.min(100, Math.max(0, value));
  const total = order.totalItems || 60;
  const completed = order.completedItems ?? Math.round((safeValue / 100) * total);
  const segmentCount = 34;
  const filledCount = Math.round((segmentCount * safeValue) / 100);
  const startAngle = -130;
  const stepAngle = 260 / (segmentCount - 1);
  const segments = Array.from({ length: segmentCount }, (_, index) => {
    const angle = startAngle + stepAngle * index;
    const color = index < filledCount ? "#ef0712" : index > segmentCount - 7 ? "#e7f0ff" : "#ffd8df";
    return `<rect x="-2.8" y="-70" width="5.6" height="14.5" rx="2.8" fill="${color}" transform="translate(73.5 75) rotate(${angle.toFixed(2)})"></rect>`;
  }).join("");
  const ring = element("div", {
    className: `jobs-approved-progress tone-${tone}`,
    html: `
      <svg class="jobs-approved-progress-art" viewBox="0 0 147 147" aria-hidden="true">
        <circle cx="73.5" cy="73.5" r="72" fill="#ffffff"></circle>
        <g class="jobs-approved-progress-segments">${segments}</g>
        <text x="73.5" y="73" text-anchor="middle" class="jobs-approved-progress-value">%${safeValue}</text>
        <text x="73.5" y="92" text-anchor="middle" class="jobs-approved-progress-caption">${completed}/${total}</text>
      </svg>`,
    attrs: { "aria-label": `%${value} tamamlanma durumu` }
  });
  return ring;
}

function jobsLinearProgress(value, tone = "red") {
  const safeValue = Math.min(100, Math.max(0, value));
  const line = element("div", {
    className: `jobs-approved-linear tone-${tone}`,
    html: "<span></span>",
    attrs: { "aria-hidden": "true" }
  });
  line.style.setProperty("--line-progress", `${safeValue}%`);
  return line;
}

function detailSummary(order) {
  const card = element("section", { className: "detail-summary section-card" });
  card.append(
    element("div", { className: "license-plate", html: `<span>TR</span><strong>${order.plaka}</strong>` }),
    statusBadge(order.durum, order.durumTone),
    element("h2", { text: `${order.marka} ${order.model}` }),
    element("p", { text: `${order["yıl"]} · ${order.paket} · ${order.kilometre}` })
  );
  return card;
}

function detailInfoGrid(order) {
  const grid = element("section", { className: "detail-info-grid" });
  [
    ["İş Emri", order["işEmriNo"]],
    ["Bayi", order.bayi],
    ["Müşteri", order["müşteriAdı"]],
    ["Öncelik", order["öncelik"]],
    ["Atanmış Usta", order["atanmışUsta"]],
    ["Başlama Durumu", order["başlamaDurumu"]],
    ["Tamamlanma Durumu", order.teknikOnayDurumu],
    ["Kanıt Sayısı", `${order["kanıtSayısı"]}`]
  ].forEach(([label, value]) => {
    grid.append(element("div", { className: "detail-info-item", html: `<span>${label}</span><strong>${value}</strong>` }));
  });
  return grid;
}

function approvalRuleCard() {
  const card = element("section", { className: "approval-rule section-card" });
  card.append(iconWrap("shield"), element("div", { html: `<h2>Tamamlama Kuralı</h2><p>${technicalApprovalFlow.blockingRule}</p><p>${technicalApprovalFlow.unlockRule}</p>` }));
  return card;
}

function detailActions(order, onNavigate) {
  const wrap = element("section", { className: "detail-actions" });
  const nextRoute = "start-proof";
  wrap.append(
    button(`${icons.scan}<span>Devam Et</span>${icons.arrow}`, "primary-button detail-main-action full-width", () => onNavigate(nextRoute), "Devam Et", true),
    element("div", { className: "detail-secondary-actions" })
  );
  const secondary = wrap.querySelector(".detail-secondary-actions");
  [
    [icons.alert, "Eksikleri Gör", "missing"],
    [icons.bell, "Not Ekle", "job-detail"],
    [icons.report, "Müşteri Özeti", "summary"]
  ].forEach(([icon, label, route]) => {
    secondary.append(button(`${icon}<span>${label}</span>`, "secondary-button detail-secondary-action", () => onNavigate(route), label, true));
  });
  return wrap;
}

function schemaSummaryCard(keys) {
  const selected = moduleForms.filter((item) => keys.includes(item.title));
  const rows = selected.map((item) =>
    checklistRow(
      item.title,
      `${item.form.itemCount} madde · fotoğraf opsiyonel`,
      "neutral"
    )
  );
  return createSection("Şema Özeti", `${expertiseSchemaStats.groupCount} grup / ${expertiseSchemaStats.itemCount} madde / ${expertiseSchemaStats.optionInputCount} seçenek-girdi`, rows);
}

function panelGrid() {
  const grid = element("div", { className: "panel-grid" });
  bodyPanels.forEach((panel) => {
    grid.append(
      element("article", {
        className: `panel-card tone-${panel.tone}`,
        html: `<strong>${panel.title}</strong><span>${panel.status}</span><small>${panel.photoSlots} kanıt slotu · Nokta ${panel.noktaId ?? "-"}</small>`
      })
    );
  });
  return grid;
}

function moduleFormCard(title, form) {
  return element("article", {
    className: "section-card module-detail-card",
    html: `<div class="module-detail-head"><strong>${title}</strong><span class="status-chip tone-neutral">${form.itemCount} madde</span></div><p>${form.groupTitles.join(" / ")}</p><small>${form.labeledOptionCount} etiketli seçenek · ${form.needsLabelMapCount} etiket bekleyen seçenek</small>`
  });
}

function formPreviewSection(form, count, formKey = form.key || "kaporta") {
  const wrap = element("div", { className: "stack schema-item-stack" });
  form.items.slice(0, count).forEach((item, index) => wrap.append(formItemCard(item, index === 0, formKey)));
  return wrap;
}

function formItemCard(item, isOpen = false, formKey = "kaporta") {
  const itemState = getModuleItemState(formKey, item);
  const isComplete = isModuleItemComplete(item, itemState);
  const card = element("article", { className: isOpen ? "section-card schema-item-card accordion-test-item open" : "section-card schema-item-card accordion-test-item" });
  card.classList.toggle("is-complete", isComplete);
  const summary = element("button", { className: "schema-item-summary", attrs: { type: "button" } });
  summary.append(
    element("div", { html: `<strong>${item.title}</strong><small>Nokta ${item.noktaId} · fotoğraf opsiyonel</small>` }),
    statusBadge(isComplete ? "Tamamlandı" : "Standart", isComplete ? "success" : "neutral"),
    element("span", { className: "order-arrow", html: icons.arrow })
  );

  const body = element("div", { className: "schema-item-body" });
  body.append(
    element("h3", { text: "Seçenekler" }),
    optionGrid(item, formKey),
    inputGrid(item, formKey),
    descriptionField(item, formKey),
    photoSlotGrid(item, formKey),
    element("p", { className: "critical-proof-note", text: "Fotoğraf ekleme bu fazda opsiyoneldir." })
  );
  summary.addEventListener("click", () => card.classList.toggle("open"));
  card.append(summary, body);
  return card;
}

function optionGrid(item, formKey) {
  const itemState = getModuleItemState(formKey, item);
  const grid = element("div", { className: "premium-option-grid" });
  item.options.slice(0, 8).forEach((option, index) => {
    const label = option.displayLabel || "Seçenek etiketi doğrulanacak";
    const tone = option.needsLabelMap ? "warning" : optionTone(label);
    const isSelected = itemState.selectedOption
      ? itemState.selectedOption === label
      : false;
    const chip = element("button", {
      className: `option-chip tone-${tone}${isSelected ? " selected" : ""}`,
      text: option.needsLabelMap ? "Seçenek etiketi doğrulanacak" : label,
      attrs: {
        type: "button",
        title: option.needsLabelMap ? "Bu seçenek teknik sözlükte doğrulanmalı." : label,
        "aria-pressed": isSelected ? "true" : "false"
      }
    });
    chip.addEventListener("click", () => {
      grid.querySelectorAll(".option-chip").forEach((node) => {
        node.classList.remove("selected");
        node.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("selected");
      chip.setAttribute("aria-pressed", "true");
      setModuleItemState(formKey, item, {
        selectedOption: label,
        selectedOptionTone: tone,
        needsLabelMap: Boolean(option.needsLabelMap)
      });
      queueMobileInspectionAnswerSave(formKey, item);
      refreshCurrentModuleFormProgress(formKey);
      recordWorkflowStep("form_option_selected", {
        selectedModuleFormKey: formKey,
        selectedItem: item.title,
        selectedOption: option.needsLabelMap ? "Seçenek etiketi doğrulanacak" : label,
        needsLabelMap: Boolean(option.needsLabelMap)
      });
    });
    grid.append(chip);
  });
  return grid;
}

function optionTone(label) {
  const risk = ["Kötü", "Kritik", "Hasarlı", "Deforme", "Arıza", "Yağ Kaçağı", "Yağ Kaçağı Var", "Terleme", "Çalışmıyor", "Sorunlu", "Değişen", "İşlemli", "Kusurlu", "Eksik"];
  const warning = ["Orta", "Bakılamadı", "Kontrol Edilmedi", "Yok", "Test Yapılamadı", "Bakım Gerekli"];
  const success = ["İyi", "Sorunsuz", "Çalışıyor", "Arıza Kaydı Yok", "Hayır", "Yağ Kaçağı Yok"];
  if (risk.some((word) => label.includes(word))) return "red";
  if (warning.some((word) => label.includes(word))) return "warning";
  if (success.some((word) => label.includes(word))) return "success";
  return "neutral";
}

function inputGrid(item, formKey) {
  const itemState = getModuleItemState(formKey, item);
  const grid = element("div", { className: "input-grid" });
  if (!item.inputs.length) {
    grid.append(element("small", { text: "Ek ölçüm alanı yok" }));
    return grid;
  }
  item.inputs.forEach((input) => {
    const fieldName = input.name || input.label || "Ek alan";
    const placeholder = input.inputType === "number" ? "Ölçüm değeri girin" : input.inputType === "date" ? "Tarih girin" : "Değer veya açıklama girin";
    const inputNode = element("input", {
      attrs: {
        type: input.inputType === "number" ? "number" : input.inputType === "date" ? "date" : "text",
        placeholder,
        inputmode: input.inputType === "number" ? "decimal" : "text",
        "aria-label": input.label || "Ek alan",
        value: itemState.inputs?.[fieldName] || ""
      }
    });
    inputNode.addEventListener("input", () => {
      const currentState = getModuleItemState(formKey, item);
      setModuleItemState(formKey, item, {
        inputs: {
          ...(currentState.inputs || {}),
          [fieldName]: inputNode.value.trim()
        }
      });
      queueMobileInspectionAnswerSave(formKey, item);
      refreshCurrentModuleFormProgress(formKey);
      recordWorkflowStep("form_input_changed", {
        selectedModuleFormKey: formKey,
        selectedItem: item.title,
        fieldName,
        hasValue: inputNode.value.trim().length > 0
      });
    });
    grid.append(formField(input.label || "Ek alan", inputNode));
  });
  return grid;
}

function descriptionField(item, formKey) {
  if (!item.hasDescription) return element("small", { text: "Açıklama alanı kapalı" });
  const itemState = getModuleItemState(formKey, item);
  const label = element("label", { className: "textarea-field" });
  const textarea = element("textarea", { attrs: { placeholder: "Teknik açıklama girin", rows: "3" } });
  textarea.value = itemState.description || "";
  textarea.addEventListener("input", () => {
    setModuleItemState(formKey, item, {
      description: textarea.value.trim()
    });
    queueMobileInspectionAnswerSave(formKey, item);
    refreshCurrentModuleFormProgress(formKey);
    recordWorkflowStep("form_description_changed", {
      selectedModuleFormKey: formKey,
      selectedItem: item.title,
      hasDescription: textarea.value.trim().length > 0
    });
  });
  label.append(element("span", { text: "Usta notu / açıklama" }), textarea);
  return label;
}

function photoSlotGrid(item, formKey) {
  const itemState = getModuleItemState(formKey, item);
  const readySlots = new Set((itemState.readyPhotoSlots || []).map(Number));
  const grid = element("div", { className: "photo-slot-grid" });
  const count = Math.max(3, item.photoSlots || 0);
  for (let index = 0; index < count; index += 1) {
    const slotIndex = index + 1;
    const isReady = readySlots.has(slotIndex);
    const slot = element("button", {
      className: `photo-slot${isReady ? " is-complete" : ""}`,
      html: `${icons.camera}<strong>${slotIndex}. Fotoğraf</strong><span>${isReady ? "Hazır" : "Opsiyonel"}</span>`,
      attrs: { type: "button", "aria-pressed": isReady ? "true" : "false" }
    });
    slot.addEventListener("click", () => {
      const selected = slot.getAttribute("aria-pressed") !== "true";
      slot.setAttribute("aria-pressed", selected ? "true" : "false");
      slot.classList.toggle("is-complete", selected);
      slot.querySelector("span").textContent = selected ? "Hazır" : "Opsiyonel";
      const currentState = getModuleItemState(formKey, item);
      const currentSlots = new Set((currentState.readyPhotoSlots || []).map(Number));
      if (selected) {
        currentSlots.add(slotIndex);
      } else {
        currentSlots.delete(slotIndex);
      }
      setModuleItemState(formKey, item, {
        readyPhotoSlots: Array.from(currentSlots).sort((a, b) => a - b)
      });
      queueMobileInspectionAnswerSave(formKey, item);
      refreshCurrentModuleFormProgress(formKey);
      recordWorkflowStep("form_photo_slot_toggled", {
        selectedModuleFormKey: formKey,
        selectedItem: item.title,
        photoSlotIndex: slotIndex,
        photoReady: selected
      });
    });
    grid.append(slot);
  }
  return grid;
}

function evidenceCard(slot, onNavigate) {
  const card = element("button", {
    className: `section-card evidence-slot-card tone-${slot.tone}`,
    html: `<div class="module-detail-head"><strong>${slot.title}</strong><span class="status-chip tone-${slot.tone}">${slot.status}</span></div><p>${slot.type}</p><small>${slot.photoSlots} slot · ${slot.file}</small>`,
    attrs: { type: "button", "aria-label": `${slot.title} kanıt slotunu aç` }
  });
  card.addEventListener("click", () => {
    recordWorkflowStep("evidence_slot_selected", {
      selectedEvidenceSlot: slot.title,
      selectedEvidenceStatus: slot.status,
      workOrderStatus: slot.status === "Eksik" ? "evidence_required" : "evidence_review"
    });
    onNavigate?.("camera");
  });
  return card;
}

function issueCard(issue) {
  return element("article", {
    className: `section-card issue-card tone-${issue.tone}`,
    html: `<div class="module-detail-head"><strong>${issue.title}</strong><span class="status-chip tone-${issue.tone}">${issue.module ?? issue.severity}</span></div><p>${issue.detail}</p>`
  });
}

function listSummary(items, tone = "neutral") {
  const wrap = element("div", { className: "stack compact-list" });
  items.forEach((item) => {
    wrap.append(
      element("article", {
        className: `section-card compact-list-card tone-${tone}`,
        html: `<div class="module-detail-head"><strong>${item}</strong><span class="status-chip tone-${tone}">${tone === "red" ? "Kritik" : tone === "warning" ? "Uyarı" : "Bilgi"}</span></div>`
      })
    );
  });
  return wrap;
}

function createSection(title, description, children) {
  const section = element("section", { className: "section-card stack" });
  section.append(element("h2", { text: title }));
  if (description) section.append(element("p", { text: description }));
  children.forEach((child) => section.append(child));
  return section;
}

function bannerCard(title, text, tone) {
  return element("section", {
    className: `section-card banner-card tone-${tone}`,
    html: `<div class="banner-card-icon">${icons.alert}</div><div><h2>${title}</h2><p>${text}</p></div>`
  });
}

function checklistRow(title, value, tone) {
  return element("div", {
    className: "list-row",
    html: `<div><strong>${title}</strong><span>${value}</span></div><span class="status-chip tone-${tone}">${value}</span>`
  });
}

function moduleCard(module, onNavigate) {
  const card = element("article", {
    className: `section-card module-card premium-module-card status-${module.tone}`,
    attrs: { role: "button", tabindex: "0", "aria-label": `${module.title} modülünü aç` }
  });
  const isOwnedByCurrent = module.owner === getCurrentTechnicianName();
  const route = module.status === "Kilitli" && !isOwnedByCurrent ? "lock" : module.routeId;
  const open = () => onNavigate(route);
  card.addEventListener("click", open);
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    open();
  });
  card.append(
    iconWrap(module.status === "Kilitli" ? "key" : "clipboard"),
    element("div", { className: "module-card-copy", html: `<strong>${module.title}</strong><p>${module.itemCount} kontrol maddesi · Sahip: ${module.owner}</p><small>Fotoğraf opsiyonel</small>` }),
    element("div", { className: "module-card-side", html: `<span class="status-chip tone-${module.tone}">${module.status}</span>` }),
    progressLine(module.tone, module.status === "Tamamlandı" ? 100 : module.status === "Devam Ediyor" || module.status === "Usta Üzerinde" ? 62 : 18),
    element("span", { className: "order-arrow", html: icons.arrow })
  );
  return card;
}

function summaryTileGrid(items) {
  const grid = element("section", { className: "detail-info-grid" });
  items.forEach(([label, value]) => {
    grid.append(element("div", { className: "detail-info-item", html: `<span>${label}</span><strong>${value}</strong>` }));
  });
  return grid;
}

function actionRow(buttons) {
  const row = element("div", { className: "detail-actions" });
  buttons.forEach((item) => row.append(item));
  return row;
}

function formField(label, value, isSecret = false) {
  const wrap = element("label", { className: "form-field" });
  const fieldValue = value;
  const inputNode = fieldValue && fieldValue instanceof HTMLElement
    ? fieldValue
    : element("input", { attrs: { value: fieldValue, type: isSecret ? "password" : "text", readonly: "" } });
  if (!fieldValue || !(fieldValue instanceof HTMLElement)) {
    inputNode.setAttribute("type", isSecret ? "password" : "text");
  } else if (!inputNode.getAttribute("type")) {
    inputNode.setAttribute("type", isSecret ? "password" : "text");
  }
  wrap.append(element("span", { text: label }), inputNode);
  return wrap;
}

function infoStrip(text) {
  const strip = element("div", { className: "info-strip" });
  strip.append(iconWrap("shield"), element("span", { text }));
  return strip;
}

function statusBadge(label, tone = "neutral") {
  return element("span", { className: "status-badge", text: label, dataset: { tone } });
}

function iconWrap(iconName) {
  return element("span", { className: "phase2-icon", html: icons[iconName] ?? icons.clipboard });
}

function getLockedSectionData() {
  try {
    const stored = JSON.parse(sessionStorage.getItem("ototrLockedSection") || "null");
    return stored ? { ...lockedSectionDefault, ...stored } : lockedSectionDefault;
  } catch {
    return lockedSectionDefault;
  }
}

function persistLockedSection(section) {
  try {
    sessionStorage.setItem("ototrLockedSection", JSON.stringify({ ...lockedSectionDefault, ...section }));
  } catch {
    // Session storage may be unavailable in restricted WebViews.
  }
}

function markLockedSectionReadOnly() {
  try {
    sessionStorage.setItem("ototrLockedSectionReadOnly", "true");
  } catch {
    // Session storage may be unavailable in restricted WebViews.
  }
}

function clearLockedSectionReadOnly() {
  try {
    sessionStorage.removeItem("ototrLockedSectionReadOnly");
  } catch {
    // Session storage may be unavailable in restricted WebViews.
  }
}

function isLockedSectionReadOnlyActive() {
  try {
    return sessionStorage.getItem("ototrLockedSectionReadOnly") === "true";
  } catch {
    return false;
  }
}

function markLockedSectionRequest() {
  try {
    sessionStorage.setItem("ototrLockedSectionRequest", "manager-takeover");
  } catch {
    // Session storage may be unavailable in restricted WebViews.
  }
}

function clearLockedSectionRequest() {
  try {
    sessionStorage.removeItem("ototrLockedSectionRequest");
  } catch {
    // Session storage may be unavailable in restricted WebViews.
  }
}

function isLockedSectionRequestActive() {
  try {
    return sessionStorage.getItem("ototrLockedSectionRequest") === "manager-takeover";
  } catch {
    return false;
  }
}

function clearLockedSectionState() {
  try {
    sessionStorage.removeItem("ototrLockedSection");
  } catch {
    // Session storage may be unavailable in restricted WebViews.
  }
  clearLockedSectionReadOnly();
  clearLockedSectionRequest();
}

function button(label, className, onClick, ariaLabel, rawHtml = false) {
  const node = element("button", { className, attrs: { type: "button", ...(ariaLabel ? { "aria-label": ariaLabel } : {}) } });
  if (rawHtml) node.innerHTML = label;
  else node.textContent = label;
  node.addEventListener("click", () => onClick?.());
  return node;
}

function element(tagName, { className = "", text = "", html = "", attrs = {}, dataset = {} } = {}) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text) node.textContent = text;
  if (html) node.innerHTML = html;
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  Object.entries(dataset).forEach(([key, value]) => {
    node.dataset[key] = value;
  });
  return node;
}
