import { supabaseRequest } from "./supabaseHttpClient.js";

const runtimeConfigKey = "OTOTR_SUPABASE_CONFIG";

export function normalizeSupabaseUrl(url = "") {
  return String(url).trim().replace(/\/+$/, "");
}

export function getSupabaseRuntimeConfig() {
  const runtimeConfig = globalThis[runtimeConfigKey] || {};
  const storage = globalThis.localStorage;
  return {
    url: runtimeConfig.url || storage?.getItem("ototrSupabaseUrl") || "",
    anonKey: runtimeConfig.anonKey || runtimeConfig.publishableKey || storage?.getItem("ototrSupabaseAnonKey") || "",
    accessToken: runtimeConfig.accessToken || storage?.getItem("ototrSupabaseAccessToken") || "",
    refreshToken: runtimeConfig.refreshToken || storage?.getItem("ototrSupabaseRefreshToken") || "",
    email: runtimeConfig.email || storage?.getItem("ototrSupabaseUserEmail") || ""
  };
}

function decodeJwtPayload(token = "") {
  const [, payload = ""] = String(token).split(".");
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token = "", skewSeconds = 45) {
  const payload = decodeJwtPayload(token);
  const exp = Number(payload?.exp || 0);
  if (!exp) return false;
  return exp <= Math.floor(Date.now() / 1000) + skewSeconds;
}

function persistSupabaseSession(payload = {}, previousEmail = "") {
  const storage = globalThis.localStorage;
  const runtimeConfig = globalThis[runtimeConfigKey];
  const accessToken = payload.access_token || "";
  const refreshToken = payload.refresh_token || "";
  const email = payload.user?.email || previousEmail || "";

  if (accessToken) {
    storage?.setItem("ototrSupabaseAccessToken", accessToken);
    if (runtimeConfig && typeof runtimeConfig === "object") runtimeConfig.accessToken = accessToken;
  }
  if (refreshToken) {
    storage?.setItem("ototrSupabaseRefreshToken", refreshToken);
    if (runtimeConfig && typeof runtimeConfig === "object") runtimeConfig.refreshToken = refreshToken;
  }
  if (email) {
    storage?.setItem("ototrSupabaseUserEmail", email);
    if (runtimeConfig && typeof runtimeConfig === "object") runtimeConfig.email = email;
  }

  return {
    accessToken: accessToken || getSupabaseRuntimeConfig().accessToken,
    refreshToken: refreshToken || getSupabaseRuntimeConfig().refreshToken,
    email
  };
}

export async function refreshSupabaseAccessToken({ force = false } = {}) {
  const config = getSupabaseRuntimeConfig();
  const url = normalizeSupabaseUrl(config.url);
  if (!url || !config.anonKey) {
    return { ok: false, status: "not-configured", reason: "Supabase oturum ayari eksik." };
  }
  if (!config.refreshToken) {
    return { ok: false, status: "refresh-token-missing", reason: "Refresh token yok." };
  }
  if (!force && config.accessToken && !isAccessTokenExpired(config.accessToken)) {
    return { ok: true, status: "current", accessToken: config.accessToken };
  }

  const response = await supabaseRequest(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refresh_token: config.refreshToken })
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.access_token) {
    const reason = payload?.msg || payload?.error_description || payload?.message || `Oturum yenilenemedi: HTTP ${response.status}`;
    return { ok: false, status: `http-${response.status}`, reason };
  }

  const session = persistSupabaseSession(payload, config.email);
  return { ok: true, status: "refreshed", ...session };
}
