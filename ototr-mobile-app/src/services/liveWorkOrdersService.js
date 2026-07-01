import { supabaseRequest } from "./supabaseHttpClient.js";
import {
  getCanonicalInspectionPackageCode,
  getInspectionPackageModuleIds,
  getInspectionPackageModuleIdsFromIncludedModules,
  getInspectionPackageTaskKeys
} from "./inspectionPackageCatalog.js";
import {
  getSupabaseRuntimeConfig,
  normalizeSupabaseUrl,
  refreshSupabaseAccessToken
} from "./supabaseSessionService.js";
import { OTOTR_EXPERTISE_TEST_MODULES } from "../data/ototrExpertiseTestModules.js";

const liveWorkOrdersStorageKey = "ototrLiveWorkOrders";
const legacyLiveWorkOrdersStorageKey = "ototr-dealer-live-workorders-v1";
const liveWorkOrdersSyncKey = "ototrLiveWorkOrdersLastSync";
const completedRemoteStatuses = new Set(["SUBMITTED", "REPORT_GATE_READY", "MANAGER_REVIEW", "TECHNICAL_REVIEW", "APPROVED", "COMPLETED", "DELIVERED"]);
const startedMobileStatuses = new Set(["in_progress", "test_missing", "returned_for_correction", "completed", "technical_review"]);
const technicalDoneStatuses = new Set(["SUBMITTED", "REPORT_GATE_READY", "MANAGER_REVIEW", "TECHNICAL_REVIEW", "APPROVED", "COMPLETED", "DELIVERED"]);
const fastRequiredFields = Object.freeze(["customer", "phone", "plate", "vin", "engine_no", "vehicle_make", "vehicle_model", "model_year", "package_type"]);
const fullExtraRequiredFields = Object.freeze([
  "customer",
  "phone",
  "tax_no",
  "customer_type",
  "contact_permission",
  "spare_key",
  "seller",
  "seller_phone",
  "seller_tax_no",
  "seller_type",
  "seller_contact_permission",
  "engine_no",
  "vehicle_variant",
  "fuel",
  "transmission",
  "report_channels",
  "vehicle_source",
  "arrival_channel",
  "test_drive_permission",
  "arrival_status",
  "key_delivery",
  "registration_delivery",
  "belongings_status",
  "customer_waiting",
  "vehicle_dropped",
  "consent_kvkk",
  "service_terms_consent",
  "media_consent",
  "digital_report_consent"
]);
const moduleItemCounts = Object.freeze(
  Object.fromEntries(
    OTOTR_EXPERTISE_TEST_MODULES.map((module) => [
      module.moduleId || module.key,
      Number(module.itemCount || module.items?.length || 0)
    ])
  )
);

export function toMobileWorkOrderStatus(remoteStatus = "") {
  const status = String(remoteStatus || "").toUpperCase();
  if (["TECHNICAL_ENTRY_OPEN", "OPEN", "IN_PROGRESS", "ASSIGNED"].includes(status)) return "in_progress";
  if (["DRAFT", "LOCKED", "AVAILABLE", "START_EVIDENCE_REQUIRED"].includes(status)) return "waiting_start_proof";
  if (["EVIDENCE_MISSING", "MANAGER_RETURNED", "RETURNED"].includes(status)) return "test_missing";
  if (["SUBMITTED", "REPORT_GATE_READY", "MANAGER_REVIEW", "TECHNICAL_REVIEW", "APPROVED", "COMPLETED", "DELIVERED"].includes(status)) return "completed";
  return "waiting_start_proof";
}

function formatKm(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return "0 km";
  return `${new Intl.NumberFormat("tr-TR").format(numeric)} km`;
}

function parseVehicleTextForLegacy(rawVehicle = "") {
  const text = String(rawVehicle || "").trim();
  if (!text) return {};
  const parts = text.split(/\s+/).filter(Boolean);
  const year = parts.find((part) => /^\d{4}$/.test(part)) || "";
  const yearIndex = year ? parts.indexOf(year) : -1;
  const beforeYear = yearIndex > 0 ? parts.slice(0, yearIndex).join(" ") : parts.join(" ");
  const afterYear = yearIndex >= 0 ? parts.slice(yearIndex + 1).join(" ") : "";
  const [brandFromText, ...rest] = beforeYear.split(" ");
  const modelFromText = rest.join(" ").trim() || afterYear.trim();

  return {
    brand: (brandFromText || "").trim(),
    model: modelFromText,
    year: year || "",
    brandModel: text
  };
}

