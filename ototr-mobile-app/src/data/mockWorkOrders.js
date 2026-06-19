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
    id: "IE-2026-000843",
    plate: "34 STR 2026",
    brand: "BMW",
    model: "3 Serisi",
    brandModel: "BMW 3 Serisi",
    year: "2021",
    packageName: "Standart Ekspertiz",
    packageCode: "STANDARD",
    km: "48.000 km",
    vin: "OTOTRDEMO000843",
    status: "waiting_start_proof",
    progress: 0,
    completedItems: 0,
    totalItems: 60,
    missingCount: 0,
    photoCount: 0,
    branchName: "Bursa Küçük Sanayi Şubesi",
    assignedTechnician: "Ahmet Usta",
    plannedTime: "45 dk",
    createdAt: "2026-06-16T09:30:00Z",
    customerVisibleName: "STORE KONTROL DEMO",
    returnReason: null,
    image: "bmw",
    source: "dealer-demo"
  },
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
    missingCount: 2,
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
    missingCount: 3,
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
    status: "test_missing",
    progress: 25,
    missingCount: 3,
    photoCount: 0,
    branchName: "Bursa Küçük Sanayi Şubesi",
    assignedTechnician: "Ahmet Usta",
    plannedTime: "22 dk",
    createdAt: "2026-06-08T12:10:00Z",
    customerVisibleName: "S*** Y***",
    returnReason: "Eksik fren testi",
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
    status: "technical_review",
    progress: 92,
    missingCount: 0,
    photoCount: 5,
    branchName: "Bursa Küçük Sanayi Şubesi",
    assignedTechnician: "Ahmet Usta",
    plannedTime: "28 dk",
    createdAt: "2026-06-07T08:44:00Z",
    customerVisibleName: "Y*** M***",
    returnReason: null,
    image: "peugeot"
  },
  {
    id: "WO-005",
    plate: "06 MNO 654",
    brand: "Toyota",
    model: "Corolla",
    brandModel: "Toyota Corolla",
    year: "2021",
    packageName: "1.5 Hybrid",
    packageCode: "FULL",
    km: "27.800 km",
    vin: "JT2BF22KX2K123456",
    status: "completed",
    progress: 100,
    missingCount: 0,
    photoCount: 9,
    branchName: "Bursa Küçük Sanayi Şubesi",
    assignedTechnician: "Ahmet Usta",
    plannedTime: "31 dk",
    createdAt: "2026-06-06T17:20:00Z",
    customerVisibleName: "B*** A***",
    returnReason: null,
    image: "corolla"
  },
  {
    id: "WO-006",
    plate: "34 RST 987",
    brand: "Ford",
    model: "Focus",
    brandModel: "Ford Focus",
    year: "2018",
    packageName: "1.0 EcoBoost",
    packageCode: "STANDARD",
    km: "88.200 km",
    vin: "1FAFP34N0M2P12345",
    status: "returned_for_correction",
    progress: 41,
    missingCount: 1,
    photoCount: 4,
    branchName: "Bursa Küçük Sanayi Şubesi",
    assignedTechnician: "Ahmet Usta",
    plannedTime: "18 dk",
    createdAt: "2026-06-05T13:34:00Z",
    customerVisibleName: "D*** H***",
    returnReason: "Resim eksikliği",
    image: "focus"
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

export function getSelectedWorkOrder() {
  const selectedId = localStorage.getItem("ototrSelectedWorkOrder");
  const orders = getRuntimeWorkOrders();
  return orders.find((order) => order.id === selectedId) || orders[0] || mockWorkOrders[0];
}

export function setSelectedWorkOrder(workOrder) {
  localStorage.setItem("ototrSelectedWorkOrder", workOrder.id);
}

export function getRuntimeWorkOrders() {
  const liveOrders = getCachedLiveWorkOrders();
  return applyLocalWorkOrderStatusOverrides(liveOrders.length ? liveOrders : mockWorkOrders);
}

function applyLocalWorkOrderStatusOverrides(orders) {
  return orders.map((order) => {
    const status = localStorage.getItem(`ototrWorkOrderStatus:${order.id}`);
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
import { getCachedLiveWorkOrders } from "../services/liveWorkOrdersService.js";
