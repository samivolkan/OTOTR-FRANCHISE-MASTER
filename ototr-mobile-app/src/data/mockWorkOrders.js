import { getCachedLiveWorkOrders } from "../services/liveWorkOrdersService.js";
import { getSupabaseRuntimeConfig, isAccessTokenExpired } from "../services/supabaseSessionService.js";

export const workOrderStatusLabels = Object.freeze({
  waiting_start_proof: "Kanıt Bekliyor",
  start_proof_incomplete: "Kanıt Eksik",
  in_progress: "Devam Ediyor",
  test_missing: "Eksik / Uyarı",
  technical_review: "Tamamlandı",
  completed: "Tamamlandı",
  returned_for_correction: "Düzeltme İstendi"
});

export const workOrderStatusTones = Object.freeze({
  waiting_start_proof: "warning",
  start_proof_incomplete: "red",
  in_progress: "success",
  test_missing: "red",
  technical_review: "purple",
  completed: "success",
  returned_for_correction: "red"
});

export const mockWorkOrders = Object.freeze([
  {
    id: "WO-001",
    plate: "16 ABC 123",
    brand: "BMW",
    model: "3 Serisi",
    brandModel: "BMW 3 Serisi",
    year: "2021",
    packageName: "320i",
    packageCode: "PREMIUM",
    km: "45.000 km",
    vin: "NMTBB29E08R123456",
    status: "in_progress",
    progress: 65,
    completedItems: 34,
    totalItems: 60,
    missingCount: 0,
    photoCount: 8,
    branchName: "Bursa Küçük Sanayi Şubesi",
    assignedTechnician: "Ahmet Usta",
    plannedTime: "45 dk",
    createdAt: "2026-06-10T09:00:00Z",
    customerVisibleName: "M*** T***",
    returnReason: null,
    image: "bmw"
  },
  {
    id: "WO-002",
    plate: "34 DFG 456",
    brand: "Volkswagen",
    model: "Passat",
    brandModel: "Volkswagen Passat",
    year: "2020",
    packageName: "1.6 TDI",
    packageCode: "STANDARD",
    km: "62.500 km",
    vin: "WVWZZZ3CZLE123456",
    status: "waiting_start_proof",
    progress: 0,
    missingCount: 0,
    photoCount: 2,
    branchName: "Bursa Küçük Sanayi Şubesi",
    assignedTechnician: "Ahmet Usta",
    plannedTime: "35 dk",
    createdAt: "2026-06-09T15:20:00Z",
    customerVisibleName: "A*** K***",
    returnReason: null,
    image: "passat"
  },
  {
    id: "WO-003",
    plate: "35 KLM 789",
    brand: "Renault",
    model: "Megane",
    brandModel: "Renault Megane",
    year: "2019",
    packageName: "1.5 dCi",
    packageCode: "STANDARD",
    km: "78.300 km",
    vin: "VF1RFB006K1234567",
    status: "in_progress",
    progress: 42,
    completedItems: 18,
    totalItems: 60,
    missingCount: 0,
    photoCount: 4,
    branchName: "Bursa Küçük Sanayi Şubesi",
    assignedTechnician: "Ahmet Usta",
    plannedTime: "22 dk",
    createdAt: "2026-06-08T12:10:00Z",
    customerVisibleName: "S*** Y***",
    returnReason: null,
    image: "megane"
  },
  {
    id: "WO-004",
    plate: "16 HJK 321",
    brand: "Peugeot",
    model: "508",
    brandModel: "Peugeot 508",
    year: "2022",
    packageName: "1.5 BlueHDi",
    packageCode: "FULL",
    km: "33.100 km",
    vin: "VF38EHYHZML123456",
    status: "waiting_start_proof",
    progress: 0,
    completedItems: 0,
    totalItems: 60,
    missingCount: 0,
    photoCount: 0,
    branchName: "Bursa Küçük Sanayi Şubesi",
    assignedTechnician: "Ahmet Usta",
    plannedTime: "28 dk",
    createdAt: "2026-06-07T08:44:00Z",
    customerVisibleName: "Y*** M***",
    returnReason: null,
    image: "peugeot"
  }
]);

export function getWorkOrderTargetRoute(workOrder) {
  if (workOrder.status === "waiting_start_proof" || workOrder.status === "start_proof_incomplete") {
    return "start-proof";
  }

  if (workOrder.status === "in_progress") {
    return "tests";
  }

  if (workOrder.status === "test_missing" || workOrder.status === "returned_for_correction") {
    return "missing";
  }

  if (workOrder.status === "technical_review") {
    return "summary";
  }

  if (workOrder.status === "completed") {
    return "summary";
  }

  return "job-detail";
}

const selectedWorkOrderStorageKey = "ototrSelectedWorkOrder";
const selectedWorkOrderSnapshotStorageKey = "ototrSelectedWorkOrderSnapshot";