function parseLegacyWorkOrderRow(rawRow = {}) {
  const row = typeof rawRow === "object" && rawRow !== null ? rawRow : {};
  const rawStatus = row.status || row.liveStatus || row.finalReportStatus || row.workflow_status || "";
  const mappedStatus = toMobileWorkOrderStatus(rawStatus);
  const workOrderNo = row.workOrderNo || row.work_order_no || row.code || row.id || "";
  const vehicle = parseVehicleTextForLegacy(row.vehicle || row.vehicleText || row.vehicle_info);
  const plate = String(row.plate || row.plaka || "").trim() || "PLAKA YOK";
  const brand = String(row.brand || vehicle.brand || "").trim();
  const model = String(row.model || vehicle.model || "").trim();
  const year = String(row.year || row.yıl || vehicle.year || "").trim();
  const brandModel = row.brandModel || row.vehicle || `${brand} ${model}`.trim();
  const packageName = String(row.packageName || row.package || row.paket || row.package_type || "Ekspertiz").trim();
  const packageCode = getCanonicalInspectionPackageCode(row.packageCode || row.package_code || packageName);
  const progressRaw = Number.parseInt(row.progress, 10);

  return {
    ...row,
    id: row.id || workOrderNo,
    expertiseCaseId: row.expertiseCaseId || row.supabaseId || workOrderNo,
    workOrderNo,
    plate,
    brand,
    model,
    brandModel: brandModel || `${brand || "Araç"} ${model || ""}`.trim(),
    year,
    packageName,
    packageCode,
    packageModuleIds: getInspectionPackageModuleIdsFromIncludedModules(row.package_modules, packageCode),
    packageTaskKeys: getInspectionPackageTaskKeys(packageCode),
    km: formatKm(row.km || row.kilometre || row.mileage || row.mileage_km),
    vin: String(row.vin || row.vin_no || row.chasis || row.chassis || "").trim(),
    status: mappedStatus || "waiting_start_proof",
    progress: Number.isFinite(progressRaw) ? Math.min(100, Math.max(0, progressRaw)) : mappedStatus === "completed" ? 100 : 0,
    completedItems: Number.parseInt(row.completedItems || row.completed_items, 10) || 0,
    totalItems: Number.parseInt(row.totalItems || row.total_items, 10) || 60,
    missingCount: Number(row.missingCount || row.missing_count || 0) || (mappedStatus === "test_missing" ? 1 : 0),
    photoCount: Number(row.photoCount || row.photo_count || 0) || 0,
    branchName: String(row.branchName || row.branch || row.bayi || "Seçili Şube").trim(),
    assignedTechnician: String(row.assignedTechnician || row.technician || localStorage.getItem("ototrUser") || "Ahmet Usta").trim(),
    plannedTime: row.plannedTime || row.planned_time || "45 dk",
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
    customerVisibleName: String(
      row.customerVisibleName || row.customer || row.müşteri || row.customer_name || row.buyer || row.owner || "Müşteri"
    ).trim(),
    returnReason: row.returnReason || row.return_reason || null,
    image: imageKeyFromBrand(brand),
    source: "legacy-dealer-portal",
    sourcePayload: row
  };
}

function imageKeyFromBrand(brand = "") {
  const normalized = String(brand).toLowerCase();
  if (normalized.includes("volkswagen")) return "passat";
  if (normalized.includes("renault")) return "megane";
  if (normalized.includes("peugeot")) return "peugeot";
  if (normalized.includes("toyota")) return "corolla";
  if (normalized.includes("ford")) return "focus";
  return "bmw";
}

function expectedPackageItemCount(packageCode = "") {
  return getInspectionPackageModuleIds(packageCode)
    .reduce((sum, moduleId) => sum + Number(moduleItemCounts[moduleId] || 0), 0);
}

function digitsOnly(value = "") {
  return String(value || "").replace(/\D+/g, "");
}

function normalizeValue(value = "") {
  return String(value || "").trim();
}

function hasMeaningfulValue(value = "") {
  return normalizeValue(value).length > 0;
}

function isSignedConsent(value = "") {
  const normalized = normalizeValue(value).toLocaleLowerCase("tr-TR");
  return normalized === "imzalandi" || normalized === "imzalandi";
}

function isValidPhone(value = "") {
  return digitsOnly(value).slice(-10).length === 10;
}

function isValidTaxNo(value = "") {
  return digitsOnly(value).length === 11;
}

