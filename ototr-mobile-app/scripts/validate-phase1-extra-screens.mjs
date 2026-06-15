import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const errors = [];

const screenSource = readFileSync(resolve(appRoot, "src/screens/phase2-screens.js"), "utf8");
const appSource = readFileSync(resolve(appRoot, "src/app.js"), "utf8");
const css = readFileSync(resolve(appRoot, "src/styles/components.css"), "utf8");
const { phase2ComponentRoutes, referenceRouteOrder } = await import(pathToFileURL(resolve(appRoot, "src/data/mock-data.js")).href);

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const extraRoutes = [
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
];

for (const route of extraRoutes) {
  assert(referenceRouteOrder.includes(route), `referenceRouteOrder eksik: ${route}`);
  assert(phase2ComponentRoutes.includes(route), `phase2ComponentRoutes eksik: ${route}`);
  assert(appSource.includes(`"${route}"`), `route alias kaydi eksik: ${route}`);
}

const requiredRenderers = [
  "\"section-owned\": () => renderSectionOwnedSuccess(onNavigate)",
  "\"manager-takeover-success\": () => renderManagerTakeoverSuccess(onNavigate)",
  "\"save-success\": () => renderSaveSuccess(onNavigate)",
  "\"save-continue\": () => renderSaveAndContinue(onNavigate)",
  "\"unsaved-changes\": () => renderUnsavedChangesWarning(onNavigate)",
  "\"discard-changes\": () => renderDiscardChangesConfirm(onNavigate)",
  "\"section-completed\": () => renderSectionCompletedSuccess(onNavigate)",
  "\"all-sections-completed\": () => renderAllSectionsCompleted(onNavigate)",
  "\"report-created\": () => renderReportCreatedSuccess(onNavigate)",
  "\"required-fields-missing\": () => renderRequiredFieldsMissing(onNavigate)",
  "\"evidence-sync-queue\": () => renderEvidenceSyncQueue(onNavigate)",
  "\"offline-warning\": () => renderOfflineWorkWarning(onNavigate)",
  "\"task-transfer-confirm\": () => renderTaskTransferConfirm(onNavigate)",
  "\"task-transferred\": () => renderTaskTransferredSuccess(onNavigate)",
  "\"pre-approval-check\": () => renderPreApprovalCheck(onNavigate)",
  "\"technical-approval-submitted\": () => renderTechnicalApprovalSubmitted(onNavigate)",
  "\"technical-revision-request\": () => renderTechnicalRevisionRequest(onNavigate)",
  "\"approved-locked-report\": () => renderApprovedLockedReport(onNavigate)",
  "\"cancelled-job\": () => renderCancelledJobDetail(onNavigate)",
  "\"unauthorized\": () => renderUnauthorizedAction(onNavigate)",
  "\"operation-failed\": () => renderOperationFailed(onNavigate)",
  "\"profile-setting-detail\": () => renderProfileSettingDetail(onNavigate)"
];

for (const renderer of requiredRenderers) {
  assert(screenSource.includes(renderer), `renderer baglantisi eksik: ${renderer}`);
}

for (const marker of [
  "function extraStateMain",
  "function extraInfoGrid",
  "function extraChecklist",
  "function extraTimeline",
  "fullscreenTransitionRoutes.has(activeRoute)",
  "onNavigate(\"pre-approval-check\")",
  ".phase1-extra-main",
  ".phase1-extra-info-grid",
  ".phase1-extra-checklist",
  ".phase1-extra-progress-card"
]) {
  const haystack = marker.startsWith(".") ? css : screenSource;
  assert(haystack.includes(marker), `Faz 1 ek ekran marker eksik: ${marker}`);
}

assert(!screenSource.includes("Raporu Onayla"), "Yasak onay metni geri gelmemeli.");
assert(!screenSource.includes("Approve Report"), "Ingilizce approve metni olmamali.");

if (errors.length) {
  console.error("Faz 1 ek ekran dogrulamasi basarisiz:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Faz 1 ek ekran dogrulamasi gecti: ${extraRoutes.length} route component UI olarak bagli.`);
