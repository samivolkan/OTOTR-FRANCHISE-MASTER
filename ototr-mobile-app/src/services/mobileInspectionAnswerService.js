import { supabaseRequest } from "./supabaseHttpClient.js";

const runtimeConfigKey = "OTOTR_SUPABASE_CONFIG";

function getRuntimeConfig() {
  const runtimeConfig = globalThis[runtimeConfigKey] || {};
  const storage = globalThis.localStorage;
  return {
    url: runtimeConfig.url || storage?.getItem("ototrSupabaseUrl") || "",
    anonKey: runtimeConfig.anonKey || runtimeConfig.publishableKey || storage?.getItem("ototrSupabaseAnonKey") || "",
    accessToken: runtimeConfig.accessToken || storage?.getItem("ototrSupabaseAccessToken") || ""
  };
}

function normalizeSupabaseUrl(url = "") {
  return String(url).trim().replace(/\/+$/, "");
}

function normalizeItemKey(value = "") {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "_")
    .slice(0, 120);
}

function decodeJwtPayload(token = "") {
  const [, payload = ""] = String(token).split(".");
  if (!payload) return {};
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}

function mobileTaskKeyForModule(moduleKey = "") {
  switch (String(moduleKey || "").toLowerCase()) {
    case "kaporta":
    case "body":
    case "paint":
      return "BODY_PAINT_CHECKUP";
    case "motor":
    case "engine":
      return "MOTOR_CHECKUP";
    case "mechanic":
    case "mekanik":
      return "MECHANICAL_CHECKUP";
    case "brake":
    case "suspension":
      return "BRAKE_SUSPENSION_TEST";
    case "electric":
    case "elektrik":
    case "brain":
      return "OBD_ECU_TEST";
    case "interior":
      return "INTERIOR_CHECKUP";
    case "airbag":
      return "AIRBAG_CHECK";
    case "interiorexterior":
    case "exterior":
      return "EXTERIOR_CONDITION";
    case "roadtest":
    case "road_test":
      return "DYNO_ROAD_TEST";
    case "conta":
      return "HEAD_GASKET_LEAK_TEST";
    default:
      return "BODY_PAINT_CHECKUP";
  }
}

function mobileResultForOption(optionLabel = "", hasMissingEvidence = false) {
  const label = String(optionLabel || "").toLowerCase();
  if (hasMissingEvidence) return "RISKY";
  if ([
    "sorunsuz",
    "normal",
    "iyi",
    "çalışıyor",
    "calisiyor",
    "arıza kaydı yok",
    "ariza kaydi yok"
  ].some((word) => label.includes(word))) {
    return "NORMAL";
  }
  if ([
    "hasar",
    "arıza",
    "ariza",
    "değişen",
    "degisen",
    "işlemli",
    "islemli",
    "kaçak",
    "kacak",
    "sorun",
    "kötü",
    "kotu"
  ].some((word) => label.includes(word))) {
    return "RISKY";
  }
  if ([
    "kontrol edilmedi",
    "bakılamadı",
    "bakilamadi",
    "test yapılamadı",
    "test yapilamadi"
  ].some((word) => label.includes(word))) {
    return "NOT_DONE";
  }
  return "NORMAL";
}

