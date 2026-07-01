import {
  GLOBAL_STATUS_OPTIONS,
  OTOTR_EXPERTISE_TEST_MODULES,
  OTOTR_EXPERTISE_TEST_TOTALS
} from "./ototrExpertiseTestModules.js";
const normalizedBasePath = "./src/assets/design-reference/normalized";
const UNRESOLVED_OPTION_LABEL = "Seçenek etiketi doğrulanacak";

function resolveOptionLabel(option) {
  if (option?.label) return option.label;
  if (option?.needsLabelMap) return UNRESOLVED_OPTION_LABEL;
  return "Seçenek";
}

export const finalScreenRoutes = Object.freeze([
  { screenNo: 1, routeId: "splash", title: "Açılış", originalFileName: "01_splash.png", section: "Giriş" },
  { screenNo: 2, routeId: "login", title: "Giriş", originalFileName: "02_login.png", section: "Giriş" },
  { screenNo: 3, routeId: "branch", title: "Şube Seçimi", originalFileName: "03_branch_selection.png", section: "Giriş" },
  { screenNo: 4, routeId: "password", title: "Şifre Sıfırlama", originalFileName: "04_password_reset.png", section: "Giriş" },
  { screenNo: 5, routeId: "home", title: "Ana Sayfa", originalFileName: "05_dashboard.png", section: "Ana Akış" },
  { screenNo: 6, routeId: "jobs", title: "İşlerim", originalFileName: "06_work_orders.png", section: "Ana Akış" },
  { screenNo: 7, routeId: "detail", title: "İş Emri Detayı", originalFileName: "07_work_order_detail.png", section: "İş Emri" },
  { screenNo: 8, routeId: "start", title: "İşe Başlama Kanıtı", originalFileName: "08_start_proof.png", section: "İş Emri" },
  { screenNo: 9, routeId: "modules", title: "Modül Seçimi", originalFileName: "09_task_modules.png", section: "Modüller" },
  { screenNo: 10, routeId: "lock", title: "Başlık Kilitli Uyarısı", originalFileName: "10_module_lock.png", section: "Modüller" },
  { screenNo: 11, routeId: "taskTransfer", title: "Test Sahiplenme Bilgisi", originalFileName: "11_transfer_task.png", section: "Modüller" },
  { screenNo: 12, routeId: "permissionDenied", title: "Yetki Yok", originalFileName: "12_no_permission.png", section: "Yetki" },
  { screenNo: 13, routeId: "moduleControl", title: "Modül Kontrolü", originalFileName: "13_module_control.png", section: "Kontrol" },
  { screenNo: 14, routeId: "itemDetail", title: "Kontrol Maddesi Detayı", originalFileName: "14_item_detail.png", section: "Kontrol" },
  { screenNo: 15, routeId: "statusModal", title: "Durum Seçimi", originalFileName: "15_status_selection_modal.png", section: "Kontrol" },
  { screenNo: 16, routeId: "evidence", title: "Fotoğraf Merkezi", originalFileName: "16_photo_evidence_center.png", section: "Fotoğraf" },
  { screenNo: 17, routeId: "camera", title: "Kamera", originalFileName: "17_camera_capture.png", section: "Kanıt" },
  { screenNo: 18, routeId: "photoApproval", title: "Fotoğraf Onayı", originalFileName: "18_photo_approval.png", section: "Kanıt" },
  { screenNo: 19, routeId: "photoUploadError", title: "Fotoğraf Yükleme Hatası", originalFileName: "19_photo_upload_error.png", section: "Kanıt" },
  { screenNo: 20, routeId: "issues", title: "Eksik ve Uyarılar", originalFileName: "20_issues_alerts.png", section: "Eksikler" },
  { screenNo: 21, routeId: "blockingIssues", title: "Rapor Engelleyici Eksik", originalFileName: "21_blocking_issues.png", section: "Eksikler" },
  { screenNo: 22, routeId: "customerSummary", title: "Müşteri Özeti", originalFileName: "22_customer_summary.png", section: "Rapor" },
  { screenNo: 23, routeId: "finalReport", title: "Final Kontrol ve Rapor", originalFileName: "23_final_report.png", section: "Rapor" },
  { screenNo: 24, routeId: "approvalWaiting", title: "Teknik Onay Bekliyor", originalFileName: "24_approval_waiting.png", section: "Rapor" },
  { screenNo: 25, routeId: "completed", title: "İş Emri Tamamlandı", originalFileName: "25_work_order_completed.png", section: "Rapor" },
  { screenNo: 26, routeId: "returned", title: "Onaydan Döndü", originalFileName: "26_returned_for_correction.png", section: "Rapor" },
  { screenNo: 27, routeId: "notifications", title: "Bildirimler", originalFileName: "27_notifications.png", section: "Bildirim" },
  { screenNo: 28, routeId: "profile", title: "Profil ve Ayarlar", originalFileName: "28_profile_settings.png", section: "Profil" },
  { screenNo: 29, routeId: "permissions", title: "Yetkilerim ve Rol Detayı", originalFileName: "29_permissions_roles.png", section: "Profil" },
  { screenNo: 30, routeId: "offlineSync", title: "Offline ve Senkronizasyon", originalFileName: "30_offline_sync.png", section: "Senkronizasyon" },
  { screenNo: 31, routeId: "syncError", title: "Senkronizasyon Hatası", originalFileName: "31_sync_error.png", section: "Senkronizasyon" },
  { screenNo: 32, routeId: "emptyState", title: "İş Emri Bulunamadı", originalFileName: "32_empty_state.png", section: "Arama" },
  { screenNo: 33, routeId: "help", title: "Yardım Merkezi", originalFileName: "33_help_center.png", section: "Destek" },
  { screenNo: 34, routeId: "reports", title: "Rapor Geçmişi", originalFileName: "34_reports_history.png", section: "Rapor" }
].map((screen) =>
  Object.freeze({
    ...screen,
    imagePath: `${normalizedBasePath}/${screen.originalFileName}`,
    normalizedPath: `ototr-mobile-app/src/assets/design-reference/normalized/${screen.originalFileName}`
  })
));

