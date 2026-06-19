import {
  getInspectionModuleMapping,
  getInspectionTaskKeyForModule,
  inspectionModuleMappings
} from "../src/services/inspectionModuleTaskMapping.js";
import {
  getCanonicalInspectionPackageCode,
  getInspectionPackageDefinition,
  getInspectionPackageModuleIds,
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
  if (getInspectionPackageDefinition(definition.name).code !== packageCode) {
    failures.push(`Paket adi canonical donmedi: ${definition.name}`);
  }
  const packageModuleIds = getInspectionPackageModuleIds(packageCode);
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
