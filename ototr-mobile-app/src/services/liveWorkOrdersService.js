import { supabaseRequest } from "./supabaseHttpClient.js";
import {
  getCanonicalInspectionPackageCode,
  getInspectionPackageModuleIds,
  getInspectionPackageTaskKeys
} from "./inspectionPackageCatalog.js";
import {
  getSupabaseRuntimeConfig,
  normalizeSupabaseUrl,
  refreshSupabaseAccessToken
} from "./supabaseSessionService.js";

const liveWorkOrdersStorageKey = "ototrLiveWorkOrders";
const liveWorkOrdersSyncKey = "ototrLiveWorkOrdersLastSync";

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

function imageKeyFromBrand(brand = "") {
  const normalized = String(brand).toLowerCase();
  if (normalized.includes("volkswagen")) return "passat";
  if (normalized.includes("renault")) return "megane";
  if (normalized.includes("peugeot")) return "peugeot";
  if (normalized.includes("toyota")) return "corolla";
  if (normalized.includes("ford")) return "focus";
  return "bmw";
}

function mapLiveWorkOrder(row = {}) {
  const vehicle = row.vehicles || {};
  const packagePlan = row.package_plans || {};
  const packageCode = getCanonicalInspectionPackageCode(packagePlan.code || packagePlan.name || row.package_type || "");
  const packageModuleIds = getInspectionPackageModuleIds(packageCode);
  const status = toMobileWorkOrderStatus(row.status);
  const progress = status === "completed" ? 100 : status === "in_progress" ? 35 : 0;
  const totalItems = 60;
  const completedItems = Math.max(0, Math.min(totalItems, Math.round((progress / 100) * totalItems)));

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
    progress,
    completedItems,
    totalItems,
    missingCount: status === "test_missing" ? 1 : 0,
    photoCount: 0,
    branchName: localStorage.getItem("ototrBranchName") || "Seçili Şube",
    assignedTechnician: localStorage.getItem("ototrUser") || "Ahmet Usta",
    plannedTime: packagePlan.duration_minutes ? `${packagePlan.duration_minutes} dk` : "45 dk",
    createdAt: row.created_at || new Date().toISOString(),
    customerVisibleName: "Müşteri",
    returnReason: status === "test_missing" ? "Düzeltme veya kanıt kontrolü gerekli" : null,
    image: imageKeyFromBrand(vehicle.brand),
    source: "supabase"
  };
}

function readCachedWorkOrders() {
  try {
    const rows = JSON.parse(localStorage.getItem(liveWorkOrdersStorageKey) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeCachedWorkOrders(rows = []) {
  localStorage.setItem(liveWorkOrdersStorageKey, JSON.stringify(rows));
  localStorage.setItem(liveWorkOrdersSyncKey, new Date().toISOString());
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
    "select=id,work_order_no,status,created_at,vehicles(plate,vin,brand,model,model_year,mileage_km),package_plans(code,name,duration_minutes,included_modules)",
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
  const mapped = businessRows.map(mapLiveWorkOrder);
  writeCachedWorkOrders(mapped);
  return { ok: true, status: "synced", rows: mapped };
}