export const referenceRouteOrder = Object.freeze([
  ...finalScreenRoutes.map((screen) => screen.routeId),
  "forgot-password",
  "reset-password",
  "job-detail",
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
  "tests",
  "missing",
  "summary",
  "customer-summary",
  "final-report",
  "approval-waiting",
  "offline-sync",
  "sync-error",
  "empty-state",
  "secretariat-work-order",
  "registration-capture",
  "registration-review",
  "work-order-created"
]);
export const referenceScreens = Object.freeze(
  Object.fromEntries(finalScreenRoutes.map((screen) => [screen.routeId, screen.imagePath]))
);
export const routeMetaById = Object.freeze(
  Object.fromEntries(
    finalScreenRoutes.map((screen) => [
      screen.routeId,
      Object.freeze({
        screenNo: screen.screenNo,
        title: screen.title,
        section: screen.section,
        originalFileName: screen.originalFileName,
        imagePath: screen.imagePath,
        normalizedPath: screen.normalizedPath
      })
    ])
  )
);

export const phase2ComponentRoutes = Object.freeze([
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
]);

export const navigationItems = Object.freeze([
  { id: "tasks", routeId: "tests", label: "Görevler", icon: "tasks" },
  { id: "jobs", routeId: "jobs", label: "İşlerim", icon: "clipboard" },
  { id: "home", routeId: "home", label: "OtoTR", icon: "home", elevated: true },
  { id: "issues", routeId: "missing", label: "Eksikler", icon: "warning", badge: "2" },
  { id: "profile", routeId: "profile", label: "Profil", icon: "user" }
]);

function createStartupSchemaItem(groupTitle, index) {
  return Object.freeze({
    itemNo: index + 1,
    itemId: `${groupTitle}-${index + 1}`.toLowerCase().replace(/\s+/g, "-"),
    title: index === 0 ? groupTitle : `${groupTitle} Kontrol ${index + 1}`,
    noktaId: index + 1,
    options: Object.freeze([
      Object.freeze({ optionType: "radio", value: "ok", label: "Sorunsuz" }),
      Object.freeze({ optionType: "radio", value: "warning", label: "Kontrol Gerekli" }),
      Object.freeze({ optionType: "checkbox", value: 999, needsLabelMap: true })
    ]),
    inputs: Object.freeze([
      Object.freeze({ inputType: "text", label: "Usta Notu", name: "note" })
    ]),
    hasDescription: true,
    photoSlots: index % 2 === 0 ? 1 : 0,
    uiHints: Object.freeze({})
  });
}

function createStartupSchemaGroup(title, count) {
  return Object.freeze({
    title,
    items: Object.freeze(Array.from({ length: count }, (_, index) => createStartupSchemaItem(title, index)))
  });
}

const schemaGroups = Object.freeze([
  createStartupSchemaGroup("İŞ EMRİ / ARAÇ KABUL FORMU", 18),
  createStartupSchemaGroup("ARAÇ DOSYA EKSPERTİZ RAPORU", 8),
  createStartupSchemaGroup("MOTOR EKSPERTİZ VE CHECK-UP", 10),
  createStartupSchemaGroup("ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP", 10),
  createStartupSchemaGroup("FREN / SÜSPANSİYON TESTİ", 8),
  createStartupSchemaGroup("KAPORTA - BOYA EKSPERTİZ VE CHECK-UP", 18),
  createStartupSchemaGroup("OBD/BEYİN TEST", 8),
  createStartupSchemaGroup("DYNO/ YOL TESTİ", 1),
  createStartupSchemaGroup("GENEL KONDİSYON / DIŞ EKSPERTİZ VE CHECK-UP", 8),
  createStartupSchemaGroup("İÇ EKSPERTİZ VE CHECK-UP", 8),
  createStartupSchemaGroup("Airbag (Hava Yastıkları) Kontrol Testi", 5),
  createStartupSchemaGroup("CONTA KAÇAK TESTİ", 4)
]);
const optionLabelMap = Object.freeze({ summary: Object.freeze({ startupFallback: true }) });
const schemaItems = Object.freeze(schemaGroups.flatMap((group) => group.items ?? []));
const schemaOptions = Object.freeze(schemaItems.flatMap((item) => item.options ?? []));
const schemaInputs = Object.freeze(schemaItems.flatMap((item) => item.inputs ?? []));

const groupLookup = new Map(schemaGroups.map((group) => [group.title, group]));

const hiddenOptionLabel = UNRESOLVED_OPTION_LABEL;
const optionPlaceholderState = "Etiket bekleniyor";

function toneFromStatus(status) {
  if (["Teknik Onaya Hazır", "Tamamlandı", "Aktif", "Yüklendi", "Hazır"].includes(status)) return "success";
  if (["Eksik / Uyarı", "Kilitli", "Eksik", "Hata Aldı", "Yok"].includes(status)) return "red";
  if (["Devam Ediyor", "Bekliyor", optionPlaceholderState, "Kısıtlı"].includes(status)) return "warning";
  return "neutral";
}

function normalizeOption(option) {
  const waitingLabel = option.label == null && option.needsLabelMap === true;
  return Object.freeze({
    optionType: option.optionType,
    value: option.value,
    label: option.label,
    displayLabel: waitingLabel ? resolveOptionLabel(option, optionLabelMap) : option.label,
    needsLabelMap: Boolean(option.needsLabelMap),
    disabled: waitingLabel,
    rawValueHidden: waitingLabel,
    sourceText: option.sourceText
  });
}

function normalizeInput(input) {
  return Object.freeze({
    inputType: input.inputType,
    label: input.label,
    name: input.name,
    sourceText: input.sourceText
  });
}

function normalizeItem(groupTitle, item) {
  const options = Object.freeze((item.options ?? []).map(normalizeOption));
  const inputs = Object.freeze((item.inputs ?? []).map(normalizeInput));
  return Object.freeze({
    itemNo: item.itemNo,
    itemId: item.itemId,
    groupTitle,
    title: item.title,
    noktaId: item.noktaId,
    options,
    inputs,
    hasDescription: Boolean(item.hasDescription),
    photoSlots: Number(item.photoSlots ?? 0),
    uiHints: Object.freeze({ ...(item.uiHints ?? {}) }),
    placeholderOptionCount: options.filter((option) => option.needsLabelMap).length,
    labeledOptionCount: options.filter((option) => option.label != null).length
  });
}

