import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const repoRoot = resolve(appRoot, "..");
const skipLegacyFazValidation = process.argv.includes("--skip-legacy-faz4");
const manifestPath = resolve(appRoot, "src/assets/design-reference/screens-manifest.json");
const errors = [];

const {
  bodyPanels,
  blockingIssues,
  customerSummarySections,
  evidenceSlots,
  expertiseModuleForms,
  expertiseSchemaStats,
  fieldValidationHints,
  finalApprovalGate,
  finalApprovalWarnings,
  finalScreenRoutes,
  issueAlerts,
  navigationItems,
  optionLabelFallback,
  phase2ComponentRoutes,
  referenceRouteOrder,
  referenceScreens,
  reportApprovedData,
  reportBlockedData,
  revisionRequestData,
  routeMetaById,
  technicalApprovalFlow,
  technicalApprovalDetail,
  technicalApprovalQueue,
  technicalApprovalTerminology,
  unresolvedSelectedOptions,
  workOrders
} = await import(pathToFileURL(resolve(appRoot, "src/data/mock-data.js")).href);

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function normalizeTextValue(text) {
  let value = String(text ?? "");
  for (const [bad, good] of [
    ["\u00C3\u2021", "Ç"], ["\u00C3\u00A7", "ç"],
    ["\u00C3\u2013", "Ö"], ["\u00C3\u00B6", "ö"],
    ["\u00C3\u0153", "Ü"], ["\u00C3\u00BC", "ü"],
    ["\u00C4\u00B0", "İ"], ["\u00C4\u00B1", "ı"],
    ["\u00C4\u0178", "ğ"], ["\u00C4\u017D", "Ğ"],
    ["\u00C5\u0178", "ş"], ["\u00C5\u009E", "Ş"],
    ["\u00C2\u00B7", "·"], ["\u00C2", ""],
    ["\u00E2\u20AC\u201D", "—"], ["\u00E2\u20AC\u201C", "–"], ["\u00E2\u20AC\u00A2", "•"]
  ]) {
    value = value.split(bad).join(good);
  }
  return value;
}

function normalizedEquals(actual, expected) {
  return normalizeTextValue(actual) === normalizeTextValue(expected);
}

function normalizedIncludes(source, expected) {
  return normalizeTextValue(source).includes(normalizeTextValue(expected));
}

function hasOwnNormalizedKey(object, expectedKey) {
  return Object.keys(object ?? {}).some((key) => normalizedEquals(key, expectedKey));
}

function includesNormalized(list, expected) {
  return Array.isArray(list) && list.some((item) => normalizedEquals(item, expected));
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`JSON okunamadı: ${path} (${error.message})`);
    return null;
  }
}