async function restJson(url, { config, method = "GET", body, prefer = "" } = {}) {
  const response = await supabaseRequest(url, {
    method,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await response.text().catch(() => "");
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  return { response, parsed };
}

async function saveViaRestFallback({
  config,
  url,
  expertiseCaseId,
  moduleKey,
  itemKey,
  itemTitle,
  selectedOptionLabel,
  inputValues,
  description,
  readyPhotoCount,
  requiredPhotoCount
}) {
  const jwtPayload = decodeJwtPayload(config.accessToken);
  const authUserId = jwtPayload.sub || "";
  if (!authUserId) {
    return { ok: false, status: "auth-user-required", reason: "JWT kullanıcı bilgisi çözümlenemedi." };
  }

  const actorQuery = await restJson(
    `${url}/rest/v1/app_users?auth_user_id=eq.${encodeURIComponent(authUserId)}&is_active=eq.true&select=id,role&limit=1`,
    { config }
  );
  if (!actorQuery.response.ok || !Array.isArray(actorQuery.parsed) || !actorQuery.parsed[0]?.id) {
    return {
      ok: false,
      status: `actor-http-${actorQuery.response.status}`,
      reason: typeof actorQuery.parsed === "string" ? actorQuery.parsed : "Aktif uygulama kullanıcısı bulunamadı."
    };
  }

  const actor = actorQuery.parsed[0];
  const wantedTaskKey = mobileTaskKeyForModule(moduleKey);
  const taskQuery = await restJson(
    `${url}/rest/v1/inspection_tasks?expertise_case_id=eq.${encodeURIComponent(expertiseCaseId)}&task_key=eq.${encodeURIComponent(wantedTaskKey)}&select=id,task_key,report_field_key,status&order=created_at.asc&limit=1`,
    { config }
  );
  let task = Array.isArray(taskQuery.parsed) ? taskQuery.parsed[0] : null;
  if (!task?.id) {
    const fallbackTaskQuery = await restJson(
      `${url}/rest/v1/inspection_tasks?expertise_case_id=eq.${encodeURIComponent(expertiseCaseId)}&select=id,task_key,report_field_key,status&order=created_at.asc&limit=1`,
      { config }
    );
    task = Array.isArray(fallbackTaskQuery.parsed) ? fallbackTaskQuery.parsed[0] : null;
  }
  if (!task?.id) {
    return { ok: false, status: "task-required", reason: "Canlı iş emri için teknik görev bulunamadı." };
  }

  const normalizedItemKey = normalizeItemKey(itemKey || itemTitle || "item");
  const result = mobileResultForOption(
    selectedOptionLabel,
    Math.max(Number(requiredPhotoCount || 0), 0) > Math.max(Number(readyPhotoCount || 0), 0)
  );

  const payload = {
    expertise_case_id: expertiseCaseId,
    task_id: task.id,
    item_key: normalizedItemKey,
    title: itemTitle || itemKey || "Kontrol maddesi",
    result,
    note: JSON.stringify({
      moduleKey: String(moduleKey || "kaporta").toLowerCase(),
      selectedOptionLabel: selectedOptionLabel || "",
      inputValues: inputValues || {},
      description: description || "",
      readyPhotoCount: Math.max(Number(readyPhotoCount || 0), 0),
      requiredPhotoCount: Math.max(Number(requiredPhotoCount || 0), 0),
      savedFrom: "ototr-mobile-app-rest-fallback"
    }),
    not_done_reason: result === "NOT_DONE" ? (selectedOptionLabel || "Kontrol edilemedi") : "",
    report_field_key: `${task.report_field_key || task.task_key || "mobile"}.${normalizedItemKey}`,
    requires_evidence_on_risk: Math.max(Number(requiredPhotoCount || 0), 0) > 0,
    severity: result === "RISKY" ? 2 : result === "NOT_DONE" ? 1 : 0,
    measured_value: null,
    measured_unit: "",
    created_by: actor.id,
    updated_by: actor.id
  };

  const upsertResult = await restJson(
    `${url}/rest/v1/inspection_item_values?on_conflict=expertise_case_id,task_id,item_key&select=id,expertise_case_id,task_id,item_key,title,result,note,updated_at`,
    {
      config,
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: payload
    }
  );
  if (!upsertResult.response.ok || !Array.isArray(upsertResult.parsed) || !upsertResult.parsed[0]?.id) {
    return {
      ok: false,
      status: `fallback-http-${upsertResult.response.status}`,
      reason: typeof upsertResult.parsed === "string" ? upsertResult.parsed : "inspection_item_values upsert başarısız."
    };
  }

  const nextTaskStatus = result === "RISKY"
    ? "EVIDENCE_MISSING"
    : ["LOCKED", "ASSIGNED"].includes(String(task.status || "").toUpperCase())
      ? "OPEN"
      : task.status;
  await restJson(`${url}/rest/v1/inspection_tasks?id=eq.${encodeURIComponent(task.id)}`, {
    config,
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      status: nextTaskStatus,
      updated_at: new Date().toISOString()
    }
  }).catch(() => undefined);

  return {
    ok: true,
    status: "saved-fallback",
    answer: upsertResult.parsed[0]
  };
}

export async function saveMobileInspectionAnswer({
  expertiseCaseId,
  moduleKey,
  itemKey,
  itemTitle,
  selectedOptionLabel = "",
  inputValues = {},
  description = "",
  readyPhotoCount = 0,
  requiredPhotoCount = 0
} = {}) {
  const config = getRuntimeConfig();
  const url = normalizeSupabaseUrl(config.url);
  if (!expertiseCaseId) {
    return { ok: false, status: "case-id-required", reason: "Cevap kaydı için expertiseCaseId gerekli." };
  }
  if (!url || !config.anonKey || !config.accessToken) {
    return { ok: false, status: "not-configured", reason: "Cevap kaydı için Supabase oturumu gerekli." };
  }

  const response = await supabaseRequest(`${url}/rest/v1/rpc/save_mobile_inspection_item_value`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      target_case_id: expertiseCaseId,
      target_module_key: moduleKey || "kaporta",
      target_item_key: normalizeItemKey(itemKey || itemTitle || "item"),
      target_item_title: itemTitle || itemKey || "Kontrol maddesi",
      target_selected_option_label: selectedOptionLabel || "",
      target_input_values: inputValues || {},
      target_description_text: description || "",
      target_ready_photo_count: Number(readyPhotoCount || 0),
      target_required_photo_count: Number(requiredPhotoCount || 0)
    })
  });

  const text = await response.text().catch(() => "");
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const rpcMissing = response.status === 404 && typeof body === "object" && body?.code === "PGRST202";
    if (rpcMissing) {
      return saveViaRestFallback({
        config,
        url,
        expertiseCaseId,
        moduleKey,
        itemKey,
        itemTitle,
        selectedOptionLabel,
        inputValues,
        description,
        readyPhotoCount,
        requiredPhotoCount
      });
    }

    return {
      ok: false,
      status: `http-${response.status}`,
      reason: typeof body === "string" ? body : body?.message || `Mobil test cevabı kaydedilemedi: HTTP ${response.status}`
    };
  }

  return {
    ok: true,
    status: "saved",
    answer: Array.isArray(body) ? body[0] : body
  };
}