function createGroupModel(groupTitle) {
  const group = groupLookup.get(groupTitle);
  if (!group) {
    return Object.freeze({
      title: groupTitle,
      itemCount: 0,
      items: Object.freeze([]),
      labeledOptionCount: 0,
      needsLabelMapCount: 0,
      photoItemCount: 0,
      descriptionItemCount: 0
    });
  }

  const items = Object.freeze((group.items ?? []).map((item) => normalizeItem(group.title, item)));
  const labeledOptionCount = items.reduce((sum, item) => sum + item.labeledOptionCount, 0);
  const needsLabelMapCount = items.reduce((sum, item) => sum + item.placeholderOptionCount, 0);

  return Object.freeze({
    title: group.title,
    itemCount: items.length,
    items,
    labeledOptionCount,
    needsLabelMapCount,
    photoItemCount: items.filter((item) => item.photoSlots > 0).length,
    descriptionItemCount: items.filter((item) => item.hasDescription).length
  });
}

function mergeGroups(key, title, groupTitles) {
  const groups = groupTitles.map(createGroupModel);
  const items = Object.freeze(groups.flatMap((group) => group.items));
  return Object.freeze({
    key,
    title,
    groupTitles: Object.freeze(groupTitles),
    groups: Object.freeze(groups),
    items,
    itemCount: items.length,
    labeledOptionCount: groups.reduce((sum, group) => sum + group.labeledOptionCount, 0),
    needsLabelMapCount: groups.reduce((sum, group) => sum + group.needsLabelMapCount, 0),
    photoItemCount: groups.reduce((sum, group) => sum + group.photoItemCount, 0),
    descriptionItemCount: groups.reduce((sum, group) => sum + group.descriptionItemCount, 0)
  });
}

function trimModuleForm(baseForm, key, title, itemLimit, groupTitles = baseForm.groupTitles) {
  const items = Object.freeze((baseForm.items || []).slice(0, itemLimit));
  return Object.freeze({
    key,
    title,
    groupTitles: Object.freeze(groupTitles),
    groups: Object.freeze((baseForm.groups || []).filter((group) => groupTitles.includes(group.title))),
    items,
    itemCount: items.length,
    labeledOptionCount: items.reduce((sum, item) => sum + (item.labeledOptionCount || 0), 0),
    needsLabelMapCount: items.reduce((sum, item) => sum + (item.placeholderOptionCount || 0), 0),
    photoItemCount: items.filter((item) => item.photoSlots > 0).length,
    descriptionItemCount: items.filter((item) => item.hasDescription).length
  });
}

function findModuleItem(moduleForm, itemTitle) {
  return moduleForm.items.find((item) => item.title === itemTitle) ?? moduleForm.items[0] ?? null;
}

const acceptanceForm = mergeGroups("acceptance", "Araç Kabul", ["İŞ EMRİ / ARAÇ KABUL FORMU"]);
const fileControlForm = mergeGroups("fileControl", "Araç Dosya", ["ARAÇ DOSYA EKSPERTİZ RAPORU"]);
const testModuleForms = Object.freeze(Object.fromEntries(
  OTOTR_EXPERTISE_TEST_MODULES.map((module) => [module.moduleId, Object.freeze({
    ...module,
    key: module.moduleId,
    title: module.shortTitle,
    groupTitles: Object.freeze(module.groupTitles || [module.title]),
    groups: Object.freeze([]),
    items: Object.freeze(module.items.map((item) => Object.freeze({
      ...item,
      options: Object.freeze((item.options || []).map((option) => Object.freeze(option))),
      inputs: Object.freeze(item.inputs || []),
      photos: Object.freeze(item.photos || [null, null, null]),
      statusOptions: Object.freeze(item.statusOptions || GLOBAL_STATUS_OPTIONS)
    })))
  })])
));
const motorForm = testModuleForms.motor;
const mechanicForm = testModuleForms["alt-on-mekanik"];
const brakeSuspensionForm = testModuleForms["fren-suspansiyon"];
const kaportaForm = testModuleForms["kaporta-boya"];
const brainForm = testModuleForms["obd-beyin"];
const roadTestForm = testModuleForms["dyno-yol"];
const exteriorForm = testModuleForms["genel-kondisyon-dis"];
const interiorForm = testModuleForms["ic-ekspertiz"];
const interiorExteriorForm = Object.freeze({
  key: "interiorExterior",
  title: "İç / Dış Donanım",
  groupTitles: Object.freeze([exteriorForm.title, interiorForm.title]),
  groups: Object.freeze([]),
  items: Object.freeze([...exteriorForm.items, ...interiorForm.items]),
  itemCount: exteriorForm.itemCount + interiorForm.itemCount,
  labeledOptionCount: exteriorForm.labeledOptionCount + interiorForm.labeledOptionCount,
  needsLabelMapCount: 0,
  photoItemCount: exteriorForm.photoItemCount + interiorForm.photoItemCount,
  descriptionItemCount: exteriorForm.descriptionItemCount + interiorForm.descriptionItemCount
});
const airbagForm = testModuleForms.airbag;
const contaForm = testModuleForms["conta-kacak"];

export const expertiseModuleForms = Object.freeze({
  acceptance: acceptanceForm,
  fileControl: fileControlForm,
  ...testModuleForms,
  motor: motorForm,
  mechanic: mechanicForm,
  brakeSuspension: brakeSuspensionForm,
  kaporta: kaportaForm,
  electric: brainForm,
  brain: brainForm,
  roadTest: roadTestForm,
  exterior: exteriorForm,
  interior: interiorForm,
  interiorExterior: interiorExteriorForm,
  airbag: airbagForm,
  conta: contaForm
});