function isValidVin(value = "") {
  return normalizeValue(value).replace(/\s+/g, "").length >= 17;
}

function isValidEngineNo(value = "") {
  const normalized = normalizeValue(value).replace(/\s+/g, "");
  return normalized.length >= 6 && normalized.length <= 17;
}

function isFieldComplete(row = {}, fieldName = "") {
  const value = row?.[fieldName];
  if (!hasMeaningfulValue(value)) return false;
  if (["phone", "seller_phone", "vehicle_owner_phone", "bringer_phone", "payer_phone", "report_recipient_phone"].includes(fieldName)) {
    return isValidPhone(value);
  }
  if (["tax_no", "seller_tax_no"].includes(fieldName)) return isValidTaxNo(value);
  if (fieldName === "vin") return isValidVin(value);
  if (fieldName === "engine_no") return isValidEngineNo(value);
  if (["consent_kvkk", "service_terms_consent", "media_consent", "digital_report_consent", "third_party_share_consent"].includes(fieldName)) {
    return isSignedConsent(value);
  }
  if (fieldName === "report_channels") return hasMeaningfulValue(value);
  return true;
}

function expectedInfoFields(row = {}, packageCode = "") {
  const fields = [...fastRequiredFields];
  if (packageCode === "FULL" || packageCode === "PREMIUM") fields.push(...fullExtraRequiredFields);
  if (normalizeValue(row?.test_drive_permission).toLocaleLowerCase("tr-TR") === "hayir") fields.push("test_drive_rejection_reason");
  if (normalizeValue(row?.vehicle_source) === "Galeri") fields.push("gallery_name");
  if (normalizeValue(row?.vehicle_source) === "Referans") fields.push("referrer_name");
  return [...new Set(fields)];
}

function liveProgressForCase(row = {}, packageCode = "", progressByCase = {}) {
  const caseId = row.id || "";
  const status = toMobileWorkOrderStatus(row.status);
  const progress = progressByCase[caseId] || {};
  const tasks = Array.isArray(progress.tasks) ? progress.tasks : [];
  const technicalTotal = Math.max(tasks.length, getInspectionPackageTaskKeys(packageCode).length, 1);
  const technicalDone = tasks.filter((task) => technicalDoneStatuses.has(String(task.status || "").toUpperCase())).length;
  const infoFields = expectedInfoFields(row, packageCode);
  const infoDone = infoFields.filter((fieldName) => isFieldComplete(row, fieldName)).length;
  const totalItems = Math.max(technicalTotal + infoFields.length, 1);
  let completedItems = technicalDone + infoDone;

  if (status === "completed") completedItems = totalItems;

  const safeCompleted = Math.min(totalItems, Math.max(0, completedItems));
  return {
    progress: Math.round((safeCompleted / totalItems) * 100),
    completedItems: safeCompleted,
    totalItems,
    photoCount: Number(progress.photoCount || 0),
    missingCount: status === "test_missing" ? Math.max(1, Number(progress.missingCount || 0)) : Number(progress.missingCount || 0),
    technicalDone,
    technicalTotal,
    infoDone,
    infoTotal: infoFields.length
  };
}

function mapLiveWorkOrder(row = {}, progressByCase = {}) {
  const vehicle = row.vehicles || {};
  const packagePlan = row.package_plans || {};
  const packageCode = getCanonicalInspectionPackageCode(packagePlan.code || packagePlan.name || row.package_type || "");
  const packageModuleIds = getInspectionPackageModuleIdsFromIncludedModules(packagePlan.included_modules, packageCode);
  const status = toMobileWorkOrderStatus(row.status);
  const liveProgress = liveProgressForCase(row, packageCode, progressByCase);

  return {
    id: row.id || row.work_order_no,
    expertiseCaseId: row.id || "",
    workOrderNo: row.work_order_no || "",
    plate: vehicle.plate || "PLAKA YOK",
    brand: vehicle.brand || "Araç",
    model: vehicle.model || "",
    brandModel: `${vehicle.brand || "Araç"} ${vehicle.model || ""}`.trim(),
    year: vehicle.model_year ? String(vehicle.model_year) : "",
    packageName: packagePlan.name || packagePlan.code || "Ekspertiz",
    packageCode,
    packageModuleIds,
    packageTaskKeys: getInspectionPackageTaskKeys(packageCode),
    km: formatKm(vehicle.mileage_km),
    vin: vehicle.vin || "",
    status,
    progress: liveProgress.progress,
    completedItems: liveProgress.completedItems,
    totalItems: liveProgress.totalItems,
    missingCount: liveProgress.missingCount,
    photoCount: liveProgress.photoCount,
    branchName: localStorage.getItem("ototrBranchName") || "Seçili Şube",
    assignedTechnician: localStorage.getItem("ototrUser") || "Ahmet Usta",
    plannedTime: packagePlan.duration_minutes ? `${packagePlan.duration_minutes} dk` : "45 dk",
    createdAt: row.created_at || new Date().toISOString(),
    customerVisibleName: "Müşteri",
    returnReason: status === "test_missing" ? "Düzeltme veya kanıt kontrolü gerekli" : null,
    image: imageKeyFromBrand(vehicle.brand),
    source: "supabase",
    progressSource: "supabase-live",
    technicalDone: liveProgress.technicalDone,
    technicalTotal: liveProgress.technicalTotal,
    infoDone: liveProgress.infoDone,
    infoTotal: liveProgress.infoTotal
  };
}

