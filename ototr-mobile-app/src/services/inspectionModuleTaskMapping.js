const MODULE_MAPPINGS = Object.freeze({
  "kaporta-boya": Object.freeze({
    mobileModuleId: "kaporta-boya",
    backendTaskKey: "BODY_PAINT_CHECKUP",
    portalDisplayName: "Kaporta / Boya",
    reportSection: "Kaporta ve Boya Ekspertizi"
  }),
  motor: Object.freeze({
    mobileModuleId: "motor",
    backendTaskKey: "MOTOR_CHECKUP",
    portalDisplayName: "Motor",
    reportSection: "Motor Ekspertizi"
  }),
  "alt-on-mekanik": Object.freeze({
    mobileModuleId: "alt-on-mekanik",
    backendTaskKey: "MECHANICAL_CHECKUP",
    portalDisplayName: "Alt / On / Mekanik",
    reportSection: "Alt On Mekanik Ekspertizi"
  }),
  "fren-suspansiyon": Object.freeze({
    mobileModuleId: "fren-suspansiyon",
    backendTaskKey: "BRAKE_SUSPENSION_TEST",
    portalDisplayName: "Fren / Suspansiyon",
    reportSection: "Fren ve Suspansiyon Testi"
  }),
  "obd-beyin": Object.freeze({
    mobileModuleId: "obd-beyin",
    backendTaskKey: "OBD_ECU_TEST",
    portalDisplayName: "OBD / Beyin",
    reportSection: "OBD ve Beyin Kontrolu"
  }),
  "dyno-yol": Object.freeze({
    mobileModuleId: "dyno-yol",
    backendTaskKey: "DYNO_ROAD_TEST",
    portalDisplayName: "Dyno / Yol",
    reportSection: "Dyno ve Yol Testi"
  }),
  "genel-kondisyon-dis": Object.freeze({
    mobileModuleId: "genel-kondisyon-dis",
    backendTaskKey: "EXTERIOR_CONDITION",
    portalDisplayName: "Dis Kondisyon",
    reportSection: "Dis Kondisyon Ekspertizi"
  }),
  "ic-ekspertiz": Object.freeze({
    mobileModuleId: "ic-ekspertiz",
    backendTaskKey: "INTERIOR_CHECKUP",
    portalDisplayName: "Ic Ekspertiz",
    reportSection: "Ic Ekspertiz ve Donanim"
  }),
  airbag: Object.freeze({
    mobileModuleId: "airbag",
    backendTaskKey: "AIRBAG_CHECK",
    portalDisplayName: "Airbag",
    reportSection: "Airbag ve Guvenlik Sistemi"
  }),
  "conta-kacak": Object.freeze({
    mobileModuleId: "conta-kacak",
    backendTaskKey: "HEAD_GASKET_LEAK_TEST",
    portalDisplayName: "Conta Kacak",
    reportSection: "Conta Kacak Testi"
  })
});

const MODULE_ALIASES = Object.freeze({
  kaporta: "kaporta-boya",
  body: "kaporta-boya",
  paint: "kaporta-boya",
  boya: "kaporta-boya",
  engine: "motor",
  mechanic: "alt-on-mekanik",
  mekanik: "alt-on-mekanik",
  brakesuspension: "fren-suspansiyon",
  brake: "fren-suspansiyon",
  suspension: "fren-suspansiyon",
  fren: "fren-suspansiyon",
  suspansiyon: "fren-suspansiyon",
  electric: "obd-beyin",
  elektrik: "obd-beyin",
  brain: "obd-beyin",
  beyin: "obd-beyin",
  obd: "obd-beyin",
  ecu: "obd-beyin",
  roadtest: "dyno-yol",
  "road-test": "dyno-yol",
  road_test: "dyno-yol",
  dyno: "dyno-yol",
  yoltesti: "dyno-yol",
  exterior: "genel-kondisyon-dis",
  dis: "genel-kondisyon-dis",
  "dış": "genel-kondisyon-dis",
  interior: "ic-ekspertiz",
  ic: "ic-ekspertiz",
  "iç": "ic-ekspertiz",
  interiorexterior: "ic-ekspertiz",
  conta: "conta-kacak",
  gasket: "conta-kacak"
});

const BACKEND_TASK_KEY_ALIASES = Object.freeze({
  KAPORTA_KONTROL: "BODY_PAINT_CHECKUP",
  BOYA_KONTROL: "BODY_PAINT_CHECKUP",
  MOTOR_KONTROL: "MOTOR_CHECKUP",
  MEKANIK_KONTROL: "MECHANICAL_CHECKUP",
  ALT_TAKIM_KONTROL: "MECHANICAL_CHECKUP",
  FREN_KONTROL: "BRAKE_SUSPENSION_TEST",
  ELEKTRIK_KONTROL: "OBD_ECU_TEST",
  DYNO_TEST: "DYNO_ROAD_TEST",
  IC_KONDISYON: "INTERIOR_CHECKUP",
  CONTA_KACAK: "HEAD_GASKET_LEAK_TEST"
});

export function normalizeModuleKey(moduleKey = "") {
  return String(moduleKey || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

export function getCanonicalInspectionModuleId(moduleKey = "") {
  const normalized = normalizeModuleKey(moduleKey);
  return MODULE_MAPPINGS[normalized]
    ? normalized
    : MODULE_ALIASES[normalized] || "";
}

export function getInspectionModuleMapping(moduleKey = "") {
  const canonical = getCanonicalInspectionModuleId(moduleKey);
  return MODULE_MAPPINGS[canonical] || null;
}

export function getInspectionTaskKeyForModule(moduleKey = "") {
  return getInspectionModuleMapping(moduleKey)?.backendTaskKey || "";
}

export function getCanonicalInspectionBackendTaskKey(taskKey = "") {
  const normalized = String(taskKey || "").trim().toUpperCase();
  return BACKEND_TASK_KEY_ALIASES[normalized] || normalized;
}

export function getPortalDisplayNameForModule(moduleKey = "") {
  return getInspectionModuleMapping(moduleKey)?.portalDisplayName || "";
}

export function getReportSectionForModule(moduleKey = "") {
  return getInspectionModuleMapping(moduleKey)?.reportSection || "";
}

export function isKnownInspectionModule(moduleKey = "") {
  return Boolean(getInspectionModuleMapping(moduleKey));
}

export const inspectionModuleMappings = MODULE_MAPPINGS;
export const inspectionModuleAliases = MODULE_ALIASES;
export const inspectionBackendTaskKeyAliases = BACKEND_TASK_KEY_ALIASES;