export const expertiseSchemaStats = Object.freeze({
  sourceFound: true,
  groupCount: 12,
  itemCount: 265,
  testModuleCount: OTOTR_EXPERTISE_TEST_TOTALS.moduleCount,
  testItemCount: OTOTR_EXPERTISE_TEST_TOTALS.itemCount,
  optionCount: 1774,
  inputCount: 308,
  optionInputCount: 2082,
  labeledOptionCount: 486,
  needsLabelMapCount: 1568
});

export const expertiseSchemaSummary = Object.freeze({
  schemaVersion: "startup-fallback",
  source: "startup fallback",
  generatedAt: null,
  validation: {},
  stats: expertiseSchemaStats,
  optionLabelMapSummary: optionLabelMap.summary ?? {}
});

export const technicianSession = Object.freeze({
  name: "Ahmet Usta",
  role: "Ekspertiz Teknisyeni",
  branches: ["Bursa Küçük Sanayi Şubesi", "OTOTR Ankara"],
  activeBranch: "Bursa Küçük Sanayi Şubesi",
  accountStatus: "Aktif",
  phone: "+90 532 123 45 67",
  appVersion: "1.0.0-debug",
  permissions: ["Kaporta", "Motor", "Mekanik", "Elektrik", "Rapor Gönderme"]
});

export const moduleCatalog = Object.freeze([
  { module: testModuleForms["kaporta-boya"], status: "Usta Üzerinde", tone: "red", owner: "Ahmet Usta" },
  { module: testModuleForms.motor, status: "Devam Ediyor", tone: "warning", owner: "Ahmet Usta" },
  { module: testModuleForms["alt-on-mekanik"], status: "Bekliyor", tone: "neutral", owner: "Atama Bekliyor" },
  { module: testModuleForms["fren-suspansiyon"], status: "Bekliyor", tone: "neutral", owner: "Atama Bekliyor" },
  { module: testModuleForms["obd-beyin"], status: "Devam Ediyor", tone: "warning", owner: "Ahmet Usta" },
  { module: testModuleForms["dyno-yol"], status: "Bekliyor", tone: "neutral", owner: "Atama Bekliyor" },
  { module: testModuleForms["genel-kondisyon-dis"], status: "Bekliyor", tone: "neutral", owner: "Atama Bekliyor" },
  { module: testModuleForms["ic-ekspertiz"], status: "Bekliyor", tone: "neutral", owner: "Atama Bekliyor" },
  { module: testModuleForms.airbag, status: "Tamamlandı", tone: "success", owner: "Ahmet Usta" },
  { module: testModuleForms["conta-kacak"], status: "Bekliyor", tone: "neutral", owner: "Atama Bekliyor" }
].map(({ module, status, tone, owner }) => Object.freeze({
  id: module.moduleId,
  formKey: module.moduleId,
  title: module.shortTitle,
  subtitle: module.title,
  status,
  tone,
  owner,
  proofRequired: false,
  itemCount: module.itemCount,
  routeId: "moduleControl"
})));

const bodyPanelTitles = [
  "Ön Kaput",
  "Tavan",
  "Sol Ön - Çamurluk",
  "Sağ Ön - Çamurluk",
  "Sol Ön - Kapı",
  "Sağ Ön Kapı",
  "Sol Arka - Kapı",
  "Sağ Arka - Kapı",
  "Sol Arka - Çamurluk",
  "Sağ Arka Çamurluk",
  "Arka Bagaj",
  "Ön Tampon"
];

const panelStatusPreset = new Map([
  ["Ön Kaput", "Orijinal"],
  ["Tavan", "Orijinal"],
  ["Sol Ön - Çamurluk", "Lokal Boyalı"],
  ["Sağ Ön - Çamurluk", "Kontrol Edilmedi"],
  ["Sol Ön - Kapı", "Boyalı"],
  ["Sağ Ön Kapı", "Orijinal"],
  ["Sol Arka - Kapı", "Değişen"],
  ["Sağ Arka - Kapı", "Orijinal"],
  ["Sol Arka - Çamurluk", "Hasarlı"],
  ["Sağ Arka Çamurluk", "Kontrol Edilmedi"],
  ["Arka Bagaj", "Orijinal"],
  ["Ön Tampon", "Hasarlı"]
]);

export const bodyPanels = Object.freeze(
  bodyPanelTitles.map((title) => {
    const item = findModuleItem(kaportaForm, title);
    const status = panelStatusPreset.get(title) ?? "Kontrol Edilmedi";
    return Object.freeze({
      title,
      status,
      tone: toneFromStatus(status),
      noktaId: item?.noktaId ?? null,
      photoSlots: item?.photoSlots ?? 0,
      hasDescription: item?.hasDescription ?? false,
      inputCount: item?.inputs.length ?? 0,
      options: item?.options ?? Object.freeze([])
    });
  })
);

function createEvidenceSlot(item, status, fileName) {
  return Object.freeze({
    title: item?.title ?? "Kanıt maddesi",
    noktaId: item?.noktaId ?? null,
    status,
    tone: toneFromStatus(status),
    type: item?.photoSlots ? "Fotoğraf / Kanıt" : "Kanıt",
    file: fileName,
    photoSlots: item?.photoSlots ?? 0,
    hasDescription: item?.hasDescription ?? false
  });
}

const acceptanceEvidenceItem = acceptanceForm.items.find((item) => item.photoSlots > 0) ?? acceptanceForm.items[0];
const engineEvidenceItem = findModuleItem(motorForm, "Motor Üst Bölge Yağ Sızdırmazlığı");
const kaportaEvidenceItem = findModuleItem(kaportaForm, "Ön Tampon");
const diagnosticEvidenceItem = brainForm.items.find((item) => item.photoSlots > 0) ?? brainForm.items[0];
const roadEvidenceItem = roadTestForm.items.find((item) => item.photoSlots > 0) ?? roadTestForm.items[0];

export const evidenceSlots = Object.freeze([
  createEvidenceSlot(kaportaEvidenceItem, "Yüklendi", "on-tampon-01.jpg"),
  createEvidenceSlot(engineEvidenceItem, "Eksik", "-"),
  createEvidenceSlot(diagnosticEvidenceItem, "Yüklendi", "obd-ekran-02.png"),
  createEvidenceSlot(roadEvidenceItem, "Hazır", "yol-testi-01.jpg"),
  createEvidenceSlot(acceptanceEvidenceItem, "Yüklendi", "ise-baslama-01.jpg")
]);

