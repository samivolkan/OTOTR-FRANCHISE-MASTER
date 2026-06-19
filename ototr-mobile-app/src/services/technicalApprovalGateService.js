import { supabaseRequest } from "./supabaseHttpClient.js";

const runtimeConfigKey = "OTOTR_SUPABASE_CONFIG";
const technicalGateStorageKey = "ototrTechnicalApprovalGate";

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

function readGateStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(technicalGateStorageKey) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeGateStore(nextStore) {
  localStorage.setItem(technicalGateStorageKey, JSON.stringify(nextStore));
  return nextStore;
}

export function getCachedTechnicalApprovalGate(expertiseCaseId) {
  if (!expertiseCaseId) return null;
  return readGateStore()[expertiseCaseId] || null;
}

export function clearCachedTechnicalApprovalGate(expertiseCaseId) {
  const store = readGateStore();
  if (expertiseCaseId) {
    delete store[expertiseCaseId];
  }
  writeGateStore(store);
}

export async function fetchTechnicalApprovalGate(expertiseCaseId) {
  const config = getRuntimeConfig();
  const url = normalizeSupabaseUrl(config.url);
  if (!expertiseCaseId) {
    return { ok: false, status: "case-id-required", reason: "Teknik onay kontrolü için expertiseCaseId gerekli." };
  }
  if (!url || !config.anonKey || !config.accessToken) {
    return { ok: false, status: "not-configured", reason: "Teknik onay kontrolü için Supabase oturumu gerekli." };
  }

  const response = await supabaseRequest(`${url}/rest/v1/rpc/get_mobile_technical_approval_gate`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ target_case_id: expertiseCaseId })
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
    return {
      ok: false,
      status: `http-${response.status}`,
      reason: typeof body === "string" ? body : body?.message || `Teknik onay kontrolü alınamadı: HTTP ${response.status}`
    };
  }

  const gate = {
    ...(body || {}),
    fetchedAt: new Date().toISOString()
  };
  writeGateStore({
    ...readGateStore(),
    [expertiseCaseId]: gate
  });
  return { ok: true, status: "synced", gate };
}
