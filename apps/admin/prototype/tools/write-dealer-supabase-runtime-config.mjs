import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..", "bayi-portal");
const configPath = resolve(appRoot, "ototr-supabase-runtime-config.js");
const templatePath = resolve(appRoot, "ototr-supabase-runtime-config.template.js");

const profile = (process.env.OTOTR_DEALER_SUPABASE_PROFILE || "local").toLowerCase();

const defaults = {
  local: {
    profile: "local",
    url: "http://127.0.0.1:55321",
    publishableKey: "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH",
    key: "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH",
    evidenceBucket: "report-media",
    registerEvidenceMetadata: true
  },
  staging: {
    profile: "staging",
    url: process.env.OTOTR_DEALER_SUPABASE_URL || "",
    publishableKey: process.env.OTOTR_DEALER_SUPABASE_PUBLISHABLE_KEY || process.env.OTOTR_DEALER_SUPABASE_ANON_KEY || "",
    key: process.env.OTOTR_DEALER_SUPABASE_PUBLISHABLE_KEY || process.env.OTOTR_DEALER_SUPABASE_ANON_KEY || "",
    evidenceBucket: process.env.OTOTR_DEALER_EVIDENCE_BUCKET || "report-media",
    registerEvidenceMetadata: true
  },
  production: {
    profile: "production",
    url: process.env.OTOTR_DEALER_SUPABASE_URL || "",
    publishableKey: process.env.OTOTR_DEALER_SUPABASE_PUBLISHABLE_KEY || process.env.OTOTR_DEALER_SUPABASE_ANON_KEY || "",
    key: process.env.OTOTR_DEALER_SUPABASE_PUBLISHABLE_KEY || process.env.OTOTR_DEALER_SUPABASE_ANON_KEY || "",
    evidenceBucket: process.env.OTOTR_DEALER_EVIDENCE_BUCKET || "report-media",
    registerEvidenceMetadata: true
  }
};

if (!defaults[profile]) {
  throw new Error(`Bilinmeyen OTOTR_DEALER_SUPABASE_PROFILE: ${profile}`);
}

const config = defaults[profile];

if (profile !== "local" && (!config.url || !config.publishableKey)) {
  throw new Error(`${profile} build icin OTOTR_DEALER_SUPABASE_URL ve OTOTR_DEALER_SUPABASE_PUBLISHABLE_KEY gerekli.`);
}

const template = await readFile(templatePath, "utf8");
const output = template.replace("__OTOTR_SUPABASE_RUNTIME_CONFIG__", JSON.stringify(config, null, 2));

await writeFile(configPath, output, "utf8");

console.log(`Bayi portali Supabase runtime config yazildi: ${profile}`);