export const checklistItems = Object.freeze([
  { title: "Kaporta Panel Kontrolü", note: `${bodyPanels.length} panel hazır, fotoğraf ekleme bu fazda opsiyonel.`, status: "Tamamlandı", tone: "success" },
  { title: "Motor Formları", note: `${motorForm.itemCount} madde şemadan okunuyor. Antifriz ve akü gibi değer alanları görünür.`, status: "Devam Ediyor", tone: "warning" },
  { title: "Mekanik Kontroller", note: `${mechanicForm.itemCount} madde, fren ve süspansiyon alt modülü ile birlikte ilerler.`, status: "Bekliyor", tone: "neutral" },
  { title: "Elektrik / Beyin", note: `${brainForm.itemCount} OBD maddesi data-driven. Etiket eşlemesi olmayan kodlu seçenekler ham gösterilmez.`, status: "Devam Ediyor", tone: "warning" },
  { title: "İç / Dış Donanım ve Yol Testi", note: `${interiorExteriorForm.itemCount + roadTestForm.itemCount} madde kanıt ve açıklama desteğiyle izlenir.`, status: "Bekliyor", tone: "neutral" }
]);

export const issueAlerts = Object.freeze([
  Object.freeze({
    title: kaportaEvidenceItem?.title ?? "Kaporta bulgusu",
    detail: "Panel hasarı teyidi için yakın plan fotoğraf ve açıklama gerekli.",
    severity: "Kritik",
    tone: "red",
    module: "Kaporta",
    noktaId: kaportaEvidenceItem?.noktaId ?? null
  }),
  Object.freeze({
    title: engineEvidenceItem?.title ?? "Motor bulgusu",
    detail: "Yağ sızıntısı şüphesi açıklama ve fotoğrafla desteklenmeli.",
    severity: "Yüksek",
    tone: "warning",
    module: "Motor",
    noktaId: engineEvidenceItem?.noktaId ?? null
  }),
  Object.freeze({
    title: diagnosticEvidenceItem?.title ?? "OBD bulgusu",
    detail: "Tanı ekranı kanıtı olmadan modül tamamlanmış sayılmaz.",
    severity: "Orta",
    tone: "red",
    module: "Beyin Kontrolü",
    noktaId: diagnosticEvidenceItem?.noktaId ?? null
  })
]);

export const blockingIssues = Object.freeze([
  Object.freeze({
    title: "İşe başlama kanıtı eksik",
    detail: `${acceptanceEvidenceItem?.title ?? "Araç kabul"} maddesi tamamlanmadan modül işlemleri açılmaz.`,
    module: "Araç Kabul",
    tone: "red"
  }),
  Object.freeze({
    title: engineEvidenceItem?.title ?? "Motor açıklaması eksik",
    detail: "Kritik motor bulgularında açıklama alanı boş bırakılamaz.",
    module: "Motor",
    tone: "warning"
  }),
  Object.freeze({
    title: "Fotoğraf etiketi eksik seçenek var",
    detail: "Kodlu checkbox seçenekleri ham gösterilmiyor; etiket bekleyen seçimler teknik doğrulama ile işaretlenir.",
    module: "Beyin Kontrolü",
    tone: "red"
  })
]);

export const notificationsFeed = Object.freeze([
  { group: "Bugün", title: "Yeni iş emri atandı", detail: "IE-2025-000127 numaralı iş tarafınıza atandı.", time: "09:30", tone: "red" },
  { group: "Bugün", title: "İş emri hatırlatması", detail: "06 DEF 456 için tamamlanma hedefine 2 saat kaldı.", time: "08:15", tone: "warning" },
  { group: "Dün", title: "Senkronizasyon başarılı", detail: "Bekleyen veriler cihaza zarar vermeden eşitlendi.", time: "17:20", tone: "neutral" },
  { group: "Bu Hafta", title: "Düzeltme talebi geldi", detail: "IE-2025-000125 için müdür notu eklendi.", time: "10.05.2025", tone: "red" }
]);

export const permissionsMatrix = Object.freeze([
  { title: "Kaporta Yetkisi", status: "Aktif", tone: "success" },
  { title: "Motor Yetkisi", status: "Aktif", tone: "success" },
  { title: "Mekanik Yetkisi", status: "Aktif", tone: "success" },
  { title: "Elektrik / OBD Yetkisi", status: "Kısıtlı", tone: "warning" },
  { title: "Test Sürüşü Yetkisi", status: "Aktif", tone: "success" },
  { title: "Rapor Gönderme Yetkisi", status: "Aktif", tone: "success" },
  { title: "Rapor Onaylama Yetkisi", status: "Yok", tone: "red" }
]);

export const offlineQueue = Object.freeze([
  { title: "16 ABC 123 / Kaporta Modülü", status: "Bekliyor", tone: "warning", type: "İş Emri Kaydı" },
  { title: "34 DFG 456 / OBD Fotoğrafları", status: "İşleniyor", tone: "neutral", type: "Fotoğraf" },
  { title: "35 KLM 789 / Teknik Not", status: "Hata Aldı", tone: "red", type: "Not" },
  { title: "07 HJK 321 / Test Sürüşü Ölçümü", status: "Tamamlandı", tone: "success", type: "Ölçüm" }
]);

export const syncFailures = Object.freeze([
  { title: "Motor bölümü fotoğrafı", detail: "2.4 MB", type: "Fotoğraf" },
  { title: "OBD ekran görüntüsü", detail: "1.8 MB", type: "Kanıt" },
  { title: "Teknik not", detail: "Kaporta modülü", type: "Not" },
  { title: "Şasi etiketi fotoğrafı", detail: "1.2 MB", type: "Fotoğraf" }
]);

