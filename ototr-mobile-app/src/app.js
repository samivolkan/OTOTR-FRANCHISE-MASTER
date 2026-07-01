const app = document.getElementById("app");
const publicRoutes = new Set(["splash", "login", "forgot-password", "reset-password"]);
const authStorageKeys = Object.freeze([
  "ototrAuth",
  "ototrAuthMode",
  "ototrBranch",
  "ototrBranchName",
  "ototrDefaultBranch",
  "ototrRememberMe",
  "ototrUser",
  "ototrSupabaseAccessToken",
  "ototrSupabaseRefreshToken",
  "ototrSupabaseUserEmail",
  "ototrResetTarget",
  "ototrSelectedWorkOrder",
  "ototrSelectedWorkOrderSnapshot",
  "ototrLiveWorkOrders",
  "ototrLiveWorkOrdersLastSync",
  "ototrWorkflowState",
  "ototrModuleOwnership",
  "ototrFinalReportPayloads",
  "ototrTechnicalApprovalGate",
  "ototrProfileSettingDetail",
  "ototrUserRole",
  "ototrAppUserId"
]);
const authSessionStorageKeys = Object.freeze([
  "ototrDebugAutoLoginAttempted",
  "ototrDebugRealAutoLoginAttempted",
  "ototrSecretariatWorkOrderDraft",
  "ototrSecretariatCreatedWorkOrder"
]);
const routeAliases = Object.freeze({
  "": "splash",
  splash: "splash",
  login: "login",
  forgot: "forgot-password",
  "forgot-password": "forgot-password",
  "reset-password": "reset-password",
  "secretariat-work-order": "secretariat-work-order",
  "sekreterya-is-emri": "secretariat-work-order",
  "ruhsat-is-emri": "secretariat-work-order",
  "registration-capture": "registration-capture",
  "ruhsat-cek": "registration-capture",
  "registration-review": "registration-review",
  "ruhsat-kontrol": "registration-review",
  "work-order-created": "work-order-created",
  "is-emri-olustu": "work-order-created",
  branch: "branch",
  "branch-select": "branch",
  password: "forgot-password",
  scan: "start-proof",
  qr: "start-proof",
  "qr-scan": "start-proof",
  barcode: "start-proof",
  "barcode-scan": "start-proof",
  detail: "job-detail",
  "job-detail": "job-detail",
  "work-order-detail": "job-detail",
  "vehicle-info": "job-detail",
  vehicle: "job-detail",
  "customer-info": "customer-summary",
  customer: "customer-summary",
  "package-info": "job-detail",
  "service-info": "job-detail",
  "service-package": "job-detail",
  start: "start-proof",
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
  saved: "save-success",
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
  unauthorized: "unauthorized",
  "operation-failed": "operation-failed",
  "general-error": "operation-failed",
  "profile-setting-detail": "profile-setting-detail",
  modules: "tests",
  tests: "tests",
  "expertise-headings": "tests",
  "inspection-headings": "tests",
  headings: "tests",
  issues: "missing",
  blockingissues: "blockingIssues",
  "blocking-issues": "blockingIssues",
  missing: "missing",
  defect: "missing",
  "defect-detail": "missing",
  "issue-detail": "missing",
  "missing-detail": "missing",
  claim: "lock",
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
  handover: "section-owned",
  "manager-takeover": "section-owned",
  "manager-request": "section-owned",
  "manager-takeover-request": "section-owned",
  "permission-request": "permissionDenied",
  "module-control": "moduleControl",
  "item-detail": "itemDetail",
  "status-modal": "statusModal",
  "body-panel": "itemDetail",
  kaporta: "itemDetail",
  paint: "itemDetail",
  "paint-measurement": "itemDetail",
  mechanic: "statusModal",
  mechanical: "statusModal",
  motor: "statusModal",
  engine: "statusModal",
  electric: "statusModal",
  obd: "statusModal",
  brake: "statusModal",
  suspension: "statusModal",
  interior: "moduleControl",
  exterior: "moduleControl",
  tire: "moduleControl",
  wheel: "moduleControl",
  "road-test": "moduleControl",
  evidence: "evidence",
  "photo-evidence": "evidence",
  "video-evidence": "evidence",
  camera: "camera",
  "photo-approval": "photoApproval",
  "photo-upload-error": "photoUploadError",
  note: "statusModal",
  "note-entry": "statusModal",
  "customer-summary": "customer-summary",
  customersummary: "customer-summary",
  "final-report": "final-report",
  finalreport: "final-report",
  "report-preview": "final-report",
  "preview-report": "final-report",
  "work-summary": "summary",
  "approval-waiting": "summary",
  approvalwaiting: "summary",
  "technical-approval": "summary",
  "send-technical-approval": "summary",
  "pending-approval": "summary",
  "approval-pending": "summary",
  completed: "summary",
  "completed-work": "summary",
  "completed-history": "summary",
  "history-detail": "summary",
  summary: "summary",
  returned: "returned",
  "returned-for-correction": "returned",
  notifications: "notifications",
  reports: "reports",
  help: "help",
  permissions: "permissions",
  "profile-info": "profile",
  "change-password": "reset-password",
  "notification-settings": "notifications",
  "theme-settings": "profile",
  "language-settings": "profile",
  "camera-settings": "profile",
  "report-settings": "reports",
  support: "help",
  "whatsapp-support": "help",
  "bug-report": "help",
  "user-guide": "help",
  "version-info": "profile",
  "offline-sync": "offline-sync",
  offlinesync: "offline-sync",
  sync: "offline-sync",
  "offline-data": "offline-sync",
  "sync-error": "sync-error",
  syncerror: "sync-error",
  "empty-state": "empty-state",
  emptystate: "empty-state",
  logout: "logout"
});

