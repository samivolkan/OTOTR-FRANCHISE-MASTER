import { supabaseRequest } from "./supabaseHttpClient.js";
import {
  getSupabaseRuntimeConfig,
  normalizeSupabaseUrl,
  refreshSupabaseAccessToken
} from "./supabaseSessionService.js";
import {
  getCanonicalInspectionPackageCode,
  listInspectionPackageDefinitions
} from "./inspectionPackageCatalog.js";

const secretariatDraftKey = "ototrSecretariatWorkOrderDraft";
const createdWorkOrderKey = "ototrSecretariatCreatedWorkOrder";

const allowedSecretariatRoles = new Set([
  "RECEPTION_STAFF",
  "BRANCH_MANAGER",
  "BRANCH_OWNER",
  "ADMIN",
  "HQ_ADMIN",
  "CEO",
  "GENERAL_MANAGER",
  "REGIONAL_MANAGER",
  "SEKRETERYA",
  "SUBE_MUDURU",
  "MUDUR",
  "BAYI"
]);

function decodeJwtPayload(token = "") {
  const [, payload = ""] = String(token).split(".");
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(globalThis.atob(padded));
  } catch {
    return null;
  }
}

function normalizeRole(role = "") {
  return String(role)
    .trim()
    .toUpperCase()
    .replace(/[İI]/g, "I")
    .replace(/[Ğ]/g, "G")
    .replace(/[Ü]/g, "U")
    .replace(/[Ş]/g, "S")
    .replace(/[Ö]/g, "O")
    .replace(/[Ç]/g, "C")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function inferRoleFromEmail(email = "") {
  const value = String(email).toLowerCase();
  if (value.includes("sekreter") || value.includes("secretariat") || value.includes("secretary")) return "RECEPTION_STAFF";
  if (value.includes("mudur") || value.includes("manager") || value.includes("portal")) return "BRANCH_MANAGER";
  if (value.includes("admin")) return "ADMIN";
  return "";
}

async function getFreshAccessToken() {
  const config = getSupabaseRuntimeConfig();
  if (!config.accessToken && !config.refreshToken) return "";
  const refreshed = await refreshSupabaseAccessToken();
  return refreshed.accessToken || getSupabaseRuntimeConfig().accessToken || config.accessToken || "";
}

async function authedSupabaseJson(path, { method = "GET", body = null, prefer = "" } = {}) {
  const config = getSupabaseRuntimeConfig();
  const baseUrl = normalizeSupabaseUrl(config.url);
  const accessToken = await getFreshAccessToken();
  if (!baseUrl || !config.anonKey || !accessToken) {
    throw new Error("Canlı Supabase oturumu bulunamadı.");
  }
  const headers = {
    apikey: config.anonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };
  if (prefer) headers.Prefer = prefer;
  const response = await supabaseRequest(`${baseUrl}/rest/v1${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || payload?.msg || payload?.hint || `Canlı istek başarısız: HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export async function getCurrentSecretariatContext() {
  const config = getSupabaseRuntimeConfig();
  const payload = decodeJwtPayload(config.accessToken);
  const authUserId = payload?.sub || "";
  const email = config.email || payload?.email || globalThis.localStorage?.getItem("ototrSupabaseUserEmail") || "";
  const fallbackRole = globalThis.localStorage?.getItem("ototrUserRole") || inferRoleFromEmail(email);

  if (authUserId) {
    try {
      const rows = await authedSupabaseJson(
        `/app_users?select=id,auth_user_id,role,branch_id,full_name,email,is_active&auth_user_id=eq.${encodeURIComponent(authUserId)}&is_active=eq.true&limit=1`
      );
      const user = Array.isArray(rows) ? rows[0] : null;
      if (user?.id) {
        const role = normalizeRole(user.role || fallbackRole);
        globalThis.localStorage?.setItem("ototrUserRole", role);
        globalThis.localStorage?.setItem("ototrAppUserId", user.id);
        if (user.branch_id) globalThis.localStorage?.setItem("ototrBranch", user.branch_id);
        if (user.full_name) globalThis.localStorage?.setItem("ototrUser", user.full_name);
        return {
          ok: true,
          verified: true,
          authUserId,
          appUserId: user.id,
          role,
          branchId: user.branch_id || globalThis.localStorage?.getItem("ototrBranch") || "",
          email: user.email || email,
          displayName: user.full_name || user.email || email
        };
      }
    } catch (error) {
      // Backend role enforcement still applies on submit; keep the UI usable with a marked fallback.
    }
  }

  const role = normalizeRole(fallbackRole);
  return {
    ok: Boolean(role || email),
    verified: false,
    authUserId,
    appUserId: globalThis.localStorage?.getItem("ototrAppUserId") || "",
    role,
    branchId: globalThis.localStorage?.getItem("ototrBranch") || "",
    email,
    displayName: globalThis.localStorage?.getItem("ototrUser") || email || "Sekreterya"
  };
}

export function canCreateSecretariatWorkOrder(context = {}) {
  return allowedSecretariatRoles.has(normalizeRole(context.role));
}

function normalizePackageRow(row = {}, index = 0, source = "live") {
  const code = getCanonicalInspectionPackageCode(row.code || row.package_code || row.name || row.title || "STANDARD");
  return {
    id: row.id || code.toLowerCase(),
    code,
    name: row.name || row.title || code,
    description: row.description || `${row.included_modules?.length || row.moduleIds?.length || 0} modül`,
    durationMinutes: row.duration_minutes || row.durationMinutes || null,
    includedModules: row.included_modules || row.includedModules || [],
    isActive: row.is_active ?? row.isActive ?? true,
    sortOrder: row.sort_order || row.sortOrder || index + 1,
    source
  };
}

export async function fetchSecretariatWorkOrderPackages() {
  try {
    const rows = await authedSupabaseJson(
      "/package_plans?select=id,code,name,description,duration_minutes,included_modules,is_active,sort_order&is_active=eq.true&order=sort_order.asc"
    );
    const packages = (Array.isArray(rows) ? rows : [])
      .map((row, index) => normalizePackageRow(row, index, "live"))
      .filter((item) => item.isActive);
    if (packages.length) {
      return { ok: true, source: "live", warning: "", packages };
    }
  } catch (error) {
    // The deployed schema may not expose package_plans over REST yet. Fall back to canonical local catalog.
  }
  return {
    ok: true,
    source: "fallback",
    warning: "Canlı paket API'si okunamadı; mevcut OTOTR paket kataloğu kullanılıyor.",
    packages: listInspectionPackageDefinitions().map((item, index) => normalizePackageRow(item, index, "fallback"))
  };
}

export function normalizePlate(value = "") {
  return String(value).toUpperCase().replace(/[^0-9A-ZÇĞİÖŞÜ]/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeVin(value = "") {
  return String(value).toUpperCase().replace(/[^0-9A-HJ-NPR-Z]/g, "").slice(0, 17);
}

export function normalizeEngineNo(value = "") {
  return String(value).toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 20);
}

export function validateRegistrationFields(fields = {}) {
  const plate = normalizePlate(fields.plate);
  const chassisNo = normalizeVin(fields.chassisNo || fields.vin);
  const engineNo = normalizeEngineNo(fields.engineNo);
  const errors = {};
  if (!/^(0[1-9]|[1-7][0-9]|8[01])\s?[A-ZÇĞİÖŞÜ]{1,3}\s?[0-9]{2,4}$/.test(plate)) {
    errors.plate = "Plaka TR formatında olmalı. Örn: 34 ABC 123";
  }
  if (chassisNo.length !== 17) {
    errors.chassisNo = "Şasi no 17 karakter olmalı.";
  }
  if (engineNo.length < 5 || engineNo.length > 20 || /^\d+$/.test(engineNo) || engineNo === chassisNo) {
    errors.engineNo = "Motor no 5-20 alfanumerik karakter olmalı ve şasi no ile aynı olmamalı.";
  }
  if (!fields.packageCode) {
    errors.packageCode = "Paket seçimi zorunludur.";
  }
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    normalized: { ...fields, plate, chassisNo, engineNo }
  };
}

export function parseRegistrationText(text = "") {
  const source = String(text).toUpperCase().replace(/[|]/g, " ");
  const plateMatch = source.match(/\b(0[1-9]|[1-7][0-9]|8[01])\s?[A-ZÇĞİÖŞÜ]{1,3}\s?[0-9]{2,4}\b/);
  const vinMatch = source.match(/\b[A-HJ-NPR-Z0-9]{17}\b/);
  const engineLabelMatch = source.match(/(?:MOTOR|MOTOR NO|MOTORNO|ENGINE)\s*[:\-]?\s*([A-Z0-9]{5,20})/);
  return {
    plate: normalizePlate(plateMatch?.[0] || ""),
    chassisNo: normalizeVin(vinMatch?.[0] || ""),
    engineNo: normalizeEngineNo(engineLabelMatch?.[1] || "")
  };
}

export function readSecretariatDraft() {
  try {
    return JSON.parse(globalThis.sessionStorage?.getItem(secretariatDraftKey) || "{}");
  } catch {
    return {};
  }
}

export function writeSecretariatDraft(nextDraft = {}) {
  const draft = { ...readSecretariatDraft(), ...nextDraft, updatedAt: new Date().toISOString() };
  globalThis.sessionStorage?.setItem(secretariatDraftKey, JSON.stringify(draft));
  return draft;
}

export function clearSecretariatDraft() {
  globalThis.sessionStorage?.removeItem(secretariatDraftKey);
}

export function readCreatedSecretariatWorkOrder() {
  try {
    return JSON.parse(globalThis.sessionStorage?.getItem(createdWorkOrderKey) || "{}");
  } catch {
    return {};
  }
}

export async function captureRegistrationImage() {
  const camera = globalThis.Capacitor?.Plugins?.Camera;
  if (camera?.getPhoto) {
    const photo = await camera.getPhoto({
      quality: 82,
      allowEditing: false,
      resultType: "dataUrl",
      source: "CAMERA",
      promptLabelHeader: "Ruhsat Fotoğrafı",
      promptLabelPhoto: "Kameradan Çek",
      promptLabelPicture: "Fotoğraf Seç"
    });
    return { ok: true, source: "camera", dataUrl: photo?.dataUrl || "" };
  }
  return { ok: false, source: "web", reason: "Kamera eklentisi bu ortamda aktif değil. Alanları manuel doldurun." };
}

export async function createWorkOrderFromRegistration(fields = {}) {
  const context = await getCurrentSecretariatContext();
  if (!canCreateSecretariatWorkOrder(context)) {
    const error = new Error("Bu işlem için Sekreterya veya Müdür yetkisi gerekir.");
    error.status = 403;
    throw error;
  }
  const validation = validateRegistrationFields(fields);
  if (!validation.ok) {
    const error = new Error("Ruhsat bilgilerini kontrol edin.");
    error.validation = validation.errors;
    throw error;
  }
  const data = validation.normalized;
  const customerName = data.customerName?.trim() || "Mobil Sekreterya Müşteri";
  const customerPhone = String(data.customerPhone || "5550000000").replace(/\D/g, "").slice(0, 10).padEnd(10, "0");
  const packageType = getCanonicalInspectionPackageCode(data.packageCode);
  const response = await authedSupabaseJson("/rpc/create_branch_work_order", {
    method: "POST",
    body: {
      customer_full_name: customerName,
      customer_phone: customerPhone,
      customer_email: data.customerEmail?.trim() || "mobil-sekreterya@example.test",
      customer_identity_number: data.customerIdentityNumber?.trim() || "",
      customer_role: "OWNER",
      vehicle_plate: data.plate,
      vehicle_vin: data.chassisNo,
      vehicle_brand: data.brand?.trim() || "Belirlenecek",
      vehicle_model: data.model?.trim() || "Ruhsat OCR",
      vehicle_year: Number(data.year || new Date().getFullYear()),
      vehicle_fuel_type: data.fuelType?.trim() || "Belirlenecek",
      vehicle_transmission: data.transmission?.trim() || "Belirlenecek",
      vehicle_kilometers: Number(data.kilometers || 0),
      vehicle_seller_type: data.sellerType?.trim() || "Bireysel",
      vehicle_arrival_note: data.arrivalNote?.trim() || "Mobil sekreterya ruhsat okuma ile oluşturuldu.",
      package_type: packageType,
      work_order_notes: data.notes?.trim() || `Mobil AOK sekreterya iş emri. Motor no: ${data.engineNo}`
    }
  });
  const result = Array.isArray(response) ? response[0] : response;
  const created = {
    ok: true,
    workOrderId: result?.id || result || "",
    workOrderNo: result?.work_order_no || result?.workOrderNo || "",
    plate: data.plate,
    chassisNo: data.chassisNo,
    engineNo: data.engineNo,
    packageCode: packageType,
    packageName: data.packageName || packageType,
    createdAt: new Date().toISOString()
  };
  globalThis.sessionStorage?.setItem(createdWorkOrderKey, JSON.stringify(created));
  clearSecretariatDraft();
  return created;
}
