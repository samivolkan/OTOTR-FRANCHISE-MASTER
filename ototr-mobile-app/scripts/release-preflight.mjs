import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const profile = (process.env.OTOTR_MOBILE_SUPABASE_PROFILE || "production").toLowerCase();
const scanRoots = [
  resolve(appRoot, "src"),
  resolve(appRoot, "www"),
  resolve(appRoot, "android", "app", "src", "main")
];

const textExtensions = new Set([
  ".js",
  ".mjs",
  ".json",
  ".html",
  ".css",
  ".xml",
  ".properties",
  ".gradle"
]);

const blockedPatterns = [
  { pattern: /10\.0\.2\.2/g, reason: "local emulator host" },
  { pattern: /localhost|127\.0\.0\.1/g, reason: "local host" },
  { pattern: /debugLoginEnabled\s*:\s*true/g, reason: "debug login enabled" },
  { pattern: /debugAutoLoginEnabled\s*:\s*true/g, reason: "debug auto login enabled" },
  { pattern: /debugRealAutoLoginEnabled\s*:\s*true/g, reason: "debug real auto login enabled" },
  { pattern: /allowFakeSupabaseSession\s*:\s*true/g, reason: "fake Supabase session enabled" },
  { pattern: /local\.technician|demo@|test@/gi, reason: "local or demo user" }
];

const requiredAndroidPatterns = [
  {
    file: resolve(appRoot, "android", "app", "src", "main", "AndroidManifest.xml"),
    pattern: /android:usesCleartextTraffic="\$\{usesCleartextTraffic\}"/,
    reason: "manifest cleartext placeholder"
  },
  {
    file: resolve(appRoot, "android", "app", "src", "main", "AndroidManifest.xml"),
    pattern: /android:allowBackup="\$\{allowBackup\}"/,
    reason: "manifest backup placeholder"
  },
  {
    file: resolve(appRoot, "android", "app", "build.gradle"),
    pattern: /manifestPlaceholders\s*=\s*\[/,
    reason: "build type manifest placeholders"
  }
];

async function listFiles(root) {
  const files = [];
  async function walk(dir) {
    let entries = [];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", ".gradle", "build"].includes(entry.name)) continue;
        await walk(fullPath);
      } else if (textExtensions.has(extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }
  await walk(root);
  return files;
}

const failures = [];

if (profile === "production") {
  for (const root of scanRoots) {
    for (const file of await listFiles(root)) {
      const content = await readFile(file, "utf8").catch(() => "");
      for (const check of blockedPatterns) {
        check.pattern.lastIndex = 0;
        if (check.pattern.test(content)) {
          failures.push(`${relative(appRoot, file)}: ${check.reason}`);
        }
      }
    }
  }
}

for (const check of requiredAndroidPatterns) {
  const exists = await stat(check.file).then(() => true).catch(() => false);
  const content = exists ? await readFile(check.file, "utf8") : "";
  if (!check.pattern.test(content)) {
    failures.push(`${relative(appRoot, check.file)}: ${check.reason} eksik`);
  }
}

if (failures.length) {
  console.error(`Release preflight failed (${profile}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Release preflight passed (${profile}).`);