let createShell = null;
let referenceRouteOrder = [];
let getSupabaseRuntimeConfig = () => ({
  url: "",
  anonKey: "",
  accessToken: "",
  refreshToken: "",
  email: ""
});
let isAccessTokenExpired = () => false;
let validRoutes = new Set();
let routeByLowercase = new Map();
let activeRoute = "splash";
let bootstrapCompleted = false;
let requestedStartupRoute = null;
let splashDelayMs = 1000;
let modulesReady = false;
let splashResolveScheduled = false;

function initializeRouteState() {
  validRoutes = new Set(referenceRouteOrder);
  routeByLowercase = new Map(referenceRouteOrder.map((route) => [route.toLowerCase(), route]));
}

function resolveRoute(routeId) {
  if (!routeId) return "splash";
  const normalized = String(routeId).replace(/^#\/?/, "").replace(/^\/+/, "").trim();
  const lowerRoute = normalized.toLowerCase();
  return routeAliases[lowerRoute] ?? routeByLowercase.get(lowerRoute) ?? (validRoutes.has(normalized) ? normalized : normalized);
}

function getRouteFromHash() {
  return resolveRoute(window.location.hash);
}

function clearAuthStorage() {
  authStorageKeys.forEach((key) => localStorage.removeItem(key));
  const workOrderStatusKeys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("ototrWorkOrderStatus:")) workOrderStatusKeys.push(key);
  }
  workOrderStatusKeys.forEach((key) => localStorage.removeItem(key));
  authSessionStorageKeys.forEach((key) => sessionStorage.removeItem(key));
}

window.ototrClearAuthStorage = clearAuthStorage;

function hasValidLiveSession() {
  if (localStorage.getItem("ototrAuth") !== "true") return false;
  if (localStorage.getItem("ototrAuthMode") === "test-user") return true;
  const config = getSupabaseRuntimeConfig();
  const hasAccessToken = Boolean(config.accessToken);
  const hasRefreshToken = Boolean(config.refreshToken);
  if (!hasAccessToken && !hasRefreshToken) {
    clearAuthStorage();
    return false;
  }
  if (hasAccessToken && !isAccessTokenExpired(config.accessToken)) return true;
  if (hasRefreshToken) return true;
  clearAuthStorage();
  return false;
}

function getInitialRoute() {
  const hasAuth = hasValidLiveSession();
  const selectedBranch = localStorage.getItem("ototrBranch");

  if (!hasAuth) return "login";
  if (!selectedBranch) return "branch";
  return "home";
}