function readSelectedWorkOrderSnapshot() {
  try {
    const parsed = JSON.parse(localStorage.getItem(selectedWorkOrderSnapshotStorageKey) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function findMatchingWorkOrder(orders, selected = {}) {
  const candidates = new Set([
    selected.id,
    selected.expertiseCaseId,
    selected.workOrderNo,
    selected.plate
  ].filter(Boolean).map(String));
  if (!candidates.size) return null;
  return orders.find((order) => [
    order.id,
    order.expertiseCaseId,
    order.workOrderNo,
    order.plate
  ].some((value) => value && candidates.has(String(value)))) || null;
}

function createSelectedWorkOrderSnapshot(workOrder = {}) {
  return {
    id: workOrder.id || workOrder.expertiseCaseId || workOrder.workOrderNo || workOrder.plate || "",
    expertiseCaseId: workOrder.expertiseCaseId || "",
    workOrderNo: workOrder.workOrderNo || "",
    plate: workOrder.plate || "",
    brand: workOrder.brand || "",
    model: workOrder.model || "",
    brandModel: workOrder.brandModel || "",
    year: workOrder.year || "",
    packageName: workOrder.packageName || "",
    packageCode: workOrder.packageCode || "",
    packageModuleIds: workOrder.packageModuleIds || [],
    packageTaskKeys: workOrder.packageTaskKeys || [],
    km: workOrder.km || "",
    vin: workOrder.vin || "",
    status: workOrder.status || "",
    progress: workOrder.progress || 0,
    completedItems: workOrder.completedItems || 0,
    totalItems: workOrder.totalItems || 60,
    missingCount: workOrder.missingCount || 0,
    photoCount: workOrder.photoCount || 0,
    branchName: workOrder.branchName || "",
    assignedTechnician: workOrder.assignedTechnician || "",
    plannedTime: workOrder.plannedTime || "",
    createdAt: workOrder.createdAt || "",
    customerVisibleName: workOrder.customerVisibleName || "",
    returnReason: workOrder.returnReason || null,
    image: workOrder.image || "bmw",
    source: workOrder.source || "snapshot"
  };
}

export function getSelectedWorkOrder() {
  const selectedId = localStorage.getItem(selectedWorkOrderStorageKey);
  const selectedSnapshot = readSelectedWorkOrderSnapshot();
  const orders = getRuntimeWorkOrders();
  const selected = findMatchingWorkOrder(orders, { id: selectedId, ...selectedSnapshot });
  if (selected) return selected;
  if (hasUsableAuthState() && (selectedSnapshot.id || selectedSnapshot.plate || selectedSnapshot.expertiseCaseId)) {
    return applyLocalWorkOrderStatusOverrides([selectedSnapshot])[0] || selectedSnapshot;
  }
  if (orders.length) return orders[0];
  if (!hasUsableAuthState()) return null;
  return mockWorkOrders[0];
}

export function setSelectedWorkOrder(workOrder) {
  if (!workOrder) return;
  const snapshot = createSelectedWorkOrderSnapshot(workOrder);
  localStorage.setItem(selectedWorkOrderStorageKey, snapshot.id);
  localStorage.setItem(selectedWorkOrderSnapshotStorageKey, JSON.stringify(snapshot));
}

export function getRuntimeWorkOrders() {
  const liveOrders = getCachedLiveWorkOrders();
  if (liveOrders.length) return applyLocalWorkOrderStatusOverrides(liveOrders);
  if (!hasUsableAuthState()) return [];
  return applyLocalWorkOrderStatusOverrides(mockWorkOrders);
}

function hasUsableAuthState() {
  if (localStorage.getItem("ototrAuth") !== "true") return false;
  if (localStorage.getItem("ototrAuthMode") === "test-user") return true;
  const config = getSupabaseRuntimeConfig();
  if (config.accessToken && !isAccessTokenExpired(config.accessToken)) return true;
  return Boolean(config.refreshToken);
}

function applyLocalWorkOrderStatusOverrides(orders) {
  return orders.map((order) => {
    if (order.source === "supabase") return order;
    const status = [
      order.id,
      order.expertiseCaseId,
      order.workOrderNo
    ].filter(Boolean).map((key) => localStorage.getItem(`ototrWorkOrderStatus:${key}`)).find(Boolean);
    if (!status || status === order.status) return order;
    return {
      ...order,
      status,
      progress: status === "in_progress" && Number(order.progress || 0) <= 0 ? 2 : order.progress,
      completedItems: status === "in_progress" && Number(order.completedItems || 0) <= 0 ? 1 : order.completedItems,
      totalItems: order.totalItems || 60
    };
  });
}

export function getVehicleImagePath(workOrder) {
  const images = {
    bmw: "./src/assets/approved-group2/job-car-1.png",
    passat: "./src/assets/approved-group2/job-car-2.png",
    megane: "./src/assets/approved-group2/job-car-3.png",
    peugeot: "./src/assets/approved-group2/job-car-4.png",
    corolla: "./src/assets/approved-group2/job-car-5.png",
    focus: "./src/assets/home-reference/plan-car-3.png"
  };
  return images[workOrder.image] || images.bmw;
}