export const reportHistory = Object.freeze([
  { title: "IE-2025-000126", detail: "Tamamlandı ve rapor kilitlendi", date: "12.05.2025 14:28", tone: "success" },
  { title: "IE-2025-000125", detail: "Düzeltme sonrası tekrar tamamlandı", date: "11.05.2025 17:40", tone: "warning" },
  { title: "IE-2025-000121", detail: "Tamamlandı", date: "10.05.2025 16:05", tone: "neutral" }
]);

export const helpTopics = Object.freeze([
  { title: "Kanıt ekleme kuralları", detail: "Zorunlu fotoğraf ve belge tiplerini hızlıca gözden geçirin." },
  { title: "İş emri tamamlama şartları", detail: "Engelleyici eksikler çözülmeden iş emri tamamlanamaz." },
  { title: "Offline kullanım", detail: "Bağlantı yoksa kayıtlar cihazda korunur ve tekrar gönderilir." }
]);

export const transferCandidates = Object.freeze([
  { name: "Murat Usta", branch: "OTOTR Ankara", workload: "2 aktif modül" },
  { name: "Selim Usta", branch: "OTOTR Ankara", workload: "1 aktif modül" },
  { name: "Erdem Usta", branch: "Bursa Küçük Sanayi Şubesi", workload: "3 aktif modül" }
]);

export const technicalApprovalFlow = Object.freeze({
  technicianFinalAction: "İş Emrini Tamamla",
  technicianCanApprove: false,
  lockedAfterSubmission: true,
  unlockRule: "Tamamlanan iş emri rapor ekranında kilitlenir. Düzeltme süreci sonraki fazda açılacaktır.",
  blockingRule: "Engelleyici eksikler çözülmeden iş emri tamamlanamaz."
});

const activeModules = Object.freeze(moduleCatalog);

export const workOrders = Object.freeze([
  {
    "i\u015FEmriNo": "IE-2025-000123",
    plaka: "16 ABC 123",
    marka: "BMW",
    model: "3 Serisi",
    "y\u0131l": 2019,
    paket: "320i",
    bayi: "OTOTR Ankara",
    "m\u00FC\u015FteriAd\u0131": "Vadi Oto Servis",
    durum: "Devam Ediyor",
    durumTone: "warning",
    "\u00F6ncelik": "Normal",
    "atanm\u0131\u015FUsta": "Ahmet Usta",
    "ba\u015FlamaDurumu": "İşe başlama kanıtı tamamlandı",
    teknikOnayDurumu: "Devam ediyor",
    kilometre: "45.000 km",
    ilerleme: 65,
    "eksikSay\u0131s\u0131": 2,
    "kan\u0131tSay\u0131s\u0131": 18,
    birincilAksiyon: "Devam Et",
    moduller: activeModules
  },
  {
    "i\u015FEmriNo": "IE-2025-000124",
    plaka: "34 DFG 456",
    marka: "Volkswagen",
    model: "Passat",
    "y\u0131l": 2020,
    paket: "1.6 TDI",
    bayi: "OTOTR İstanbul Anadolu",
    "m\u00FC\u015FteriAd\u0131": "Doğuş Oto",
    durum: "Bekliyor",
    durumTone: "neutral",
    "\u00F6ncelik": "Yüksek",
    "atanm\u0131\u015FUsta": "Ahmet Usta",
    "ba\u015FlamaDurumu": "İşe başlama kanıtı bekliyor",
    teknikOnayDurumu: "Henüz hazır değil",
    kilometre: "68.500 km",
    ilerleme: 12,
    "eksikSay\u0131s\u0131": 0,
    "kan\u0131tSay\u0131s\u0131": 0,
    birincilAksiyon: "İşe Başla",
    moduller: activeModules
  },
  {
    "i\u015FEmriNo": "IE-2025-000125",
    plaka: "35 KLM 789",
    marka: "Renault",
    model: "Megane",
    "y\u0131l": 2018,
    paket: "1.5 dCi",
    bayi: "OTOTR İzmir",
    "m\u00FC\u015FteriAd\u0131": "Auto Master",
    durum: "Eksik / Uyarı",
    durumTone: "red",
    "\u00F6ncelik": "Yüksek",
    "atanm\u0131\u015FUsta": "Ahmet Usta",
    "ba\u015FlamaDurumu": "Tamamlandı",
    teknikOnayDurumu: "Engelleyici eksik var",
    kilometre: "72.300 km",
    ilerleme: 78,
    "eksikSay\u0131s\u0131": 3,
    "kan\u0131tSay\u0131s\u0131": 21,
    birincilAksiyon: "Durum Gir",
    moduller: activeModules
  },
  {
    "i\u015FEmriNo": "IE-2025-000126",
    plaka: "06 DEF 456",
    marka: "Opel",
    model: "Astra",
    "y\u0131l": 2021,
    paket: "Edition",
    bayi: "OTOTR Ankara",
    "m\u00FC\u015FteriAd\u0131": "Vadi Oto Servis",
    durum: "Tamamlanmaya Hazır",
    durumTone: "success",
    "\u00F6ncelik": "Normal",
    "atanm\u0131\u015FUsta": "Ahmet Usta",
    "ba\u015FlamaDurumu": "Tamamlandı",
    teknikOnayDurumu: "Tamamlanmaya hazır",
    kilometre: "45.230 km",
    ilerleme: 100,
    "eksikSay\u0131s\u0131": 0,
    "kan\u0131tSay\u0131s\u0131": 42,
    birincilAksiyon: "İş Emrini Tamamla",
    moduller: activeModules
  }
]);

export const highlightedWorkOrder = Object.freeze(workOrders[0]);

export const summaryStats = Object.freeze([
  { label: "Bugünkü İş", value: "4", tone: "red", icon: "clipboard" },
  { label: "Eksik / Uyarı", value: "3", tone: "red", icon: "warning" },
  { label: "Tamamlanmaya Hazır", value: "1", tone: "success", icon: "shield" },
  { label: "Devam Eden", value: "1", tone: "warning", icon: "clock" }
]);

