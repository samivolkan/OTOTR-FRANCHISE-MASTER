import {
  patchCachedLiveWorkOrderStatus,
  toMobileWorkOrderStatus
} from "./liveWorkOrdersService.js";
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

function resolveRemoteStatus(nextStatus = "") {
  const normalized = String(nextStatus || "").toLowerCase();
  if (normalized === "in_progress") return "TECHNICAL_ENTRY_OPEN";
  if (normalized === "technical_review") return "COMPLETED";
  if (normalized === "completed") return "COMPLETED";
  return String(nextStatus || "").toUpperCase();
}

export async function transitionLiveWorkOrderStatus({
  expertiseCaseId,
  nextStatus,
  reason = ""
} = {}) {
  const config = getRuntimeConfig();
  const url = normalizeSupabaseUrl(config.url);
  if (!expertiseCaseId) {
    return { ok: false, status: "case-id-required", reason: "Canlı durum güncellemesi için expertiseCaseId gerekli." };
  }
  if (!url || !config.anonKey || !config.accessToken) {
    return { ok: false, status: "not-configured", reason: "Canlı durum güncellemesi için Supabase oturumu gerekli." };
  }

  const remoteStatus = resolveRemoteStatus(nextStatus);
  const response = await supabaseRequest(`${url}/rest/v1/rpc/transition_mobile_work_order_status`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      target_case_id: expertiseCaseId,
      next_status: remoteStatus,
      transition_reason: reason
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
      remoteStatus,
      mobileStatus: toMobileWorkOrderStatus(remoteStatus),
      reason: typeof body === "string" ? body : body?.message || `Canlı durum güncellemesi başarısız: HTTP ${response.status}`
    };
  }

  const updatedCase = Array.isArray(body) ? body[0] : body;
  const finalRemoteStatus = updatedCase?.status || remoteStatus;
  patchCachedLiveWorkOrderStatus(expertiseCaseId, finalRemoteStatus);

  return {
    ok: true,
    status: "updated",
    remoteStatus: finalRemoteStatus,
    mobileStatus: toMobileWorkOrderStatus(finalRemoteStatus),
    case: updatedCase || null
  };
}
