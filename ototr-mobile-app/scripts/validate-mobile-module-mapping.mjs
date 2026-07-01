import {
  getInspectionModuleMapping,
  getInspectionTaskKeyForModule,
  inspectionModuleMappings
} from "../src/services/inspectionModuleTaskMapping.js";
import {
  getCanonicalInspectionPackageCode,
  getInspectionPackageDefinition,
  getInspectionPackageModuleIds,
  getInspectionPackageModuleIdsFromIncludedModules,
  getInspectionPackageTaskKeys,
  inspectionPackageCatalog
} from "../src/services/inspectionPackageCatalog.js";
import { moduleCatalog } from "../src/data/mock-data.js";

const requiredBackendTaskKeys = new Set([
  "BODY_PAINT_CHECKUP",
  "MOTOR_CHECKUP",
  "MECHANICAL_CHECKUP",
  "BRAKE_SUSPENSION_TEST",
  "OBD_ECU_TEST",
  "DYNO_ROAD_TEST",
  "EXTERIOR_CONDITION",
  "INTERIOR_CHECKUP",
  "AIRBAG_CHECK",
  "HEAD_GASKET_LEAK_TEST"
]);

const failures = [];
const expectedLivePackageModules = Object.freeze({
  MINI: ["motor", "alt-on-mekanik", "fren-suspansiyon"],
  ESNAF: ["motor", "alt-on-mekanik", "kaporta-boya", "obd-beyin"],
  STANDARD: ["motor", "alt-on-mekanik", "kaporta-boya", "fren-suspansiyon"],
  FULL: ["motor", "alt-on-mekanik", "kaporta-boya", "obd-beyin", "fren-suspansiyon", "dyno-yol", "airbag", "conta-kacak"],
  PREMIUM: ["motor", "alt-on-mekanik", "kaporta-boya", "obd-beyin", "fren-suspansiyon", "dyno-yol", "genel-kondisyon-dis", "ic-ekspertiz", "airbag", "conta-kacak"],
  PREMIUM_360: ["motor", "alt-on-mekanik", "kaporta-boya", "obd-beyin", "fren-suspansiyon", "dyno-yol", "genel-kondisyon-dis", "ic-ekspertiz", "airbag", "conta-kacak"],
  KAPORTA_BOYA: ["kaporta-boya", "genel-kondisyon-dis"],
  MEKANIK: ["motor", "alt-on-mekanik", "fren-suspansiyon", "conta-kacak"],
  HIZLI_KONTROL: ["motor", "fren-suspansiyon", "genel-kondisyon-dis"],
  CORPORATE: ["motor", "alt-on-mekanik", "kaporta-boya", "obd-beyin", "fren-suspansiyon", "dyno-yol", "genel-kondisyon-dis", "ic-ekspertiz", "airbag", "conta-kacak"]
});
const liveIncludedModuleLabels = Object.freeze([
  "İş Emri / Araç Kabul",
  "Araç Dosya Ekspertizi",
  "Motor Ekspertiz ve Check-up",
  "Alt / Ön / Mekanik Ekspertiz",
  "Kaporta ve Boya Ekspertizi",
  "OBD / Beyin Testi",
  "Fren / Süspansiyon Testi",
  "Dyno / Yol Testi",
  "Genel Kondisyon / Dış Ekspertiz",
  "İç Ekspertiz",
  "Airbag Kontrol Testi",
  "Conta Kaçak Testi"
]);
const mappedKeys = Object.values(inspectionModuleMappings).map((entry) => entry.backendTaskKey);
const duplicateTaskKeys = mappedKeys.filter((key, index) => mappedKeys.indexOf(key) !== index);
const moduleIds = new Set(moduleCatalog.map((module) => module.formKey || module.id));

for (const module of moduleCatalog) {
  const formKey = module.formKey || module.id;
  const mapping = getInspectionModuleMapping(formKey);
  if (!mapping) {
    failures.push(`Module catalog mapping eksik: ${formKey}`);
    continue;
  }
  if (!requiredBackendTaskKeys.has(mapping.backendTaskKey)) {
    failures.push(`Beklenmeyen backend task key: ${formKey} -> ${mapping.backendTaskKey}`);
  }
  if (!mapping.portalDisplayName || !mapping.reportSection) {
    failures.push(`Portal/rapor metadata eksik: ${formKey}`);
  }
}

for (const taskKey of requiredBackendTaskKeys) {
  if (!mappedKeys.includes(taskKey)) {
    failures.push(`Zorunlu backend task key mapping disinda: ${taskKey}`);
  }
}

for (const taskKey of duplicateTaskKeys) {
  failures.push(`Duplicate backend task key: ${taskKey}`);
}

if (getInspectionTaskKeyForModule("unknown-module-for-validation")) {
  failures.push("Bilinmeyen module fail-closed calismiyor.");
}

for (const [packageCode, definition] of Object.entries(inspectionPackageCatalog)) {
  const canonical = getCanonicalInspectionPackageCode(packageCode);
  if (canonical !== packageCode) {
    failures.push(`Paket kodu canonical donmedi: ${packageCode} -> ${canonical}`);
  }
  const packageModuleIds = getInspectionPackageModuleIds(packageCode);
  const canonicalByName = getInspectionPackageDefinition(definition.name).code;
  const nameMapsToSameCoverage = getInspectionPackageModuleIds(canonicalByName).join("|") === packageModuleIds.join("|");
  if (canonicalByName !== packageCode && !nameMapsToSameCoverage) {
    failures.push(`Paket adi canonical donmedi: ${definition.name}`);
  }
  if (!packageModuleIds.length) {
    failures.push(`Paket modulsuz: ${packageCode}`);
  }
  for (const moduleId of packageModuleIds) {
    if (!moduleIds.has(moduleId)) {
      failures.push(`Paket bilinmeyen modul iceriyor: ${packageCode} -> ${moduleId}`);
    }
  }
  const taskKeys = getInspectionPackageTaskKeys(packageCode);
  for (const taskKey of taskKeys) {
    if (!requiredBackendTaskKeys.has(taskKey)) {
      failures.push(`Paket bilinmeyen backend task key iceriyor: ${packageCode} -> ${taskKey}`);
    }
  }
}

for (const [packageCode, expectedModules] of Object.entries(expectedLivePackageModules)) {
  const actualModules = getInspectionPackageModuleIds(packageCode);
  if (actualModules.join("|") !== expectedModules.join("|")) {
    failures.push(`Canli paket kapsami farkli: ${packageCode} -> ${actualModules.join(",")} / beklenen ${expectedModules.join(",")}`);
  }
}

const labelMappedModuleIds = getInspectionPackageModuleIdsFromIncludedModules(liveIncludedModuleLabels, "STANDARD");
if (labelMappedModuleIds.join("|") !== expectedLivePackageModules.CORPORATE.join("|")) {
  failures.push(`Canli included_modules label mapping hatali: ${labelMappedModuleIds.join(",")}`);
}

if (getCanonicalInspectionPackageCode("OTOTR Premium 360") !== "PREMIUM") {
  failures.push("OTOTR Premium 360 paket alias hatali.");
}

if (getCanonicalInspectionPackageCode("Standart Ekspertiz") !== "STANDARD") {
  failures.push("Standart Ekspertiz paket alias hatali.");
}

if (failures.length > 0) {
  console.error("Mobile module mapping validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Mobile module/package mapping validation passed: ${moduleCatalog.length} module, ${mappedKeys.length} mapping, ${Object.keys(inspectionPackageCatalog).length} package.`);