export const dailyPlan = Object.freeze([
  { time: "10:00", type: "Randevu", plaka: "34 DFG 456", arac: "Volkswagen Passat", durum: "Bekliyor", tone: "neutral" },
  { time: "13:00", type: "Randevu", plaka: "35 KLM 789", arac: "Renault Megane", durum: "Eksik / Uyarı", tone: "red" },
  { time: "15:30", type: "Randevu", plaka: "06 DEF 456", arac: "Opel Astra", durum: "Tamamlanmaya Hazır", tone: "success" }
]);

export const quickActions = Object.freeze([
  { label: "İşe Başlama", icon: "scan", routeId: "start-proof" },
  { label: "Eksik / Uyarı", icon: "warning", routeId: "missing", badge: "3" },
  { label: "Durum Gir", icon: "camera", routeId: "tests" },
  { label: "Raporlar", icon: "report", routeId: "reports" }
]);

export const customerSummaryData = Object.freeze({
  customer: "Vadi Oto Servis",
  branch: "OTOTR Ankara",
  vehicle: "Opel Astra / 2021",
  photoCount: 42,
  internalNote: "Araçta ön tampon ve sağ far değişimi uygulanacak. Motor bölümündeki hafif yağ terlemesi fotoğraf ve teknik not ile işlendi.",
  criticalFindings: [
    "Sol arka kapı değişen",
    "Şasi etiketi kanıtı eksik",
    "Motor üst kapak terleme bulgusu"
  ],
  goodFindings: [
    "Airbag sistemi normal",
    "Yol testinde çekiş stabil",
    "Beyin kontrolünde hata kodu yok"
  ]
});

export const finalChecklist = Object.freeze([
  { title: "Dış Kontroller", detail: "Kaporta, far, cam ve dış yüzey kontrolleri yapıldı.", done: true },
  { title: "İç Kontroller", detail: "Koltuklar, döşeme ve iç trim kontrolleri yapıldı.", done: true },
  { title: "Fotoğraf Kontrolü", detail: "Tüm gerekli fotoğraflar çekildi ve eklendi.", done: true },
  { title: "Yapılan İşlemler", detail: "Uygulanan tüm işlemler eksiksiz kaydedildi.", done: true },
  { title: "Parça Kontrolü", detail: "Değişen parçalar ve malzemeler kontrol edildi.", done: true },
  { title: "Genel Kontrol", detail: "Araç genel durumu ve temizlik kontrolü yapıldı.", done: true }
]);

export const emptyStateCopy = Object.freeze({
  title: "İş emri bulunamadı",
  description: "Arama kriterlerine uygun bayi veya ERP kaynaklı iş emri bulunamadı.",
  primaryAction: "Filtreleri Temizle",
  secondaryAction: "Tüm İşlerimi Gör"
});

export const optionLabelFallback = hiddenOptionLabel;

export const technicalApprovalTerminology = Object.freeze({
  technicianFinalAction: "İş Emrini Tamamla",
  technicianCanApprove: false,
  completedStatusTitle: "İş Emri Tamamlandı",
  completedReportTitle: "Rapor Tamamlandı",
  technicianApprovalActionForbidden: true
});

export const fieldValidationHints = Object.freeze([
  Object.freeze({
    key: "batteryPercent",
    label: "Akü yüzde değeri",
    rule: "0-100 arası sayısal değer beklenir.",
    blocksWhenMissingEvidence: false
  }),
  Object.freeze({
    key: "antifreeze",
    label: "Antifriz değeri",
    rule: "Ölçüm değeri ve açıklama birlikte kontrol edilir.",
    blocksWhenMissingEvidence: false
  }),
  Object.freeze({
    key: "micron",
    label: "Mikron ölçümü",
    rule: "Kaporta paneli için sayısal mikron değeri beklenir.",
    blocksWhenMissingEvidence: true
  }),
  Object.freeze({
    key: "tireYear",
    label: "Lastik yılı",
    rule: "Dört haneli üretim yılı veya hafta/yıl formatı beklenir.",
    blocksWhenMissingEvidence: false
  }),
  Object.freeze({
    key: "tireDepth",
    label: "Lastik diş derinliği",
    rule: "Milimetre cinsinden sayısal değer beklenir.",
    blocksWhenMissingEvidence: false
  }),
  Object.freeze({
    key: "dateFields",
    label: "Tarih alanları",
    rule: "Tarih-saat alanları iş emri ve kanıt zamanı ile tutarlı olmalıdır.",
    blocksWhenMissingEvidence: false
  }),
  Object.freeze({
    key: "dynoPowerTorque",
    label: "Dyno güç/tork ölçümleri",
    rule: "Güç ve tork değerleri birlikte girilmelidir.",
    blocksWhenMissingEvidence: true
  }),
  Object.freeze({
    key: "obdOutputImage",
    label: "OBD test çıktısı görseli",
    rule: "OBD sonucu için ekran görüntüsü veya belge kanıtı beklenir.",
    blocksWhenMissingEvidence: true
  })
]);

export const customerSummarySections = Object.freeze([
  "Müşteri Özeti",
  "İç Teknik Not",
  "Kritik Bulgular",
  "İyi Durumlar",
  "Fotoğraf Sayısı",
  "Önizle / Düzenle"
]);

export const unresolvedSelectedOptions = Object.freeze([
  Object.freeze({
    module: "Kaporta",
    groupTitle: "KAPORTA - BOYA EKSPERTİZ VE CHECK-UP",
    itemTitle: "Sol Ön - Şasi",
    noktaId: "1",
    selectedValue: "12",
    selectedLabel: hiddenOptionLabel,
    warningLabel: "Doğrulama Bekleyen Seçenek",
    blocksTechnicalApproval: true
  }),
  Object.freeze({
    module: "Motor",
    groupTitle: "MOTOR EKSPERTİZ VE CHECK-UP",
    itemTitle: "Akü(%)",
    noktaId: "115",
    selectedValue: "115",
    selectedLabel: hiddenOptionLabel,
    warningLabel: "Doğrulama Bekleyen Seçenek",
    blocksTechnicalApproval: true
  })
]);

