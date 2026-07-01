import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

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

async function bundleCapacitorApp() {
  const entryPoint = resolve(appRoot, "src/app.js");
  const outputPath = resolve(webRoot, "app.bundle.js");
  ensureInsideApp(entryPoint);
  ensureInsideApp(outputPath);

  await build({
    entryPoints: [entryPoint],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["chrome120"],
    outfile: outputPath,
    sourcemap: false,
    minify: false
  });
}

async function rewriteCapacitorIndexHtml() {
  const indexPath = resolve(webRoot, "index.html");
  ensureInsideApp(indexPath);

  const original = await readFile(indexPath, "utf8");
  const updated = original.replace(
    '<script type="module" src="./src/app.js"></script>',
    '<script src="./app.bundle.js"></script>'
  );

  await writeFile(indexPath, updated, "utf8");
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

await bundleCapacitorApp();
await rewriteCapacitorIndexHtml();

console.log("Capacitor web staging hazirlandi: www");