function getAllowedRoute(route) {
  if (route === "logout") {
    clearAuthStorage();
    return "login";
  }
  if (publicRoutes.has(route)) return route;

  const hasAuth = hasValidLiveSession();
  const selectedBranch = localStorage.getItem("ototrBranch");

  if (route === "branch") return hasAuth ? "branch" : "login";
  if (!hasAuth) return "login";
  if (!selectedBranch) return "branch";
  return route;
}

function renderStartupError(error) {
  const safeMessage = String(error?.stack || error?.message || error || "Bilinmeyen hata");
  document.body.style.margin = "0";
  document.body.style.minHeight = "100vh";
  document.body.style.background = "#050505";
  document.body.style.display = "grid";
  document.body.style.placeItems = "center";
  document.body.style.padding = "24px";

  const shell = document.createElement("main");
  shell.setAttribute("aria-live", "assertive");
  shell.style.width = "100%";
  shell.style.display = "grid";
  shell.style.placeItems = "center";

  const card = document.createElement("section");
  card.style.cssText = [
    "display:flex",
    "flex-direction:column",
    "gap:12px",
    "width:min(92vw, 420px)",
    "margin:auto",
    "padding:24px",
    "border-radius:24px",
    "background:#ffffff",
    "box-shadow:0 24px 64px rgba(15,23,42,0.16)",
    "font-family:Inter, Arial, sans-serif",
    "color:#0f172a"
  ].join(";");

  const title = document.createElement("h1");
  title.textContent = "Uygulama baslatilamadi";
  title.style.cssText = "margin:0;font-size:24px;line-height:1.2;";

  const description = document.createElement("p");
  description.textContent = "Baslangic sirasinda bir hata olustu. Teknik ekip kaydi inceleyerek duzeltme uygulayacak.";
  description.style.cssText = "margin:0;font-size:14px;line-height:1.5;color:#475569;";

  const detail = document.createElement("pre");
  detail.textContent = safeMessage;
  detail.style.cssText = [
    "margin:0",
    "padding:12px",
    "border-radius:16px",
    "background:#0f172a",
    "color:#f8fafc",
    "font-size:12px",
    "line-height:1.45",
    "white-space:pre-wrap",
    "word-break:break-word"
  ].join(";");

  card.append(title, description, detail);
  shell.append(card);
  if (app) {
    app.replaceChildren(shell);
  } else {
    document.body.replaceChildren(shell);
  }
  console.error(safeMessage);
}

function render() {
  if (!modulesReady || typeof createShell !== "function") return;
  app.replaceChildren(createShell(activeRoute, navigate));
  console.info(JSON.stringify({
    kind: "route-render",
    route: activeRoute,
    appHtml: app?.innerHTML?.slice(0, 240) ?? ""
  }));
}

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

function renderSplashAndResolveStart() {
  if (bootstrapCompleted) return;
  const route = requestedStartupRoute && requestedStartupRoute !== "splash"
    ? requestedStartupRoute
    : getInitialRoute();
  requestedStartupRoute = null;
  bootstrapCompleted = true;
  navigate(route);
}

function scheduleSplashResolve() {
  if (splashResolveScheduled) return;
  splashResolveScheduled = true;
  setTimeout(renderSplashAndResolveStart, splashDelayMs);
}

async function bootstrapApp() {
  try {
    const [{ createShell: loadedCreateShell }, dataModule, sessionModule] = await Promise.all([
      import("./components/ui.js"),
      import("./data/mock-data.js"),
      import("./services/supabaseSessionService.js")
    ]);

    createShell = loadedCreateShell;
    referenceRouteOrder = dataModule.referenceRouteOrder;
    getSupabaseRuntimeConfig = sessionModule.getSupabaseRuntimeConfig;
    isAccessTokenExpired = sessionModule.isAccessTokenExpired;
    initializeRouteState();
    splashDelayMs = Math.floor(Math.random() * (1500 - 800 + 1)) + 800;
    modulesReady = true;

    const startupRoute = resolveRoute(window.location.hash);
    if (startupRoute === "logout") clearAuthStorage();
    else if (startupRoute !== "splash") requestedStartupRoute = startupRoute;

    activeRoute = "splash";
    render();
    scheduleSplashResolve();

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
  } catch (error) {
    renderStartupError(error);
  }
}

bootstrapApp();
