import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");

const targets = [
  resolve(appRoot, "android", "app", "capacitor.build.gradle"),
  resolve(appRoot, "node_modules", "@capacitor", "android", "capacitor", "build.gradle"),
  resolve(appRoot, "node_modules", "@capacitor", "camera", "android", "build.gradle")
];

for (const filePath of targets) {
  const source = await readFile(filePath, "utf8");
  const updated = source
    .replaceAll("JavaVersion.VERSION_21", "JavaVersion.VERSION_17")
    .replaceAll("sourceCompatibility 21", "sourceCompatibility 17")
    .replaceAll("targetCompatibility 21", "targetCompatibility 17")
    .replaceAll("jvmToolchain(21)", "jvmToolchain(17)");

  if (source === updated) {
    console.log(`Java surum patch gerekmiyor: ${filePath}`);
    continue;
  }

  await writeFile(filePath, updated, "utf8");
  console.log(`Java 17 patch uygulandi: ${filePath}`);
}

const systemBarsPath = resolve(
  appRoot,
  "node_modules",
  "@capacitor",
  "android",
  "capacitor",
  "src",
  "main",
  "java",
  "com",
  "getcapacitor",
  "plugin",
  "SystemBars.java"
);
const systemBarsSource = await readFile(systemBarsPath, "utf8");
const systemBarsUpdated = systemBarsSource.replace(
  `try {
                      document.documentElement.style.setProperty("--safe-area-inset-top", "%dpx");
                      document.documentElement.style.setProperty("--safe-area-inset-right", "%dpx");
                      document.documentElement.style.setProperty("--safe-area-inset-bottom", "%dpx");
                      document.documentElement.style.setProperty("--safe-area-inset-left", "%dpx");
                    } catch(e) { console.error('Error injecting safe area CSS:', e); }`,
  `try {
                      const root = document.documentElement;
                      if (root) {
                        root.style.setProperty("--safe-area-inset-top", "%dpx");
                        root.style.setProperty("--safe-area-inset-right", "%dpx");
                        root.style.setProperty("--safe-area-inset-bottom", "%dpx");
                        root.style.setProperty("--safe-area-inset-left", "%dpx");
                      }
                    } catch(e) { console.error('Error injecting safe area CSS:', e); }`
);

if (systemBarsSource === systemBarsUpdated) {
  console.log(`Safe area null guard patch gerekmiyor: ${systemBarsPath}`);
} else {
  await writeFile(systemBarsPath, systemBarsUpdated, "utf8");
  console.log(`Safe area null guard patch uygulandi: ${systemBarsPath}`);
}
