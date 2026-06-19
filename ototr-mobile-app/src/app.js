import { createShell } from "./components/ui.js";
import { referenceRouteOrder } from "./data/mock-data.js";

const app = document.getElementById("app");
const validRoutes = new Set(referenceRouteOrder);
const routeByLowercase = new Map(referenceRouteOrder.map((route) => [route.toLowerCase(), route]));
const publicRoutes = new Set(["splash", "login", "forgot-password", "reset-password"]);
const authStorageKeys = Object.freeze([
  "ototrAuth",
  "ototrBranch",
  "ototrBranchName",
  "ototrDefaultBranch",
  "ototrRememberMe",
  "ototrUser",
  "ototrSupabaseAccessToken",
  "ototrSupabaseRefreshToken",
  "ototrSupabaseUserEmail",
  "ototrResetTarget",
  "ototrSelectedWorkOrder"
]);
const routeAliases = Object.freeze({
  "": "splash",
  "splash": "splash",
  "login": "login",
  "forgot": "forgot-password",
  "forgot-password": "forgot-password",
  "reset-password": "reset-password",
  "branch": "branch",
  "branch-select": "branch",
  "password": "forgot-password",
  "scan": "start-proof",
  "qr": "start-proof",
  "qr-scan": "start-proof",
  "barcode": "start-proof",
  "barcode-scan": "start-proof",
  "detail": "job-detail",
  "job-detail": "job-detail",
  "work-order-detail": "job-detail",
  "vehicle-info": "job-detail",
  "vehicle": "job-detail",
  "customer-info": "customer-summary",
  "customer": "customer-summary",
  "package-info": "job-detail",
  "service-info": "job-detail",
  "service-package": "job-detail",
  "start": "start-proof",
  "start-proof": "start-proof",
  "start-evidence": "start-proof",
  "start-proof-success": "start-proof-success",
  "work-order-started": "tests",
  "proof-success": "start-proof-success",
  "section-owned": "section-owned",
  "baslik-sahiplendi": "section-owned",
  "manager-takeover-success": "section-owned",
  "manager-request-success": "section-owned",
  "save-success": "save-success",
  "saved": "save-success",
  "save-continue": "save-continue",
  "save-and-continue": "save-continue",
  "unsaved-changes": "unsaved-changes",
  "discard-changes": "discard-changes",
  "section-completed": "section-completed",
  "all-sections-completed": "all-sections-completed",
  "report-created": "report-created",
  "required-fields-missing": "required-fields-missing",
  "required-missing": "required-fields-missing",
  "evidence-sync-queue": "evidence-sync-queue",
  "evidence-queue": "evidence-sync-queue",
  "offline-warning": "offline-warning",
  "task-transfer-confirm": "task-transfer-confirm",
  "task-transferred": "task-transferred",
  "pre-approval-check": "pre-approval-check",
  "technical-approval-submitted": "summary",
  "technical-revision-request": "missing",
  "approved-locked-report": "approved-locked-report",
  "cancelled-job": "cancelled-job",
  "unauthorized": "unauthorized",
  "operation-failed": "operation-failed",
  "general-error": "operation-failed",
  "profile-setting-detail": "profile-setting-detail",
  "modules": "tests",
  "tests": "tests",
  "expertise-headings": "tests",
  "inspection-headings": "tests",
  "headings": "tests",
  "issues": "missing",
  "blockingissues": "blockingIssues",
  "blocking-issues": "blockingIssues",
  "missing": "missing",
  "defect": "missing",
  "defect-detail": "missing",
  "issue-detail": "missing",
  "missing-detail": "missing",
  "claim": "lock",
  "claim-heading": "lock",
  "task-lock": "lock",
  "locked-section-warning": "lock",
  "locked-section": "lock",
  "section-locked": "lock",
  "baslik-kilitli": "lock",
  "permission-denied": "permissionDenied",
  "no-permission": "permissionDenied",
  "task-transfer": "section-owned",
  "transfer-task": "section-owned",
  "handover": "section-owned",
  "manager-takeover": "section-owned",
  "manager-request": "section-owned",
  "manager-takeover-request": "section-owned",
  "permission-request": "permissionDenied",
  "module-control": "moduleControl",
  "item-detail": "itemDetail",
  "status-modal": "statusModal",
  "body-panel": "itemDetail",
  "kaporta": "itemDetail",
  "paint": "itemDetail",
  "paint-measurement": "itemDetail",
  "mechanic": "statusModal",
  "mechanical": "statusModal",
  "motor": "statusModal",
  "engine": "statusModal",
  "electric": "statusModal",
  "obd": "statusModal",
  "brake": "statusModal",
  "suspension": "statusModal",
  "interior": "moduleControl",
  "exterior": "moduleControl",
  "tire": "moduleControl",
  "wheel": "moduleControl",
  "road-test": "moduleControl",
  "evidence": "evidence",
  "photo-evidence": "evidence",
  "video-evidence": "evidence",
  "camera": "camera",
  "photo-approval": "photoApproval",
  "photo-upload-error": "photoUploadError",
  "note": "statusModal",
  "note-entry": "statusModal",
  "customer-summary": "customer-summary",
  "customersummary": "customer-summary",
  "final-report": "final-report",
  "finalreport": "final-report",
  "report-preview": "final-report",
  "preview-report": "final-report",
  "work-summary": "summary",
  "approval-waiting": "summary",
  "approvalwaiting": "summary",
  "technical-approval": "summary",
  "send-technical-approval": "summary",
  "pending-approval": "summary",
  "approval-pending": "summary",
  "completed": "summary",
  "completed-work": "summary",
  "completed-history": "summary",
  "history-detail": "summary",
  "summary": "summary",
  "returned": "returned",
  "returned-for-correction": "returned",
  "notifications": "notifications",
  "reports": "reports",
  "help": "help",
  "permissions": "permissions",
  "profile-info": "profile",
  "change-password": "reset-password",
  "notification-settings": "notifications",
  "theme-settings": "profile",
  "language-settings": "profile",
  "camera-settings": "profile",
  "report-settings": "reports",
  "support": "help",
  "whatsapp-support": "help",
  "bug-report": "help",
  "user-guide": "help",
  "version-info": "profile",
  "offline-sync": "offline-sync",
  "offlinesync": "offline-sync",
  "sync": "offline-sync",
  "offline-data": "offline-sync",
  "sync-error": "sync-error",
  "syncerror": "sync-error",
  "empty-state": "empty-state",
  "emptystate": "empty-state",
  "logout": "logout"
});
let activeRoute = getRouteFromHash();
let bootstrapCompleted = false;
let requestedStartupRoute = null;
const splashDelayMs = Math.floor(Math.random() * (1500 - 800 + 1)) + 800;

