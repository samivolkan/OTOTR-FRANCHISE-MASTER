import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const errors = [];

const source = readFileSync(resolve(appRoot, "src/screens/phase2-screens.js"), "utf8");
const css = readFileSync(resolve(appRoot, "src/styles/components.css"), "utf8");
const { phase2ComponentRoutes } = await import(pathToFileURL(resolve(appRoot, "src/data/mock-data.js")).href);

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const criticalRoutes = [
  "tests",
  "moduleControl",
  "itemDetail",
  "statusModal",
  "evidence",
  "camera",
  "photoApproval",
  "missing",
  "final-report",
  "approval-waiting"
];

for (const route of criticalRoutes) {
  assert(phase2ComponentRoutes.includes(route), `Kritik route component listesinde yok: ${route}`);
}

const requiredRenderers = [
  "tests: () => renderModules(onNavigate)",
  "moduleControl: () => renderModuleControl(onNavigate)",
  "itemDetail: () => renderItemDetail(onNavigate)",
  "statusModal: () => renderStatusModal(onNavigate)",
  "evidence: () => renderEvidence(onNavigate)",
  "camera: () => renderCamera(onNavigate)",
  "photoApproval: () => renderPhotoApproval(onNavigate)",
  "missing: () => renderMissingIssues(onNavigate)",
  "\"final-report\": () => renderFinalReportPreview(onNavigate)",
  "\"approval-waiting\": () => renderApprovalWaiting(onNavigate)"
];

for (const renderer of requiredRenderers) {
  assert(source.includes(renderer), `Kritik renderer baglantisi eksik: ${renderer}`);
}

const requiredWorkflowMarkers = [
  "function recordWorkflowStep",
  "module_selected",
  "module_control_selected",
  "item_detail_status_requested",
  "status_selection_saved",
  "evidence_slot_selected",
  "camera_capture_ready",
  "camera_capture_used",
  "form_option_selected",
  "form_input_changed",
  "form_description_changed",
  "form_photo_slot_toggled",
  "missing-issue-action",
  "final_report_blocked",
  "work_order_completed_viewed",
  "completed_reports_requested"
];

for (const marker of requiredWorkflowMarkers) {
  assert(source.includes(marker), `Workflow state marker eksik: ${marker}`);
}

assert(
  source.includes("resolveModuleControlTone(module.tone, module.status)"),
  "Modul kontrol tone helper cagrisi eksik."
);
assert(
  !source.includes("normalizeModuleControlTone"),
  "Modul kontrol ekraninda tanimsiz normalizeModuleControlTone cagrisi kalmamali."
);
assert(
  source.includes("form.items.slice(0, count).forEach((item, index) => wrap.append(formItemCard(item, index === 0)))"),
  "Form preview ilk karti acik render etmeli."
);

const requiredCssMarkers = [
  "button.evidence-slot-card",
  ".option-chip.selected",
  ".input-grid input",
  ".textarea-field textarea",
  ".photo-slot.is-complete"
];

for (const marker of requiredCssMarkers) {
  assert(css.includes(marker), `Component UI CSS marker eksik: ${marker}`);
}

for (const forbidden of [
  'button("Onayla"',
  '"Onayla"',
  "Raporu Onayla",
  "Devri Onayla",
  "Kanıtı Onayla",
  "Approve Report"
]) {
  assert(!source.includes(forbidden), `Yasak metin bulundu: ${forbidden}`);
}

if (errors.length) {
  console.error("Workflow component dogrulamasi basarisiz:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Workflow component dogrulamasi gecti: kritik is akisi ekranlari component UI ve state markerlariyla bagli.");
