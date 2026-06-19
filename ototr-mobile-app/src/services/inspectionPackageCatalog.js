import {
  getInspectionTaskKeyForModule,
  inspectionModuleMappings
} from "./inspectionModuleTaskMapping.js";

const packageDefinitions = Object.freeze({
  MINI: Object.freeze({
    code: "MINI",
    name: "Mini Ekspertiz",
    durationMinutes: 35,
    moduleIds: Object.freeze(["motor", "fren-suspansiyon"])
  }),
  ESNAF: Object.freeze({
    code: "ESNAF",
    name: "Esnaf Ekspertiz",
    durationMinutes: 50,
    moduleIds: Object.freeze(["motor", "alt-on-mekanik", "fren-suspansiyon", "genel-kondisyon-dis"])
  }),
  STANDARD: Object.freeze({
    code: "STANDARD",
    name: "Standart Ekspertiz",
    durationMinutes: 65,
    moduleIds: Object.freeze(["motor", "alt-on-mekanik", "fren-suspansiyon", "obd-beyin", "genel-kondisyon-dis"])
  }),
  FULL: Object.freeze({
    code: "FULL",
    name: "Full Ekspertiz",
    durationMinutes: 85,
    moduleIds: Object.freeze([
      "kaporta-boya",
      "motor",
      "alt-on-mekanik",
      "fren-suspansiyon",
      "obd-beyin",
      "genel-kondisyon-dis",
      "ic-ekspertiz",
      "airbag"
    ])
  }),
  PREMIUM: Object.freeze({
    code: "PREMIUM",
    name: "OTOTR Premium 360",
    durationMinutes: 105,
    moduleIds: Object.freeze([
      "kaporta-boya",
      "motor",
      "alt-on-mekanik",
      "fren-suspansiyon",
      "obd-beyin",
      "dyno-yol",
      "genel-kondisyon-dis",
      "ic-ekspertiz",
      "airbag",
      "conta-kacak"
    ])
  }),
  KAPORTA_BOYA: Object.freeze({
    code: "KAPORTA_BOYA",
    name: "Kaporta Boya",
    durationMinutes: 40,
    moduleIds: Object.freeze(["kaporta-boya", "genel-kondisyon-dis"])
  }),
  MEKANIK: Object.freeze({
    code: "MEKANIK",
    name: "Mekanik",
    durationMinutes: 45,
    moduleIds: Object.freeze(["motor", "alt-on-mekanik", "fren-suspansiyon", "conta-kacak"])
  }),
  HIZLI_KONTROL: Object.freeze({
    code: "HIZLI_KONTROL",
    name: "Hizli Kontrol",
    durationMinutes: 25,
    moduleIds: Object.freeze(["motor", "fren-suspansiyon"])
  })
});

const packageAliases = Object.freeze({
  MINI_EKSPERTIZ: "MINI",
  MINI_EKSPERTIZI: "MINI",
  HIZLI: "HIZLI_KONTROL",
  HIZLI_KONTROL: "HIZLI_KONTROL",
  ESNAF_EKSPERTIZ: "ESNAF",
  ESNAF_EKSPERTIZI: "ESNAF",
  STANDART: "STANDARD",
  STANDART_EKSPERTIZ: "STANDARD",
  STANDART_EKSPERTIZI: "STANDARD",
  STANDARD_EKSPERTIZ: "STANDARD",
  FULL_EKSPERTIZ: "FULL",
  FULL_EKSPERTIZI: "FULL",
  PREMIUM_360: "PREMIUM",
  OTOTR_PREMIUM: "PREMIUM",
  OTOTR_PREMIUM_360: "PREMIUM",
  KAPORTA: "KAPORTA_BOYA",
  KAPORTA_BOYA: "KAPORTA_BOYA",
  BODY_PAINT: "KAPORTA_BOYA",
  MECHANIC: "MEKANIK",
  MEKANIK: "MEKANIK"
});

function normalizePackageToken(value = "") {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/İ/g, "I")
    .replace(/ı/g, "I")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "U")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "S")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "O")
    .replace(/Ç/g, "C")
    .replace(/ç/g, "C")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function getCanonicalInspectionPackageCode(packageNameOrCode = "") {
  const token = normalizePackageToken(packageNameOrCode);
  if (!token) return "STANDARD";
  if (packageDefinitions[token]) return token;
  if (packageAliases[token]) return packageAliases[token];
  if (token.includes("PREMIUM") || token.includes("360")) return "PREMIUM";
  if (token.includes("FULL")) return "FULL";
  if (token.includes("ESNAF")) return "ESNAF";
  if (token.includes("MINI")) return "MINI";
  if (token.includes("KAPORTA") || token.includes("BOYA")) return "KAPORTA_BOYA";
  if (token.includes("MEKANIK") || token.includes("MECHANIC")) return "MEKANIK";
  if (token.includes("HIZLI")) return "HIZLI_KONTROL";
  return "STANDARD";
}

export function getInspectionPackageDefinition(packageNameOrCode = "") {
  return packageDefinitions[getCanonicalInspectionPackageCode(packageNameOrCode)] || packageDefinitions.STANDARD;
}

export function getInspectionPackageModuleIds(packageNameOrCode = "") {
  return [...getInspectionPackageDefinition(packageNameOrCode).moduleIds];
}

export function getInspectionPackageTaskKeys(packageNameOrCode = "") {
  return getInspectionPackageModuleIds(packageNameOrCode)
    .map((moduleId) => getInspectionTaskKeyForModule(moduleId))
    .filter(Boolean);
}

export function getInspectionPackageIncludedModules(packageNameOrCode = "") {
  return getInspectionPackageModuleIds(packageNameOrCode)
    .map((moduleId) => inspectionModuleMappings[moduleId])
    .filter(Boolean)
    .map((mapping) => ({
      moduleId: mapping.mobileModuleId,
      taskKey: mapping.backendTaskKey,
      title: mapping.portalDisplayName,
      reportSection: mapping.reportSection
    }));
}

export const inspectionPackageCatalog = packageDefinitions;
export const inspectionPackageAliases = packageAliases;