function navigate(routeId) {
  const resolvedRoute = resolveRoute(routeId);
  if (resolvedRoute === "logout") {
    clearAuthStorage();
    activeRoute = "login";
    window.location.hash = "login";
    render();
    return;
  }
  if (!validRoutes.has(resolvedRoute)) return;
  const allowedRoute = getAllowedRoute(resolvedRoute);
  activeRoute = allowedRoute;
  window.location.hash = allowedRoute;
  render();
}

function resolveRoute(routeId) {
  if (!routeId) return "splash";
  const normalized = String(routeId).replace(/^#\/?/, "").replace(/^\/+/, "").trim();
  const lowerRoute = normalized.toLowerCase();
  return routeAliases[lowerRoute] ?? routeByLowercase.get(lowerRoute) ?? (validRoutes.has(normalized) ? normalized : normalized);
}

function getInitialRoute() {
  const hasAuth = localStorage.getItem("ototrAuth") === "true";
  const selectedBranch = localStorage.getItem("ototrBranch");

  if (!hasAuth) return "login";
  if (!selectedBranch) return "branch";
  return "home";
}

function clearAuthStorage() {
  authStorageKeys.forEach((key) => localStorage.removeItem(key));
}

window.ototrClearAuthStorage = clearAuthStorage;

function getAllowedRoute(route) {
  if (route === "logout") {
    clearAuthStorage();
    return "login";
  }
  if (publicRoutes.has(route)) return route;

  const hasAuth = localStorage.getItem("ototrAuth") === "true";
  const selectedBranch = localStorage.getItem("ototrBranch");

  if (route === "branch") return hasAuth ? "branch" : "login";
  if (!hasAuth) return "login";
  if (!selectedBranch) return "branch";
  return route;
}

function renderSplashAndResolveStart() {
  if (bootstrapCompleted) return;
  const route = requestedStartupRoute && requestedStartupRoute !== "splash"
    ? requestedStartupRoute
    : getInitialRoute();
  requestedStartupRoute = null;
  bootstrapCompleted = true;
  navigate(route);
}

function render() {
  app.replaceChildren(createShell(activeRoute, navigate));
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => undefined);
  });
}

window.addEventListener("hashchange", () => {
  activeRoute = bootstrapCompleted ? getAllowedRoute(getRouteFromHash()) : "splash";
  if (bootstrapCompleted && window.location.hash !== `#${activeRoute}`) {
    window.history.replaceState(null, "", `#${activeRoute}`);
  }
  render();
});

function getRouteFromHash() {
  return resolveRoute(window.location.hash);
}

const startupRoute = resolveRoute(window.location.hash);
if (startupRoute === "logout") clearAuthStorage();
else if (startupRoute !== "splash") requestedStartupRoute = startupRoute;

activeRoute = "splash";
render();

function scheduleSplashResolve() {
  setTimeout(renderSplashAndResolveStart, splashDelayMs);
}

if (document.readyState === "complete") {
  scheduleSplashResolve();
} else {
  window.addEventListener("load", scheduleSplashResolve, { once: true });
}
