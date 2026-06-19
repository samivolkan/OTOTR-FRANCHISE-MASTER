import { supabaseRequest } from "./supabaseHttpClient.js";
import { getInspectionTaskKeyForModule } from "./inspectionModuleTaskMapping.js";

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

async function getTaskRecord(config, expertiseCaseId, moduleKey) {
  const url = normalizeSupabaseUrl(config.url);
  const taskKey = getInspectionTaskKeyForModule(moduleKey);
  if (!taskKey) {
    return {
      ok: false,
      status: "unknown-module",
      reason: `Teknik gorev mapping bulunamadi: ${moduleKey || "-"}`
    };
  }
  const query = `${url}/rest/v1/inspection_tasks?expertise_case_id=eq.${encodeURIComponent(expertiseCaseId)}&task_key=eq.${encodeURIComponent(taskKey)}&select=id,task_key,title,status,owner_user_id,claimed_at&order=created_at.asc&limit=1`;
  const result = await restJson(query, { config });
  const task = Array.isArray(result.parsed) ? result.parsed[0] : null;
  if (result.response.ok && task?.id) {
    return { ok: true, status: "found", task };
  }
  return {
    ok: false,
    status: result.response.ok ? "task-not-found" : `http-${result.response.status}`,
    reason: typeof result.parsed === "string" ? result.parsed : "Teknik görev kaydı bulunamadı."
  };
}

async function callTaskRpc(rpcName, payload) {
  const config = getRuntimeConfig();
  const url = normalizeSupabaseUrl(config.url);
  if (!payload?.expertiseCaseId) {
    return { ok: false, status: "case-id-required", reason: "expertiseCaseId gerekli." };
  }
  if (!url || !config.anonKey || !config.accessToken) {
    return { ok: false, status: "not-configured", reason: "Supabase oturumu gerekli." };
  }

  const taskLookup = await getTaskRecord(config, payload.expertiseCaseId, payload.moduleKey);
  if (!taskLookup.ok) return taskLookup;

  const body = rpcName === "release_inspection_task"
    ? { target_task_id: taskLookup.task.id, release_reason: payload.releaseReason || "Usta testi bıraktı." }
    : { target_task_id: taskLookup.task.id };

  const result = await restJson(`${url}/rest/v1/rpc/${rpcName}`, {
    config,
    method: "POST",
    body
  });
  if (!result.response.ok) {
    return {
      ok: false,
      status: `http-${result.response.status}`,
      task: taskLookup.task,
      reason: typeof result.parsed === "string" ? result.parsed : result.parsed?.message || `${rpcName} başarısız.`
    };
  }

  return {
    ok: true,
    status: rpcName,
    task: Array.isArray(result.parsed) ? result.parsed[0] : result.parsed || taskLookup.task
  };
}

export function getModuleTaskKey(moduleKey) {
  return getInspectionTaskKeyForModule(moduleKey);
}

export async function claimInspectionTaskForModule({ expertiseCaseId, moduleKey } = {}) {
  return callTaskRpc("claim_inspection_task", { expertiseCaseId, moduleKey });
}

export async function releaseInspectionTaskForModule({
  expertiseCaseId,
  moduleKey,
  releaseReason = "Usta testi bıraktı."
} = {}) {
  return callTaskRpc("release_inspection_task", { expertiseCaseId, moduleKey, releaseReason });
}

export async function submitInspectionTaskForModule({ expertiseCaseId, moduleKey } = {}) {
  return callTaskRpc("submit_inspection_task", { expertiseCaseId, moduleKey });
}