function groupRowsByCase(rows = []) {
  return rows.reduce((map, row) => {
    const caseId = row?.expertise_case_id;
    if (!caseId) return map;
    if (!map[caseId]) map[caseId] = [];
    map[caseId].push(row);
    return map;
  }, {});
}

function buildInFilter(ids = []) {
  return ids.map((id) => encodeURIComponent(id)).join(",");
}

async function fetchLiveInspectionProgress(url, config, accessToken, caseIds = []) {
  if (!caseIds.length) return {};
  const idFilter = buildInFilter(caseIds);
  const headers = {
    apikey: config.anonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };
  const [taskResponse, valueResponse, evidenceResponse] = await Promise.all([
    supabaseRequest(`${url}/rest/v1/inspection_tasks?select=id,expertise_case_id,status,task_key&expertise_case_id=in.(${idFilter})`, { headers }),
    supabaseRequest(`${url}/rest/v1/inspection_item_values?select=id,expertise_case_id,item_key,task_id,result,updated_at&expertise_case_id=in.(${idFilter})`, { headers }),
    supabaseRequest(`${url}/rest/v1/inspection_evidence_assets?select=id,expertise_case_id,sync_status,remote_url,is_required&expertise_case_id=in.(${idFilter})`, { headers })
  ]);

  if (!taskResponse.ok || !valueResponse.ok || !evidenceResponse.ok) return {};

  const tasks = await taskResponse.json().catch(() => []);
  const values = await valueResponse.json().catch(() => []);
  const evidence = await evidenceResponse.json().catch(() => []);
  const valuesByCase = groupRowsByCase(Array.isArray(values) ? values : []);
  const evidenceByCase = groupRowsByCase(Array.isArray(evidence) ? evidence : []);
  const tasksByCase = groupRowsByCase(Array.isArray(tasks) ? tasks : []);

  return caseIds.reduce((map, caseId) => {
    const answeredItems = new Set((valuesByCase[caseId] || []).map((value) => value.item_key || value.id).filter(Boolean));
    const caseEvidence = evidenceByCase[caseId] || [];
    const caseTasks = tasksByCase[caseId] || [];
    map[caseId] = {
      completedItems: answeredItems.size,
      totalItems: answeredItems.size,
      tasks: caseTasks,
      photoCount: caseEvidence.filter((item) => item.remote_url || String(item.sync_status || "").toUpperCase() === "UPLOADED").length,
      missingCount: caseTasks.filter((task) => ["RETURNED", "MANAGER_RETURNED", "EVIDENCE_MISSING"].includes(String(task.status || "").toUpperCase())).length
    };
    return map;
  }, {});
}

function readCachedWorkOrders() {
  try {
    const rows = parseLiveWorkOrdersFromStorage(localStorage.getItem(liveWorkOrdersStorageKey));
    const legacyRows = parseLegacyDealerPayload(localStorage.getItem(legacyLiveWorkOrdersStorageKey));
    return mergeWorkOrderRows(legacyRows, rows);
  } catch {
    return [];
  }
}

function writeCachedWorkOrders(rows = []) {
  localStorage.setItem(liveWorkOrdersStorageKey, JSON.stringify(rows));
  localStorage.setItem(legacyLiveWorkOrdersStorageKey, JSON.stringify({
    updatedAt: new Date().toISOString(),
    workOrders: rows
  }));
  localStorage.setItem(liveWorkOrdersSyncKey, new Date().toISOString());
}

