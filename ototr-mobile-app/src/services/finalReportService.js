import { supabaseRequest } from "./supabaseHttpClient.js";

const runtimeConfigKey = "OTOTR_SUPABASE_CONFIG";
const finalReportStorageKey = "ototrFinalReportPayloads";

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

function readReportStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(finalReportStorageKey) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeReportStore(nextStore) {
  localStorage.setItem(finalReportStorageKey, JSON.stringify(nextStore));
  return nextStore;
}

export function getCachedFinalReport(expertiseCaseId) {
  if (!expertiseCaseId) return null;
  return readReportStore()[expertiseCaseId] || null;
}

export async function generateFinalReportPayload(expertiseCaseId, { lockReport = false } = {}) {
  const config = getRuntimeConfig();
  const url = normalizeSupabaseUrl(config.url);
  if (!expertiseCaseId) {
    return { ok: false, status: "case-id-required", reason: "Final rapor için expertiseCaseId gerekli." };
  }
  if (!url || !config.anonKey || !config.accessToken) {
    return { ok: false, status: "not-configured", reason: "Final rapor için Supabase oturumu gerekli." };
  }

  const response = await supabaseRequest(`${url}/rest/v1/rpc/generate_mobile_final_report`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      target_case_id: expertiseCaseId,
      lock_report: Boolean(lockReport)
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
    return {
      ok: false,
      status: `http-${response.status}`,
      reason: typeof body === "string" ? body : body?.message || `Final rapor üretilemedi: HTTP ${response.status}`
    };
  }

  const report = Array.isArray(body) ? body[0] : body;
  const next = {
    report,
    payload: report?.payload || {},
    status: report?.status || "",
    fetchedAt: new Date().toISOString()
  };
  writeReportStore({
    ...readReportStore(),
    [expertiseCaseId]: next
  });

  return { ok: true, status: "generated", finalReport: next };
}