function readPngSize(path) {
  const buffer = readFileSync(path);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("PNG imzası geçersiz");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function assertSequence(numbers, label) {
  for (let index = 0; index < 34; index += 1) {
    const expected = index + 1;
    if (numbers[index] !== expected) {
      errors.push(`${label} sıra hatası: ${index + 1}. pozisyonda ${expected} bekleniyor, bulunan ${numbers[index] ?? "yok"}`);
    }
  }
}

function extractCssBlock(css, selector) {
  const index = css.indexOf(selector);
  if (index === -1) return "";
  const start = css.indexOf("{", index);
  if (start === -1) return "";
  let depth = 0;
  for (let cursor = start; cursor < css.length; cursor += 1) {
    if (css[cursor] === "{") depth += 1;
    if (css[cursor] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(start + 1, cursor);
    }
  }
  return "";
}

const manifest = existsSync(manifestPath) ? readJson(manifestPath) : null;
if (!existsSync(manifestPath)) errors.push(`Manifest bulunamadı: ${manifestPath}`);

const manifestScreens = Array.isArray(manifest?.screens) ? manifest.screens : [];
assert(Array.isArray(manifest?.screens), "Manifest içinde screens dizisi yok.");
assert(manifestScreens.length === 34, `Manifestte 34 kayıt bekleniyor, bulunan: ${manifestScreens.length}`);

assert(Array.isArray(finalScreenRoutes), "finalScreenRoutes dizi değil.");
assert(finalScreenRoutes.length === 34, `finalScreenRoutes 34 kayıt olmalı, bulunan: ${finalScreenRoutes.length}`);
assert(referenceRouteOrder.length >= 34, `referenceRouteOrder en az 34 kayıt olmalı, bulunan: ${referenceRouteOrder.length}`);
assert(Object.keys(referenceScreens).length === 34, `referenceScreens 34 kayıt olmalı, bulunan: ${Object.keys(referenceScreens).length}`);
assert(Object.keys(routeMetaById).length === 34, `routeMetaById 34 kayıt olmalı, bulunan: ${Object.keys(routeMetaById).length}`);

assertSequence(manifestScreens.map((screen) => screen.screenNo), "Manifest");
assertSequence(finalScreenRoutes.map((screen) => screen.screenNo), "Route");

const manifestByNo = new Map(manifestScreens.map((screen) => [screen.screenNo, screen]));
const routeIds = new Set();

for (const route of finalScreenRoutes) {
  if (routeIds.has(route.routeId)) errors.push(`Tekrar eden routeId: ${route.routeId}`);
  routeIds.add(route.routeId);

  const manifestScreen = manifestByNo.get(route.screenNo);
  assert(Boolean(manifestScreen), `Manifestte route ekranı yok: ${route.screenNo} ${route.routeId}`);
  if (!manifestScreen) continue;

  assert(manifestScreen.originalFileName === route.originalFileName, `Dosya adı uyuşmazlığı: ekran ${route.screenNo}`);
  assert(manifestScreen.normalizedPath === route.normalizedPath, `Normalize path uyuşmazlığı: ekran ${route.screenNo}`);
  assert(referenceRouteOrder[route.screenNo - 1] === route.routeId, `Route sıra uyuşmazlığı: ekran ${route.screenNo} -> ${route.routeId}`);
  assert(referenceScreens[route.routeId] === route.imagePath, `referenceScreens path uyuşmazlığı: ${route.routeId}`);
  assert(routeMetaById[route.routeId]?.title, `Route Türkçe başlık eksik: ${route.routeId}`);

  const normalizedFilePath = resolve(repoRoot, manifestScreen.normalizedPath);
  if (!existsSync(normalizedFilePath)) {
    errors.push(`Normalize dosya bulunamadı: ekran ${route.screenNo} -> ${manifestScreen.normalizedPath}`);
    continue;
  }

  try {
    const { width, height } = readPngSize(normalizedFilePath);
    if (width !== 853 || height !== 1844) {
      errors.push(`Normalize ölçü hatası: ekran ${route.screenNo} -> ${width}x${height}`);
    }
  } catch (error) {
    errors.push(`Normalize PNG okunamadı: ekran ${route.screenNo} -> ${error.message}`);
  }
}

assert(routeIds.has("customerSummary"), "22 Müşteri Özeti / customerSummary route akışta yok.");
assert(routeMetaById.customerSummary?.screenNo === 22, "customerSummary route 22. ekrana bağlı değil.");

const expectedNavLabels = ["Görevler", "İşlerim", "OtoTR", "Eksikler", "Profil"];
const expectedNavRoutes = ["tests", "jobs", "home", "missing", "profile"];
assert(
  JSON.stringify(navigationItems.map((item) => normalizeTextValue(item.label))) === JSON.stringify(expectedNavLabels),
  `Alt navigasyon sırası hatalı: ${navigationItems.map((item) => item.label).join(" / ")}`
);
assert(
  JSON.stringify(navigationItems.map((item) => item.routeId)) === JSON.stringify(expectedNavRoutes),
  `Alt navigasyon route sırası hatalı: ${navigationItems.map((item) => item.routeId).join(" / ")}`
);
assert(navigationItems[2]?.elevated === true && navigationItems[2]?.routeId === "home", "Ortadaki FAB Ana Sayfa route'una bağlı olmalı.");
assert(!navigationItems.some((item) => item.label === "Bildirimler"), "Bildirimler alt nav item'ı olmamalı.");
assert(!navigationItems.some((item) => item.label === "Tara"), "Tara alt nav item'ı olmamalı.");

const expectedComponentRoutes = [
  "splash",
  "login",
  "branch",
  "password",
  "forgot-password",
  "reset-password",
  "home",
  "jobs",
  "detail",
  "job-detail",
  "start",
  "start-proof",
  "start-proof-success",
  "section-owned",
  "manager-takeover-success",
  "save-success",
  "save-continue",
  "unsaved-changes",
  "discard-changes",
  "section-completed",
  "all-sections-completed",
  "report-created",
  "required-fields-missing",
  "evidence-sync-queue",
  "offline-warning",
  "task-transfer-confirm",
  "task-transferred",
  "pre-approval-check",
  "technical-approval-submitted",
  "technical-revision-request",
  "approved-locked-report",
  "cancelled-job",
  "unauthorized",
  "operation-failed",
  "profile-setting-detail",
  "modules",
  "tests",
  "lock",
  "taskTransfer",
  "permissionDenied",
  "moduleControl",
  "itemDetail",
  "statusModal",
  "evidence",
  "camera",
  "photoApproval",
  "photoUploadError",
  "issues",
  "blockingIssues",
  "missing",
  "customerSummary",
  "customer-summary",
  "finalReport",
  "final-report",
  "approvalWaiting",
  "approval-waiting",
  "completed",
  "summary",
  "returned",
  "help",
  "reports",
  "notifications",
  "permissions",
  "offlineSync",
  "offline-sync",
  "syncError",
  "sync-error",
  "emptyState",
  "empty-state",
  "secretariat-work-order",
  "registration-capture",
  "registration-review",
  "work-order-created",
  "profile"
];

assert(
  JSON.stringify(phase2ComponentRoutes) === JSON.stringify(expectedComponentRoutes),
  `FAZ 7 component route listesi hatalı: ${phase2ComponentRoutes.join(", ")}`
);

if (!skipLegacyFazValidation) {
  assert(expertiseSchemaStats.sourceFound === true, "JSON Şemas? okunamadı.");
  assert(expertiseSchemaStats.groupCount === 12, `JSON grup sayısı 12 olmalı, bulunan: ${expertiseSchemaStats.groupCount}`);
  assert(expertiseSchemaStats.itemCount === 265, `JSON madde sayısı 265 olmalı, bulunan: ${expertiseSchemaStats.itemCount}`);
  assert(expertiseSchemaStats.optionInputCount === 2082, `JSON seçenek + girdi sayısı 2082 olmalı, bulunan: ${expertiseSchemaStats.optionInputCount}`);
  assert(expertiseSchemaStats.labeledOptionCount === 486, `Etiketli seçenek sayısı 486 olmalı, bulunan: ${expertiseSchemaStats.labeledOptionCount}`);
  assert(expertiseSchemaStats.needsLabelMapCount === 1568, `needsLabelMap sayısı 1568 olmalı, bulunan: ${expertiseSchemaStats.needsLabelMapCount}`);
}

if (!skipLegacyFazValidation) {
  for (const [key, form] of Object.entries(expertiseModuleForms)) {
    assert(form.itemCount > 0, `Şema tabanlı form boş: ${key}`);
    for (const item of form.items.slice(0, 20)) {
      for (const option of item.options) {
        if (option.needsLabelMap) {
          assert(normalizedEquals(option.displayLabel, "Seçenek etiketi doğrulanacak"), `${key} içinde ham checkbox ID gösterimi sızdı.`);
          assert(option.displayLabel !== option.value, `${key} içinde option value doğrudan etikete dönmüş görünüyor.`);
        }
      }
    }
  }
}

if (!skipLegacyFazValidation) {
  assert(bodyPanels.length === 12, `Kaporta panel listesi 12 olmalı, bulunan: ${bodyPanels.length}`);
  for (const status of ["Orijinal", "Boyalı", "Lokal Boyalı", "Değişen", "Hasarlı", "Kontrol Edilmedi"]) {
    assert(bodyPanels.some((panel) => normalizedEquals(panel.status, status)), `Panel durumu eksik: ${status}`);
  }
}

if (!skipLegacyFazValidation) {
  assert(evidenceSlots.length >= 5, `Kanıt slotu en az 5 olmalı, bulunan: ${evidenceSlots.length}`);
  assert(issueAlerts.length >= 3, `Uyarı listesi en az 3 olmalı, bulunan: ${issueAlerts.length}`);
  assert(blockingIssues.length >= 3, `Engelleyici eksik listesi en az 3 olmalı, bulunan: ${blockingIssues.length}`);
  assert(unresolvedSelectedOptions.length >= 1, "Çözümsüz seçilmiş option uyarıs? bekleniyor.");
  assert(normalizedEquals(finalApprovalGate.fallbackLabel, "Seçenek etiketi doğrulanacak"), `Fallback label hatalı: ${finalApprovalGate.fallbackLabel}`);
  assert(normalizedEquals(optionLabelFallback, "Seçenek etiketi doğrulanacak"), `optionLabelFallback hatalı: ${optionLabelFallback}`);
  assert(finalApprovalGate.allowsTechnicalApproval === false, "Çözümsüz option varken teknik onay açık görünüyor.");
  assert(finalApprovalGate.allowsFinalReportGeneration === false, "Çözümsüz option varken final rapor üretimi açık görünüyor.");
  assert(
    normalizedEquals(finalApprovalGate.blockingMessage, "Bu seçeneklerin açıklaması doğrulanmadığı için iş emri tamamlanamaz."),
    "FAZ 5.5 tamamlama blok mesajı hatalı."
  );
  for (const rule of [
    "unresolvedOptionLabel",
    "requiredDescriptionEmpty"
  ]) {
    assert(finalApprovalGate.blockingRules?.includes(rule), `FAZ 5.5 bloklama kuralı eksik: ${rule}`);
  }
  for (const rule of [
    "criticalFindingMissingEvidence",
    "requiredPhotoSlotEmpty",
    "criticalBodyPanelMissingPhoto",
    "riskyStatusMissingEvidence"
  ]) {
    assert(!finalApprovalGate.blockingRules?.includes(rule), `Fotoğraf/kanıt artık bloklayıcı olmamalı: ${rule}`);
  }
  assert(finalApprovalWarnings.some((item) => normalizedEquals(item.title, "Doğrulama Bekleyen Seçenek")), "Final onay uyarılar?nda doğrulama bekleyen seçenek eksik.");
  assert(reportBlockedData.blockers.some((item) => normalizedEquals(item.title, "Doğrulama Bekleyen Seçenek")), "Rapor bloklama ekranında doğrulama bekleyen seçenek eksik.");
  assert(technicalApprovalDetail.unresolvedWarnings.length >= 1, "Teknik onay detayında Çözümsüz option uyarıs? eksik.");
  assert(revisionRequestData.unresolvedWarnings.length >= 1, "Düzeltme istendi ekranında Çözümsüz option uyarıs? eksik.");
  assert(technicalApprovalQueue.length >= 3, "Teknik onay kuyruğu için en az 3 kayıt bekleniyor.");
  assert(Boolean(reportApprovedData.reportNo), "Rapor onaylandı ekranı verisi eksik.");
  assert(normalizedEquals(reportApprovedData.statusTitle, "İş Emri Tamamlandı"), "Tamamlanan rapor ekranı iş emri tamamlandı terminolojisine bağlı değil.");
  assert(normalizedEquals(reportApprovedData.completionLabel, "Rapor Tamamlandı"), "Tamamlanan rapor ekranı rapor tamamlandı metnini taşımıyor.");
  assert(normalizedEquals(technicalApprovalTerminology.technicianFinalAction, "İş Emrini Tamamla"), "Teknisyen final aksiyonu iş emrini tamamla olmalı.");
  assert(technicalApprovalTerminology.technicianCanApprove === false, "Teknisyen onay yetkisi kapalı olmalı.");

  for (const section of ["Müşteri Özeti", "İç Teknik Not", "Kritik Bulgular", "İyi Durumlar", "Fotoğraf Sayısı", "Önizle / Düzenle"]) {
    assert(includesNormalized(customerSummarySections, section), `Müşteri Özeti/final rapor görünür bölümü eksik: ${section}`);
  }

  for (const label of [
    "Akü yüzde değeri",
    "Antifriz değeri",
    "Mikron ölçümü",
    "Lastik yılı",
    "Lastik diş derinliği",
    "Tarih alanları",
    "Dyno güç/tork ölçümleri",
    "OBD test çıktısı görseli"
  ]) {
    assert(fieldValidationHints.some((item) => normalizedEquals(item.label, label)), `FAZ 5.5 alan doğrulama notu eksik: ${label}`);
  }
}

const requiredFiles = [
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  "src/app.js",
  "src/components/ui.js",
  "src/screens/phase2-screens.js",
  "src/data/mock-data.js",
  "src/data/business-rules.js",
  "src/data/ototr-expertise-schema.json",
  "src/data/expertise/ototr_expertise_schema_otorapor_2614045.json",
  "src/data/expertise/ototr_schema_extension_v1.json",
  "src/data/expertise/ototr_option_label_map_starter.json",
  "src/data/expertise/ototr_expertise_schema_otorapor_2614045_PLUS_PRO.json",
  "src/data/expertise/unknown-option-label-audit.json",
  "src/services/expertiseSchemaService.js",
  "src/styles/tokens.css",
  "src/styles/base.css",
  "src/styles/components.css"
];

for (const file of requiredFiles) {
  assert(existsSync(resolve(appRoot, file)), `Gerekli uygulama dosyası eksik: ${file}`);
}

const runtimeTextFiles = [
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  "src/app.js",
  "src/components/ui.js",
  "src/screens/phase2-screens.js",
  "src/data/mock-data.js",
  "src/data/business-rules.js",
  "src/services/expertiseSchemaService.js",
  "src/styles/tokens.css",
  "src/styles/base.css",
  "src/styles/components.css"
];

const runtimeText = runtimeTextFiles
  .filter((file) => existsSync(resolve(appRoot, file)))
  .map((file) => readFileSync(resolve(appRoot, file), "utf8"))
  .join("\n");
const normalizedRuntimeText = normalizeTextValue(runtimeText);
const phase2ScreenSource = readFileSync(resolve(appRoot, "src/screens/phase2-screens.js"), "utf8");
const normalizedPhase2ScreenSource = normalizeTextValue(phase2ScreenSource);
const uiSource = readFileSync(resolve(appRoot, "src/components/ui.js"), "utf8");

for (const term of [
  "Login with Google",
  "Login with Apple",
  "Kayıt ol",
  "Kayit ol",
  "Usta tipi",
  "Yeni ?? Emri",
  "Yeni Is Emri",
  "İş Emri Oluştur",
  "Is Emri Olustur",
  "Create Job",
  "Approve Report",
  "Raporu Onayla",
  "Register",
  "Sign up"
]) {
  if (runtimeText.includes(term)) errors.push(`Yasak kullanıcı metni bulundu: ${term}`);
}

for (const mojibake of ["Ãƒ", "Ã‚", "Ã…", "Ã„", "Ã¢â‚¬", "Ã¢â‚¬¢"]) {
  if (normalizedRuntimeText.includes(mojibake)) errors.push(`Bozuk Türkçe karakter izi bulundu: ${mojibake}`);
}

const auditData = readJson(resolve(appRoot, "src/data/expertise/unknown-option-label-audit.json"));
assert(normalizedEquals(auditData?.fallbackLabel, "Seçenek etiketi doğrulanacak"), "unknown-option-label-audit fallback label hatalı.");
assert(auditData?.uniqueUnknownOptionCount === 1453, `unique unknown option sayısı 1453 olmalı, bulunan: ${auditData?.uniqueUnknownOptionCount}`);
assert(auditData?.totalUnknownOptionOccurrences === 1568, `unknown option occurrence sayısı 1568 olmalı, bulunan: ${auditData?.totalUnknownOptionOccurrences}`);

for (const leakedRawToken of ["checkbox:value=", '"label": null']) {
  if (runtimeText.includes(leakedRawToken) && !runtimeText.includes("Kodlu seçenek ? etiket bekleniyor")) {
    errors.push(`Ham checkbox değeri kullanıcı metnine sızmış olabilir: ${leakedRawToken}`);
  }
}

for (const forbiddenApprovalAction of [
  'button("Onayla"',
  '"Onayla"',
  "Raporu Onayla",
  "Devri Onayla",
  "Kanıt? Onayla",
  '"Approve"',
  "Approve Report"
]) {
  if (runtimeText.includes(forbiddenApprovalAction)) {
    errors.push(`FAZ 5.5 yasak onay aksiyon metni bulundu: ${forbiddenApprovalAction}`);
  }
}

assert(phase2ScreenSource.includes("app-shell app-screen phase2-screen"), "Component ekran wrapper ortak app-shell yapisini kullanmiyor.");
assert(phase2ScreenSource.includes("routeContent.classList.add(\"app-content\")"), "Component ekran icerigi app-content sinifi almiyor.");
assert(phase2ScreenSource.includes("app-bottom-safe"), "Shell route'larda bottom nav icin app-bottom-safe eksik.");
assert(phase2ScreenSource.includes("app-header phase2-top-header"), "Standart phase2 header app-header sinifina baglanmadi.");
assert(phase2ScreenSource.includes("app-header jobs-approved-header"), "İşlerim header app-header sinifina baglanmadi.");
assert(phase2ScreenSource.includes("home: () => renderHome(onNavigate)"), "Ana Sayfa renderer approved renderHome fonksiyonuna bagli degil.");
assert(phase2ScreenSource.includes("home-standard-main"), "Ana Sayfa İşlerim kokpit standardina bagli degil.");
assert(phase2ScreenSource.includes("homeStandardOrderSection"), "Ana Sayfa is kartlari ortak section helper'i ile uretilmeli.");
assert(phase2ScreenSource.includes("homeStandardKpis"), "Ana Sayfa KPI'lari İşlerim KPI ailesiyle uretilmeli.");
assert(phase2ScreenSource.includes("jobsApprovedCard(order, onNavigate)"), "Ana Sayfa is kartlari İşlerim kart component'ini kullanmali.");
assert(phase2ScreenSource.includes("shellRoutes.has(activeRoute) && createBottomNav"), "Ana Sayfa diger ekranlarla ayni bottom nav component'i kullanmali.");
assert(!phase2ScreenSource.includes('activeRoute !== "home" && createBottomNav'), "Ana Sayfa bottom nav component'ten ayrilmamali.");
assert(!phase2ScreenSource.includes("selectedValue"), "UI renderer Çözümsüz option selectedValue alanın? kullanmamalı.");

assert(runtimeText.includes("--color-primary: #e30613"), "OTOTR kırmızı ana renk tokeni eksik.");
assert(runtimeText.includes("color-scheme: light"), "Açık tema color-scheme tokeni eksik.");
assert(!runtimeText.includes("prefers-color-scheme"), "Koyu tema hazırlığı tespit edildi: prefers-color-scheme");
assert(!runtimeText.includes("theme-dark"), "Koyu tema hazırlığı tespit edildi: theme-dark");
assert(!runtimeText.includes("dark-mode"), "Koyu tema hazırlığı tespit edildi: dark-mode");
assert(runtimeText.includes(".bottom-nav-shell"), "Standart kapsul bottom nav shell sinifi eksik.");
assert(runtimeText.includes(".bottom-nav-item"), "Standart bottom nav item sinifi eksik.");
assert(runtimeText.includes(".bottom-nav-center-home"), "Standart merkez home sinifi eksik.");
assert(runtimeText.includes(".bottom-nav-badge"), "Standart bottom nav badge sinifi eksik.");
assert(runtimeText.includes("--bottom-nav-height: 102px"), "Bottom nav olcu kilidi yukseklik tokeni eksik.");
assert(runtimeText.includes("--bottom-nav-fab-size: 78px"), "Merkez FAB olcu kilidi tokeni eksik.");
assert(runtimeText.includes("--screen-x"), "App shell yatay padding tokeni eksik.");
assert(runtimeText.includes("--screen-top"), "App shell ust padding tokeni eksik.");
assert(runtimeText.includes("--header-gap"), "App shell header gap tokeni eksik.");
assert(runtimeText.includes("--header-to-content-gap"), "App shell header-content gap tokeni eksik.");
assert(runtimeText.includes("--section-gap"), "App shell section gap tokeni eksik.");
assert(runtimeText.includes("--section-title-gap"), "App shell section title gap tokeni eksik.");
assert(runtimeText.includes("--card-gap"), "App shell card gap tokeni eksik.");
assert(runtimeText.includes("--compact-card-gap"), "App shell compact card gap tokeni eksik.");
assert(runtimeText.includes("--card-radius"), "App shell kart radius tokeni eksik.");
assert(runtimeText.includes("--card-bg"), "App shell kart zemin tokeni eksik.");
assert(runtimeText.includes("--card-border"), "App shell kart border tokeni eksik.");
assert(runtimeText.includes("--card-shadow"), "App shell kart shadow tokeni eksik.");
assert(runtimeText.includes("--card-padding"), "App shell kart padding tokeni eksik.");
assert(runtimeText.includes("--card-soft-bg"), "App shell soft kart zemin tokeni eksik.");
assert(runtimeText.includes("--bottom-safe-gap"), "App shell bottom safe gap tokeni eksik.");
assert(runtimeText.includes("--screen-bottom-padding"), "App shell screen bottom padding tokeni eksik.");
assert(runtimeText.includes("--bottom-nav-safe-padding"), "App shell bottom nav safe padding tokeni eksik.");
assert(runtimeText.includes(".app-shell"), "Ortak app-shell sinifi eksik.");
assert(runtimeText.includes(".app-content"), "Ortak app-content sinifi eksik.");
assert(runtimeText.includes(".app-bottom-safe"), "Ortak app-bottom-safe sinifi eksik.");
assert(runtimeText.includes("padding: var(--screen-top) var(--screen-x) var(--screen-bottom-padding)"), "App shell ortak padding token baglantisi eksik.");
const forbiddenOldCenterFab = "red-" + "scan" + "-fab";
assert(!runtimeText.includes(forbiddenOldCenterFab), "Eski bagimsiz kırmızı merkez varyasyonu kaldirilmali.");
assert((uiSource.match(/export function createBottomNav/g) ?? []).length === 1, "BottomNav tek standart componentten uretilmeli.");
assert(!uiSource.includes("createRedScanFab"), "Ayri Tara FAB helper'i tek standart component kuralini bozar.");
assert(uiSource.includes("bottom-nav-shell bottom-nav"), "createBottomNav standart shell sinifini uretmiyor.");
assert(uiSource.includes("bottom-nav-item bottom-nav-center-home"), "createBottomNav standart merkez home item sinifini uretmiyor.");
assert(uiSource.includes('home: { label: "OtoTR", ariaLabel: "OtoTR Ana Sayfa", icon: "home" }'), "Merkez home nav label OtoTR olmali.");
assert(uiSource.includes("bottom-nav-visual"), "Bottom nav visual layer eksik.");
assert(uiSource.includes("bottom_nav_exact_reference_embedded.svg"), "Onayli bottom nav SVG asset'i kullanilmiyor.");
assert(runtimeText.includes("createPhase2Screen"), "Component ekran renderer bağlantısı eksik.");
assert(runtimeText.includes("app-loading-shell"), "FAZ 7 loading/splash geri bildirimi eksik.");
assert(phase2ScreenSource.includes('data-splash-loading": "locked"'), "Splash loading kilidi eksik.");
assert(phase2ScreenSource.includes('data-splash-loading-bar": "locked"'), "Splash yatay loading bar kilidi eksik.");
assert(phase2ScreenSource.includes('data-splash-source": "splash-01-final"'), "Splash 01 final kaynak kilidi eksik.");
assert(phase2ScreenSource.includes("ototr-native-splash.png?v=splash-01-final-v1"), "Splash 01 final asset versiyonu eksik.");
assert(!runtimeText.includes(".splash-loading-spinner"), "Splash loading spinner kaldirilmis olmali.");
assert(runtimeText.includes("segmentedSemiGauge"), "FAZ 7 SegmentedSemiGauge componenti eksik.");
assert(runtimeText.includes("accordion-test-item"), "FAZ 7 test maddesi accordion componenti eksik.");
assert(runtimeText.includes("photoSlotGrid"), "FAZ 7 fotoğraf/kanıt slot render helper'ı eksik.");
assert(runtimeText.includes("inputGrid"), "FAZ 7 input/ölçüm alanı render helper'ı eksik.");
assert(runtimeText.includes("premium-module-card"), "FAZ 7 tıklanabilir modül kartı sınıfı eksik.");
assert(!runtimeText.includes("Modülü Aç"), "Büyük Modülü Aç butonu kaldırılmalı.");
assert(normalizedIncludes(normalizedRuntimeText, "İş Emrini Tamamla"), "İş Emrini Tamamla mantığı korunmuyor.");
assert(normalizedIncludes(normalizedRuntimeText, "Seçenek etiketi doğrulanacak"), "Label fallback metni korunmuyor.");
assert(
  runtimeText.includes("Foto" + "\u011f" + "raf ekleme bu fazda opsiyoneldir.")
    || normalizedIncludes(normalizedRuntimeText, "Fotoğraf ekleme bu fazda opsiyoneldir."),
  "Opsiyonel fotoğraf uyarısı eksik."
);
assert(runtimeText.includes("Bildirimler") && runtimeText.includes("Profil"), "Bildirimler sağ üst çan veya Profil component metni eksik.");
assert(normalizedIncludes(normalizedRuntimeText, "İşe Başla"), "Ana Sayfa Hızlı İşlemler içinde işe başlama aksiyonu korunmalı.");
assert(runtimeText.includes("home-ref-bell") || runtimeText.includes("notification-button"), "Bildirimler sağ üst çan olarak görünmeli.");
assert(runtimeText.includes("bottomNavRouteFor"), "Alt nav aktif route eşlemesi eksik.");
assert(runtimeText.includes("jobs-approved-screen"), "Onaylı İşlerim ekran kapsayıcı sınıfı eksik.");
assert(runtimeText.includes("jobs-approved-header"), "Onaylı İşlerim avatar baölçü? eksik.");
assert(runtimeText.includes("jobs-approved-kpis"), "Onaylı İşlerim KPI sınıfı eksik.");
assert(runtimeText.includes("jobs-approved-tabs"), "Onaylı İşlerim tek satır tab sınıfı eksik.");
assert(runtimeText.includes("jobs-approved-card"), "Onaylı İşlerim kart sınıfı eksik.");
assert(runtimeText.includes("jobs-approved-progress"), "Onaylı İşlerim ilerleme halkası eksik.");
assert(!phase2ScreenSource.includes("jobs-final-approved.png"), "İşlerim ekranı tam sayfa approved PNG olarak basılmamalı; gerçek component render kullanılmalı.");
assert(!phase2ScreenSource.includes("html: `<h3>${order.plaka}</h3><strong>${order.i?EmriNo}</strong>"), "İşlerim liste kartında iş emri numarası görünür durumda.");
assert((phase2ScreenSource.match(/jobs-approved-kpi/g) ?? []).length >= 1, "İşlerim KPI kartları onaylı helper ile üretilmeli.");
assert(!phase2ScreenSource.includes('"Tümü 12"'), "İşlerim tablarında eski sayılı etiketler kalmamalı.");

assert(
  phase2ScreenSource.includes('["Tümü", "Devam Eden", "Bekleyen", "Tamamlanan", "Eksik"]')
    || normalizedPhase2ScreenSource.includes('["Tümü", "Devam Eden", "Bekleyen", "Tamamlanan", "Eksik"]'),
  "İşlerim tablari referans tasarimdaki sade 5 secenekten olusmali."
);
assert(!/Devam Eden\s+\d|Bekleyen\s+\d|Tamamlanan\s+\d|Eksik\s+\d/.test(normalizedPhase2ScreenSource), "İşlerim tablarinda mukerrer sayac/rozet olmamali.");

const css = readFileSync(resolve(appRoot, "src/styles/components.css"), "utf8");
const bottomNavCss = [
  extractCssBlock(css, ".bottom-nav,\n.bottom-nav-shell"),
  extractCssBlock(css, ".nav-button,\n.bottom-nav-item"),
  extractCssBlock(css, ".bottom-nav-center-home .nav-icon")
].join("\n");
assert(bottomNavCss.includes("border-radius"), "Kapsul bottom nav radius tanimi eksik.");
assert(css.includes(".bottom-nav-approved-image"), "Onayli bottom nav asset CSS sinifi eksik.");
assert(!uiSource.includes('viewBox="0 0 390 114"'), "Bottom nav yeniden cizilen inline SVG ile uretilmemeli.");
assert(bottomNavCss.includes("width: min(calc(100% - 12px), calc(var(--mobile-max-width) - 12px))"), "Bottom nav app shell mobil genislik kilidine bagli olmali.");
assert(bottomNavCss.includes("grid-template-columns: 1fr 1fr 104px 1fr 1fr"), "Bottom nav 5 kolon olcu kilidi eksik.");
assert(runtimeText.includes("--bottom-nav-fab-size: 78px") && uiSource.includes("bottom_nav_exact_reference_embedded.svg"), "Ana Sayfa FAB onayli asset standardina bagli degil.");
assert(css.includes("env(safe-area-inset-bottom)") || css.includes("var(--runtime-safe-bottom)"), "Safe area bottom destegi eksik.");
const ctaBlocks = [extractCssBlock(css, ".primary-button"), bottomNavCss].join("\n");
for (const blueToken of ["#2563eb", "#1d5fd6"]) {
  if (ctaBlocks.includes(blueToken)) errors.push(`Mavi CTA/FAB izi bulundu: ${blueToken}`);
}

assert(Array.isArray(workOrders) && workOrders.length >= 4, `En az 4 mock iş emri bekleniyor, bulunan: ${workOrders.length}`);
for (const status of ["Bekliyor", "Devam Ediyor", "Eksik / Uyarı", "Tamamlanmaya Hazır"]) {
  assert(workOrders.some((order) => normalizedEquals(order.durum, status)), `Mock iş emri durumu eksik: ${status}`);
}

for (const order of workOrders) {
  for (const field of ["işEmriNo", "plaka", "marka", "model", "yıl", "paket", "bayi", "müşteriAdı", "durum", "öncelik", "atanmışUsta", "başlamaDurumu", "teknikOnayDurumu"]) {
    assert(hasOwnNormalizedKey(order, field), `Mock iş emri alanı eksik: ${field}`);
  }
}

assert(technicalApprovalFlow.technicianCanApprove === false, "Teknisyen rapor onaylayabilir görünüyor.");
assert(normalizedEquals(technicalApprovalFlow.technicianFinalAction, "İş Emrini Tamamla"), "Teknisyen final aksiyonu iş emrini tamamla olmalı.");

if (errors.length > 0) {
  console.error("FAZ 4 doğrulamas? başarısız:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Alt navigasyon dogrulamasi gecti: Gorevler / İşlerim / OtoTR / Eksikler / Profil ve kırmızı Home FAB standart.");
