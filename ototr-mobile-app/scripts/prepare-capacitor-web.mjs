import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const webRoot = resolve(appRoot, "www");

const copyTargets = [
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  "src",
  "icons"
];

function ensureInsideApp(targetPath) {
  if (!targetPath.startsWith(appRoot)) {
    throw new Error(`Guvenli olmayan hedef yol: ${targetPath}`);
  }
}

async function recreateWebRoot() {
  ensureInsideApp(webRoot);
  await rm(webRoot, { recursive: true, force: true });
  await mkdir(webRoot, { recursive: true });
}

async function copyTarget(relativePath) {
  const sourcePath = resolve(appRoot, relativePath);
  const targetPath = resolve(webRoot, relativePath);

  ensureInsideApp(sourcePath);
  ensureInsideApp(targetPath);

  await cp(sourcePath, targetPath, {
    recursive: true,
    force: true,
    errorOnExist: false
  });
}

await recreateWebRoot();

for (const target of copyTargets) {
  await copyTarget(target);
}

const buildOnlyExclusions = [
  "src/assets/approved-group1",
  "src/assets/approved-group2/jobs-final-approved.png",
  "src/assets/approved-nav/bottom-nav-approved.png",
  "src/assets/home-approved/home_final_approved.png",
  "src/assets/home-approved/home_final_approved_spacing_optimized.png",
  "src/data/expertise/unknown-option-label-audit.json"
];

for (const relativePath of buildOnlyExclusions) {
  const targetPath = resolve(webRoot, relativePath);
  ensureInsideApp(targetPath);
  await rm(targetPath, { recursive: true, force: true });
}

console.log("Capacitor web staging hazirlandi: www");
