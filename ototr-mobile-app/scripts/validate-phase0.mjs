import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const repoRoot = resolve(appRoot, "..");
const manifestPath = resolve(appRoot, "src/assets/design-reference/screens-manifest.json");
const errors = [];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`JSON okunamadi: ${path} (${error.message})`);
    return null;
  }
}

function readPngSize(path) {
  const buffer = readFileSync(path);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("PNG imzasi gecersiz");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

if (!existsSync(manifestPath)) {
  errors.push(`Manifest bulunamadi: ${manifestPath}`);
}

const manifest = existsSync(manifestPath) ? readJson(manifestPath) : null;
const screens = Array.isArray(manifest?.screens) ? manifest.screens : [];

if (manifest && !Array.isArray(manifest.screens)) {
  errors.push("Manifest icinde screens dizisi yok.");
}

if (screens.length !== 34) {
  errors.push(`Manifestte 34 kayit bekleniyor, bulunan: ${screens.length}`);
}

const expectedScreenNumbers = new Set(Array.from({ length: 34 }, (_, index) => index + 1));
const seenScreenNumbers = new Set();
const requiredFields = ["screenNo", "originalFileName", "originalPath", "normalizedPath", "width", "height"];

for (const screen of screens) {
  for (const field of requiredFields) {
    if (!(field in screen)) {
      errors.push(`Eksik manifest alani: ekran ${screen.screenNo ?? "bilinmiyor"} -> ${field}`);
    }
  }

  if (!Number.isInteger(screen.screenNo)) {
    errors.push(`screenNo sayi degil: ${JSON.stringify(screen.screenNo)}`);
    continue;
  }

  if (seenScreenNumbers.has(screen.screenNo)) {
    errors.push(`Tekrar eden ekran numarasi: ${screen.screenNo}`);
  }
  seenScreenNumbers.add(screen.screenNo);

  if (!expectedScreenNumbers.has(screen.screenNo)) {
    errors.push(`Beklenmeyen ekran numarasi: ${screen.screenNo}`);
  }

  const normalizedPath = resolve(repoRoot, screen.normalizedPath ?? "");
  if (!existsSync(normalizedPath)) {
    errors.push(`Normalize dosya bulunamadi: ekran ${screen.screenNo} -> ${screen.normalizedPath}`);
    continue;
  }

  try {
    const { width, height } = readPngSize(normalizedPath);
    if (width !== 853 || height !== 1844) {
      errors.push(`Yanlis normalize olcu: ekran ${screen.screenNo} -> ${width}x${height}`);
    }
  } catch (error) {
    errors.push(`Normalize PNG okunamadi: ekran ${screen.screenNo} -> ${error.message}`);
  }
}

for (const expected of expectedScreenNumbers) {
  if (!seenScreenNumbers.has(expected)) {
    errors.push(`Eksik ekran numarasi: ${expected}`);
  }
}

if (errors.length > 0) {
  console.error("FAZ 0 dogrulamasi basarisiz:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("FAZ 0 dogrulamasi gecti: 34 ekran, 34 normalize dosya, tum olculer 853x1844.");