function parseLiveWorkOrdersFromStorage(rawValue) {
  const rows = JSON.parse(rawValue || "[]");
  return Array.isArray(rows) ? rows : [];
}

function parseLegacyDealerPayload(rawValue) {
  if (!rawValue) return [];
  const parsed = JSON.parse(rawValue);
  if (!parsed) return [];
  if (Array.isArray(parsed)) return parsed;
  const legacyRows = parsed.workOrders || parsed.orders;
  if (Array.isArray(legacyRows)) return legacyRows.map((row) => parseLegacyWorkOrderRow(row));
  return [];
}

function getWorkOrderId(row = {}) {
  return String(row?.expertiseCaseId || row?.id || row?.workOrderNo || row?.code || "");
}

function mergeWorkOrderRows(first = [], second = []) {
  const byId = new Map();
  [...first, ...second].forEach((row) => {
    const key = getWorkOrderId(row);
    if (!key) return;
    byId.set(key, { ...byId.get(key), ...row });
  });
  return Array.from(byId.values());
}

export function getCachedLiveWorkOrders() {
  return readCachedWorkOrders();
}

export function patchCachedLiveWorkOrderStatus(expertiseCaseId, remoteStatus) {
  const rows = readCachedWorkOrders();
  const nextStatus = toMobileWorkOrderStatus(remoteStatus);
  const nextRows = rows.map((order) => {
    if (order.expertiseCaseId !== expertiseCaseId && order.id !== expertiseCaseId) return order;
    return {
      ...order,
      status: nextStatus,
      progress: nextStatus === "completed" ? 100 : nextStatus === "in_progress" ? Math.max(order.progress || 0, 35) : order.progress || 0,
      missingCount: nextStatus === "test_missing" ? Math.max(order.missingCount || 0, 1) : 0
    };
  });
  writeCachedWorkOrders(nextRows);
  return nextRows.find((order) => order.expertiseCaseId === expertiseCaseId || order.id === expertiseCaseId) || null;
}

export function getLiveWorkOrderSyncStatus() {
  const config = getSupabaseRuntimeConfig();
  return {
    configured: Boolean(normalizeSupabaseUrl(config.url) && config.anonKey),
    authenticated: Boolean(config.accessToken),
    refreshable: Boolean(config.refreshToken),
    lastSync: localStorage.getItem(liveWorkOrdersSyncKey) || ""
  };
}

export async function syncLiveWorkOrders() {
  const config = getSupabaseRuntimeConfig();
  const url = normalizeSupabaseUrl(config.url);
  if (!url || !config.anonKey || !config.accessToken) {
    return {
      ok: false,
      status: "not-configured",
      rows: readCachedWorkOrders(),
      reason: "Canlı iş emri için Supabase URL, publishable key ve kullanıcı oturumu gerekli."
    };
  }

  const session = await refreshSupabaseAccessToken().catch(() => null);
  let accessToken = session?.ok ? session.accessToken : config.accessToken;
  const query = [
    "select=*,vehicles(plate,vin,brand,model,model_year,mileage_km),package_plans(code,name,duration_minutes,included_modules)",
    "order=created_at.desc",
    "limit=20"
  ].join("&");
  const requestRows = (token) => supabaseRequest(`${url}/rest/v1/expertise_cases?${query}`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  let response = await requestRows(accessToken);

  if (response.status === 401 && config.refreshToken) {
    const refreshed = await refreshSupabaseAccessToken({ force: true }).catch(() => null);
    if (refreshed?.ok && refreshed.accessToken) {
      accessToken = refreshed.accessToken;
      response = await requestRows(accessToken);
    }
  }

  if (!response.ok) {
    const reason = await response.text().catch(() => "");
    return {
      ok: false,
      status: `http-${response.status}`,
      rows: readCachedWorkOrders(),
      reason: reason || `Canlı iş emri okunamadı: HTTP ${response.status}`
    };
  }

  const rows = await response.json().catch(() => []);
  const businessRows = Array.isArray(rows)
    ? rows.filter((row) => !String(row.work_order_no || "").startsWith("RLS-"))
    : [];
  const caseIds = businessRows.map((row) => row.id).filter(Boolean);
  const progressByCase = await fetchLiveInspectionProgress(url, config, accessToken, caseIds).catch(() => ({}));
  const mapped = businessRows.map((row) => mapLiveWorkOrder(row, progressByCase));
  writeCachedWorkOrders(mapped);
  return { ok: true, status: "synced", rows: mapped };
}
