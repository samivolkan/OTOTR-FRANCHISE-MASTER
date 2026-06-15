import { shouldUseNativeHttp, supabaseRequest } from "./supabaseHttpClient.js";

const defaultEvidenceBucket = "ototr-evidence";

function getRuntimeConfig() {
  const runtimeConfig = globalThis.OTOTR_SUPABASE_CONFIG || {};
  const storage = globalThis.localStorage;
  return {
    url: runtimeConfig.url || storage?.getItem("ototrSupabaseUrl") || "",
    anonKey: runtimeConfig.anonKey || runtimeConfig.publishableKey || storage?.getItem("ototrSupabaseAnonKey") || "",
    accessToken: runtimeConfig.accessToken || storage?.getItem("ototrSupabaseAccessToken") || "",
    bucket: runtimeConfig.evidenceBucket || storage?.getItem("ototrEvidenceBucket") || defaultEvidenceBucket,
    registerMetadata: runtimeConfig.registerEvidenceMetadata !== false
  };
}

function normalizeSupabaseUrl(url = "") {
  return String(url).trim().replace(/\/+$/, "");
}

function sanitizePathPart(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "unknown";
}

function encodeObjectPath(path = "") {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function dataUrlToBlob(dataUrl = "") {
  const [header = "", base64 = ""] = String(dataUrl).split(",");
  if (!header.startsWith("data:") || !base64) {
    throw new Error("Kanıt görseli dataUrl formatında değil.");
  }
  const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

function dataUrlToUploadPayload(dataUrl = "") {
  const [header = "", base64 = ""] = String(dataUrl).split(",");
  if (!header.startsWith("data:") || !base64) {
    throw new Error("Kanıt görseli dataUrl formatında değil.");
  }
  const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  const normalizedBase64 = base64.replace(/\s+/g, "");
  const padding = (normalizedBase64.match(/=+$/) || [""])[0].length;
  return {
    base64: normalizedBase64,
    mimeType,
    sizeBytes: Math.max(0, Math.floor((normalizedBase64.length * 3) / 4) - padding)
  };
}

export function getEvidenceUploadConfigStatus() {
  const config = getRuntimeConfig();
  const url = normalizeSupabaseUrl(config.url);
  return {
    configured: Boolean(url && config.anonKey && config.bucket),
    authenticated: Boolean(config.accessToken),
    bucket: config.bucket,
    missing: [
      !url ? "SUPABASE_URL" : "",
      !config.anonKey ? "SUPABASE_ANON_KEY" : "",
      !config.bucket ? "EVIDENCE_BUCKET" : ""
    ].filter(Boolean)
  };
}

export function buildEvidenceObjectPath(item = {}) {
  const fileName = sanitizePathPart(item.fileName || `${item.id || Date.now()}.jpg`);
  return [
    "work-orders",
    sanitizePathPart(item.workOrderId || "work-order"),
    sanitizePathPart(item.moduleTitle || "module"),
    sanitizePathPart(item.slotTitle || "slot"),
    `${sanitizePathPart(item.id || Date.now())}-${fileName}`
  ].join("/");
}

export async function uploadEvidenceItem(item = {}) {
  const config = getRuntimeConfig();
  const url = normalizeSupabaseUrl(config.url);
  if (!url || !config.anonKey || !config.bucket) {
    return {
      ok: false,
      status: "not-configured",
      retriable: true,
      reason: "Supabase Storage ayarı yok. Kanıt cihaz kuyruğunda tutuluyor."
    };
  }

  if (!item.previewUrl) {
    return {
      ok: false,
      status: "missing-file",
      retriable: false,
      reason: "Yüklenecek kanıt görseli bulunamadı."
    };
  }

  const objectPath = buildEvidenceObjectPath(item);
  const uploadPayload = dataUrlToUploadPayload(item.previewUrl);
  const endpoint = `${url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodeObjectPath(objectPath)}`;
  const contentType = item.mimeType || uploadPayload.mimeType || "image/jpeg";
  const headers = {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.accessToken || config.anonKey}`,
    "Content-Type": contentType,
    "x-upsert": "false"
  };
  const response = shouldUseNativeHttp(endpoint)
    ? await supabaseRequest(endpoint, {
      method: "POST",
      headers,
      body: uploadPayload.base64,
      dataType: "file",
      responseType: "text"
    })
    : await fetch(endpoint, {
      method: "POST",
      headers,
      body: dataUrlToBlob(item.previewUrl)
    });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    return {
      ok: false,
      status: `http-${response.status}`,
      retriable: response.status >= 500 || response.status === 0,
      reason: errorText || `Supabase Storage upload hatası: HTTP ${response.status}`,
      storagePath: objectPath
    };
  }

  return {
    ok: true,
    status: "uploaded",
    bucket: config.bucket,
    storagePath: objectPath,
    uploadedAt: new Date().toISOString(),
    metadata: await registerEvidenceMetadata({
      item,
      config,
      url,
      objectPath,
      contentType,
      sizeBytes: item.sizeBytes || uploadPayload.sizeBytes
    })
  };
}

function isUuid(value = "") {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value));
}

async function registerEvidenceMetadata({ item, config, url, objectPath, contentType, sizeBytes }) {
  if (!config.registerMetadata) {
    return { ok: false, status: "metadata-disabled", reason: "Metadata kaydı runtime config ile kapalı." };
  }
  if (!config.accessToken) {
    return { ok: false, status: "auth-required", reason: "Metadata kaydı için Supabase kullanıcı oturumu gerekli." };
  }
  if (!isUuid(item.expertiseCaseId)) {
    return { ok: false, status: "case-id-required", reason: "Metadata kaydı için expertiseCaseId UUID gerekli." };
  }

  const response = await supabaseRequest(`${url}/rest/v1/rpc/register_inspection_evidence_upload`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      target_case_id: item.expertiseCaseId,
      target_task_id: isUuid(item.taskId) ? item.taskId : null,
      target_item_value_id: isUuid(item.itemValueId) ? item.itemValueId : null,
      evidence_field_key: item.fieldKey || item.slotTitle || "mobile_evidence",
      evidence_report_field_key: item.reportFieldKey || item.fieldKey || item.slotTitle || "mobile_evidence",
      evidence_title: item.slotTitle || item.title || "Mobil kanıt",
      evidence_type: item.evidenceType || "IMAGE",
      storage_bucket_name: config.bucket,
      storage_object_path: objectPath,
      content_type: contentType || "image/jpeg",
      size_bytes: Math.round(sizeBytes || 0),
      device_id: item.deviceId || null,
      metadata: {
        source: item.source || "mobile",
        moduleTitle: item.moduleTitle || "",
        plate: item.plate || "",
        localEvidenceId: item.id || "",
        fileName: item.fileName || ""
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    return {
      ok: false,
      status: `metadata-http-${response.status}`,
      reason: errorText || `Metadata RPC hatası: HTTP ${response.status}`
    };
  }

  const rows = await response.json().catch(() => null);
  return { ok: true, status: "registered", evidenceAsset: rows };
}

export async function syncEvidenceCaptures(captures = []) {
  const startedAt = new Date().toISOString();
  const results = [];
  const updated = [];

  for (const item of captures) {
    if (item.syncStatus === "uploaded") {
      updated.push(item);
      continue;
    }

    const result = await uploadEvidenceItem(item);
    results.push({ id: item.id, ...result });
    updated.push({
      ...item,
      status: result.ok ? "Yüklendi" : "Hata",
      syncStatus: result.ok ? "uploaded" : "failed",
      storageBucket: result.bucket || item.storageBucket,
      storagePath: result.storagePath || item.storagePath,
      metadataStatus: result.metadata?.status || item.metadataStatus,
      metadataError: result.metadata?.ok === false ? result.metadata.reason : "",
      remoteEvidenceAsset: result.metadata?.ok ? result.metadata.evidenceAsset : item.remoteEvidenceAsset,
      syncedAt: result.ok ? result.uploadedAt : item.syncedAt,
      lastUploadAttemptAt: startedAt,
      uploadError: result.ok ? (result.metadata?.ok === false ? result.metadata.reason : "") : result.reason,
      uploadMode: result.ok ? "supabase-storage" : "queued"
    });
  }

  return {
    updated,
    results,
    uploadedCount: results.filter((result) => result.ok).length,
    failedCount: results.filter((result) => !result.ok).length,
    attemptedCount: results.length
  };
}
