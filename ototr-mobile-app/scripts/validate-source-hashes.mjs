import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");
const repoRoot = resolve(appRoot, "..");
const hashSnapshotPath = resolve(repoRoot, "docs/codex/ototr-mobile-source-hashes.json");
const errors = [];

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`JSON okunamadi: ${path} (${error.message})`);
    return null;
  }
}

if (!existsSync(hashSnapshotPath)) {
  errors.push(`Kaynak hash snapshot bulunamadi: ${hashSnapshotPath}`);
}

const snapshot = existsSync(hashSnapshotPath) ? readJson(hashSnapshotPath) : null;
const files = Array.isArray(snapshot?.files) ? snapshot.files : [];

if (snapshot && !Array.isArray(snapshot.files)) {
  errors.push("Hash snapshot icinde files dizisi yok.");
}

if (files.length !== 34) {
  errors.push(`Hash snapshot icinde 34 kayit bekleniyor, bulunan: ${files.length}`);
}

for (const item of files) {
  const filePath = resolve(repoRoot, item.path ?? "");
  if (!existsSync(filePath)) {
    errors.push(`Kaynak dosya bulunamadi: ekran ${item.screenNo ?? "bilinmiyor"} -> ${item.path}`);
    continue;
  }

  const actualHash = sha256(filePath);
  if (actualHash !== item.sha256) {
    errors.push(`Hash farki: ekran ${item.screenNo} ${item.fileName} -> beklenen ${item.sha256}, mevcut ${actualHash}`);
  }

  const actualSize = readFileSync(filePath).byteLength;
  if (typeof item.sizeBytes === "number" && actualSize !== item.sizeBytes) {
    errors.push(`Boyut farki: ekran ${item.screenNo} ${item.fileName} -> beklenen ${item.sizeBytes}, mevcut ${actualSize}`);
  }
}

if (errors.length > 0) {
  console.error("Kaynak kilit kontrolu basarisiz:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Kaynak kilit kontrolu gecti: 34 orijinal gorsel degismemis.");
