import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const configPath = resolve(appRoot, "src", "config", "supabaseRuntimeConfig.js");
const templatePath = resolve(appRoot, "src", "config", "supabaseRuntimeConfig.template.js");

const profile = (process.env.OTOTR_MOBILE_SUPABASE_PROFILE || "local").toLowerCase();

function envFlag(name, fallback = false) {
  const value = process.env[name];
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

const defaults = {
  local: {
    profile: "local",
    url: "http://10.0.2.2:55321",
    publishableKey: "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH",
    evidenceBucket: "report-media",
    registerEvidenceMetadata: true,
    debugLoginEnabled: false,
    debugAutoLoginEnabled: false,
    debugRealAutoLoginEnabled: false,
    debugRealAutoLoginEmail: "",
    debugRealAutoLoginPassword: "",
    allowFakeSupabaseSession: false,
    debugAutoBranchId: ""
  },
  staging: {
    profile: "staging",
    url: process.env.OTOTR_MOBILE_SUPABASE_URL || "",
    publishableKey: process.env.OTOTR_MOBILE_SUPABASE_PUBLISHABLE_KEY || process.env.OTOTR_MOBILE_SUPABASE_ANON_KEY || "",
    evidenceBucket: process.env.OTOTR_MOBILE_EVIDENCE_BUCKET || "report-media",
    registerEvidenceMetadata: true,
    debugLoginEnabled: false,
    debugAutoLoginEnabled: false,
    debugRealAutoLoginEnabled: false,
    debugRealAutoLoginEmail: "",
    debugRealAutoLoginPassword: "",
    allowFakeSupabaseSession: false,
    debugAutoBranchId: ""
  },
  production: {
    profile: "production",
    url: process.env.OTOTR_MOBILE_SUPABASE_URL || "",
    publishableKey: process.env.OTOTR_MOBILE_SUPABASE_PUBLISHABLE_KEY || process.env.OTOTR_MOBILE_SUPABASE_ANON_KEY || "",
    evidenceBucket: process.env.OTOTR_MOBILE_EVIDENCE_BUCKET || "report-media",
    registerEvidenceMetadata: true,
    debugLoginEnabled: false,
    debugAutoLoginEnabled: false,
    debugRealAutoLoginEnabled: false,
    debugRealAutoLoginEmail: "",
    debugRealAutoLoginPassword: "",
    allowFakeSupabaseSession: false,
    debugAutoBranchId: ""
  }
};

if (!defaults[profile]) {
  throw new Error(`Bilinmeyen OTOTR_MOBILE_SUPABASE_PROFILE: ${profile}`);
}

const config = defaults[profile];

if (profile === "local") {
  config.debugLoginEnabled = envFlag("OTOTR_MOBILE_DEBUG_LOGIN_ENABLED", config.debugLoginEnabled);
  config.debugAutoLoginEnabled = envFlag("OTOTR_MOBILE_DEBUG_AUTO_LOGIN_ENABLED", config.debugAutoLoginEnabled);
  config.debugRealAutoLoginEnabled = envFlag("OTOTR_MOBILE_DEBUG_REAL_AUTO_LOGIN_ENABLED", config.debugRealAutoLoginEnabled);
  config.debugRealAutoLoginEmail = process.env.OTOTR_MOBILE_DEBUG_REAL_AUTO_LOGIN_EMAIL || "";
  config.debugRealAutoLoginPassword = process.env.OTOTR_MOBILE_DEBUG_REAL_AUTO_LOGIN_PASSWORD || "";
  config.allowFakeSupabaseSession = envFlag("OTOTR_MOBILE_ALLOW_FAKE_SUPABASE_SESSION", config.allowFakeSupabaseSession);
  config.debugAutoBranchId = process.env.OTOTR_MOBILE_DEBUG_AUTO_BRANCH_ID || config.debugAutoBranchId;
  config.debugStartupRoute = process.env.OTOTR_MOBILE_DEBUG_STARTUP_ROUTE || "";
  config.debugSelectedWorkOrderId = process.env.OTOTR_MOBILE_DEBUG_SELECTED_WORK_ORDER_ID || "";
}

if (profile !== "local" && (!config.url || !config.publishableKey)) {
  throw new Error(`${profile} build icin OTOTR_MOBILE_SUPABASE_URL ve OTOTR_MOBILE_SUPABASE_PUBLISHABLE_KEY gerekli.`);
}

const template = await readFile(templatePath, "utf8");
const output = template.replace("__OTOTR_SUPABASE_RUNTIME_CONFIG__", JSON.stringify(config, null, 2));

await writeFile(configPath, output, "utf8");

console.log(`Mobil Supabase runtime config yazildi: ${profile}`);