export const finalApprovalWarnings = Object.freeze([
  ...unresolvedSelectedOptions.map((item) =>
    Object.freeze({
      type: "unresolvedOptionLabel",
      title: item.warningLabel,
      module: item.module,
      detail: `Bu seçeneklerin açıklaması doğrulanmadığı için iş emri tamamlanamaz. Etiket bekleyen madde: ${item.itemTitle}.`,
      blocksTechnicalApproval: true
    })
  )
]);

export const finalApprovalGate = Object.freeze({
  phase4FreezePoint: "FAZ 4 COMPLETE / FREEZE POINT",
  fallbackLabel: hiddenOptionLabel,
  warningLabel: "Doğrulama Bekleyen Seçenek",
  blockingMessage: "Bu seçeneklerin açıklaması doğrulanmadığı için iş emri tamamlanamaz.",
  blockingRules: Object.freeze([
    "unresolvedOptionLabel",
    "requiredDescriptionEmpty"
  ]),
  hasBlockingItems: true,
  allowsDataEntry: true,
  allowsTechnicalApproval: false,
  allowsFinalReportGeneration: false,
  blockerCount: finalApprovalWarnings.length
});

export const finalReportPreviewData = Object.freeze({
  reportNo: "RPR-2025-000126",
  workOrderNo: highlightedWorkOrder.işEmriNo,
  qrHash: "OTOTR-RPR-2025-000126-DBG",
  revision: "Revizyon 0",
  coverTitle: "OTOTR Final Rapor Özeti",
  vehicleCard: {
    plate: highlightedWorkOrder.plaka,
    brandModel: `${highlightedWorkOrder.marka} ${highlightedWorkOrder.model}`,
    year: highlightedWorkOrder.yıl,
    package: highlightedWorkOrder.paket,
    branch: highlightedWorkOrder.bayi,
    customer: highlightedWorkOrder.müşteriAdı
  },
  completedModules: moduleCatalog.filter((module) => ["Tamamlandı", "Devam Ediyor", "Usta Üzerinde"].includes(module.status)),
  incompleteModules: moduleCatalog.filter((module) => ["Bekliyor", "Kilitli"].includes(module.status)),
  bodySummary: bodyPanels,
  moduleSummaries: Object.freeze([
    { title: "Motor / Mekanik / Elektrik", detail: `${expertiseModuleForms.motor.itemCount + expertiseModuleForms.mechanic.itemCount + expertiseModuleForms.electric.itemCount} madde`, tone: "warning" },
    { title: "Beyin / Airbag / Conta", detail: `${expertiseModuleForms.brain.itemCount + expertiseModuleForms.airbag.itemCount + expertiseModuleForms.conta.itemCount} madde`, tone: "success" },
    { title: "İç-Dış Donanım / Yol Testi", detail: `${expertiseModuleForms.interiorExterior.itemCount + expertiseModuleForms.roadTest.itemCount} madde`, tone: "neutral" }
  ]),
  evidenceCount: evidenceSlots.length,
  criticalWarnings: finalApprovalWarnings
});

export const technicalApprovalQueue = Object.freeze([
  Object.freeze({
    reportNo: "RPR-2025-000126",
    status: "Bekliyor",
    tone: "warning",
    technician: "Ahmet Usta",
    vehicle: "Opel Astra",
    plate: "06 DEF 456",
    package: "Edition",
    date: "12.05.2025 14:28",
    warningCount: 2
  }),
  Object.freeze({
    reportNo: "RPR-2025-000125",
    status: "Düzeltme İstendi",
    tone: "red",
    technician: "Ahmet Usta",
    vehicle: "Renault Megane",
    plate: "35 KLM 789",
    package: "1.5 dCi",
    date: "11.05.2025 17:40",
    warningCount: 3
  }),
  Object.freeze({
    reportNo: "RPR-2025-000121",
    status: "Tamamlandı",
    tone: "success",
    technician: "Ahmet Usta",
    vehicle: "BMW 3 Serisi",
    plate: "16 ABC 123",
    package: "320i",
    date: "10.05.2025 16:05",
    warningCount: 0
  })
]);

export const technicalApprovalDetail = Object.freeze({
  reportNo: "RPR-2025-000126",
  reviewer: "Şube Rapor Ekranı",
  status: "Kapanış kontrolünde",
  sections: Object.freeze([
    "Araç Kimliği",
    "Kaporta Boya Özeti",
    "Motor / Mekanik / Elektrik Özeti",
    "Beyin / Airbag / Conta Özeti",
    "İç-Dış Donanım ve Yol Testi",
    "Kanıt ve Fotoğraf Kontrolü"
  ]),
  unresolvedWarnings: unresolvedSelectedOptions,
  missingEvidence: Object.freeze([]),
  actions: Object.freeze(["Raporu Kilitle", "Eksikleri Gör", "Not Ekle"])
});

export const revisionRequestData = Object.freeze({
  reportNo: "RPR-2025-000125",
  reviewerNote: "Doğrulama bekleyen seçenekleri tamamlayıp kapanış kontrolüne dönün.",
  sectionsToRevise: Object.freeze(["Kaporta", "Motor", "Beyin Kontrolü"]),
  missingPhotos: Object.freeze([]),
  missingDescriptions: Object.freeze(["Motor üst bölge açıklaması"]),
  unresolvedWarnings: unresolvedSelectedOptions
});

export const approvalSentWaitingData = Object.freeze({
  reportNo: "RPR-2025-000126",
  status: "İş Emri Tamamlandı",
  estimatedReviewTime: "Kilitli rapor hazır",
  canWithdraw: false,
  canView: true
});

export const reportApprovedData = Object.freeze({
  reportNo: "RPR-2025-000121",
  statusTitle: "İş Emri Tamamlandı",
  completionLabel: "Rapor Tamamlandı",
  approvedAt: "10.05.2025 16:05",
  reviewer: "Şube Rapor Ekranı",
  shareActions: Object.freeze(["PDF Hazır", "Müşteriyle Paylaş", "WhatsApp Placeholder", "SMS Placeholder", "QR Paylaş"])
});

export const reportBlockedData = Object.freeze({
  title: "Rapor Gönderimi Bloklandı",
  blockers: finalApprovalWarnings,
  relatedActionRoute: "evidence"
});
