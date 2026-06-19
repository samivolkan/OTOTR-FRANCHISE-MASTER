import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const profile = (process.env.OTOTR_SHARED_SUPABASE_PROFILE || "local").toLowerCase();

const jobs = [
  {
    label: "mobil",
    script: resolve(rootDir, "ototr-mobile-app", "scripts", "write-supabase-runtime-config.mjs"),
    env: { OTOTR_MOBILE_SUPABASE_PROFILE: profile }
  },
  {
    label: "bayi-portali",
    script: resolve(rootDir, "apps", "admin", "prototype", "tools", "write-dealer-supabase-runtime-config.mjs"),
    env: { OTOTR_DEALER_SUPABASE_PROFILE: profile }
  }
];

for (const job of jobs) {
  const result = spawnSync(process.execPath, [job.script], {
    cwd: rootDir,
    stdio: "inherit",
    env: {
      ...process.env,
      ...job.env
    }
  });
  if (result.status !== 0) {
    throw new Error(`${job.label} runtime config olusturma basarisiz oldu.`);
  }
}

console.log(`OTOTR ortak Supabase runtime config yazildi: ${profile}`);
